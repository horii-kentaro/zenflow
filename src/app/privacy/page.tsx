import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "プライバシーポリシー - Zenflow",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <Link href="/" className="text-sm text-primary-600 hover:underline">
          &larr; トップページに戻る
        </Link>
        <h1 className="text-2xl font-bold text-neutral-900 mt-6 mb-8">プライバシーポリシー</h1>

        <div className="prose prose-neutral max-w-none space-y-6 text-sm text-neutral-700 leading-relaxed">
          <p>最終更新日: 2026年2月22日</p>

          <p>
            Zenflow（以下「当サービス」）は、ユーザーのプライバシーを尊重し、
            個人情報の保護に努めます。本プライバシーポリシーは、当サービスにおける
            個人情報の取扱いについて説明するものです。
          </p>

          <h2 className="text-lg font-semibold text-neutral-900 mt-8">1. 収集する情報</h2>
          <p>当サービスでは、以下の情報を収集します。</p>
          <ul className="list-disc pl-6 space-y-1">
            <li><strong>アカウント情報</strong>: お名前、メールアドレス、パスワード（ハッシュ化して保存）</li>
            <li><strong>気分記録データ</strong>: 気分スコア（1〜5）、メモ、記録日</li>
            <li><strong>ジャーナルデータ</strong>: AIとの対話内容、感情分析結果</li>
            <li><strong>セルフケア履歴</strong>: 実施したルーティンの種類、所要時間</li>
            <li><strong>ストリーク情報</strong>: 連続利用日数</li>
            <li><strong>決済情報</strong>: Stripe経由で処理（カード情報は当サービスに保存されません）</li>
          </ul>

          <h2 className="text-lg font-semibold text-neutral-900 mt-8">2. 情報の利用目的</h2>
          <p>収集した情報は、以下の目的で利用します。</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>サービスの提供・運営・改善</li>
            <li>AIによるパーソナライズされたアドバイスの生成</li>
            <li>気分のトレンド分析・インサイトの提供</li>
            <li>アカウント管理・認証</li>
            <li>サブスクリプションの管理・請求処理</li>
            <li>サービスに関するお知らせの送信</li>
          </ul>

          <h2 className="text-lg font-semibold text-neutral-900 mt-8">3. AIデータの利用について</h2>
          <p>
            当サービスでは、Anthropic社のClaude APIを使用してAI機能を提供しています。
            お客様のジャーナルデータおよび気分データは、AIによるパーソナライズされた
            アドバイスの生成のためにAPIに送信されます。
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>送信されたデータはAIモデルのトレーニングには使用されません</li>
            <li>AIへの送信データは暗号化された通信経路を通じて送信されます</li>
            <li>AIの応答は参考情報であり、医療アドバイスではありません</li>
          </ul>

          <h2 className="text-lg font-semibold text-neutral-900 mt-8">4. 情報の共有・第三者提供</h2>
          <p>以下の場合を除き、個人情報を第三者に提供することはありません。</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>ユーザーの同意がある場合</li>
            <li>法令に基づく場合</li>
            <li>サービス提供に必要な業務委託先（Stripe、Anthropic等）への提供</li>
          </ul>

          <h2 className="text-lg font-semibold text-neutral-900 mt-8">5. データの保管・セキュリティ</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>パスワードはbcryptによるハッシュ化で保存</li>
            <li>通信はHTTPS/TLSで暗号化</li>
            <li>APIへのアクセスはレート制限により保護</li>
            <li>セッションはJWTトークンで管理（有効期限7日間）</li>
          </ul>

          <h2 className="text-lg font-semibold text-neutral-900 mt-8">6. ユーザーの権利</h2>
          <p>ユーザーは以下の権利を有します。</p>
          <ul className="list-disc pl-6 space-y-1">
            <li><strong>アクセス権</strong>: 設定ページからデータのエクスポートが可能です</li>
            <li><strong>訂正権</strong>: アカウント情報の変更が可能です</li>
            <li><strong>削除権</strong>: アカウント削除により全データが完全に削除されます</li>
            <li><strong>データポータビリティ</strong>: JSON形式でのデータエクスポートに対応</li>
          </ul>

          <h2 className="text-lg font-semibold text-neutral-900 mt-8">7. Cookieの使用</h2>
          <p>
            当サービスでは、認証状態の管理のためにCookieを使用します。
            Cookieはセッション管理に必要な最小限の情報のみを含み、
            トラッキング目的では使用しません。
          </p>

          <h2 className="text-lg font-semibold text-neutral-900 mt-8">8. 未成年者の利用</h2>
          <p>
            当サービスは16歳以上のユーザーを対象としています。
            16歳未満の方は、保護者の同意を得た上でご利用ください。
          </p>

          <h2 className="text-lg font-semibold text-neutral-900 mt-8">9. ポリシーの変更</h2>
          <p>
            本ポリシーは必要に応じて変更されることがあります。
            重要な変更がある場合は、サービス内またはメールでお知らせします。
          </p>

          <h2 className="text-lg font-semibold text-neutral-900 mt-8">10. お問い合わせ</h2>
          <p>
            プライバシーに関するご質問・ご要望は、以下までご連絡ください。
          </p>
          <p>メール: support@zenflow.app</p>
        </div>
      </div>
    </div>
  );
}
