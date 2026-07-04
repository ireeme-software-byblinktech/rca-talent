"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { certificationsApi } from "@/lib/api/certifications";
import { useAuth } from "@/lib/auth/context";
import { useToast } from "@/hooks/use-toast";
import type { Achievement } from "@/types";

const achSchema = z.object({
  title: z.string().min(2),
  description: z.string().min(10),
  date: z.string().min(1),
});

type AchForm = z.infer<typeof achSchema>;

interface AchievementFormDialogProps {
  achievement?: Achievement | null;
  onClose: () => void;
  onSuccess?: (achievement: Achievement) => void;
}

export function AchievementFormDialog({
  achievement,
  onClose,
  onSuccess,
}: AchievementFormDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<AchForm>({
    resolver: zodResolver(achSchema),
    defaultValues: achievement
      ? {
          title: achievement.title,
          description: achievement.description,
          date: achievement.date,
        }
      : undefined,
  });

  useEffect(() => {
    if (achievement) {
      form.reset({
        title: achievement.title,
        description: achievement.description,
        date: achievement.date,
      });
    }
  }, [achievement, form]);

  const mutation = useMutation({
    mutationFn: (data: AchForm) =>
      achievement
        ? certificationsApi.updateAchievement(user!.id, achievement.id, data)
        : certificationsApi.createAchievement(user!.id, data),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["student-achievements"] });
      queryClient.invalidateQueries({ queryKey: ["public-portfolio"] });
      toast({ title: achievement ? "Achievement updated" : "Achievement added" });
      onSuccess?.(result);
      onClose();
    },
  });

  return (
    <form onSubmit={form.handleSubmit((d) => mutation.mutate(d))} className="space-y-4">
      <div>
        <Label>Title</Label>
        <Input {...form.register("title")} placeholder="Hackathon Winner" />
      </div>
      <div>
        <Label>Description</Label>
        <Textarea {...form.register("description")} rows={3} />
      </div>
      <div>
        <Label>Date</Label>
        <Input type="date" {...form.register("date")} />
      </div>
      <Button type="submit" disabled={mutation.isPending} className="w-full">
        {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {achievement ? "Save changes" : "Add achievement"}
      </Button>
    </form>
  );
}
