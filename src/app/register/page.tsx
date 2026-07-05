"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RCALogo } from "@/components/shared/RCALogo";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/lib/auth/context";
import { useToast } from "@/hooks/use-toast";
import { COHORT_YEARS, INDUSTRY_OPTIONS } from "@/lib/mock/data";

const baseSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const studentSchema = baseSchema.extend({
  fullName: z.string().min(2, "Name is required"),
  cohortYear: z.coerce.number().min(2020).max(2030),
});

const companySchema = baseSchema.extend({
  companyName: z.string().min(2, "Company name is required"),
  industry: z.string().min(1, "Select an industry"),
});

function RegisterForm() {
  const { registerStudent, registerCompany } = useAuth();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const defaultRole = searchParams.get("role") ?? "student";
  const [role, setRole] = useState<"student" | "company">(
    defaultRole === "company" ? "company" : "student"
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cohortYear, setCohortYear] = useState(String(COHORT_YEARS[2]));
  const [industry, setIndustry] = useState("");

  const studentForm = useForm({
    resolver: zodResolver(studentSchema),
    defaultValues: { cohortYear: COHORT_YEARS[2] },
  });

  const companyForm = useForm({
    resolver: zodResolver(companySchema),
  });

  const onSubmitStudent = async (data: z.infer<typeof studentSchema>) => {
    setIsSubmitting(true);
    try {
      await registerStudent({
        email: data.email,
        password: data.password,
        fullName: data.fullName,
        cohortYear: data.cohortYear,
      });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Registration failed",
        description: err instanceof Error ? err.message : "Could not register",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSubmitCompany = async (data: z.infer<typeof companySchema>) => {
    setIsSubmitting(true);
    try {
      await registerCompany({
        email: data.email,
        password: data.password,
        companyName: data.companyName,
        industry: data.industry,
      });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Registration failed",
        description: err instanceof Error ? err.message : "Could not register",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

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
                Join RCA Talent
              </h2>
              <p className="text-white/80 leading-relaxed text-sm lg:text-base">
                Connect with Rwanda's tech ecosystem
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
                  Create your account
                </h1>
                <p className="text-gray-500 text-sm">
                  Join the RCA Talent marketplace
                </p>
              </div>

              {/* Role Tabs */}
              <Tabs
                value={role}
                onValueChange={(v) => setRole(v as "student" | "company")}
                className="mb-5"
              >
                <TabsList className="grid w-full grid-cols-2 h-11 bg-gray-100 rounded-xl p-1">
                  <TabsTrigger value="student" className="rounded-lg font-semibold text-sm data-[state=active]:bg-white data-[state=active]:text-[#1A2B4B] data-[state=active]:shadow-sm">Student</TabsTrigger>
                  <TabsTrigger value="company" className="rounded-lg font-semibold text-sm data-[state=active]:bg-white data-[state=active]:text-[#1A2B4B] data-[state=active]:shadow-sm">Company</TabsTrigger>
                </TabsList>
              </Tabs>

              {role === "student" ? (
                <form
                  onSubmit={studentForm.handleSubmit(onSubmitStudent)}
                  className="space-y-3.5"
                >
                  <div className="space-y-1.5">
                    <label htmlFor="fullName" className="text-sm font-semibold text-gray-700">
                      Full name
                    </label>
                    <input
                      id="fullName"
                      placeholder="Enter your full name"
                      className="w-full h-11 px-4 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1A2B4B] focus:border-transparent transition-all text-sm"
                      {...studentForm.register("fullName")}
                    />
                    {studentForm.formState.errors.fullName && (
                      <p className="text-xs text-red-500">
                        {studentForm.formState.errors.fullName.message as string}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="email" className="text-sm font-semibold text-gray-700">
                      Email
                    </label>
                    <input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      className="w-full h-11 px-4 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1A2B4B] focus:border-transparent transition-all text-sm"
                      {...studentForm.register("email")}
                    />
                    {studentForm.formState.errors.email && (
                      <p className="text-xs text-red-500">
                        {studentForm.formState.errors.email.message as string}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-gray-700">
                      Cohort year
                    </label>
                    <Select
                      value={cohortYear}
                      onValueChange={(v) => {
                        setCohortYear(v);
                        studentForm.setValue("cohortYear", Number(v));
                      }}
                    >
                      <SelectTrigger className="h-11 rounded-xl border-gray-200 focus:ring-2 focus:ring-[#1A2B4B]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {COHORT_YEARS.map((y) => (
                          <SelectItem key={y} value={String(y)}>
                            {y}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="password" className="text-sm font-semibold text-gray-700">
                      Password
                    </label>
                    <input
                      id="password"
                      type="password"
                      placeholder="Create password"
                      className="w-full h-11 px-4 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1A2B4B] focus:border-transparent transition-all text-sm"
                      {...studentForm.register("password")}
                    />
                  </div>

                  <Button
                    type="submit"
                    className="h-11 w-full rounded-xl text-sm font-bold bg-[#1A2B4B] hover:bg-[#0F1A2E] transition-all mt-5"
                    disabled={isSubmitting}
                  >
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create student account
                  </Button>
                </form>
              ) : (
                <form
                  onSubmit={companyForm.handleSubmit(onSubmitCompany)}
                  className="space-y-3.5"
                >
                  <div className="space-y-1.5">
                    <label htmlFor="companyName" className="text-sm font-semibold text-gray-700">
                      Company name
                    </label>
                    <input
                      id="companyName"
                      placeholder="Enter company name"
                      className="w-full h-11 px-4 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1A2B4B] focus:border-transparent transition-all text-sm"
                      {...companyForm.register("companyName")}
                    />
                    {companyForm.formState.errors.companyName && (
                      <p className="text-xs text-red-500">
                        {companyForm.formState.errors.companyName.message as string}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-gray-700">
                      Industry
                    </label>
                    <Select
                      value={industry}
                      onValueChange={(v) => {
                        setIndustry(v);
                        companyForm.setValue("industry", v);
                      }}
                    >
                      <SelectTrigger className="h-11 rounded-xl border-gray-200 focus:ring-2 focus:ring-[#1A2B4B]">
                        <SelectValue placeholder="Select industry" />
                      </SelectTrigger>
                      <SelectContent>
                        {INDUSTRY_OPTIONS.map((ind) => (
                          <SelectItem key={ind} value={ind}>
                            {ind}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {companyForm.formState.errors.industry && (
                      <p className="text-xs text-red-500">
                        {companyForm.formState.errors.industry.message as string}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="companyEmail" className="text-sm font-semibold text-gray-700">
                      Email
                    </label>
                    <input
                      id="companyEmail"
                      type="email"
                      placeholder="Enter company email"
                      className="w-full h-11 px-4 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1A2B4B] focus:border-transparent transition-all text-sm"
                      {...companyForm.register("email")}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="companyPassword" className="text-sm font-semibold text-gray-700">
                      Password
                    </label>
                    <input
                      id="companyPassword"
                      type="password"
                      placeholder="Create password"
                      className="w-full h-11 px-4 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1A2B4B] focus:border-transparent transition-all text-sm"
                      {...companyForm.register("password")}
                    />
                  </div>

                  <Button
                    type="submit"
                    className="h-11 w-full rounded-xl text-sm font-bold bg-[#1A2B4B] hover:bg-[#0F1A2E] transition-all mt-5"
                    disabled={isSubmitting}
                  >
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create company account
                  </Button>
                </form>
              )}

              <p className="mt-6 text-center text-sm text-gray-600">
                Already have an account?{" "}
                <Link href="/login" className="font-bold text-[#1A2B4B] hover:text-[#0F1A2E] transition-colors">
                  Log in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterForm />
    </Suspense>
  );
}
