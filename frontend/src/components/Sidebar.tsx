import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { LayoutDashboard, Package, ChefHat, ShoppingCart, BarChart3, Settings as SettingsIcon, Brain, Menu, X } from "lucide-react";

export function Sidebar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const menuItems = [
    { path: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { path: "/inventory", icon: Package, label: "Inventario" },
    { path: "/recipes", icon: ChefHat, label: "Recetas" },
    { path: "/sales", icon: ShoppingCart, label: "Ventas" },
    { path: "/reports", icon: BarChart3, label: "Reportes" },
    { path: "/settings", icon: SettingsIcon, label: "Configuración" },
  ];

  const isActive = (path: string) => {
    if (path === "/dashboard") {
      return location.pathname === "/" || location.pathname === "/dashboard";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-[100] p-2 bg-[#020617] border border-[#209C8A]/20 rounded-lg text-white hover:bg-[#209C8A]/10 transition-colors shadow-lg"
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
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#020617] border-r border-[#209C8A]/20 flex flex-col transition-transform duration-300 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          }`}
        style={{ zIndex: isMobileMenuOpen ? 50 : 30 }}
      >
        {/* Logo */}
        <NavLink to="/dashboard" className="p-6 border-b border-[#209C8A]/20 hover:bg-white/5 transition-colors">
          <div className="flex items-center gap-2">
            <Brain className="w-8 h-8 text-[#209C8A]" />
            <div>
              <div className="text-white">
                <span className="text-[#209C8A]" style={{ fontFamily: 'cursive' }}>Gastro</span>
                <span style={{ fontFamily: 'cursive' }}>smart</span>
              </div>
              <div className="text-[#209C8A]/60">Sistema de Control</div>
            </div>
          </div>
        </NavLink>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto" role="navigation" aria-label="Navegación principal">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) => `w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 ${isActive || active
                  ? "bg-[#209C8A]/20 text-white border border-[#209C8A]/30 shadow-lg shadow-[#209C8A]/10"
                  : "text-white/60 hover:bg-white/10 hover:text-white hover:translate-x-1"
                  }`}
                aria-current={active ? "page" : undefined}
                aria-label={`Ir a ${item.label}`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span className="font-medium">{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-[#209C8A]/20">
          <div className="text-white/40 text-center">
            <div>v1.0.0</div>
            <div>© 2025 GastroSmart</div>
          </div>
        </div>
      </aside>
    </>
  );
}
