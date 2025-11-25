export async function getCookie(name: string) {
  const m = document.cookie.match('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)');
  return m ? decodeURIComponent(m.pop() as string) : null;
}

async function getAccessToken(): Promise<string | null> {
  try {
    const fromLocal = localStorage.getItem("accessToken");
    if (fromLocal) return fromLocal;
  } catch {}
  return await getCookie("accessToken");
}

async function getRefreshToken(): Promise<string | null> {
  try {
    const r = localStorage.getItem("refreshToken");
    if (r) return r;
  } catch {}
  return await getCookie("refreshToken");
}

export async function fetchWithAuth(input: RequestInfo, init: RequestInit = {}, apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000") {
  let url = typeof input === "string" ? input : (input as Request).url;
  if (url.startsWith("/")) url = `${apiBase}${url}`;
  else if (!/^https?:\/\//.test(url) && !url.startsWith(apiBase)) url = `${apiBase}${url}`;

  const token = await getAccessToken();
  const baseHeaders = { "Content-Type": "application/json", ...(init.headers || {}) } as Record<string, string>;

  if (token) {
    baseHeaders["Authorization"] = `Bearer ${token}`;
  }

  console.debug("[fetchWithAuth] -> url:", url, "hasAccessToken:", !!token);

  const firstRes = await fetch(url, { ...init, headers: baseHeaders, credentials: "include" });

  if (firstRes.status !== 401) {
    return firstRes;
  }

  console.debug("[fetchWithAuth] first attempt 401, trying refresh");

  const refresh = await getRefreshToken();
  if (!refresh) {
    console.debug("[fetchWithAuth] no refresh token available");
    return firstRes;
  }

  let refreshRes: Response;
  try {
    refreshRes = await fetch(`${apiBase}/api/token/refresh/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh }),
      credentials: "include",
    });
  } catch (err) {
    console.debug("[fetchWithAuth] refresh request failed", err);
    return firstRes;
  }

  if (!refreshRes.ok) {
    console.debug("[fetchWithAuth] refresh returned non-ok", refreshRes.status);
    return firstRes;
  }

  const tokens = await refreshRes.json().catch(() => null);
  if (tokens?.access) {
    try {
      localStorage.setItem("accessToken", tokens.access);
      if (tokens.refresh) localStorage.setItem("refreshToken", tokens.refresh);
    } catch {}
  }

  const retryHeaders = { "Content-Type": "application/json", ...(init.headers || {}) } as Record<string, string>;
  if (tokens?.access) retryHeaders["Authorization"] = `Bearer ${tokens.access}`;
  else if (token) retryHeaders["Authorization"] = `Bearer ${token}`;

  console.debug("[fetchWithAuth] retrying request with new token:", !!tokens?.access);

  const retry = await fetch(url, { ...init, headers: retryHeaders, credentials: "include" });
  return retry;
}
