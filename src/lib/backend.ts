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
  refreshToken: string;
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
  posterUrl?: string | null;
}

export interface RecoResponse {
  query: string;
  results: RecoResult[];
}

// Respuesta del endpoint de detalle: POST /api/movies/detail body: { id: "m/..." }
export interface MovieDetail {
  rottenTomatoesLink?: string;
  movieTitle?: string;
  movieInfo?: string;
  criticsConsensus?: string;
  contentRating?: string;
  genres?: string;
  directors?: string;
  authors?: string;
  actors?: string;
  originalReleaseDate?: string;
  streamingReleaseDate?: string;
  runtime?: number;
  productionCompany?: string;
  tomatometerStatus?: string;
  tomatometerRating?: number;
  tomatometerCount?: number;
  audienceStatus?: string;
  audienceRating?: number;
  audienceCount?: number;
  tomatometerFreshCriticsCount?: number;
  // campos opcionales que algún backend podría añadir
  posterUrl?: string;
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
    posterUrl: r.posterUrl || "",
    director: r.directors || "",
    runtime: r.runtime || 0,
    tomatometer: r.signals?.tomatometer ?? 0,
    link: r.link || r.title,
    platforms: mapPlatforms(r.streaming_availability),
  };
}

export const recoService = {
  async recommend(query: string, lang?: string, max_results: number = 12): Promise<Movie[]> {
    // ENDPOINT AQUI: POST {RECO_API}/recommend   body: { query, lang }
    const data = await recoApi.post<RecoResponse>(
      "/recommend",
      { query, lang, max_results: 12 },
      { auth: true } // se enviará bearer si existe; ignorado si no
    );
    return (data.results || []).map(mapRecoResult);
  },
};

// ============== Detalle de película ==============

/**
 * Cache LRU sencilla en memoria + sessionStorage para detalles de película.
 * Evita repegar el endpoint /movies/detail por cada favorito/watchlist al recargar.
 */
const DETAIL_CACHE_MAX = 200;
const DETAIL_CACHE_KEY = "cinemente_detail_cache_v1";
const detailMemory = new Map<string, MovieDetail | null>();
const detailInflight = new Map<string, Promise<MovieDetail | null>>();

(function hydrateDetailCache() {
  try {
    const raw = sessionStorage.getItem(DETAIL_CACHE_KEY);
    if (!raw) return;
    const obj = JSON.parse(raw) as Record<string, MovieDetail | null>;
    for (const [k, v] of Object.entries(obj)) detailMemory.set(k, v);
  } catch { /* noop */ }
})();

function persistDetailCache() {
  try {
    const obj: Record<string, MovieDetail | null> = {};
    for (const [k, v] of detailMemory) obj[k] = v;
    sessionStorage.setItem(DETAIL_CACHE_KEY, JSON.stringify(obj));
  } catch { /* noop */ }
}

function setDetailCache(slug: string, value: MovieDetail | null) {
  if (detailMemory.has(slug)) detailMemory.delete(slug);
  detailMemory.set(slug, value);
  while (detailMemory.size > DETAIL_CACHE_MAX) {
    const firstKey = detailMemory.keys().next().value;
    if (firstKey === undefined) break;
    detailMemory.delete(firstKey);
  }
  persistDetailCache();
}

export const moviesService = {
  /**
   * Pide el detalle de una película al catálogo (servidor 8083).
   * `slugOrLink` es algo como "m/ex_machina".
   * Cachea el resultado en memoria + sessionStorage y deduplica peticiones en vuelo.
   */
  async getBySlug(slugOrLink: string, _lang?: string): Promise<MovieDetail | null> {
    if (detailMemory.has(slugOrLink)) {
      return detailMemory.get(slugOrLink) ?? null;
    }
    const inflight = detailInflight.get(slugOrLink);
    if (inflight) return inflight;

    const promise = (async () => {
      try {
        // ENDPOINT AQUI: POST {AUTH_API}/movies/detail  body: { id: "m/..." }
        const data = await authApi.post<MovieDetail | MovieDetail[]>("/movies/detail", {
          id: slugOrLink,
        });
        const result = !data ? null : Array.isArray(data) ? data[0] ?? null : data;
        setDetailCache(slugOrLink, result);
        return result;
      } catch (e) {
        console.warn("[moviesService] detail failed for", slugOrLink, e);
        return null;
      } finally {
        detailInflight.delete(slugOrLink);
      }
    })();
    detailInflight.set(slugOrLink, promise);
    return promise;
  },

  /** Limpia la cache (útil al hacer logout o forzar refresh). */
  clearDetailCache() {
    detailMemory.clear();
    try { sessionStorage.removeItem(DETAIL_CACHE_KEY); } catch { /* noop */ }
  },
};

/** Extrae el año (YYYY) de una fecha tipo "2010-02-12". */
function yearFromDate(date?: string): string {
  if (!date) return "";
  const m = /^(\d{4})/.exec(date);
  return m ? m[1] : "";
}

/** Mezcla los datos del detalle del back en un Movie ya existente. */
export function mergeDetail(base: Movie, detail: MovieDetail | null): Movie {
  if (!detail) return base;
  const detailPlatforms =
    (detail.platforms as StreamingPlatform[] | null | undefined) ??
    mapPlatforms(detail.streaming_availability);
  return {
    ...base,
    title: detail.movieTitle || base.title,
    year: yearFromDate(detail.originalReleaseDate) || base.year,
    genre: detail.genres || base.genre,
    director: detail.directors || base.director,
    runtime: detail.runtime ?? base.runtime,
    tomatometer: detail.tomatometerRating ?? base.tomatometer,
    description: detail.movieInfo || detail.criticsConsensus || base.description,
    posterUrl: detail.posterUrl || base.posterUrl,
    platforms: detailPlatforms ?? base.platforms ?? undefined,
  };
}

