import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "特定商取引法に基づく表記",
  description: "特定商取引法に基づく表記。販売事業者情報等をご確認ください。",
};

export default function TokushohoPage() {
  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <Link href="/" className="text-sm text-primary-600 hover:underline">
          &larr; トップページに戻る
        </Link>
        <h1 className="text-2xl font-bold text-neutral-900 mt-6 mb-8">特定商取引法に基づく表記</h1>

        <div className="prose prose-neutral max-w-none text-sm text-neutral-700 leading-relaxed">
          <table className="w-full border-collapse">
            <tbody className="divide-y divide-neutral-200">
              <tr>
                <td className="py-3 pr-4 font-medium text-neutral-900 w-1/3 align-top">販売事業者名</td>
                <td className="py-3">Zenflow運営事務局</td>
              </tr>
              <tr>
                <td className="py-3 pr-4 font-medium text-neutral-900 align-top">代表者</td>
                <td className="py-3">（代表者名を記載）</td>
              </tr>
              <tr>
                <td className="py-3 pr-4 font-medium text-neutral-900 align-top">所在地</td>
                <td className="py-3">（所在地を記載。請求があった場合に遅滞なく開示します）</td>
              </tr>
              <tr>
                <td className="py-3 pr-4 font-medium text-neutral-900 align-top">電話番号</td>
                <td className="py-3">（請求があった場合に遅滞なく開示します）</td>
              </tr>
              <tr>
                <td className="py-3 pr-4 font-medium text-neutral-900 align-top">メールアドレス</td>
                <td className="py-3">support@zenflow.app</td>
              </tr>
              <tr>
                <td className="py-3 pr-4 font-medium text-neutral-900 align-top">販売URL</td>
                <td className="py-3">https://zenflow.app</td>
              </tr>
              <tr>
                <td className="py-3 pr-4 font-medium text-neutral-900 align-top">サービス名</td>
                <td className="py-3">Zenflow（AIウェルネスコーチ）</td>
              </tr>
              <tr>
                <td className="py-3 pr-4 font-medium text-neutral-900 align-top">販売価格</td>
                <td className="py-3">
                  Freeプラン: 無料<br />
                  Proプラン: 月額980円（税込）
                </td>
              </tr>
              <tr>
                <td className="py-3 pr-4 font-medium text-neutral-900 align-top">支払方法</td>
                <td className="py-3">クレジットカード決済（Stripe経由）</td>
              </tr>
              <tr>
                <td className="py-3 pr-4 font-medium text-neutral-900 align-top">支払時期</td>
                <td className="py-3">サブスクリプション開始時に即時決済。以降、毎月自動更新時に決済。</td>
              </tr>
              <tr>
                <td className="py-3 pr-4 font-medium text-neutral-900 align-top">商品の引渡し時期</td>
                <td className="py-3">決済完了後、即時にサービスをご利用いただけます</td>
              </tr>
              <tr>
                <td className="py-3 pr-4 font-medium text-neutral-900 align-top">返品・キャンセル</td>
                <td className="py-3">
                  デジタルサービスのため返品はできません。<br />
                  サブスクリプションはいつでも解約可能です。<br />
                  解約後も、支払い済み期間の終了までサービスをご利用いただけます。
                </td>
              </tr>
              <tr>
                <td className="py-3 pr-4 font-medium text-neutral-900 align-top">動作環境</td>
                <td className="py-3">
                  Chrome、Safari、Firefox、Edgeの最新バージョン<br />
                  インターネット接続が必要です
                </td>
              </tr>
              <tr>
                <td className="py-3 pr-4 font-medium text-neutral-900 align-top">特別な販売条件</td>
                <td className="py-3">16歳以上のユーザーを対象としています</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
