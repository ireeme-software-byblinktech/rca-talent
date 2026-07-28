"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/shared/PasswordInput";
import { authApi } from "@/lib/api/auth";
import { useAuth } from "@/lib/auth/context";
import { useToast } from "@/hooks/use-toast";

export function ChangeEmailForm() {
  const { logout } = useAuth();
  const { toast } = useToast();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail.trim())) {
      toast({
        variant: "destructive",
        title: "Invalid email",
        description: "Enter a valid email address.",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await authApi.changeEmail({
        currentPassword,
        newEmail: newEmail.trim(),
      });
      await logout("/login?emailChanged=1");
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Could not change email",
        description: err instanceof Error ? err.message : "Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PasswordInput
        id="emailCurrentPassword"
        label="Current password"
        placeholder="••••••••"
        value={currentPassword}
        onChange={(event) => setCurrentPassword(event.target.value)}
        autoComplete="current-password"
        required
      />
      <div className="space-y-2">
        <Label htmlFor="newEmail">New email</Label>
        <Input
          id="newEmail"
          type="email"
          value={newEmail}
          onChange={(event) => setNewEmail(event.target.value)}
          autoComplete="email"
          required
        />
      </div>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Update email
      </Button>
    </form>
  );
}
