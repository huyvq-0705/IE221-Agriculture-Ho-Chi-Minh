"use client";

import { useFormStatus } from "react-dom";
import Link from "next/link";
import { apiLogin, requestOTPforResetPassword } from "../actions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Input, Label } from "@/components/ui";
import { useActionState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button"

interface SubmitButtonProps {
  dialog?: boolean;
}

function SubmitButton({dialog = false}: SubmitButtonProps) {
  const { pending } = useFormStatus();
  const text1 = dialog? "Đang gửi..." : "Đang đăng nhập...";
  const text2 = dialog? "Gửi" : "Đăng nhập";
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? text1 : text2}
    </Button>
  );
}

export default function LoginPage() {
  const [state, formAction] = useActionState(apiLogin, { message: "" });
  const [stateDialog, formActionDialog] = useActionState(requestOTPforResetPassword, { message: "" });
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
            <Dialog>
              <DialogTrigger asChild>
                <p className="underline hover:cursor-pointer">Quên mật khẩu?</p>
              </DialogTrigger>
              
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Xác thực OTP qua Email</DialogTitle>
                  <DialogDescription>
                    Hãy nhập email của bạn và nhấn gửi để chúng tôi gửi mã OTP
                  </DialogDescription>
                </DialogHeader>

                <form action={formActionDialog} className="grid gap-4">
                  <div className="grid gap-3">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" name="email" placeholder="example@mail.com" required />
                  </div>
                  {!stateDialog.success && stateDialog?.message && (
                    <p className="text-sm text-destructive">{stateDialog.message}</p>
                  )}

                  <DialogFooter>
                    <SubmitButton dialog={true} />
                  </DialogFooter>
                </form>

              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}