import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

    // Call Django API
    const response = await fetch(`${API_URL}/api/auth/login/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      return NextResponse.json(
        { message: error.detail || 'Đăng nhập thất bại' },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Set cookies
    const cookieStore = await cookies();

    cookieStore.set('accessToken', data.access, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24,
      path: '/',
    });

    if (data.refresh) {
      cookieStore.set('refreshToken', data.refresh, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7,
        path: '/',
      });
    }

    return NextResponse.json({ success: true, message: 'Đăng nhập thành công' });
  } catch (error) {
    console.error('Login API error:', error);
    return NextResponse.json(
      { message: 'Có lỗi xảy ra' },
      { status: 500 }
    );
  }
}
