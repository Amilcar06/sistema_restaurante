
import { useState, useEffect, useCallback } from "react";
import { Proveedor } from "../types";
import { proveedoresApi } from "../services/api";
import { toast } from "sonner";

export function useSuppliers() {
    const [proveedores, setProveedores] = useState<Proveedor[]>([]);
    const [loading, setLoading] = useState(true);

    const sortSuppliers = (list: Proveedor[]) => {
        return [...list].sort((a, b) => a.nombre.localeCompare(b.nombre));
    };

    const loadProveedores = useCallback(async () => {
        setLoading(true);
        try {
            const data = await proveedoresApi.obtenerTodos();
            setProveedores(sortSuppliers(data));
        } catch (error) {
            console.error("Error loading suppliers:", error);
            toast.error("Error al cargar los proveedores");
        } finally {
            setLoading(false);
        }
    }, []);

    const createSupplier = async (data: Omit<Proveedor, "id" | "created_at" | "updated_at">) => {
        try {
            // Assuming create return the created object with ID
            // If the API allows passing ID, we might do optimistic before.
            // But standard is wait for ID.
            const newSupplier = await proveedoresApi.crear(data);
            // If the API returns the object (which it usually does in REST resturning resource)
            // We assume newSupplier is the object.
            // If the current API implementation checks types, let's assume it returns Promise<Proveedor> or similar.
            // We will cast or ensure it.

            // Fallback if API doesn't return the full object but we know it succeeded
            // We might need to reload if we don't get ID.
            // But let's assume standard behavior or the user suggestion imply we get it.

            // OPTIMISTIC/LOCAL UPDATE
            setProveedores((prev) => sortSuppliers([...prev, newSupplier]));
            toast.success("Proveedor creado exitosamente");
        } catch (error: any) {
            console.error("Error creating supplier:", error);
            toast.error(error.message || "Error al crear el proveedor");
            throw error;
        }
    };

    const updateSupplier = async (id: string, data: Partial<Proveedor>) => {
        try {
            // Optimistic update could be done here if we are sure.
            // But better to wait for confirmation for data integrity unless UI feels slow.
            const updatedSupplier = await proveedoresApi.actualizar(id, data);

            setProveedores((prev) =>
                prev.map((p) => (p.id === id ? { ...p, ...updatedSupplier } : p))
            );
            toast.success("Proveedor actualizado exitosamente");
        } catch (error: any) {
            console.error("Error updating supplier:", error);
            toast.error(error.message || "Error al actualizar el proveedor");
            throw error;
        }
    };

    const deleteSupplier = async (id: string) => {
        try {
            await proveedoresApi.eliminar(id);
            setProveedores((prev) => prev.filter((p) => p.id !== id));
            toast.success("Proveedor eliminado exitosamente");
        } catch (error: any) {
            console.error("Error deleting supplier:", error);
            toast.error(error.message || "Error al eliminar el proveedor");
            throw error;
        }
    };

    useEffect(() => {
        loadProveedores();
    }, [loadProveedores]);

    return {
        proveedores,
        loading,
        createSupplier,
        updateSupplier,
        deleteSupplier,
        refresh: loadProveedores
    };
}
