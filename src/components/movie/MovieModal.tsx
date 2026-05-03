import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Clock, Film, Sparkles, Heart, Bookmark, Star, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { Movie, StreamingPlatform } from "@/types/movie";
import { useHistory } from "@/hooks/useHistory";
import { useFavorites } from "@/hooks/useFavorites";
import { useWatchlist } from "@/hooks/useWatchlist";
import { useReviews } from "@/hooks/useReviews";
import { useAuth } from "@/contexts/AuthContext";
import { useI18n } from "@/i18n/I18nContext";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { getExternalReviews } from "@/data/externalReviews";
import { moviesService, mergeDetail } from "@/lib/backend";

interface MovieModalProps {
  movie: Movie | null;
  onClose: () => void;
  /** Mostrar la "Razón de la IA". Solo true en resultados de búsqueda IA. */
  showReason?: boolean;
}

const MovieModal = ({ movie, onClose, showReason = false }: MovieModalProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t, lang } = useI18n();
  const { addToHistory } = useHistory();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { inWatchlist, toggleWatchlist } = useWatchlist();
  const { getReview, saveReview, removeReview } = useReviews();

  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState("");

  // Detalle cargado del back al abrir el modal. Se mergea sobre la base.
  const [detailed, setDetailed] = useState<Movie | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  useEffect(() => {
    if (movie) addToHistory(movie);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [movie?.title]);

  useEffect(() => {
    if (!movie) {
      setDetailed(null);
      return;
    }
    const r = getReview(movie.title);
    setRating(r?.rating ?? 0);
    setReviewText(r?.text ?? "");
    setHoverRating(0);

    // Reset detalle y pedir uno nuevo cuando cambia la película.
    setDetailed(null);
    const slug = movie.link || movie.title;
    if (!slug) return;
    let cancelled = false;
    setLoadingDetail(true);
    moviesService
      .getBySlug(slug, lang)
      .then((d) => {
        if (cancelled) return;
        setDetailed(mergeDetail(movie, d));
      })
      .finally(() => {
        if (!cancelled) setLoadingDetail(false);
      });
    return () => {
      cancelled = true;
    };
  }, [movie, getReview, lang]);

  if (!movie) return null;

  // A partir de aquí trabajamos siempre con la versión enriquecida (si llegó).
  const view: Movie = detailed ?? movie;
  const fav = isFavorite(view.title);
  const saved = inWatchlist(view.title);

  const handleFav = () => {
    if (!user) return toast.error(t("modal.loginFav"));
    const added = toggleFavorite(view);
    toast.success(added ? t("modal.addedFav") : t("modal.removedFav"));
  };

  const handleWatch = () => {
    if (!user) return toast.error(t("modal.loginWatch"));
    const added = toggleWatchlist(view);
    toast.success(added ? t("modal.addedWatch") : t("modal.removedWatch"));
  };

  const handleSaveReview = () => {
    if (!user) return toast.error(t("modal.loginToReview"));
    if (rating === 0) return toast.error(t("modal.selectStars"));
    saveReview(view.title, rating, reviewText.trim());
    toast.success(t("modal.reviewSaved"));
  };

  const handleClearReview = () => {
    if (!user) return;
    removeReview(view.title);
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
            {view.poster_url ? (
              <img
                src={view.poster_url}
                alt={view.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full gradient-primary" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-cinema-glass via-cinema-glass/40 to-transparent" />

            {loadingDetail && (
              <div className="absolute right-4 top-4 z-10 flex h-9 items-center gap-2 rounded-full bg-background/70 px-3 backdrop-blur-sm">
                <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                <span className="text-xs text-muted-foreground">{t("hero.thinking")}</span>
              </div>
            )}

            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
              <h2 className="font-display text-3xl font-bold text-foreground md:text-5xl">
                {view.title}
              </h2>
              <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-muted-foreground md:text-base">
                {view.year && <span>{view.year}</span>}
                {view.genre && (
                  <>
                    <span className="h-1 w-1 rounded-full bg-muted-foreground/40" />
                    <span className="flex items-center gap-1">
                      <Film className="h-4 w-4" />
                      {view.genre}
                    </span>
                  </>
                )}
                {view.runtime > 0 && (
                  <>
                    <span className="h-1 w-1 rounded-full bg-muted-foreground/40" />
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {view.runtime} min
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

              {view.tomatometer > 0 && (
                <span className="ml-auto flex items-center gap-1.5 rounded-lg bg-cinema-tomato/10 px-3 py-1.5 text-sm font-medium text-cinema-tomato">
                  🍅 {view.tomatometer}%
                </span>
              )}
            </div>

            {/* Director chips (clickable) */}
            {view.director && (
              <div className="flex flex-wrap gap-2">
                {view.director.split(",").map((d) => {
                  const name = d.trim();
                  if (!name) return null;
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
            )}

            {/* Synopsis */}
            {view.description && (
              <div>
                <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  {t("modal.synopsis")}
                </h3>
                <p className="leading-relaxed text-foreground/90">{view.description}</p>
              </div>
            )}

            {/* AI Reason — only when coming from AI search */}
            {showReason && view.reason && (
              <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 glow-primary-sm">
                <div className="mb-2 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-primary">
                    {t("modal.aiReason")}
                  </h3>
                </div>
                <p className="text-sm leading-relaxed text-foreground/80">{view.reason}</p>
              </div>
            )}

            {/* Streaming platforms — only on AI results AND only if back returns any */}
            {showReason && view.platforms && view.platforms.length > 0 && (
              <PlatformsSection platforms={view.platforms} />
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
                    {getReview(view.title) && (
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
            <ExternalReviewsSection title={view.title} />
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default MovieModal;

function ExternalReviewsSection({ title }: { title: string }) {
  const { t } = useI18n();
  const reviews = useMemo(() => getExternalReviews(title, 12), [title]);
  const avg = useMemo(
    () => reviews.reduce((s, r) => s + r.rating, 0) / reviews.length,
    [reviews]
  );

  return (
    <div className="rounded-xl border border-border bg-card/30 p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          {t("modal.extReviews")} ({reviews.length})
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

// Presets visuales para plataformas conocidas. Si llega un id desconocido,
// usamos un fallback neutro con la inicial.
// Las claves se comparan contra el id normalizado (nombre lowercase sin espacios/símbolos).
const PLATFORM_PRESETS: Record<
  string,
  { name: string; bg: string; text: string; short: string }
> = {
  netflix:      { name: "Netflix",        bg: "bg-[#E50914]", text: "text-white", short: "N" },
  primevideo:   { name: "Prime Video",    bg: "bg-[#00A8E1]", text: "text-white", short: "P" },
  prime:        { name: "Prime Video",    bg: "bg-[#00A8E1]", text: "text-white", short: "P" },
  amazon:       { name: "Prime Video",    bg: "bg-[#00A8E1]", text: "text-white", short: "P" },
  hbo:          { name: "HBO Max",        bg: "bg-[#9b51e0]", text: "text-white", short: "H" },
  hbomax:       { name: "HBO Max",        bg: "bg-[#9b51e0]", text: "text-white", short: "H" },
  max:          { name: "Max",            bg: "bg-[#002BE7]", text: "text-white", short: "M" },
  filmin:       { name: "Filmin",         bg: "bg-[#0a8bd6]", text: "text-white", short: "F" },
  disney:       { name: "Disney+",        bg: "bg-[#113CCF]", text: "text-white", short: "D+" },
  disneyplus:   { name: "Disney+",        bg: "bg-[#113CCF]", text: "text-white", short: "D+" },
  apple:        { name: "Apple TV+",      bg: "bg-[#111111]", text: "text-white", short: "" },
  appletv:      { name: "Apple TV",       bg: "bg-[#111111]", text: "text-white", short: "" },
  appletvplus:  { name: "Apple TV+",      bg: "bg-[#111111]", text: "text-white", short: "" },
  movistar:     { name: "Movistar Plus+", bg: "bg-[#00B5E2]", text: "text-white", short: "M+" },
  movistarplus: { name: "Movistar Plus+", bg: "bg-[#00B5E2]", text: "text-white", short: "M+" },
  rakuten:      { name: "Rakuten TV",     bg: "bg-[#BF0000]", text: "text-white", short: "R" },
  rakutentv:    { name: "Rakuten TV",     bg: "bg-[#BF0000]", text: "text-white", short: "R" },
  youtube:      { name: "YouTube",        bg: "bg-[#FF0000]", text: "text-white", short: "Y" },
  skyshowtime:  { name: "SkyShowtime",    bg: "bg-[#1A1A2E]", text: "text-white", short: "S" },
};

const TYPE_LABELS: Record<string, { es: string; en: string; ca: string; de: string; fr: string }> = {
  subscription: { es: "Suscripción", en: "Subscription", ca: "Subscripció", de: "Abo", fr: "Abonnement" },
  rent:         { es: "Alquiler",    en: "Rent",         ca: "Lloguer",     de: "Leihen", fr: "Location" },
  buy:          { es: "Comprar",     en: "Buy",          ca: "Comprar",     de: "Kaufen", fr: "Acheter" },
  free:         { es: "Gratis",      en: "Free",         ca: "Gratis",      de: "Gratis", fr: "Gratuit" },
  ads:          { es: "Con anuncios",en: "With ads",     ca: "Amb anuncis", de: "Mit Werbung", fr: "Avec pubs" },
};

function PlatformsSection({ platforms }: { platforms: StreamingPlatform[] }) {
  const { t, lang } = useI18n();

  return (
    <div className="rounded-xl border border-border bg-card/40 p-5">
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        {t("modal.availableOn")}
      </h3>
      <div className="flex flex-wrap gap-2">
        {platforms.map((p) => {
          const key = p.id?.toLowerCase().trim();
          const preset = PLATFORM_PRESETS[key];
          const name = p.name || preset?.name || p.id;
          const Tag: any = p.url ? "a" : "div";
          const tagProps = p.url
            ? { href: p.url, target: "_blank", rel: "noopener noreferrer" }
            : {};
          const typeKey = (p.type || "").toLowerCase();
          const typeLabel =
            TYPE_LABELS[typeKey]?.[lang as "es" | "en" | "ca" | "de" | "fr"] ?? p.type;

          return (
            <Tag
              key={`${p.id}-${name}-${p.type ?? ""}`}
              {...tagProps}
              className={cn(
                "group flex items-center gap-2 rounded-xl border border-border bg-background/60 px-3 py-2 text-sm font-medium transition-all",
                p.url && "hover:border-primary/40 hover:bg-background hover:shadow-sm cursor-pointer"
              )}
            >
              {p.logo_url ? (
                <img
                  src={p.logo_url}
                  alt={name}
                  className="h-6 w-6 rounded object-contain"
                />
              ) : (
                <span
                  className={cn(
                    "flex h-6 w-6 items-center justify-center rounded text-[10px] font-bold",
                    preset?.bg ?? "bg-secondary",
                    preset?.text ?? "text-secondary-foreground"
                  )}
                >
                  {preset?.short ?? name.charAt(0).toUpperCase()}
                </span>
              )}
              <span className="text-foreground/90">{name}</span>
              {typeLabel && (
                <span className="rounded-md bg-secondary/70 px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
                  {typeLabel}
                </span>
              )}
            </Tag>
          );
        })}
      </div>
    </div>
  );
}

