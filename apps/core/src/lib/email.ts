import { Resend } from "resend";
import { prisma } from "@hyble/db";
import type { EmailType, EmailStatus } from "@hyble/db";
import { checkRateLimit } from "./redis";

// Lazy initialization to avoid build-time errors
let _resend: Resend | null = null;
function getResend() {
  if (!_resend) {
    _resend = new Resend(process.env.RESEND_API_KEY || "");
  }
  return _resend;
}

// Brand configurations
type Brand = "hyble" | "mineble";

const IS_DEVELOPMENT = process.env.NODE_ENV === "development";

// Dynamic base URL for development support
const getBaseUrl = () => {
  if (IS_DEVELOPMENT) {
    return process.env.NEXTAUTH_URL || "http://localhost:3000";
  }
  return "https://id.hyble.co";
};

const getDashboardUrl = (brand: Brand) => {
  if (IS_DEVELOPMENT) {
    return "http://localhost:3000/dashboard";
  }
  return brand === "mineble" ? "https://panel.mineble.com" : "https://panel.hyble.co";
};

const BRAND_CONFIG = {
  hyble: {
    name: "Hyble",
    color: "#3B82F6", // Blue (primary brand color)
    fromEmail: "Hyble <noreply@hyble.co>",
    get baseUrl() { return getBaseUrl(); },
    get dashboardUrl() { return getDashboardUrl("hyble"); },
  },
  mineble: {
    name: "Mineble",
    color: "#10b981", // Emerald
    fromEmail: "Mineble <noreply@mineble.com>",
    get baseUrl() { return getBaseUrl(); }, // Same auth hub
    get dashboardUrl() { return getDashboardUrl("mineble"); },
  },
};

// Rate limit settings per email type (emails per hour)
const EMAIL_RATE_LIMITS: Record<EmailType, { limit: number; windowSeconds: number }> = {
  VERIFICATION: { limit: 3, windowSeconds: 3600 }, // 3 per hour
  RESET_PASSWORD: { limit: 3, windowSeconds: 3600 }, // 3 per hour
  WELCOME: { limit: 1, windowSeconds: 86400 }, // 1 per day
  INVOICE: { limit: 10, windowSeconds: 3600 }, // 10 per hour
  TICKET_REPLY: { limit: 20, windowSeconds: 3600 }, // 20 per hour
  ORG_INVITE: { limit: 10, windowSeconds: 3600 }, // 10 per hour
  SECURITY_ALERT: { limit: 10, windowSeconds: 3600 }, // 10 per hour
  MARKETING: { limit: 1, windowSeconds: 86400 }, // 1 per day
  SYSTEM_ALERT: { limit: 5, windowSeconds: 3600 }, // 5 per hour
};

// ==================== EMAIL LOG WRAPPER ====================

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  type: EmailType;
  userId?: string;
  metadata?: Record<string, unknown>;
  brand?: Brand;
  skipRateLimit?: boolean; // For system-critical emails
}

interface EmailResult {
  success: boolean;
  emailLogId?: string;
  resendId?: string;
  error?: string;
  rateLimited?: boolean;
}

/**
 * Core email sending function with logging and rate limiting
 * - Checks rate limits per user/email
 * - Creates EmailLog record before sending
 * - Updates status based on result
 * - In development mode, logs to console instead of sending
 */
