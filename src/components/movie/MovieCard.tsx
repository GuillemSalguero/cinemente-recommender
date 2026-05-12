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
  movie: Movie | any;
  index: number;
  onClick: () => void;
}

const MovieCard = ({ movie, index, onClick }: MovieCardProps) => {
  const { user } = useAuth();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { inWatchlist, toggleWatchlist } = useWatchlist();
  const { t } = useI18n();

  const displayTitle = movie.title || movie.movieTitle || "Sin título";
  const displayPoster = movie.posterUrl || movie.poster_url || movie.poster || null;
  const displayDirector = movie.director || movie.directors || "Director desconocido";
  const displayTomato = movie.tomatometer || movie.tomatometerRating || 0;
  
  // Extraemos el año (si viene "2016-11-02" sacamos "2016")
  const displayYear = movie.year || (movie.originalReleaseDate ? movie.originalReleaseDate.split('-')[0] : "N/A");

  const fav = isFavorite(displayTitle);
  const saved = inWatchlist(displayTitle);

  const handleFav = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) return toast.error(t("modal.loginFav"));
    const added = toggleFavorite(movie);
    toast.success(added ? t("modal.addedFav") : t("modal.removedFav"));
  };

  const handleWatch = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) return toast.error(t("modal.loginWatch"));
    const added = toggleWatchlist(movie);
    toast.success(added ? t("modal.addedWatch") : t("modal.removedWatch"));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
      onClick={onClick}
      // 2. CORRECCIÓN CSS: w-full hace que respete el tamaño de la columna
      className="group cursor-pointer w-full"
    >
      <div className="relative overflow-hidden rounded-xl bg-card transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-primary/10">
        <div className="relative aspect-[2/3] w-full overflow-hidden">
          
          {displayPoster && displayPoster.length > 0 ? (
            <img
              src={displayPoster}
              alt={displayTitle}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center gradient-primary">
              <span className="font-display text-2xl font-bold text-primary-foreground">
                {displayTitle.charAt(0).toUpperCase()}
              </span>
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

          {/* Botones de acción */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            <button
              onClick={handleFav}
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-full backdrop-blur-md transition-all",
                fav ? "bg-primary/90 text-primary-foreground" : "bg-background/60 text-foreground hover:bg-background/80"
              )}
            >
              <Heart className={cn("h-4 w-4", fav && "fill-current")} />
            </button>
            <button
              onClick={handleWatch}
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-full backdrop-blur-md transition-all",
                saved ? "bg-accent/90 text-accent-foreground" : "bg-background/60 text-foreground hover:bg-background/80"
              )}
            >
              <Bookmark className={cn("h-4 w-4", saved && "fill-current")} />
            </button>
          </div>

          {/* Puntuación */}
          {displayTomato > 0 && (
            <div className="absolute top-3 right-3 flex items-center gap-1 rounded-lg bg-background/80 px-2.5 py-1 text-xs font-semibold backdrop-blur-sm">
              <span>🍅</span>
              <span className="text-cinema-tomato">{displayTomato}%</span>
            </div>
          )}
        </div>

        {/* Textos de la tarjeta */}
        <div className="p-4">
          <h3 className="font-display text-base font-semibold text-foreground line-clamp-1 md:text-lg">
            {displayTitle}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {displayYear} · {displayDirector}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default MovieCard;