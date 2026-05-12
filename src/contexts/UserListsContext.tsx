import { createContext, useContext, useEffect, useState, useCallback, useRef, ReactNode } from "react";
import { userMoviesService, moviesService, detailToMovie } from "@/lib/backend";
import { useAuth } from "@/contexts/AuthContext";
import type { Movie } from "@/types/movie";

interface UserListsContextValue {
  favorites: Movie[];
  watchlist: Movie[];
  isLoading: boolean;
  isFavorite: (titleOrLink: string) => boolean;
  isInWatchlist: (titleOrLink: string) => boolean;
  toggleFavorite: (movie: Movie) => boolean;
  toggleWatchlist: (movie: Movie) => boolean;
  removeFavorite: (titleOrLink: string) => void;
  removeWatchlist: (titleOrLink: string) => void;
}

const UserListsContext = createContext<UserListsContextValue | undefined>(undefined);

export const UserListsProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<Movie[]>([]);
  const [watchlist, setWatchlist] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const favSlugs = useRef<Set<string>>(new Set());
  const watchSlugs = useRef<Set<string>>(new Set());

  // Hidrata una lista de slugs en background
  const hydrateList = (
    slugs: string[],
    setter: React.Dispatch<React.SetStateAction<Movie[]>>
  ) => {
    setter(slugs.map((s) => detailToMovie(s, null)));
    slugs.forEach((slug) => {
      moviesService.getBySlug(slug).then((d) => {
        setter((prev) =>
          prev.map((m) => (m.link === slug ? detailToMovie(slug, d) : m))
        );
      }).catch(() => {});
    });
  };

  useEffect(() => {
    if (!user) {
      setFavorites([]);
      setWatchlist([]);
      favSlugs.current = new Set();
      watchSlugs.current = new Set();
      return;
    }
    let cancelled = false;
    setIsLoading(true);
    (async () => {
      try {
        const [favs, watch] = await Promise.all([
          userMoviesService.getFavorites(),
          userMoviesService.getWatchlist(),
        ]);
        if (cancelled) return;
        favSlugs.current = new Set(favs);
        watchSlugs.current = new Set(watch);
        hydrateList(favs, setFavorites);
        hydrateList(watch, setWatchlist);
      } catch {
        if (!cancelled) { setFavorites([]); setWatchlist([]); }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [user]);

  const isFavorite = useCallback((titleOrLink: string) =>
    favSlugs.current.has(titleOrLink) ||
    favorites.some((m) => m.title === titleOrLink || m.link === titleOrLink),
    [favorites]
  );

  const isInWatchlist = useCallback((titleOrLink: string) =>
    watchSlugs.current.has(titleOrLink) ||
    watchlist.some((m) => m.title === titleOrLink || m.link === titleOrLink),
    [watchlist]
  );

  const toggleFavorite = useCallback((movie: Movie) => {
    if (!user) return false;
    const slug = movie.link || movie.title;
    const exists = favSlugs.current.has(slug);
    if (exists) {
      favSlugs.current.delete(slug);
      setFavorites((prev) => prev.filter((m) => m.link !== slug));
      userMoviesService.removeFavorite(slug).catch(() => {
        favSlugs.current.add(slug);
        setFavorites((prev) => [...prev, movie]);
      });
      return false;
    }
    favSlugs.current.add(slug);
    setFavorites((prev) => [...prev, movie]);
    userMoviesService.addFavorite(slug).catch(() => {
      favSlugs.current.delete(slug);
      setFavorites((prev) => prev.filter((m) => m.link !== slug));
    });
    return true;
  }, [favorites, user]);

  const toggleWatchlist = useCallback((movie: Movie) => {
    if (!user) return false;
    const slug = movie.link || movie.title;
    const exists = watchSlugs.current.has(slug);
    if (exists) {
      watchSlugs.current.delete(slug);
      setWatchlist((prev) => prev.filter((m) => m.link !== slug));
      userMoviesService.removeWatchlist(slug).catch(() => {
        watchSlugs.current.add(slug);
        setWatchlist((prev) => [...prev, movie]);
      });
      return false;
    }
    watchSlugs.current.add(slug);
    setWatchlist((prev) => [...prev, movie]);
    userMoviesService.addWatchlist(slug).catch(() => {
      watchSlugs.current.delete(slug);
      setWatchlist((prev) => prev.filter((m) => m.link !== slug));
    });
    return true;
  }, [watchlist, user]);

  const removeFavorite = useCallback((titleOrLink: string) => {
    const target = favorites.find((m) => m.title === titleOrLink || m.link === titleOrLink);
    const slug = target?.link || titleOrLink;
    favSlugs.current.delete(slug);
    setFavorites((prev) => prev.filter((m) => m.link !== slug && m.title !== titleOrLink));
    userMoviesService.removeFavorite(slug).catch(() => {
      if (target) { favSlugs.current.add(slug); setFavorites((prev) => [...prev, target]); }
    });
  }, [favorites]);

  const removeWatchlist = useCallback((titleOrLink: string) => {
    const target = watchlist.find((m) => m.title === titleOrLink || m.link === titleOrLink);
    const slug = target?.link || titleOrLink;
    watchSlugs.current.delete(slug);
    setWatchlist((prev) => prev.filter((m) => m.link !== slug && m.title !== titleOrLink));
    userMoviesService.removeWatchlist(slug).catch(() => {
      if (target) { watchSlugs.current.add(slug); setWatchlist((prev) => [...prev, target]); }
    });
  }, [watchlist]);

  return (
    <UserListsContext.Provider value={{
      favorites, watchlist, isLoading,
      isFavorite, isInWatchlist,
      toggleFavorite, toggleWatchlist,
      removeFavorite, removeWatchlist,
    }}>
      {children}
    </UserListsContext.Provider>
  );
};

export const useUserLists = () => {
  const ctx = useContext(UserListsContext);
  if (!ctx) throw new Error("useUserLists must be used within UserListsProvider");
  return ctx;
};