import { LoginForm } from "@/components/auth/LoginForm";

export const metadata = { title: "ログイン - Zenflow" };

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-neutral-900">Zenflow</h1>
          <p className="text-neutral-500 mt-1">アカウントにログイン</p>
        </div>
        <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-6">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
