"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { RCALogo } from "@/components/shared/RCALogo";
import { PasswordInput } from "@/components/shared/PasswordInput";
import { useAuth } from "@/lib/auth/context";
import { useToast } from "@/hooks/use-toast";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginForm = z.infer<typeof loginSchema>;

function LoginForm() {
  const { login } = useAuth();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const defaultRole = searchParams.get("role") ?? "student";
  const [role] = useState<"student" | "company">(
    defaultRole === "company" ? "company" : "student"
  );
  const [rememberMe, setRememberMe] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setIsSubmitting(true);
    try {
      await login(data);
      if (rememberMe) {
        localStorage.setItem("rca-remember-email", data.email);
      }
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Login failed",
        description: err instanceof Error ? err.message : "Invalid credentials",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const demoAccounts = [
    { label: "Student", email: "alice@student.rw" },
    { label: "Company", email: "hr@techkigali.rw" },
    { label: "Admin", email: "admin@rca.rw" },
  ];

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-12">
      <RCALogo size="xl" className="mb-8" />

      <div className="auth-card">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-foreground">
            School Account Login
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Log In to your account
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="Email"
              className="input-field"
              {...register("email")}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          <PasswordInput
            id="password"
            placeholder="Password"
            {...register("password")}
          />
          {errors.password && (
            <p className="text-sm text-destructive -mt-3">
              {errors.password.message}
            </p>
          )}

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer">
              <Checkbox
                checked={rememberMe}
                onCheckedChange={(v) => setRememberMe(!!v)}
              />
              <span className="text-sm text-muted-foreground">Remember Me</span>
            </label>
            <button
              type="button"
              className="text-sm font-semibold text-primary hover:underline"
              onClick={() =>
                toast({
                  title: "Password reset",
                  description:
                    "Password reset will be available when connected to the backend.",
                })
              }
            >
              Forgot my password
            </button>
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="h-12 w-full rounded-full text-base font-semibold"
          >
            {isSubmitting && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Login
          </Button>
        </form>

        <div className="mt-6 rounded-xl bg-secondary/80 p-4">
          <p className="text-xs font-medium text-muted-foreground mb-2">
            Quick demo (password: password123)
          </p>
          <div className="flex flex-wrap gap-2">
            {demoAccounts.map((acc) => (
              <button
                key={acc.email}
                type="button"
                className="rounded-full bg-card px-3 py-1 text-xs font-medium text-primary border border-border/60 hover:bg-primary hover:text-primary-foreground transition-colors"
                onClick={() => {
                  setValue("email", acc.email);
                  setValue("password", "password123");
                }}
              >
                {acc.label}
              </button>
            ))}
          </div>
        </div>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link
            href={`/register?role=${role}`}
            className="font-semibold text-primary hover:underline"
          >
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
