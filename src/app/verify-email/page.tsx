"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { CheckCircle2, Loader2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { authApi } from "@/lib/api/auth";
import { useToast } from "@/hooks/use-toast";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();
  const token = searchParams.get("token");
  const email = searchParams.get("email") ?? "";
  const isPending = searchParams.get("pending") === "1";

  const [status, setStatus] = useState<"idle" | "verifying" | "success" | "error">(
    token ? "verifying" : "idle"
  );
  const [message, setMessage] = useState("");
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    if (!token) return;

    let cancelled = false;

    authApi
      .verifyEmail(token)
      .then((res) => {
        if (cancelled) return;
        setStatus("success");
        setMessage(res.message);
      })
      .catch((err) => {
        if (cancelled) return;
        setStatus("error");
        setMessage(
          err instanceof Error ? err.message : "Verification link is invalid or expired."
        );
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

  const handleResend = async () => {
    if (!email) {
      toast({
        variant: "destructive",
        title: "Email required",
        description: "No email address available to resend verification.",
      });
      return;
    }

    setIsResending(true);
    try {
      const res = await authApi.resendVerification(email);
      toast({ title: "Verification email sent", description: res.message });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Could not resend email",
        description: err instanceof Error ? err.message : "Please try again later.",
      });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
        {token && status === "verifying" && (
          <div className="text-center">
            <Loader2 className="mx-auto mb-4 h-10 w-10 animate-spin text-[#1A2B4B]" />
            <h1 className="text-xl font-bold text-gray-900">Verifying your email...</h1>
          </div>
        )}

        {token && status === "success" && (
          <div className="text-center">
            <CheckCircle2 className="mx-auto mb-4 h-12 w-12 text-emerald-600" />
            <h1 className="mb-2 text-xl font-bold text-gray-900">Email verified</h1>
            <p className="mb-6 text-sm text-gray-600">{message}</p>
            <Button
              className="w-full bg-[#1A2B4B] hover:bg-[#0F1A2E]"
              onClick={() => router.push("/login")}
            >
              Continue to login
            </Button>
          </div>
        )}

        {token && status === "error" && (
          <div className="text-center">
            <h1 className="mb-2 text-xl font-bold text-gray-900">Verification failed</h1>
            <p className="mb-6 text-sm text-gray-600">{message}</p>
            {email && (
              <Button
                variant="outline"
                className="mb-3 w-full"
                onClick={handleResend}
                disabled={isResending}
              >
                {isResending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Resend verification email
              </Button>
            )}
            <Button asChild className="w-full bg-[#1A2B4B] hover:bg-[#0F1A2E]">
              <Link href="/login">Back to login</Link>
            </Button>
          </div>
        )}

        {!token && (
          <div className="text-center">
            <Mail className="mx-auto mb-4 h-12 w-12 text-[#1A2B4B]" />
            <h1 className="mb-2 text-xl font-bold text-gray-900">
              {isPending ? "Check your inbox" : "Verify your email"}
            </h1>
            <p className="mb-2 text-sm text-gray-600">
              {isPending
                ? "We sent a verification link to:"
                : "Enter the link from your email, or resend it below."}
            </p>
            {email && (
              <p className="mb-6 font-semibold text-[#1A2B4B]">{email}</p>
            )}
            <p className="mb-6 text-sm text-gray-500">
              Click the link in the email to activate your account, then log in.
            </p>
            {email && (
              <Button
                variant="outline"
                className="mb-3 w-full"
                onClick={handleResend}
                disabled={isResending}
              >
                {isResending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Resend verification email
              </Button>
            )}
            <Button asChild className="w-full bg-[#1A2B4B] hover:bg-[#0F1A2E]">
              <Link href="/login">Go to login</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense>
      <VerifyEmailContent />
    </Suspense>
  );
}
