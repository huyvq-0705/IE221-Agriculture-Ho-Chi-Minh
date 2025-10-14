"use server";

import { cookies } from "next/headers";
import { fetchApi } from "@/lib/api";
import { ReadonlyRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies";

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

export async function adminLogin(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const data = Object.fromEntries(formData);
  
  try {
    const response = (await fetchApi("api/agrihcmAdmin/login/", {
      method: "POST",
      body: JSON.stringify(data),
    })) as LoginResponse;
    const cookieStore = await cookies();
    setAuthCookies(cookieStore, response.access, response.refresh);
    return { success: true, message: 'Admin login successful' };

  } catch (error) {
    console.error("Admin login failed:", error);
    if (error instanceof Error) {
      return { success: false, message: error.message };
    }
    return { success: false, message: "An unknown error occurred during login." };
  }
}
