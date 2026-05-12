import { useUserLists } from "@/contexts/UserListsContext";

export function useFavoriteDirectors() {
  const { directors, isDirectorFav, toggleDirector } = useUserLists();
  return { directors, isDirectorFav, toggleDirector };
}