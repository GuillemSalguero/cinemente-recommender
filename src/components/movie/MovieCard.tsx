import { motion } from "framer-motion";
import type { Movie } from "@/types/movie";

interface MovieCardProps {
  movie: Movie;
  index: number;
  onClick: () => void;
}

const MovieCard = ({ movie, index, onClick }: MovieCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
      onClick={onClick}
      className="group cursor-pointer snap-center flex-shrink-0 w-[80vw] md:w-auto"
    >
      <div className="relative overflow-hidden rounded-xl bg-card transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-primary/10">
        {/* Poster */}
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

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

          {/* Tomatometer badge */}
          {movie.tomatometer > 0 && (
            <div className="absolute top-3 right-3 flex items-center gap-1 rounded-lg bg-background/80 px-2.5 py-1 text-xs font-semibold backdrop-blur-sm">
              <span>🍅</span>
              <span className="text-cinema-tomato">{movie.tomatometer}%</span>
            </div>
          )}
        </div>

        {/* Info */}
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
