"use client";

import Link from "next/link";
import { useMutation } from "@tanstack/react-query";
import { CheckCircle2, LifeBuoy } from "lucide-react";
import { useEffect, useState } from "react";
import { PublicFooter, PublicHeader } from "@/components/shared/PublicLayout";
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
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { ApiError } from "@/lib/api/client";
import { supportApi } from "@/lib/api/support";
import { useAuth } from "@/lib/auth/context";
import { getDashboardPath } from "@/lib/auth/routes";
import type { SupportTicketCategory } from "@/types";

const CATEGORIES: { value: SupportTicketCategory; label: string }[] = [
  { value: "bug", label: "Bug report" },
  { value: "improvement", label: "Improvement idea" },
  { value: "question", label: "Question" },
  { value: "other", label: "Other" },
];

export default function SupportPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [category, setCategory] = useState<SupportTicketCategory>("bug");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState(user?.email ?? "");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (user?.email) setEmail(user.email);
  }, [user?.email]);

  const mutation = useMutation({
    mutationFn: () =>
      supportApi.create({
        category,
        subject,
        message,
        email,
      }),
    onSuccess: () => {
      setSubmitted(true);
      setSubject("");
      setMessage("");
      toast({ title: "Message sent", description: "We'll review it shortly." });
    },
    onError: (err: unknown) => {
      const msg =
        err instanceof ApiError ? err.message : "Could not send your message.";
      toast({ title: "Failed to send", description: msg, variant: "destructive" });
    },
  });

  return (
    <div className="flex min-h-screen flex-col">
      <PublicHeader />
      <main className="flex-1">
        <section className="border-b bg-gradient-to-b from-primary/5 to-background py-14 sm:py-16">
          <div className="mx-auto max-w-2xl px-4 text-center sm:px-6">
            <LifeBuoy className="mx-auto h-8 w-8 text-primary" />
            <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
              Support
            </h1>
            <p className="mt-3 text-muted-foreground">
              Report bugs, suggest improvements, or ask a question. Our team
              reviews every message in the admin portal.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-xl px-4 py-12 sm:px-6">
          {submitted ? (
            <div className="rounded-2xl border border-border/60 bg-card p-8 text-center shadow-card">
              <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-600" />
              <h2 className="mt-4 text-xl font-semibold">Thanks for reaching out</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Your message was submitted. We&apos;ll follow up by email if needed.
              </p>
              <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
                {user ? (
                  <Button className="rounded-full" asChild>
                    <Link href={getDashboardPath(user.role)}>Back to dashboard</Link>
                  </Button>
                ) : null}
                <Button
                  className="rounded-full"
                  variant="outline"
                  onClick={() => setSubmitted(false)}
                >
                  Send another message
                </Button>
              </div>
            </div>
          ) : (
            <form
              className="space-y-5 rounded-2xl border border-border/60 bg-card p-6 shadow-card sm:p-8"
              onSubmit={(e) => {
                e.preventDefault();
                mutation.mutate();
              }}
            >
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={category}
                  onValueChange={(v) => setCategory(v as SupportTicketCategory)}
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  required
                  minLength={3}
                  maxLength={120}
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Short summary"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  required
                  minLength={10}
                  maxLength={5000}
                  rows={6}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Describe the issue or idea in detail…"
                />
              </div>

              <Button
                type="submit"
                className="w-full rounded-full"
                disabled={mutation.isPending}
              >
                {mutation.isPending ? "Sending…" : "Submit message"}
              </Button>
            </form>
          )}
        </section>
      </main>
      <PublicFooter />
    </div>
  );
}
