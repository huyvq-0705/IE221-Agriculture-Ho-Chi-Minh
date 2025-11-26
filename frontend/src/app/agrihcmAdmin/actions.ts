"use server";

import { fetchApi } from "@/lib/api";
import { redirect } from 'next/navigation';
import { cookies } from "next/headers"; 

interface ActionState {
  message: string;
  success?: boolean;
  tokens?: {
    access: string;
    refresh: string;
  };
}

interface LoginResponse {
  access: string;
  refresh: string;
  user: {
    id: number;
    username: string;
    email: string;
    is_superuser: boolean;
  };
}

export async function adminLogin(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const data = Object.fromEntries(formData);
  
  try {
    const response = (await fetchApi("api/agrihcmAdmin/login/", {
      method: "POST",
      body: JSON.stringify(data),
    })) as LoginResponse;

    const cookieStore = await cookies();
    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax" as const,
        path: "/",
    };
    cookieStore.set("accessToken", response.access, { ...options, maxAge: 60 * 60 });
    cookieStore.set("refreshToken", response.refresh, { ...options, maxAge: 60 * 60 * 24 * 7 });

    return { 
        success: true, 
        message: "Đăng nhập thành công",
        tokens: {
            access: response.access,
            refresh: response.refresh
        }
    };

  } catch (error) {
    console.error("Admin login failed:", error);
    if (error instanceof Error && error.message !== 'NEXT_REDIRECT') {
        return { success: false, message: "Tên đăng nhập hoặc mật khẩu không đúng." };
    } else if (!(error instanceof Error) || error.message !== 'NEXT_REDIRECT') {
        return { success: false, message: "Đã xảy ra lỗi không xác định." };
    }
    return { success: false, message: "Lỗi server." };
  }
}

export async function adminLogout() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete('accessToken');
    cookieStore.delete('refreshToken');
  } catch (error) {
    console.error('Logout error:', error);
  }
  redirect('/agrihcmAdmin/login');
}