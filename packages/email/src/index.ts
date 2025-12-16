import { Resend } from "resend";

// Lazy initialization to avoid build-time errors
let resend: Resend | null = null;

function getResend() {
  if (!resend) {
    resend = new Resend(process.env.RESEND_API_KEY || "");
  }
  return resend;
}

// Brand configurations
type Brand = "hyble" | "mineble";

const BRAND_CONFIG = {
  hyble: {
    name: "Hyble",
    color: "#3B82F6", // Blue (primary brand color)
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

export async function sendVerificationEmail(
  email: string,
  token: string,
  brand: Brand = "hyble"
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

  const { data, error } = await getResend().emails.send({
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
    <h2 style="margin: 0 0 20px; color: #0F172A; font-size: 24px; font-weight: 600;">Şifrenizi Sıfırlayın</h2>
    <p style="margin: 0 0 24px; color: #475569; font-size: 16px; line-height: 1.6;">
      Şifre sıfırlama talebinde bulundunuz. Yeni şifrenizi belirlemek için aşağıdaki butona tıklayın.
    </p>
    <p style="margin: 0; color: #64748B; font-size: 14px;">
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

  const { data, error } = await getResend().emails.send({
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
    <h2 style="margin: 0 0 20px; color: #0F172A; font-size: 24px; font-weight: 600;">Hoş Geldiniz, ${name}!</h2>
    <p style="margin: 0 0 24px; color: #475569; font-size: 16px; line-height: 1.6;">
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

  const { data, error } = await getResend().emails.send({
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

export async function sendOrganizationInviteEmail(
  email: string,
  organizationName: string,
  inviterName: string,
  token: string,
  brand: Brand = "hyble"
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

  const { data, error } = await getResend().emails.send({
    from: config.fromEmail,
    to: email,
    subject: `${organizationName} Organizasyonuna Davet - ${config.name}`,
    html,
  });

  if (error) {
    console.error("Failed to send organization invite email:", error);
    throw new Error("Failed to send organization invite email");
  }

  return data;
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
  brand: Brand = "hyble"
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

  const { data, error } = await getResend().emails.send({
    from: config.fromEmail,
    to: email,
    subject: `⚠️ ${alert.title} - ${config.name}`,
    html,
  });

  if (error) {
    console.error("Failed to send security alert email:", error);
    throw new Error("Failed to send security alert email");
  }

  return data;
}

export async function sendBirthdayEmail(
  email: string,
  name: string,
  brand: Brand = "hyble"
) {
  const config = BRAND_CONFIG[brand];

  const content = `
    <div style="text-align: center;">
      <div style="font-size: 64px; margin-bottom: 16px;">🎂</div>
      <h2 style="margin: 0 0 20px; color: #0F172A; font-size: 28px; font-weight: 600;">
        Doğum Günün Kutlu Olsun, ${name}!
      </h2>
      <p style="margin: 0 0 24px; color: #475569; font-size: 16px; line-height: 1.6;">
        ${config.name} ailesi olarak bu özel günde sana en güzel dileklerimizi iletiyoruz!
        Mutlu, sağlıklı ve başarılı bir yıl diliyoruz.
      </p>
      <p style="margin: 0; color: ${config.color}; font-size: 18px; font-weight: 500;">
        🎉 Nice mutlu yıllara! 🎉
      </p>
    </div>
  `;

  const html = getEmailTemplate(
    "Doğum Günü Kutlaması",
    content,
    "Teşekkürler!",
    `${config.baseUrl}/dashboard`,
    brand
  );

  const { data, error } = await getResend().emails.send({
    from: config.fromEmail,
    to: email,
    subject: `🎂 Doğum Günün Kutlu Olsun, ${name}! - ${config.name}`,
    html,
  });

  if (error) {
    console.error("Failed to send birthday email:", error);
    throw new Error("Failed to send birthday email");
  }

  return data;
}

export async function sendAnniversaryEmail(
  email: string,
  name: string,
  years: number,
  brand: Brand = "hyble"
) {
  const config = BRAND_CONFIG[brand];
  const yearText = years === 1 ? "1 yıldır" : `${years} yıldır`;

  const content = `
    <div style="text-align: center;">
      <div style="font-size: 64px; margin-bottom: 16px;">🎊</div>
      <h2 style="margin: 0 0 20px; color: #0F172A; font-size: 28px; font-weight: 600;">
        ${yearText} Birlikteyiz, ${name}!
      </h2>
      <p style="margin: 0 0 24px; color: #475569; font-size: 16px; line-height: 1.6;">
        ${config.name} ailesinin bir parçası olduğunuz için teşekkür ederiz!
        Bu süre zarfında bize olan güveniniz için minnettarız.
      </p>
      <p style="margin: 0; color: ${config.color}; font-size: 18px; font-weight: 500;">
        ⭐ Birlikte daha nice yıllara! ⭐
      </p>
    </div>
  `;

  const html = getEmailTemplate(
    "Yıl Dönümü Kutlaması",
    content,
    "Dashboard'a Git",
    `${config.baseUrl}/dashboard`,
    brand
  );

  const { data, error } = await getResend().emails.send({
    from: config.fromEmail,
    to: email,
    subject: `🎊 ${yearText} Birlikteyiz! - ${config.name}`,
    html,
  });

  if (error) {
    console.error("Failed to send anniversary email:", error);
    throw new Error("Failed to send anniversary email");
  }

  return data;
}
