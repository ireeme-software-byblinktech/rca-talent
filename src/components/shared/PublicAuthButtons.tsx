"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth/context";
import { getDashboardPath } from "@/lib/auth/routes";

export function PublicAuthButtons() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div className="h-9 w-28" aria-hidden />;
  }

  if (user) {
    return (
      <Button
        asChild
        className="rounded-full px-5 h-9 bg-white text-[#1A2B4B] hover:bg-gray-100 font-semibold"
      >
        <Link href={getDashboardPath(user.role)}>Dashboard</Link>
      </Button>
    );
  }

  return (
    <>
      <Button
        variant="ghost"
        asChild
        className="font-medium text-white hover:bg-white/10 hover:text-white h-9 px-4"
      >
        <Link href="/login">Log in</Link>
      </Button>
      <Button
        asChild
        className="rounded-full px-5 h-9 bg-white text-[#1A2B4B] hover:bg-gray-100 font-semibold"
      >
        <Link href="/register">Get Started</Link>
      </Button>
    </>
  );
}
