import { useEffect, useState } from "react";
import { Search as SearchIcon, Filter, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import MovieCard from "@/components/movie/MovieCard";
import MovieModal from "@/components/movie/MovieModal";
import type { Movie } from "@/types/movie";
import { useI18n } from "@/i18n/I18nContext";
import { useClassicSearch } from "@/hooks/useClassicSearch";

const GENRES = [
  "Action", "Adventure", "Animation", "Comedy", "Crime",
  "Documentary", "Drama", "Fantasy", "Horror", "Music",
  "Mystery", "Romance", "Science Fiction", "Thriller", "Western"
];

const Search = () => {
  const { t } = useI18n();
  const [query, setQuery] = useState("");
  const [genre, setGenre] = useState("all");
  const [selected, setSelected] = useState<Movie | null>(null);
  const { movies, isLoading, hasSearched, search, loadMore, hasMore } = useClassicSearch();

  // Buscar al cambiar query o género con debounce
  useEffect(() => {
    const timer = setTimeout(() => search(query, genre), 400);
    return () => clearTimeout(timer);
  }, [query, genre, search]);

  return (
    <div className="px-4 py-8 md:px-8">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto max-w-6xl"
      >
        <header className="mb-6">
          <div className="mb-2 flex items-center gap-2">
            <SearchIcon className="h-5 w-5 text-primary" />
            <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
              {t("search.tag")}
            </span>
          </div>
          <h1 className="font-display text-3xl font-bold md:text-4xl">
            {t("search.titlePrefix")} <span className="gradient-text">{t("search.title")}</span>
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">{t("search.subtitle")}</p>
        </header>

        <div className="glass mb-6 flex flex-col gap-3 rounded-2xl p-4 sm:flex-row">
          <div className="relative flex-1">
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("search.placeholder")}
              className="w-full rounded-xl border border-border bg-background/50 py-3 pl-10 pr-3 text-sm focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div className="relative sm:w-56">
            <Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <select
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              className="w-full appearance-none rounded-xl border border-border bg-background/50 py-3 pl-10 pr-3 text-sm focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="all">{t("search.allGenres")}</option>
              {GENRES.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>
        </div>

        {isLoading && (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {!isLoading && hasSearched && movies.length === 0 && (
          <div className="glass rounded-2xl p-12 text-center text-muted-foreground">
            {t("search.noMatch")}
          </div>
        )}

        {!isLoading && movies.length > 0 && (
          <>
            <p className="mb-4 text-xs text-muted-foreground">
              {movies.length} {movies.length === 1 ? t("common.result") : t("common.results")}
            </p>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
              {movies.map((movie, i) => (
                <MovieCard
                  key={movie.link || movie.title}
                  movie={movie}
                  index={i}
                  onClick={() => setSelected(movie)}
                />
              ))}
            </div>
            {hasMore && (
              <button
                onClick={loadMore}
                className="mx-auto mt-8 flex items-center gap-2 rounded-xl border border-border bg-secondary/50 px-5 py-3 text-sm font-medium hover:bg-secondary"
              >
                {t("common.loadMore")}
              </button>
            )}
          </>
        )}
      </motion.div>

      <MovieModal movie={selected} onClose={() => setSelected(null)} />
    </div>
  );
};

export default Search;