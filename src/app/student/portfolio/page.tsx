"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Award,
  Copy,
  ExternalLink,
  Eye,
  EyeOff,
  FolderKanban,
  Globe,
  Layout,
  Loader2,
  Palette,
  Share2,
  Sparkles,
  Trophy,
  Upload,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PublicPortfolioView } from "@/components/shared/PublicPortfolioView";
import { PageHeader } from "@/components/shared/PageHeader";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { ProjectFormDialog } from "@/components/shared/ProjectFormDialog";
import { CertificationFormDialog } from "@/components/shared/CertificationFormDialog";
import { AchievementFormDialog } from "@/components/shared/AchievementFormDialog";
import { ReorderList } from "@/components/portfolio/ReorderList";
import { SectionSaveBar } from "@/components/portfolio/SectionSaveBar";
import { portfolioApi } from "@/lib/api/portfolio";
import { studentsApi } from "@/lib/api/students";
import { certificationsApi } from "@/lib/api/certifications";
import { useAuth } from "@/lib/auth/context";
import { useToast } from "@/hooks/use-toast";
import { cn, orderByIds } from "@/lib/utils";
import { COHORT_YEARS, SKILL_OPTIONS } from "@/lib/mock/data";
import type {
  Achievement,
  Availability,
  Certification,
  PortfolioSections,
  PortfolioTheme,
  Project,
  PublicPortfolio,
  StudentProfile,
} from "@/types";

const SECTION_LABELS: Record<keyof PortfolioSections, string> = {
  about: "About",
  skills: "Skills",
  projects: "Projects",
  certifications: "Certifications",
  achievements: "Achievements",
};

const THEMES: { id: PortfolioTheme; label: string; preview: string }[] = [
  { id: "modern", label: "Modern", preview: "from-primary to-accent" },
  { id: "classic", label: "Classic", preview: "from-slate-100 to-white" },
  { id: "minimal", label: "Minimal", preview: "from-muted to-background" },
];

const AVAILABILITY_OPTIONS: Availability[] = ["internship", "freelance", "full-time"];

type EditorTab = "layout" | "profile" | "projects" | "credentials";
type EditSection = "hero" | keyof PortfolioSections;

type ProfileDraft = {
  fullName: string;
  bio: string;
  skills: string[];
  availability: Availability[];
  links: StudentProfile["links"];
  cohortYear: number;
  photoUrl?: string;
  cvUrl?: string;
};

function mergeOrder(existing: string[], allIds: string[]): string[] {
  const kept = existing.filter((id) => allIds.includes(id));
  const missing = allIds.filter((id) => !kept.includes(id));
  return [...kept, ...missing];
}

