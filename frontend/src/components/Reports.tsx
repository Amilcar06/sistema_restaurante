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

  const COLORS = ["#FF6B35", "#10B981", "#06B6D4", "#8B5CF6"];

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
          <h1 className="text-foreground mb-2">Reportes y Análisis</h1>
          <p className="text-muted-foreground">Visualiza el rendimiento de tu negocio</p>
        </div>
        <div className="flex gap-2">
          <Button
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
            onClick={() => handleExport('csv')}
            disabled={exporting}
          >
            <Download className="w-4 h-4 mr-2" />
            {exporting ? "Exportando..." : "Exportar CSV"}
          </Button>
          <Button
            variant="outline"
            className="border-primary/20 text-foreground hover:bg-muted/10"
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
          <Card className="bg-card border-primary/20 p-6 hover:bg-muted/50 hover:border-primary/40 transition-all duration-300">
            <div className="flex items-center gap-4">
              <div className="bg-primary/10 p-3 rounded-lg hover:bg-primary/20 transition-colors">
                <DollarSign className="w-6 h-6 text-primary" />
              </div>
              <div>
                <div className="text-muted-foreground mb-1 text-sm font-medium">Ventas del Período</div>
                <div className="text-foreground text-2xl font-bold">Bs. {resumen.ventas_totales.toLocaleString('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
              </div>
            </div>
          </Card>
          <Card className="bg-card border-primary/20 p-6 hover:bg-muted/50 hover:border-primary/40 transition-all duration-300">
            <div className="flex items-center gap-4">
              <div className="bg-primary/10 p-3 rounded-lg hover:bg-primary/20 transition-colors">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
              <div>
                <div className="text-muted-foreground mb-1 text-sm font-medium">Ganancia Neta</div>
                <div className="text-foreground text-2xl font-bold">Bs. {resumen.ganancia_neta.toLocaleString('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
              </div>
            </div>
          </Card>
          <Card className="bg-card border-primary/20 p-6 hover:bg-muted/50 hover:border-primary/40 transition-all duration-300">
            <div className="flex items-center gap-4">
              <div className="bg-primary/10 p-3 rounded-lg hover:bg-primary/20 transition-colors">
                <Award className="w-6 h-6 text-primary" />
              </div>
              <div>
                <div className="text-muted-foreground mb-1 text-sm font-medium">Margen Promedio</div>
                <div className="text-foreground text-2xl font-bold">{resumen.margen_promedio.toFixed(1)}%</div>
              </div>
            </div>
          </Card>
          <Card className="bg-card border-primary/20 p-6 hover:bg-muted/50 hover:border-primary/40 transition-all duration-300">
            <div className="flex items-center gap-4">
              <div className="bg-primary/10 p-3 rounded-lg hover:bg-primary/20 transition-colors">
                <Calendar className="w-6 h-6 text-primary" />
              </div>
              <div>
                <div className="text-muted-foreground mb-1 text-sm font-medium">Crecimiento</div>
                <div className={`text-2xl font-bold ${resumen.crecimiento >= 0 ? 'text-primary' : 'text-destructive'}`}>
                  {resumen.crecimiento >= 0 ? '+' : ''}{resumen.crecimiento.toFixed(1)}%
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Monthly Trend */}
      {reporteMensual.length > 0 && (
        <Card className="bg-card border-primary/20 p-6 hover:bg-muted/50 transition-all duration-300">
          <h3 className="text-foreground mb-6 text-xl font-semibold">Tendencia Mensual</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={reporteMensual}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--primary))" opacity={0.2} />
              <XAxis dataKey="mes" stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" />
              <Tooltip
                contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--primary))", opacity: 0.9 }}
                labelStyle={{ color: "hsl(var(--foreground))" }}
              />
              <Legend />
              <Line type="monotone" dataKey="ventas" stroke="hsl(var(--primary))" strokeWidth={2} name="Ventas" />
              <Line type="monotone" dataKey="costos" stroke="hsl(var(--destructive))" strokeWidth={2} name="Costos" />
              <Line type="monotone" dataKey="ganancia" stroke="#10B981" strokeWidth={2} name="Ganancia" />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* Category Performance and Payment Methods */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {rendimientoCategorias.length > 0 && (
          <Card className="bg-card border-primary/20 p-6">
            <h3 className="text-foreground mb-4">Rendimiento por Categoría</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={rendimientoCategorias}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--primary))" opacity={0.2} />
                <XAxis dataKey="categoria" stroke="hsl(var(--muted-foreground))" angle={-15} textAnchor="end" height={80} />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--primary))", opacity: 0.9 }}
                  labelStyle={{ color: "hsl(var(--foreground))" }}
                />
                <Bar dataKey="ingresos" fill="hsl(var(--primary))" name="Ingresos (Bs.)" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        )}

        {metodosPago.length > 0 && (
          <Card className="bg-card border-primary/20 p-6">
            <h3 className="text-foreground mb-4">Métodos de Pago</h3>
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
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--primary))", opacity: 0.9 }}
                />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        )}
      </div>

      {/* Profit Margins */}
      {margenesGanancia.length > 0 && (
        <Card className="bg-card border-primary/20 p-6">
          <h3 className="text-foreground mb-4">Márgenes de Ganancia por Plato</h3>
          <div className="space-y-4">
            {margenesGanancia.map((item, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-foreground">{item.nombre}</span>
                  <span className="text-primary">{item.margen}%</span>
                </div>
                <div className="w-full bg-muted/20 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-primary h-full rounded-full transition-all"
                    style={{ width: `${item.margen}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {reporteMensual.length === 0 && rendimientoCategorias.length === 0 && margenesGanancia.length === 0 && (
        <Card className="bg-card border-primary/20 p-8 text-center">
          <p className="text-muted-foreground">No hay datos disponibles para mostrar en los reportes</p>
        </Card>
      )}
    </div>
  );
}
