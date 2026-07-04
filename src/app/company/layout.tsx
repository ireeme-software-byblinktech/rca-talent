"use client";

import { AuthGuard } from "@/components/shared/AuthGuard";
import { AppShell } from "@/components/shared/AppShell";

export default function CompanyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard allowedRoles={["company"]}>
      <AppShell role="company">{children}</AppShell>
    </AuthGuard>
  );
}
