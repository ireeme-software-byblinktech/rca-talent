"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Award, ImageIcon, Loader2, Plus, Trophy, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmptyState } from "@/components/shared/EmptyState";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { PageHeader } from "@/components/shared/PageHeader";
import { AchievementCard, CertificationCard } from "@/components/shared/CredentialCard";
import { certificationsApi } from "@/lib/api/certifications";
import { useAuth } from "@/lib/auth/context";
import { useToast } from "@/hooks/use-toast";
import type { Achievement, Certification } from "@/types";

const MOCK_CERT_IMAGES = [
  "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=400&q=80",
  "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&q=80",
  "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=400&q=80",
];

const certSchema = z.object({
  title: z.string().min(2),
  issuer: z.string().min(2),
  issueDate: z.string().min(1),
  credentialUrl: z.string().url().optional().or(z.literal("")),
  imageUrl: z.string().url().optional().or(z.literal("")),
});

const achSchema = z.object({
  title: z.string().min(2),
  description: z.string().min(10),
  date: z.string().min(1),
});

type CertForm = z.infer<typeof certSchema>;
type AchForm = z.infer<typeof achSchema>;

function invalidatePortfolioQueries(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: ["student-certifications"] });
  queryClient.invalidateQueries({ queryKey: ["public-portfolio"] });
  queryClient.invalidateQueries({ queryKey: ["portfolio-config"] });
}

