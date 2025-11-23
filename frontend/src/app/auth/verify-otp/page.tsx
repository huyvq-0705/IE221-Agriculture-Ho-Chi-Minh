"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui";
import { verifyOtp, resendOtp, requestOTPforResetPassword } from "../actions";
import { Loader2 } from "lucide-react";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Button } from "@/components/ui/button";

function VerifyOTPComponent() {
  const otpLifetime = 90;
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  const forgotPassword = (searchParams.get("forgotPassword") === "true");

  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [resendCooldown, setResendCooldown] = useState(otpLifetime);
  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState<string | null>(null);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    setResendMessage(null);

    if (!email) {
      setError("Không tìm thấy email. Vui lòng quay lại trang đăng ký.");
      setIsLoading(false);
      return;
    }
    
    if (otp.length !== 6) {
      setError("Mã OTP phải có 6 chữ số.");
      setIsLoading(false);
      return;
    }

    let result;
    if (forgotPassword) {
      result = await verifyOtp({ email, otp, forgotPassword });
    } else {
      result = await verifyOtp({ email, otp });
    }

    setIsLoading(false);
    
    if (result && result.message) {
      setError(result.message);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0 || isResending || !email) return;

    setIsResending(true);
    setError(null);
    setResendMessage(null);

    const result = forgotPassword ? await resendOtp(email, forgotPassword) : await resendOtp(email);
    
    setIsResending(false);
    setResendMessage(result.message);
    
    if (result.success) {
      setResendCooldown(otpLifetime);
    }
  };

  if (!email) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background py-8">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle>Đã xảy ra lỗi</CardTitle>
            <CardDescription>Không tìm thấy thông tin email để xác thực.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/auth/signup" passHref>
              <Button variant="outline" className="w-full">Quay lại trang Đăng ký</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background py-8">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle>Xác thực tài khoản</CardTitle>
          <CardDescription>
            Chúng tôi đã gửi mã 6 chữ số đến <strong>{email}</strong>.
            Vui lòng nhập mã vào bên dưới.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex justify-center">
              <InputOTP
                maxLength={6} 
                value={otp} 
                onChange={(value) => setOtp(value)}
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>
            
            {error && (
              <p className="text-sm text-center text-destructive">{error}</p>
            )}

            <Button type="submit" className="w-full" disabled={isLoading || otp.length !== 6}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLoading ? "Đang xác thực..." : "Xác thực"}
            </Button>
          </form>
          
          <div className="mt-6 text-center text-sm">
            Không nhận được mã?{' '}
            <Button
              variant="link"
              className="p-0 h-auto"
              onClick={handleResend}
              disabled={resendCooldown > 0 || isResending}
            >
              {isResending ? (
                "Đang gửi..."
              ) : resendCooldown > 0 ? (
                `Gửi lại sau (${resendCooldown}s)`
              ) : (
                "Gửi lại mã"
              )}
            </Button>
            {resendMessage && (
              <p className={`text-sm mt-2 ${error ? 'text-destructive' : 'text-muted-foreground'}`}>
                {resendMessage}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function VerifyOTPPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyOTPComponent />
    </Suspense>
  );
}
