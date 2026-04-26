import { useEffect, useState, useCallback } from "react";
import type { Movie } from "@/types/movie";
import { useAuth } from "@/contexts/AuthContext";

export interface HistoryEntry {
  movie: Movie;
  viewedAt: number; // ms timestamp
}

const keyFor = (userId: string) => `cinemente_history_${userId}`;
const MONTH_MS = 30 * 24 * 60 * 60 * 1000;
const MAX_ENTRIES = 200;

const readHistory = (userId: string): HistoryEntry[] => {
  try {
    const raw = localStorage.getItem(keyFor(userId));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export function useHistory() {
  const { user } = useAuth();
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    if (!user) {
      setHistory([]);
      return;
    }
    setHistory(readHistory(user.id));
  }, [user]);

  const addToHistory = useCallback(
    (movie: Movie) => {
      if (!user) return;
      const current = readHistory(user.id);
      // Drop previous occurrences of same title to avoid duplicates
      const filtered = current.filter((h) => h.movie.title !== movie.title);
      const next: HistoryEntry[] = [
        { movie, viewedAt: Date.now() },
        ...filtered,
      ].slice(0, MAX_ENTRIES);
      localStorage.setItem(keyFor(user.id), JSON.stringify(next));
      setHistory(next);
    },
    [user]
  );

  const clearHistory = useCallback(() => {
    if (!user) return;
    localStorage.removeItem(keyFor(user.id));
    setHistory([]);
  }, [user]);

  const lastMonth = history.filter((h) => Date.now() - h.viewedAt <= MONTH_MS);

  return { history, lastMonth, addToHistory, clearHistory };
}

export function getHistoryFor(userId: string): HistoryEntry[] {
  return readHistory(userId);
}
