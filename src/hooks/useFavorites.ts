import { useUserLists } from "@/contexts/UserListsContext";

export function useFavorites() {
  const { favorites, isFavorite, toggleFavorite, removeFavorite } = useUserLists();
  return { favorites, isFavorite, toggleFavorite, removeFavorite };
}