export async function sendEmail({
  to,
  subject,
  html,
  type,
  userId,
  metadata,
  brand = "hyble",
  skipRateLimit = false,
}: SendEmailParams): Promise<EmailResult> {
  const config = BRAND_CONFIG[brand];

  // Rate limiting check (unless skipped)
  if (!skipRateLimit) {
    const rateLimitConfig = EMAIL_RATE_LIMITS[type];
    const rateLimitKey = userId ? `email:${userId}:${type}` : `email:${to}:${type}`;

    const rateLimit = await checkRateLimit(
      rateLimitKey,
      rateLimitConfig.limit,
      rateLimitConfig.windowSeconds
    );

    if (!rateLimit.allowed) {
      console.warn(`[Email] Rate limited: ${to} for ${type}`);
      return {
        success: false,
        error: "Too many emails sent. Please try again later.",
        rateLimited: true,
      };
    }
  }

  // Create email log record (PENDING status)
  const emailLog = await prisma.emailLog.create({
    data: {
      userId,
      type,
      recipient: to,
      subject,
      status: "PENDING",
      metadata: metadata ? JSON.parse(JSON.stringify(metadata)) : undefined,
    },
  });

  // Development mode: log to console and mark as sent
  if (IS_DEVELOPMENT) {
    console.log("\n📧 ═══════════════════════════════════════════════════════");
    console.log(`📧 EMAIL (DEV MODE - NOT SENT)`);
    console.log(`📧 To: ${to}`);
    console.log(`📧 Subject: ${subject}`);
    console.log(`📧 Type: ${type}`);
    console.log(`📧 Brand: ${brand}`);
    console.log(`📧 Log ID: ${emailLog.id}`);
    console.log("📧 ═══════════════════════════════════════════════════════\n");

    // Update log to SENT (simulated)
    await prisma.emailLog.update({
      where: { id: emailLog.id },
      data: {
        status: "SENT",
        resendId: `dev_${emailLog.id}`,
      },
    });

    return {
      success: true,
      emailLogId: emailLog.id,
      resendId: `dev_${emailLog.id}`,
    };
  }

  // Production: send via Resend
  try {
    const { data, error } = await getResend().emails.send({
      from: config.fromEmail,
      to,
      subject,
      html,
    });

    if (error) {
      // Update log with error
      await prisma.emailLog.update({
        where: { id: emailLog.id },
        data: {
          status: "FAILED",
          error: error.message,
        },
      });

      console.error(`Failed to send email [${emailLog.id}]:`, error);
      return {
        success: false,
        emailLogId: emailLog.id,
        error: error.message,
      };
    }

    // Update log with success
    await prisma.emailLog.update({
      where: { id: emailLog.id },
      data: {
        status: "SENT",
        resendId: data?.id,
      },
    });

    return {
      success: true,
      emailLogId: emailLog.id,
      resendId: data?.id,
    };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";

    await prisma.emailLog.update({
      where: { id: emailLog.id },
      data: {
        status: "FAILED",
        error: errorMessage,
      },
    });

    console.error(`Failed to send email [${emailLog.id}]:`, err);
    return {
      success: false,
      emailLogId: emailLog.id,
      error: errorMessage,
    };
  }
}

// ==================== EMAIL TEMPLATES ====================

function getEmailTemplate(
  title: string,
  content: string,
  buttonText: string,
  buttonUrl: string,
  brand: Brand = "hyble"
) {
  const config = BRAND_CONFIG[brand];

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} - ${config.name}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #F8FAFC;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #F8FAFC; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #FFFFFF; border-radius: 12px; overflow: hidden; border: 1px solid #E2E8F0;">
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center;">
              <table cellpadding="0" cellspacing="0" style="margin: 0 auto;">
                <tr>
                  <td style="width: 40px; height: 40px; border-radius: 12px; background: linear-gradient(135deg, #60A5FA, #2563EB); text-align: center; vertical-align: middle;">
                    <span style="color: #FFFFFF; font-size: 20px; font-weight: bold; line-height: 40px;">H</span>
                  </td>
                  <td style="padding-left: 12px; vertical-align: middle;">
                    <span style="color: #0F172A; font-size: 24px; font-weight: 600;">${config.name}</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding: 20px 40px 40px;">
              ${content}
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 20px 0;">
                    <a href="${buttonUrl}" style="display: inline-block; background-color: ${config.color}; color: #FFFFFF; text-decoration: none; font-weight: 600; font-size: 16px; padding: 14px 32px; border-radius: 8px;">
                      ${buttonText}
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin: 24px 0 0; color: #64748B; font-size: 14px; line-height: 1.6;">
                Butona tıklayamıyorsanız, aşağıdaki linki tarayıcınıza kopyalayın:
              </p>
              <p style="margin: 8px 0 0; color: ${config.color}; font-size: 14px; word-break: break-all;">
                ${buttonUrl}
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 20px 40px; background-color: #F1F5F9; border-top: 1px solid #E2E8F0;">
              <p style="margin: 0; color: #64748B; font-size: 12px; text-align: center;">
                Bu emaili siz talep etmediyseniz, güvenle görmezden gelebilirsiniz.
              </p>
              <p style="margin: 12px 0 0; color: #94A3B8; font-size: 12px; text-align: center;">
                © ${new Date().getFullYear()} ${config.name}. Tüm hakları saklıdır.
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
}

