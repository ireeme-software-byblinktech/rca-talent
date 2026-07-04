"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { z } from "zod";
import { Bell, BellOff, Loader2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { blogApi } from "@/lib/api/blog";
import { useAuth } from "@/lib/auth/context";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const emailSchema = z.string().email("Enter a valid email address");

interface BlogSubscribeFormProps {
  variant?: "inline" | "card";
  className?: string;
}

export function BlogSubscribeForm({
  variant = "inline",
  className,
}: BlogSubscribeFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [email, setEmail] = useState(user?.email ?? "");

  const { data: subscribed, isLoading: statusLoading } = useQuery({
    queryKey: ["blog-subscribed", user?.email ?? email],
    queryFn: () => blogApi.isSubscribed(user?.email ?? email),
    enabled: !!(user?.email || emailSchema.safeParse(email).success),
  });

  const subscribeMutation = useMutation({
    mutationFn: () => blogApi.subscribe(email, user?.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blog-subscribed"] });
      toast({
        title: "Subscribed!",
        description: "You'll receive updates when new posts are published.",
      });
    },
    onError: (err) => {
      toast({
        variant: "destructive",
        title: "Subscription failed",
        description: err instanceof Error ? err.message : "Please try again",
      });
    },
  });

  const unsubscribeMutation = useMutation({
    mutationFn: () => blogApi.unsubscribe(user?.email ?? email),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blog-subscribed"] });
      toast({ title: "Unsubscribed", description: "You won't receive blog updates." });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = emailSchema.safeParse(email);
    if (!parsed.success) {
      toast({
        variant: "destructive",
        title: "Invalid email",
        description: parsed.error.issues[0]?.message,
      });
      return;
    }
    subscribeMutation.mutate();
  };

  if (subscribed && !statusLoading) {
    return (
      <div
        className={cn(
          variant === "card"
            ? "rounded-xl border bg-card p-6 text-center"
            : "flex flex-col items-center gap-3 sm:flex-row",
          className
        )}
      >
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Bell className="h-4 w-4 text-primary" />
          <span>You&apos;re subscribed to RCA Talent blog updates</span>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="gap-1"
          onClick={() => unsubscribeMutation.mutate()}
          disabled={unsubscribeMutation.isPending}
        >
          {unsubscribeMutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <BellOff className="h-4 w-4" />
          )}
          Unsubscribe
        </Button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        variant === "card"
          ? "rounded-xl border bg-card p-6 space-y-4"
          : "flex flex-col gap-3 sm:flex-row sm:items-center",
        className
      )}
    >
      {variant === "card" && (
        <div className="text-center">
          <Mail className="mx-auto h-8 w-8 text-primary" />
          <h3 className="mt-2 font-semibold">Subscribe to our blog</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Career tips, success stories, and platform news — straight to your inbox.
          </p>
        </div>
      )}
      <div className={cn("flex gap-2", variant === "card" ? "flex-col sm:flex-row" : "flex-1")}>
        <Input
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={subscribeMutation.isPending}
          className={variant === "inline" ? "max-w-xs" : ""}
        />
        <Button type="submit" disabled={subscribeMutation.isPending} className="gap-1 shrink-0">
          {subscribeMutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Bell className="h-4 w-4" />
          )}
          Subscribe
        </Button>
      </div>
    </form>
  );
}
