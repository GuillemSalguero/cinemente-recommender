import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Loader2, Sparkles, Cpu, Info } from "lucide-react";
import { useI18n } from "@/i18n/I18nContext";
import { RECO_ALGORITHMS, type RecoAlgorithm } from "@/lib/backend";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Si el teu TS es queixa a l'hora de fer t(`algorithms.${hoveredAlgo}`), pots importar el tipus.
// import { type DictKey } from "@/i18n/translations"; // o la ruta on tinguis el DictKey

interface SearchHeroProps {
  onSearch: (query: string, algorithm?: RecoAlgorithm) => void;
  isLoading: boolean;
}

const SearchHero = ({ onSearch, isLoading }: SearchHeroProps) => {
  const { t } = useI18n();
  const [query, setQuery] = useState("");
  const [algorithm, setAlgorithm] = useState<"default" | RecoAlgorithm>("default");
  
  // Guardem l'algorisme sobre el qual tenim el ratolí (excepte el default)
  const [hoveredAlgo, setHoveredAlgo] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim() && !isLoading) {
      onSearch(query, algorithm === "default" ? undefined : algorithm);
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
          {t("hero.tag")}
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
        {t("hero.subtitle")}
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
            placeholder={t("hero.placeholder")}
            rows={3}
            className="w-full resize-none rounded-2xl bg-transparent px-5 py-5 text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
            disabled={isLoading}
          />
        </div>

        <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          
          {/* Contenidor relatiu per posicionar el selector i el tooltip correctament */}
          <div className="relative flex items-center">
            <Select
              value={algorithm}
              onValueChange={(v) => setAlgorithm(v as "default" | RecoAlgorithm)}
              disabled={isLoading}
              onOpenChange={(isOpen) => !isOpen && setHoveredAlgo(null)}
            >
              <SelectTrigger
                className="glass glass-hover group h-auto w-auto gap-2.5 rounded-full border-white/[0.06] py-2 pl-3 pr-3.5 text-xs shadow-none transition-all duration-300 focus:ring-0 focus:ring-offset-0 data-[state=open]:border-primary/30 data-[state=open]:glow-primary-sm"
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-full gradient-primary shadow-md transition-transform duration-300 group-hover:scale-110">
                  <Cpu className="h-3 w-3 text-primary-foreground" />
                </span>
                <span className="text-[0.7rem] uppercase tracking-widest text-muted-foreground">
                  {t("hero.algorithm")}
                </span>
                <span className="text-xs font-semibold text-foreground">
                  <SelectValue />
                </span>
              </SelectTrigger>

              <SelectContent className="glass rounded-xl border-white/[0.08] p-1.5 shadow-2xl">
                {/* 1. L'opció 'default' ja NO té onPointerEnter, així que no obre el popup */}
                <SelectItem
                  value="default"
                  className="rounded-lg text-xs font-medium focus:bg-primary/10 focus:text-primary"
                >
                  ✨ {t("hero.algoDefault")}
                </SelectItem>
                
                {RECO_ALGORITHMS.map((a) => (
                  <SelectItem
                    key={a}
                    value={a}
                    className="rounded-lg font-mono text-xs focus:bg-primary/10 focus:text-primary"
                    onPointerEnter={() => setHoveredAlgo(a)}
                    onPointerLeave={() => setHoveredAlgo(null)}
                  >
                    {a}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* 2. Tooltip de l'Algorisme */}
            <AnimatePresence>
              {hoveredAlgo && (
                <motion.div
                  initial={{ opacity: 0, x: -10, filter: "blur(4px)" }}
                  animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, x: -10, filter: "blur(4px)" }}
                  transition={{ duration: 0.2 }}
                  // L'ancla a la dreta (left-full + ml-4) i el centra verticalment (top-1/2 -translate-y-1/2)
                  className="absolute left-full ml-4 top-1/2 -translate-y-1/2 w-64 glass rounded-xl border-white/[0.08] p-4 shadow-2xl z-[100] hidden md:flex flex-col gap-2 pointer-events-none"
                >
                  <div className="flex items-center gap-2 text-primary">
                    <Info className="h-4 w-4" />
                    <span className="text-sm font-semibold capitalize tracking-wide">
                      {hoveredAlgo.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {/* Utilitzem la funció del teu diccionari per renderitzar dinàmicament el text. Posem "as any" per evitar errors de tipat ràpids en el TypeScript */}
                    {t(`algorithms.${hoveredAlgo}` as any)}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button
            type="submit"
            disabled={isLoading || !query.trim()}
            className="gradient-primary flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-primary-foreground shadow-lg transition-all duration-200 hover:opacity-90 hover:shadow-xl disabled:opacity-40 disabled:cursor-not-allowed md:w-auto"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {t("hero.thinking")}
              </>
            ) : (
              <>
                <Search className="h-4 w-4" />
                {t("hero.searchBtn")}
              </>
            )}
          </button>
        </div>
      </motion.form>
    </motion.section>
  );
};

export default SearchHero;