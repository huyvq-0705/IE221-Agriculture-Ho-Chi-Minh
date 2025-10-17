"use client";

import { usePathname } from "next/navigation";
import Sidebar from "@/components/sidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLogin = pathname === "/agrihcmAdmin/login";

  if (isLogin) return <>{children}</>; 

  return (
    <div className="min-h-screen w-full lg:flex">
      <Sidebar />
      <main className="flex-1 p-4 lg:p-6">{children}</main>
    </div>
  );
}