import { useState, useCallback } from "react";
import { authApi } from "@/lib/api";
import { detailToMovie } from "@/lib/backend";
import type { Movie } from "@/types/movie";

interface BackendMovie {
  rottenTomatoesLink: string;
  movieTitle: string;
  genres: string;
  contentRating: string;
  directors: string;
  runtime: number;
  tomatometerRating: number;
  tomatometerStatus: string;
  audienceRating: number;
  audienceStatus: string;
  originalReleaseDate: string;
  posterUrl: string;
}

interface PageResponse {
  content: BackendMovie[];
  totalElements: number;
  totalPages: number;
  number: number;
}

function backendToMovie(m: BackendMovie): Movie {
  return detailToMovie(m.rottenTomatoesLink, {
    rottenTomatoesLink: m.rottenTomatoesLink,
    movieTitle: m.movieTitle,
    genres: m.genres,
    contentRating: m.contentRating,
    directors: m.directors,
    runtime: m.runtime,
    tomatometerRating: m.tomatometerRating,
    tomatometerStatus: m.tomatometerStatus,
    audienceRating: m.audienceRating,
    audienceStatus: m.audienceStatus,
    posterUrl: m.posterUrl,
    originalReleaseDate: m.originalReleaseDate,
  });
}

export function useClassicSearch() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentQuery, setCurrentQuery] = useState("");
  const [currentGenre, setCurrentGenre] = useState("");

  const search = useCallback(async (query: string, genre: string) => {
    setIsLoading(true);
    setHasSearched(true);
    setPage(0);
    setCurrentQuery(query);
    setCurrentGenre(genre);
    try {
      const params = new URLSearchParams({ page: "0", size: "20" });
      if (query.trim()) params.set("q", query.trim());
      if (genre && genre !== "all") params.set("genre", genre);
      const data = await authApi.get<PageResponse>(`/movies?${params}`);
      setMovies((data.content || []).map(backendToMovie));
      setTotalPages(data.totalPages || 0);
    } catch {
      setMovies([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadMore = useCallback(async () => {
    if (page + 1 >= totalPages) return;
    const nextPage = page + 1;
    setIsLoading(true);
    try {
      const params = new URLSearchParams({ page: String(nextPage), size: "20" });
      if (currentQuery.trim()) params.set("q", currentQuery.trim());
      if (currentGenre && currentGenre !== "all") params.set("genre", currentGenre);
      const data = await authApi.get<PageResponse>(`/movies?${params}`);
      setMovies(prev => [...prev, ...(data.content || []).map(backendToMovie)]);
      setPage(nextPage);
    } catch { /* noop */ }
    finally { setIsLoading(false); }
  }, [page, totalPages, currentQuery, currentGenre]);

  return { movies, isLoading, hasSearched, search, loadMore, hasMore: page + 1 < totalPages };
}