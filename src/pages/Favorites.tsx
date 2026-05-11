import { useState } from "react";
import { Heart, Trash2, LogIn } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useUserLists } from "@/contexts/UserListsContext";
import MovieCard from "@/components/movie/MovieCard";
import MovieModal from "@/components/movie/MovieModal";
import type { Movie } from "@/types/movie";
import { useI18n } from "@/i18n/I18nContext";

const Favorites = () => {
  const { user } = useAuth();
  const { favorites, removeFavorite } = useUserLists();
  const [selected, setSelected] = useState<Movie | null>(null);
  const navigate = useNavigate();
  const { t } = useI18n();

  if (!user) {
    return (
      <div className="flex min-h-[80vh] flex-col items-center justify-center px-4 text-center">
        <Heart className="mb-4 h-12 w-12 text-muted-foreground" />
        <h2 className="font-display text-2xl font-bold">{t("fav.waiting")}</h2>
        <p className="mt-2 max-w-md text-muted-foreground">{t("fav.loginPrompt")}</p>
        <button
          onClick={() => navigate("/auth")}
          className="gradient-primary mt-6 flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-primary-foreground shadow-lg hover:opacity-90"
        >
          <LogIn className="h-4 w-4" />
          {t("auth.login")}
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
            <Heart className="h-5 w-5 text-primary" />
            <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
              {t("fav.tag")}
            </span>
          </div>
          <h1 className="font-display text-3xl font-bold md:text-4xl">
            {t("fav.titlePrefix")} <span className="gradient-text">{t("fav.title")}</span>
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {favorites.length} {favorites.length === 1 ? t("fav.count.one") : t("fav.count.many")}
          </p>
        </header>

        {favorites.length === 0 ? (
          <div className="glass rounded-2xl p-12 text-center">
            <Heart className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
            <p className="text-muted-foreground">{t("fav.empty")}</p>
            <button
              onClick={() => navigate("/")}
              className="mt-5 rounded-xl border border-border bg-secondary/50 px-5 py-2.5 text-sm font-medium hover:bg-secondary"
            >
              {t("fav.goSearch")}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {favorites.map((movie, i) => (
              <div key={movie.link || movie.title} className="relative group">
                <MovieCard movie={movie} index={i} onClick={() => setSelected(movie)} />
                <button
                  onClick={(e) => { e.stopPropagation(); removeFavorite(movie.link || movie.title); }}
                  className="absolute top-3 left-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-background/80 backdrop-blur-sm opacity-0 transition-opacity group-hover:opacity-100 hover:bg-destructive hover:text-destructive-foreground"
                  aria-label="Eliminar de favoritos"
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

export default Favorites;