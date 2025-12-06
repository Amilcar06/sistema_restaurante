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
  FileText,
  UserCircle
} from "lucide-react";
import logoWeb from "../assets/LogoWeb.png";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "./ui/button";
import { motion, AnimatePresence } from "framer-motion";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";

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

  const filteredMenu = menuItems.map(section => {
    if (section.title === "Administración") {
      return {
        ...section,
        items: section.items.filter(item => {
          if (["/users", "/roles", "/settings"].includes(item.path)) {
            return hasPermission("admin") || hasPermission("gestionar_usuarios");
          }
          return true;
        })
      };
    }
    return section;
  }).filter(section => section.items.length > 0);

  // Helper for active state logic (simplified but robust)
  const isPathActive = (path: string) => {
    if (path === "/dashboard") return location.pathname === "/" || location.pathname === "/dashboard";
    return location.pathname.startsWith(path);
  };

  return (
    <>
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-[100] p-2 bg-background border border-border rounded-lg text-foreground hover:bg-accent transition-colors shadow-lg focus:outline-none focus:ring-2 focus:ring-[#F26522]"
        aria-label="Toggle menu"
      >
        {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lg:hidden fixed inset-0 bg-black/60 z-[40]"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}
      </AnimatePresence>

      <motion.aside
        initial={false}
        animate={isMobileMenuOpen ? { x: 0 } : { x: "-100%" }}
        variants={{
          open: { x: 0 },
          closed: { x: "-100%" }
        }}
        // Apply transform only on mobile/tablet (handled via media query in className usually, but framer motion overrides style)
        // We use a custom logic: On desktop (lg), we reset transform via !transform-none
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 h-screen bg-[#1B1B1B] text-white border-r border-[#F26522]/10 flex flex-col shadow-2xl lg:shadow-none lg:translate-x-0 lg:!transform-none`}
        style={{ x: isMobileMenuOpen ? "0%" : "-100%" }} // Fallback/Force for mobile
      >
        {/* Logo */}
        <div className="p-6 border-b border-gray-800">
          <NavLink to="/dashboard" onClick={() => setIsMobileMenuOpen(false)}>
            <div className="flex items-center gap-3 group">
              <img src={logoWeb} alt="GastroSmart Logo" className="w-10 h-10 object-contain group-hover:scale-110 transition-transform duration-300" />
              <div>
                <div className="text-white font-black text-xl tracking-tight leading-none">
                  Gastro<span className="text-[#F26522]">Smart</span>
                </div>
                <div className="text-gray-500 text-[10px] font-bold tracking-widest uppercase mt-1 group-hover:text-[#F26522] transition-colors">Sistema de Control</div>
              </div>
            </div>
          </NavLink>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-2 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
          {filteredMenu.map((section, sectionIndex) => {
            const sectionKey = section.title?.toLowerCase().replace(/\s+/g, '-') || `section-${sectionIndex}`;
            const isExpanded = expandedSections.has(sectionKey);
            const hasTitle = section.title && section.items.length > 0;

            return (
              <div key={sectionKey} className="space-y-1 mb-2">
                {hasTitle && (
                  <button
                    onClick={() => toggleSection(sectionKey)}
                    className="w-full flex items-center justify-between px-3 py-2 text-gray-500 hover:text-white transition-colors text-xs font-bold uppercase tracking-wider focus:outline-none focus:text-[#F26522]"
                  >
                    <span>{section.title}</span>
                    <motion.div
                      animate={{ rotate: isExpanded ? 0 : -90 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronDown className="w-3 h-3" />
                    </motion.div>
                  </button>
                )}

                <AnimatePresence initial={false}>
                  {(!hasTitle || isExpanded) && (
                    <motion.div
                      key="content"
                      initial="collapsed"
                      animate="open"
                      exit="collapsed"
                      variants={{
                        open: { opacity: 1, height: "auto" },
                        collapsed: { opacity: 0, height: 0 }
                      }}
                      transition={{ duration: 0.2 }}
                      className="space-y-1 overflow-hidden"
                    >
                      {section.items.map((item) => {
                        const Icon = item.icon;
                        const active = isPathActive(item.path);

                        return (
                          <NavLink
                            key={item.path}
                            to={item.path}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className={`group w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-[#F26522] relative overflow-hidden ${active
                              ? "bg-[#F26522] text-white shadow-md shadow-[#F26522]/20 font-bold"
                              : "text-gray-400 hover:text-white hover:bg-gray-800"
                              }`}
                          >
                            {/* Active Indicator Bar */}
                            {active && (
                              <motion.div
                                layoutId="activeIndicator"
                                className="absolute left-0 top-0 bottom-0 w-1 bg-white/20"
                              />
                            )}

                            <Icon className={`w-5 h-5 flex-shrink-0 transition-transform group-hover:scale-110 ${active ? 'text-white' : 'text-gray-500 group-hover:text-white'}`} />
                            <span className="text-sm">{item.label}</span>
                          </NavLink>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </nav>

        {/* User Info & Logout */}
        <div className="p-4 border-t border-gray-800 bg-[#151515]">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-3 mb-4 px-2 py-2 rounded-lg hover:bg-gray-800 transition-colors cursor-help">
                  <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center border border-gray-600 text-[#F26522]">
                    <UserCircle className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white truncate">{usuario?.nombre_completo || usuario?.nombre_usuario || 'Usuario'}</p>
                    <p className="text-xs text-gray-500 truncate">{(usuario as any)?.rol || 'Staff'}</p>
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent side="right" className="bg-[#1B1B1B] border-gray-700 text-white">
                <p>{usuario?.email || 'No email'}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <Button
            onClick={handleLogout}
            variant="ghost"
            className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors group"
          >
            <LogOut className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Cerrar Sesión
          </Button>

          <div className="text-gray-700 text-center text-[10px] font-medium pt-4 tracking-widest uppercase opacity-50">
            v1.0.0
          </div>
        </div>
      </motion.aside>
    </>
  );
}
