/**
 * Definiciones de Tipos en Español para GastroSmart AI
 * Sincronizado con el backend refactorizado
 */

export interface Usuario {
    id: string;
    email: string;
    nombre_usuario: string;
    nombre_completo?: string;
    telefono?: string;
    activo: boolean;
    es_superusuario: boolean;
    sucursal_default_id?: string;
    created_at: string;
    updated_at: string;
    ultimo_acceso?: string;
    rol_id?: string;
    permisos?: string[];
}

export interface Permiso {
    id: string;
    nombre: string;
    recurso: string;
    accion: string;
    descripcion?: string;
}

export interface Rol {
    id: string;
    nombre: string;
    descripcion?: string;
    es_sistema: boolean;
    fecha_creacion: string;
    permisos?: Permiso[];
}

export interface Sucursal {
    id: string;
    nombre: string;
    direccion: string;
    ciudad: string;
    zona?: string;
    telefono?: string;
    email?: string;
    es_principal: boolean;
    activa: boolean;
    horarios_atencion?: Record<string, any>;
    restaurante_id?: string;
    created_at: string;
}

export interface Restaurante {
    id: string;
    nombre: string;
    razon_social?: string;
    nit?: string;
    direccion?: string;
    telefono?: string;
    email?: string;
    website?: string;
    logo_url?: string;
    moneda: string;
    propietario_id?: string;
    created_at: string;
}

export interface Proveedor {
    id: string;
    nombre: string;
    nombre_contacto?: string;
    telefono?: string;
    email?: string;
    direccion?: string;
    ciudad?: string;
    zona?: string;
    nit?: string;
    terminos_pago?: string;
    calificacion?: number;
    activo: boolean;
    notas?: string;
    created_at: string;
    updated_at: string;
    usuario_id?: string;
}

export interface Unidad {
    id: string;
    codigo: string;
    nombre: string;
    tipo: string;
    unidad_base_id?: string;
    factor_conversion: number;
    activa: boolean;
}

export interface ItemInventario {
    id: string;
    nombre: string;
    categoria: string;
    cantidad: number;
    unidad: string;
    unidad_id?: string;
    stock_minimo: number;
    stock_maximo?: number;
    costo_unitario: number;
    proveedor_id?: string;
    sucursal_id: string;
    fecha_vencimiento?: string;
    codigo_barras?: string;
    puntaje_popularidad: number;
    factor_estacional?: Record<string, number>;
    pronostico_demanda?: number;
    ultima_actualizacion: string;
    usuario_id?: string;
}

export interface IngredienteReceta {
    id: string;
    receta_id: string;
    item_inventario_id?: string;
    nombre_ingrediente: string;
    cantidad: number;
    unidad: string;
    unidad_id?: string;
    costo: number;
}

export interface Receta {
    id: string;
    nombre: string;
    descripcion?: string;
    categoria: string;
    subcategoria?: string;
    precio: number;
    costo: number;
    margen: number;
    tiempo_preparacion?: number;
    porciones: number;
    instrucciones?: string;
    sucursal_id?: string;
    disponible: boolean;
    puntaje_popularidad: number;
    version_actual: number;
    created_at: string;
    updated_at: string;
    usuario_id?: string;
    ingredientes: IngredienteReceta[];
}

export interface RecipeCreate {
    nombre: string;
    descripcion?: string;
    categoria: string;
    subcategoria?: string;
    precio: number;
    costo: number;
    margen: number;
    tiempo_preparacion?: number;
    porciones: number;
    instrucciones?: string;
    sucursal_id?: string;
    disponible: boolean;
    ingredientes: IngredienteReceta[];
}

export interface RecipeUpdate extends Partial<RecipeCreate> { }

export interface ItemVenta {
    id: string;
    venta_id: string;
    receta_id?: string;
    nombre_item: string;
    cantidad: number;
    precio_unitario: number;
    total: number;
}

export interface Venta {
    id: string;
    numero_venta?: string;
    sucursal_id: string;
    numero_mesa?: string;
    mesero_id?: string;
    tipo_venta: string; // LOCAL, DELIVERY, TAKEAWAY
    servicio_delivery?: string;
    nombre_cliente?: string;
    telefono_cliente?: string;
    subtotal: number;
    monto_descuento: number;
    impuesto: number;
    total: number;
    metodo_pago?: string;
    notas?: string;
    estado: string; // COMPLETADA, CANCELADA, REEMBOLSADA
    fecha_creacion: string;
    usuario_id?: string;
    items: ItemVenta[];
}

