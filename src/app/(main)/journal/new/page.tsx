"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function NewJournalPage() {
  const router = useRouter();

  useEffect(() => {
    const create = async () => {
      const res = await fetch("/api/journal", { method: "POST" });
      const data = await res.json();
      if (data.data?.id) {
        router.replace(`/journal/${data.data.id}`);
      } else {
        router.replace("/journal");
      }
    };
    create();
  }, [router]);

  return (
    <div className="flex items-center justify-center py-20">
      <div className="animate-spin h-8 w-8 border-4 border-primary-500 border-t-transparent rounded-full" />
    </div>
  );
}
