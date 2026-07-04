"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { companiesApi } from "@/lib/api/companies";
import { useAuth } from "@/lib/auth/context";
import { useToast } from "@/hooks/use-toast";
import { INDUSTRY_OPTIONS } from "@/lib/mock/data";

const schema = z.object({
  companyName: z.string().min(2),
  description: z.string().min(20),
  industry: z.string().min(1),
  website: z.string().url().optional().or(z.literal("")),
});

type FormData = z.infer<typeof schema>;

export default function CompanyProfilePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: profile, isLoading } = useQuery({
    queryKey: ["company-profile", user?.id],
    queryFn: () => companiesApi.getProfile(user!.id),
    enabled: !!user,
  });

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    values: profile
      ? {
          companyName: profile.companyName,
          description: profile.description,
          industry: profile.industry,
          website: profile.website ?? "",
        }
      : undefined,
  });

  const mutation = useMutation({
    mutationFn: (data: FormData) =>
      companiesApi.updateProfile(user!.id, {
        companyName: data.companyName,
        description: data.description,
        industry: data.industry,
        website: data.website || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["company-profile"] });
      toast({ title: "Profile saved" });
    },
  });

  if (isLoading) return <LoadingSkeleton rows={3} />;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Company Profile</h1>
        <p className="text-muted-foreground">
          Set up your company profile for students to see
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Company information</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={form.handleSubmit((d) => mutation.mutate(d))}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label>Company name</Label>
              <Input {...form.register("companyName")} />
            </div>
            <div className="space-y-2">
              <Label>Industry</Label>
              <Select
                value={form.watch("industry")}
                onValueChange={(v) => form.setValue("industry", v)}
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
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                rows={4}
                {...form.register("description")}
                placeholder="Tell students about your company..."
              />
            </div>
            <div className="space-y-2">
              <Label>Website</Label>
              <Input
                placeholder="https://..."
                {...form.register("website")}
              />
            </div>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Save profile
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
