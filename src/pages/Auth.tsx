import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Loader2, Mail, Lock, User as UserIcon, Sparkles } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useI18n } from "@/i18n/I18nContext";

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4">
    <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.2 1.4-1.7 4.1-5.5 4.1-3.3 0-6-2.7-6-6.1s2.7-6.1 6-6.1c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.7 3.4 14.6 2.5 12 2.5 6.8 2.5 2.5 6.8 2.5 12s4.3 9.5 9.5 9.5c5.5 0 9.1-3.9 9.1-9.3 0-.6-.1-1.1-.2-1.5H12z"/>
  </svg>
);

const Auth = () => {
  const { user, login, register, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const { t } = useI18n();
  const [tab, setTab] = useState<"login" | "register">("login");
  const [loading, setLoading] = useState(false);

  // Login fields
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Register fields
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");

  if (user) return <Navigate to="/" replace />;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(loginEmail, loginPassword);
      toast.success(t("auth.welcome"));
      navigate("/");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (regPassword.length < 6) {
      toast.error(t("auth.shortPassword"));
      return;
    }
    setLoading(true);
    try {
      await register(regName, regEmail, regPassword);
      toast.success(t("auth.created"));
      navigate("/");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al registrarse");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setLoading(true);
    try {
      await loginWithGoogle();
      toast.success(t("auth.googleOk"));
      navigate("/");
    } catch {
      toast.error(t("auth.googleErr"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-primary/15 blur-[120px]" />
        <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-accent/10 blur-[100px]" />
      </div>

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="mb-8 flex flex-col items-center text-center">
            <div className="mb-3 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                {t("auth.tag")}
              </span>
            </div>
            <h1 className="font-display text-4xl font-bold tracking-tight">
              <span className="gradient-text">Cine</span>
              <span className="text-foreground">Mente</span>
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {t("auth.subtitle")}
            </p>
          </div>

          <div className="glass rounded-2xl p-6">
            <Tabs value={tab} onValueChange={(v) => setTab(v as "login" | "register")}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">{t("auth.tab.login")}</TabsTrigger>
                <TabsTrigger value="register">{t("auth.tab.register")}</TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="mt-6">
                <form onSubmit={handleLogin} className="space-y-4">
                  <FieldEmail value={loginEmail} onChange={setLoginEmail} />
                  <FieldPassword value={loginPassword} onChange={setLoginPassword} placeholder={t("auth.passwordPlaceholder")} />
                  <SubmitBtn loading={loading} label={t("auth.enter")} />
                </form>
              </TabsContent>

              <TabsContent value="register" className="mt-6">
                <form onSubmit={handleRegister} className="space-y-4">
                  <FieldName value={regName} onChange={setRegName} placeholder={t("auth.namePlaceholder")} />
                  <FieldEmail value={regEmail} onChange={setRegEmail} />
                  <FieldPassword value={regPassword} onChange={setRegPassword} placeholder={t("auth.passwordPlaceholder")} />
                  <SubmitBtn loading={loading} label={t("auth.create")} />
                </form>
              </TabsContent>
            </Tabs>

            <div className="my-6 flex items-center gap-3">
              <div className="h-px flex-1 bg-border" />
              <span className="text-xs uppercase tracking-wider text-muted-foreground">o</span>
              <div className="h-px flex-1 bg-border" />
            </div>

            <button
              onClick={handleGoogle}
              disabled={loading}
              className="flex w-full items-center justify-center gap-3 rounded-xl border border-border bg-secondary/50 px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-secondary disabled:opacity-50"
            >
              <GoogleIcon />
              {t("auth.googleBtn")}
            </button>
          </div>

          <button
            onClick={() => navigate("/")}
            className="mt-6 block w-full text-center text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            {t("auth.guest")}
          </button>
        </motion.div>
      </div>
    </div>
  );
};

const inputClass =
  "w-full rounded-xl border border-border bg-background/50 py-3 pl-10 pr-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20";

const FieldEmail = ({ value, onChange }: { value: string; onChange: (v: string) => void }) => (
  <div className="relative">
    <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
    <input
      type="email"
      required
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="tu@email.com"
      className={inputClass}
    />
  </div>
);

const FieldPassword = ({ value, onChange, placeholder = "Password" }: { value: string; onChange: (v: string) => void; placeholder?: string }) => (
  <div className="relative">
    <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
    <input
      type="password"
      required
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={inputClass}
    />
  </div>
);

const FieldName = ({ value, onChange, placeholder = "Name" }: { value: string; onChange: (v: string) => void; placeholder?: string }) => (
  <div className="relative">
    <UserIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
    <input
      type="text"
      required
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={inputClass}
    />
  </div>
);

const SubmitBtn = ({ loading, label }: { loading: boolean; label: string }) => (
  <button
    type="submit"
    disabled={loading}
    className="gradient-primary flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-primary-foreground shadow-lg transition-all hover:opacity-90 disabled:opacity-50"
  >
    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : label}
  </button>
);

export default Auth;
