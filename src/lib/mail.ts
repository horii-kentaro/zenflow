import { Resend } from "resend";

let _resend: Resend | undefined;

function getResendClient(): Resend | null {
  if (_resend) return _resend;

  if (!process.env.RESEND_API_KEY) {
    return null;
  }

  _resend = new Resend(process.env.RESEND_API_KEY);
  return _resend;
}

const FROM_ADDRESS = process.env.MAIL_FROM || "Zenflow <onboarding@resend.dev>";
const APP_NAME = "Zenflow";

interface SendMailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendMail({ to, subject, html }: SendMailOptions) {
  const resend = getResendClient();

  if (!resend) {
    // 開発環境: コンソールにメール内容を出力
    console.log("\n📧 ===== メール送信（開発モード） =====");
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Body:\n${html.replace(/<[^>]*>/g, "")}`);
    console.log("=====================================\n");
    return;
  }

  const { error } = await resend.emails.send({
    from: FROM_ADDRESS,
    to,
    subject,
    html,
  });

  if (error) {
    console.error("Resend email error:", error);
    throw new Error(`メール送信に失敗しました: ${error.message}`);
  }
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

export async function sendSubscriptionConfirmationEmail(email: string, plan: string) {
  await sendMail({
    to: email,
    subject: `【${APP_NAME}】プレミアムプランへようこそ`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1a1a1a;">プレミアムプランへようこそ！ 🎉</h2>
        <p>${plan}プランへのご登録ありがとうございます。</p>
        <p>以下の機能がご利用いただけます：</p>
        <ul style="color: #333; line-height: 1.8;">
          <li>無制限のAIジャーナリング</li>
          <li>詳細な感情分析レポート</li>
          <li>パーソナライズドセルフケアルーティン</li>
          <li>過去データの完全アクセス</li>
        </ul>
        <p style="color: #666; font-size: 14px;">
          ご不明な点がございましたら、お気軽にお問い合わせください。
        </p>
      </div>
    `,
  });
}

export async function sendPaymentReceiptEmail(email: string, amount: number, date: string) {
  const formattedAmount = `¥${amount.toLocaleString()}`;

  await sendMail({
    to: email,
    subject: `【${APP_NAME}】お支払い完了のお知らせ`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1a1a1a;">お支払い完了</h2>
        <p>以下のお支払いが完了しました。</p>
        <table style="width: 100%; border-collapse: collapse; margin: 24px 0;">
          <tr style="border-bottom: 1px solid #eee;">
            <td style="padding: 8px 0; color: #666;">プラン</td>
            <td style="padding: 8px 0; text-align: right;">プレミアムプラン</td>
          </tr>
          <tr style="border-bottom: 1px solid #eee;">
            <td style="padding: 8px 0; color: #666;">金額</td>
            <td style="padding: 8px 0; text-align: right;">${formattedAmount}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #666;">日付</td>
            <td style="padding: 8px 0; text-align: right;">${date}</td>
          </tr>
        </table>
        <p style="color: #666; font-size: 14px;">
          請求に関するご質問は、設定ページの請求履歴からご確認いただけます。
        </p>
      </div>
    `,
  });
}

export async function sendSubscriptionCancellationEmail(email: string) {
  await sendMail({
    to: email,
    subject: `【${APP_NAME}】プレミアムプラン解約のお知らせ`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1a1a1a;">プレミアムプランの解約</h2>
        <p>プレミアムプランが解約されました。</p>
        <p>無料プランでも引き続き基本機能をご利用いただけます。</p>
        <p>いつでもプレミアムプランに再登録いただけます。</p>
        <p style="color: #666; font-size: 14px;">
          ご利用いただきありがとうございました。
        </p>
      </div>
    `,
  });
}
