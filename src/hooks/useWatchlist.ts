import { useEffect, useState, useCallback } from "react";
import type { Movie } from "@/types/movie";
import { useAuth } from "@/contexts/AuthContext";

const keyFor = (userId: string) => `cinemente_watchlist_${userId}`;

export function useWatchlist() {
  const { user } = useAuth();
  const [watchlist, setWatchlist] = useState<Movie[]>([]);

  useEffect(() => {
    if (!user) {
      setWatchlist([]);
      return;
    }
    try {
      const raw = localStorage.getItem(keyFor(user.id));
      setWatchlist(raw ? JSON.parse(raw) : []);
    } catch {
      setWatchlist([]);
    }
  }, [user]);

  const persist = useCallback(
    (next: Movie[]) => {
      setWatchlist(next);
      if (user) localStorage.setItem(keyFor(user.id), JSON.stringify(next));
    },
    [user]
  );

  const inWatchlist = useCallback(
    (title: string) => watchlist.some((m) => m.title === title),
    [watchlist]
  );

  const toggleWatchlist = useCallback(
    (movie: Movie) => {
      if (!user) return false;
      const exists = watchlist.some((m) => m.title === movie.title);
      const next = exists
        ? watchlist.filter((m) => m.title !== movie.title)
        : [...watchlist, movie];
      persist(next);
      return !exists;
    },
    [watchlist, user, persist]
  );

  const removeFromWatchlist = useCallback(
    (title: string) => {
      persist(watchlist.filter((m) => m.title !== title));
    },
    [watchlist, persist]
  );

  return { watchlist, inWatchlist, toggleWatchlist, removeFromWatchlist };
}
