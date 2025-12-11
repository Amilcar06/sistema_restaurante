
import { useState } from "react";
import { Card } from "../ui/card";

import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { FormInput } from "../ui/FormInput"; // Reusing the one we made
import { useConfig } from "../../hooks/useConfig";
import { Upload } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

export function GeneralSettings() {
    const { config, saveConfig } = useConfig();
    const [logoUrlInput, setLogoUrlInput] = useState(config.logo_url || "");

    const handleBlur = () => {
        // Validate active URL on blur
        if (logoUrlInput && !logoUrlInput.startsWith('http')) {
            toast.warning("La URL del logo debería comenzar con http:// o https://");
        }
        saveConfig({ logo_url: logoUrlInput });
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // This would ideally upload to a server/storage
            // For now, let's simulate a local object URL for preview
            const objectUrl = URL.createObjectURL(file);
            setLogoUrlInput(objectUrl);
            saveConfig({ logo_url: objectUrl });
            toast.success("Logo cargado localmente (simulación)");
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
        >
            <div className="flex items-center justify-between border-b border-[#F26522]/10 pb-4">
                <div>
                    <h2 className="text-[#1B1B1B] text-xl font-bold uppercase tracking-wide mb-1">Configuración General</h2>
                    <p className="text-[#1B1B1B]/60 text-sm">Ajustes básicos del sistema</p>
                </div>
            </div>
            <Card className="bg-white border-[#F26522]/20 p-6 shadow-sm">
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <Label htmlFor="currency" className="text-[#1B1B1B] font-medium mb-1.5 block">
                                Moneda del Sistema
                            </Label>
                            <Select
                                value={config.moneda}
                                onValueChange={(value: string) => saveConfig({ moneda: value })}
                            >
                                <SelectTrigger className="bg-white border-[#F26522]/20 text-[#1B1B1B]">
                                    <SelectValue placeholder="Selecciona moneda" />
                                </SelectTrigger>
                                <SelectContent className="bg-white border-[#F26522]/20 z-[9999]">
                                    <SelectItem value="BOB">Boliviano (BOB)</SelectItem>
                                    <SelectItem value="USD">Dólar (USD)</SelectItem>
                                    <SelectItem value="EUR">Euro (EUR)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="taxRate" className="text-[#1B1B1B] font-medium mb-1.5 block">
                                Impuesto (%)
                            </Label>
                            <Input
                                id="taxRate"
                                type="number"
                                min="0"
                                max="100"
                                className="bg-white border-[#F26522]/20 text-[#1B1B1B] focus:border-[#F26522] focus:ring-[#F26522]/20 tabular-nums"
                                value={config.impuesto_porcentaje}
                                onChange={(e) => {
                                    const val = parseFloat(e.target.value);
                                    if (val < 0 || val > 100) return; // Basic validation barrier
                                    saveConfig({ impuesto_porcentaje: val });
                                }}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                        <div className="space-y-2">
                            <FormInput
                                label="URL del Logo"
                                placeholder="https://ejemplo.com/logo.png"
                                value={logoUrlInput}
                                onChange={(e) => setLogoUrlInput(e.target.value)}
                                onBlur={handleBlur}
                            />
                            <div className="text-xs text-[#1B1B1B]/40">
                                Pega una URL directa a la imagen de tu logo.
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-[#1B1B1B] font-medium mb-1.5 block">Subir Logo (Archivo)</Label>
                            <div className="flex items-center gap-2">
                                <Input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    id="logo-upload"
                                    onChange={handleFileUpload}
                                />
                                <Label
                                    htmlFor="logo-upload"
                                    className="flex items-center justify-center w-full px-4 py-2 border border-dashed border-[#F26522]/40 rounded-md cursor-pointer hover:bg-[#F26522]/5 transition-colors text-[#F26522] text-sm font-medium h-10"
                                >
                                    <Upload className="w-4 h-4 mr-2" />
                                    Seleccionar imagen
                                </Label>
                            </div>
                            <div className="text-xs text-[#1B1B1B]/40">
                                Formatos: PNG, JPG (Max 2MB)
                            </div>
                        </div>
                    </div>

                    {config.logo_url && (
                        <div className="mt-4 p-4 border border-[#F26522]/10 rounded-lg bg-[#F26522]/5 flex flex-col items-center">
                            <p className="text-xs text-[#1B1B1B]/60 mb-2 font-medium uppercase tracking-wide">Vista Previa</p>
                            <img src={config.logo_url} alt="Logo Preview" className="h-16 object-contain" onError={() => toast.error("Error al cargar la imagen del logo")} />
                        </div>
                    )}
                </div>
            </Card>
        </motion.div>
    );
}
