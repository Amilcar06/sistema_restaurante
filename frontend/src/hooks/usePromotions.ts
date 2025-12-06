
import { useState, useEffect, useCallback } from "react";
import { Promocion, Sucursal } from "../types";
import { promocionesApi, sucursalesApi } from "../services/api";
import { toast } from "sonner";

export function usePromotions() {
    const [promociones, setPromociones] = useState<Promocion[]>([]);
    const [sucursales, setSucursales] = useState<Sucursal[]>([]);
    const [loading, setLoading] = useState(true);

    const loadPromociones = useCallback(async () => {
        try {
            const data = await promocionesApi.obtenerTodos();
            // Optional: Sort by active status or date if needed
            setPromociones(data);
        } catch (error) {
            console.error("Error loading promotions:", error);
            toast.error("Error al cargar las promociones");
        } finally {
            setLoading(false);
        }
    }, []);

    const loadSucursales = useCallback(async () => {
        try {
            const data = await sucursalesApi.obtenerTodos();
            setSucursales(data);
        } catch (error) {
            console.error("Error loading locations:", error);
        }
    }, []);

    const createPromotion = async (data: Partial<Promocion>) => {
        try {
            await promocionesApi.crear(data);
            toast.success("Promoción creada correctamente");
            await loadPromociones();
        } catch (error: any) {
            console.error("Error creating promotion:", error);
            toast.error(error.message || "Error al crear la promoción");
            throw error;
        }
    };

    const updatePromotion = async (id: string, data: Partial<Promocion>) => {
        try {
            await promocionesApi.actualizar(id, data);
            toast.success("Promoción actualizada correctamente");
            await loadPromociones();
        } catch (error: any) {
            console.error("Error updating promotion:", error);
            toast.error(error.message || "Error al actualizar la promoción");
            throw error;
        }
    };

    const deletePromotion = async (id: string) => {
        try {
            await promocionesApi.eliminar(id);
            toast.success("Promoción eliminada correctamente");
            setPromociones((prev) => prev.filter((p) => p.id !== id));
        } catch (error: any) {
            console.error("Error deleting promotion:", error);
            toast.error("Error al eliminar la promoción");
            throw error;
        }
    };

    useEffect(() => {
        loadPromociones();
        loadSucursales();
    }, [loadPromociones, loadSucursales]);

    return {
        promociones,
        sucursales,
        loading,
        createPromotion,
        updatePromotion,
        deletePromotion,
        refresh: loadPromociones
    };
}
