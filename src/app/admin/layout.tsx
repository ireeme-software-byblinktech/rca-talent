"use client";

import { AuthGuard } from "@/components/shared/AuthGuard";
import { AppShell } from "@/components/shared/AppShell";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard allowedRoles={["admin"]}>
      <AppShell role="admin">{children}</AppShell>
    </AuthGuard>
  );
}
