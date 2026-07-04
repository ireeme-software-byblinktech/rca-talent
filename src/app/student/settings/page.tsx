"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { studentsApi } from "@/lib/api/students";
import { useAuth } from "@/lib/auth/context";
import { useToast } from "@/hooks/use-toast";

export default function StudentSettingsPage() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: profile } = useQuery({
    queryKey: ["student-profile", user?.id],
    queryFn: () => studentsApi.getProfile(user!.id),
    enabled: !!user,
  });

  const visibilityMutation = useMutation({
    mutationFn: (isVisible: boolean) =>
      studentsApi.updateProfile(user!.id, { isVisible }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["student-profile"] });
      toast({ title: "Visibility updated" });
    },
  });

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your account preferences</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
          <CardDescription>Your login credentials</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Email</Label>
            <Input value={user?.email ?? ""} disabled />
          </div>
          <div className="space-y-2">
            <Label htmlFor="newPassword">New password</Label>
            <Input id="newPassword" type="password" placeholder="••••••••" disabled />
            <p className="text-xs text-muted-foreground">
              {/* TODO: Wire up password change when backend auth is ready */}
              Password change will be available when connected to the NestJS backend.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Profile visibility</CardTitle>
          <CardDescription>
            Control whether your profile appears in company search results
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">Visible to companies</p>
              <p className="text-xs text-muted-foreground">
                Only applies when your profile is approved
              </p>
            </div>
            <Switch
              checked={profile?.isVisible ?? true}
              onCheckedChange={(checked) => visibilityMutation.mutate(checked)}
              disabled={visibilityMutation.isPending}
            />
          </div>
        </CardContent>
      </Card>

      <Separator />

      <div className="flex justify-between items-center">
        <div>
          <p className="font-medium text-sm text-destructive">Sign out</p>
          <p className="text-xs text-muted-foreground">Log out of your account</p>
        </div>
        <Button variant="destructive" onClick={() => logout()}>
          Log out
        </Button>
      </div>
    </div>
  );
}