export function detailToMovie(slug: string, detail: MovieDetail | null): Movie {
  // 1. Estado inicial (mientras carga o si falla)
  const base: Movie = {
    title: titleFromSlug(slug),
    year: "",
    genre: "",
    description: "",
    reason: "",
    posterUrl: "",
    director: "",
    runtime: 0,
    tomatometer: 0,
    link: slug,
  };

  if (!detail) return base;

  // 2. Mapeo forzado (Traductor API -> App)
  return {
    ...base,
    title: detail.movieTitle || base.title,
    year: detail.originalReleaseDate ? detail.originalReleaseDate.split('-')[0] : "",
    director: detail.directors || "",
    genre: detail.genres || "",
    description: detail.movieInfo || "",
    tomatometer: detail.tomatometerRating || 0,
    runtime: detail.runtime || 0,
    posterUrl: detail.posterUrl || base.posterUrl,
  };
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
    const data = await authApi.get<any[]>("/movies/watchlist");
    return extractList(data).map((item) =>
      typeof item === "string" ? item : item.movieLink
    );
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
    const data = await authApi.get<any[]>("/movies/favorites");
    // ✅ Extraer solo el movieLink de cada objeto
    return extractList(data).map((item) =>
      typeof item === "string" ? item : item.movieLink
    );
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
  async getPublicReviews(movieLink: string): Promise<Array<{ userId: number; movieLink: string; rating: number; reviewText: string; createdAt: string }>> {
    // ENDPOINT AQUI: POST {AUTH_API}/movies/reviews/public  body: { movieLink }
    const data = await authApi.post<any>("/movies/reviews/public", { movieLink });
    return extractList(data);
  },
  async getReviews(movieLink: string): Promise<BackendReview[]> {    
    const response = await authApi.post<BackendReview[] | { items?: BackendReview[] }>(
      "/movies/SearchReviews", 
      { movieLink }
    );

    return extractList(response);
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

// ============== Friends ==============

export interface BackendFriend {
  id: number;
  name: string;
  favFilms?: unknown;
  friend?: unknown;
}

export const friendsService = {
  async searchByName(name: string): Promise<BackendFriend[]> {
    // ENDPOINT AQUI: GET {AUTH_API}/users/find/user?name=...
    const q = encodeURIComponent(name);
    const data = await authApi.get<BackendFriend[] | { items?: BackendFriend[] }>(`/users/find/user?name=${q}`);
    return extractList(data);
  },
  async getUser(userId: number | string): Promise<BackendFriend | null> {
    // ENDPOINT AQUI: GET {AUTH_API}/users/{id}
    return authApi.get<BackendFriend>(`/users/${userId}`);
  },
  async getFriends(userId: number | string): Promise<BackendFriend[]> {
    // ENDPOINT AQUI: GET {AUTH_API}/users/{id}/friends
    const data = await authApi.get<BackendFriend[] | { items?: BackendFriend[] }>(`/users/${userId}/friends`);
    return extractList(data);
  },
  async addFriend(userId: number | string, friendId: number): Promise<void> {
    // ENDPOINT AQUI: POST {AUTH_API}/users/{id}/friends  body: { friendId }
    await authApi.post<void>(`/users/${userId}/friends`, { friendId });
  },
  async removeFriend(userId: number | string, friendId: number): Promise<void> {
    // ENDPOINT AQUI: DELETE {AUTH_API}/users/{id}/friends/{friendId}
    await authApi.delete<void>(`/users/${userId}/friends/${friendId}`);
  },
  async getFriendMovies(
    userId: number | string,
    friendId: number | string
  ): Promise<{ friendId: number; friendName: string; favoriteMovies: string[]; watchlist: string[] }> {
    // ENDPOINT AQUI: GET {AUTH_API}/users/{id}/friends/{friendId}/movies
    const data = await authApi.get<{
      friendId: number;
      friendName: string;
      favoriteMovies: string[] | null;
      watchlist: string[] | null;
    }>(`/users/${userId}/friends/${friendId}/movies`);
    return {
      friendId: data?.friendId ?? Number(friendId),
      friendName: data?.friendName ?? "",
      favoriteMovies: data?.favoriteMovies ?? [],
      watchlist: data?.watchlist ?? [],
    };
  },
};

// ============== Directores favoritos (STUB) ==============
// TODO: cuando estén los endpoints reales, sustituir el cuerpo de cada función por
//   GET    {AUTH_API}/directors/favorites              -> string[]
//   POST   {AUTH_API}/directors/favorites  { name }
//   DELETE {AUTH_API}/directors/favorites  { name }
// La firma pública (Promise<string[]> / Promise<void>) ya está pensada para no
// tener que tocar el hook useFavoriteDirectors al cambiar al backend real.

export const directorsService = {
  async getFavorites(): Promise<string[]> {
    const data = await authApi.get<{ userId: number; directors: string[] }>("/directors/favorites");
    return data?.directors ?? [];
  },

  async addFavorite(name: string): Promise<void> {
    const clean = name.trim();
    if (!clean) return;
    await authApi.post<void>("/directors/like", { directorName: clean });
  },

  async removeFavorite(name: string): Promise<void> {
    const clean = name.trim();
    if (!clean) return;
    await authApi.delete<void>("/directors/like", { directorName: clean });
  },
};