export default function StudentCertificationsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [certDialogOpen, setCertDialogOpen] = useState(false);
  const [achDialogOpen, setAchDialogOpen] = useState(false);
  const [editingCert, setEditingCert] = useState<Certification | null>(null);
  const [editingAch, setEditingAch] = useState<Achievement | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const { data: certs = [], isLoading: certsLoading } = useQuery({
    queryKey: ["student-certifications", user?.id],
    queryFn: () => certificationsApi.getForStudent(user!.id),
    enabled: !!user,
  });

  const { data: achievements = [], isLoading: achLoading } = useQuery({
    queryKey: ["student-achievements", user?.id],
    queryFn: () => certificationsApi.getAchievements(user!.id),
    enabled: !!user,
  });

  const certForm = useForm<CertForm>({ resolver: zodResolver(certSchema) });
  const achForm = useForm<AchForm>({ resolver: zodResolver(achSchema) });

  const openAddCert = () => {
    setEditingCert(null);
    setImagePreview(null);
    certForm.reset({
      title: "",
      issuer: "",
      issueDate: "",
      credentialUrl: "",
      imageUrl: "",
    });
    setCertDialogOpen(true);
  };

  const openEditCert = (cert: Certification) => {
    setEditingCert(cert);
    setImagePreview(cert.imageUrl ?? null);
    certForm.reset({
      title: cert.title,
      issuer: cert.issuer,
      issueDate: cert.issueDate,
      credentialUrl: cert.credentialUrl ?? "",
      imageUrl: cert.imageUrl ?? "",
    });
    setCertDialogOpen(true);
  };

  const openAddAch = () => {
    setEditingAch(null);
    achForm.reset({ title: "", description: "", date: "" });
    setAchDialogOpen(true);
  };

  const openEditAch = (ach: Achievement) => {
    setEditingAch(ach);
    achForm.reset({
      title: ach.title,
      description: ach.description,
      date: ach.date,
    });
    setAchDialogOpen(true);
  };

  const saveCert = useMutation({
    mutationFn: (data: CertForm) => {
      const payload = {
        title: data.title,
        issuer: data.issuer,
        issueDate: data.issueDate,
        credentialUrl: data.credentialUrl || undefined,
        imageUrl: data.imageUrl || imagePreview || undefined,
      };
      if (editingCert) {
        return certificationsApi.update(user!.id, editingCert.id, payload);
      }
      return certificationsApi.create(user!.id, payload);
    },
    onSuccess: () => {
      invalidatePortfolioQueries(queryClient);
      toast({ title: editingCert ? "Certification updated" : "Certification added" });
      setCertDialogOpen(false);
      setEditingCert(null);
      setImagePreview(null);
      certForm.reset();
    },
  });

  const saveAch = useMutation({
    mutationFn: (data: AchForm) => {
      if (editingAch) {
        return certificationsApi.updateAchievement(user!.id, editingAch.id, data);
      }
      return certificationsApi.createAchievement(user!.id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["student-achievements"] });
      queryClient.invalidateQueries({ queryKey: ["public-portfolio"] });
      toast({ title: editingAch ? "Achievement updated" : "Achievement added" });
      setAchDialogOpen(false);
      setEditingAch(null);
      achForm.reset();
    },
  });

  const deleteCert = useMutation({
    mutationFn: (id: string) => certificationsApi.delete(user!.id, id),
    onSuccess: () => {
      invalidatePortfolioQueries(queryClient);
      toast({ title: "Certification removed" });
    },
  });

  const deleteAch = useMutation({
    mutationFn: (id: string) => certificationsApi.deleteAchievement(user!.id, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["student-achievements"] });
      queryClient.invalidateQueries({ queryKey: ["public-portfolio"] });
      toast({ title: "Achievement removed" });
    },
  });

  const mockThumbnailUpload = () => {
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress((p) => {
        if (p === null || p >= 100) {
          clearInterval(interval);
          setUploadProgress(null);
          const mockUrl =
            MOCK_CERT_IMAGES[Math.floor(Math.random() * MOCK_CERT_IMAGES.length)];
          setImagePreview(mockUrl);
          certForm.setValue("imageUrl", mockUrl);
          toast({ title: "Thumbnail uploaded", description: "Certificate image saved." });
          return null;
        }
        return p + 25;
      });
    }, 150);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast({ title: "Invalid file", description: "Please choose an image file.", variant: "destructive" });
      return;
    }
    const preview = URL.createObjectURL(file);
    setImagePreview(preview);
    mockThumbnailUpload();
    e.target.value = "";
  };

  useEffect(() => {
    return () => {
      if (imagePreview?.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const watchedImageUrl = certForm.watch("imageUrl");
  const displayThumbnail = imagePreview || watchedImageUrl || null;

  if (certsLoading || achLoading) return <LoadingSkeleton rows={4} />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Certifications & Achievements"
        description="Showcase your credentials and accomplishments — they appear on your public portfolio"
      />

      <Tabs defaultValue="certifications">
        <TabsList>
          <TabsTrigger value="certifications" className="gap-2">
            <Award className="h-4 w-4" />
            Certifications ({certs.length})
          </TabsTrigger>
          <TabsTrigger value="achievements" className="gap-2">
            <Trophy className="h-4 w-4" />
            Achievements ({achievements.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="certifications" className="mt-6 space-y-4">
          <div className="flex justify-end">
            <Button className="gap-2" onClick={openAddCert}>
              <Plus className="h-4 w-4" />
              Add Certification
            </Button>
          </div>

          {certs.length === 0 ? (
            <EmptyState
              title="No certifications yet"
              description="Add professional certifications to strengthen your profile and portfolio."
            />
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {certs.map((cert) => (
                <CertificationCard
                  key={cert.id}
                  certification={cert}
                  onEdit={() => openEditCert(cert)}
                  onDelete={() => deleteCert.mutate(cert.id)}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="achievements" className="mt-6 space-y-4">
          <div className="flex justify-end">
            <Button className="gap-2" onClick={openAddAch}>
              <Plus className="h-4 w-4" />
              Add Achievement
            </Button>
          </div>

          {achievements.length === 0 ? (
            <EmptyState
              title="No achievements yet"
              description="Highlight awards, competitions, and notable accomplishments."
            />
          ) : (
            <div className="grid gap-5 sm:grid-cols-2">
              {achievements.map((ach) => (
                <AchievementCard
                  key={ach.id}
                  achievement={ach}
                  onEdit={() => openEditAch(ach)}
                  onDelete={() => deleteAch.mutate(ach.id)}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog
        open={certDialogOpen}
        onOpenChange={(open) => {
          setCertDialogOpen(open);
          if (!open) {
            setEditingCert(null);
            setImagePreview(null);
          }
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingCert ? "Edit Certification" : "Add Certification"}
            </DialogTitle>
          </DialogHeader>
          <form
            onSubmit={certForm.handleSubmit((d) => saveCert.mutate(d))}
            className="space-y-4"
          >
            <div>
              <Label>Thumbnail image</Label>
              <div className="mt-2 rounded-xl border border-dashed border-border/60 bg-muted/30 p-4">
                {displayThumbnail ? (
                  <div className="relative aspect-[4/3] overflow-hidden rounded-lg">
                    <Image
                      src={displayThumbnail}
                      alt="Certificate thumbnail preview"
                      fill
                      className="object-cover"
                      unoptimized={displayThumbnail.startsWith("blob:")}
                    />
                  </div>
                ) : (
                  <div className="flex flex-col items-center py-6 text-center">
                    <ImageIcon className="h-10 w-10 text-muted-foreground/60" />
                    <p className="mt-2 text-sm text-muted-foreground">
                      Upload a badge or certificate image
                    </p>
                  </div>
                )}
                {uploadProgress !== null && (
                  <Progress value={uploadProgress} className="mt-3 h-1.5" />
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileSelect}
                />
                <div className="mt-3 flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="flex-1 gap-2"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadProgress !== null}
                  >
                    <Upload className="h-4 w-4" />
                    Upload image
                  </Button>
                  {displayThumbnail && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setImagePreview(null);
                        certForm.setValue("imageUrl", "");
                      }}
                    >
                      Remove
                    </Button>
                  )}
                </div>
              </div>
              <div className="mt-2">
                <Label className="text-xs text-muted-foreground">Or paste image URL</Label>
                <Input
                  {...certForm.register("imageUrl")}
                  placeholder="https://..."
                  className="mt-1"
                  onChange={(e) => {
                    const value = e.target.value;
                    certForm.setValue("imageUrl", value);
                    if (value) setImagePreview(value);
                    else if (!uploadProgress) setImagePreview(null);
                  }}
                />
              </div>
            </div>
            <div>
              <Label>Title</Label>
              <Input {...certForm.register("title")} placeholder="AWS Cloud Practitioner" />
            </div>
            <div>
              <Label>Issuer</Label>
              <Input {...certForm.register("issuer")} placeholder="Amazon Web Services" />
            </div>
            <div>
              <Label>Issue Date</Label>
              <Input type="date" {...certForm.register("issueDate")} />
            </div>
            <div>
              <Label>Credential URL (optional)</Label>
              <Input {...certForm.register("credentialUrl")} placeholder="https://..." />
            </div>
            <Button type="submit" disabled={saveCert.isPending || uploadProgress !== null} className="w-full">
              {saveCert.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editingCert ? "Save changes" : "Add certification"}
            </Button>
          </form>
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
              {editingAch ? "Edit Achievement" : "Add Achievement"}
            </DialogTitle>
          </DialogHeader>
          <form
            onSubmit={achForm.handleSubmit((d) => saveAch.mutate(d))}
            className="space-y-4"
          >
            <div>
              <Label>Title</Label>
              <Input {...achForm.register("title")} placeholder="Hackathon Winner" />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea {...achForm.register("description")} rows={3} />
            </div>
            <div>
              <Label>Date</Label>
              <Input type="date" {...achForm.register("date")} />
            </div>
            <Button type="submit" disabled={saveAch.isPending} className="w-full">
              {saveAch.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editingAch ? "Save changes" : "Add achievement"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
