import { useState, useEffect } from "react";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Card } from "./ui/card";
import { TrendingUp, Calendar, DollarSign, Award, Loader2, Download } from "lucide-react";
import { Button } from "./ui/button";
import { reportesApi } from "../services/api";
import { ReporteMensual, RendimientoCategoria, MargenGanancia, MetodoPagoReporte, ResumenReporte } from "../types";
import { toast } from "sonner";

export function Reports() {
  const [loading, setLoading] = useState(true);
  const [reporteMensual, setReporteMensual] = useState<ReporteMensual[]>([]);
  const [rendimientoCategorias, setRendimientoCategorias] = useState<RendimientoCategoria[]>([]);
  const [margenesGanancia, setMargenesGanancia] = useState<MargenGanancia[]>([]);
  const [metodosPago, setMetodosPago] = useState<MetodoPagoReporte[]>([]);
  const [resumen, setResumen] = useState<ResumenReporte | null>(null);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      setLoading(true);
      const [mensual, categorias, margenes, pagos, resumenData] = await Promise.all([
        reportesApi.obtenerMensual(6),
        reportesApi.obtenerRendimientoCategorias(30),
        reportesApi.obtenerMargenesGanancia(),
        reportesApi.obtenerMetodosPagoReporte(30),
        reportesApi.obtenerResumen(30)
      ]);

      setReporteMensual(mensual);
      setRendimientoCategorias(categorias);
      setMargenesGanancia(margenes);
      setMetodosPago(pagos);
      setResumen(resumenData);
    } catch (error) {
      console.error("Error loading reports:", error);
      toast.error("Error al cargar los reportes");
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format: 'json' | 'csv' = 'csv') => {
    try {
      setExporting(true);
      await reportesApi.exportarReporte(format, 30);
      toast.success(`Reporte exportado como ${format.toUpperCase()}`);
    } catch (error) {
      console.error("Error exporting report:", error);
      toast.error("Error al exportar el reporte");
    } finally {
      setExporting(false);
    }
  };

  const COLORS = ["#F26522", "#1B1B1B", "#28C76F", "#FF9F43", "#EA5455", "#7367F0", "#00CFE8"];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 w-full relative">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[#1B1B1B] mb-2 text-3xl font-bold">Reportes y Análisis</h1>
          <p className="text-muted-foreground">Visualiza el rendimiento y métricas clave de tu negocio</p>
        </div>
        <div className="flex gap-2">
          <Button
            className="bg-[#F26522] hover:bg-[#F26522]/90 text-white font-bold shadow-lg"
            onClick={() => handleExport('csv')}
            disabled={exporting}
          >
            <Download className="w-4 h-4 mr-2" />
            {exporting ? "Exportando..." : "Exportar CSV"}
          </Button>
          <Button
            variant="outline"
            className="border-[#1B1B1B]/20 text-[#1B1B1B] hover:bg-[#1B1B1B]/5 font-medium"
            onClick={() => handleExport('json')}
            disabled={exporting}
          >
            Exportar JSON
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      {resumen && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-6 bg-white border-[#F26522]/20 hover:bg-white hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-[#F26522]/10 p-2 rounded-lg">
                <DollarSign className="w-6 h-6 text-[#F26522]" />
              </div>
              <span className="text-xs font-bold text-[#F26522] bg-[#F26522]/10 px-2 py-1 rounded-full border border-[#F26522]/20">
                +12% vs mes anterior
              </span>
            </div>
            <div className="text-[#1B1B1B]/60 text-sm font-bold uppercase tracking-wide mb-1">Ventas Totales (Mes)</div>
            <div className="text-[#1B1B1B] text-3xl font-bold tabular-nums tracking-tight">Bs. {resumen.ventas_totales.toFixed(2)}</div>
          </Card>

          <Card className="p-6 bg-white border-[#F26522]/20 hover:bg-white hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-[#28C76F]/10 p-2 rounded-lg">
                <TrendingUp className="w-6 h-6 text-[#28C76F]" />
              </div>
              <span className="text-xs font-bold text-[#28C76F] bg-[#28C76F]/10 px-2 py-1 rounded-full border border-[#28C76F]/20">Rentable</span>
            </div>
            <div className="text-[#1B1B1B]/60 text-sm font-bold uppercase tracking-wide mb-1">Ganancia Neta</div>
            <div className="text-[#1B1B1B] text-3xl font-bold tabular-nums tracking-tight">Bs. {resumen.ganancia_neta.toFixed(2)}</div>
          </Card>

          <Card className="p-6 bg-white border-[#F26522]/20 hover:bg-white hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-[#7367F0]/10 p-2 rounded-lg">
                <Calendar className="w-6 h-6 text-[#7367F0]" />
              </div>
            </div>
            <div className="text-[#1B1B1B]/60 text-sm font-bold uppercase tracking-wide mb-1">Margen Promedio</div>
            <div className="text-[#1B1B1B] text-3xl font-bold tabular-nums tracking-tight">{resumen.margen_promedio.toFixed(1)}%</div>
          </Card>

          <Card className="p-6 bg-[#F4F5F7] border-[#1B1B1B]/10 hover:bg-[#1B1B1B]/5 transition-all duration-300 transform hover:-translate-y-1 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-white p-2 rounded-lg shadow-sm">
                <Award className="w-6 h-6 text-[#1B1B1B]" />
              </div>
            </div>
            <div className="text-[#1B1B1B]/60 text-sm font-bold uppercase tracking-wide mb-1">Crecimiento</div>
            <div className={`text-3xl font-bold tabular-nums tracking-tight ${resumen.crecimiento >= 0 ? 'text-[#28C76F]' : 'text-[#EA5455]'}`}>
              {resumen.crecimiento >= 0 ? '+' : ''}{resumen.crecimiento.toFixed(1)}%
            </div>
          </Card>
        </div>
      )}

      {/* Monthly Trend */}
      {reporteMensual.length > 0 && (
        <Card className="bg-white border-[#F26522]/20 p-6 hover:bg-white hover:shadow-lg transition-all duration-300 shadow-sm">
          <h3 className="text-[#1B1B1B] mb-6 text-xl font-bold uppercase tracking-wide">Tendencia MENSUAL</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={reporteMensual}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F26522" opacity={0.1} />
              <XAxis dataKey="mes" stroke="#1B1B1B" opacity={0.6} tick={{ fill: '#1B1B1B', fontSize: 12 }} />
              <YAxis stroke="#1B1B1B" opacity={0.6} tick={{ fill: '#1B1B1B', fontSize: 12 }} />
              <Tooltip
                contentStyle={{ backgroundColor: "#FFFFFF", borderColor: "rgba(242, 101, 34, 0.2)", borderRadius: "8px", color: "#1B1B1B" }}
                labelStyle={{ color: "#1B1B1B", fontWeight: "bold" }}
              />
              <Legend wrapperStyle={{ paddingTop: "20px" }} />
              <Line type="monotone" dataKey="ventas" stroke="#F26522" strokeWidth={3} name="Ventas" activeDot={{ r: 8 }} />
              <Line type="monotone" dataKey="costos" stroke="#EA5455" strokeWidth={2} name="Costos" />
              <Line type="monotone" dataKey="ganancia" stroke="#28C76F" strokeWidth={3} name="Ganancia" />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* Category Performance and Payment Methods */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {rendimientoCategorias.length > 0 && (
          <Card className="bg-white border-[#F26522]/20 p-6 hover:bg-white hover:shadow-lg transition-all duration-300 shadow-sm">
            <h3 className="text-[#1B1B1B] mb-6 text-xl font-bold uppercase tracking-wide">Rendimiento por Categoría</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={rendimientoCategorias}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F26522" opacity={0.1} />
                <XAxis dataKey="categoria" stroke="#1B1B1B" opacity={0.6} angle={-15} textAnchor="end" height={80} tick={{ fill: '#1B1B1B', fontSize: 11 }} />
                <YAxis stroke="#1B1B1B" opacity={0.6} tick={{ fill: '#1B1B1B', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#FFFFFF", borderColor: "rgba(242, 101, 34, 0.2)", borderRadius: "8px", color: "#1B1B1B" }}
                  labelStyle={{ color: "#1B1B1B", fontWeight: "bold" }}
                  cursor={{ fill: 'rgba(242, 101, 34, 0.1)' }}
                />
                <Bar dataKey="ingresos" fill="#F26522" name="Ingresos (Bs.)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        )}

        {metodosPago.length > 0 && (
          <Card className="bg-white border-[#F26522]/20 p-6 hover:bg-white hover:shadow-lg transition-all duration-300 shadow-sm">
            <h3 className="text-[#1B1B1B] mb-6 text-xl font-bold uppercase tracking-wide">Métodos de Pago</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={metodosPago}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ metodo, porcentaje }) => `${metodo} ${porcentaje.toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="total"
                  nameKey="metodo"
                >
                  {metodosPago.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="white" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: "#FFFFFF", borderColor: "rgba(242, 101, 34, 0.2)", borderRadius: "8px", color: "#1B1B1B" }}
                  itemStyle={{ color: "#1B1B1B" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        )}
      </div>

      {/* Profit Margins */}
      {margenesGanancia.length > 0 && (
        <Card className="bg-white border-[#F26522]/20 p-6 hover:bg-white hover:shadow-lg transition-all duration-300 shadow-sm">
          <h3 className="text-[#1B1B1B] mb-6 text-xl font-bold uppercase tracking-wide">Márgenes de Ganancia por Plato</h3>
          <div className="space-y-4">
            {margenesGanancia.map((item, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[#1B1B1B] font-medium">{item.nombre}</span>
                  <span className="text-[#F26522] font-bold tabular-nums">{item.margen.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-[#1B1B1B]/10 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-[#F26522] h-full rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${item.margen}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {reporteMensual.length === 0 && rendimientoCategorias.length === 0 && margenesGanancia.length === 0 && (
        <Card className="bg-white border-[#F26522]/20 p-12 text-center shadow-sm">
          <p className="text-muted-foreground text-lg">No hay datos disponibles para mostrar en los reportes</p>
        </Card>
      )}
    </div>
  );
}
