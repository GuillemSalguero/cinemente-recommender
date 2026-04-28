import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { dict, type DictKey, type Lang, LANGS } from "./translations";

const STORAGE_KEY = "cinemente_lang";
const SUPPORTED: Lang[] = ["es", "ca", "de", "fr"];

function detectBrowserLang(): Lang {
  if (typeof navigator === "undefined") return "es";
  const candidates: string[] = [];
  if (navigator.languages?.length) candidates.push(...navigator.languages);
  if (navigator.language) candidates.push(navigator.language);
  for (const c of candidates) {
    const code = c.toLowerCase().split("-")[0];
    if (SUPPORTED.includes(code as Lang)) return code as Lang;
  }
  return "es";
}

function getInitialLang(): Lang {
  if (typeof localStorage !== "undefined") {
    const saved = localStorage.getItem(STORAGE_KEY) as Lang | null;
    if (saved && SUPPORTED.includes(saved)) return saved;
  }
  return detectBrowserLang();
}

interface I18nContextValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  /** Use the current lang. Supports `{n}` placeholder. */
  t: (key: DictKey, vars?: Record<string, string | number>) => string;
  langs: typeof LANGS;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export const I18nProvider = ({ children }: { children: React.ReactNode }) => {
  const [lang, setLangState] = useState<Lang>(() => getInitialLang());

  useEffect(() => {
    if (typeof document !== "undefined") document.documentElement.lang = lang;
  }, [lang]);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try {
      localStorage.setItem(STORAGE_KEY, l);
    } catch {
      /* noop */
    }
  }, []);

  const t = useCallback<I18nContextValue["t"]>(
    (key, vars) => {
      const entry = dict[key];
      let str = (entry?.[lang] ?? entry?.es ?? key) as string;
      if (vars) {
        for (const [k, v] of Object.entries(vars)) {
          str = str.replace(new RegExp(`\\{${k}\\}`, "g"), String(v));
        }
      }
      return str;
    },
    [lang]
  );

  const value = useMemo(() => ({ lang, setLang, t, langs: LANGS }), [lang, setLang, t]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

export const useI18n = () => {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
};

/** Helper: locale code for `Date.toLocaleDateString` etc. */
export const localeFor = (lang: Lang): string =>
  ({ es: "es-ES", ca: "ca-ES", de: "de-DE", fr: "fr-FR" }[lang]);
