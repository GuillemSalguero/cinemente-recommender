import { useUserLists } from "@/contexts/UserListsContext";

export function useWatchlist() {
  const { watchlist, isInWatchlist, toggleWatchlist, removeWatchlist } = useUserLists();
  return { 
    watchlist, 
    inWatchlist: isInWatchlist, 
    toggleWatchlist, 
    removeFromWatchlist: removeWatchlist 
  };
}