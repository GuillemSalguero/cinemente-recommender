export type StreamingType = "subscription" | "rent" | "buy" | "free" | "ads" | string;

export interface StreamingPlatform {
  /** Identificador interno (derivado de `nombre` si el back no lo manda). */
  id: string;
  /** Nombre legible (en el back llega como `nombre`). */
  name?: string;
  /** Tipo de disponibilidad (en el back llega como `tipo`): subscription, rent, buy... */
  type?: StreamingType;
  /** URL directa para ver/comprar/alquilar en esa plataforma (en el back llega como `link`). */
  url?: string;
  /** Logo opcional. */
  logo_url?: string;
}

export interface Movie {
  title: string;
  year: string;
  genre: string;
  description: string;
  reason: string;
  posterUrl: string;
  director: string;
  runtime: number;
  tomatometer: number;
  link: string;
  /** Plataformas donde está disponible. Solo se renderizan si llegan del back. */
  platforms?: StreamingPlatform[];
}
