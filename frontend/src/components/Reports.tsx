import { useState, useEffect } from "react";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Card } from "./ui/card";
import { TrendingUp, Calendar, DollarSign, Award, Loader2, Download } from "lucide-react";
import { Button } from "./ui/button";
import { reportsApi, type MonthlyReport, type CategoryPerformance, type ProfitMargin, type PaymentMethod, type ReportSummary } from "../services/api";
import { toast } from "sonner";

export function Reports() {
  const [loading, setLoading] = useState(true);
  const [monthlyData, setMonthlyData] = useState<MonthlyReport[]>([]);
  const [categoryPerformance, setCategoryPerformance] = useState<CategoryPerformance[]>([]);
  const [profitMargins, setProfitMargins] = useState<ProfitMargin[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [summary, setSummary] = useState<ReportSummary | null>(null);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      setLoading(true);
      const [monthly, category, margins, payments, summaryData] = await Promise.all([
        reportsApi.getMonthly(6),
        reportsApi.getCategoryPerformance(30),
        reportsApi.getProfitMargins(),
        reportsApi.getPaymentMethods(30),
        reportsApi.getSummary(30)
      ]);

      setMonthlyData(monthly);
      setCategoryPerformance(category);
      setProfitMargins(margins);
      setPaymentMethods(payments);
      setSummary(summaryData);
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
      await reportsApi.exportReport(format, 30);
      toast.success(`Reporte exportado como ${format.toUpperCase()}`);
    } catch (error) {
      console.error("Error exporting report:", error);
      toast.error("Error al exportar el reporte");
    } finally {
      setExporting(false);
    }
  };

  const COLORS = ["#209C8A", "#10B981", "#06B6D4", "#8B5CF6"];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-[#209C8A]" />
      </div>
    );
  }

  return (
    <div className="space-y-8 w-full relative">
      {/* Header */}
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-white mb-2">Reportes y Análisis</h1>
          <p className="text-white/60">Visualiza el rendimiento de tu negocio</p>
        </div>
        <div className="flex gap-2">
          <Button
            className="bg-[#209C8A] hover:bg-[#209C8A]/90 text-white"
            onClick={() => handleExport('csv')}
            disabled={exporting}
          >
            <Download className="w-4 h-4 mr-2" />
            {exporting ? "Exportando..." : "Exportar CSV"}
          </Button>
          <Button
            variant="outline"
            className="border-[#209C8A]/20 text-white hover:bg-white/5"
            onClick={() => handleExport('json')}
            disabled={exporting}
          >
            Exportar JSON
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-white/5 border-[#209C8A]/20 p-6 hover:bg-white/10 hover:border-[#209C8A]/40 transition-all duration-300">
            <div className="flex items-center gap-4">
              <div className="bg-[#209C8A]/10 p-3 rounded-lg hover:bg-[#209C8A]/20 transition-colors">
                <DollarSign className="w-6 h-6 text-[#209C8A]" />
              </div>
              <div>
                <div className="text-white/70 mb-1 text-sm font-medium">Ventas del Período</div>
                <div className="text-white text-2xl font-bold">Bs. {summary.total_sales.toLocaleString('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
              </div>
            </div>
          </Card>
          <Card className="bg-white/5 border-[#209C8A]/20 p-6 hover:bg-white/10 hover:border-[#209C8A]/40 transition-all duration-300">
            <div className="flex items-center gap-4">
              <div className="bg-[#209C8A]/10 p-3 rounded-lg hover:bg-[#209C8A]/20 transition-colors">
                <TrendingUp className="w-6 h-6 text-[#209C8A]" />
              </div>
              <div>
                <div className="text-white/70 mb-1 text-sm font-medium">Ganancia Neta</div>
                <div className="text-white text-2xl font-bold">Bs. {summary.net_profit.toLocaleString('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
              </div>
            </div>
          </Card>
          <Card className="bg-white/5 border-[#209C8A]/20 p-6 hover:bg-white/10 hover:border-[#209C8A]/40 transition-all duration-300">
            <div className="flex items-center gap-4">
              <div className="bg-[#209C8A]/10 p-3 rounded-lg hover:bg-[#209C8A]/20 transition-colors">
                <Award className="w-6 h-6 text-[#209C8A]" />
              </div>
              <div>
                <div className="text-white/70 mb-1 text-sm font-medium">Margen Promedio</div>
                <div className="text-white text-2xl font-bold">{summary.average_margin.toFixed(1)}%</div>
              </div>
            </div>
          </Card>
          <Card className="bg-white/5 border-[#209C8A]/20 p-6 hover:bg-white/10 hover:border-[#209C8A]/40 transition-all duration-300">
            <div className="flex items-center gap-4">
              <div className="bg-[#209C8A]/10 p-3 rounded-lg hover:bg-[#209C8A]/20 transition-colors">
                <Calendar className="w-6 h-6 text-[#209C8A]" />
              </div>
              <div>
                <div className="text-white/70 mb-1 text-sm font-medium">Crecimiento</div>
                <div className={`text-2xl font-bold ${summary.growth >= 0 ? 'text-[#209C8A]' : 'text-red-400'}`}>
                  {summary.growth >= 0 ? '+' : ''}{summary.growth.toFixed(1)}%
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Monthly Trend */}
      {monthlyData.length > 0 && (
        <Card className="bg-white/5 border-[#209C8A]/20 p-6 hover:bg-white/10 transition-all duration-300">
          <h3 className="text-white mb-6 text-xl font-semibold">Tendencia Mensual</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#209C8A20" />
              <XAxis dataKey="month" stroke="#ffffff60" />
              <YAxis stroke="#ffffff60" />
              <Tooltip
                contentStyle={{ backgroundColor: "#020617", border: "1px solid #209C8A40" }}
                labelStyle={{ color: "#ffffff" }}
              />
              <Legend />
              <Line type="monotone" dataKey="ventas" stroke="#209C8A" strokeWidth={2} name="Ventas" />
              <Line type="monotone" dataKey="costos" stroke="#EF4444" strokeWidth={2} name="Costos" />
              <Line type="monotone" dataKey="ganancia" stroke="#10B981" strokeWidth={2} name="Ganancia" />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* Category Performance and Payment Methods */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {categoryPerformance.length > 0 && (
          <Card className="bg-white/5 border-[#209C8A]/20 p-6">
            <h3 className="text-white mb-4">Rendimiento por Categoría</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryPerformance}>
                <CartesianGrid strokeDasharray="3 3" stroke="#209C8A20" />
                <XAxis dataKey="category" stroke="#ffffff60" angle={-15} textAnchor="end" height={80} />
                <YAxis stroke="#ffffff60" />
                <Tooltip
                  contentStyle={{ backgroundColor: "#020617", border: "1px solid #209C8A40" }}
                  labelStyle={{ color: "#ffffff" }}
                />
                <Bar dataKey="ingresos" fill="#209C8A" name="Ingresos (Bs.)" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        )}

        {paymentMethods.length > 0 && (
          <Card className="bg-white/5 border-[#209C8A]/20 p-6">
            <h3 className="text-white mb-4">Métodos de Pago</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={paymentMethods}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {paymentMethods.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: "#020617", border: "1px solid #209C8A40" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        )}
      </div>

      {/* Profit Margins */}
      {profitMargins.length > 0 && (
        <Card className="bg-white/5 border-[#209C8A]/20 p-6">
          <h3 className="text-white mb-4">Márgenes de Ganancia por Plato</h3>
          <div className="space-y-4">
            {profitMargins.map((item, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-white">{item.name}</span>
                  <span className="text-[#209C8A]">{item.margen}%</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-[#209C8A] h-full rounded-full transition-all"
                    style={{ width: `${item.margen}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {monthlyData.length === 0 && categoryPerformance.length === 0 && profitMargins.length === 0 && (
        <Card className="bg-white/5 border-[#209C8A]/20 p-8 text-center">
          <p className="text-white/60">No hay datos disponibles para mostrar en los reportes</p>
        </Card>
      )}
    </div>
  );
}
