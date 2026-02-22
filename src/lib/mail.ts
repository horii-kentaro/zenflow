import nodemailer from "nodemailer";

function getTransporter() {
  // 開発環境: コンソールに出力（SMTPが未設定の場合）
  if (!process.env.SMTP_HOST) {
    return null;
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

const FROM_ADDRESS = process.env.MAIL_FROM || "noreply@zenflow.app";
const APP_NAME = "Zenflow";

interface SendMailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendMail({ to, subject, html }: SendMailOptions) {
  const transporter = getTransporter();

  if (!transporter) {
    // 開発環境: コンソールにメール内容を出力
    console.log("\n📧 ===== メール送信（開発モード） =====");
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Body:\n${html.replace(/<[^>]*>/g, "")}`);
    console.log("=====================================\n");
    return;
  }

  await transporter.sendMail({
    from: `${APP_NAME} <${FROM_ADDRESS}>`,
    to,
    subject,
    html,
  });
}

export async function sendVerificationEmail(email: string, token: string) {
  const baseUrl = process.env.AUTH_URL || "http://localhost:3000";
  const verifyUrl = `${baseUrl}/verify-email?token=${token}`;

  await sendMail({
    to: email,
    subject: `【${APP_NAME}】メールアドレスの確認`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1a1a1a;">${APP_NAME}へようこそ！</h2>
        <p>以下のリンクをクリックして、メールアドレスを確認してください。</p>
        <p style="margin: 24px 0;">
          <a href="${verifyUrl}"
             style="background-color: #6366f1; color: white; padding: 12px 24px;
                    border-radius: 8px; text-decoration: none; display: inline-block;">
            メールアドレスを確認する
          </a>
        </p>
        <p style="color: #666; font-size: 14px;">
          このリンクは24時間有効です。<br>
          心当たりのない場合は、このメールを無視してください。
        </p>
      </div>
    `,
  });
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const baseUrl = process.env.AUTH_URL || "http://localhost:3000";
  const resetUrl = `${baseUrl}/reset-password?token=${token}`;

  await sendMail({
    to: email,
    subject: `【${APP_NAME}】パスワードリセット`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1a1a1a;">パスワードリセット</h2>
        <p>パスワードリセットのリクエストを受け付けました。</p>
        <p>以下のリンクをクリックして、新しいパスワードを設定してください。</p>
        <p style="margin: 24px 0;">
          <a href="${resetUrl}"
             style="background-color: #6366f1; color: white; padding: 12px 24px;
                    border-radius: 8px; text-decoration: none; display: inline-block;">
            パスワードをリセットする
          </a>
        </p>
        <p style="color: #666; font-size: 14px;">
          このリンクは1時間有効です。<br>
          心当たりのない場合は、このメールを無視してください。パスワードは変更されません。
        </p>
      </div>
    `,
  });
}
