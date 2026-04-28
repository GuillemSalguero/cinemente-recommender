import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import SearchHero from "@/components/movie/SearchHero";
import MovieGrid from "@/components/movie/MovieGrid";
import { useMovieSearch } from "@/hooks/useMovieSearch";
import { useI18n } from "@/i18n/I18nContext";

const Index = () => {
  const { movies, isLoading, isLoadingMore, hasSearched, search, loadMore, showLoadMore } =
    useMovieSearch();
  const { t } = useI18n();

  return (
    <div className="min-h-screen bg-background">
      {/* Ambient background glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-primary/8 blur-[120px]" />
        <div className="absolute top-1/3 -right-20 h-64 w-64 rounded-full bg-accent/6 blur-[100px]" />
      </div>

      <div className="relative z-10">
        {!isLoading && (!hasSearched || movies.length === 0) && (
          <SearchHero onSearch={search} isLoading={isLoading} />
        )}

        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex min-h-screen flex-col items-center justify-center gap-4"
          >
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="text-lg text-muted-foreground font-display">{t("hero.thinking")}</p>
          </motion.div>
        )}

        {!isLoading && movies.length > 0 && (
          <>
            <div className="border-b border-border/50 bg-background/80 backdrop-blur-xl">
              <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 md:px-8">
                <button
                  onClick={() => window.location.reload()}
                  className="flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  {t("hero.newSearch")}
                </button>
                <span className="text-sm font-medium text-muted-foreground">
                  {movies.length} {t("hero.recommendations")}
                </span>
              </div>
            </div>

            <div className="pt-8">
              <MovieGrid
                movies={movies}
                isLoadingMore={isLoadingMore}
                showLoadMore={showLoadMore}
                onLoadMore={loadMore}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Index;
