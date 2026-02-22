import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 px-4">
      <div className="text-center max-w-md">
        <div className="text-6xl mb-4">🔍</div>
        <h1 className="text-2xl font-bold text-neutral-900 mb-2">
          ページが見つかりません
        </h1>
        <p className="text-neutral-500 mb-6">
          お探しのページは存在しないか、移動した可能性があります。
        </p>
        <div className="flex gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center h-10 px-4 text-sm font-medium bg-primary-600 text-white hover:bg-primary-700 rounded-md transition-all"
          >
            トップページへ
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center h-10 px-4 text-sm font-medium bg-neutral-100 text-neutral-800 hover:bg-neutral-200 border border-neutral-200 rounded-md transition-all"
          >
            ダッシュボードへ
          </Link>
        </div>
      </div>
    </div>
  );
}
