"use client";

import { AuthGuard } from "@/components/shared/AuthGuard";
import { AppShell } from "@/components/shared/AppShell";
import { ContentManagerGuard } from "@/components/admin/ContentManagerGuard";
import { useAuth } from "@/lib/auth/context";
import type { UserRole } from "@/types";

function AdminLayoutShell({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const shellRole: UserRole =
    user?.role === "content_manager" ? "content_manager" : "admin";

  return (
    <ContentManagerGuard>
      <AppShell role={shellRole}>{children}</AppShell>
    </ContentManagerGuard>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard allowedRoles={["admin", "content_manager"]}>
      <AdminLayoutShell>{children}</AdminLayoutShell>
    </AuthGuard>
  );
}
