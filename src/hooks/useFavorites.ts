import { useEffect, useState, useCallback } from "react";
import type { Movie } from "@/types/movie";
import { useAuth } from "@/contexts/AuthContext";

const keyFor = (userId: string) => `cinemente_favs_${userId}`;

export function useFavorites() {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<Movie[]>([]);

  useEffect(() => {
    if (!user) {
      setFavorites([]);
      return;
    }
    try {
      const raw = localStorage.getItem(keyFor(user.id));
      setFavorites(raw ? JSON.parse(raw) : []);
    } catch {
      setFavorites([]);
    }
  }, [user]);

  const persist = useCallback(
    (next: Movie[]) => {
      setFavorites(next);
      if (user) localStorage.setItem(keyFor(user.id), JSON.stringify(next));
    },
    [user]
  );

  const isFavorite = useCallback(
    (title: string) => favorites.some((m) => m.title === title),
    [favorites]
  );

  const toggleFavorite = useCallback(
    (movie: Movie) => {
      if (!user) return false;
      const exists = favorites.some((m) => m.title === movie.title);
      const next = exists
        ? favorites.filter((m) => m.title !== movie.title)
        : [...favorites, movie];
      persist(next);
      return !exists;
    },
    [favorites, user, persist]
  );

  const removeFavorite = useCallback(
    (title: string) => {
      persist(favorites.filter((m) => m.title !== title));
    },
    [favorites, persist]
  );

  return { favorites, isFavorite, toggleFavorite, removeFavorite };
}
