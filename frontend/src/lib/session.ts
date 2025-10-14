"use server";

import 'server-only'; // Đảm bảo file này chỉ chạy trên server
import { cookies } from 'next/headers';
import { fetchApi } from './api';

// Định nghĩa kiểu dữ liệu cho User
interface User {
  id: number;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  avatar?: string;
}

// Hàm lấy thông tin user từ cookie
export async function getCurrentUser(): Promise<User | null> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('accessToken')?.value;

  if (!accessToken) {
    return null;
  }

  try {
    const user = await fetchApi('api/users/me/', {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    }) as User;

    return user;

  } catch (error) {
    console.error('Failed to get current user:', error);
    return null;
  }
}
