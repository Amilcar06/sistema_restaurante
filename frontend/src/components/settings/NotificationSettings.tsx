
import { Card } from "../ui/card";
import { Switch } from "../ui/switch";
import { useConfig } from "../../hooks/useConfig";
import { motion } from "framer-motion";

export function NotificationSettings() {
    const { config, saveConfig } = useConfig();

    const NotificationItem = ({
        title,
        description,
        checked,
        colorClass = "data-[state=checked]:bg-[#28C76F]",
        field
    }: {
        title: string,
        description: string,
        checked: boolean,
        colorClass?: string,
        field: keyof typeof config
    }) => (
        <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-[#F26522]/10 hover:border-[#F26522]/30 transition-all hover:shadow-sm">
            <div className="flex-1">
                <div className="text-[#1B1B1B] font-bold mb-1">{title}</div>
                <div className="text-[#1B1B1B]/60 text-sm">
                    {description}
                </div>
            </div>
            <Switch
                className={colorClass}
                checked={checked}
                onCheckedChange={(checked: boolean) => saveConfig({ [field]: checked })}
            />
        </div>
    );

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="space-y-6"
        >
            <div className="flex items-center justify-between border-b border-[#F26522]/10 pb-4">
                <div>
                    <h2 className="text-[#1B1B1B] text-xl font-bold uppercase tracking-wide mb-1">Configuración de Notificaciones</h2>
                    <p className="text-[#1B1B1B]/60 text-sm">Elige qué alertas recibir al instante</p>
                </div>
            </div>
            <Card className="bg-white border-[#F26522]/20 p-6 shadow-sm">
                <div className="space-y-4">
                    <NotificationItem
                        title="Alertas de Stock Crítico"
                        description="Recibir notificaciones cuando un insumo esté bajo el nivel mínimo"
                        checked={config.notif_stock_critico}
                        field="notif_stock_critico"
                    />
                    <NotificationItem
                        title="Reporte Diario"
                        description="Resumen de ventas automático al final del día"
                        checked={config.notif_reporte_diario}
                        colorClass="data-[state=checked]:bg-[#F26522]"
                        field="notif_reporte_diario"
                    />
                    <NotificationItem
                        title="Sugerencias de IA"
                        description="Recomendaciones inteligentes para mejorar rentabilidad y procesos"
                        checked={config.notif_sugerencias_ia}
                        colorClass="data-[state=checked]:bg-[#7367F0]"
                        field="notif_sugerencias_ia"
                    />
                    <NotificationItem
                        title="Alertas de Márgenes Bajos"
                        description="Notificar cuando un plato tenga margen inferior al 50%"
                        checked={config.notif_margen_bajo}
                        colorClass="data-[state=checked]:bg-[#EA5455]"
                        field="notif_margen_bajo"
                    />
                </div>
            </Card>
        </motion.div>
    );
}
