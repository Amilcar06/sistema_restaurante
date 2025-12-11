
import { Card } from "../ui/card";
import { TrendingUp, Calendar, DollarSign, Award } from "lucide-react";
import { ResumenReporte } from "../../types";
import { motion } from "framer-motion";

export function SummaryCards({ resumen }: { resumen: ResumenReporte | null }) {
    if (!resumen) return null;

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
            <motion.div variants={item}>
                <Card className="p-6 bg-white border-[#F26522]/20 hover:bg-white hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 shadow-sm h-full">
                    <div className="flex items-center justify-between mb-4">
                        <div className="bg-[#F26522]/10 p-2 rounded-lg">
                            <DollarSign className="w-6 h-6 text-[#F26522]" />
                        </div>
                        <span className="text-xs font-bold text-[#F26522] bg-[#F26522]/10 px-2 py-1 rounded-full border border-[#F26522]/20">
                            +12% vs mes anterior
                        </span>
                    </div>
                    <div className="text-[#1B1B1B]/60 text-sm font-bold uppercase tracking-wide mb-1">Ventas Totales</div>
                    <div className="text-[#1B1B1B] text-3xl font-bold tabular-nums tracking-tight">Bs. {resumen.ventas_totales.toFixed(2)}</div>
                </Card>
            </motion.div>

            <motion.div variants={item}>
                <Card className="p-6 bg-white border-[#F26522]/20 hover:bg-white hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 shadow-sm h-full">
                    <div className="flex items-center justify-between mb-4">
                        <div className="bg-[#28C76F]/10 p-2 rounded-lg">
                            <TrendingUp className="w-6 h-6 text-[#28C76F]" />
                        </div>
                        <span className="text-xs font-bold text-[#28C76F] bg-[#28C76F]/10 px-2 py-1 rounded-full border border-[#28C76F]/20">Rentable</span>
                    </div>
                    <div className="text-[#1B1B1B]/60 text-sm font-bold uppercase tracking-wide mb-1">Ganancia Neta</div>
                    <div className="text-[#1B1B1B] text-3xl font-bold tabular-nums tracking-tight">Bs. {resumen.ganancia_neta.toFixed(2)}</div>
                </Card>
            </motion.div>

            <motion.div variants={item}>
                <Card className="p-6 bg-white border-[#F26522]/20 hover:bg-white hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 shadow-sm h-full">
                    <div className="flex items-center justify-between mb-4">
                        <div className="bg-[#7367F0]/10 p-2 rounded-lg">
                            <Calendar className="w-6 h-6 text-[#7367F0]" />
                        </div>
                    </div>
                    <div className="text-[#1B1B1B]/60 text-sm font-bold uppercase tracking-wide mb-1">Margen Promedio</div>
                    <div className="text-[#1B1B1B] text-3xl font-bold tabular-nums tracking-tight">{resumen.margen_promedio.toFixed(1)}%</div>
                </Card>
            </motion.div>

            <motion.div variants={item}>
                <Card className="p-6 bg-[#F4F5F7] border-[#1B1B1B]/10 hover:bg-[#1B1B1B]/5 transition-all duration-300 transform hover:-translate-y-1 shadow-sm h-full">
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
            </motion.div>
        </motion.div>
    );
}
