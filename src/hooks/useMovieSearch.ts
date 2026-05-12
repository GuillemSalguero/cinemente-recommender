import { useState, useCallback } from "react";
import { toast } from "sonner";
import type { Movie } from "@/types/movie";
import { recoService, type RecoAlgorithm } from "@/lib/backend";
import { useI18n } from "@/i18n/I18nContext";

const MAX = 12;

export function useMovieSearch() {
  const { lang } = useI18n();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [allResults, setAllResults] = useState<Movie[]>([]);

  const search = useCallback(
    async (query: string, algorithm?: RecoAlgorithm) => {
      if (!query.trim()) return;
      setIsLoading(true);
      setHasSearched(true);
      try {
        const results = await recoService.recommend(query.trim(), lang, 12, algorithm);
        const capped = results.slice(0, MAX);
        setAllResults(capped);
        // Mostrar las 4 primeras (desktop) y desejar el resto para "load more".
        setMovies(capped.slice(0, 4));
      } catch (e) {
        console.error("[search] error", e);
        toast.error(e instanceof Error ? e.message : "Error en la búsqueda");
        setMovies([]);
        setAllResults([]);
      } finally {
        setIsLoading(false);
      }
    },
    [lang]
  );

  const loadMore = useCallback(
    async (isMobile: boolean) => {
      if (movies.length >= MAX || movies.length >= allResults.length) return;
      setIsLoadingMore(true);
      // Pequeño delay para mantener la transición fluida.
      await new Promise((r) => setTimeout(r, 300));
      const count = isMobile ? 3 : 4;
      const next = allResults.slice(0, Math.min(MAX, movies.length + count));
      setMovies(next);
      setIsLoadingMore(false);
    },
    [movies, allResults]
  );

  const showLoadMore =
    movies.length > 0 && movies.length < MAX && movies.length < allResults.length;

  return { movies, isLoading, isLoadingMore, hasSearched, search, loadMore, showLoadMore };
}
