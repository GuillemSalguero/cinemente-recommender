import { useMemo, useState } from "react";
import { Search as SearchIcon, Filter } from "lucide-react";
import { motion } from "framer-motion";
import MovieCard from "@/components/movie/MovieCard";
import MovieModal from "@/components/movie/MovieModal";
import type { Movie } from "@/types/movie";
import { CATALOG } from "@/data/catalog";

const ALL_GENRES = Array.from(
  new Set(CATALOG.flatMap((m) => m.genre.split(",").map((g) => g.trim())))
).sort();

const Search = () => {
  const [query, setQuery] = useState("");
  const [genre, setGenre] = useState<string>("all");
  const [selected, setSelected] = useState<Movie | null>(null);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return CATALOG.filter((m) => {
      const matchQ =
        !q ||
        m.title.toLowerCase().includes(q) ||
        m.director.toLowerCase().includes(q) ||
        m.description.toLowerCase().includes(q);
      const matchG = genre === "all" || m.genre.toLowerCase().includes(genre.toLowerCase());
      return matchQ && matchG;
    });
  }, [query, genre]);

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
              Catálogo
            </span>
          </div>
          <h1 className="font-display text-3xl font-bold md:text-4xl">
            Búsqueda <span className="gradient-text">clásica</span>
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Filtra por título, director o género — sin IA.
          </p>
        </header>

        <div className="glass mb-6 flex flex-col gap-3 rounded-2xl p-4 sm:flex-row">
          <div className="relative flex-1">
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Título, director o palabra clave..."
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
              <option value="all">Todos los géneros</option>
              {ALL_GENRES.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>
        </div>

        <p className="mb-4 text-xs text-muted-foreground">
          {results.length} {results.length === 1 ? "resultado" : "resultados"}
        </p>

        {results.length === 0 ? (
          <div className="glass rounded-2xl p-12 text-center text-muted-foreground">
            No hay coincidencias. Prueba con otra palabra o género.
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {results.map((movie, i) => (
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

export default Search;
