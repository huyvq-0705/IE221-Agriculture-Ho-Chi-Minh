"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function getAuthHeaders() {
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;
  return {
    "Content-Type": "application/json",
    Authorization: token ? `Bearer ${token}` : "",
  };
}

export async function fetchQuestions(status: "all" | "unanswered" = "all") {
  try {
    const headers = await getAuthHeaders();
    // Use the filter param defined in your Django AdminQuestionListView
    const query = status === "unanswered" ? "?status=unanswered" : "";
    
    const res = await fetch(`${API_URL}/api/admin/questions/${query}`, {
      headers,
      cache: "no-store", // Ensure fresh data
    });

    if (!res.ok) {
        // If 401, token might be expired, handle accordingly or return empty
        if(res.status === 401) return { results: [], error: "Unauthorized" };
        throw new Error("Failed to fetch questions");
    }

    return await res.json();
  } catch (error) {
    console.error("Error fetching questions:", error);
    return { results: [], error: "Failed to load" };
  }
}

export async function replyToQuestion(id: number, answer: string) {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_URL}/api/admin/questions/${id}/`, {
      method: "PATCH",
      headers,
      body: JSON.stringify({ answer }),
    });

    if (!res.ok) {
      const errorData = await res.json();
      return { success: false, error: JSON.stringify(errorData) };
    }

    revalidatePath("/agrihcmAdmin/questions");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Connection error" };
  }
}

export async function deleteQuestion(id: number) {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_URL}/api/admin/questions/${id}/`, {
      method: "DELETE",
      headers,
    });

    if (!res.ok) {
      return { success: false, error: "Failed to delete" };
    }

    revalidatePath("/agrihcmAdmin/questions");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Connection error" };
  }
}