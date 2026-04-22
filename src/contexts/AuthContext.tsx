import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  provider: "email" | "google";
}

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<Pick<User, "name" | "avatar">>) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const STORAGE_KEY = "cinemente_user";
const USERS_KEY = "cinemente_users";

interface StoredUser extends User {
  password?: string;
}

const readUsers = (): StoredUser[] => {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
  } catch {
    return [];
  }
};

const writeUsers = (users: StoredUser[]) => {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setUser(JSON.parse(stored));
    } catch {
      // ignore
    }
    setIsLoading(false);
  }, []);

  const persist = (u: User | null) => {
    setUser(u);
    if (u) localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
    else localStorage.removeItem(STORAGE_KEY);
  };

  const login = async (email: string, password: string) => {
    await new Promise((r) => setTimeout(r, 600));
    const users = readUsers();
    const found = users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );
    if (!found) throw new Error("Email o contraseña incorrectos");
    const { password: _pw, ...safe } = found;
    persist(safe);
  };

  const register = async (name: string, email: string, password: string) => {
    await new Promise((r) => setTimeout(r, 600));
    const users = readUsers();
    if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
      throw new Error("Ese email ya está registrado");
    }
    const newUser: StoredUser = {
      id: crypto.randomUUID(),
      email,
      name,
      provider: "email",
      password,
    };
    writeUsers([...users, newUser]);
    const { password: _pw, ...safe } = newUser;
    persist(safe);
  };

  const loginWithGoogle = async () => {
    await new Promise((r) => setTimeout(r, 600));
    const fakeUser: User = {
      id: "google-demo",
      email: "demo@gmail.com",
      name: "Usuario Google",
      avatar: "https://api.dicebear.com/7.x/initials/svg?seed=Google",
      provider: "google",
    };
    persist(fakeUser);
  };

  const logout = () => persist(null);

  const updateProfile = (data: Partial<Pick<User, "name" | "avatar">>) => {
    if (!user) return;
    const updated = { ...user, ...data };
    persist(updated);
    const users = readUsers();
    writeUsers(users.map((u) => (u.id === user.id ? { ...u, ...data } : u)));
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
