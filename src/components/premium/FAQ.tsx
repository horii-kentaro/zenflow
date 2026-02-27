"use client";

import { useState } from "react";

const FAQ_ITEMS = [
  {
    q: "いつでもキャンセルできますか？",
    a: "はい、Proプランはいつでもキャンセルできます。キャンセル後も現在の請求期間が終わるまでProの機能をお使いいただけます。",
  },
  {
    q: "無料プランでもちゃんと使えますか？",
    a: "はい。無料プランでも気分記録、1日1回のセルフケア、週3回のジャーナリングが利用できます。基本的なメンタルヘルスケアには十分な機能を提供しています。",
  },
  {
    q: "支払い方法は何がありますか？",
    a: "クレジットカード（Visa, Mastercard, AMEX）でお支払いいただけます。決済はStripeを通じて安全に処理されます。",
  },
  {
    q: "データのプライバシーは守られますか？",
    a: "はい。お客様のデータは暗号化して保存され、第三者と共有されることはありません。詳しくはプライバシーポリシーをご確認ください。",
  },
  {
    q: "プランを途中で変更できますか？",
    a: "いつでもFreeからProへアップグレード、またはProからFreeへダウングレードできます。設定ページまたは料金ページから変更できます。",
  },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="bg-white rounded-xl border border-neutral-200 shadow-sm">
      <h3 className="text-lg font-semibold text-neutral-900 px-6 pt-6 pb-2">
        よくある質問
      </h3>
      <div className="divide-y divide-neutral-100">
        {FAQ_ITEMS.map((item, i) => (
          <div key={i} className="px-6">
            <button
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
              className="w-full flex items-center justify-between py-4 text-left"
            >
              <span className="text-sm font-medium text-neutral-800">{item.q}</span>
              <svg
                className={`w-4 h-4 text-neutral-400 shrink-0 transition-transform ${
                  openIndex === i ? "rotate-180" : ""
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {openIndex === i && (
              <p className="text-sm text-neutral-500 pb-4 animate-fade-in">{item.a}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
