const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface RequestOptions {
  method?: string;
  headers?: Record<string, string>;
  body?: string;
  cache?: RequestCache;
  requireAuth?: boolean;
}

// Helper để lấy token (ưu tiên JWT, fallback về cookie)
const getAuthToken = () => {
  // Trường hợp client-side: thử lấy từ localStorage
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('accessToken');
    if (token) return `Bearer ${token}`;
  }
  return null;
};

export async function fetchApi(endpoint: string, options: RequestOptions = {}) {
  const url = `${API_URL}/${endpoint}`;
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // Thêm token vào header nếu có
  const authToken = getAuthToken();
  if (authToken) {
    headers['Authorization'] = authToken;
  }

  try {
    const response = await fetch(url, {
      method: options.method || 'GET',
      headers,
      body: options.body,
      cache: options.cache,
      credentials: 'include', // Vẫn giữ để hỗ trợ cookies nếu cần
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Xóa token nếu có lỗi auth
        if (typeof window !== 'undefined') {
          localStorage.removeItem('accessToken');
        }
        throw new Error('401 Unauthorized');
      }
      throw new Error(`API error: ${response.status}`);
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return response.json();
    }
    return response.text();

  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
}

// Helper functions cho authentication
export const auth = {
  setToken: (token: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', token);
    }
  },

  getToken: () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('accessToken');
    }
    return null;
  },

  removeToken: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
    }
  },

  isAuthenticated: () => {
    return !!auth.getToken();
  }
};
