import { Loader2 } from "lucide-react";
import { useI18n } from "@/i18n/I18nContext";

interface LoadMoreButtonProps {
  onClick: () => void;
  isLoading: boolean;
}

const LoadMoreButton = ({ onClick, isLoading }: LoadMoreButtonProps) => {
  const { t } = useI18n();
  return (
    <div className="flex justify-center py-8">
      <button
        onClick={onClick}
        disabled={isLoading}
        className="glass glass-hover flex items-center gap-2 rounded-xl px-8 py-3 text-sm font-medium text-muted-foreground transition-all duration-300 hover:text-foreground disabled:opacity-50"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            {t("common.loading")}
          </>
        ) : (
          t("common.loadMore")
        )}
      </button>
    </div>
  );
};

export default LoadMoreButton;