export default function StudentPortfolioPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [editorTab, setEditorTab] = useState<EditorTab>("layout");
  const [slug, setSlug] = useState("");
  const [tagline, setTagline] = useState("");
  const [theme, setTheme] = useState<PortfolioTheme>("modern");
  const [sections, setSections] = useState<PortfolioSections>({
    about: true,
    skills: true,
    projects: true,
    certifications: true,
    achievements: true,
  });
  const [projectOrder, setProjectOrder] = useState<string[]>([]);
  const [certificationOrder, setCertificationOrder] = useState<string[]>([]);
  const [achievementOrder, setAchievementOrder] = useState<string[]>([]);
  const [isPublished, setIsPublished] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  const [layoutDirty, setLayoutDirty] = useState(false);

  const [profileDraft, setProfileDraft] = useState<ProfileDraft | null>(null);
  const [profileDirty, setProfileDirty] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  const [projectDialogOpen, setProjectDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | undefined>();
  const [certDialogOpen, setCertDialogOpen] = useState(false);
  const [editingCert, setEditingCert] = useState<Certification | null>(null);
  const [achDialogOpen, setAchDialogOpen] = useState(false);
  const [editingAch, setEditingAch] = useState<Achievement | null>(null);

  const { data: config, isLoading: configLoading } = useQuery({
    queryKey: ["portfolio-config", user?.id],
    queryFn: () => portfolioApi.getConfig(user!.id),
    enabled: !!user,
  });

  const { data: profile } = useQuery({
    queryKey: ["student-profile", user?.id],
    queryFn: () => studentsApi.getProfile(user!.id),
    enabled: !!user,
  });

  const { data: projects = [] } = useQuery({
    queryKey: ["student-projects", user?.id],
    queryFn: () => studentsApi.getProjects(user!.id),
    enabled: !!user,
  });

  const { data: certifications = [] } = useQuery({
    queryKey: ["student-certifications", user?.id],
    queryFn: () => certificationsApi.getForStudent(user!.id),
    enabled: !!user,
  });

  const { data: achievements = [] } = useQuery({
    queryKey: ["student-achievements", user?.id],
    queryFn: () => certificationsApi.getAchievements(user!.id),
    enabled: !!user,
  });

  const markLayoutDirty = useCallback(() => setLayoutDirty(true), []);

  useEffect(() => {
    if (!config || layoutDirty) return;
    setSlug(config.slug);
    setTagline(config.tagline);
    setTheme(config.theme);
    setSections(config.sections);
    setProjectOrder(
      config.projectOrder.length ? config.projectOrder : projects.map((p) => p.id)
    );
    setCertificationOrder(
      config.certificationOrder?.length
        ? config.certificationOrder
        : certifications.map((c) => c.id)
    );
    setAchievementOrder(
      config.achievementOrder?.length
        ? config.achievementOrder
        : achievements.map((a) => a.id)
    );
    setIsPublished(config.isPublished);
  }, [config, layoutDirty, projects, certifications, achievements]);

  useEffect(() => {
    if (layoutDirty) {
      setProjectOrder((prev) => mergeOrder(prev, projects.map((p) => p.id)));
      setCertificationOrder((prev) => mergeOrder(prev, certifications.map((c) => c.id)));
      setAchievementOrder((prev) => mergeOrder(prev, achievements.map((a) => a.id)));
    }
  }, [projects, certifications, achievements, layoutDirty]);

  useEffect(() => {
    if (!profile || profileDirty) return;
    setProfileDraft({
      fullName: profile.fullName,
      bio: profile.bio,
      skills: [...profile.skills],
      availability: [...profile.availability],
      links: { ...profile.links },
      cohortYear: profile.cohortYear,
      photoUrl: profile.photoUrl,
      cvUrl: profile.cvUrl,
    });
  }, [profile, profileDirty]);

  const updateProfileField = <K extends keyof ProfileDraft>(
    key: K,
    value: ProfileDraft[K]
  ) => {
    setProfileDraft((prev) => (prev ? { ...prev, [key]: value } : prev));
    setProfileDirty(true);
  };

  const buildLayoutPayload = useCallback(
    () => ({
      slug,
      tagline,
      theme,
      sections,
      projectOrder: mergeOrder(projectOrder, projects.map((p) => p.id)),
      certificationOrder: mergeOrder(certificationOrder, certifications.map((c) => c.id)),
      achievementOrder: mergeOrder(achievementOrder, achievements.map((a) => a.id)),
      isPublished,
    }),
    [
      slug,
      tagline,
      theme,
      sections,
      projectOrder,
      certificationOrder,
      achievementOrder,
      isPublished,
      projects,
      certifications,
      achievements,
    ]
  );

  const saveLayoutMutation = useMutation({
    mutationFn: () => portfolioApi.updateConfig(user!.id, buildLayoutPayload()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["portfolio-config"] });
      queryClient.invalidateQueries({ queryKey: ["public-portfolio"] });
      setLayoutDirty(false);
      toast({ title: "Layout saved" });
    },
    onError: (err) => {
      toast({
        variant: "destructive",
        title: "Could not save layout",
        description: err instanceof Error ? err.message : "Try again",
      });
    },
  });

  const saveProfileMutation = useMutation({
    mutationFn: () => {
      if (!profileDraft) throw new Error("No profile data");
      return studentsApi.updateProfile(user!.id, {
        fullName: profileDraft.fullName,
        bio: profileDraft.bio,
        skills: profileDraft.skills,
        availability: profileDraft.availability,
        links: profileDraft.links,
        cohortYear: profileDraft.cohortYear,
        photoUrl: profileDraft.photoUrl,
        cvUrl: profileDraft.cvUrl,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["student-profile"] });
      queryClient.invalidateQueries({ queryKey: ["public-portfolio"] });
      setProfileDirty(false);
      toast({ title: "Profile saved" });
    },
    onError: (err) => {
      toast({
        variant: "destructive",
        title: "Could not save profile",
        description: err instanceof Error ? err.message : "Try again",
      });
    },
  });

  const saveAllMutation = useMutation({
    mutationFn: async () => {
      if (profileDirty && profileDraft) {
        await studentsApi.updateProfile(user!.id, {
          fullName: profileDraft.fullName,
          bio: profileDraft.bio,
          skills: profileDraft.skills,
          availability: profileDraft.availability,
          links: profileDraft.links,
          cohortYear: profileDraft.cohortYear,
          photoUrl: profileDraft.photoUrl,
          cvUrl: profileDraft.cvUrl,
        });
      }
      return portfolioApi.updateConfig(user!.id, buildLayoutPayload());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["portfolio-config"] });
      queryClient.invalidateQueries({ queryKey: ["student-profile"] });
      queryClient.invalidateQueries({ queryKey: ["public-portfolio"] });
      setLayoutDirty(false);
      setProfileDirty(false);
      toast({ title: "Portfolio saved", description: "All sections updated." });
    },
    onError: (err) => {
      toast({
        variant: "destructive",
        title: "Could not save",
        description: err instanceof Error ? err.message : "Try again",
      });
    },
  });

  const deleteProject = useMutation({
    mutationFn: (id: string) => studentsApi.deleteProject(user!.id, id),
    onSuccess: (_, id) => {
      setProjectOrder((prev) => prev.filter((pid) => pid !== id));
      markLayoutDirty();
      queryClient.invalidateQueries({ queryKey: ["student-projects"] });
      toast({ title: "Project removed" });
    },
  });

  const deleteCert = useMutation({
    mutationFn: (id: string) => certificationsApi.delete(user!.id, id),
    onSuccess: (_, id) => {
      setCertificationOrder((prev) => prev.filter((cid) => cid !== id));
      markLayoutDirty();
      queryClient.invalidateQueries({ queryKey: ["student-certifications"] });
      toast({ title: "Certification removed" });
    },
  });

  const deleteAch = useMutation({
    mutationFn: (id: string) => certificationsApi.deleteAchievement(user!.id, id),
    onSuccess: (_, id) => {
      setAchievementOrder((prev) => prev.filter((aid) => aid !== id));
      markLayoutDirty();
      queryClient.invalidateQueries({ queryKey: ["student-achievements"] });
      toast({ title: "Achievement removed" });
    },
  });

  const mockUpload = (type: "photo" | "cv") => {
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress((p) => {
        if (p === null || p >= 100) {
          clearInterval(interval);
          setUploadProgress(null);
          if (type === "cv") {
            updateProfileField("cvUrl", `/mock/cv-${user?.id}.pdf`);
          } else {
            updateProfileField("photoUrl", `/mock/photo-${user?.id}.jpg`);
          }
          toast({ title: "Upload complete" });
          return null;
        }
        return p + 25;
      });
    }, 150);
  };

  const orderedProjects = useMemo(
    () => orderByIds(projects, projectOrder),
    [projectOrder, projects]
  );
  const orderedCerts = useMemo(
    () => orderByIds(certifications, certificationOrder),
    [certificationOrder, certifications]
  );
  const orderedAchievements = useMemo(
    () => orderByIds(achievements, achievementOrder),
    [achievementOrder, achievements]
  );

  const previewProfile: StudentProfile | null = useMemo(() => {
    if (!profile || !profileDraft) return null;
    return { ...profile, ...profileDraft };
  }, [profile, profileDraft]);

  const previewPortfolio: PublicPortfolio | null = useMemo(() => {
    if (!previewProfile || !config) return null;
    return {
      config: {
        ...config,
        ...buildLayoutPayload(),
      },
      profile: previewProfile,
      projects: orderedProjects,
      certifications: orderedCerts,
      achievements: orderedAchievements,
    };
  }, [
    previewProfile,
    config,
    buildLayoutPayload,
    orderedProjects,
    orderedCerts,
    orderedAchievements,
  ]);

  const toggleSection = (key: keyof PortfolioSections) => {
    setSections((prev) => ({ ...prev, [key]: !prev[key] }));
    markLayoutDirty();
  };

  const toggleSkill = (skill: string) => {
    const current = profileDraft?.skills ?? [];
    updateProfileField(
      "skills",
      current.includes(skill) ? current.filter((s) => s !== skill) : [...current, skill]
    );
  };

  const toggleAvailability = (item: Availability) => {
    const current = profileDraft?.availability ?? [];
    updateProfileField(
      "availability",
      current.includes(item) ? current.filter((a) => a !== item) : [...current, item]
    );
  };

  const focusSection = (section: EditSection) => {
    const tabMap: Record<EditSection, EditorTab> = {
      hero: "profile",
      about: "profile",
      skills: "profile",
      projects: "projects",
      certifications: "credentials",
      achievements: "credentials",
    };
    setEditorTab(tabMap[section]);
  };

  const copyUrl = () => {
    if (!slug) return;
    const url = `${window.location.origin}/p/${slug}`;
    navigator.clipboard.writeText(url);
    toast({ title: "Link copied", description: url });
  };

  const hasUnsaved = layoutDirty || profileDirty;
  const isSaving =
    saveAllMutation.isPending ||
    saveLayoutMutation.isPending ||
    saveProfileMutation.isPending;

  if (configLoading || !profile || !profileDraft) return <LoadingSkeleton rows={6} />;

  const publicUrl = slug ? `/p/${slug}` : null;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Portfolio Builder"
        description="Every section is editable — save each tab or save everything at once"
      >
        {publicUrl && (
          <Button variant="outline" size="sm" className="gap-1 rounded-full" onClick={copyUrl}>
            <Copy className="h-4 w-4" />
            Copy link
          </Button>
        )}
        {publicUrl && isPublished && (
          <Button variant="outline" size="sm" asChild className="gap-1 rounded-full">
            <Link href={publicUrl} target="_blank">
              <ExternalLink className="h-4 w-4" />
              View live
            </Link>
          </Button>
        )}
        <Button
          onClick={() => saveAllMutation.mutate()}
          disabled={isSaving || !slug.trim()}
          className="gap-1 rounded-full"
        >
          {saveAllMutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Share2 className="h-4 w-4" />
          )}
          Save all
          {hasUnsaved && (
            <span className="ml-1 h-2 w-2 rounded-full bg-amber-400" title="Unsaved changes" />
          )}
        </Button>
      </PageHeader>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border bg-card px-5 py-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-xl",
              isPublished ? "bg-emerald-500/10 text-emerald-600" : "bg-amber-500/10 text-amber-600"
            )}
          >
            <Globe className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-semibold text-sm">
                {isPublished ? "Portfolio is live" : "Draft mode"}
              </p>
              <Badge variant={isPublished ? "approved" : "pending"}>
                {isPublished ? "Published" : "Draft"}
              </Badge>
              {hasUnsaved && (
                <Badge variant="pending" className="text-[10px]">
                  Unsaved
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {slug ? `/p/${slug}` : "Set a URL slug to publish"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Label htmlFor="publish-toggle" className="text-sm text-muted-foreground">
            Publish
          </Label>
          <Switch
            id="publish-toggle"
            checked={isPublished}
            onCheckedChange={(v) => {
              setIsPublished(v);
              markLayoutDirty();
            }}
          />
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,440px)_1fr]">
        <div className="min-w-0">
          <Tabs value={editorTab} onValueChange={(v) => setEditorTab(v as EditorTab)}>
            <TabsList className="grid w-full grid-cols-4 h-auto p-1">
              <TabsTrigger value="layout" className="text-xs px-2 py-2 gap-1 relative">
                <Layout className="h-3.5 w-3.5" />
                Layout
                {layoutDirty && (
                  <span className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-amber-400" />
                )}
              </TabsTrigger>
              <TabsTrigger value="profile" className="text-xs px-2 py-2 gap-1 relative">
                <User className="h-3.5 w-3.5" />
                Profile
                {profileDirty && (
                  <span className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-amber-400" />
                )}
              </TabsTrigger>
              <TabsTrigger value="projects" className="text-xs px-2 py-2 gap-1 relative">
                <FolderKanban className="h-3.5 w-3.5" />
                Projects
                {layoutDirty && (
                  <span className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-amber-400" />
                )}
              </TabsTrigger>
              <TabsTrigger value="credentials" className="text-xs px-2 py-2 gap-1 relative">
                <Award className="h-3.5 w-3.5" />
                Creds
                {layoutDirty && (
                  <span className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-amber-400" />
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="layout" className="mt-4">
              <div className="fancy-card p-5 space-y-4 relative">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <Globe className="h-4 w-4 text-primary" />
                  URL & visibility
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Portfolio URL</Label>
                  <div className="mt-1.5 flex items-center overflow-hidden rounded-xl border bg-secondary/30">
                    <span className="shrink-0 border-r bg-muted/50 px-3 py-2.5 text-xs text-muted-foreground">
                      /p/
                    </span>
                    <Input
                      value={slug}
                      onChange={(e) => {
                        setSlug(
                          e.target.value
                            .toLowerCase()
                            .replace(/[^a-z0-9-]/g, "-")
                            .replace(/-+/g, "-")
                        );
                        markLayoutDirty();
                      }}
                      placeholder="your-name"
                      className="border-0 bg-transparent focus-visible:ring-0"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm font-semibold pt-2">
                  <Palette className="h-4 w-4 text-primary" />
                  Theme
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {THEMES.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => {
                        setTheme(t.id);
                        markLayoutDirty();
                      }}
                      className={cn(
                        "rounded-xl border p-2 text-center transition-all",
                        theme === t.id
                          ? "border-primary ring-2 ring-primary/20"
                          : "border-border hover:border-primary/40"
                      )}
                    >
                      <div
                        className={cn("mx-auto h-10 w-full rounded-lg bg-gradient-to-br", t.preview)}
                      />
                      <p className="mt-2 text-xs font-medium">{t.label}</p>
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2 text-sm font-semibold pt-2">
                  <Layout className="h-4 w-4 text-primary" />
                  Visible sections
                </div>
                <div className="flex flex-wrap gap-2">
                  {(Object.keys(SECTION_LABELS) as (keyof PortfolioSections)[]).map((key) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => toggleSection(key)}
                      className={cn(
                        "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                        sections[key]
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                      )}
                    >
                      {SECTION_LABELS[key]}
                    </button>
                  ))}
                </div>

                <SectionSaveBar
                  label="Save layout"
                  dirty={layoutDirty}
                  saving={saveLayoutMutation.isPending}
                  onSave={() => saveLayoutMutation.mutate()}
                />
              </div>
            </TabsContent>

            <TabsContent value="profile" className="mt-4 max-h-[calc(100vh-16rem)] overflow-y-auto pr-1 space-y-4">
              <div className="fancy-card p-5 space-y-4 relative">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <User className="h-4 w-4 text-primary" />
                  Hero section
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Display name</Label>
                  <Input
                    className="mt-1.5"
                    value={profileDraft.fullName}
                    onChange={(e) => updateProfileField("fullName", e.target.value)}
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Tagline</Label>
                  <Input
                    className="mt-1.5"
                    value={tagline}
                    onChange={(e) => {
                      setTagline(e.target.value);
                      markLayoutDirty();
                    }}
                    placeholder="Full-stack developer building for Rwanda"
                  />
                  <p className="text-[10px] text-muted-foreground mt-1">Saved with layout</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Cohort year</Label>
                  <select
                    className="mt-1.5 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={profileDraft.cohortYear}
                    onChange={(e) => updateProfileField("cohortYear", Number(e.target.value))}
                  >
                    {COHORT_YEARS.map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Profile photo URL</Label>
                  <Input
                    className="mt-1.5"
                    placeholder="https://..."
                    value={profileDraft.photoUrl ?? ""}
                    onChange={(e) => updateProfileField("photoUrl", e.target.value || undefined)}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-2 gap-1"
                    onClick={() => mockUpload("photo")}
                    disabled={uploadProgress !== null}
                  >
                    <Upload className="h-3.5 w-3.5" />
                    Upload photo
                  </Button>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">CV / resume URL</Label>
                  <Input
                    className="mt-1.5"
                    placeholder="https://... or /mock/cv.pdf"
                    value={profileDraft.cvUrl ?? ""}
                    onChange={(e) => updateProfileField("cvUrl", e.target.value || undefined)}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-2 gap-1"
                    onClick={() => mockUpload("cv")}
                    disabled={uploadProgress !== null}
                  >
                    <Upload className="h-3.5 w-3.5" />
                    Upload CV
                  </Button>
                </div>
                {uploadProgress !== null && <Progress value={uploadProgress} className="h-1.5" />}
                <div>
                  <Label className="text-sm font-semibold">Availability</Label>
                  <div className="mt-2 space-y-2">
                    {AVAILABILITY_OPTIONS.map((item) => (
                      <label key={item} className="flex items-center gap-2 text-sm capitalize">
                        <Checkbox
                          checked={profileDraft.availability.includes(item)}
                          onCheckedChange={() => toggleAvailability(item)}
                        />
                        {item}
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-semibold">Social links</Label>
                  <div className="mt-2 space-y-3">
                    <div>
                      <Label className="text-xs text-muted-foreground">GitHub</Label>
                      <Input
                        className="mt-1"
                        placeholder="https://github.com/..."
                        value={profileDraft.links.github ?? ""}
                        onChange={(e) =>
                          updateProfileField("links", {
                            ...profileDraft.links,
                            github: e.target.value || undefined,
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">LinkedIn</Label>
                      <Input
                        className="mt-1"
                        placeholder="https://linkedin.com/in/..."
                        value={profileDraft.links.linkedin ?? ""}
                        onChange={(e) =>
                          updateProfileField("links", {
                            ...profileDraft.links,
                            linkedin: e.target.value || undefined,
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Personal website</Label>
                      <Input
                        className="mt-1"
                        placeholder="https://..."
                        value={profileDraft.links.portfolio ?? ""}
                        onChange={(e) =>
                          updateProfileField("links", {
                            ...profileDraft.links,
                            portfolio: e.target.value || undefined,
                          })
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="fancy-card p-5 space-y-4 relative">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <User className="h-4 w-4 text-primary" />
                  About section
                </div>
                <Textarea
                  rows={5}
                  value={profileDraft.bio}
                  onChange={(e) => updateProfileField("bio", e.target.value)}
                  placeholder="Tell recruiters about yourself, your goals, and what you build..."
                />
              </div>

              <div className="fancy-card p-5 space-y-4 relative">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <Sparkles className="h-4 w-4 text-primary" />
                  Skills section
                </div>
                <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto">
                  {SKILL_OPTIONS.map((skill) => (
                    <Badge
                      key={skill}
                      variant={profileDraft.skills.includes(skill) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => toggleSkill(skill)}
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>
                <SectionSaveBar
                  label="Save profile"
                  dirty={profileDirty}
                  saving={saveProfileMutation.isPending}
                  onSave={() => saveProfileMutation.mutate()}
                />
              </div>
            </TabsContent>

            <TabsContent value="projects" className="mt-4">
              <div className="fancy-card p-5 space-y-3 relative">
                <p className="text-sm font-semibold flex items-center gap-2">
                  <FolderKanban className="h-4 w-4 text-primary" />
                  Projects section
                </p>
                <p className="text-xs text-muted-foreground">
                  Edit project details inline — reorder saves with layout.
                </p>
                <ReorderList
                  items={orderedProjects.map((p) => ({ id: p.id, label: p.title }))}
                  onReorder={(ids) => {
                    setProjectOrder(ids);
                    markLayoutDirty();
                  }}
                  onEdit={(id) => {
                    setEditingProject(projects.find((p) => p.id === id));
                    setProjectDialogOpen(true);
                  }}
                  onDelete={(id) => deleteProject.mutate(id)}
                  onAdd={() => {
                    setEditingProject(undefined);
                    setProjectDialogOpen(true);
                  }}
                  addLabel="Add project"
                  emptyMessage="No projects yet — add one to showcase your work."
                />
                <SectionSaveBar
                  label="Save order"
                  dirty={layoutDirty}
                  saving={saveLayoutMutation.isPending}
                  onSave={() => saveLayoutMutation.mutate()}
                />
              </div>
            </TabsContent>

            <TabsContent value="credentials" className="mt-4 space-y-4">
              <div className="fancy-card p-5 space-y-3 relative">
                <p className="text-sm font-semibold flex items-center gap-2">
                  <Award className="h-4 w-4 text-primary" />
                  Certifications section
                </p>
                <ReorderList
                  items={orderedCerts.map((c) => ({ id: c.id, label: c.title }))}
                  onReorder={(ids) => {
                    setCertificationOrder(ids);
                    markLayoutDirty();
                  }}
                  onEdit={(id) => {
                    setEditingCert(certifications.find((c) => c.id === id) ?? null);
                    setCertDialogOpen(true);
                  }}
                  onDelete={(id) => deleteCert.mutate(id)}
                  onAdd={() => {
                    setEditingCert(null);
                    setCertDialogOpen(true);
                  }}
                  addLabel="Add certification"
                  emptyMessage="No certifications yet."
                />
              </div>
              <div className="fancy-card p-5 space-y-3 relative">
                <p className="text-sm font-semibold flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-primary" />
                  Achievements section
                </p>
                <ReorderList
                  items={orderedAchievements.map((a) => ({ id: a.id, label: a.title }))}
                  onReorder={(ids) => {
                    setAchievementOrder(ids);
                    markLayoutDirty();
                  }}
                  onEdit={(id) => {
                    setEditingAch(achievements.find((a) => a.id === id) ?? null);
                    setAchDialogOpen(true);
                  }}
                  onDelete={(id) => deleteAch.mutate(id)}
                  onAdd={() => {
                    setEditingAch(null);
                    setAchDialogOpen(true);
                  }}
                  addLabel="Add achievement"
                  emptyMessage="No achievements yet."
                />
                <SectionSaveBar
                  label="Save order"
                  dirty={layoutDirty}
                  saving={saveLayoutMutation.isPending}
                  onSave={() => saveLayoutMutation.mutate()}
                />
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <div className="min-w-0">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-sm font-semibold">
              <Eye className="h-4 w-4 text-primary" />
              Live preview
              <span className="text-xs font-normal text-muted-foreground">
                — click Edit on any section
              </span>
            </h2>
            <Button
              variant="ghost"
              size="sm"
              className="gap-1 text-xs"
              onClick={() => setShowPreview((v) => !v)}
            >
              {showPreview ? (
                <>
                  <EyeOff className="h-3.5 w-3.5" /> Hide
                </>
              ) : (
                <>
                  <Eye className="h-3.5 w-3.5" /> Show
                </>
              )}
            </Button>
          </div>

          {showPreview && previewPortfolio && (
            <div className="overflow-hidden rounded-2xl border shadow-elevated">
              <div className="flex items-center gap-2 border-b bg-muted/60 px-4 py-2.5">
                <div className="flex gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-red-400/80" />
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
                </div>
                <div className="mx-auto flex-1 max-w-xs truncate rounded-md bg-background/80 px-3 py-1 text-center text-[10px] text-muted-foreground">
                  rcatalent.rw/p/{slug || "your-name"}
                </div>
              </div>
              <div className="max-h-[calc(100vh-12rem)] overflow-y-auto bg-background">
                <PublicPortfolioView
                  portfolio={previewPortfolio}
                  preview
                  onEditSection={focusSection}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <Dialog
        open={projectDialogOpen}
        onOpenChange={(open) => {
          setProjectDialogOpen(open);
          if (!open) setEditingProject(undefined);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingProject ? "Edit project" : "New project"}</DialogTitle>
          </DialogHeader>
          <ProjectFormDialog
            project={editingProject}
            onClose={() => {
              setProjectDialogOpen(false);
              setEditingProject(undefined);
            }}
            onSuccess={(created) => {
              if (created && !editingProject) {
                setProjectOrder((prev) => [...prev, created.id]);
                markLayoutDirty();
              }
              queryClient.invalidateQueries({ queryKey: ["student-projects"] });
            }}
          />
        </DialogContent>
      </Dialog>

      <Dialog
        open={certDialogOpen}
        onOpenChange={(open) => {
          setCertDialogOpen(open);
          if (!open) setEditingCert(null);
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingCert ? "Edit certification" : "Add certification"}
            </DialogTitle>
          </DialogHeader>
          <CertificationFormDialog
            certification={editingCert}
            onClose={() => {
              setCertDialogOpen(false);
              setEditingCert(null);
            }}
            onSuccess={(created) => {
              if (created && !editingCert) {
                setCertificationOrder((prev) => [...prev, created.id]);
                markLayoutDirty();
              }
            }}
          />
        </DialogContent>
      </Dialog>

      <Dialog
        open={achDialogOpen}
        onOpenChange={(open) => {
          setAchDialogOpen(open);
          if (!open) setEditingAch(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingAch ? "Edit achievement" : "Add achievement"}
            </DialogTitle>
          </DialogHeader>
          <AchievementFormDialog
            achievement={editingAch}
            onClose={() => {
              setAchDialogOpen(false);
              setEditingAch(null);
            }}
            onSuccess={(created) => {
              if (created && !editingAch) {
                setAchievementOrder((prev) => [...prev, created.id]);
                markLayoutDirty();
              }
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
