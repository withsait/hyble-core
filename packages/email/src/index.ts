import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

// Brand configurations
type Brand = "hyble" | "mineble";

const BRAND_CONFIG = {
  hyble: {
    name: "Hyble",
    color: "#f59e0b", // Amber
    fromEmail: "Hyble <noreply@hyble.co>",
    baseUrl: "https://id.hyble.co",
  },
  mineble: {
    name: "Mineble",
    color: "#10b981", // Emerald
    fromEmail: "Mineble <noreply@mineble.com>",
    baseUrl: "https://id.hyble.co", // Same auth hub
  },
};

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
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #0a0a0a;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a0a0a; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #111; border-radius: 12px; overflow: hidden;">
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center;">
              <h1 style="margin: 0; color: ${config.color}; font-size: 32px; font-weight: 700;">${config.name}</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 20px 40px 40px;">
              ${content}
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 20px 0;">
                    <a href="${buttonUrl}" style="display: inline-block; background-color: ${config.color}; color: #000; text-decoration: none; font-weight: 600; font-size: 16px; padding: 14px 32px; border-radius: 8px;">
                      ${buttonText}
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin: 24px 0 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                Butona tıklayamıyorsanız, aşağıdaki linki tarayıcınıza kopyalayın:
              </p>
              <p style="margin: 8px 0 0; color: ${config.color}; font-size: 14px; word-break: break-all;">
                ${buttonUrl}
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 20px 40px; background-color: #0a0a0a; border-top: 1px solid #222;">
              <p style="margin: 0; color: #6b7280; font-size: 12px; text-align: center;">
                Bu emaili siz talep etmediyseniz, güvenle görmezden gelebilirsiniz.
              </p>
              <p style="margin: 12px 0 0; color: #6b7280; font-size: 12px; text-align: center;">
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

export async function sendVerificationEmail(
  email: string,
  token: string,
  brand: Brand = "hyble"
) {
  const config = BRAND_CONFIG[brand];
  const verifyUrl = `${config.baseUrl}/api/auth/verify-email?token=${token}`;

  const content = `
    <h2 style="margin: 0 0 20px; color: #fff; font-size: 24px; font-weight: 600;">Email Adresinizi Doğrulayın</h2>
    <p style="margin: 0 0 24px; color: #9ca3af; font-size: 16px; line-height: 1.6;">
      ${config.name} hesabınızı oluşturduğunuz için teşekkürler! Email adresinizi doğrulamak için aşağıdaki butona tıklayın.
    </p>
    <p style="margin: 0; color: #6b7280; font-size: 14px;">
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

  const { data, error } = await resend.emails.send({
    from: config.fromEmail,
    to: email,
    subject: `Email Adresinizi Doğrulayın - ${config.name}`,
    html,
  });

  if (error) {
    console.error("Failed to send verification email:", error);
    throw new Error("Failed to send verification email");
  }

  return data;
}

export async function sendPasswordResetEmail(
  email: string,
  token: string,
  brand: Brand = "hyble"
) {
  const config = BRAND_CONFIG[brand];
  const resetUrl = `${config.baseUrl}/reset-password?token=${token}`;

  const content = `
    <h2 style="margin: 0 0 20px; color: #fff; font-size: 24px; font-weight: 600;">Şifrenizi Sıfırlayın</h2>
    <p style="margin: 0 0 24px; color: #9ca3af; font-size: 16px; line-height: 1.6;">
      Şifre sıfırlama talebinde bulundunuz. Yeni şifrenizi belirlemek için aşağıdaki butona tıklayın.
    </p>
    <p style="margin: 0; color: #6b7280; font-size: 14px;">
      Bu link 1 saat geçerlidir.
    </p>
  `;

  const html = getEmailTemplate(
    "Şifre Sıfırlama",
    content,
    "Şifremi Sıfırla",
    resetUrl,
    brand
  );

  const { data, error } = await resend.emails.send({
    from: config.fromEmail,
    to: email,
    subject: `Şifrenizi Sıfırlayın - ${config.name}`,
    html,
  });

  if (error) {
    console.error("Failed to send password reset email:", error);
    throw new Error("Failed to send password reset email");
  }

  return data;
}

export async function sendWelcomeEmail(
  email: string,
  name: string,
  brand: Brand = "hyble"
) {
  const config = BRAND_CONFIG[brand];
  const dashboardUrl = brand === "hyble"
    ? "https://panel.hyble.co"
    : "https://panel.mineble.com";

  const content = `
    <h2 style="margin: 0 0 20px; color: #fff; font-size: 24px; font-weight: 600;">Hoş Geldiniz, ${name}!</h2>
    <p style="margin: 0 0 24px; color: #9ca3af; font-size: 16px; line-height: 1.6;">
      ${config.name} ailesine katıldığınız için teşekkürler! Hesabınız başarıyla oluşturuldu.
    </p>
  `;

  const html = getEmailTemplate(
    "Hoş Geldiniz",
    content,
    "Panele Git",
    dashboardUrl,
    brand
  );

  const { data, error } = await resend.emails.send({
    from: config.fromEmail,
    to: email,
    subject: `Hoş Geldiniz! - ${config.name}`,
    html,
  });

  if (error) {
    console.error("Failed to send welcome email:", error);
    throw new Error("Failed to send welcome email");
  }

  return data;
}
