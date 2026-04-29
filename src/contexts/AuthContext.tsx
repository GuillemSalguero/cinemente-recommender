import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { authService, type BackendUser } from "@/lib/backend";
import { tokenStore } from "@/lib/api";

export interface User {
  id: string;
  name: string;
  avatar?: string;
  /** Compat: el back no maneja email, pero lo dejamos opcional para UI antiguas. */
  email?: string;
  provider: "password" | "google";
}

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  /** Login real contra /api/auth/login con `name` + `password`. */
  login: (name: string, password: string) => Promise<void>;
  /** Registro real contra /api/auth/register con `name` + `password`. */
  register: (name: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<Pick<User, "name" | "avatar">>) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const USER_KEY = "cinemente_user";

const fromBackend = (u: BackendUser): User => ({
  id: String(u.id),
  name: u.name,
  provider: "password",
});

const persistUser = (u: User | null) => {
  try {
    if (u) localStorage.setItem(USER_KEY, JSON.stringify(u));
    else localStorage.removeItem(USER_KEY);
  } catch {
    /* noop */
  }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restaurar sesión guardada (token + user). Solo si hay token válido en storage.
  useEffect(() => {
    try {
      const token = tokenStore.get();
      const stored = localStorage.getItem(USER_KEY);
      if (token && stored) setUser(JSON.parse(stored));
    } catch {
      /* noop */
    }
    setIsLoading(false);
  }, []);

  const apply = (u: User | null) => {
    setUser(u);
    persistUser(u);
  };

  const login = async (name: string, password: string) => {
    const res = await authService.login(name.trim(), password);
    apply(fromBackend(res.user));
  };

  const register = async (name: string, password: string) => {
    const res = await authService.register(name.trim(), password);
    apply(fromBackend(res.user));
  };

  const loginWithGoogle = async () => {
    // No soportado por el backend actual. Se mantiene la firma para evitar romper la UI.
    throw new Error("Google login no disponible todavía");
  };

  const logout = () => {
    authService.logout();
    apply(null);
  };

  const updateProfile = (data: Partial<Pick<User, "name" | "avatar">>) => {
    if (!user) return;
    const updated = { ...user, ...data };
    apply(updated);
  };

  return (
    <AuthContext.Provider
      value={{ user, isLoading, login, register, loginWithGoogle, logout, updateProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

/**
 * Compat: la pantalla de Users usaba este helper para listar usuarios locales.
 * Sin endpoint público todavía, devolvemos lista vacía.
 */
export const listAllUsers = (): User[] => [];
