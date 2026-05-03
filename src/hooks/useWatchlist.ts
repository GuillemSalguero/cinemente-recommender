import { useEffect, useState, useCallback, useRef } from "react";
import type { Movie } from "@/types/movie";
import { useAuth } from "@/contexts/AuthContext";
import { userMoviesService, moviesService, detailToMovie } from "@/lib/backend";

/**
 * Watchlist sincronizada con el backend.
 * El back guarda solo slugs ("m/ex_machina"); aquí los hidratamos con detalle
 * para pintar las cards completas.
 */
export function useWatchlist() {
  const { user } = useAuth();
  const [watchlist, setWatchlist] = useState<Movie[]>([]);
  const slugsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!user) {
      setWatchlist([]);
      slugsRef.current = new Set();
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const slugs = await userMoviesService.getWatchlist();
        if (cancelled) return;
        slugsRef.current = new Set(slugs);
        const detailed = await Promise.all(
          slugs.map(async (slug) => {
            try {
              const d = await moviesService.getBySlug(slug);
              return detailToMovie(slug, d);
            } catch {
              return detailToMovie(slug, null);
            }
          })
        );
        if (!cancelled) setWatchlist(detailed);
      } catch {
        if (!cancelled) setWatchlist([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const inWatchlist = useCallback(
    (titleOrLink: string) =>
      slugsRef.current.has(titleOrLink) ||
      watchlist.some((m) => m.title === titleOrLink || m.link === titleOrLink),
    [watchlist]
  );

  const toggleWatchlist = useCallback(
    (movie: Movie) => {
      if (!user) return false;
      const slug = movie.link || movie.title;
      const exists = slugsRef.current.has(slug) || watchlist.some((m) => m.link === slug);

      if (exists) {
        slugsRef.current.delete(slug);
        setWatchlist((prev) => prev.filter((m) => m.link !== slug && m.title !== movie.title));
        userMoviesService.removeWatchlist(slug).catch(() => {
          slugsRef.current.add(slug);
          setWatchlist((prev) => [...prev, movie]);
        });
        return false;
      }
      slugsRef.current.add(slug);
      setWatchlist((prev) => [...prev, movie]);
      userMoviesService.addWatchlist(slug).catch(() => {
        slugsRef.current.delete(slug);
        setWatchlist((prev) => prev.filter((m) => m.link !== slug));
      });
      return true;
    },
    [watchlist, user]
  );

  const removeFromWatchlist = useCallback(
    (titleOrLink: string) => {
      const target = watchlist.find((m) => m.title === titleOrLink || m.link === titleOrLink);
      const slug = target?.link || titleOrLink;
      slugsRef.current.delete(slug);
      setWatchlist((prev) => prev.filter((m) => m.link !== slug && m.title !== titleOrLink));
      userMoviesService.removeWatchlist(slug).catch(() => {
        if (target) {
          slugsRef.current.add(slug);
          setWatchlist((prev) => [...prev, target]);
        }
      });
    },
    [watchlist]
  );

  return { watchlist, inWatchlist, toggleWatchlist, removeFromWatchlist };
}
