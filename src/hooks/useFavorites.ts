import { useEffect, useState, useCallback, useRef } from "react";
import type { Movie } from "@/types/movie";
import { useAuth } from "@/contexts/AuthContext";
import { userMoviesService, moviesService, detailToMovie } from "@/lib/backend";

/**
 * Favoritos sincronizados con el backend.
 * El back guarda solo slugs ("m/ex_machina"); aquí los hidratamos con el detalle
 * para poder pintar las cards completas.
 */
export function useFavorites() {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<Movie[]>([]);
  // Set de slugs en favoritos (rápido para isFavorite y para evitar refetch).
  const slugsRef = useRef<Set<string>>(new Set());

  const setSlugs = (slugs: string[]) => {
    slugsRef.current = new Set(slugs);
  };

  // Carga inicial cuando hay usuario.
  useEffect(() => {
    if (!user) {
      setFavorites([]);
      slugsRef.current = new Set();
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const slugs = await userMoviesService.getFavorites();
        if (cancelled) return;
        setSlugs(slugs);
        // Pinta inmediatamente con datos mínimos para no bloquear la UI.
        setFavorites(slugs.map((s) => detailToMovie(s, null)));
        // Hidrata cada película en background y va actualizando conforme llegan.
        slugs.forEach((slug) => {
          moviesService
            .getBySlug(slug)
            .then((d) => {
              if (cancelled) return;
              setFavorites((prev) =>
                prev.map((m) => (m.link === slug ? detailToMovie(slug, d) : m))
              );
            })
            .catch(() => { /* ya hay placeholder */ });
        });
      } catch {
        if (!cancelled) setFavorites([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const isFavorite = useCallback(
    (titleOrLink: string) =>
      slugsRef.current.has(titleOrLink) ||
      favorites.some((m) => m.title === titleOrLink || m.link === titleOrLink),
    [favorites]
  );

  const toggleFavorite = useCallback(
    (movie: Movie) => {
      if (!user) return false;
      const slug = movie.link || movie.title;
      const exists = slugsRef.current.has(slug) || favorites.some((m) => m.link === slug);

      if (exists) {
        slugsRef.current.delete(slug);
        setFavorites((prev) => prev.filter((m) => m.link !== slug && m.title !== movie.title));
        userMoviesService.removeFavorite(slug).catch(() => {
          // rollback
          slugsRef.current.add(slug);
          setFavorites((prev) => [...prev, movie]);
        });
        return false;
      }
      slugsRef.current.add(slug);
      setFavorites((prev) => [...prev, movie]);
      userMoviesService.addFavorite(slug).catch(() => {
        slugsRef.current.delete(slug);
        setFavorites((prev) => prev.filter((m) => m.link !== slug));
      });
      return true;
    },
    [favorites, user]
  );

  const removeFavorite = useCallback(
    (titleOrLink: string) => {
      const target = favorites.find((m) => m.title === titleOrLink || m.link === titleOrLink);
      const slug = target?.link || titleOrLink;
      slugsRef.current.delete(slug);
      setFavorites((prev) => prev.filter((m) => m.link !== slug && m.title !== titleOrLink));
      userMoviesService.removeFavorite(slug).catch(() => {
        if (target) {
          slugsRef.current.add(slug);
          setFavorites((prev) => [...prev, target]);
        }
      });
    },
    [favorites]
  );

  return { favorites, isFavorite, toggleFavorite, removeFavorite };
}
