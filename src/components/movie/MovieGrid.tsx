import { useState } from "react";
import type { Movie } from "@/types/movie";
import MovieCard from "./MovieCard";
import LoadMoreCard from "./LoadMoreCard";
import LoadMoreButton from "./LoadMoreButton";
import MovieModal from "./MovieModal";

interface MovieGridProps {
  movies: Movie[];
  isLoadingMore: boolean;
  showLoadMore: boolean;
  onLoadMore: (isMobile: boolean) => void;
}

const MovieGrid = ({ movies, isLoadingMore, showLoadMore, onLoadMore }: MovieGridProps) => {
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

  return (
    <>
      <section className="px-4 pb-16 md:px-8">
        {/* Mobile: Horizontal carousel */}
        <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-4 md:hidden">
          {movies.map((movie, i) => (
            <MovieCard
              key={movie.title}
              movie={movie}
              index={i}
              onClick={() => setSelectedMovie(movie)}
            />
          ))}
          {showLoadMore && (
            <LoadMoreCard
              onClick={() => onLoadMore(true)}
              isLoading={isLoadingMore}
            />
          )}
        </div>

        {/* Desktop: Grid */}
        <div className="hidden md:block max-w-6xl mx-auto">
          <div className="grid grid-cols-4 gap-5">
            {movies.map((movie, i) => (
              <MovieCard
                key={movie.title}
                movie={movie}
                index={i}
                onClick={() => setSelectedMovie(movie)}
              />
            ))}
          </div>
          {showLoadMore && (
            <LoadMoreButton
              onClick={() => onLoadMore(false)}
              isLoading={isLoadingMore}
            />
          )}
        </div>
      </section>

      <MovieModal movie={selectedMovie} onClose={() => setSelectedMovie(null)} />
    </>
  );
};

export default MovieGrid;
