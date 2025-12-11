
import { useState, useCallback, useEffect } from "react";
import { reportesApi } from "../services/api";
import { ReporteMensual, RendimientoCategoria, MargenGanancia, MetodoPagoReporte, ResumenReporte } from "../types";
import { toast } from "sonner";

export type DateRange = '7d' | '30d' | '6m' | '12m';

export function useReports(initialRange: DateRange = '30d') {
    const [loading, setLoading] = useState(true);
    const [dateRange, setDateRange] = useState<DateRange>(initialRange);

    const [reporteMensual, setReporteMensual] = useState<ReporteMensual[]>([]);
    const [rendimientoCategorias, setRendimientoCategorias] = useState<RendimientoCategoria[]>([]);
    const [margenesGanancia, setMargenesGanancia] = useState<MargenGanancia[]>([]);
    const [metodosPago, setMetodosPago] = useState<MetodoPagoReporte[]>([]);
    const [resumen, setResumen] = useState<ResumenReporte | null>(null);

    const loadReports = useCallback(async () => {
        try {
            setLoading(true);

            // Determine numeric days for API calls where applicable
            let days = 30;
            if (dateRange === '7d') days = 7;
            if (dateRange === '6m') days = 180;
            if (dateRange === '12m') days = 365;

            const [mensual, categorias, margenes, pagos, resumenData] = await Promise.all([
                reportesApi.obtenerMensual(dateRange === '12m' ? 12 : 6), // Adjust months based on range
                reportesApi.obtenerRendimientoCategorias(days),
                reportesApi.obtenerMargenesGanancia(),
                reportesApi.obtenerMetodosPagoReporte(days),
                reportesApi.obtenerResumen(days)
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
    }, [dateRange]);

    useEffect(() => {
        loadReports();
    }, [loadReports]);

    const reload = () => loadReports();

    return {
        loading,
        dateRange,
        setDateRange,
        reporteMensual,
        rendimientoCategorias,
        margenesGanancia,
        metodosPago,
        resumen,
        reload
    };
}
