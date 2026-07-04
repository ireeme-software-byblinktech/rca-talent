"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/lib/auth/context";

export default function CompanySettingsPage() {
  const { user, logout } = useAuth();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your company account</p>
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
          <p className="text-xs text-muted-foreground">
            {/* TODO: Wire up password change when backend auth is ready */}
            Password change will be available when connected to the NestJS backend.
          </p>
        </CardContent>
      </Card>

      <Separator />

      <div className="flex justify-between items-center">
        <div>
          <p className="font-medium text-sm text-destructive">Sign out</p>
        </div>
        <Button variant="destructive" onClick={() => logout()}>
          Log out
        </Button>
      </div>
    </div>
  );
}
