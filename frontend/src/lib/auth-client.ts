export const LOGIN_ROUTE = '/login';
export const REGISTER_ROUTE = '/register';

export function isLoggedIn(): boolean {
  if (typeof window === 'undefined') return false;
  
  // Check if access token exists in localStorage
  const token = localStorage.getItem('access_token');
  return !!token;
}

export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('access_token');
}

export function setAccessToken(token: string) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('access_token', token);
}

export function clearAuth() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
}
