
import { Card } from "../ui/card";
import { ReporteMensual } from "../../types";
import { ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from "recharts";
import { TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

export function MonthlyTrendChart({ data }: { data: ReporteMensual[] }) {
    if (data.length === 0) return null;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-8"
        >
            <Card className="bg-white border-[#F26522]/20 p-6 hover:bg-white hover:shadow-lg transition-all duration-300 shadow-sm">
                <div className="flex items-center gap-2 mb-6">
                    <h3 className="text-[#1B1B1B] text-xl font-bold uppercase tracking-wide">Tendencia de Ventas</h3>
                    <TrendingUp className="w-5 h-5 text-[#28C76F]" />
                </div>
                <ResponsiveContainer width="100%" height={350}>
                    <LineChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#F26522" opacity={0.1} />
                        <XAxis dataKey="mes" stroke="#1B1B1B" opacity={0.6} tick={{ fill: '#1B1B1B', fontSize: 12 }} />
                        <YAxis stroke="#1B1B1B" opacity={0.6} tick={{ fill: '#1B1B1B', fontSize: 12 }} />
                        <Tooltip
                            contentStyle={{ backgroundColor: "#FFFFFF", borderColor: "rgba(242, 101, 34, 0.2)", borderRadius: "8px", color: "#1B1B1B" }}
                            labelStyle={{ color: "#1B1B1B", fontWeight: "bold" }}
                        />
                        <Legend wrapperStyle={{ paddingTop: "20px" }} />
                        <Line type="monotone" dataKey="ventas" stroke="#F26522" strokeWidth={3} name="Ventas" activeDot={{ r: 6 }} />
                        <Line type="monotone" dataKey="costos" stroke="#EA5455" strokeWidth={2} name="Costos" />
                        <Line type="monotone" dataKey="ganancia" stroke="#28C76F" strokeWidth={3} name="Ganancia" />
                    </LineChart>
                </ResponsiveContainer>
            </Card>
        </motion.div>
    );
}
