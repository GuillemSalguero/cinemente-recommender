import { Loader2, Plus } from "lucide-react";
import { motion } from "framer-motion";
import { useI18n } from "@/i18n/I18nContext";

interface LoadMoreCardProps {
  onClick: () => void;
  isLoading: boolean;
  remainingCount?: number;
}

const LoadMoreCard = ({ onClick, isLoading, remainingCount = 3 }: LoadMoreCardProps) => {
  const { t } = useI18n();
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex-shrink-0 w-[80vw] snap-center"
    >
      <button
        onClick={onClick}
        disabled={isLoading}
        className="glass glass-hover flex aspect-[2/3] w-full flex-col items-center justify-center rounded-xl transition-all duration-300 disabled:opacity-50"
      >
        {isLoading ? (
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        ) : (
          <>
            <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full border border-primary/30 bg-primary/10">
              <Plus className="h-7 w-7 text-primary" />
            </div>
            <span className="text-sm font-medium text-muted-foreground">
              {t("common.moreFilms", { n: remainingCount })}
            </span>
          </>
        )}
      </button>
    </motion.div>
  );
};

export default LoadMoreCard;
