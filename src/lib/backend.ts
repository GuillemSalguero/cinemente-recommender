import { authApi, recoApi, tokenStore } from "@/lib/api";
import type { Movie, StreamingPlatform, StreamingType } from "@/types/movie";

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

/** Forma real que llega del back para cada plataforma de streaming. */
export interface BackendStreamingPlatform {
  nombre: string;
  tipo: StreamingType;
  link?: string;
  logo_url?: string;
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
  streaming_availability: BackendStreamingPlatform[] | null;
  link: string;
  /** Póster directo (TMDB u otro) que ya viene en la respuesta del recomendador. */
  poster?: string | null;
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
  streaming_availability?: BackendStreamingPlatform[] | null;
  platforms?: StreamingPlatform[] | null;
}

// ============== Auth ==============

export const authService = {
  async login(name: string, password: string): Promise<LoginResponse> {
    // ENDPOINT AQUI: POST {AUTH_API}/auth/login   body: { name, password }
    const res = await authApi.post<LoginResponse>("/auth/login", { name, password }, { auth: false });
    if (res?.accessToken) tokenStore.set(res.accessToken);
    return res;
  },

  async register(name: string, password: string): Promise<LoginResponse> {
    // ENDPOINT AQUI: POST {AUTH_API}/auth/register   body: { name, password }
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

/** Normaliza una plataforma del back ({nombre, tipo, link}) a nuestro modelo interno. */
export function mapPlatform(p: BackendStreamingPlatform): StreamingPlatform {
  const name = p.nombre || "";
  const id = name
    .toLowerCase()
    .replace(/\+/g, "")
    .replace(/[^a-z0-9]+/g, "")
    .trim();
  return {
    id: id || name,
    name,
    type: p.tipo,
    url: p.link,
    logo_url: p.logo_url,
  };
}

export function mapPlatforms(
  list: BackendStreamingPlatform[] | null | undefined
): StreamingPlatform[] | undefined {
  if (!list || list.length === 0) return undefined;
  return list.map(mapPlatform);
}

export function mapRecoResult(r: RecoResult): Movie {
  const reason = (r.snippets && r.snippets[0]) || "";
  return {
    title: titleFromSlug(r.title || r.link),
    year: r.year || "",
    genre: r.genres || "",
    description: "", // se rellena al abrir el modal con el detalle
    reason,
    poster_url: r.poster || "",
    director: r.directors || "",
    runtime: r.runtime || 0,
    tomatometer: r.signals?.tomatometer ?? 0,
    link: r.link || r.title,
    platforms: mapPlatforms(r.streaming_availability),
  };
}

export const recoService = {
  async recommend(query: string, lang?: string): Promise<Movie[]> {
    // ENDPOINT AQUI: POST {RECO_API}/recommend   body: { query, lang }
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
      // ENDPOINT AQUI: GET {AUTH_API}/movies?q={slug}&lang={lang}
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
  const detailPlatforms =
    (detail.platforms as StreamingPlatform[] | null | undefined) ??
    mapPlatforms(detail.streaming_availability);
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
    platforms: detailPlatforms ?? base.platforms ?? undefined,
  };
}

/** Crea un Movie mínimo a partir de un slug + (opcional) detalle del back. */
export function detailToMovie(slug: string, detail: MovieDetail | null): Movie {
  const base: Movie = {
    title: titleFromSlug(slug),
    year: "",
    genre: "",
    description: "",
    reason: "",
    poster_url: "",
    director: "",
    runtime: 0,
    tomatometer: 0,
    link: slug,
  };
  return mergeDetail(base, detail);
}

// ============== Watchlist / Favorites / Reviews ==============

export interface BackendReview {
  movieLink: string;
  rating: number;
  reviewText: string;
}

const extractList = <T>(data: T[] | { items?: T[] } | null | undefined): T[] => {
  if (!data) return [];
  return Array.isArray(data) ? data : data.items ?? [];
};

export const userMoviesService = {
  // ---- Watchlist ----
  async getWatchlist(): Promise<string[]> {
    // ENDPOINT AQUI: GET {AUTH_API}/movies/watchlist  → string[] de slugs
    return extractList(await authApi.get<string[] | { items?: string[] }>("/movies/watchlist"));
  },
  async addWatchlist(movieLink: string): Promise<void> {
    // ENDPOINT AQUI: POST {AUTH_API}/movies/watchlist  body: { movieLink }
    await authApi.post<void>("/movies/watchlist", { movieLink });
  },
  async removeWatchlist(movieLink: string): Promise<void> {
    // ENDPOINT AQUI: DELETE {AUTH_API}/movies/watchlist  body: { movieLink }
    await authApi.delete<void>("/movies/watchlist", { movieLink });
  },

  // ---- Favorites ----
  async getFavorites(): Promise<string[]> {
    // ENDPOINT AQUI: GET {AUTH_API}/movies/favorites  → string[] de slugs
    return extractList(await authApi.get<string[] | { items?: string[] }>("/movies/favorites"));
  },
  async addFavorite(movieLink: string): Promise<void> {
    // ENDPOINT AQUI: POST {AUTH_API}/movies/favorites  body: { movieLink }
    await authApi.post<void>("/movies/favorites", { movieLink });
  },
  async removeFavorite(movieLink: string): Promise<void> {
    // ENDPOINT AQUI: DELETE {AUTH_API}/movies/favorites  body: { movieLink }
    await authApi.delete<void>("/movies/favorites", { movieLink });
  },

  // ---- Reviews ----
  async getReviews(): Promise<BackendReview[]> {
    // ENDPOINT AQUI: GET {AUTH_API}/movies/reviews  → BackendReview[]
    return extractList(await authApi.get<BackendReview[] | { items?: BackendReview[] }>("/movies/reviews"));
  },
  async createReview(movieLink: string, rating: number, reviewText: string): Promise<void> {
    // ENDPOINT AQUI: POST {AUTH_API}/movies/reviews  body: { movieLink, rating, reviewText }
    await authApi.post<void>("/movies/reviews", { movieLink, rating, reviewText });
  },
  async updateReview(movieLink: string, rating: number, reviewText: string): Promise<void> {
    // ENDPOINT AQUI: PUT {AUTH_API}/movies/reviews  body: { movieLink, rating, reviewText }
    await authApi.put<void>("/movies/reviews", { movieLink, rating, reviewText });
  },
  async deleteReview(movieLink: string): Promise<void> {
    // ENDPOINT AQUI: DELETE {AUTH_API}/movies/reviews  body: { movieLink }
    await authApi.delete<void>("/movies/reviews", { movieLink });
  },
};
