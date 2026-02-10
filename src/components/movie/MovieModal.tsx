import { motion, AnimatePresence } from "framer-motion";
import { X, Clock, Film, Sparkles } from "lucide-react";
import type { Movie } from "@/types/movie";

interface MovieModalProps {
  movie: Movie | null;
  onClose: () => void;
}

const MovieModal = ({ movie, onClose }: MovieModalProps) => {
  if (!movie) return null;

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
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className="glass relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl p-0"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-background/60 backdrop-blur-sm transition-colors hover:bg-background/80"
          >
            <X className="h-5 w-5 text-foreground" />
          </button>

          {/* Poster header */}
          <div className="relative h-64 md:h-80 overflow-hidden rounded-t-2xl">
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

            {/* Title overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <h2 className="font-display text-2xl font-bold text-foreground md:text-3xl">
                {movie.title}
              </h2>
              <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                <span>{movie.year}</span>
                <span className="h-1 w-1 rounded-full bg-muted-foreground/40" />
                <span className="flex items-center gap-1">
                  <Film className="h-3.5 w-3.5" />
                  {movie.genre}
                </span>
                {movie.runtime > 0 && (
                  <>
                    <span className="h-1 w-1 rounded-full bg-muted-foreground/40" />
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {movie.runtime} min
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="space-y-5 p-6">
            {/* Meta badges */}
            <div className="flex flex-wrap gap-2">
              {movie.tomatometer > 0 && (
                <span className="flex items-center gap-1.5 rounded-lg bg-cinema-tomato/10 px-3 py-1.5 text-sm font-medium text-cinema-tomato">
                  🍅 {movie.tomatometer}%
                </span>
              )}
              <span className="rounded-lg bg-secondary px-3 py-1.5 text-sm font-medium text-secondary-foreground">
                Dir. {movie.director}
              </span>
            </div>

            {/* Synopsis */}
            <div>
              <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Sinopsis
              </h3>
              <p className="leading-relaxed text-foreground/90">{movie.description}</p>
            </div>

            {/* AI Reason */}
            {movie.reason && (
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
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default MovieModal;
