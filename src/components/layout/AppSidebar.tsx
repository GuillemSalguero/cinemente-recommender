import { SearchCheck, Heart, Bookmark, User, Users, LogOut, LogIn, Sparkles, Globe } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { NavLink } from "@/components/NavLink";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useAuth } from "@/contexts/AuthContext";
import { useI18n } from "@/i18n/I18nContext";
import type { DictKey } from "@/i18n/translations";
import type { Lang } from "@/i18n/translations";

const items: { key: DictKey; url: string; icon: typeof SearchCheck }[] = [
  { key: "nav.searchAi", url: "/", icon: Sparkles },
  { key: "nav.search", url: "/buscar", icon: SearchCheck },
  { key: "nav.users", url: "/usuarios", icon: Users },
  { key: "nav.favorites", url: "/favoritos", icon: Heart },
  { key: "nav.watchlist", url: "/watchlist", icon: Bookmark },
  { key: "nav.profile", url: "/perfil", icon: User },
];

export const AppSidebar = () => {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { t, lang, setLang, langs } = useI18n();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border px-3 py-4">
        <div className="flex items-center gap-2">
          <div className="gradient-primary flex h-8 w-8 shrink-0 items-center justify-center rounded-lg">
            <Sparkles className="h-4 w-4 text-primary-foreground" />
          </div>
          {!collapsed && (
            <span className="font-display text-lg font-bold">
              <span className="gradient-text">Cine</span>
              <span className="text-foreground">Mente</span>
            </span>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{t("nav.menu")}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.key}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end
                      className="hover:bg-sidebar-accent/50"
                      activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      {!collapsed && <span>{t(item.key)}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Language switcher */}
        <SidebarGroup>
          <SidebarGroupLabel>{t("nav.language")}</SidebarGroupLabel>
          <SidebarGroupContent>
            {collapsed ? (
              <div className="flex justify-center px-2">
                <Globe className="h-4 w-4 text-muted-foreground" />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-1.5 px-2">
                {langs.map((l) => {
                  const active = l.code === lang;
                  return (
                    <button
                      key={l.code}
                      onClick={() => setLang(l.code as Lang)}
                      className={
                        "flex items-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium transition-colors " +
                        (active
                          ? "bg-sidebar-accent text-sidebar-primary"
                          : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-foreground")
                      }
                    >
                      <span>{l.flag}</span>
                      <span className="truncate">{l.label}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-3">
        {user ? (
          <div className="space-y-2">
            {!collapsed && (
              <div className="flex items-center gap-2 rounded-lg bg-sidebar-accent/40 px-2 py-2">
                <div className="gradient-primary flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-primary-foreground">
                  {user.name[0]?.toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-sidebar-foreground">
                    {user.name}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                </div>
              </div>
            )}
            <button
              onClick={() => {
                logout();
                navigate("/");
              }}
              className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm text-muted-foreground transition-colors hover:bg-sidebar-accent/50 hover:text-foreground"
            >
              <LogOut className="h-4 w-4 shrink-0" />
              {!collapsed && <span>{t("auth.logout")}</span>}
            </button>
          </div>
        ) : (
          <button
            onClick={() => navigate("/auth")}
            className="gradient-primary flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-primary-foreground shadow-lg transition-all hover:opacity-90"
          >
            <LogIn className="h-4 w-4 shrink-0" />
            {!collapsed && <span>{t("auth.login")}</span>}
          </button>
        )}
      </SidebarFooter>
    </Sidebar>
  );
};
