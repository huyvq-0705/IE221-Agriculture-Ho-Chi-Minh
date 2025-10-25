import { cookies } from 'next/headers';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

async function fetchApi(endpoint: string, options: RequestInit = {}) {
  const url = `${process.env.NEXT_PUBLIC_API_URL}/${endpoint}`;
  
  // 🔥 FIX: Merge headers đúng cách, không ghi đè
  const config: RequestInit = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}), // Merge với headers từ caller
    },
  };

  // console.log('🌐 API Request:', {
  //   method: config.method || 'GET',
  //   url,
  //   headers: config.headers,
  //   body: config.body ? JSON.parse(config.body as string) : undefined
  // });

  const response = await fetch(url, config);

  console.log('📡 API Response:', {
    status: response.status,
    statusText: response.statusText,
    ok: response.ok
  });

  if (!response.ok) {
    let errorData;
    let errorMessage = 'An error occurred';

    try {
      errorData = await response.json();
      console.error('❌ API Error Data:', JSON.stringify(errorData, null, 2));

      // Parse các dạng error phổ biến từ Django REST Framework
      if (errorData.detail) {
        errorMessage = errorData.detail;
      } else if (errorData.non_field_errors) {
        errorMessage = Array.isArray(errorData.non_field_errors) 
          ? errorData.non_field_errors[0] 
          : errorData.non_field_errors;
      } else if (typeof errorData === 'object') {
        // Lấy error message đầu tiên từ object
        const errors: string[] = [];
        for (const [field, messages] of Object.entries(errorData)) {
          if (Array.isArray(messages)) {
            errors.push(`${field}: ${messages[0]}`);
          } else if (typeof messages === 'string') {
            errors.push(`${field}: ${messages}`);
          }
        }
        errorMessage = errors.length > 0 ? errors.join(', ') : 'An error occurred';
      }
    } catch (e) {
      // Nếu không parse được JSON, dùng statusText
      errorMessage = response.statusText || 'An error occurred';
      console.error('❌ Failed to parse error response:', e);
    }

    throw new Error(errorMessage);
  }

  if (response.status === 204 || response.headers.get('Content-Length') === '0') {
    return response;
  }

  return response.json();
}

export { fetchApi };

interface FetchOptions extends RequestInit {
  headers?: Record<string, string>;
}

export async function fetchAdminApi(
  endpoint: string,
  options: FetchOptions = {}
) {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('accessToken')?.value;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // Add Authorization header if token exists
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }

    const response = await fetch(`${API_URL}/${endpoint}`, {
      ...options,
      headers,
      credentials: 'include',
    });

    // Handle 204 No Content
    if (response.status === 204) {
      return null;
    }

    let data;
    try {
      data = await response.json();
    } catch {
      data = null;
    }

    // Handle errors
    if (!response.ok) {
      // ❌ KHÔNG xóa cookies ở đây
      // Middleware sẽ xử lý khi 401/403 trả về
      
      let errorMessage = 'An error occurred';

      if (data) {
        if (typeof data === 'string') {
          errorMessage = data;
        } else if (data.detail) {
          errorMessage = data.detail;
        } else if (data.non_field_errors?.[0]) {
          errorMessage = data.non_field_errors[0];
        } else if (data.message) {
          errorMessage = data.message;
        }
      }

      throw new Error(`${errorMessage} (${response.status})`);
    }

    return data;
  } catch (error) {
    console.error('Admin API Error:', error);
    throw error;
  }
}

/**
 * Server action để xóa cookies khi token hết hạn
 * Gọi từ client khi nhận 401
 */
export async function clearAuthCookies() {
  const cookieStore = await cookies();
  cookieStore.delete('accessToken');
  cookieStore.delete('refreshToken');
}
