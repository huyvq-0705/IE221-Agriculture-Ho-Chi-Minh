"use client";

import { useFormStatus } from "react-dom";
import Link from "next/link";
import { apiLogin } from "../actions"; 
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input, Label } from "@/components/ui";
import { useActionState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? "Đang đăng nhập..." : "Đăng nhập"}
    </Button>
  );
}

export default function LoginPage() {
  const [state, formAction] = useActionState(apiLogin, { message: "" });
  const { checkUserSession } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (state?.success) {
      if (state.tokens) {
        localStorage.setItem("accessToken", state.tokens.access);
        localStorage.setItem("refreshToken", state.tokens.refresh);
        
        window.dispatchEvent(new Event("user-logged-in"));
      }


      checkUserSession().then(() => {
        router.push('/'); 
      });
    }
  }, [state, checkUserSession, router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Đăng nhập</CardTitle>
          <CardDescription>Nhập username để đăng nhập vào tài khoản.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input id="username" name="username" placeholder="username của bạn" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Mật khẩu</Label>
              <Input id="password" name="password" type="password" required />
            </div>
            
            {!state.success && state?.message && (
              <p className="text-sm text-destructive">{state.message}</p>
            )}

            <SubmitButton />
          </form>
          <div className="mt-4 text-center text-sm">
            {"Chưa có tài khoản? "}
            <Link href="/auth/signup" className="underline">
              Đăng ký
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}