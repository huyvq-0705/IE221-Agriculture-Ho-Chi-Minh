"use client";

import { useFormStatus } from "react-dom";
import { adminLogin } from "../actions";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input, Label } from "@/components/ui";
import { useActionState } from "react";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? "Đang đăng nhập..." : "Đăng nhập"}
    </Button>
  );
}

export default function LoginPage() {
  const [state, formAction] = useActionState(adminLogin, { message: "" });

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Đăng nhập ADMIN</CardTitle>
          <CardDescription>Nhập tài khoản và mật khẩu của bạn.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Tên đăng nhập</Label>
              <Input id="username" name="username" placeholder="yourusername" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Mật khẩu</Label>
              <Input id="password" name="password" type="password" required />
            </div>
            
            {state?.message && (
              <p className="text-sm text-destructive">{state.message}</p>
            )}

            <SubmitButton />
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
