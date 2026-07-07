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
    <div className="flex min-h-screen bg-gray-50 items-center justify-center p-4">
      {/* Entire Card Frame */}
      <div className="w-full max-w-5xl bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex flex-col lg:flex-row">
          {/* Left Side - Navy Blue with Imigongo Pattern */}
          <div className="lg:w-5/12 bg-[#1A2B4B] p-8 lg:p-12 flex items-center justify-center relative min-h-[300px] lg:min-h-[600px]">
            {/* Imigongo Pattern */}
            <div 
              className="absolute inset-0 opacity-15"
              style={{
                backgroundImage: `url('/imigongo-pattern.svg')`,
                backgroundSize: '300px 300px',
                backgroundPosition: 'center'
              }}
            />
            
            {/* Content */}
            <div className="relative z-10 text-center max-w-sm">
              <div className="w-24 h-24 lg:w-28 lg:h-28 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center mb-4 lg:mb-6 shadow-2xl mx-auto">
                <RCALogo size="md" />
              </div>
              <h2 className="text-2xl lg:text-3xl font-black text-white mb-3">
                Welcome Back
              </h2>
              <p className="text-white/80 leading-relaxed text-sm lg:text-base">
                Access your RCA Talent account
              </p>
            </div>
          </div>

          {/* Right Side - White Form */}
          <div className="lg:w-7/12 p-6 lg:p-10 flex items-center justify-center bg-white">
            <div className="w-full max-w-md">
              {/* Back to Home */}
              <Link 
                href="/" 
                className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-[#1A2B4B] transition-colors mb-6"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Home
              </Link>

              {/* Header */}
              <div className="mb-6">
                <h1 className="text-2xl lg:text-3xl font-black text-gray-900 mb-2">
                  Login to your account
                </h1>
                <p className="text-gray-500 text-sm">
                  Welcome back! Enter your details
                </p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-1.5">
                  <label htmlFor="email" className="text-sm font-semibold text-gray-700">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    className="w-full h-11 px-4 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1A2B4B] focus:border-transparent transition-all text-sm"
                    {...register("email")}
                  />
                  {errors.email && (
                    <p className="text-xs text-red-500">{errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="password" className="text-sm font-semibold text-gray-700">
                    Password
                  </label>
                  <PasswordInput
                    id="password"
                    label=""
                    placeholder="Enter your Password"
                    className="w-full h-11 px-4 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1A2B4B] focus:border-transparent transition-all text-sm"
                    {...register("password")}
                  />
                  {errors.password && (
                    <p className="text-xs text-red-500">{errors.password.message}</p>
                  )}
                </div>

                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      checked={rememberMe}
                      onCheckedChange={(v) => setRememberMe(!!v)}
                    />
                    <span className="text-sm text-gray-600">Remember me</span>
                  </label>
                  <button
                    type="button"
                    className="text-sm font-semibold text-[#1A2B4B] hover:text-[#0F1A2E] transition-colors"
                    onClick={() =>
                      toast({
                        title: "Password reset",
                        description:
                          "Password reset will be available when connected to the backend.",
                      })
                    }
                  >
                    Forgot Password?
                  </button>
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-11 w-full rounded-xl text-sm font-bold bg-[#1A2B4B] hover:bg-[#0F1A2E] transition-all mt-2"
                >
                  {isSubmitting && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Login
                </Button>
              </form>

              <div className="mt-5 rounded-xl bg-blue-50 border border-blue-100 p-3.5">
                <p className="text-xs font-semibold text-gray-600 mb-2">
                  Quick demo (password: password123)
                </p>
                <div className="flex flex-wrap gap-2">
                  {demoAccounts.map((acc) => (
                    <button
                      key={acc.email}
                      type="button"
                      className="rounded-full bg-white px-3.5 py-1.5 text-xs font-semibold text-[#1A2B4B] border border-gray-200 hover:bg-[#1A2B4B] hover:text-white transition-colors"
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

              <p className="mt-6 text-center text-sm text-gray-600">
                New here?{" "}
                <Link
                  href={`/register?role=${role}`}
                  className="font-bold text-[#1A2B4B] hover:text-[#0F1A2E] transition-colors"
                >
                  Create account
                </Link>
              </p>
            </div>
          </div>
        </div>
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
