
import { useReports } from "../hooks/useReports";
import { ReportsHeader } from "./reports/ReportsHeader";
import { SummaryCards } from "./reports/SummaryCards";
import { MonthlyTrendChart } from "./reports/MonthlyTrendChart";
import { ChartsGrid } from "./reports/ChartsGrid";
import { Card } from "./ui/card";
import { Loader2, RefreshCw } from "lucide-react";
import { Button } from "./ui/button";

export function Reports() {
  const {
    loading,
    dateRange,
    setDateRange,
    reporteMensual,
    rendimientoCategorias,
    margenesGanancia,
    metodosPago,
    resumen,
    reload
  } = useReports();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-[#F26522]" />
        <p className="text-[#1B1B1B]/60 font-medium animate-pulse">Analizando datos...</p>
      </div>
    );
  }

  const hasData = resumen || reporteMensual.length > 0;

  return (
    <div className="space-y-8 w-full relative max-w-7xl mx-auto pb-8">
      <ReportsHeader dateRange={dateRange} setDateRange={setDateRange} />

      {!hasData ? (
        <Card className="bg-white border-[#F26522]/20 p-16 text-center shadow-sm flex flex-col items-center justify-center gap-4">
          <div className="bg-[#F26522]/10 p-4 rounded-full">
            <RefreshCw className="w-8 h-8 text-[#F26522]" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-[#1B1B1B] mb-2">Sin datos disponibles</h3>
            <p className="text-[#1B1B1B]/60 text-base max-w-md mx-auto">
              No hemos encontrado registros para el periodo seleccionado ({dateRange}). Intenta cambiar el filtro o recargar.
            </p>
          </div>
          <Button onClick={reload} variant="outline" className="mt-2 border-[#F26522]/30 text-[#F26522] hover:bg-[#F26522]/10">
            Recargar Datos
          </Button>
        </Card>
      ) : (
        <>
          <SummaryCards resumen={resumen} />
          <MonthlyTrendChart data={reporteMensual} />
          <ChartsGrid
            categorias={rendimientoCategorias}
            metodos={metodosPago}
            margenes={margenesGanancia}
          />
        </>
      )}
    </div>
  );
}
