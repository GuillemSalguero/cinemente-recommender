export type StreamingType = "subscription" | "rent" | "buy" | "free" | "ads" | string;

export interface StreamingPlatform {
  id: string;
  name?: string;
  type?: StreamingType;
  url?: string;
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
  platforms?: StreamingPlatform[];
}
