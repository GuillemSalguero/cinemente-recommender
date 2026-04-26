import { useState } from "react";
import { Bookmark, Trash2, LogIn } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useWatchlist } from "@/hooks/useWatchlist";
import MovieCard from "@/components/movie/MovieCard";
import MovieModal from "@/components/movie/MovieModal";
import type { Movie } from "@/types/movie";

const Watchlist = () => {
  const { user } = useAuth();
  const { watchlist, removeFromWatchlist } = useWatchlist();
  const [selected, setSelected] = useState<Movie | null>(null);
  const navigate = useNavigate();

  if (!user) {
    return (
      <div className="flex min-h-[80vh] flex-col items-center justify-center px-4 text-center">
        <Bookmark className="mb-4 h-12 w-12 text-muted-foreground" />
        <h2 className="font-display text-2xl font-bold">Tu watchlist te espera</h2>
        <p className="mt-2 max-w-md text-muted-foreground">
          Inicia sesión para guardar películas que quieras ver más tarde.
        </p>
        <button
          onClick={() => navigate("/auth")}
          className="gradient-primary mt-6 flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-primary-foreground shadow-lg hover:opacity-90"
        >
          <LogIn className="h-4 w-4" />
          Iniciar sesión
        </button>
      </div>
    );
  }

  return (
    <div className="px-4 py-8 md:px-8">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto max-w-6xl"
      >
        <header className="mb-8">
          <div className="mb-2 flex items-center gap-2">
            <Bookmark className="h-5 w-5 text-primary" />
            <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
              Para ver más tarde
            </span>
          </div>
          <h1 className="font-display text-3xl font-bold md:text-4xl">
            Mi <span className="gradient-text">watchlist</span>
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {watchlist.length} {watchlist.length === 1 ? "película pendiente" : "películas pendientes"}
          </p>
        </header>

        {watchlist.length === 0 ? (
          <div className="glass rounded-2xl p-12 text-center">
            <Bookmark className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
            <p className="text-muted-foreground">
              Tu watchlist está vacía. Guarda películas con el icono 🔖
            </p>
            <button
              onClick={() => navigate("/")}
              className="mt-5 rounded-xl border border-border bg-secondary/50 px-5 py-2.5 text-sm font-medium hover:bg-secondary"
            >
              Ir a buscar
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {watchlist.map((movie, i) => (
              <div key={movie.title} className="relative group">
                <MovieCard movie={movie} index={i} onClick={() => setSelected(movie)} />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFromWatchlist(movie.title);
                  }}
                  className="absolute top-3 right-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-background/80 backdrop-blur-sm opacity-0 transition-opacity group-hover:opacity-100 hover:bg-destructive hover:text-destructive-foreground"
                  aria-label="Eliminar de watchlist"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      <MovieModal movie={selected} onClose={() => setSelected(null)} />
    </div>
  );
};

export default Watchlist;