// ==================== SPECIFIC EMAIL FUNCTIONS ====================

export async function sendVerificationEmail(
  email: string,
  token: string,
  brand: Brand = "hyble",
  userId?: string
) {
  const config = BRAND_CONFIG[brand];
  const verifyUrl = `${config.baseUrl}/api/auth/verify-email?token=${token}`;

  const content = `
    <h2 style="margin: 0 0 20px; color: #0F172A; font-size: 24px; font-weight: 600;">Email Adresinizi Doğrulayın</h2>
    <p style="margin: 0 0 24px; color: #475569; font-size: 16px; line-height: 1.6;">
      ${config.name} hesabınızı oluşturduğunuz için teşekkürler! Email adresinizi doğrulamak için aşağıdaki butona tıklayın.
    </p>
    <p style="margin: 0; color: #64748B; font-size: 14px;">
      Bu link 24 saat geçerlidir.
    </p>
  `;

  const html = getEmailTemplate(
    "Email Doğrulama",
    content,
    "Email Adresimi Doğrula",
    verifyUrl,
    brand
  );

  return sendEmail({
    to: email,
    subject: `Email Adresinizi Doğrulayın - ${config.name}`,
    html,
    type: "VERIFICATION",
    userId,
    metadata: { token, brand },
    brand,
  });
}

export async function sendPasswordResetEmail(
  email: string,
  token: string,
  brand: Brand = "hyble",
  userId?: string
) {
  const config = BRAND_CONFIG[brand];
  const resetUrl = `${config.baseUrl}/reset-password?token=${token}`;

  const content = `
    <h2 style="margin: 0 0 20px; color: #0F172A; font-size: 24px; font-weight: 600;">Şifrenizi Sıfırlayın</h2>
    <p style="margin: 0 0 24px; color: #475569; font-size: 16px; line-height: 1.6;">
      Şifre sıfırlama talebinde bulundunuz. Yeni şifrenizi belirlemek için aşağıdaki butona tıklayın.
    </p>
    <p style="margin: 0; color: #DC2626; font-size: 14px;">
      Bu link 15 dakika geçerlidir. Güvenliğiniz için başkalarıyla paylaşmayın.
    </p>
  `;

  const html = getEmailTemplate(
    "Şifre Sıfırlama",
    content,
    "Şifremi Sıfırla",
    resetUrl,
    brand
  );

  return sendEmail({
    to: email,
    subject: `Şifrenizi Sıfırlayın - ${config.name}`,
    html,
    type: "RESET_PASSWORD",
    userId,
    metadata: { brand },
    brand,
  });
}

export async function sendWelcomeEmail(
  email: string,
  name: string,
  brand: Brand = "hyble",
  userId?: string
) {
  const config = BRAND_CONFIG[brand];

  const content = `
    <h2 style="margin: 0 0 20px; color: #0F172A; font-size: 24px; font-weight: 600;">Hoş Geldiniz, ${name}!</h2>
    <p style="margin: 0 0 24px; color: #475569; font-size: 16px; line-height: 1.6;">
      ${config.name} ailesine katıldığınız için teşekkürler! Hesabınız başarıyla oluşturuldu ve doğrulandı.
    </p>
    <p style="margin: 0; color: #475569; font-size: 16px; line-height: 1.6;">
      Artık tüm özelliklerimize erişebilirsiniz.
    </p>
  `;

  const html = getEmailTemplate(
    "Hoş Geldiniz",
    content,
    "Panele Git",
    config.dashboardUrl,
    brand
  );

  return sendEmail({
    to: email,
    subject: `Hoş Geldiniz! - ${config.name}`,
    html,
    type: "WELCOME",
    userId,
    metadata: { name, brand },
    brand,
  });
}

export async function sendOrganizationInviteEmail(
  email: string,
  organizationName: string,
  inviterName: string,
  token: string,
  brand: Brand = "hyble",
  userId?: string
) {
  const config = BRAND_CONFIG[brand];
  const inviteUrl = `${config.baseUrl}/invites/${token}`;

  const content = `
    <h2 style="margin: 0 0 20px; color: #0F172A; font-size: 24px; font-weight: 600;">Organizasyona Davet</h2>
    <p style="margin: 0 0 24px; color: #475569; font-size: 16px; line-height: 1.6;">
      <strong style="color: #0F172A;">${inviterName}</strong> sizi <strong style="color: ${config.color};">${organizationName}</strong> organizasyonuna katılmaya davet etti.
    </p>
    <p style="margin: 0; color: #64748B; font-size: 14px;">
      Bu davet 7 gün geçerlidir.
    </p>
  `;

  const html = getEmailTemplate(
    "Organizasyon Daveti",
    content,
    "Daveti Kabul Et",
    inviteUrl,
    brand
  );

  return sendEmail({
    to: email,
    subject: `${organizationName} Organizasyonuna Davet - ${config.name}`,
    html,
    type: "ORG_INVITE",
    userId,
    metadata: { organizationName, inviterName, token, brand },
    brand,
  });
}

