"use client";

import { useAuth } from "@/lib/auth/context";
import { MessagesPanel } from "@/components/shared/MessagesPanel";
import { PageHeader } from "@/components/shared/PageHeader";

export default function CompanyMessagesPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Messages"
        description="Direct messaging with candidates after contact requests are accepted"
      />
      {user && <MessagesPanel userId={user.id} />}
    </div>
  );
}
