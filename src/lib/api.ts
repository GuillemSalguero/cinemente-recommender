export const AUTH_API: string =
  (import.meta.env.VITE_AUTH_API_URL as string | undefined) ?? "http://localhost:8083/api";

export const RECO_API: string =
  (import.meta.env.VITE_RECO_API_URL as string | undefined) ?? "http://localhost:8001";

const TOKEN_KEY = "cinemente_token";
const REFRESH_KEY = "cinemente_refresh_token";

export const tokenStore = {
  get(): string | null {
    try { return localStorage.getItem(TOKEN_KEY); } catch { return null; }
  },
  set(token: string) {
    try { localStorage.setItem(TOKEN_KEY, token); } catch {}
  },
  clear() {
    try { localStorage.removeItem(TOKEN_KEY); } catch {}
  },
  getRefresh(): string | null {
    try { return localStorage.getItem(REFRESH_KEY); } catch { return null; }
  },
  setRefresh(token: string) {
    try { localStorage.setItem(REFRESH_KEY, token); } catch {}
  },
  clearRefresh() {
    try { localStorage.removeItem(REFRESH_KEY); } catch {}
  },
};

async function isTokenExpired(): Promise<boolean> {
  const token = tokenStore.get();
  if (!token) return true;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
}

interface RequestOptions extends Omit<RequestInit, "body" | "headers"> {
  body?: unknown;
  headers?: Record<string, string>;
  auth?: boolean;
}

async function tryRefresh(): Promise<boolean> {
  const refreshToken = tokenStore.getRefresh();
  if (!refreshToken) return false;
  try {
    const res = await fetch(`${AUTH_API}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });
    if (!res.ok) return false;
    const data = await res.json();
    tokenStore.set(data.accessToken);
    if (data.refreshToken) tokenStore.setRefresh(data.refreshToken);
    return true;
  } catch {
    return false;
  }
}

async function request<T>(base: string, path: string, opts: RequestOptions = {}): Promise<T> {
  const { body, headers = {}, auth = true, ...rest } = opts;

  const doFetch = async () => {
    const token = auth ? tokenStore.get() : null;
    const finalHeaders: Record<string, string> = { Accept: "application/json", ...headers };
    if (body !== undefined) finalHeaders["Content-Type"] = "application/json";
    if (token) finalHeaders["Authorization"] = `Bearer ${token}`;
    return fetch(`${base}${path}`, {
      ...rest,
      headers: finalHeaders,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  };

  let res = await doFetch();

  // Token expirado — intentar renovar y reintentar una vez
  if (res.status === 401 && auth) {
    // 401 = siempre intentar refresh
    const refreshed = await tryRefresh();
    if (refreshed) {
      res = await doFetch();
    } else {
      tokenStore.clear();
      tokenStore.clearRefresh();
      window.dispatchEvent(new Event("auth:logout"));
    }
  } else if (res.status === 403 && auth) {
    // 403 = solo refresh si el token está caducado localmente
    const expired = await isTokenExpired();
    if (expired) {
      const refreshed = await tryRefresh();
      if (refreshed) {
        res = await doFetch();
      } else {
        tokenStore.clear();
        tokenStore.clearRefresh();
        window.dispatchEvent(new Event("auth:logout"));
      }
    }
  }

  const text = await res.text();
  const data = text ? safeJson(text) : null;

  if (!res.ok) {
    const msg =
      (data && typeof data === "object" && "message" in data && (data as any).message) ||
      `Request failed (${res.status})`;
    throw new Error(msg);
  }

  return data as T;
}

function safeJson(text: string): unknown {
  try { return JSON.parse(text); } catch { return text; }
}

export const authApi = {
  get: <T>(path: string, opts?: RequestOptions) => request<T>(AUTH_API, path, opts),
  post: <T>(path: string, body?: unknown, opts?: RequestOptions) =>
    request<T>(AUTH_API, path, { ...opts, method: "POST", body }),
  put: <T>(path: string, body?: unknown, opts?: RequestOptions) =>
    request<T>(AUTH_API, path, { ...opts, method: "PUT", body }),
  delete: <T>(path: string, body?: unknown, opts?: RequestOptions) =>
    request<T>(AUTH_API, path, { ...opts, method: "DELETE", body }),
};

export const recoApi = {
  get: <T>(path: string, opts?: RequestOptions) => request<T>(RECO_API, path, opts),
  post: <T>(path: string, body?: unknown, opts?: RequestOptions) =>
    request<T>(RECO_API, path, { ...opts, method: "POST", body }),
};