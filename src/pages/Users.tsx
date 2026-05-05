import { useState } from "react";
import { Users as UsersIcon, Search as SearchIcon, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { friendsService, type BackendFriend } from "@/lib/backend";
import { useI18n } from "@/i18n/I18nContext";
import { toast } from "@/hooks/use-toast";

const Users = () => {
  const { user: me } = useAuth();
  const { t } = useI18n();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<BackendFriend[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

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
            {results.map((u) => (
              <div
                key={u.id}
                className="glass flex items-center gap-4 rounded-2xl p-4 text-left transition-all hover:border-primary/40 hover:bg-cinema-glass/80"
              >
                <div className="gradient-primary flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-lg font-bold text-primary-foreground">
                  {u.name[0]?.toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{u.name}</p>
                  <p className="truncate text-xs text-muted-foreground">ID: {u.id}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Users;