export async function sendSecurityAlertEmail(
  email: string,
  alertType: "new_login" | "password_changed" | "2fa_enabled" | "2fa_disabled" | "account_frozen",
  details: {
    device?: string;
    location?: string;
    ip?: string;
    time?: string;
  },
  brand: Brand = "hyble",
  userId?: string
) {
  const config = BRAND_CONFIG[brand];

  const alertMessages = {
    new_login: {
      title: "Yeni Giriş Tespit Edildi",
      message: "Hesabınıza yeni bir cihazdan giriş yapıldı.",
    },
    password_changed: {
      title: "Şifreniz Değiştirildi",
      message: "Hesabınızın şifresi başarıyla değiştirildi.",
    },
    "2fa_enabled": {
      title: "İki Faktörlü Doğrulama Aktif",
      message: "Hesabınızda iki faktörlü doğrulama etkinleştirildi.",
    },
    "2fa_disabled": {
      title: "İki Faktörlü Doğrulama Devre Dışı",
      message: "Hesabınızda iki faktörlü doğrulama devre dışı bırakıldı.",
    },
    account_frozen: {
      title: "Hesabınız Donduruldu",
      message: "Hesabınız güvenlik nedeniyle donduruldu.",
    },
  };

  const alert = alertMessages[alertType];
  const detailsHtml = Object.entries(details)
    .filter(([_, v]) => v)
    .map(([key, value]) => {
      const labels: Record<string, string> = {
        device: "Cihaz",
        location: "Konum",
        ip: "IP Adresi",
        time: "Zaman",
      };
      return `<p style="margin: 4px 0; color: #475569; font-size: 14px;"><strong>${labels[key] || key}:</strong> ${value}</p>`;
    })
    .join("");

  const content = `
    <h2 style="margin: 0 0 20px; color: #0F172A; font-size: 24px; font-weight: 600;">${alert.title}</h2>
    <p style="margin: 0 0 24px; color: #475569; font-size: 16px; line-height: 1.6;">
      ${alert.message}
    </p>
    ${detailsHtml ? `<div style="margin: 20px 0; padding: 16px; background: #F1F5F9; border-radius: 8px; border: 1px solid #E2E8F0;">${detailsHtml}</div>` : ""}
    <p style="margin: 0; color: #DC2626; font-size: 14px;">
      Bu işlemi siz yapmadıysanız, lütfen hemen şifrenizi değiştirin ve destek ekibimizle iletişime geçin.
    </p>
  `;

  const html = getEmailTemplate(
    alert.title,
    content,
    "Hesap Güvenliğini Kontrol Et",
    `${config.baseUrl}/security`,
    brand
  );

  return sendEmail({
    to: email,
    subject: `⚠️ ${alert.title} - ${config.name}`,
    html,
    type: "SECURITY_ALERT",
    userId,
    metadata: { alertType, details, brand },
    brand,
    skipRateLimit: true, // Security alerts bypass rate limiting
  });
}

