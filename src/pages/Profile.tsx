import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User as UserIcon,
  Mail,
  LogIn,
  Save,
  LogOut,
  Heart,
  Bookmark,
  Search as SearchIcon,
  Trash2,
  History as HistoryIcon,
  Camera,
  Check,
} from "lucide-react";
import { useUserLists } from "@/contexts/UserListsContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useHistory } from "@/hooks/useHistory";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import MovieCard from "@/components/movie/MovieCard";
import MovieModal from "@/components/movie/MovieModal";
import type { Movie } from "@/types/movie";
import { useI18n, localeFor } from "@/i18n/I18nContext";

const AVATAR_OPTIONS = [
  {
    id: "poño",
    label: "poño",
    realUrl: "https://m.supergeek.cl/noticias/site/artic/20210714/imag/foto_0000000220210714190012/PONYO_GHIBLI.jpg",
  },
  {
    id: "fight-club",
    label: "Fight Club",
    realUrl: "https://core-cms.bfi.org.uk/sites/default/files/styles/responsive/public/2021-02/fight-club-1999-brad-pitt-red-leather-jacket.jpg/600x0/fight-club-1999-brad-pitt-red-leather-jacket.jpg",
  },
  {
    id: "the-dude",
    label: "The Dude",
    realUrl: "https://media.gq-magazine.co.uk/photos/5d13a04bb744d364a425653b/16:9/w_2560%2Cc_limit/The-Big-Lebowski-hp-GQ-25Feb16_rex_b.jpg",
  },
  {
    id: "godfather",
    label: "El Padrino",
    realUrl: "https://m.media-amazon.com/images/M/MV5BM2MyNjYxNmUtYTAwNi00MTYxLWJmNWYtYzZlODY3ZTk3OTFlXkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_.jpg",
  },
  {
    id : "4",
    label: "Pulp Fiction",
    realUrl: "https://cdn.zendalibros.com/wp-content/uploads/2025/10/pelicula-pulp-fiction.jpg",
  },
  {
    id: "5",
    label: "Todo sobre mi madre",
    realUrl: "https://i.pinimg.com/736x/15/8f/ec/158fecfffaec07956f82317b3a7076dd.jpg",
  },
  {
    id: "6",
    label: "No Country for Old Men",
    realUrl: "https://occ-0-8407-2219.1.nflxso.net/dnm/api/v6/E8vDc_W8CLv7-yMQu8KMEC7Rrr8/AAAABYkY6oNKD8CWYger22NQpx3lQ_5OylmOoYMWI7zT6SvRBMoWDyfQPxi9hu0NPm5n2ONuD19K1dHrAFtu-DfJHV6_eJNxqKxJlJdw.jpg?r=124",
  },
  {
    id: "7",
    label: "Casino Royale",
    realUrl: "https://decider.com/wp-content/uploads/2025/11/Casino-THROWBACK.jpg?quality=75&strip=all&w=978&h=652&crop=1",
  }

];

const AVATAR_STORAGE_KEY = "cinemente_avatar";

function useAvatar() {
  const [avatarId, setAvatarId] = useState<string>(
    () => localStorage.getItem(AVATAR_STORAGE_KEY) || ""
  );

  const setAvatar = (id: string) => {
    localStorage.setItem(AVATAR_STORAGE_KEY, id);
    setAvatarId(id);
  };

  const currentAvatar = AVATAR_OPTIONS.find((a) => a.id === avatarId) || null;

  return { avatarId, currentAvatar, setAvatar };
}

