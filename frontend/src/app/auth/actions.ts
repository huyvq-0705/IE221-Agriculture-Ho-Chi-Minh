"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
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

    setAuthCookies(cookieStore, response.access, response.refresh);

    return { success: true, message: 'Login successful' };

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

  if (data.password !== data.confirm_password) {
      return { message: "Passwords do not match." };
  }

  try {
      const { confirm_password, ...payload } = data;
      await fetchApi("api/register/", {
          method: "POST",
          body: JSON.stringify(payload),
      });
  } catch (error: unknown) {
      console.error("Registration failed:", error);
      if (error instanceof Error) {
        return { message: error.message };
      }
      return { message: "An unknown error occurred during registration." };
  }
  
  redirect("/auth/login");
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
  } catch (error) {
    console.error("Logout failed:", error);
  }

  cookieStore.delete('accessToken');
  cookieStore.delete('refreshToken');
  redirect('/');
}
