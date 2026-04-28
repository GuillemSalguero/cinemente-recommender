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
import { useI18n } from "@/i18n/I18nContext";
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
  const { t } = useI18n();
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
    if (!user) return toast.error(t("modal.loginFav"));
    const added = toggleFavorite(movie);
    toast.success(added ? t("modal.addedFav") : t("modal.removedFav"));
  };

  const handleWatch = () => {
    if (!user) return toast.error(t("modal.loginWatch"));
    const added = toggleWatchlist(movie);
    toast.success(added ? t("modal.addedWatch") : t("modal.removedWatch"));
  };

  const handleSaveReview = () => {
    if (!user) return toast.error(t("modal.loginToReview"));
    if (rating === 0) return toast.error(t("modal.selectStars"));
    saveReview(movie.title, rating, reviewText.trim());
    toast.success(t("modal.reviewSaved"));
  };

  const handleClearReview = () => {
    if (!user) return;
    removeReview(movie.title);
    setRating(0);
    setReviewText("");
    toast.success(t("modal.reviewDeleted"));
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
            aria-label={t("modal.close")}
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
                {fav ? t("modal.inFav") : t("modal.fav")}
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
                {saved ? t("modal.inWatch") : t("nav.watchlist")}
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
                {t("modal.synopsis")}
              </h3>
              <p className="leading-relaxed text-foreground/90">{movie.description}</p>
            </div>

            {/* AI Reason — only when coming from AI search */}
            {showReason && movie.reason && (
              <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 glow-primary-sm">
                <div className="mb-2 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-primary">
                    {t("modal.aiReason")}
                  </h3>
                </div>
                <p className="text-sm leading-relaxed text-foreground/80">{movie.reason}</p>
              </div>
            )}

            {/* Review section */}
            <div className="rounded-xl border border-border bg-card/50 p-5">
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                {t("modal.yourRating")}
              </h3>

              {!user ? (
                <p className="text-sm text-muted-foreground">
                  {t("modal.loginToReview")}
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
                    placeholder={t("modal.reviewPlaceholder")}
                    rows={4}
                    className="w-full resize-none rounded-xl border border-border bg-background/50 p-3 text-sm focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />

                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      onClick={handleSaveReview}
                      className="gradient-primary rounded-xl px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
                    >
                      {t("modal.saveReview")}
                    </button>
                    {getReview(movie.title) && (
                      <button
                        onClick={handleClearReview}
                        className="rounded-xl border border-border bg-secondary/40 px-4 py-2 text-sm font-medium hover:bg-secondary"
                      >
                        {t("common.delete")}
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* External reviews */}
            <ExternalReviewsSection title={movie.title} />
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default MovieModal;

function ExternalReviewsSection({ title }: { title: string }) {
  const reviews = useMemo(() => getExternalReviews(title, 12), [title]);
  const avg = useMemo(
    () => reviews.reduce((s, r) => s + r.rating, 0) / reviews.length,
    [reviews]
  );

  return (
    <div className="rounded-xl border border-border bg-card/30 p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Reseñas externas ({reviews.length})
        </h3>
        <div className="flex items-center gap-1.5 text-sm">
          <Star className="h-4 w-4 fill-primary text-primary" />
          <span className="font-semibold">{avg.toFixed(1)}</span>
          <span className="text-muted-foreground">/ 5</span>
        </div>
      </div>

      <div className="space-y-3">
        {reviews.map((r, i) => (
          <div
            key={`${r.author}-${i}`}
            className="rounded-lg border border-border/60 bg-background/40 p-4"
          >
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full gradient-primary text-xs font-bold text-primary-foreground">
                  {r.author
                    .split(" ")
                    .map((p) => p[0])
                    .slice(0, 2)
                    .join("")}
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{r.author}</p>
                  <p className="text-xs text-muted-foreground">
                    {r.source} · {r.date}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((n) => (
                  <Star
                    key={n}
                    className={cn(
                      "h-3.5 w-3.5",
                      r.rating >= n
                        ? "fill-primary text-primary"
                        : "text-muted-foreground/30"
                    )}
                  />
                ))}
                <span className="ml-1 text-xs text-muted-foreground">
                  {r.rating.toFixed(1)}
                </span>
              </div>
            </div>
            <p className="text-sm leading-relaxed text-foreground/80">{r.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
