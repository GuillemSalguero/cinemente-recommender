import { useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Film } from "lucide-react";
import MovieCard from "@/components/movie/MovieCard";
import MovieModal from "@/components/movie/MovieModal";
import { moviesByDirector } from "@/data/catalog";
import type { Movie } from "@/types/movie";

const Director = () => {
  const { name = "" } = useParams();
  const navigate = useNavigate();
  const directorName = decodeURIComponent(name);
  const [selected, setSelected] = useState<Movie | null>(null);

  const movies = useMemo(() => moviesByDirector(directorName), [directorName]);

  return (
    <div className="px-4 py-8 md:px-8">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto max-w-6xl"
      >
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver
        </button>

        <header className="mb-8">
          <div className="mb-2 flex items-center gap-2">
            <Film className="h-5 w-5 text-primary" />
            <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
              Filmografía
            </span>
          </div>
          <h1 className="font-display text-3xl font-bold md:text-4xl">
            <span className="gradient-text">{directorName}</span>
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {movies.length} {movies.length === 1 ? "película" : "películas"} en el catálogo
          </p>
        </header>

        {movies.length === 0 ? (
          <div className="glass rounded-2xl p-12 text-center text-muted-foreground">
            No hay películas de este director en el catálogo todavía.
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {movies.map((movie, i) => (
              <MovieCard
                key={movie.title}
                movie={movie}
                index={i}
                onClick={() => setSelected(movie)}
              />
            ))}
          </div>
        )}
      </motion.div>

      <MovieModal movie={selected} onClose={() => setSelected(null)} />
    </div>
  );
};

export default Director;
