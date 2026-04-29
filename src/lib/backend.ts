import { authApi, recoApi, tokenStore } from "@/lib/api";
import type { Movie, StreamingPlatform } from "@/types/movie";

// ============== Tipos del backend ==============

export interface BackendUser {
  id: number;
  name: string;
  favFilms: unknown;
  friend: unknown;
}

export interface LoginResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  user: BackendUser;
}

export interface RecoResult {
  title: string; // slug "m/ex_machina"
  year: string;
  genres: string;
  directors: string;
  runtime: number;
  score: number;
  signals: { sim_avg: number | null; tomatometer: number | null; count: number | null };
  snippets: string[];
  streaming_availability: StreamingPlatform[] | null;
  link: string;
}

export interface RecoResponse {
  query: string;
  results: RecoResult[];
}

// Respuesta del endpoint de detalle: GET /api/movies?q=m/ex_machina
export interface MovieDetail {
  title?: string;
  display_title?: string;
  name?: string;
  year?: string | number;
  description?: string;
  overview?: string;
  poster_url?: string;
  poster?: string;
  genres?: string;
  genre?: string;
  directors?: string;
  director?: string;
  runtime?: number;
  tomatometer?: number;
  streaming_availability?: StreamingPlatform[] | null;
  platforms?: StreamingPlatform[] | null;
}

// ============== Auth ==============

export const authService = {
  async login(name: string, password: string): Promise<LoginResponse> {
    const res = await authApi.post<LoginResponse>("/auth/login", { name, password }, { auth: false });
    if (res?.accessToken) tokenStore.set(res.accessToken);
    return res;
  },

  async register(name: string, password: string): Promise<LoginResponse> {
    const res = await authApi.post<LoginResponse>("/auth/register", { name, password }, { auth: false });
    if (res?.accessToken) tokenStore.set(res.accessToken);
    return res;
  },

  logout() {
    tokenStore.clear();
  },
};

// ============== Recomendaciones ==============

/** Convierte un slug "m/ex_machina_2015" → "Ex Machina". */
export function titleFromSlug(slug: string): string {
  const raw = slug.replace(/^m\//, "").replace(/_/g, " ").trim();
  // Quita un año al final tipo "ex machina 2015"
  const noYear = raw.replace(/\s+\d{4}$/, "").trim();
  return noYear
    .split(" ")
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
    .join(" ");
}

export function mapRecoResult(r: RecoResult): Movie {
  const reason = (r.snippets && r.snippets[0]) || "";
  return {
    title: titleFromSlug(r.title || r.link),
    year: r.year || "",
    genre: r.genres || "",
    description: "", // se rellena al abrir el modal con el detalle
    reason,
    poster_url: "",
    director: r.directors || "",
    runtime: r.runtime || 0,
    tomatometer: r.signals?.tomatometer ?? 0,
    link: r.link || r.title,
    platforms: r.streaming_availability ?? undefined,
  };
}

export const recoService = {
  async recommend(query: string, lang?: string): Promise<Movie[]> {
    const data = await recoApi.post<RecoResponse>(
      "/recommend",
      { query, lang },
      { auth: true } // se enviará bearer si existe; ignorado si no
    );
    return (data.results || []).map(mapRecoResult);
  },
};

// ============== Detalle de película ==============

export const moviesService = {
  /**
   * Pide el detalle de una película al catálogo (servidor 8083).
   * `slugOrLink` es algo como "m/ex_machina".
   */
  async getBySlug(slugOrLink: string, lang?: string): Promise<MovieDetail | null> {
    const params = new URLSearchParams({ q: slugOrLink });
    if (lang) params.set("lang", lang);
    try {
      const data = await authApi.get<MovieDetail | MovieDetail[]>(`/movies?${params.toString()}`);
      if (!data) return null;
      if (Array.isArray(data)) return data[0] ?? null;
      return data;
    } catch (e) {
      console.warn("[moviesService] detail failed for", slugOrLink, e);
      return null;
    }
  },
};

/** Mezcla los datos del detalle del back en un Movie ya existente. */
export function mergeDetail(base: Movie, detail: MovieDetail | null): Movie {
  if (!detail) return base;
  const platforms =
    detail.platforms ?? detail.streaming_availability ?? base.platforms ?? undefined;
  return {
    ...base,
    title: detail.display_title || detail.title || detail.name || base.title,
    year: (detail.year as string) || base.year,
    genre: detail.genres || detail.genre || base.genre,
    director: detail.directors || detail.director || base.director,
    runtime: detail.runtime ?? base.runtime,
    tomatometer: detail.tomatometer ?? base.tomatometer,
    description: detail.description || detail.overview || base.description,
    poster_url: detail.poster_url || detail.poster || base.poster_url,
    platforms: platforms ?? undefined,
  };
}
