import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";

export interface Review {
  rating: number; // 1-5
  text: string;
  updatedAt: number;
}

const keyFor = (userId: string) => `cinemente_reviews_${userId}`;

type ReviewMap = Record<string, Review>;

export function useReviews() {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<ReviewMap>({});

  useEffect(() => {
    if (!user) {
      setReviews({});
      return;
    }
    try {
      const raw = localStorage.getItem(keyFor(user.id));
      setReviews(raw ? JSON.parse(raw) : {});
    } catch {
      setReviews({});
    }
  }, [user]);

  const persist = useCallback(
    (next: ReviewMap) => {
      setReviews(next);
      if (user) localStorage.setItem(keyFor(user.id), JSON.stringify(next));
    },
    [user]
  );

  const getReview = useCallback(
    (title: string): Review | undefined => reviews[title],
    [reviews]
  );

  const saveReview = useCallback(
    (title: string, rating: number, text: string) => {
      if (!user) return;
      const next = {
        ...reviews,
        [title]: { rating, text, updatedAt: Date.now() },
      };
      persist(next);
    },
    [reviews, user, persist]
  );

  const removeReview = useCallback(
    (title: string) => {
      const next = { ...reviews };
      delete next[title];
      persist(next);
    },
    [reviews, persist]
  );

  return { reviews, getReview, saveReview, removeReview };
}
