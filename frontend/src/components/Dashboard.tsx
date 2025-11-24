import { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, Package, DollarSign, AlertTriangle, CheckCircle2, Loader2 } from "lucide-react";
import { Card } from "./ui/card";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { dashboardApi, type DashboardData } from "../services/api";

export function Dashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const data = await dashboardApi.getStats();
      setDashboardData(data);
      setError(null);
    } catch (err) {
      console.error("Error loading dashboard data:", err);
      setError("Error al cargar los datos del dashboard");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-[#209C8A]" />
      </div>
    );
  }

  if (error || !dashboardData) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-white mb-2">Dashboard</h1>
          <p className="text-red-400">{error || "No se pudieron cargar los datos"}</p>
        </div>
      </div>
    );
  }

  const stats = [
    {
      title: "Ventas del Día",
      value: `Bs. ${dashboardData.stats.total_sales_today.toLocaleString('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      change: `${dashboardData.stats.sales_change_percent >= 0 ? '+' : ''}${dashboardData.stats.sales_change_percent.toFixed(1)}%`,
      trend: (dashboardData.stats.sales_change_percent >= 0 ? "up" : "down") as const,
      icon: DollarSign,
      color: "#209C8A"
    },
    {
      title: "Insumos Críticos",
      value: dashboardData.stats.critical_inventory_count.toString(),
      change: "Requieren atención",
      trend: "down" as const,
      icon: AlertTriangle,
      color: "#EF4444"
    },
    {
      title: "Platos Vendidos",
      value: dashboardData.stats.dishes_sold_today.toString(),
      change: `${dashboardData.stats.dishes_change_percent >= 0 ? '+' : ''}${dashboardData.stats.dishes_change_percent.toFixed(1)}%`,
      trend: (dashboardData.stats.dishes_change_percent >= 0 ? "up" : "down") as const,
      icon: Package,
      color: "#209C8A"
    },
    {
      title: "Margen Promedio",
      value: `${dashboardData.stats.average_margin.toFixed(1)}%`,
      change: `${dashboardData.stats.margin_change_percent >= 0 ? '+' : ''}${dashboardData.stats.margin_change_percent.toFixed(1)}%`,
      trend: (dashboardData.stats.margin_change_percent >= 0 ? "up" : "down") as const,
      icon: TrendingUp,
      color: "#209C8A"
    },
  ];

  const salesData = dashboardData.sales_by_day;
  const topDishes = dashboardData.top_dishes.map(dish => ({
    name: dish.name,
    ventas: dish.sales_count,
    ingresos: dish.revenue
  }));

  const categoryDistribution = dashboardData.category_distribution;
  const COLORS = ["#209C8A", "#10B981", "#06B6D4", "#8B5CF6"];

  const alerts = dashboardData.alerts;

  return (
    <div className="space-y-8 w-full relative">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-white mb-2">Dashboard</h1>
        <p className="text-white/70 text-base">Resumen general de tu negocio gastronómico</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={`stat-${index}`} className="bg-white/5 border-[#209C8A]/20 p-6 hover:bg-white/10 hover:border-[#209C8A]/40 transition-all duration-300 cursor-default relative z-0">
              <div className="flex items-start justify-between mb-4">
                <div className="bg-white/10 p-3 rounded-lg hover:bg-white/20 transition-colors">
                  <Icon className="w-6 h-6" style={{ color: stat.color }} />
                </div>
                <div className={`flex items-center gap-1 text-sm font-medium ${stat.trend === "up" ? "text-[#209C8A]" : "text-red-400"
                  }`}>
                  {stat.trend === "up" ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  <span>{stat.change}</span>
                </div>
              </div>
              <div className="text-white/70 mb-2 text-sm font-medium">{stat.title}</div>
              <div className="text-white text-2xl font-bold">{stat.value}</div>
            </Card>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Chart */}
        <Card className="bg-white/5 border-[#209C8A]/20 p-6 hover:bg-white/10 transition-all duration-300">
          <h3 className="text-white mb-6 text-xl font-semibold">Ventas de la Semana</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#209C8A20" />
              <XAxis dataKey="day" stroke="#ffffff60" />
              <YAxis stroke="#ffffff60" />
              <Tooltip
                contentStyle={{ backgroundColor: "#020617", border: "1px solid #209C8A40" }}
                labelStyle={{ color: "#ffffff" }}
              />
              <Line type="monotone" dataKey="ventas" stroke="#209C8A" strokeWidth={2} dot={{ fill: "#209C8A" }} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Category Distribution */}
        <Card className="bg-white/5 border-[#209C8A]/20 p-6 hover:bg-white/10 transition-all duration-300">
          <h3 className="text-white mb-6 text-xl font-semibold">Distribución por Categoría</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {categoryDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: "#020617", border: "1px solid #209C8A40" }}
              />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Top Dishes and Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Dishes */}
        <Card className="bg-white/5 border-[#209C8A]/20 p-6 hover:bg-white/10 transition-all duration-300">
          <h3 className="text-white mb-6 text-xl font-semibold">Platos Más Vendidos</h3>
          <div className="space-y-3">
            {topDishes.map((dish, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors cursor-default">
                <div className="flex items-center gap-3">
                  <div className="bg-[#209C8A]/20 w-10 h-10 rounded-full flex items-center justify-center text-[#209C8A] font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <div className="text-white font-medium">{dish.name}</div>
                    <div className="text-white/60 text-sm">{dish.ventas} unidades</div>
                  </div>
                </div>
                <div className="text-[#209C8A] font-semibold">Bs. {dish.ingresos}</div>
              </div>
            ))}
          </div>
        </Card>

        {/* Alerts */}
        <Card className="bg-white/5 border-[#209C8A]/20 p-6 hover:bg-white/10 transition-all duration-300">
          <h3 className="text-white mb-6 text-xl font-semibold">Alertas Inteligentes</h3>
          <div className="space-y-3">
            {alerts.map((alert, index) => (
              <div
                key={index}
                className={`flex items-start gap-3 p-4 rounded-lg transition-all ${alert.type === "warning"
                    ? "bg-yellow-500/10 border border-yellow-500/20 hover:bg-yellow-500/15"
                    : "bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/15"
                  }`}
              >
                <AlertTriangle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${alert.type === "warning" ? "text-yellow-400" : "text-blue-400"
                  }`} />
                <p className="text-white/90 leading-relaxed">{alert.message}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
