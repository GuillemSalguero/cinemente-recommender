import { useMemo, useState } from "react";
import { Users as UsersIcon, Search as SearchIcon, ArrowLeft, Heart, Bookmark, History as HistoryIcon } from "lucide-react";
import { motion } from "framer-motion";
import { listAllUsers, useAuth, type User } from "@/contexts/AuthContext";
import { getHistoryFor } from "@/hooks/useHistory";
import type { Movie } from "@/types/movie";
import MovieCard from "@/components/movie/MovieCard";
import MovieModal from "@/components/movie/MovieModal";

const favKey = (id: string) => `cinemente_favs_${id}`;
const watchKey = (id: string) => `cinemente_watchlist_${id}`;

const readList = (key: string): Movie[] => {
  try {
    return JSON.parse(localStorage.getItem(key) || "[]");
  } catch {
    return [];
  }
};

const Users = () => {
  const { user: me } = useAuth();
  const [query, setQuery] = useState("");
  const [openUser, setOpenUser] = useState<User | null>(null);
  const [selected, setSelected] = useState<Movie | null>(null);

  const allUsers = useMemo(
    () => listAllUsers().filter((u) => u.id !== me?.id),
    [me, openUser] // refresh when navigating back
  );

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return allUsers;
    return allUsers.filter(
      (u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
    );
  }, [query, allUsers]);

  // Public profile view
  if (openUser) {
    const favs = readList(favKey(openUser.id));
    const watch = readList(watchKey(openUser.id));
    const history = getHistoryFor(openUser.id);
    const monthMs = 30 * 24 * 60 * 60 * 1000;
    const recent = history.filter((h) => Date.now() - h.viewedAt <= monthMs);

    const Section = ({
      title,
      icon,
      movies,
      empty,
    }: {
      title: string;
      icon: React.ReactNode;
      movies: Movie[];
      empty: string;
    }) => (
      <section className="mb-8">
        <div className="mb-3 flex items-center gap-2">
          {icon}
          <h2 className="font-display text-lg font-semibold">
            {title} <span className="text-muted-foreground">({movies.length})</span>
          </h2>
        </div>
        {movies.length === 0 ? (
          <p className="glass rounded-xl p-6 text-center text-sm text-muted-foreground">
            {empty}
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {movies.map((m, i) => (
              <MovieCard key={m.title} movie={m} index={i} onClick={() => setSelected(m)} />
            ))}
          </div>
        )}
      </section>
    );

    return (
      <div className="px-4 py-8 md:px-8">
        <div className="mx-auto max-w-5xl">
          <button
            onClick={() => setOpenUser(null)}
            className="mb-6 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver a usuarios
          </button>

          <header className="glass mb-8 flex items-center gap-4 rounded-2xl p-6">
            <div className="gradient-primary flex h-16 w-16 shrink-0 items-center justify-center rounded-full text-2xl font-bold text-primary-foreground">
              {openUser.name[0]?.toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-display text-xl font-semibold">{openUser.name}</p>
              <p className="truncate text-sm text-muted-foreground">{openUser.email}</p>
            </div>
          </header>

          <Section
            title="Favoritos"
            icon={<Heart className="h-5 w-5 text-primary" />}
            movies={favs}
            empty="Este usuario no tiene favoritos."
          />
          <Section
            title="Watchlist"
            icon={<Bookmark className="h-5 w-5 text-primary" />}
            movies={watch}
            empty="Watchlist vacía."
          />
          <Section
            title="Visto este mes"
            icon={<HistoryIcon className="h-5 w-5 text-primary" />}
            movies={recent.map((h) => h.movie)}
            empty="Sin actividad reciente."
          />
        </div>

        <MovieModal movie={selected} onClose={() => setSelected(null)} />
      </div>
    );
  }

  // List view
  return (
    <div className="px-4 py-8 md:px-8">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto max-w-4xl"
      >
        <header className="mb-6">
          <div className="mb-2 flex items-center gap-2">
            <UsersIcon className="h-5 w-5 text-primary" />
            <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
              Comunidad
            </span>
          </div>
          <h1 className="font-display text-3xl font-bold md:text-4xl">
            Buscar <span className="gradient-text">usuarios</span>
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Descubre los favoritos y la watchlist de otros cinéfilos.
          </p>
        </header>

        <div className="glass mb-6 rounded-2xl p-4">
          <div className="relative">
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Nombre o email..."
              className="w-full rounded-xl border border-border bg-background/50 py-3 pl-10 pr-3 text-sm focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>

        {results.length === 0 ? (
          <div className="glass rounded-2xl p-12 text-center text-muted-foreground">
            {allUsers.length === 0
              ? "Aún no hay otros usuarios registrados."
              : "Ningún usuario coincide con la búsqueda."}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {results.map((u) => {
              const favCount = readList(favKey(u.id)).length;
              const watchCount = readList(watchKey(u.id)).length;
              return (
                <button
                  key={u.id}
                  onClick={() => setOpenUser(u)}
                  className="glass flex items-center gap-4 rounded-2xl p-4 text-left transition-all hover:border-primary/40 hover:bg-cinema-glass/80"
                >
                  <div className="gradient-primary flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-lg font-bold text-primary-foreground">
                    {u.name[0]?.toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{u.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{u.email}</p>
                    <div className="mt-1 flex gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Heart className="h-3 w-3" /> {favCount}
                      </span>
                      <span className="flex items-center gap-1">
                        <Bookmark className="h-3 w-3" /> {watchCount}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Users;
