import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { sendEmail } from "@/lib/email";
import { checkRateLimit } from "@/lib/redis";

// Contact form validation schema
const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Invalid email address"),
  subject: z.string().min(5, "Subject must be at least 5 characters").max(200),
  message: z.string().min(20, "Message must be at least 20 characters").max(5000),
  turnstileToken: z.string().optional(),
});

// Cloudflare Turnstile verification
async function verifyTurnstile(token: string | undefined): Promise<boolean> {
  if (!token) return true; // Skip if not provided (dev mode)
  if (!process.env.TURNSTILE_SECRET_KEY) return true;

  try {
    const response = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          secret: process.env.TURNSTILE_SECRET_KEY,
          response: token,
        }),
      }
    );
    const data = await response.json();
    return data.success === true;
  } catch {
    return false;
  }
}

// Get client IP from headers
function getClientIP(request: NextRequest): string | null {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    const firstIp = forwardedFor.split(",")[0];
    return firstIp ? firstIp.trim() : null;
  }
  return request.headers.get("x-real-ip") || null;
}

/**
 * Contact Form API
 *
 * POST /api/contact
 *
 * Receives contact form submissions and sends email to support team.
 * Includes rate limiting and Cloudflare Turnstile verification.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const result = contactSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: result.error.flatten().fieldErrors
        },
        { status: 400 }
      );
    }

    const { name, email, subject, message, turnstileToken } = result.data;

    // Rate limiting by IP (5 requests per hour)
    const ip = getClientIP(request);
    if (ip) {
      const rateLimit = await checkRateLimit(`contact:${ip}`, 5, 3600);
      if (!rateLimit.allowed) {
        return NextResponse.json(
          { error: "Too many requests. Please try again later." },
          { status: 429 }
        );
      }
    }

    // Rate limiting by email (3 requests per hour)
    const emailRateLimit = await checkRateLimit(`contact:${email}`, 3, 3600);
    if (!emailRateLimit.allowed) {
      return NextResponse.json(
        { error: "Too many requests from this email. Please try again later." },
        { status: 429 }
      );
    }

    // Verify Turnstile
    const turnstileValid = await verifyTurnstile(turnstileToken);
    if (!turnstileValid) {
      return NextResponse.json(
        { error: "Captcha verification failed" },
        { status: 400 }
      );
    }

    // Prepare email content for support team
    const supportEmailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Contact Form Submission</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #0a0a0a;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a0a0a; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #111; border-radius: 12px; overflow: hidden;">
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center;">
              <h1 style="margin: 0; color: #f59e0b; font-size: 24px; font-weight: 700;">New Contact Form Submission</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 20px 40px 40px;">
              <div style="margin-bottom: 20px; padding: 16px; background: #1a1a1a; border-radius: 8px;">
                <p style="margin: 0 0 8px; color: #6b7280; font-size: 12px; text-transform: uppercase;">From</p>
                <p style="margin: 0; color: #fff; font-size: 16px;">${name} &lt;${email}&gt;</p>
              </div>
              <div style="margin-bottom: 20px; padding: 16px; background: #1a1a1a; border-radius: 8px;">
                <p style="margin: 0 0 8px; color: #6b7280; font-size: 12px; text-transform: uppercase;">Subject</p>
                <p style="margin: 0; color: #fff; font-size: 16px;">${subject}</p>
              </div>
              <div style="padding: 16px; background: #1a1a1a; border-radius: 8px;">
                <p style="margin: 0 0 8px; color: #6b7280; font-size: 12px; text-transform: uppercase;">Message</p>
                <p style="margin: 0; color: #9ca3af; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">${message}</p>
              </div>
              <div style="margin-top: 20px; padding: 12px; background: #1a1a1a; border-radius: 8px; border-left: 3px solid #f59e0b;">
                <p style="margin: 0; color: #6b7280; font-size: 12px;">
                  <strong>IP:</strong> ${ip || "Unknown"}<br>
                  <strong>Time:</strong> ${new Date().toISOString()}
                </p>
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim();

    // Send email to support
    const supportEmail = process.env.SUPPORT_EMAIL || "support@hyble.co";

    const emailResult = await sendEmail({
      to: supportEmail,
      subject: `[Contact Form] ${subject}`,
      html: supportEmailHtml,
      type: "SYSTEM_ALERT",
      metadata: {
        contactName: name,
        contactEmail: email,
        ip,
        source: "contact_form",
      },
    });

    if (!emailResult.success) {
      console.error("Failed to send contact form email:", emailResult.error);
      return NextResponse.json(
        { error: "Failed to send message. Please try again later." },
        { status: 500 }
      );
    }

    // Send confirmation email to user
    const confirmationHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Message Received - Hyble</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #0a0a0a;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a0a0a; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #111; border-radius: 12px; overflow: hidden;">
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center;">
              <h1 style="margin: 0; color: #f59e0b; font-size: 32px; font-weight: 700;">Hyble</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 20px 40px 40px;">
              <h2 style="margin: 0 0 20px; color: #fff; font-size: 24px; font-weight: 600;">Mesajınız Alındı!</h2>
              <p style="margin: 0 0 24px; color: #9ca3af; font-size: 16px; line-height: 1.6;">
                Merhaba ${name},
              </p>
              <p style="margin: 0 0 24px; color: #9ca3af; font-size: 16px; line-height: 1.6;">
                İletişim formunu doldurduğunuz için teşekkür ederiz. Mesajınız ekibimize iletildi ve en kısa sürede size dönüş yapacağız.
              </p>
              <div style="margin: 20px 0; padding: 16px; background: #1a1a1a; border-radius: 8px;">
                <p style="margin: 0 0 8px; color: #6b7280; font-size: 12px; text-transform: uppercase;">Konu</p>
                <p style="margin: 0; color: #fff; font-size: 14px;">${subject}</p>
              </div>
              <p style="margin: 0; color: #6b7280; font-size: 14px;">
                Genellikle 24-48 saat içinde yanıt veriyoruz.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 20px 40px; background-color: #0a0a0a; border-top: 1px solid #222;">
              <p style="margin: 0; color: #6b7280; font-size: 12px; text-align: center;">
                © ${new Date().getFullYear()} Hyble. Tüm hakları saklıdır.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim();

    // Send confirmation (don't fail if this fails)
    try {
      await sendEmail({
        to: email,
        subject: "Mesajınız Alındı - Hyble",
        html: confirmationHtml,
        type: "SYSTEM_ALERT",
        metadata: {
          source: "contact_form_confirmation",
        },
      });
    } catch (err) {
      console.warn("Failed to send confirmation email:", err);
    }

    return NextResponse.json({
      success: true,
      message: "Your message has been sent successfully. We will get back to you soon.",
    });
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

// GET - Return API info
export async function GET() {
  return NextResponse.json({
    endpoint: "/api/contact",
    method: "POST",
    description: "Submit contact form",
    rateLimit: "5 requests per hour per IP, 3 per email",
  });
}
