import { useEffect, useState, useCallback } from "react";
import { Users as UsersIcon, Search as SearchIcon, Loader2, UserPlus, UserCheck, Heart, Bookmark } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { friendsService, moviesService, detailToMovie, type BackendFriend } from "@/lib/backend";
import { useI18n } from "@/i18n/I18nContext";
import { toast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import MovieCard from "@/components/movie/MovieCard";
import MovieModal from "@/components/movie/MovieModal";
import type { Movie } from "@/types/movie";

const extractFavLinks = (favFilms: unknown): string[] => {
  if (!favFilms) return [];
  if (!Array.isArray(favFilms)) return [];
  return favFilms
    .map((it) => (typeof it === "string" ? it : (it as { movieLink?: string })?.movieLink))
    .filter((s): s is string => Boolean(s));
};

const Users = () => {
  const { user: me } = useAuth();
  const { t } = useI18n();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<BackendFriend[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const [friendIds, setFriendIds] = useState<Set<number>>(new Set());
  const [pendingFollow, setPendingFollow] = useState<Set<number>>(new Set());

  // Profile popup state
  const [openUser, setOpenUser] = useState<BackendFriend | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileFavs, setProfileFavs] = useState<Movie[]>([]);
  const [profileWatch, setProfileWatch] = useState<Movie[]>([]);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);

  const refreshFriends = useCallback(async () => {
    if (!me?.id) return;
    try {
      const list = await friendsService.getFriends(me.id);
      setFriendIds(new Set(list.map((f) => Number(f.id))));
    } catch {
      // silencioso
    }
  }, [me?.id]);

  useEffect(() => {
    refreshFriends();
  }, [refreshFriends]);

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const q = query.trim();
    if (!q || loading) return;
    setLoading(true);
    setSearched(true);
    try {
      const data = await friendsService.searchByName(q);
      setResults(data.filter((u) => String(u.id) !== me?.id));
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "No se pudo buscar usuarios",
        variant: "destructive",
      });
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFollow = async (e: React.MouseEvent, u: BackendFriend) => {
    e.stopPropagation();
    if (!me?.id) return;
    const id = Number(u.id);
    const isFriend = friendIds.has(id);
    setPendingFollow((s) => new Set(s).add(id));
    try {
      if (isFriend) {
        await friendsService.removeFriend(me.id, id);
        setFriendIds((s) => {
          const n = new Set(s);
          n.delete(id);
          return n;
        });
      } else {
        await friendsService.addFriend(me.id, id);
        setFriendIds((s) => new Set(s).add(id));
      }
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Acción no completada",
        variant: "destructive",
      });
    } finally {
      setPendingFollow((s) => {
        const n = new Set(s);
        n.delete(id);
        return n;
      });
    }
  };

  const openProfile = async (u: BackendFriend) => {
    setOpenUser(u);
    setProfileFavs([]);
    setProfileWatch([]);
    setProfileLoading(true);

    const hydrate = (slugs: string[], setter: (m: Movie[]) => void) => {
      // Pinta placeholders inmediatamente
      const placeholders = slugs.map((s) => detailToMovie(s, null));
      setter(placeholders);
      // Hidrata en background
      slugs.forEach((slug) => {
        moviesService
          .getBySlug(slug)
          .then((d) => {
            setter((prev: Movie[] | ((p: Movie[]) => Movie[])) => {
              // useState setter trick: necesitamos acceder al estado previo via función
              return prev as Movie[];
            });
          })
          .catch(() => { /* noop */ });
      });
    };

    try {
      let favLinks: string[] = [];
      let watchLinks: string[] = [];
      if (me?.id) {
        try {
          const data = await friendsService.getFriendMovies(me.id, u.id);
          favLinks = data.favoriteMovies || [];
          watchLinks = data.watchlist || [];
        } catch {
          // Fallback: si no es amigo aún, usa favFilms del propio user
          const full = await friendsService.getUser(u.id);
          favLinks = extractFavLinks(full?.favFilms);
        }
      }

      // Placeholders inmediatos
      setProfileFavs(favLinks.map((s) => detailToMovie(s, null)));
      setProfileWatch(watchLinks.map((s) => detailToMovie(s, null)));

      // Hidratación en background
      favLinks.forEach((slug) => {
        moviesService
          .getBySlug(slug)
          .then((d) =>
            setProfileFavs((prev) =>
              prev.map((m) => (m.link === slug ? detailToMovie(slug, d) : m))
            )
          )
          .catch(() => { /* noop */ });
      });
      watchLinks.forEach((slug) => {
        moviesService
          .getBySlug(slug)
          .then((d) =>
            setProfileWatch((prev) =>
              prev.map((m) => (m.link === slug ? detailToMovie(slug, d) : m))
            )
          )
          .catch(() => { /* noop */ });
      });
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "No se pudo cargar el perfil",
        variant: "destructive",
      });
    } finally {
      setProfileLoading(false);
    }
  };

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
              {t("users.tag")}
            </span>
          </div>
          <h1 className="font-display text-3xl font-bold md:text-4xl">
            {t("users.titlePrefix")} <span className="gradient-text">{t("users.title")}</span>
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">{t("users.subtitle")}</p>
        </header>

        <form onSubmit={handleSearch} className="glass mb-6 rounded-2xl p-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t("users.searchPlaceholder")}
                className="w-full rounded-xl border border-border bg-background/50 py-3 pl-10 pr-3 text-sm focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="gradient-primary flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-primary-foreground shadow-lg transition-all hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <SearchIcon className="h-4 w-4" />}
              {t("users.tag")}
            </button>
          </div>
        </form>

        {!searched ? (
          <div className="glass rounded-2xl p-12 text-center text-muted-foreground">
            {t("users.searchPlaceholder")}
          </div>
        ) : loading ? (
          <div className="glass rounded-2xl p-12 text-center text-muted-foreground">
            <Loader2 className="mx-auto h-6 w-6 animate-spin" />
          </div>
        ) : results.length === 0 ? (
          <div className="glass rounded-2xl p-12 text-center text-muted-foreground">
            {t("users.noMatch")}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {results.map((u) => {
              const id = Number(u.id);
              const isFriend = friendIds.has(id);
              const isPending = pendingFollow.has(id);
              return (
                <div
                  key={u.id}
                  className="glass flex items-center gap-4 rounded-2xl p-4 text-left transition-all hover:border-primary/40 hover:bg-cinema-glass/80"
                >
                  <button
                    onClick={() => openProfile(u)}
                    className="flex min-w-0 flex-1 items-center gap-4 text-left"
                    aria-label={t("users.viewProfile")}
                  >
                    <div className="gradient-primary flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-lg font-bold text-primary-foreground">
                      {u.name[0]?.toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{u.name}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {t("users.viewProfile")}
                      </p>
                    </div>
                  </button>
                  <button
                    onClick={(e) => handleToggleFollow(e, u)}
                    disabled={isPending}
                    className={
                      isFriend
                        ? "flex shrink-0 items-center gap-1.5 rounded-xl border border-primary/40 bg-primary/10 px-3 py-2 text-xs font-semibold text-primary transition-all hover:bg-primary/20 disabled:opacity-50"
                        : "gradient-primary flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold text-primary-foreground shadow-lg transition-all hover:opacity-90 disabled:opacity-50"
                    }
                  >
                    {isPending ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : isFriend ? (
                      <UserCheck className="h-3.5 w-3.5" />
                    ) : (
                      <UserPlus className="h-3.5 w-3.5" />
                    )}
                    {isFriend ? t("users.following") : t("users.follow")}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </motion.div>

      {/* Profile popup */}
      <Dialog open={!!openUser} onOpenChange={(o) => !o && setOpenUser(null)}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="gradient-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-base font-bold text-primary-foreground">
                {openUser?.name?.[0]?.toUpperCase()}
              </div>
              <span>
                {t("users.profileOf")} <span className="gradient-text">{openUser?.name}</span>
              </span>
            </DialogTitle>
          </DialogHeader>

          <div className="mt-4">
            <div className="mb-3 flex items-center gap-2">
              <Heart className="h-4 w-4 text-primary" />
              <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                {t("users.section.fav")}
              </h3>
            </div>

            {profileLoading ? (
              <div className="glass rounded-2xl p-12 text-center">
                <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : profileFavs.length === 0 ? (
              <div className="glass rounded-2xl p-8 text-center text-sm text-muted-foreground">
                {t("users.empty.fav")}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {profileFavs.map((m, i) => (
                  <MovieCard
                    key={m.link || m.title}
                    movie={m}
                    index={i}
                    onClick={() => setSelectedMovie(m)}
                  />
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <MovieModal movie={selectedMovie} onClose={() => setSelectedMovie(null)} />
    </div>
  );
};

export default Users;
