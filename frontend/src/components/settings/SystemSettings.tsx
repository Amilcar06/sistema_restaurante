
import { useState } from "react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { FormInput } from "../ui/FormInput";
import { Lock, Database, HelpCircle } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

export function SystemSettings() {
    const [securityData, setSecurityData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
    });

    const handleSecuritySubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (securityData.newPassword !== securityData.confirmPassword) {
            toast.error("Las contraseñas no coinciden");
            return;
        }
        if (securityData.newPassword.length < 6) {
            toast.error("La contraseña debe tener al menos 6 caracteres");
            return;
        }
        toast.success("Contraseña actualizada correctamente");
        setSecurityData({
            currentPassword: "",
            newPassword: "",
            confirmPassword: ""
        });
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.15 }}
            className="space-y-8"
        >
            <div className="flex items-center justify-between border-b border-[#F26522]/10 pb-4">
                <div>
                    <h2 className="text-[#1B1B1B] text-xl font-bold uppercase tracking-wide mb-1">Configuración del Sistema</h2>
                    <p className="text-[#1B1B1B]/60 text-sm">Seguridad, datos y soporte</p>
                </div>
            </div>

            {/* Seguridad */}
            <Card className="bg-white border-[#F26522]/20 p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-6 border-b border-[#F26522]/10 pb-4">
                    <div className="bg-[#F26522]/10 p-2 rounded-lg">
                        <Lock className="w-6 h-6 text-[#F26522]" />
                    </div>
                    <h3 className="text-[#1B1B1B] text-lg font-bold uppercase tracking-wide">Cambiar Contraseña</h3>
                </div>
                <form onSubmit={handleSecuritySubmit} className="space-y-4">
                    <FormInput
                        type="password"
                        label="Contraseña Actual"
                        placeholder="••••••"
                        value={securityData.currentPassword}
                        onChange={(e) => setSecurityData({ ...securityData, currentPassword: e.target.value })}
                        required
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormInput
                            type="password"
                            label="Nueva Contraseña"
                            placeholder="Mínimo 6 caracteres"
                            value={securityData.newPassword}
                            onChange={(e) => setSecurityData({ ...securityData, newPassword: e.target.value })}
                            required
                            minLength={6}
                        />
                        <FormInput
                            type="password"
                            label="Confirmar Contraseña"
                            placeholder="Repite la contraseña"
                            value={securityData.confirmPassword}
                            onChange={(e) => setSecurityData({ ...securityData, confirmPassword: e.target.value })}
                            required
                        />
                    </div>
                    <div className="pt-2 flex justify-end">
                        <Button
                            type="submit"
                            className="bg-[#F26522] hover:bg-[#F26522]/90 text-white font-bold shadow-md"
                        >
                            Actualizar Contraseña
                        </Button>
                    </div>
                </form>
            </Card>

            {/* Base de Datos y Soporte */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-white border-[#F26522]/20 p-6 shadow-sm flex flex-col h-full">
                    <div className="flex items-center gap-3 mb-4 border-b border-[#F26522]/10 pb-3">
                        <div className="bg-[#F26522]/10 p-2 rounded-lg">
                            <Database className="w-6 h-6 text-[#F26522]" />
                        </div>
                        <h3 className="text-[#1B1B1B] text-lg font-bold uppercase tracking-wide">Base de Datos</h3>
                    </div>
                    <p className="text-[#1B1B1B]/60 mb-6 text-sm flex-grow">
                        Herramientas de mantenimiento para tu base de datos.
                    </p>
                    <div className="space-y-3 mt-auto">
                        <Button
                            variant="outline"
                            className="w-full border-[#1B1B1B]/10 text-[#1B1B1B] hover:bg-[#F26522]/5 hover:text-[#F26522] hover:border-[#F26522]/30"
                            onClick={() => toast.info("Función de exportación próximamente")}
                        >
                            Exportar Datos
                        </Button>
                        <Button
                            variant="outline"
                            className="w-full border-[#EA5455]/30 text-[#EA5455] hover:bg-[#EA5455]/10"
                            onClick={() => {
                                if (confirm("¿Resetear BBDD? Esta acción es irreversible.")) {
                                    toast.error("Bloqueado por seguridad");
                                }
                            }}
                        >
                            Resetear Fábrica
                        </Button>
                    </div>
                </Card>

                <Card className="bg-white border-[#F26522]/20 p-6 shadow-sm flex flex-col h-full">
                    <div className="flex items-center gap-3 mb-4 border-b border-[#F26522]/10 pb-3">
                        <div className="bg-[#F26522]/10 p-2 rounded-lg">
                            <HelpCircle className="w-6 h-6 text-[#F26522]" />
                        </div>
                        <h3 className="text-[#1B1B1B] text-lg font-bold uppercase tracking-wide">Centro de Ayuda</h3>
                    </div>
                    <p className="text-[#1B1B1B]/60 mb-6 text-sm flex-grow">
                        Recursos y soporte técnico.
                    </p>
                    <div className="space-y-3 mt-auto">
                        <Button
                            variant="outline"
                            className="w-full border-[#1B1B1B]/10 text-[#1B1B1B] hover:bg-[#F26522]/5 hover:text-[#F26522] hover:border-[#F26522]/30"
                            onClick={() => window.open("https://gastrosmart.ai/docs", "_blank")}
                        >
                            Documentación
                        </Button>
                        <Button
                            variant="outline"
                            className="w-full border-[#1B1B1B]/10 text-[#1B1B1B] hover:bg-[#F26522]/5 hover:text-[#F26522] hover:border-[#F26522]/30"
                            onClick={() => toast.info("soporte@gastrosmart.ai")}
                        >
                            Contactar Soporte
                        </Button>
                    </div>
                </Card>
            </div>

            <div className="text-center pt-8 pb-4">
                <div className="text-[#1B1B1B] font-bold mb-1 uppercase tracking-wide text-sm opacity-80">GastroSmart AI v1.0.0</div>
                <div className="text-[#1B1B1B]/40 text-xs font-medium">
                    Desarrollado con ❤️ por UMSA - Carrera de Informática
                </div>
            </div>
        </motion.div>
    );
}
