import { useMemo, useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Film, Loader2 } from "lucide-react";
import MovieCard from "@/components/movie/MovieCard";
import MovieModal from "@/components/movie/MovieModal";
import type { Movie } from "@/types/movie";
import { useI18n } from "@/i18n/I18nContext";

const AUTH_API = import.meta.env.VITE_AUTH_API_URL;

const Director = () => {
  const { name = "" } = useParams();
  const navigate = useNavigate();
  const directorName = decodeURIComponent(name);
  const [selected, setSelected] = useState<Movie | null>(null);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { t } = useI18n();

  useEffect(() => {
    console.log("directorName:", directorName);
    if (!directorName) return;

  const fetchMovies = async () => {
     console.log("fetching...");
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${AUTH_API}/directors/${encodeURIComponent(directorName)}/movies`);
      if (!res.ok) throw new Error("Error al cargar películas");
      
      const data = await res.json();
      console.log("data:", data);

      const normalizedMovies = data.map((m: any) => ({
          title: m.movieTitle || m.title || "",
          year: m.originalReleaseDate ? m.originalReleaseDate.split('-')[0] : "N/A",
          director: m.directors || m.director || directorName,
          tomatometer: m.tomatometerRating || 0,
          posterUrl: m.poster_url || m.posterUrl || "",  // ← añade poster_url primero
          description: m.movieInfo || m.criticsConsensus || "",
          genre: m.genres || "",
          runtime: m.runtime || 0,
          reason: "",
          link: m.rottenTomatoesLink || m.link || "",
        }));
      console.log("NORMALIZED:", normalizedMovies[0]); // ← añade esto
      setMovies(normalizedMovies);
    } catch (err) {
      setError("No se pudieron cargar las películas");
    } finally {
      setLoading(false);
    }
  };

    fetchMovies();
  }, [directorName]);

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
          {t("common.back")}
        </button>

        <header className="mb-8">
          <div className="mb-2 flex items-center gap-2">
            <Film className="h-5 w-5 text-primary" />
            <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
              {t("director.tag")}
            </span>
          </div>
          <h1 className="font-display text-3xl font-bold md:text-4xl">
            <span className="gradient-text">{directorName}</span>
          </h1>
          {!loading && (
            <p className="mt-1 text-sm text-muted-foreground">
              {movies.length} {movies.length === 1 ? t("director.count.one") : t("director.count.many")}
            </p>
          )}
        </header>

        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {error && (
          <div className="glass rounded-2xl p-12 text-center text-red-400">
            {error}
          </div>
        )}

        {!loading && !error && movies.length === 0 && (
          <div className="glass rounded-2xl p-12 text-center text-muted-foreground">
            {t("director.empty")}
          </div>
        )}

        {!loading && !error && movies.length > 0 && (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {movies.map((movie, i) => (
              <MovieCard
                key={ movie.title}
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