"use server";

import { cookies } from "next/headers";
import { fetchApi } from "@/lib/api";
import { redirect } from 'next/navigation';

interface ActionState {
  message: string;
  success?: boolean;
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

  } catch (error) {
    console.error("Admin login failed:", error);
    if (error instanceof Error && error.message !== 'NEXT_REDIRECT') {
        return { success: false, message: "Tên đăng nhập hoặc mật khẩu không đúng." };
    } else if (!(error instanceof Error) || error.message !== 'NEXT_REDIRECT') {
        return { success: false, message: "Đã xảy ra lỗi không xác định." };
    }
  }

  redirect('/agrihcmAdmin');
}

// ✅ FIX: Sửa lại adminLogout để xử lý redirect đúng cách
export async function adminLogout() {
  try {
    console.log('🔐 Logging out admin...');
    
    const cookieStore = await cookies();
    
    // Xóa cookies
    cookieStore.delete('accessToken');
    cookieStore.delete('refreshToken');
    
    console.log('✅ Cookies deleted');
    
  } catch (error) {
    console.error('❌ Logout error:', error);
    // Không throw error ở đây
  }
  
  // Redirect phải nằm ngoài try-catch vì nó throw NEXT_REDIRECT error
  redirect('/agrihcmAdmin/login');
}
