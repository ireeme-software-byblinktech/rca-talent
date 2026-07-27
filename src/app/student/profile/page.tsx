"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { Loader2, Plus, Upload, X, FileText, ExternalLink, User } from "lucide-react";
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
import { filesApi } from "@/lib/api/files";
import { debugProfile } from "@/lib/debug/profile-debug";
import { useAuth } from "@/lib/auth/context";
import { useToast } from "@/hooks/use-toast";
import { COHORT_YEARS, SKILL_OPTIONS } from "@/lib/mock/data";
import type { Availability } from "@/types";

const MAX_CUSTOM_SKILL_LENGTH = 40;

function normalizeSkillName(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

function skillsEqual(a: string, b: string): boolean {
  return a.toLowerCase() === b.toLowerCase();
}

type ProfileForm = {
  fullName: string;
  bio: string;
  github: string;
  linkedin: string;
  portfolio: string;
  cohortYear: number;
};

const defaultCohortYear = COHORT_YEARS[COHORT_YEARS.length - 1];

function isValidHttpUrl(value: string): boolean {
  if (!value.trim()) return true;
  try {
    const parsed = new URL(value.trim());
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

const AVAILABILITY_OPTIONS: Availability[] = ["internship", "freelance", "full-time"];

export default function StudentProfilePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [step, setStep] = useState(1);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [customSkill, setCustomSkill] = useState("");
  const [availability, setAvailability] = useState<Availability[]>([]);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | undefined>();
  const [cvUrl, setCvUrl] = useState<string | undefined>();
  const [photoPreview, setPhotoPreview] = useState<string | undefined>();
  const [photoPreviewError, setPhotoPreviewError] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const cvInputRef = useRef<HTMLInputElement>(null);

  const { data: profile, isLoading } = useQuery({
    queryKey: ["student-profile", user?.id],
    queryFn: () => studentsApi.getProfile(user!.id),
    enabled: !!user,
  });

  const { data: catalogSkills = SKILL_OPTIONS } = useQuery({
    queryKey: ["available-skills"],
    queryFn: () => studentsApi.getAvailableSkills(),
    staleTime: 5 * 60 * 1000,
  });

  const skillOptions = useMemo(() => {
    const merged = new Map<string, string>();
    for (const skill of [...catalogSkills, ...SKILL_OPTIONS, ...selectedSkills]) {
      const normalized = normalizeSkillName(skill);
      if (!normalized) continue;
      const key = normalized.toLowerCase();
      if (!merged.has(key)) merged.set(key, normalized);
    }
    return Array.from(merged.values()).sort((a, b) => a.localeCompare(b));
  }, [catalogSkills, selectedSkills]);

  const listedSkills = useMemo(() => {
    const merged = new Map<string, string>();
    for (const skill of [...catalogSkills, ...SKILL_OPTIONS]) {
      const normalized = normalizeSkillName(skill);
      if (!normalized) continue;
      const key = normalized.toLowerCase();
      if (!merged.has(key)) merged.set(key, normalized);
    }
    return merged;
  }, [catalogSkills]);

  const form = useForm<ProfileForm>({
    values: profile
      ? {
          fullName: profile.fullName,
          bio: profile.bio,
          github: profile.links.github ?? "",
          linkedin: profile.links.linkedin ?? "",
          portfolio: profile.links.portfolio ?? "",
          cohortYear:
            profile.cohortYear >= 2020 ? profile.cohortYear : defaultCohortYear,
        }
      : undefined,
  });

  useEffect(() => {
    if (profile) {
      setSelectedSkills(profile.skills);
      setAvailability(profile.availability);
      setPhotoUrl(profile.photoUrl);
      setPhotoPreview(profile.photoUrl);
      setPhotoPreviewError(false);
      setCvUrl(profile.cvUrl);
      if (!profile.cohortYear || profile.cohortYear < 2020) {
        form.setValue("cohortYear", defaultCohortYear);
      }
    }
  }, [profile, form]);

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

  const buildPayload = (data: ProfileForm) => ({
    fullName: data.fullName.trim(),
    bio: data.bio.trim(),
    skills: selectedSkills,
    links: {
      github: data.github.trim(),
      linkedin: data.linkedin.trim(),
      portfolio: data.portfolio.trim(),
    },
    cohortYear: Number(data.cohortYear) || defaultCohortYear,
    availability,
    photoUrl,
    cvUrl,
  });

  const validateAndSave = () => {
    const data = form.getValues();

    if (!data.fullName?.trim() || data.fullName.trim().length < 2) {
      toast({
        variant: "destructive",
        title: "Could not save",
        description: "Enter your full name on step 1.",
      });
      setStep(1);
      return;
    }

    if (!data.bio?.trim()) {
      toast({
        variant: "destructive",
        title: "Could not save",
        description: "Enter your bio on step 1.",
      });
      setStep(1);
      return;
    }

    const linkChecks = [
      ["GitHub", data.github],
      ["LinkedIn", data.linkedin],
      ["Portfolio", data.portfolio],
    ] as const;

    for (const [label, url] of linkChecks) {
      if (!isValidHttpUrl(url)) {
        toast({
          variant: "destructive",
          title: "Could not save",
          description: `${label} must be a valid http(s) URL or left empty.`,
        });
        setStep(2);
        return;
      }
    }

    const payload = buildPayload(data);
    debugProfile("profile page save", payload);
    updateMutation.mutate(payload);
  };

  const handleFileUpload = async (type: "photo" | "cv", file: File) => {
    const localPreview = type === "photo" ? URL.createObjectURL(file) : undefined;
    if (localPreview) {
      setPhotoPreview(localPreview);
      setPhotoPreviewError(false);
    }

    setUploadProgress(10);
    try {
      const uploaded =
        type === "photo"
          ? await filesApi.uploadProfilePhoto(file)
          : await filesApi.uploadResume(file);
      setUploadProgress(100);
      const uploadedUrl = uploaded.url;
      if (type === "photo") {
        setPhotoUrl(uploadedUrl);
        setPhotoPreview(uploadedUrl);
        setPhotoPreviewError(false);
      } else {
        setCvUrl(uploadedUrl);
      }
      await updateMutation.mutateAsync(
        type === "photo"
          ? { photoUrl: uploadedUrl }
          : { cvUrl: uploadedUrl }
      );
      toast({
        title: "Upload complete",
        description: `${type === "photo" ? "Profile photo" : "CV"} saved to your profile.`,
      });
    } catch (err) {
      if (localPreview) {
        URL.revokeObjectURL(localPreview);
        setPhotoPreview(photoUrl);
      }
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: err instanceof Error ? err.message : "Could not upload file",
      });
    } finally {
      setUploadProgress(null);
    }
  };

  const onPhotoSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) void handleFileUpload("photo", file);
    event.target.value = "";
  };

  const onCvSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) void handleFileUpload("cv", file);
    event.target.value = "";
  };

  const toggleSkill = (skill: string) => {
    const normalized = normalizeSkillName(skill);
    if (!normalized) return;
    setSelectedSkills((prev) => {
      const exists = prev.some((s) => skillsEqual(s, normalized));
      return exists
        ? prev.filter((s) => !skillsEqual(s, normalized))
        : [...prev, normalized];
    });
  };

  const addCustomSkill = () => {
    const normalized = normalizeSkillName(customSkill);
    if (!normalized) {
      toast({
        variant: "destructive",
        title: "Enter a skill name",
      });
      return;
    }
    if (normalized.length > MAX_CUSTOM_SKILL_LENGTH) {
      toast({
        variant: "destructive",
        title: "Skill name too long",
        description: `Keep it under ${MAX_CUSTOM_SKILL_LENGTH} characters.`,
      });
      return;
    }

    const listedMatch = listedSkills.get(normalized.toLowerCase());
    if (listedMatch) {
      if (selectedSkills.some((s) => skillsEqual(s, listedMatch))) {
        toast({
          title: "Already selected",
          description: `"${listedMatch}" is already in your skills.`,
        });
      } else {
        setSelectedSkills((prev) => [...prev, listedMatch]);
        toast({
          title: "Skill already listed",
          description: `"${listedMatch}" is already on the list, so it was selected for you.`,
        });
      }
      setCustomSkill("");
      return;
    }

    if (selectedSkills.some((s) => skillsEqual(s, normalized))) {
      toast({
        title: "Already selected",
        description: `"${normalized}" is already in your skills.`,
      });
      setCustomSkill("");
      return;
    }

    setSelectedSkills((prev) => [...prev, normalized]);
    setCustomSkill("");
  };

  const toggleAvailability = (a: Availability) => {
    setAvailability((prev) =>
      prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]
    );
  };

  if (isLoading) return <LoadingSkeleton rows={4} />;

  const totalSteps = 3;
  const cvFileName = cvUrl ? decodeURIComponent(cvUrl.split("/").pop() ?? "resume") : null;

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

      <form
        onSubmit={(event) => {
          event.preventDefault();
          validateAndSave();
        }}
      >
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
                  value={String(form.watch("cohortYear") || defaultCohortYear)}
                  onValueChange={(v) => form.setValue("cohortYear", Number(v), { shouldDirty: true })}
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
                  {skillOptions.map((skill) => {
                    const selected = selectedSkills.some((s) =>
                      skillsEqual(s, skill)
                    );
                    return (
                      <Badge
                        key={skill}
                        variant={selected ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => toggleSkill(skill)}
                      >
                        {skill}
                        {selected && <X className="ml-1 h-3 w-3" />}
                      </Badge>
                    );
                  })}
                </div>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Input
                    value={customSkill}
                    onChange={(e) => setCustomSkill(e.target.value)}
                    placeholder="Add a skill not listed…"
                    maxLength={MAX_CUSTOM_SKILL_LENGTH}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addCustomSkill();
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-full shrink-0"
                    onClick={addCustomSkill}
                  >
                    <Plus className="mr-1.5 h-4 w-4" />
                    Add skill
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  {selectedSkills.length} selected — click Save profile to keep your skills.
                  You can add skills that aren&apos;t in the list.
                </p>
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
              <CardTitle>
                Photo & CV{" "}
                <span className="text-sm font-normal text-muted-foreground">(optional)</span>
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Add a profile photo and resume when you have them — you can skip this step and save without them.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border border-dashed p-6 text-center">
                {photoPreview && !photoPreviewError ? (
                  <div className="mx-auto mb-4 flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border bg-muted">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={photoPreview}
                      alt="Profile photo preview"
                      className="h-full w-full object-cover"
                      onError={() => setPhotoPreviewError(true)}
                    />
                  </div>
                ) : photoUrl || photoPreview ? (
                  <div className="mx-auto mb-4 flex h-28 w-28 items-center justify-center rounded-full border bg-muted text-muted-foreground">
                    <User className="h-10 w-10" />
                  </div>
                ) : (
                  <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
                )}
                <p className="mt-2 text-sm font-medium">Profile photo</p>
                <p className="text-xs text-muted-foreground">JPG, PNG, or WEBP up to 2MB</p>
                {photoUrl && (
                  <p className="mt-2 text-xs text-brand">✓ Photo uploaded</p>
                )}
                <input
                  ref={photoInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={onPhotoSelected}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-3"
                  onClick={() => photoInputRef.current?.click()}
                  disabled={uploadProgress !== null || updateMutation.isPending}
                >
                  Upload photo
                </Button>
              </div>
              <div className="rounded-lg border border-dashed p-6 text-center">
                {cvUrl ? (
                  <div className="mx-auto mb-4 flex max-w-xs items-center gap-3 rounded-lg border bg-muted/40 px-4 py-3 text-left">
                    <FileText className="h-8 w-8 shrink-0 text-primary" />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{cvFileName}</p>
                      <a
                        href={cvUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-1 inline-flex items-center gap-1 text-xs text-primary hover:underline"
                      >
                        View uploaded CV
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </div>
                ) : (
                  <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
                )}
                <p className="mt-2 text-sm font-medium">CV / Resume</p>
                <p className="text-xs text-muted-foreground">PDF, DOC, or DOCX up to 5MB</p>
                {cvUrl && (
                  <p className="mt-2 text-xs text-brand">✓ CV uploaded</p>
                )}
                <input
                  ref={cvInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  className="hidden"
                  onChange={onCvSelected}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-3"
                  onClick={() => cvInputRef.current?.click()}
                  disabled={uploadProgress !== null || updateMutation.isPending}
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
              <>
                <Button
                  type="submit"
                  variant="secondary"
                  disabled={updateMutation.isPending}
                >
                  {updateMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Save profile
                </Button>
                <Button type="button" onClick={() => setStep((s) => s + 1)}>
                  Next (optional uploads)
                </Button>
              </>
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
