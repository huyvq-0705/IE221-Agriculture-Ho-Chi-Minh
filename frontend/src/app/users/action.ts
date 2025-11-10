"use server";

import { fetchApi } from "@/lib/api";
import { getCurrentUser } from "@/lib/session";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

interface ActionState {
  message: string;
  success: boolean;
  errors?: Record<string, string[]>;
}

export async function updateProfile(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  if (!accessToken) {
    return { success: false, message: "Unauthorized" };
  }

  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return { success: false, message: "Lỗi: Không tìm thấy người dùng." };
  }

  const data: { [key: string]: FormDataEntryValue | null } = Object.fromEntries(formData);

  const oldEmail = currentUser.email;
  const newEmail = data.email as string;
  
  const isEmailEdited = newEmail && (newEmail.toLowerCase() !== oldEmail.toLowerCase());

  Object.keys(data).forEach(key => {
    if (data[key] === "" && (key === "avatar" || key === "date_of_birth")) {
      data[key] = null;
    }
  });

  try {
    const updatedUser = await fetchApi("api/users/me/", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(data),
    });

    revalidatePath("/users/profile"); // Làm mới trang profile
    revalidatePath("/api/users/me/"); // Làm mới API route lấy user

    if (isEmailEdited) {
      cookieStore.delete('accessToken');
      cookieStore.delete('refreshToken');
      redirect(`/auth/verify-otp?email=${encodeURIComponent(newEmail)}`);
    } else {
      return { success: true, message: "Cập nhật hồ sơ thành công!" };
    }

  } catch (error) {
    if (error instanceof Error && error.message.includes('NEXT_REDIRECT')) {
      throw error;
    }
    
    console.error("Profile update failed:", error);
    if (error instanceof Error) {
      try {
        const errData = JSON.parse(error.message);
        return {
          success: false,
          message: "Cập nhật thất bại. Vui lòng kiểm tra lại các trường.",
          errors: errData,
        };
      } catch (parseError) {
        return { success: false, message: error.message };
      }
    }
    return { success: false, message: "Đã xảy ra lỗi không xác định." };
  }
}
