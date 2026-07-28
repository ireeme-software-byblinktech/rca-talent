"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/context";

const CONTENT_MANAGER_PATHS = ["/admin/blog", "/admin/settings"];

function isContentManagerPath(pathname: string) {
  return CONTENT_MANAGER_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );
}

export function ContentManagerGuard({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (user?.role !== "content_manager") return;

    if (pathname === "/admin" || !isContentManagerPath(pathname)) {
      router.replace("/admin/blog");
    }
  }, [user, pathname, router]);

  if (user?.role === "content_manager" && !isContentManagerPath(pathname)) {
    return null;
  }

  return <>{children}</>;
}
