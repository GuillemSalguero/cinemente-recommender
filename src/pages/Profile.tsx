import { useState } from "react";
import { motion } from "framer-motion";
import { User as UserIcon, Mail, LogIn, Save, LogOut, Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useFavorites } from "@/hooks/useFavorites";

const Profile = () => {
  const { user, updateProfile, logout } = useAuth();
  const { favorites } = useFavorites();
  const navigate = useNavigate();
  const [name, setName] = useState(user?.name || "");

  if (!user) {
    return (
      <div className="flex min-h-[80vh] flex-col items-center justify-center px-4 text-center">
        <UserIcon className="mb-4 h-12 w-12 text-muted-foreground" />
        <h2 className="font-display text-2xl font-bold">Sin sesión activa</h2>
        <p className="mt-2 max-w-md text-muted-foreground">
          Inicia sesión para ver y editar tu perfil.
        </p>
        <button
          onClick={() => navigate("/auth")}
          className="gradient-primary mt-6 flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-primary-foreground shadow-lg hover:opacity-90"
        >
          <LogIn className="h-4 w-4" />
          Iniciar sesión
        </button>
      </div>
    );
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("El nombre no puede estar vacío");
      return;
    }
    updateProfile({ name: name.trim() });
    toast.success("Perfil actualizado");
  };

  return (
    <div className="px-4 py-8 md:px-8">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto max-w-2xl"
      >
        <header className="mb-8">
          <div className="mb-2 flex items-center gap-2">
            <UserIcon className="h-5 w-5 text-primary" />
            <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
              Tu cuenta
            </span>
          </div>
          <h1 className="font-display text-3xl font-bold md:text-4xl">
            Mi <span className="gradient-text">perfil</span>
          </h1>
        </header>

        {/* Avatar + meta */}
        <div className="glass mb-6 flex items-center gap-4 rounded-2xl p-6">
          <div className="gradient-primary flex h-16 w-16 shrink-0 items-center justify-center rounded-full text-2xl font-bold text-primary-foreground">
            {user.name[0]?.toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate font-display text-lg font-semibold">{user.name}</p>
            <p className="truncate text-sm text-muted-foreground">{user.email}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Iniciaste con {user.provider === "google" ? "Google" : "email"}
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <button
            onClick={() => navigate("/favoritos")}
            className="glass flex items-center gap-4 rounded-2xl p-5 text-left transition-colors hover:bg-cinema-glass/80"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <Heart className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{favorites.length}</p>
              <p className="text-xs text-muted-foreground">Favoritos</p>
            </div>
          </button>
        </div>

        {/* Edit form */}
        <form onSubmit={handleSave} className="glass rounded-2xl p-6">
          <h2 className="mb-4 font-display text-lg font-semibold">Editar información</h2>

          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Nombre
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
                Email
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
              Guardar cambios
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
              Cerrar sesión
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default Profile;
