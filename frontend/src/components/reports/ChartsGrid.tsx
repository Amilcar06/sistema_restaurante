
import { Card } from "../ui/card";
import { RendimientoCategoria, MetodoPagoReporte, MargenGanancia } from "../../types";
import { ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, CartesianGrid, XAxis, YAxis, Tooltip } from "recharts";
import { motion } from "framer-motion";

const COLORS = ["#F26522", "#1B1B1B", "#28C76F", "#FF9F43", "#EA5455", "#7367F0", "#00CFE8"];

export function ChartsGrid({
    categorias,
    metodos,
    margenes
}: {
    categorias: RendimientoCategoria[],
    metodos: MetodoPagoReporte[],
    margenes: MargenGanancia[]
}) {

    const cardVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Categories */}
            {categorias.length > 0 && (
                <motion.div variants={cardVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}>
                    <Card className="bg-white border-[#F26522]/20 p-6 hover:bg-white hover:shadow-lg transition-all duration-300 shadow-sm h-full">
                        <h3 className="text-[#1B1B1B] mb-6 text-xl font-bold uppercase tracking-wide">Rendimiento por Categoría</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={categorias}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#F26522" opacity={0.1} />
                                <XAxis dataKey="categoria" stroke="#1B1B1B" opacity={0.6} angle={-15} textAnchor="end" height={60} tick={{ fill: '#1B1B1B', fontSize: 11 }} />
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
                </motion.div>
            )}

            {/* Payment Methods */}
            {metodos.length > 0 && (
                <motion.div variants={cardVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}>
                    <Card className="bg-white border-[#F26522]/20 p-6 hover:bg-white hover:shadow-lg transition-all duration-300 shadow-sm h-full">
                        <h3 className="text-[#1B1B1B] mb-6 text-xl font-bold uppercase tracking-wide">Métodos de Pago</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={metodos}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ metodo, porcentaje }) => `${metodo} ${porcentaje.toFixed(0)}%`}
                                    outerRadius={100}
                                    fill="#8884d8"
                                    dataKey="total"
                                    nameKey="metodo"
                                >
                                    {metodos.map((_entry, index) => (
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
                </motion.div>
            )}

            {/* Margins - Full width if needed or in grid */}
            {margenes.length > 0 && (
                <motion.div variants={cardVariants} initial="hidden" whileInView="visible" viewport={{ once: true }} className="lg:col-span-2">
                    <Card className="bg-white border-[#F26522]/20 p-6 hover:bg-white hover:shadow-lg transition-all duration-300 shadow-sm">
                        <h3 className="text-[#1B1B1B] mb-6 text-xl font-bold uppercase tracking-wide">Márgenes de Ganancia Top 5</h3>
                        <div className="space-y-5">
                            {margenes.slice(0, 5).map((item, index) => (
                                <div key={index} className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[#1B1B1B] font-medium text-sm">{item.nombre}</span>
                                        <span className="text-[#F26522] font-bold tabular-nums text-sm">{item.margen.toFixed(1)}%</span>
                                    </div>
                                    <div className="w-full bg-[#1B1B1B]/5 rounded-full h-3 overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            whileInView={{ width: `${item.margen}%` }}
                                            transition={{ duration: 1, delay: 0.2 }}
                                            className="bg-gradient-to-r from-[#F26522] to-[#FF9F43] h-full rounded-full"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                </motion.div>
            )}
        </div>
    );
}
