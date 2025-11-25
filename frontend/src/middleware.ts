import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtDecode } from 'jwt-decode';

interface DecodedToken {
  exp: number;
}

async function refreshToken(refreshTokenValue: string) {
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/token/refresh/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refresh: refreshTokenValue }),
        });

        if (!res.ok) return null;
        
        const data = await res.json();
        return data.access as string;
    } catch (error) {
        console.error('Middleware: Token refresh failed.', error);
        return null;
    }
}

// Hàm helper để xóa cookie và chuyển hướng
function logoutAndRedirect(request: NextRequest) {
    const loginUrl = new URL('/agrihcmAdmin/login', request.url);
    const response = NextResponse.redirect(loginUrl);
    // Xóa cả hai cookie
    response.cookies.delete('accessToken');
    response.cookies.delete('refreshToken');
    return response;
}

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const accessToken = request.cookies.get('accessToken')?.value;
    const refreshTokenValue = request.cookies.get('refreshToken')?.value;

    if (pathname.startsWith('/agrihcmAdmin/login')) {
        return NextResponse.next();
    }

    // Nếu thiếu 1 trong 2 token, đăng xuất ngay
    if (!accessToken || !refreshTokenValue) {
        return logoutAndRedirect(request);
    }

    try {
        const decoded = jwtDecode<DecodedToken>(accessToken);
        // Token còn hạn hơn 1 phút nữa
        const isTokenValid = Date.now() < decoded.exp * 1000 - 60000;
        
        if (isTokenValid) {
            return NextResponse.next(); // Token OK, cho qua
        }

        // Token hết hạn, tiến hành làm mới
        const newAccessToken = await refreshToken(refreshTokenValue);
        
        if (newAccessToken) {
            // Làm mới thành công
            const response = NextResponse.next();
            response.cookies.set('accessToken', newAccessToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                path: '/',
                maxAge: 60 * 60, // 1 giờ
            });
            return response;
        } else {
            // Làm mới thất bại (refreshToken cũng hết hạn) -> Đăng xuất
            return logoutAndRedirect(request);
        }

    } catch (error) {
        // Token không hợp lệ (không giải mã được) -> Đăng xuất
        console.error('Middleware: Invalid token format.', error);
        return logoutAndRedirect(request);
    }
}

export const config = {
    matcher: ['/agrihcmAdmin/:path*'],
};