export interface Promocion {
    id: string;
    nombre: string;
    descripcion?: string;
    tipo_descuento: string; // porcentaje, monto_fijo, 2x1
    valor_descuento: number;
    compra_minima?: number;
    descuento_maximo?: number;
    fecha_inicio: string;
    fecha_fin: string;
    activa: boolean;
    aplicable_a?: string; // todo, recetas, categorias, items_especificos
    ids_aplicables?: string[];
    sucursal_id?: string;
    created_at: string;
    usuario_id?: string;
}

export interface MovimientoInventario {
    id: string;
    item_inventario_id: string;
    sucursal_id: string;
    tipo_movimiento: string; // ENTRADA, SALIDA, AJUSTE, MERMA, CADUCIDAD, ROBO, TRANSFERENCIA
    cantidad: number;
    unidad: string;
    costo_unitario?: number;
    referencia_id?: string;
    tipo_referencia?: string;
    notas?: string;
    fecha_creacion: string;
    usuario_id?: string;
}

export interface ItemOrdenCompra {
    id: string;
    orden_compra_id: string;
    item_inventario_id?: string;
    nombre_item: string;
    cantidad: number;
    unidad: string;
    precio_unitario: number;
    total: number;
    cantidad_recibida?: number;
}

export interface OrdenCompra {
    id: string;
    numero_orden: string;
    proveedor_id: string;
    sucursal_id: string;
    estado: string; // PENDIENTE, APROBADA, RECIBIDA, CANCELADA
    monto_total: number;
    fecha_entrega_esperada?: string;
    fecha_recepcion?: string;
    notas?: string;
    fecha_creacion: string;
    creado_por_id?: string;
    aprobado_por_id?: string;
    items: ItemOrdenCompra[];
}

// Tipos auxiliares para reportes y dashboard (adaptados a español)
export * from './caja';

export interface ResumenReporte {
    ventas_totales: number;
    costo_total: number;
    ganancia_neta: number;
    margen_promedio: number;
    crecimiento: number;
    dias_periodo: number;
}

export interface EstadisticasDashboard {
    ventas_totales_hoy: number;
    items_criticos_count: number;
    platos_vendidos_hoy: number;
    margen_promedio: number;
    cambio_ventas_porcentaje: number;
    cambio_platos_porcentaje: number;
    cambio_margen_porcentaje: number;
}

export interface PlatoTop {
    nombre: string;
    cantidad_vendida: number;
    ingresos: number;
}

export interface AlertaDashboard {
    tipo: string;
    mensaje: string;
}

export interface VentaPorDia {
    dia: string;
    ventas: number;
}

export interface DistribucionCategoria {
    nombre: string;
    valor: number;
}

export interface DashboardResponse {
    estadisticas: EstadisticasDashboard;
    platos_top: PlatoTop[];
    alertas: AlertaDashboard[];
    ventas_por_dia: VentaPorDia[];
    distribucion_categorias: DistribucionCategoria[];
}

export interface ReporteMensual {
    mes: string;
    ventas: number;
    costos: number;
    ganancia: number;
}

export interface RendimientoCategoria {
    categoria: string;
    ingresos: number;
    cantidad_vendida: number;
}

export interface MargenGanancia {
    nombre: string;
    precio_venta: number;
    costo: number;
    margen: number;
}

export interface MetodoPagoReporte {
    metodo: string;
    cantidad: number;
    total: number;
    porcentaje: number;
}

export interface MensajeChat {
    message: string;
    conversation_id?: string;
}

export interface RespuestaChat {
    response: string;
    conversation_id: string;
    timestamp: string;
}

export interface Configuracion {
    id: string;
    moneda: string;
    impuesto_porcentaje: number;
    logo_url?: string;
    nombre_empresa?: string;
    direccion?: string;
    telefono?: string;
    email_contacto?: string;
    notif_stock_critico: boolean;
    notif_reporte_diario: boolean;
    notif_sugerencias_ia: boolean;
    notif_margen_bajo: boolean;
    updated_at: string;
}
