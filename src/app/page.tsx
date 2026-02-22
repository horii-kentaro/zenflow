"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/Button";

function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-neutral-50 py-24 lg:py-32">
      {/* ティール系ぼかしグロー */}
      <div className="absolute top-20 left-1/4 w-96 h-96 bg-primary-200 rounded-full blur-3xl opacity-30 animate-pulse-glow" />
      <div className="absolute bottom-20 right-1/4 w-80 h-80 bg-primary-100 rounded-full blur-3xl opacity-20 animate-pulse-glow" style={{ animationDelay: "1.5s" }} />
      <div className="absolute top-40 right-1/3 w-64 h-64 bg-warm-300 rounded-full blur-3xl opacity-10 animate-pulse-glow" style={{ animationDelay: "3s" }} />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-5xl lg:text-6xl font-bold text-neutral-900 leading-tight tracking-tight">
          心と体の調和を、
          <br />
          毎日5分から。
        </h1>
        <p className="mt-6 text-lg text-neutral-500 max-w-2xl mx-auto leading-relaxed">
          AIがあなたに寄り添うパーソナルウェルネスコーチ。
          <br className="hidden sm:inline" />
          呼吸法・ジャーナリング・ストレスチェックで、メンタルヘルスを「見える化」。
        </p>
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/signup">
            <Button size="lg">無料で始める</Button>
          </Link>
          <Link href="/login" className="text-sm text-neutral-500 hover:text-primary-600 transition-colors">
            ログインはこちら →
          </Link>
        </div>

        {/* ダッシュボードプレビュー */}
        <div className="mt-16 max-w-4xl mx-auto animate-float">
          <div className="rounded-xl border border-neutral-200 bg-white shadow-lg overflow-hidden">
            <div className="bg-neutral-100 px-4 py-2 flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-yellow-400" />
              <div className="w-3 h-3 rounded-full bg-green-400" />
            </div>
            <div className="p-6 lg:p-8">
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2 bg-primary-50 rounded-lg p-4">
                  <div className="text-xs text-primary-600 font-medium mb-1">週間ウェルネススコア</div>
                  <div className="text-3xl font-bold text-primary-700">78<span className="text-sm font-normal text-primary-500">/100</span></div>
                  <div className="mt-3 flex items-end gap-1 h-12">
                    {[40, 55, 50, 65, 60, 75, 78].map((v, i) => (
                      <div key={i} className="flex-1 bg-primary-300 rounded-t" style={{ height: `${v}%`, opacity: 0.5 + i * 0.07 }} />
                    ))}
                  </div>
                </div>
                <div className="bg-warm-300/20 rounded-lg p-4 flex flex-col items-center justify-center">
                  <div className="text-3xl font-bold text-neutral-800">5</div>
                  <div className="text-xs text-neutral-500 mt-1">日連続 🔥</div>
                </div>
              </div>
              <div className="mt-4 bg-neutral-50 rounded-lg p-4 flex items-center gap-3">
                <span className="text-2xl">🧘</span>
                <div className="flex-1">
                  <div className="text-sm font-medium text-neutral-800">今日のおすすめ: 5分間の呼吸瞑想</div>
                  <div className="text-xs text-neutral-500">リラックスして集中力を高めましょう</div>
                </div>
                <span className="text-neutral-400">→</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ProblemSection() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl lg:text-4xl font-bold text-neutral-900 leading-tight">
          忙しい毎日で、
          <br />
          自分のケアを後回しにしていませんか？
        </h2>
        <div className="mt-12 grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {[
            { emoji: "😓", text: "ストレスを感じても、対処法がわからない" },
            { emoji: "📊", text: "自分のメンタル状態を客観的に把握できていない" },
            { emoji: "⏰", text: "セルフケアを習慣化したいけど、続かない" },
          ].map((item, i) => (
            <div key={i} className="text-center">
              <div className="text-4xl mb-3">{item.emoji}</div>
              <p className="text-neutral-600 leading-relaxed">{item.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeaturesSection() {
  return (
    <section className="py-24 bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-neutral-900">
            3つの機能で、心をケアする習慣を
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              icon: "🧘",
              title: "AIセルフケアコーチ",
              desc: "あなたの気分や生活リズムに合わせて、AIが最適な呼吸法やストレッチをパーソナライズ。毎日5分で心身をリセット。",
              color: "bg-primary-50 border-primary-100",
            },
            {
              icon: "📊",
              title: "感情トラッキング",
              desc: "毎日の気分を5段階で記録。週間・月間のトレンドをビジュアルで「見える化」し、自分のパターンに気づく。",
              color: "bg-amber-50 border-amber-100",
            },
            {
              icon: "📝",
              title: "AIジャーナリング",
              desc: "AIが共感的な対話で思考整理をサポート。書くことで感情が整理され、自己理解が深まる。",
              color: "bg-green-50 border-green-100",
            },
          ].map((item, i) => (
            <div
              key={i}
              className={`rounded-xl border p-6 ${item.color} transition-shadow hover:shadow-md`}
            >
              <div className="text-3xl mb-4">{item.icon}</div>
              <h3 className="text-xl font-semibold text-neutral-900 mb-2">{item.title}</h3>
              <p className="text-neutral-600 leading-relaxed text-sm">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function AppPreviewSection() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl lg:text-4xl font-bold text-neutral-900 mb-4">
          シンプルで美しいダッシュボード
        </h2>
        <p className="text-neutral-500 max-w-2xl mx-auto mb-12">
          毎日の記録が一目でわかる。データに基づいたAIの分析で、あなたのウェルネスをサポートします。
        </p>
        <div className="max-w-3xl mx-auto rounded-xl border border-neutral-200 bg-neutral-50 p-8 shadow-sm">
          <div className="grid grid-cols-5 gap-3 mb-6">
            {["😫", "😟", "😐", "😊", "😄"].map((emoji, i) => (
              <div
                key={i}
                className={`py-3 rounded-lg text-center text-2xl transition-all cursor-pointer ${
                  i === 3 ? "bg-primary-100 scale-110 shadow-sm" : "bg-white border border-neutral-200 hover:border-primary-300"
                }`}
              >
                {emoji}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded-lg border border-neutral-200 p-4 text-left">
              <div className="text-xs text-neutral-500 mb-1">感情の推移</div>
              <div className="flex items-end gap-1 h-16">
                {[3, 4, 3, 2, 4, 5, 4].map((v, i) => (
                  <div key={i} className="flex-1 bg-primary-400 rounded-t transition-all" style={{ height: `${v * 20}%`, opacity: 0.5 + i * 0.07 }} />
                ))}
              </div>
            </div>
            <div className="bg-white rounded-lg border border-neutral-200 p-4 text-left">
              <div className="text-xs text-neutral-500 mb-2">AIインサイト</div>
              <p className="text-sm text-neutral-700">火曜日に気分が下がる傾向があります。月曜夜のリラクゼーションが効果的かもしれません。</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function SocialProofSection() {
  return (
    <section className="py-24 bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl lg:text-4xl font-bold text-neutral-900 text-center mb-12">
          ユーザーの声
        </h2>
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {[
            {
              name: "田中美咲",
              role: "会社員・30代",
              text: "毎朝の5分呼吸で、会議前の不安が減りました。ストリークが途切れないよう頑張るのがモチベーションに。",
              metric: "ストレススコア 40%改善",
            },
            {
              name: "佐藤健太",
              role: "エンジニア・20代",
              text: "AIジャーナリングで考えが整理できるようになった。振り返りの習慣がついて、自分の感情パターンが見えてきた。",
              metric: "30日連続ログイン達成",
            },
            {
              name: "鈴木あかり",
              role: "フリーランス・40代",
              text: "数値で見える化されるから続けやすい。週間レポートで自分の傾向がわかるのが嬉しい。",
              metric: "ウェルネススコア +25%",
            },
          ].map((item, i) => (
            <div key={i} className="bg-white rounded-xl border border-neutral-200 p-6 shadow-sm">
              <p className="text-neutral-700 text-sm leading-relaxed mb-4">&ldquo;{item.text}&rdquo;</p>
              <div className="border-t border-neutral-100 pt-3">
                <div className="font-medium text-neutral-900 text-sm">{item.name}</div>
                <div className="text-xs text-neutral-500">{item.role}</div>
                <div className="mt-2 inline-block bg-primary-50 text-primary-700 text-xs font-medium px-2 py-0.5 rounded">
                  {item.metric}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PricingSection() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl lg:text-4xl font-bold text-neutral-900 mb-4">
          シンプルな料金プラン
        </h2>
        <p className="text-neutral-500 mb-12">まずは無料で始めて、もっと深く自分をケアしたくなったらProへ。</p>
        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {/* Free */}
          <div className="rounded-xl border border-neutral-200 bg-white p-6 text-left">
            <h3 className="text-lg font-semibold text-neutral-900">Free</h3>
            <div className="mt-2 text-3xl font-bold text-neutral-900">¥0<span className="text-sm font-normal text-neutral-500">/月</span></div>
            <ul className="mt-6 space-y-3">
              {["1日1回のセルフケア", "週3回のジャーナリング", "7日間の気分履歴", "基本的なAI対話"].map((f, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-neutral-600">
                  <svg className="w-4 h-4 text-primary-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  {f}
                </li>
              ))}
            </ul>
            <Link href="/signup" className="block mt-6">
              <Button variant="secondary" className="w-full">無料で始める</Button>
            </Link>
          </div>
          {/* Pro */}
          <div className="rounded-xl border-2 border-primary-500 bg-white p-6 text-left relative">
            <div className="absolute -top-3 left-6 bg-primary-500 text-white text-xs font-medium px-3 py-0.5 rounded-full">おすすめ</div>
            <h3 className="text-lg font-semibold text-neutral-900">Pro</h3>
            <div className="mt-2 text-3xl font-bold text-neutral-900">¥980<span className="text-sm font-normal text-neutral-500">/月</span></div>
            <ul className="mt-6 space-y-3">
              {["無制限のセルフケア", "無制限のジャーナリング + AI深掘り", "無制限の気分履歴 + トレンド分析", "月3回のストリークフリーズ", "カスタムルーティン作成"].map((f, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-neutral-600">
                  <svg className="w-4 h-4 text-primary-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  {f}
                </li>
              ))}
            </ul>
            <Link href="/signup" className="block mt-6">
              <Button className="w-full">Proを始める</Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function FAQSection() {
  const faqs = [
    { q: "本当に無料で使えますか？", a: "はい。Freeプランは完全無料で、基本的なセルフケア・ジャーナリング・気分トラッキングをご利用いただけます。クレジットカードの登録も不要です。" },
    { q: "AIはどのようにパーソナライズされますか？", a: "あなたの気分の記録、セルフケアの履歴、ジャーナリングの内容をもとに、最適なルーティンや対話を提供します。使うほどにあなたに合ったコーチングになります。" },
    { q: "データのプライバシーは大丈夫ですか？", a: "あなたのデータは暗号化して安全に保管されます。第三者への販売や共有は一切行いません。いつでもデータの削除をリクエストできます。" },
    { q: "いつでも解約できますか？", a: "はい。Proプランはいつでも解約可能で、解約後は次の請求期間からFreeプランに戻ります。解約手数料は一切かかりません。" },
  ];

  return (
    <FAQInner faqs={faqs} />
  );
}

function FAQInner({ faqs }: { faqs: { q: string; a: string }[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="py-24 bg-neutral-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl lg:text-4xl font-bold text-neutral-900 text-center mb-12">
          よくある質問
        </h2>
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div key={i} className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full flex items-center justify-between p-5 text-left hover:bg-neutral-50 transition-colors"
              >
                <span className="font-medium text-neutral-900 text-sm">{faq.q}</span>
                <svg
                  className={`w-5 h-5 text-neutral-400 transition-transform ${openIndex === i ? "rotate-180" : ""}`}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {openIndex === i && (
                <div className="px-5 pb-5 text-sm text-neutral-600 leading-relaxed">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FooterCTA() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl lg:text-4xl font-bold text-neutral-900 mb-4">
          今日から、5分のセルフケアを始めよう
        </h2>
        <p className="text-neutral-500 mb-8 max-w-2xl mx-auto">
          小さな習慣が、大きな変化を生む。Zenflowで心と体の調和を見つけましょう。
        </p>
        <Link href="/signup">
          <Button size="lg">無料で始める</Button>
        </Link>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-neutral-200 bg-neutral-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-sm text-neutral-500">
          © 2026 Zenflow. All rights reserved.
        </div>
        <div className="flex gap-6 text-sm text-neutral-500">
          <a href="/terms" className="hover:text-neutral-700 transition-colors">利用規約</a>
          <a href="/privacy" className="hover:text-neutral-700 transition-colors">プライバシーポリシー</a>
          <a href="/tokushoho" className="hover:text-neutral-700 transition-colors">特定商取引法</a>
        </div>
      </div>
    </footer>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <ProblemSection />
      <FeaturesSection />
      <AppPreviewSection />
      <SocialProofSection />
      <PricingSection />
      <FAQSection />
      <FooterCTA />
      <Footer />
    </div>
  );
}
