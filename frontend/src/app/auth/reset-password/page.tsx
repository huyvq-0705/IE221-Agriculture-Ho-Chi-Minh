"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle, Label, Input, Button } from "@/components/ui";
import { useActionState } from "react";
import { apiResetPassword } from "../actions";


export default function ResetPasswordPage() {
  const [state, formActionResetPassword] = useActionState(apiResetPassword, { message: "" });

  return (
    <div className="flex items-center justify-center w-full min-h-[calc(100vh-64px)] bg-gradient-to-br from-emerald-50 via-white to-emerald-100 py-12 px-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Thiết lập lại mật khẩu</CardTitle>
          <CardDescription>Nhập mật khẩu mới để thiết lập lại mật khẩu</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formActionResetPassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Mật khẩu mới</Label>
              <Input id="password" name="password" type="password" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm_password">Xác nhận lại mật khẩu</Label>
              <Input id="confirm_password" name="confirm_password" type="password" required />
            </div>
            
            {!state.success && state?.message && (
              <p className="text-sm text-destructive">{state.message}</p>
            )}

            <Button type="submit" className="w-full">Gửi</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
