import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { userMoviesService } from "@/lib/backend";

export interface Review {
  rating: number; // 1-5
  text: string;
  updatedAt: number;
  /** Slug del back ("m/ex_machina"). */
  movieLink?: string;
}

/**
 * Reviews del usuario sincronizadas con el backend.
 * Las reviews se identifican por `movieLink`, pero la UI antigua las consultaba
 * por `title`. Para mantener compatibilidad, el `MovieModal` debe pasar el
 * `link` cuando lo tenga; si solo viene `title`, también lo aceptamos como key.
 */
type ReviewMap = Record<string, Review>;

export function useReviews(movieLink?: string) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<ReviewMap>({});

  useEffect(() => {
    if (!user) {
      setReviews({});
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const list = await userMoviesService.getReviews(movieLink);
        if (cancelled) return;
        const map: ReviewMap = {};
        for (const r of list) {
          map[r.movieLink] = {
            rating: r.rating,
            text: r.reviewText,
            movieLink: r.movieLink,
            updatedAt: Date.now(),
          };
        }
        setReviews(map);
      } catch {
        if (!cancelled) setReviews({});
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user, movieLink]);

  const getReview = useCallback(
    (key: string): Review | undefined => reviews[key],
    [reviews]
  );

  const saveReview = useCallback(
    async (key: string, rating: number, text: string) => {
      if (!user) return;
      const movieLink = key; // se espera que la UI use el slug
      const exists = !!reviews[movieLink];
      const next: ReviewMap = {
        ...reviews,
        [movieLink]: { rating, text, movieLink, updatedAt: Date.now() },
      };
      setReviews(next);
      try {
        if (exists) {
          await userMoviesService.updateReview(movieLink, rating, text);
        } else {
          await userMoviesService.createReview(movieLink, rating, text);
        }
      } catch (e) {
        // rollback
        const rollback = { ...next };
        if (exists) rollback[movieLink] = reviews[movieLink];
        else delete rollback[movieLink];
        setReviews(rollback);
        throw e;
      }
    },
    [reviews, user]
  );

  const removeReview = useCallback(
    async (key: string) => {
      const movieLink = key;
      const prev = reviews[movieLink];
      if (!prev) return;
      const next = { ...reviews };
      delete next[movieLink];
      setReviews(next);
      try {
        await userMoviesService.deleteReview(movieLink);
      } catch (e) {
        setReviews({ ...next, [movieLink]: prev });
        throw e;
      }
    },
    [reviews]
  );

  return { reviews, getReview, saveReview, removeReview };
}
