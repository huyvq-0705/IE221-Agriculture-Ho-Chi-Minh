"use client";

import { useFormStatus } from "react-dom";
import { adminLogin } from "../actions";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input, Label } from "@/components/ui";
import { useActionState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? "Signing In..." : "Sign In"}
    </Button>
  );
}

export default function LoginPage() {
  const [state, formAction] = useActionState(adminLogin, { message: "" });
  const { checkUserSession } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      checkUserSession().then(() => {
        router.push('/agrihcmAdmin');
      });
    }
  }, [state, checkUserSession, router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Sign in for ADMIN</CardTitle>
          <CardDescription>Enter your username to sign in to ADMIN account.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input id="username" name="username" placeholder="yourusername" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" required />
            </div>
            
            {!state.success && state?.message && (
              <p className="text-sm text-destructive">{state.message}</p>
            )}

            <SubmitButton />
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
