import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Clock, Film, Sparkles, Heart, Bookmark, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { Movie } from "@/types/movie";
import { useHistory } from "@/hooks/useHistory";
import { useFavorites } from "@/hooks/useFavorites";
import { useWatchlist } from "@/hooks/useWatchlist";
import { useReviews } from "@/hooks/useReviews";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { getExternalReviews } from "@/data/externalReviews";
import { useMemo } from "react";

interface MovieModalProps {
  movie: Movie | null;
  onClose: () => void;
  /** Mostrar la "Razón de la IA". Solo true en resultados de búsqueda IA. */
  showReason?: boolean;
}

const MovieModal = ({ movie, onClose, showReason = false }: MovieModalProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToHistory } = useHistory();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { inWatchlist, toggleWatchlist } = useWatchlist();
  const { getReview, saveReview, removeReview } = useReviews();

  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState("");

  useEffect(() => {
    if (movie) addToHistory(movie);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [movie?.title]);

  useEffect(() => {
    if (!movie) return;
    const r = getReview(movie.title);
    setRating(r?.rating ?? 0);
    setReviewText(r?.text ?? "");
    setHoverRating(0);
  }, [movie, getReview]);

  if (!movie) return null;

  const fav = isFavorite(movie.title);
  const saved = inWatchlist(movie.title);

  const handleFav = () => {
    if (!user) return toast.error("Inicia sesión para guardar favoritos");
    const added = toggleFavorite(movie);
    toast.success(added ? "Añadida a favoritos ❤️" : "Eliminada de favoritos");
  };

  const handleWatch = () => {
    if (!user) return toast.error("Inicia sesión para guardar en watchlist");
    const added = toggleWatchlist(movie);
    toast.success(added ? "Añadida a watchlist 🔖" : "Eliminada de watchlist");
  };

  const handleSaveReview = () => {
    if (!user) return toast.error("Inicia sesión para puntuar y reseñar");
    if (rating === 0) return toast.error("Selecciona al menos 1 estrella");
    saveReview(movie.title, rating, reviewText.trim());
    toast.success("Reseña guardada");
  };

  const handleClearReview = () => {
    if (!user) return;
    removeReview(movie.title);
    setRating(0);
    setReviewText("");
    toast.success("Reseña eliminada");
  };

  const handleDirectorClick = (name: string) => {
    onClose();
    navigate(`/director/${encodeURIComponent(name.trim())}`);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-md p-4"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className="glass relative w-full max-w-5xl max-h-[92vh] overflow-y-auto rounded-2xl p-0"
        >
          {/* Close */}
          <button
            onClick={onClose}
            className="absolute right-4 top-4 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-background/70 backdrop-blur-sm transition-colors hover:bg-background/90"
            aria-label="Cerrar"
          >
            <X className="h-5 w-5 text-foreground" />
          </button>

          {/* Hero */}
          <div className="relative h-72 md:h-96 overflow-hidden rounded-t-2xl">
            {movie.poster_url ? (
              <img
                src={movie.poster_url}
                alt={movie.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full gradient-primary" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-cinema-glass via-cinema-glass/40 to-transparent" />

            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
              <h2 className="font-display text-3xl font-bold text-foreground md:text-5xl">
                {movie.title}
              </h2>
              <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-muted-foreground md:text-base">
                <span>{movie.year}</span>
                <span className="h-1 w-1 rounded-full bg-muted-foreground/40" />
                <span className="flex items-center gap-1">
                  <Film className="h-4 w-4" />
                  {movie.genre}
                </span>
                {movie.runtime > 0 && (
                  <>
                    <span className="h-1 w-1 rounded-full bg-muted-foreground/40" />
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {movie.runtime} min
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="space-y-6 p-6 md:p-8">
            {/* Action buttons + meta */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={handleFav}
                className={cn(
                  "flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all",
                  fav
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                )}
              >
                <Heart className={cn("h-4 w-4", fav && "fill-current")} />
                {fav ? "En favoritos" : "Favorito"}
              </button>
              <button
                onClick={handleWatch}
                className={cn(
                  "flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all",
                  saved
                    ? "bg-accent text-accent-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                )}
              >
                <Bookmark className={cn("h-4 w-4", saved && "fill-current")} />
                {saved ? "En watchlist" : "Watchlist"}
              </button>

              {movie.tomatometer > 0 && (
                <span className="ml-auto flex items-center gap-1.5 rounded-lg bg-cinema-tomato/10 px-3 py-1.5 text-sm font-medium text-cinema-tomato">
                  🍅 {movie.tomatometer}%
                </span>
              )}
            </div>

            {/* Director chips (clickable) */}
            <div className="flex flex-wrap gap-2">
              {movie.director.split(",").map((d) => {
                const name = d.trim();
                return (
                  <button
                    key={name}
                    onClick={() => handleDirectorClick(name)}
                    className="rounded-lg bg-secondary px-3 py-1.5 text-sm font-medium text-secondary-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
                  >
                    Dir. {name}
                  </button>
                );
              })}
            </div>

            {/* Synopsis */}
            <div>
              <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Sinopsis
              </h3>
              <p className="leading-relaxed text-foreground/90">{movie.description}</p>
            </div>

            {/* AI Reason — only when coming from AI search */}
            {showReason && movie.reason && (
              <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 glow-primary-sm">
                <div className="mb-2 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-primary">
                    Razón de la IA
                  </h3>
                </div>
                <p className="text-sm leading-relaxed text-foreground/80">{movie.reason}</p>
              </div>
            )}

            {/* Review section */}
            <div className="rounded-xl border border-border bg-card/50 p-5">
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Tu valoración
              </h3>

              {!user ? (
                <p className="text-sm text-muted-foreground">
                  Inicia sesión para puntuar y dejar una reseña.
                </p>
              ) : (
                <>
                  <div className="mb-4 flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((n) => {
                      const active = (hoverRating || rating) >= n;
                      return (
                        <button
                          key={n}
                          type="button"
                          onMouseEnter={() => setHoverRating(n)}
                          onMouseLeave={() => setHoverRating(0)}
                          onClick={() => setRating(n)}
                          className="p-1 transition-transform hover:scale-110"
                          aria-label={`${n} estrellas`}
                        >
                          <Star
                            className={cn(
                              "h-7 w-7 transition-colors",
                              active
                                ? "fill-primary text-primary"
                                : "text-muted-foreground/40"
                            )}
                          />
                        </button>
                      );
                    })}
                    {rating > 0 && (
                      <span className="ml-2 text-sm text-muted-foreground">
                        {rating} / 5
                      </span>
                    )}
                  </div>

                  <textarea
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    placeholder="Escribe tu reseña (opcional)..."
                    rows={4}
                    className="w-full resize-none rounded-xl border border-border bg-background/50 p-3 text-sm focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />

                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      onClick={handleSaveReview}
                      className="gradient-primary rounded-xl px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
                    >
                      Guardar reseña
                    </button>
                    {getReview(movie.title) && (
                      <button
                        onClick={handleClearReview}
                        className="rounded-xl border border-border bg-secondary/40 px-4 py-2 text-sm font-medium hover:bg-secondary"
                      >
                        Eliminar
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default MovieModal;
