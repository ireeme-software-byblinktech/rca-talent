"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PublicFooter, PublicHeader } from "@/components/shared/PublicLayout";
import { useAuth } from "@/lib/auth/context";
import { useToast } from "@/hooks/use-toast";
import { COHORT_YEARS, INDUSTRY_OPTIONS } from "@/lib/mock/data";

const baseSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
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
    <div className="flex min-h-screen flex-col">
      <PublicHeader />
      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Create your account</CardTitle>
            <CardDescription>
              Join the RCA Talent marketplace
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs
              value={role}
              onValueChange={(v) => setRole(v as "student" | "company")}
              className="mb-6"
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="student">Student</TabsTrigger>
                <TabsTrigger value="company">Company</TabsTrigger>
              </TabsList>
            </Tabs>

            {role === "student" ? (
              <form
                onSubmit={studentForm.handleSubmit(onSubmitStudent)}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full name</Label>
                  <Input id="fullName" {...studentForm.register("fullName")} />
                  {studentForm.formState.errors.fullName && (
                    <p className="text-sm text-destructive">
                      {studentForm.formState.errors.fullName.message as string}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" {...studentForm.register("email")} />
                  {studentForm.formState.errors.email && (
                    <p className="text-sm text-destructive">
                      {studentForm.formState.errors.email.message as string}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Cohort year</Label>
                  <Select
                    value={cohortYear}
                    onValueChange={(v) => {
                      setCohortYear(v);
                      studentForm.setValue("cohortYear", Number(v));
                    }}
                  >
                    <SelectTrigger>
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
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" type="password" {...studentForm.register("password")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm password</Label>
                  <Input id="confirmPassword" type="password" {...studentForm.register("confirmPassword")} />
                  {studentForm.formState.errors.confirmPassword && (
                    <p className="text-sm text-destructive">
                      {studentForm.formState.errors.confirmPassword.message as string}
                    </p>
                  )}
                </div>
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create student account
                </Button>
              </form>
            ) : (
              <form
                onSubmit={companyForm.handleSubmit(onSubmitCompany)}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company name</Label>
                  <Input id="companyName" {...companyForm.register("companyName")} />
                  {companyForm.formState.errors.companyName && (
                    <p className="text-sm text-destructive">
                      {companyForm.formState.errors.companyName.message as string}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Industry</Label>
                  <Select
                    value={industry}
                    onValueChange={(v) => {
                      setIndustry(v);
                      companyForm.setValue("industry", v);
                    }}
                  >
                    <SelectTrigger>
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
                    <p className="text-sm text-destructive">
                      {companyForm.formState.errors.industry.message as string}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companyEmail">Email</Label>
                  <Input id="companyEmail" type="email" {...companyForm.register("email")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companyPassword">Password</Label>
                  <Input id="companyPassword" type="password" {...companyForm.register("password")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companyConfirmPassword">Confirm password</Label>
                  <Input id="companyConfirmPassword" type="password" {...companyForm.register("confirmPassword")} />
                </div>
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create company account
                </Button>
              </form>
            )}

            <p className="mt-6 text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="text-brand hover:underline font-medium">
                Log in
              </Link>
            </p>
          </CardContent>
        </Card>
      </main>
      <PublicFooter />
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
