export interface StreamingPlatform {
  /** Identificador conocido (netflix, prime, hbo, filmin, disney, apple, movistar, ...) o cualquier slug del back. */
  id: string;
  /** Nombre legible. Si no llega, se infiere del id. */
  name?: string;
  /** URL directa para ver la película en esa plataforma. */
  url?: string;
  /** Logo opcional servido por el back. */
  logo_url?: string;
}

export interface Movie {
  title: string;
  year: string;
  genre: string;
  description: string;
  reason: string;
  poster_url: string;
  director: string;
  runtime: number;
  tomatometer: number;
  link: string;
  /** Plataformas donde está disponible. Solo se renderizan si llegan del back. */
  platforms?: StreamingPlatform[];
}

