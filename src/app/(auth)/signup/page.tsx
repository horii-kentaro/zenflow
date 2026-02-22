import { SignupForm } from "@/components/auth/SignupForm";

export const metadata = {
  title: "新規登録",
  description: "Zenflowに無料登録して、AIがパーソナライズするセルフケアルーティンを体験しましょう。",
};

export default function SignupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-neutral-900">Zenflow</h1>
          <p className="text-neutral-500 mt-1">無料アカウントを作成</p>
        </div>
        <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-6">
          <SignupForm />
        </div>
      </div>
    </div>
  );
}
