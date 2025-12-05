import { useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  ChefHat,
  ShoppingCart,
  BarChart3,
  Settings as SettingsIcon,

  Menu,
  X,
  LogOut,
  Building2,
  Truck,
  Users,
  Shield,
  Tag,
  ChevronDown,
  ChevronRight,
  FileText
} from "lucide-react";
import logoWeb from "../assets/LogoWeb.png";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "./ui/button";

interface MenuSection {
  title?: string;
  items: MenuItem[];
}

interface MenuItem {
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}

export function Sidebar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['operaciones', 'administracion']));
  const location = useLocation();
  const navigate = useNavigate();
  const { usuario, logout, hasPermission } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleSection = (title: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(title)) {
      newExpanded.delete(title);
    } else {
      newExpanded.add(title);
    }
    setExpandedSections(newExpanded);
  };

  const menuItems: MenuSection[] = [
    {
      // Sin título - siempre visible
      items: [
        { path: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
      ]
    },
    {
      title: "Operaciones",
      items: [
        { path: "/inventory", icon: Package, label: "Inventario" },
        { path: "/recipes", icon: ChefHat, label: "Recetas" },
        { path: "/sales", icon: ShoppingCart, label: "Ventas" },
        { path: "/purchase-orders", icon: FileText, label: "Compras" },
      ]
    },
    {
      // Sin título - siempre visible
      items: [
        { path: "/reports", icon: BarChart3, label: "Reportes" },
      ]
    },
    {
      title: "Administración",
      items: [
        { path: "/locations", icon: Building2, label: "Sucursales" },
        { path: "/suppliers", icon: Truck, label: "Proveedores" },
        { path: "/users", icon: Users, label: "Usuarios" },
        { path: "/roles", icon: Shield, label: "Roles" },
        { path: "/promotions", icon: Tag, label: "Promociones" },
        { path: "/settings", icon: SettingsIcon, label: "Configuración" },
      ]
    },
  ];

  // Filtrar menú basado en permisos
  const filteredMenu = menuItems.map(section => {
    if (section.title === "Administración") {
      return {
        ...section,
        items: section.items.filter(item => {
          // Solo admin puede ver Usuarios, Roles y Configuración
          if (["/users", "/roles", "/settings"].includes(item.path)) {
            return hasPermission("admin") || hasPermission("gestionar_usuarios");
          }
          return true;
        })
      };
    }
    return section;
  }).filter(section => section.items.length > 0);

  const isActive = (path: string) => {
    if (path === "/dashboard") {
      return location.pathname === "/" || location.pathname === "/dashboard";
    }
    if (path === "/settings") {
      return location.pathname.startsWith("/settings");
    }
    return location.pathname === path || location.pathname.startsWith(path + "/");
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-[100] p-2 bg-background border border-border rounded-lg text-foreground hover:bg-accent transition-colors shadow-lg"
        aria-label="Toggle menu"
      >
        {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-[30]"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 h-screen bg-sidebar border-r border-sidebar-border flex flex-col transition-transform duration-300 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          }`}
        style={{ zIndex: isMobileMenuOpen ? 50 : 30 }}
      >
        {/* Logo */}
        <NavLink to="/dashboard" className="p-6 border-b border-sidebar-border hover:bg-sidebar-accent transition-colors">
          <div className="flex items-center gap-3">
            <img src={logoWeb} alt="GastroSmart Logo" className="w-12 h-12 object-contain" />
            <div>
              <div className="text-sidebar-foreground">
                <span className="text-primary" style={{ fontFamily: 'cursive' }}>Gastro</span>
                <span style={{ fontFamily: 'cursive' }}>smart</span>
              </div>
              <div className="text-primary/60">Sistema de Control</div>
            </div>
          </div>
        </NavLink>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto" role="navigation" aria-label="Navegación principal">
          {filteredMenu.map((section, sectionIndex) => {
            const sectionKey = section.title?.toLowerCase().replace(/\s+/g, '-') || `section-${sectionIndex}`;
            const isExpanded = expandedSections.has(sectionKey);
            const hasTitle = section.title && section.items.length > 1;

            return (
              <div key={sectionKey} className="space-y-2 mb-3">
                {hasTitle ? (
                  <button
                    onClick={() => toggleSection(sectionKey)}
                    className="w-full flex items-center justify-between px-3 py-2.5 text-sidebar-foreground/40 hover:text-sidebar-foreground/60 transition-colors text-xs font-semibold uppercase tracking-wider"
                  >
                    <span>{section.title}</span>
                    {isExpanded ? (
                      <ChevronDown className="w-3 h-3" />
                    ) : (
                      <ChevronRight className="w-3 h-3" />
                    )}
                  </button>
                ) : null}

                {(!hasTitle || isExpanded) && (
                  <div className="space-y-2">
                    {section.items.map((item) => {
                      const Icon = item.icon;
                      const active = isActive(item.path);

                      return (
                        <NavLink
                          key={item.path}
                          to={item.path}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className={({ isActive: navIsActive }) => `w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-300 ${navIsActive || active
                            ? "bg-sidebar-accent text-sidebar-accent-foreground border border-sidebar-primary shadow-sm"
                            : "text-sidebar-foreground/60 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground hover:translate-x-1"
                            }`}
                          aria-current={active ? "page" : undefined}
                          aria-label={`Ir a ${item.label}`}
                        >
                          <Icon className="w-5 h-5 flex-shrink-0" />
                          <span className="font-medium text-sm">{item.label}</span>
                        </NavLink>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* User Info & Logout */}
        <div className="p-4 border-t border-sidebar-border space-y-3">
          {usuario && (
            <div className="px-4 py-2 bg-sidebar-accent/50 rounded-lg">
              <div className="text-sidebar-foreground text-sm font-medium truncate">
                {usuario.nombre_completo || usuario.nombre_usuario}
              </div>
            </div>
          )}
          <Button
            onClick={handleLogout}
            variant="ghost"
            className="w-full justify-start text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Cerrar Sesión
          </Button>
          <div className="text-sidebar-foreground/40 text-center text-xs pt-2">
            <div>v1.0.0</div>
            <div>© 2025 GastroSmart</div>
          </div>
        </div>
      </aside>
    </>
  );
}
