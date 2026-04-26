import { Search, SearchCheck, Heart, Bookmark, User, LogOut, LogIn, Sparkles } from "lucide-react";
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

const items = [
  { title: "Buscar IA", url: "/", icon: Sparkles },
  { title: "Búsqueda", url: "/buscar", icon: SearchCheck },
  { title: "Favoritos", url: "/favoritos", icon: Heart },
  { title: "Watchlist", url: "/watchlist", icon: Bookmark },
  { title: "Perfil", url: "/perfil", icon: User },
];

export const AppSidebar = () => {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { user, logout } = useAuth();
  const navigate = useNavigate();

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
          <SidebarGroupLabel>Menú</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end
                      className="hover:bg-sidebar-accent/50"
                      activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
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
              {!collapsed && <span>Cerrar sesión</span>}
            </button>
          </div>
        ) : (
          <button
            onClick={() => navigate("/auth")}
            className="gradient-primary flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-primary-foreground shadow-lg transition-all hover:opacity-90"
          >
            <LogIn className="h-4 w-4 shrink-0" />
            {!collapsed && <span>Iniciar sesión</span>}
          </button>
        )}
      </SidebarFooter>
    </Sidebar>
  );
};
