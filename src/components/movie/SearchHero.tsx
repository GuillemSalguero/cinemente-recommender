import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Loader2, Sparkles } from "lucide-react";

interface SearchHeroProps {
  onSearch: (query: string) => void;
  isLoading: boolean;
}

const SearchHero = ({ onSearch, isLoading }: SearchHeroProps) => {
  const [query, setQuery] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim() && !isLoading) {
      onSearch(query);
    }
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="flex flex-col items-center justify-center px-4 pt-20 pb-12 md:pt-32 md:pb-16"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="mb-3 flex items-center gap-2"
      >
        <Sparkles className="h-5 w-5 text-primary" />
        <span className="text-sm font-medium tracking-widest uppercase text-muted-foreground">
          Búsqueda inteligente
        </span>
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="mb-4 text-center font-display text-4xl font-bold tracking-tight md:text-6xl"
      >
        <span className="gradient-text">Cine</span>
        <span className="text-foreground">Mente</span>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="mb-8 max-w-md text-center text-muted-foreground md:text-lg"
      >
        Describe lo que quieres ver y la IA encontrará la película perfecta para ti.
      </motion.p>

      <motion.form
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        onSubmit={handleSubmit}
        className="w-full max-w-xl"
      >
        <div className="glass group relative rounded-2xl transition-all duration-300 hover:border-primary/20 focus-within:border-primary/30 focus-within:glow-primary-sm">
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            placeholder="Quiero algo de suspenso con un giro inesperado..."
            rows={3}
            className="w-full resize-none rounded-2xl bg-transparent px-5 py-5 text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
            disabled={isLoading}
          />
        </div>

        <button
          type="submit"
          disabled={isLoading || !query.trim()}
          className="gradient-primary mt-4 flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-primary-foreground shadow-lg transition-all duration-200 hover:opacity-90 hover:shadow-xl disabled:opacity-40 disabled:cursor-not-allowed md:w-auto md:ml-auto md:mt-3"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Pensando...
            </>
          ) : (
            <>
              <Search className="h-4 w-4" />
              Buscar Películas
            </>
          )}
        </button>
      </motion.form>
    </motion.section>
  );
};

export default SearchHero;
