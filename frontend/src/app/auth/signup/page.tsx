"use client";

import { useFormStatus } from "react-dom";
import Link from "next/link";
import { register } from "../actions";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input, Label } from "@/components/ui";
import { useState, useEffect, useActionState } from "react";

function SubmitButton({ clientError }: { clientError: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending || !!clientError}>
      {pending ? "Đang tạo tài khoản..." : "Tạo tài khoản"}
    </Button>
  );
}


export default function RegisterPage() {
  const [state, formAction] = useActionState(register, { message: "" });
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [clientError, setClientError] = useState('');

  useEffect(() => {
    if (password && confirmPassword && password !== confirmPassword) {
      setClientError("Passwords do not match.");
    } else {
      setClientError('');
    }
  }, [password, confirmPassword]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-background py-8">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Đăng ký</CardTitle>
          <CardDescription>Nhập thông tin của bạn để tạo tài khoản.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input id="username" name="username" placeholder="username của bạn" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" placeholder="m@example.com" required />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Mật khẩu</Label>
              <Input 
                id="password" 
                name="password" 
                type="password" 
                required 
                value={password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm_password">Xác nhận mật khẩu</Label>
              <Input 
                id="confirm_password" 
                name="confirm_password" 
                type="password" 
                required 
                value={confirmPassword}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
              />
            </div>
            
            {(clientError || state?.message) && (
              <p className="text-sm text-destructive">
                {clientError || state.message}
              </p>
            )}

            <SubmitButton clientError={clientError} />
          </form>
          <div className="mt-4 text-center text-sm">
            {"Đã có tài khoản? "}
            <Link href="/auth/login" className="underline">
              Đăng nhập
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
