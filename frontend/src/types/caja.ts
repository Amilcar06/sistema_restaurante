export interface CajaSesion {
    id: string;
    sucursal_id: string;
    usuario_id: string;
    fecha_apertura: string;
    fecha_cierre?: string;
    monto_inicial: number;
    monto_final?: number;
    monto_sistema?: number;
    diferencia?: number;
    estado: "ABIERTA" | "CERRADA";
    comentarios?: string;
}

export interface CajaSesionCreate {
    sucursal_id: string;
    usuario_id: string; // Se pasará el usuario actual
    monto_inicial: number;
    comentarios?: string;
}

export interface CajaSesionCerrar {
    monto_final: number; // Monto que declara el usuario
    comentarios?: string;
}
