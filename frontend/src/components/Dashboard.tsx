import { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, Package, AlertTriangle, DollarSign, RefreshCcw, Info } from "lucide-react";
import { Card } from "./ui/card";
import { PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";
import { dashboardApi } from "../services/api";
import { DashboardResponse } from "../types";
import { motion } from "framer-motion";
import { Button } from "./ui/button";
import { Skeleton } from "./ui/skeleton";
import {
  Tooltip as UiTooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";

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
      setError(null);
      const data = await dashboardApi.obtenerEstadisticas();
      setDashboardData(data);
    } catch (err) {
      console.error("Error loading dashboard data:", err);
      setError("No se pudieron cargar los datos del dashboard. Verifica tu conexión.");
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  if (loading) {
    return (
      <div className="space-y-8 w-full">
        <div className="space-y-2">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-5 w-96" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Skeleton className="h-80 rounded-xl" />
          <Skeleton className="h-80 rounded-xl" />
        </div>
      </div>
    );
  }

  if (error || !dashboardData) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-6 text-center">
        <div className="bg-red-50 p-6 rounded-full">
          <AlertTriangle className="w-12 h-12 text-red-500" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-[#1B1B1B] mb-2">Algo salió mal</h2>
          <p className="text-[#1B1B1B]/60 max-w-md mx-auto mb-6">{error}</p>
          <Button onClick={loadDashboardData} className="bg-[#F26522] hover:bg-[#F26522]/90 text-white gap-2">
            <RefreshCcw className="w-4 h-4" /> Reintentar
          </Button>
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
      color: "#F26522" // Brand Orange
    },
    {
      title: "Insumos Críticos",
      value: dashboardData.estadisticas.items_criticos_count.toString(),
      change: "Requieren atención",
      trend: "down" as const,
      icon: AlertTriangle,
      color: "#EA5455" // Error Red
    },
    {
      title: "Platos Vendidos",
      value: dashboardData.estadisticas.platos_vendidos_hoy.toString(),
      change: `${dashboardData.estadisticas.cambio_platos_porcentaje >= 0 ? '+' : ''}${dashboardData.estadisticas.cambio_platos_porcentaje.toFixed(1)}%`,
      trend: (dashboardData.estadisticas.cambio_platos_porcentaje >= 0 ? "up" : "down") as "up" | "down",
      icon: Package,
      color: "#F26522" // Brand Orange
    },
    {
      title: "Margen Promedio",
      value: `${dashboardData.estadisticas.margen_promedio.toFixed(1)}%`,
      change: `${dashboardData.estadisticas.cambio_margen_porcentaje >= 0 ? '+' : ''}${dashboardData.estadisticas.cambio_margen_porcentaje.toFixed(1)}%`,
      trend: (dashboardData.estadisticas.cambio_margen_porcentaje >= 0 ? "up" : "down") as "up" | "down",
      icon: TrendingUp,
      color: "#28C76F" // Success Green
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

  const COLORS = ["#F26522", "#1B1B1B", "#28C76F", "#FF9F43", "#EA5455"]; // Enhanced Palette
  const alerts = dashboardData.alertas;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-8 w-full relative pb-10"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="mb-8">
        <h1 className="text-[#1B1B1B] mb-2 text-3xl font-black uppercase tracking-tight">Dashboard</h1>
        <p className="text-[#1B1B1B]/60 text-base font-medium">Resumen general e inteligencia de negocio</p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div variants={itemVariants} key={`stat-${index}`}>
              <Card className="p-6 cursor-default relative overflow-hidden bg-white border border-[#F26522]/10 hover:border-[#F26522]/30 hover:shadow-lg transition-all duration-300 group">
                <div className="flex items-start justify-between mb-4">
                  <div className="bg-[#F26522]/10 p-3 rounded-xl group-hover:bg-[#F26522] group-hover:text-white transition-colors duration-300">
                    <Icon className="w-6 h-6 text-[#F26522] group-hover:text-white transition-colors" />
                  </div>
                  <div className={`flex items-center gap-1 text-sm font-bold ${stat.trend === "up" ? "text-[#28C76F]" : "text-[#EA5455]"
                    }`}>
                    {stat.trend === "up" ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                    <span>{stat.change}</span>
                  </div>
                </div>
                <div className="text-[#1B1B1B]/60 mb-1 text-sm font-bold uppercase tracking-wider">{stat.title}</div>
                <div className="text-[#1B1B1B] text-2xl font-black tabular-nums">{stat.value}</div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Sales Chart */}
        <motion.div variants={itemVariants}>
          <Card className="p-6 bg-white border border-[#F26522]/10 shadow-sm">
            <h3 className="text-[#1B1B1B] mb-6 text-xl font-bold uppercase flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[#F26522]" /> Ventas de la Semana
            </h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={salesData}>
                  <defs>
                    <linearGradient id="colorVentas" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F26522" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#F26522" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1B1B1B" strokeOpacity={0.05} vertical={false} />
                  <XAxis
                    dataKey="dia"
                    stroke="#1B1B1B"
                    strokeOpacity={0.4}
                    tick={{ fill: '#1B1B1B', fontSize: 12, opacity: 0.6 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    stroke="#1B1B1B"
                    strokeOpacity={0.1}
                    tick={{ fill: '#1B1B1B', fontSize: 12, opacity: 0.6 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(value) => `Bs${value}`}
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#1B1B1B", border: "none", borderRadius: "8px", boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }}
                    labelStyle={{ color: "#ffffff", fontWeight: "bold", marginBottom: "4px" }}
                    itemStyle={{ color: "#F26522" }}
                    formatter={(value: number) => [`Bs. ${value}`, "Ventas"]}
                  />
                  <Area
                    type="monotone"
                    dataKey="ventas"
                    stroke="#F26522"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorVentas)"
                    activeDot={{ r: 6, strokeWidth: 0, fill: "#F26522" }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </motion.div>

        {/* Category Distribution */}
        <motion.div variants={itemVariants}>
          <Card className="p-6 bg-white border border-[#F26522]/10 shadow-sm">
            <h3 className="text-[#1B1B1B] mb-6 text-xl font-bold uppercase flex items-center gap-2">
              <Package className="w-5 h-5 text-[#F26522]" /> Distribución por Categoría
            </h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {categoryDistribution.map((_entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} strokeWidth={0} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: "#1B1B1B", border: "none", borderRadius: "8px" }}
                    itemStyle={{ color: "#ffffff" }}
                  />
                </PieChart>
              </ResponsiveContainer>
              {/* Custom Legend */}
              <div className="flex flex-wrap justify-center gap-4 mt-2">
                {categoryDistribution.map((entry, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                    <span className="text-xs font-medium text-[#1B1B1B]/70">{entry.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Top Dishes and Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Dishes */}
        <motion.div variants={itemVariants}>
          <Card className="p-6 bg-white border border-[#F26522]/10 shadow-sm h-full">
            <h3 className="text-[#1B1B1B] mb-6 text-xl font-bold uppercase">Platos Más Vendidos</h3>
            <div className="space-y-4">
              {topDishes.map((dish, index) => (
                <div key={index} className="group flex items-center justify-between p-4 bg-[#F4F5F7] rounded-xl hover:bg-white hover:shadow-md hover:border hover:border-[#F26522]/20 transition-all duration-300 cursor-default border border-transparent">
                  <TooltipProvider>
                    <UiTooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center gap-4 cursor-help">
                          <div className="bg-[#1B1B1B] w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shadow-lg shadow-[#1B1B1B]/20 group-hover:scale-110 transition-transform">
                            {index + 1}
                          </div>
                          <div>
                            <div className="text-[#1B1B1B] font-bold group-hover:text-[#F26522] transition-colors">{dish.name}</div>
                            <div className="text-[#1B1B1B]/50 text-sm font-medium">{dish.ventas} unidades</div>
                          </div>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Este plato representa el {dashboardData.estadisticas.platos_vendidos_hoy > 0 ? ((dish.ventas / dashboardData.estadisticas.platos_vendidos_hoy) * 100).toFixed(0) : 0}% de las ventas hoy.</p>
                      </TooltipContent>
                    </UiTooltip>
                  </TooltipProvider>

                  <div className="text-[#F26522] font-black tabular-nums bg-white px-3 py-1 rounded-lg shadow-sm border border-[#F26522]/10 group-hover:bg-[#F26522] group-hover:text-white transition-colors">
                    Bs. {dish.ingresos}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Alerts */}
        <motion.div variants={itemVariants}>
          <Card className="p-6 bg-white border border-[#F26522]/10 shadow-sm h-full">
            <h3 className="text-[#1B1B1B] mb-6 text-xl font-bold uppercase flex items-center justify-between">
              <span>Alertas Inteligentes</span>
              <span className="text-xs bg-[#EA5455]/10 text-[#EA5455] px-2 py-1 rounded-full font-bold">{alerts.length} Activas</span>
            </h3>
            <div className="space-y-3">
              {alerts.map((alert, index) => (
                <TooltipProvider key={index}>
                  <UiTooltip>
                    <TooltipTrigger asChild>
                      <div
                        className={`group flex items-start gap-4 p-4 rounded-xl transition-all border cursor-help ${alert.tipo === "warning"
                          ? "bg-amber-50 border-amber-100 hover:bg-amber-100 hover:border-amber-200"
                          : "bg-blue-50 border-blue-100 hover:bg-blue-100 hover:border-blue-200"
                          }`}
                      >
                        <div className={`p-2 rounded-full shrink-0 ${alert.tipo === "warning" ? "bg-amber-500/10 text-amber-600" : "bg-blue-500/10 text-blue-600"}`}>
                          <AlertTriangle className="w-5 h-5" />
                        </div>
                        <div>
                          <p className={`font-semibold text-sm mb-1 ${alert.tipo === "warning" ? "text-amber-900" : "text-blue-900"}`}>
                            {alert.tipo === "warning" ? "Advertencia de Stock" : "Notificación del Sistema"}
                          </p>
                          <p className={`text-sm leading-relaxed ${alert.tipo === "warning" ? "text-amber-700" : "text-blue-700"}`}>
                            {alert.mensaje}
                          </p>
                        </div>
                        <Info className={`w-4 h-4 opacity-0 group-hover:opacity-50 transition-opacity ml-auto ${alert.tipo === "warning" ? "text-amber-400" : "text-blue-400"}`} />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Haz clic para ver detalles en Inventario.</p>
                    </TooltipContent>
                  </UiTooltip>
                </TooltipProvider>
              ))}
              {alerts.length === 0 && (
                <div className="text-center py-10 text-[#1B1B1B]/40 bg-[#F4F5F7] rounded-xl border border-dashed border-[#1B1B1B]/10">
                  <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p className="font-medium">Todo en orden. No hay alertas.</p>
                </div>
              )}
            </div>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
