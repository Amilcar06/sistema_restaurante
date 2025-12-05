import { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, Package, AlertTriangle, DollarSign } from "lucide-react";
import { Card } from "./ui/card";
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { dashboardApi } from "../services/api";
import { DashboardResponse } from "../types";

export function Dashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const data = await dashboardApi.obtenerEstadisticas();
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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !dashboardData) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-foreground mb-2">Dashboard</h1>
          <p className="text-destructive">{error || "No se pudieron cargar los datos"}</p>
        </div>
      </div>
    );
  }

  const stats = [
    {
      title: "Ventas del Día",
      value: `Bs. ${dashboardData.estadisticas.ventas_totales_hoy.toLocaleString('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      change: `${dashboardData.estadisticas.cambio_ventas_porcentaje >= 0 ? '+' : ''}${dashboardData.estadisticas.cambio_ventas_porcentaje.toFixed(1)}%`,
      trend: (dashboardData.estadisticas.cambio_ventas_porcentaje >= 0 ? "up" : "down") as "up" | "down",
      icon: DollarSign,
      color: "#FF6B35"
    },
    {
      title: "Insumos Críticos",
      value: dashboardData.estadisticas.items_criticos_count.toString(),
      change: "Requieren atención",
      trend: "down" as const,
      icon: AlertTriangle,
      color: "#EF4444"
    },
    {
      title: "Platos Vendidos",
      value: dashboardData.estadisticas.platos_vendidos_hoy.toString(),
      change: `${dashboardData.estadisticas.cambio_platos_porcentaje >= 0 ? '+' : ''}${dashboardData.estadisticas.cambio_platos_porcentaje.toFixed(1)}%`,
      trend: (dashboardData.estadisticas.cambio_platos_porcentaje >= 0 ? "up" : "down") as "up" | "down",
      icon: Package,
      color: "#FF6B35"
    },
    {
      title: "Margen Promedio",
      value: `${dashboardData.estadisticas.margen_promedio.toFixed(1)}%`,
      change: `${dashboardData.estadisticas.cambio_margen_porcentaje >= 0 ? '+' : ''}${dashboardData.estadisticas.cambio_margen_porcentaje.toFixed(1)}%`,
      trend: (dashboardData.estadisticas.cambio_margen_porcentaje >= 0 ? "up" : "down") as "up" | "down",
      icon: TrendingUp,
      color: "#FF6B35"
    },
  ];

  const salesData = dashboardData.ventas_por_dia;
  const topDishes = dashboardData.platos_top.map(dish => ({
    name: dish.nombre,
    ventas: dish.cantidad_vendida,
    ingresos: dish.ingresos
  }));

  const categoryDistribution = dashboardData.distribucion_categorias.map(cat => ({
    name: cat.nombre,
    value: cat.valor
  }));

  const COLORS = ["#FF6B35", "#10B981", "#06B6D4", "#8B5CF6"];

  const alerts = dashboardData.alertas;

  return (
    <div className="space-y-8 w-full relative">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-foreground mb-3 text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground text-base">Resumen general de tu negocio gastronómico</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={`stat-${index}`} className="p-6 cursor-default relative z-0">
              <div className="flex items-start justify-between mb-4">
                <div className="bg-primary/10 p-3 rounded-lg hover:bg-primary/20 transition-colors">
                  <Icon className="w-6 h-6" style={{ color: stat.color }} />
                </div>
                <div className={`flex items-center gap-1 text-sm font-medium ${stat.trend === "up" ? "text-primary" : "text-destructive"
                  }`}>
                  {stat.trend === "up" ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  <span>{stat.change}</span>
                </div>
              </div>
              <div className="text-muted-foreground mb-2 text-sm font-medium">{stat.title}</div>
              <div className="text-foreground text-2xl font-bold">{stat.value}</div>
            </Card>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Sales Chart */}
        <Card className="p-6">
          <h3 className="text-foreground mb-6 text-xl font-semibold">Ventas de la Semana</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 107, 53, 0.1)" />
              <XAxis dataKey="dia" stroke="#ffffff60" />
              <YAxis stroke="#ffffff60" />
              <Tooltip
                contentStyle={{ backgroundColor: "#0F1629", border: "1px solid rgba(255, 107, 53, 0.3)" }}
                labelStyle={{ color: "#ffffff" }}
              />
              <Line type="monotone" dataKey="ventas" stroke="#FF6B35" strokeWidth={2} dot={{ fill: "#FF6B35" }} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Category Distribution */}
        <Card className="p-6">
          <h3 className="text-foreground mb-6 text-xl font-semibold">Distribución por Categoría</h3>
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
                {categoryDistribution.map((_entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: "#0F1629", border: "1px solid rgba(255, 107, 53, 0.3)" }}
              />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Top Dishes and Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Dishes */}
        <Card className="p-6">
          <h3 className="text-foreground mb-6 text-xl font-semibold">Platos Más Vendidos</h3>
          <div className="space-y-3">
            {topDishes.map((dish, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors cursor-default">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/20 w-10 h-10 rounded-full flex items-center justify-center text-primary font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <div className="text-foreground font-medium">{dish.name}</div>
                    <div className="text-muted-foreground text-sm">{dish.ventas} unidades</div>
                  </div>
                </div>
                <div className="text-primary font-semibold">Bs. {dish.ingresos}</div>
              </div>
            ))}
          </div>
        </Card>

        {/* Alerts */}
        <Card className="p-6">
          <h3 className="text-foreground mb-6 text-xl font-semibold">Alertas Inteligentes</h3>
          <div className="space-y-3">
            {alerts.map((alert, index) => (
              <div
                key={index}
                className={`flex items-start gap-3 p-4 rounded-lg transition-all ${alert.tipo === "warning"
                  ? "bg-yellow-500/10 border border-yellow-500/20 hover:bg-yellow-500/15"
                  : "bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/15"
                  }`}
              >
                <AlertTriangle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${alert.tipo === "warning" ? "text-yellow-400" : "text-blue-400"
                  }`} />
                <p className="text-foreground/90 leading-relaxed">{alert.mensaje}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
