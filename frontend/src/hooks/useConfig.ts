
import { useState, useCallback, useEffect } from "react";
import { configuracionApi } from "../services/api";
import { Configuracion } from "../types";
import { toast } from "sonner";

// Default configuration to avoid undefined access before load
const defaultConfig: Configuracion = {
    id: "",
    moneda: "BOB",
    impuesto_porcentaje: 13,
    logo_url: "",
    notif_stock_critico: true,
    notif_reporte_diario: true,
    notif_sugerencias_ia: true,
    notif_margen_bajo: false,
    updated_at: new Date().toISOString()
};

export function useConfig() {
    const [config, setConfig] = useState<Configuracion>(defaultConfig);
    const [loading, setLoading] = useState(true);

    const loadConfig = useCallback(async () => {
        try {
            setLoading(true);
            const data = await configuracionApi.obtener();
            // Ensure we merge with defaults in case of missing fields
            setConfig({ ...defaultConfig, ...data });
        } catch (error) {
            console.error("Error loading config:", error);
            toast.error("Error al cargar la configuración");
        } finally {
            setLoading(false);
        }
    }, []);

    const saveConfig = async (updates: Partial<Configuracion>) => {
        // Optimistic update
        const previousConfig = config;
        setConfig((prev) => ({ ...prev, ...updates }));

        try {
            await configuracionApi.actualizar({ ...config, ...updates });
            // If we wanted to be very strict, we'd reload here, but for config usually it's fine
            // toast.success("Configuración guardada"); // Optional: for write-through usually silent or subtle
        } catch (error) {
            console.error("Error saving config:", error);
            toast.error("Error al guardar cambios");
            // Revert on error
            setConfig(previousConfig);
        }
    };

    useEffect(() => {
        loadConfig();
    }, [loadConfig]);

    return {
        config,
        saveConfig,
        loading,
        refresh: loadConfig
    };
}
