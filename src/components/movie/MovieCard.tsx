import { motion } from "framer-motion";
import { Heart, Bookmark } from "lucide-react";
import type { Movie } from "@/types/movie";
import { useFavorites } from "@/hooks/useFavorites";
import { useWatchlist } from "@/hooks/useWatchlist";
import { useAuth } from "@/contexts/AuthContext";
import { useI18n } from "@/i18n/I18nContext";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface MovieCardProps {
  movie: Movie;
  index: number;
  onClick: () => void;
}

const MovieCard = ({ movie, index, onClick }: MovieCardProps) => {
  const { user } = useAuth();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { inWatchlist, toggleWatchlist } = useWatchlist();
  const { t } = useI18n();
  const fav = isFavorite(movie.title);
  const saved = inWatchlist(movie.title);

  const handleFav = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      toast.error(t("modal.loginFav"));
      return;
    }
    const added = toggleFavorite(movie);
    toast.success(added ? t("modal.addedFav") : t("modal.removedFav"));
  };

  const handleWatch = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      toast.error(t("modal.loginWatch"));
      return;
    }
    const added = toggleWatchlist(movie);
    toast.success(added ? t("modal.addedWatch") : t("modal.removedWatch"));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
      onClick={onClick}
      className="group cursor-pointer snap-center flex-shrink-0 w-[80vw] md:w-auto"
    >
      <div className="relative overflow-hidden rounded-xl bg-card transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-primary/10">
        <div className="relative aspect-[2/3] w-full overflow-hidden">
          {movie.poster_url ? (
            <img
              src={movie.poster_url}
              alt={movie.title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center gradient-primary">
              <span className="font-display text-2xl font-bold text-primary-foreground">
                {movie.title[0]}
              </span>
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

          {/* Action buttons */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            <button
              onClick={handleFav}
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-full backdrop-blur-md transition-all",
                fav
                  ? "bg-primary/90 text-primary-foreground"
                  : "bg-background/60 text-foreground hover:bg-background/80"
              )}
              aria-label={fav ? "Quitar de favoritos" : "Añadir a favoritos"}
            >
              <Heart className={cn("h-4 w-4", fav && "fill-current")} />
            </button>
            <button
              onClick={handleWatch}
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-full backdrop-blur-md transition-all",
                saved
                  ? "bg-accent/90 text-accent-foreground"
                  : "bg-background/60 text-foreground hover:bg-background/80"
              )}
              aria-label={saved ? "Quitar de watchlist" : "Añadir a watchlist"}
            >
              <Bookmark className={cn("h-4 w-4", saved && "fill-current")} />
            </button>
          </div>

          {movie.tomatometer > 0 && (
            <div className="absolute top-3 right-3 flex items-center gap-1 rounded-lg bg-background/80 px-2.5 py-1 text-xs font-semibold backdrop-blur-sm">
              <span>🍅</span>
              <span className="text-cinema-tomato">{movie.tomatometer}%</span>
            </div>
          )}
        </div>

        <div className="p-4">
          <h3 className="font-display text-base font-semibold text-foreground line-clamp-1 md:text-lg">
            {movie.title}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {movie.year} · {movie.director}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default MovieCard;