export async function sendInvoiceEmail(
  email: string,
  invoiceData: {
    invoiceNumber: string;
    amount: string;
    currency: string;
    dueDate: string;
    items: Array<{ name: string; quantity: number; price: string }>;
    invoiceUrl: string;
  },
  brand: Brand = "hyble",
  userId?: string
) {
  const config = BRAND_CONFIG[brand];

  const itemsHtml = invoiceData.items
    .map(
      (item) => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #E2E8F0; color: #0F172A;">${item.name}</td>
        <td style="padding: 12px; border-bottom: 1px solid #E2E8F0; color: #64748B; text-align: center;">${item.quantity}</td>
        <td style="padding: 12px; border-bottom: 1px solid #E2E8F0; color: #0F172A; text-align: right;">${item.price}</td>
      </tr>
    `
    )
    .join("");

  const content = `
    <h2 style="margin: 0 0 20px; color: #0F172A; font-size: 24px; font-weight: 600;">Yeni Fatura</h2>
    <p style="margin: 0 0 24px; color: #475569; font-size: 16px; line-height: 1.6;">
      Fatura numarası <strong style="color: #0F172A;">#${invoiceData.invoiceNumber}</strong> oluşturulmuştur.
    </p>
    <div style="margin: 20px 0; padding: 16px; background: #F1F5F9; border-radius: 8px; border: 1px solid #E2E8F0;">
      <table width="100%" cellpadding="0" cellspacing="0" style="font-size: 14px;">
        <thead>
          <tr style="background: #E2E8F0;">
            <th style="padding: 12px; text-align: left; color: #0F172A;">Ürün/Hizmet</th>
            <th style="padding: 12px; text-align: center; color: #0F172A;">Adet</th>
            <th style="padding: 12px; text-align: right; color: #0F172A;">Fiyat</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
        <tfoot>
          <tr>
            <td colspan="2" style="padding: 12px; color: #0F172A; font-weight: 600;">Toplam</td>
            <td style="padding: 12px; color: ${config.color}; font-weight: 700; text-align: right; font-size: 18px;">${invoiceData.amount} ${invoiceData.currency}</td>
          </tr>
        </tfoot>
      </table>
    </div>
    <p style="margin: 0; color: #64748B; font-size: 14px;">
      Son ödeme tarihi: <strong style="color: #0F172A;">${invoiceData.dueDate}</strong>
    </p>
  `;

  const html = getEmailTemplate(
    "Fatura",
    content,
    "Faturayı Görüntüle",
    invoiceData.invoiceUrl,
    brand
  );

  return sendEmail({
    to: email,
    subject: `Fatura #${invoiceData.invoiceNumber} - ${config.name}`,
    html,
    type: "INVOICE",
    userId,
    metadata: { invoiceNumber: invoiceData.invoiceNumber, amount: invoiceData.amount, brand },
    brand,
  });
}

export async function sendTicketReplyEmail(
  email: string,
  ticketData: {
    ticketId: string;
    ticketSubject: string;
    replyContent: string;
    replierName: string;
    ticketUrl: string;
  },
  brand: Brand = "hyble",
  userId?: string
) {
  const config = BRAND_CONFIG[brand];

  const content = `
    <h2 style="margin: 0 0 20px; color: #0F172A; font-size: 24px; font-weight: 600;">Destek Talebinize Yanıt</h2>
    <p style="margin: 0 0 16px; color: #475569; font-size: 16px; line-height: 1.6;">
      <strong style="color: #0F172A;">${ticketData.replierName}</strong> destek talebinize yanıt verdi.
    </p>
    <div style="margin: 20px 0; padding: 16px; background: #F1F5F9; border-radius: 8px; border-left: 4px solid ${config.color};">
      <p style="margin: 0 0 8px; color: #64748B; font-size: 12px;">Talep: #${ticketData.ticketId} - ${ticketData.ticketSubject}</p>
      <p style="margin: 0; color: #0F172A; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">${ticketData.replyContent}</p>
    </div>
  `;

  const html = getEmailTemplate(
    "Destek Yanıtı",
    content,
    "Talebi Görüntüle",
    ticketData.ticketUrl,
    brand
  );

  return sendEmail({
    to: email,
    subject: `Re: [#${ticketData.ticketId}] ${ticketData.ticketSubject} - ${config.name}`,
    html,
    type: "TICKET_REPLY",
    userId,
    metadata: { ticketId: ticketData.ticketId, brand },
    brand,
  });
}

// ==================== WEBHOOK HELPERS ====================

/**
 * Update email log status from webhook
 */
export async function updateEmailLogFromWebhook(
  resendId: string,
  status: EmailStatus,
  additionalData?: {
    openedAt?: Date;
    clickedAt?: Date;
    deliveredAt?: Date;
    bouncedAt?: Date;
    complainedAt?: Date;
    error?: string;
  }
) {
  try {
    await prisma.emailLog.updateMany({
      where: { resendId },
      data: {
        status,
        ...additionalData,
      },
    });
    return true;
  } catch (error) {
    console.error(`Failed to update email log for ${resendId}:`, error);
    return false;
  }
}
