import { SessionProvider } from "next-auth/react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { MobileNav } from "@/components/layout/MobileNav";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <SessionProvider session={session}>
      <div className="min-h-screen bg-neutral-50">
        <Sidebar />
        <div className="lg:pl-60">
          <Header />
          <main className="p-4 lg:p-8 pb-20 lg:pb-8">
            {children}
          </main>
        </div>
        <MobileNav />
      </div>
    </SessionProvider>
  );
}
