"use client";

import { AuthGuard } from "@/components/shared/AuthGuard";
import { AppShell } from "@/components/shared/AppShell";

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard allowedRoles={["student"]}>
      <AppShell role="student">{children}</AppShell>
    </AuthGuard>
  );
}
