/**
 * Cliente HTTP centralizado para los dos backends de CineMente.
 *
 * - AUTH_API: http://localhost:8083/api  → auth + catálogo (/movies, etc.)
 * - RECO_API: http://localhost:8001      → motor de recomendaciones
 *
 * Si hay un accessToken guardado, se envía como `Authorization: Bearer ...`
 * en TODAS las llamadas (los endpoints públicos lo ignoran).
 */

export const AUTH_API: string =
  (import.meta.env.VITE_AUTH_API_URL as string | undefined) ?? "http://localhost:8083/api";

export const RECO_API: string =
  (import.meta.env.VITE_RECO_API_URL as string | undefined) ?? "http://localhost:8001";

const TOKEN_KEY = "cinemente_token";

export const tokenStore = {
  get(): string | null {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },
  set(token: string) {
    try {
      localStorage.setItem(TOKEN_KEY, token);
    } catch {
      /* noop */
    }
  },
  clear() {
    try {
      localStorage.removeItem(TOKEN_KEY);
    } catch {
      /* noop */
    }
  },
};

interface RequestOptions extends Omit<RequestInit, "body" | "headers"> {
  body?: unknown;
  headers?: Record<string, string>;
  /** Forzar enviar/omitir el Bearer. Por defecto: enviar si existe. */
  auth?: boolean;
}

async function request<T>(base: string, path: string, opts: RequestOptions = {}): Promise<T> {
  const { body, headers = {}, auth = true, ...rest } = opts;

  const token = auth ? tokenStore.get() : null;
  const finalHeaders: Record<string, string> = {
    Accept: "application/json",
    ...headers,
  };
  if (body !== undefined) finalHeaders["Content-Type"] = "application/json";
  if (token) finalHeaders["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${base}${path}`, {
    ...rest,
    headers: finalHeaders,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

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
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
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
