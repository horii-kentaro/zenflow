"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const items = [
  { href: "/dashboard", label: "ホーム", icon: "🏠" },
  { href: "/selfcare", label: "ケア", icon: "💚" },
  { href: "/journal", label: "記録", icon: "📝" },
  { href: "/mood", label: "気分", icon: "😊" },
  { href: "/settings", label: "設定", icon: "⚙️" },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 bg-white border-t border-neutral-200 z-40">
      <div className="flex justify-around items-center h-16">
        {items.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-0.5 text-xs font-medium transition-colors py-1 px-3",
                isActive ? "text-primary-700" : "text-neutral-400"
              )}
            >
              <span className="text-xl">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