const Profile = () => {
  const { user, updateProfile, logout } = useAuth();
  const { favorites, watchlist, removeFavorite, removeWatchlist } = useUserLists();
  const { lastMonth, clearHistory } = useHistory();
  const navigate = useNavigate();
  const { t, lang } = useI18n();
  const [name, setName] = useState(user?.name || "");
  const [selected, setSelected] = useState<Movie | null>(null);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const { avatarId, currentAvatar, setAvatar } = useAvatar();

  if (!user) {
    return (
      <div className="flex min-h-[80vh] flex-col items-center justify-center px-4 text-center">
        <UserIcon className="mb-4 h-12 w-12 text-muted-foreground" />
        <h2 className="font-display text-2xl font-bold">{t("profile.noSession")}</h2>
        <p className="mt-2 max-w-md text-muted-foreground">
          {t("profile.loginToEdit")}
        </p>
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

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error(t("profile.nameEmpty"));
      return;
    }
    updateProfile({ name: name.trim() });
    toast.success(t("profile.updated"));
  };

  const renderRemovableGrid = (
    movies: Movie[],
    onRemove: (title: string) => void,
    emptyText: string,
    emptyIcon: React.ReactNode
  ) => {
    if (movies.length === 0) {
      return (
        <div className="glass rounded-2xl p-12 text-center">
          <div className="mx-auto mb-3 flex justify-center text-muted-foreground">
            {emptyIcon}
          </div>
          <p className="text-muted-foreground">{emptyText}</p>
        </div>
      );
    }
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {movies.map((movie, i) => (
          <div key={movie.title} className="relative group">
            <MovieCard movie={movie} index={i} onClick={() => setSelected(movie)} />
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemove(movie.title);
              }}
              className="absolute top-3 right-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-background/80 backdrop-blur-sm opacity-0 transition-opacity group-hover:opacity-100 hover:bg-destructive hover:text-destructive-foreground"
              aria-label="Eliminar"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="px-4 py-8 md:px-8">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto max-w-5xl"
      >
        <header className="mb-8">
          <div className="mb-2 flex items-center gap-2">
            <UserIcon className="h-5 w-5 text-primary" />
            <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
              {t("profile.tag")}
            </span>
          </div>
          <h1 className="font-display text-3xl font-bold md:text-4xl">
            {t("profile.titlePrefix")} <span className="gradient-text">{t("profile.title")}</span>
          </h1>
        </header>

        {/* Avatar + meta */}
        <div className="glass mb-6 flex items-center gap-4 rounded-2xl p-6">
          {/* Avatar con botón editar */}
          <div className="relative shrink-0">
            {currentAvatar ? (
              <img
                src={currentAvatar.realUrl}
                alt={currentAvatar.label}
                className="h-16 w-16 rounded-full object-cover ring-2 ring-primary/40"
              />
            ) : (
              <div className="gradient-primary flex h-16 w-16 items-center justify-center rounded-full text-2xl font-bold text-primary-foreground">
                {user.name[0]?.toUpperCase()}
              </div>
            )}
            <button
              onClick={() => setShowAvatarPicker((v) => !v)}
              className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md hover:opacity-90"
              aria-label="Cambiar foto"
            >
              <Camera className="h-3 w-3" />
            </button>
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate font-display text-lg font-semibold">{user.name}</p>
            <p className="truncate text-sm text-muted-foreground">{user.email}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {t("profile.signedInWith")} {user.provider === "google" ? "Google" : "email"}
            </p>
          </div>
        </div>

        {/* Avatar picker */}
        <AnimatePresence>
          {showAvatarPicker && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="glass mb-6 rounded-2xl p-4"
            >
              <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Elige tu foto de perfil
              </p>
              <div className="grid grid-cols-4 gap-3">
                {AVATAR_OPTIONS.map((avatar) => (
                  <button
                    key={avatar.id}
                    onClick={() => {
                      setAvatar(avatar.id);
                      setShowAvatarPicker(false);
                      toast.success("Foto actualizada");
                    }}
                    className="group relative flex flex-col items-center gap-1.5"
                  >
                    <div className="relative">
                      <img
                        src={avatar.realUrl}
                        alt={avatar.label}
                        className={`h-16 w-16 rounded-full object-cover ring-2 transition-all group-hover:ring-primary ${
                          avatarId === avatar.id ? "ring-primary" : "ring-transparent"
                        }`}
                      />
                      {avatarId === avatar.id && (
                        <div className="absolute inset-0 flex items-center justify-center rounded-full bg-primary/40">
                          <Check className="h-5 w-5 text-white" />
                        </div>
                      )}
                    </div>
                    <span className="text-center text-[10px] text-muted-foreground">
                      {avatar.label}
                    </span>
                  </button>
                ))}
              </div>
              {avatarId && (
                <button
                  onClick={() => {
                    setAvatar("");
                    setShowAvatarPicker(false);
                    toast.success("Foto eliminada");
                  }}
                  className="mt-3 text-xs text-muted-foreground hover:text-foreground"
                >
                  Quitar foto
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tabs */}
        <Tabs defaultValue="info" className="w-full">
          <TabsList className="grid h-auto w-full grid-cols-2 gap-2 bg-transparent p-0 sm:grid-cols-3 lg:grid-cols-5">
            <TabsTrigger
              value="info"
              className="glass flex aspect-square flex-col items-center justify-center gap-2 rounded-2xl border border-border/50 p-2 data-[state=active]:border-primary data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-lg sm:gap-3"
            >
              <UserIcon className="h-6 w-6" />
              <span className="text-xs font-medium sm:text-sm">{t("profile.tab.info")}</span>
            </TabsTrigger>
            <TabsTrigger
              value="favorites"
              className="glass flex aspect-square flex-col items-center justify-center gap-2 rounded-2xl border border-border/50 p-2 data-[state=active]:border-primary data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-lg sm:gap-3"
            >
              <Heart className="h-6 w-6" />
              <span className="text-xs font-medium sm:text-sm">
                {t("nav.favorites")} ({favorites.length})
              </span>
            </TabsTrigger>
            <TabsTrigger
              value="watchlist"
              className="glass flex aspect-square flex-col items-center justify-center gap-2 rounded-2xl border border-border/50 p-2 data-[state=active]:border-primary data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-lg sm:gap-3"
            >
              <Bookmark className="h-6 w-6" />
              <span className="text-xs font-medium sm:text-sm">
                {t("nav.watchlist")} ({watchlist.length})
              </span>
            </TabsTrigger>
            <TabsTrigger
              value="history"
              className="glass flex aspect-square flex-col items-center justify-center gap-2 rounded-2xl border border-border/50 p-2 data-[state=active]:border-primary data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-lg sm:gap-3"
            >
              <HistoryIcon className="h-6 w-6" />
              <span className="text-xs font-medium sm:text-sm">
                {t("profile.tab.history")} ({lastMonth.length})
              </span>
            </TabsTrigger>
            <TabsTrigger
              value="search"
              className="glass flex aspect-square flex-col items-center justify-center gap-2 rounded-2xl border border-border/50 p-2 data-[state=active]:border-primary data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-lg sm:gap-3"
            >
              <SearchIcon className="h-6 w-6" />
              <span className="text-xs font-medium sm:text-sm">{t("profile.tab.search")}</span>
            </TabsTrigger>
          </TabsList>

          {/* Info */}
          <TabsContent value="info" className="mt-6">
            <form onSubmit={handleSave} className="glass rounded-2xl p-6">
              <h2 className="mb-4 font-display text-lg font-semibold">{t("profile.editInfo")}</h2>
              <div className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    {t("profile.name")}
                  </label>
                  <div className="relative">
                    <UserIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full rounded-xl border border-border bg-background/50 py-3 pl-10 pr-3 text-sm focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    {t("profile.email")}
                  </label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="email"
                      value={user.email}
                      disabled
                      className="w-full cursor-not-allowed rounded-xl border border-border bg-background/30 py-3 pl-10 pr-3 text-sm text-muted-foreground"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-2 sm:flex-row">
                <button
                  type="submit"
                  className="gradient-primary flex flex-1 items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-primary-foreground shadow-lg hover:opacity-90"
                >
                  <Save className="h-4 w-4" />
                  {t("profile.saveChanges")}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    navigate("/");
                  }}
                  className="flex items-center justify-center gap-2 rounded-xl border border-border bg-secondary/50 px-5 py-3 text-sm font-medium text-foreground hover:bg-secondary"
                >
                  <LogOut className="h-4 w-4" />
                  {t("auth.logout")}
                </button>
              </div>
            </form>
          </TabsContent>

          {/* Favorites */}
          <TabsContent value="favorites" className="mt-6">
            {renderRemovableGrid(
              favorites,
              removeFavorite,
              t("fav.empty"),
              <Heart className="h-10 w-10" />
            )}
          </TabsContent>

          {/* Watchlist */}
          <TabsContent value="watchlist" className="mt-6">
            {renderRemovableGrid(
              watchlist,
              removeWatchlist,
              t("watch.empty"),
              <Bookmark className="h-10 w-10" />
            )}
          </TabsContent>

          {/* History */}
          <TabsContent value="history" className="mt-6">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {t("profile.history.subtitle")}
              </p>
              {lastMonth.length > 0 && (
                <button
                  onClick={() => {
                    clearHistory();
                    toast.success(t("profile.history.cleared"));
                  }}
                  className="flex items-center gap-1.5 rounded-lg border border-border bg-secondary/50 px-3 py-1.5 text-xs font-medium hover:bg-secondary"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  {t("common.clear")}
                </button>
              )}
            </div>
            {lastMonth.length === 0 ? (
              <div className="glass rounded-2xl p-12 text-center">
                <HistoryIcon className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
                <p className="text-muted-foreground">{t("profile.history.empty")}</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {lastMonth.map((entry, i) => (
                  <div key={`${entry.movie.title}-${entry.viewedAt}`} className="relative">
                    <MovieCard
                      movie={entry.movie}
                      index={i}
                      onClick={() => setSelected(entry.movie)}
                    />
                    <div className="absolute bottom-16 right-2 rounded-md bg-background/80 px-2 py-0.5 text-[10px] font-medium text-muted-foreground backdrop-blur-sm">
                      {new Date(entry.viewedAt).toLocaleDateString(localeFor(lang), {
                        day: "numeric",
                        month: "short",
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="search" className="mt-6">
            <div className="glass rounded-2xl p-8 text-center">
              <SearchIcon className="mx-auto mb-3 h-10 w-10 text-primary" />
              <h3 className="font-display text-xl font-semibold">{t("profile.search.title")}</h3>
              <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
                {t("profile.search.subtitle")}
              </p>
              <div className="mt-5 flex flex-col items-center justify-center gap-2 sm:flex-row">
                <button
                  onClick={() => navigate("/")}
                  className="gradient-primary flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-primary-foreground shadow-lg hover:opacity-90"
                >
                  {t("profile.search.aiBtn")}
                </button>
                <button
                  onClick={() => navigate("/buscar")}
                  className="flex items-center gap-2 rounded-xl border border-border bg-secondary/50 px-5 py-3 text-sm font-medium hover:bg-secondary"
                >
                  {t("profile.search.classicBtn")}
                </button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>

      <MovieModal movie={selected} onClose={() => setSelected(null)} />
    </div>
  );
};

export default Profile;