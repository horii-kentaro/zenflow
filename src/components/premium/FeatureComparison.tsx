const FEATURES = [
  { name: "気分トラッキング", free: "毎日", pro: "毎日" },
  { name: "気分履歴", free: "7日間", pro: "無制限" },
  { name: "気分カレンダー", free: false, pro: true },
  { name: "セルフケア", free: "1回/日", pro: "無制限" },
  { name: "ルーティンタイプ選択", free: true, pro: true },
  { name: "セルフケア履歴", free: "7日間", pro: "30日間" },
  { name: "ジャーナリング", free: "3回/週", pro: "無制限" },
  { name: "AI深掘り対話", free: true, pro: true },
  { name: "ジャーナル検索", free: true, pro: true },
  { name: "ストリーク", free: true, pro: true },
  { name: "ストリークフリーズ", free: false, pro: "3回/月" },
  { name: "トレンド分析", free: false, pro: true },
];

function CellValue({ value }: { value: boolean | string }) {
  if (typeof value === "string") {
    return <span className="text-sm text-neutral-700">{value}</span>;
  }
  return value ? (
    <svg className="w-5 h-5 text-green-500 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  ) : (
    <svg className="w-5 h-5 text-neutral-300 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

export function FeatureComparison() {
  return (
    <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
      <h3 className="text-lg font-semibold text-neutral-900 px-6 pt-6 pb-4">
        機能比較
      </h3>
      <table className="w-full">
        <thead>
          <tr className="border-b border-neutral-100">
            <th className="text-left text-xs font-medium text-neutral-400 px-6 py-2">機能</th>
            <th className="text-center text-xs font-medium text-neutral-400 px-4 py-2 w-24">Free</th>
            <th className="text-center text-xs font-medium text-primary-600 px-4 py-2 w-24">Pro</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-50">
          {FEATURES.map((f) => (
            <tr key={f.name}>
              <td className="text-sm text-neutral-700 px-6 py-3">{f.name}</td>
              <td className="text-center px-4 py-3"><CellValue value={f.free} /></td>
              <td className="text-center px-4 py-3 bg-primary-50/30"><CellValue value={f.pro} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
