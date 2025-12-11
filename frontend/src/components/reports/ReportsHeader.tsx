
import { Download, Calendar } from "lucide-react";
import { Button } from "../ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { DateRange } from "../../hooks/useReports";
import { reportesApi } from "../../services/api";
import { toast } from "sonner";
import { useState } from "react";
import { motion } from "framer-motion";

interface ReportsHeaderProps {
    dateRange: DateRange;
    setDateRange: (range: DateRange) => void;
}

export function ReportsHeader({ dateRange, setDateRange }: ReportsHeaderProps) {
    const [exporting, setExporting] = useState(false);

    const handleExport = async (format: 'json' | 'csv') => {
        try {
            setExporting(true);
            await reportesApi.exportarReporte(format, 30); // Using default 30 for now or pass actual days
            toast.success(`Reporte exportado como ${format.toUpperCase()}`);
        } catch (error) {
            console.error("Error exporting report:", error);
            toast.error("Error al exportar el reporte");
        } finally {
            setExporting(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8"
        >
            <div>
                <div className="flex items-center gap-2 text-xs font-medium text-[#1B1B1B]/40 mb-2 uppercase tracking-wide">
                    <span>Inicio</span>
                    <span>/</span>
                    <span className="text-[#F26522]">Reportes</span>
                </div>
                <h1 className="text-[#1B1B1B] mb-2 text-3xl font-bold uppercase tracking-tight">Reportes y Análisis</h1>
                <p className="text-[#1B1B1B]/60 text-base font-medium">Visualiza el rendimiento clave de tu negocio</p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
                <Select value={dateRange} onValueChange={(val: string) => setDateRange(val as DateRange)}>
                    <SelectTrigger className="w-[200px] bg-white border-[#F26522]/20 text-[#1B1B1B]">
                        <Calendar className="w-4 h-4 mr-2 text-[#F26522]" />
                        <SelectValue placeholder="Periodo" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="7d">Últimos 7 días</SelectItem>
                        <SelectItem value="30d">Últimos 30 días</SelectItem>
                        <SelectItem value="6m">Últimos 6 meses</SelectItem>
                        <SelectItem value="12m">Último año</SelectItem>
                    </SelectContent>
                </Select>

                <div className="flex gap-2">
                    <Button
                        className="bg-[#F26522] hover:bg-[#F26522]/90 text-white font-bold shadow-md"
                        onClick={() => handleExport('csv')}
                        disabled={exporting}
                    >
                        <Download className="w-4 h-4 mr-2" />
                        CSV
                    </Button>
                    <Button
                        variant="outline"
                        className="border-[#1B1B1B]/20 text-[#1B1B1B] hover:bg-[#1B1B1B]/5 font-medium"
                        onClick={() => handleExport('json')}
                        disabled={exporting}
                    >
                        JSON
                    </Button>
                </div>
            </div>
        </motion.div>
    );
}
