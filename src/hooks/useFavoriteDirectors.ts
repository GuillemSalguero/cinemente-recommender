import { useEffect, useState, useCallback, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { directorsService } from "@/lib/backend";

/**
 * Directores favoritos del usuario.
 * Por ahora persistido en localStorage vía directorsService (stub).
 * Cuando el backend exponga los endpoints, solo hay que cambiar el cuerpo del
 * service: este hook seguirá funcionando igual.
 */
export function useFavoriteDirectors() {
  const { user } = useAuth();
  const [directors, setDirectors] = useState<string[]>([]);
  const setRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!user) {
      setDirectors([]);
      setRef.current = new Set();
      return;
    }
    let cancelled = false;
    directorsService
      .getFavorites()
      .then((list) => {
        if (cancelled) return;
        setRef.current = new Set(list);
        setDirectors(list);
      })
      .catch(() => {
        if (!cancelled) setDirectors([]);
      });
    return () => {
      cancelled = true;
    };
  }, [user]);

  const isDirectorFav = useCallback(
    (name: string) => setRef.current.has(name.trim()),
    [directors]
  );

  const toggleDirector = useCallback(
    (name: string) => {
      if (!user) return false;
      const clean = name.trim();
      if (!clean) return false;
      const exists = setRef.current.has(clean);
      if (exists) {
        setRef.current.delete(clean);
        setDirectors((prev) => prev.filter((d) => d !== clean));
        directorsService.removeFavorite(clean).catch(() => {
          setRef.current.add(clean);
          setDirectors((prev) => [...prev, clean]);
        });
        return false;
      }
      setRef.current.add(clean);
      setDirectors((prev) => [...prev, clean]);
      directorsService.addFavorite(clean).catch(() => {
        setRef.current.delete(clean);
        setDirectors((prev) => prev.filter((d) => d !== clean));
      });
      return true;
    },
    [user]
  );

  return { directors, isDirectorFav, toggleDirector };
}
