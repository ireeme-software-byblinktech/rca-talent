"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { studentsApi } from "@/lib/api/students";
import { useAuth } from "@/lib/auth/context";
import { useToast } from "@/hooks/use-toast";
import { COHORT_YEARS, SKILL_OPTIONS } from "@/lib/mock/data";
import type { Availability } from "@/types";

const profileSchema = z.object({
  fullName: z.string().min(2, "Name is required"),
  bio: z.string().min(20, "Bio must be at least 20 characters"),
  github: z.string().url().optional().or(z.literal("")),
  linkedin: z.string().url().optional().or(z.literal("")),
  portfolio: z.string().url().optional().or(z.literal("")),
  cohortYear: z.number().min(2020).max(2030),
});

type ProfileForm = z.infer<typeof profileSchema>;

const AVAILABILITY_OPTIONS: Availability[] = ["internship", "freelance", "full-time"];

export default function StudentProfilePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [step, setStep] = useState(1);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [availability, setAvailability] = useState<Availability[]>([]);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  const { data: profile, isLoading } = useQuery({
    queryKey: ["student-profile", user?.id],
    queryFn: () => studentsApi.getProfile(user!.id),
    enabled: !!user,
  });

  const form = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    values: profile
      ? {
          fullName: profile.fullName,
          bio: profile.bio,
          github: profile.links.github ?? "",
          linkedin: profile.links.linkedin ?? "",
          portfolio: profile.links.portfolio ?? "",
          cohortYear: profile.cohortYear,
        }
      : undefined,
  });

  useEffect(() => {
    if (profile) {
      setSelectedSkills(profile.skills);
      setAvailability(profile.availability);
    }
  }, [profile]);

  const updateMutation = useMutation({
    mutationFn: (data: Parameters<typeof studentsApi.updateProfile>[1]) =>
      studentsApi.updateProfile(user!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["student-profile"] });
      toast({ title: "Profile saved", description: "Your changes have been saved." });
    },
    onError: (err) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to save",
      });
    },
  });

  const resubmitMutation = useMutation({
    mutationFn: () => studentsApi.resubmitForVerification(user!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["student-profile"] });
      toast({ title: "Resubmitted", description: "Your profile is back in the verification queue." });
    },
  });

  const onSubmit = (data: ProfileForm) => {
    updateMutation.mutate({
      fullName: data.fullName,
      bio: data.bio,
      skills: selectedSkills,
      links: {
        github: data.github || undefined,
        linkedin: data.linkedin || undefined,
        portfolio: data.portfolio || undefined,
      },
      cohortYear: data.cohortYear,
      availability,
    });
  };

  const mockUpload = (type: "photo" | "cv") => {
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress((p) => {
        if (p === null || p >= 100) {
          clearInterval(interval);
          setUploadProgress(null);
          toast({ title: "Upload complete", description: `Mock ${type} upload successful.` });
          if (type === "cv") {
            updateMutation.mutate({ cvUrl: `/mock/cv-${user?.id}.pdf` });
          } else {
            updateMutation.mutate({ photoUrl: `/mock/photo-${user?.id}.jpg` });
          }
          return null;
        }
        return p + 20;
      });
    }, 200);
  };

  const toggleSkill = (skill: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const toggleAvailability = (a: Availability) => {
    setAvailability((prev) =>
      prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]
    );
  };

  if (isLoading) return <LoadingSkeleton rows={4} />;

  const totalSteps = 3;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Profile Builder</h1>
        <p className="text-muted-foreground">
          Complete your profile to get verified and discovered by employers
        </p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <div key={i} className="flex flex-1 items-center gap-2">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                step > i + 1
                  ? "bg-primary text-primary-foreground"
                  : step === i + 1
                    ? "border-2 border-primary text-primary"
                    : "border text-muted-foreground"
              }`}
            >
              {i + 1}
            </div>
            {i < totalSteps - 1 && (
              <div className={`h-0.5 flex-1 ${step > i + 1 ? "bg-primary" : "bg-border"}`} />
            )}
          </div>
        ))}
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)}>
        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Basic information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full name</Label>
                <Input id="fullName" {...form.register("fullName")} />
                {form.formState.errors.fullName && (
                  <p className="text-sm text-destructive">{form.formState.errors.fullName.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea id="bio" rows={4} {...form.register("bio")} placeholder="Tell employers about yourself..." />
                {form.formState.errors.bio && (
                  <p className="text-sm text-destructive">{form.formState.errors.bio.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Cohort year</Label>
                <Select
                  value={String(form.watch("cohortYear"))}
                  onValueChange={(v) => form.setValue("cohortYear", Number(v))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {COHORT_YEARS.map((y) => (
                      <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Availability</Label>
                <div className="flex flex-wrap gap-3">
                  {AVAILABILITY_OPTIONS.map((a) => (
                    <label key={a} className="flex items-center gap-2 cursor-pointer">
                      <Checkbox
                        checked={availability.includes(a)}
                        onCheckedChange={() => toggleAvailability(a)}
                      />
                      <span className="text-sm capitalize">{a}</span>
                    </label>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>Skills & links</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Skills (select at least 3)</Label>
                <div className="flex flex-wrap gap-2">
                  {SKILL_OPTIONS.map((skill) => (
                    <Badge
                      key={skill}
                      variant={selectedSkills.includes(skill) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => toggleSkill(skill)}
                    >
                      {skill}
                      {selectedSkills.includes(skill) && (
                        <X className="ml-1 h-3 w-3" />
                      )}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="github">GitHub</Label>
                <Input id="github" placeholder="https://github.com/..." {...form.register("github")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="linkedin">LinkedIn</Label>
                <Input id="linkedin" placeholder="https://linkedin.com/in/..." {...form.register("linkedin")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="portfolio">Portfolio</Label>
                <Input id="portfolio" placeholder="https://..." {...form.register("portfolio")} />
              </div>
            </CardContent>
          </Card>
        )}

        {step === 3 && (
          <Card>
            <CardHeader>
              <CardTitle>Photo & CV</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border border-dashed p-6 text-center">
                <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
                <p className="mt-2 text-sm font-medium">Profile photo</p>
                <p className="text-xs text-muted-foreground">Mock upload — JPG or PNG</p>
                {profile?.photoUrl && (
                  <p className="mt-2 text-xs text-brand">✓ Photo uploaded</p>
                )}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-3"
                  onClick={() => mockUpload("photo")}
                  disabled={uploadProgress !== null}
                >
                  Upload photo
                </Button>
              </div>
              <div className="rounded-lg border border-dashed p-6 text-center">
                <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
                <p className="mt-2 text-sm font-medium">CV / Resume</p>
                <p className="text-xs text-muted-foreground">Mock upload — PDF</p>
                {profile?.cvUrl && (
                  <p className="mt-2 text-xs text-brand">✓ CV uploaded</p>
                )}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-3"
                  onClick={() => mockUpload("cv")}
                  disabled={uploadProgress !== null}
                >
                  Upload CV
                </Button>
              </div>
              {uploadProgress !== null && (
                <Progress value={uploadProgress} />
              )}
            </CardContent>
          </Card>
        )}

        <div className="flex justify-between pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => setStep((s) => s - 1)}
            disabled={step === 1}
          >
            Back
          </Button>
          <div className="flex gap-2">
            {profile?.verificationStatus === "rejected" && step === totalSteps && (
              <Button
                type="button"
                variant="secondary"
                onClick={() => resubmitMutation.mutate()}
                disabled={resubmitMutation.isPending}
              >
                Resubmit for verification
              </Button>
            )}
            {step < totalSteps ? (
              <Button type="button" onClick={() => setStep((s) => s + 1)}>
                Next
              </Button>
            ) : (
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Save profile
              </Button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
