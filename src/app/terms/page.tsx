import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "利用規約",
  description: "Zenflowの利用規約。サービスのご利用にあたりご確認ください。",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <Link href="/" className="text-sm text-primary-600 hover:underline">
          &larr; トップページに戻る
        </Link>
        <h1 className="text-2xl font-bold text-neutral-900 mt-6 mb-8">利用規約</h1>

        <div className="prose prose-neutral max-w-none space-y-6 text-sm text-neutral-700 leading-relaxed">
          <p>最終更新日: 2026年2月22日</p>

          <p>
            本利用規約（以下「本規約」）は、Zenflow（以下「当サービス」）の利用条件を定めるものです。
            ユーザーは、本規約に同意した上で当サービスをご利用ください。
          </p>

          <h2 className="text-lg font-semibold text-neutral-900 mt-8">第1条（定義）</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>「当サービス」とは、Zenflowが提供するAIウェルネスコーチサービスを指します</li>
            <li>「ユーザー」とは、当サービスに登録し利用する個人を指します</li>
            <li>「コンテンツ」とは、ユーザーが当サービスに入力・記録したデータを指します</li>
          </ul>

          <h2 className="text-lg font-semibold text-neutral-900 mt-8">第2条（アカウント）</h2>
          <ol className="list-decimal pl-6 space-y-1">
            <li>ユーザーは正確な情報を提供してアカウントを作成する必要があります</li>
            <li>アカウント情報の管理はユーザーの責任とします</li>
            <li>1人のユーザーにつき1つのアカウントとします</li>
            <li>アカウントの第三者への貸与・譲渡は禁止します</li>
          </ol>

          <h2 className="text-lg font-semibold text-neutral-900 mt-8">第3条（サービス内容）</h2>
          <p>当サービスは以下の機能を提供します。</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>AIパーソナライズされたセルフケアルーティン</li>
            <li>AIジャーナリング（対話形式の振り返り）</li>
            <li>気分トラッキング・トレンド分析</li>
            <li>ストリーク管理による継続サポート</li>
          </ul>

          <h2 className="text-lg font-semibold text-neutral-900 mt-8">第4条（免責事項）</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>当サービスは医療サービスではありません。AIの応答は医療アドバイスに代わるものではありません</li>
            <li>心身の不調がある場合は、必ず医療専門家にご相談ください</li>
            <li>当サービスの利用により生じた損害について、当サービスは責任を負いません</li>
            <li>システム障害・メンテナンス等によるサービス中断について、事前の通知なく行う場合があります</li>
          </ul>

          <h2 className="text-lg font-semibold text-neutral-900 mt-8">第5条（料金・支払い）</h2>
          <ol className="list-decimal pl-6 space-y-1">
            <li>Freeプランは無料でご利用いただけます</li>
            <li>Proプランは月額980円（税込）です</li>
            <li>支払いはStripeを通じたクレジットカード決済で行います</li>
            <li>サブスクリプションは自動更新されます。更新を停止する場合は、更新日前に解約手続きを行ってください</li>
            <li>解約後も、支払い済みの期間終了まではProプランをご利用いただけます</li>
          </ol>

          <h2 className="text-lg font-semibold text-neutral-900 mt-8">第6条（禁止事項）</h2>
          <p>以下の行為を禁止します。</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>不正アクセス・システムへの攻撃</li>
            <li>他のユーザーへのなりすまし</li>
            <li>当サービスの逆コンパイル・リバースエンジニアリング</li>
            <li>APIの不正利用・過度なリクエスト</li>
            <li>法令に違反する利用</li>
          </ul>

          <h2 className="text-lg font-semibold text-neutral-900 mt-8">第7条（知的財産権）</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>当サービスの著作権・商標権等の知的財産権は、当サービス運営者に帰属します</li>
            <li>ユーザーが入力したコンテンツの権利はユーザーに帰属します</li>
          </ul>

          <h2 className="text-lg font-semibold text-neutral-900 mt-8">第8条（サービスの変更・終了）</h2>
          <p>
            当サービスは、事前通知の上でサービス内容の変更・終了を行うことがあります。
            サービス終了時は、ユーザーにデータエクスポートの機会を提供します。
          </p>

          <h2 className="text-lg font-semibold text-neutral-900 mt-8">第9条（規約の変更）</h2>
          <p>
            本規約は必要に応じて変更されることがあります。
            変更後の規約は当サービス上に掲載した時点で効力を生じます。
            重要な変更がある場合は、事前にお知らせします。
          </p>

          <h2 className="text-lg font-semibold text-neutral-900 mt-8">第10条（準拠法・管轄）</h2>
          <p>
            本規約は日本法に準拠し、当サービスに関する紛争は
            東京地方裁判所を第一審の専属的合意管轄裁判所とします。
          </p>
        </div>
      </div>
    </div>
  );
}
