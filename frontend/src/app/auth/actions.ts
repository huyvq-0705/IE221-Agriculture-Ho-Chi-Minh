"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { fetchApi } from "@/lib/api";
import { ReadonlyRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies";

interface ActionState {
  message: string;
  success?: boolean;
  // NEW: Return tokens to the client so we can save them in localStorage
  tokens?: {
    access: string;
    refresh: string;
    user: any;
  };
}

interface LoginResponse {
  access: string;
  refresh: string;
  user: {
    id: number;
    username: string;
    email: string;
  };
}

function setAuthCookies(
  cookieStore: ReadonlyRequestCookies,
  accessToken: string,
  refreshToken: string
) {
  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
  };

  cookieStore.set("accessToken", accessToken, { ...options, maxAge: 60 * 60 });
  cookieStore.set("refreshToken", refreshToken, {
    ...options,
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function apiLogin(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const data = Object.fromEntries(formData);
  
  try {
    const response = (await fetchApi("api/login/", {
      method: "POST",
      body: JSON.stringify(data),
    })) as LoginResponse;

    const cookieStore = await cookies();

    // Keep setting cookies for Next.js Server Components (optional but good for protected routes)
    setAuthCookies(cookieStore, response.access, response.refresh);

    // RETURN TOKENS TO CLIENT
    return { 
      success: true, 
      message: 'Login successful',
      tokens: {
        access: response.access,
        refresh: response.refresh,
        user: response.user
      }
    };

  } catch (error) {
    console.error("Login failed:", error);
    if (error instanceof Error) {
      return { success: false, message: error.message };
    }
    return { success: false, message: "An unknown error occurred during login." };
  }
}

export async function register(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const data = Object.fromEntries(formData);
  const email = data.email as string;

  if (data.password !== data.confirm_password) {
      return { message: "Mật khẩu không khớp." };
  }

  try {
      const { confirm_password, ...payload } = data;
      await fetchApi("api/register/", {
          method: "POST",
          body: JSON.stringify(payload),
      });
  } catch (error) {
      console.error("Registration failed:", error);
      if (error instanceof Error) {
        return { message: error.message };
      }
      return { message: "Lỗi không xác định xảy ra lúc đăng ký." };
  }
  
  redirect(`/auth/verify-otp?email=${encodeURIComponent(email)}`);
}

export async function verifyOtp(data: { email: string; otp: string }): Promise<ActionState> {
  try {
    await fetchApi("api/verify-otp/", {
      method: "POST",
      body: JSON.stringify(data),
    });

  } catch (error) {
    console.error("OTP Verification failed:", error);
    if (error instanceof Error) {
      return { message: error.message };
    }
    return { message: "Đã xảy ra lỗi khi xác thực OTP." };
  }

  redirect("/auth/login");
}

export async function resendOtp(email: string): Promise<ActionState> {
  try {
    await fetchApi("api/resend-otp/", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
    return { success: true, message: "Đã gửi lại mã OTP. Vui lòng kiểm tra email." };
  } catch (error) {
    console.error("Resend OTP failed:", error);
    if (error instanceof Error) {
      return { success: false, message: error.message };
    }
    return { success: false, message: "Lỗi không xác định xảy ra khi gửi lại mã." };
  }
}

export async function apiLogout() {
  console.log('start logout')
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('accessToken')?.value;
  const refreshToken = cookieStore.get('refreshToken')?.value;

  if (!accessToken) {
    console.log("No accessToken");
  }

  try {
    // Try to logout on backend
    if (accessToken) {
        await fetchApi("api/logout/", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
            refresh: refreshToken
        })
        });
    }
  } catch (error) {
    console.error("Logout failed:", error);
  }

  cookieStore.delete('accessToken');
  cookieStore.delete('refreshToken');
  redirect('/');
}
