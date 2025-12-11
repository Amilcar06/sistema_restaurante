import { useState, useEffect } from "react";
import { Plus, Search, AlertTriangle, CheckCircle2, Package, Loader2, Edit, Trash2, History } from "lucide-react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "./ui/pagination";
import {
    inventarioApi,
    enumsApi,
    sucursalesApi,
    proveedoresApi,
    movimientosApi
} from "../services/api";
import {
    ItemInventario,
    Sucursal,
    Proveedor,
    MovimientoInventario
} from "../types";
import { toast } from "sonner";

export function Inventory() {
    const [searchTerm, setSearchTerm] = useState("");
    const [items, setItems] = useState<ItemInventario[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<ItemInventario | null>(null);

    // Form state
    const [formData, setFormData] = useState({
        nombre: "",
        categoria: "",
        cantidad: 0,
        unidad: "kg",
        stock_minimo: 0,
        stock_maximo: undefined as number | undefined,
        costo_unitario: 0,
        proveedor_id: undefined as string | undefined,
        sucursal_id: "",
        fecha_vencimiento: undefined as string | undefined,
        codigo_barras: ""
    });

    const [enums, setEnums] = useState<{
        categories: string[];
        units: string[];
    }>({
        categories: [],
        units: []
    });

    const [sucursales, setSucursales] = useState<Sucursal[]>([]);
    const [proveedores, setProveedores] = useState<Proveedor[]>([]);
    const [selectedSucursalId, setSelectedSucursalId] = useState<string>("");
    const [movimientos, setMovimientos] = useState<MovimientoInventario[]>([]);
    const [loadingMovements, setLoadingMovements] = useState(false);
    const [selectedItemForHistory, setSelectedItemForHistory] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const [isMovementDialogOpen, setIsMovementDialogOpen] = useState(false);
    const [movementFormData, setMovementFormData] = useState({
        item_inventario_id: "",
        tipo_movimiento: "AJUSTE",
        cantidad: 0,
        unidad: "",
        costo_unitario: 0,
        notas: "",
        sucursal_destino_id: ""
    });

    const [isCostHistoryDialogOpen, setIsCostHistoryDialogOpen] = useState(false);
    const [costHistory, setCostHistory] = useState<{ fecha: string; costo: number; tipo: string }[]>([]);

    const loadMovements = async (itemId: string | null = null) => {
        try {
            setLoadingMovements(true);
            // Nota: La API de movimientos aún no soporta filtrado complejo en el frontend refactorizado
            // por lo que cargamos todos y filtramos en cliente por ahora, o usamos el endpoint si soporta query params
            console.log("Loading movements. Sucursal ID:", selectedSucursalId);
            const data = await movimientosApi.obtenerTodos();
            console.log("Raw Movements Data:", data);

            let filtered = data;
            if (itemId) {
                filtered = filtered.filter(m => m.item_inventario_id === itemId);
            }
            if (selectedSucursalId) {
                // Debug filtering
                const exactMatch = filtered.filter(m => m.sucursal_id === selectedSucursalId);
                const looseMatch = filtered.filter(m => String(m.sucursal_id) === String(selectedSucursalId));
                console.log("Filtering by Sucursal:", { selectedSucursalId, exactMatchCount: exactMatch.length, looseMatchCount: looseMatch.length });

                filtered = looseMatch; // Use loose match to be safe
            }

            console.log("Final Filtered Movements:", filtered);
            setMovimientos(filtered);
        } catch (error) {
            console.error("Error loading movements:", error);
            toast.error("Error al cargar el historial de movimientos");
        } finally {
            setLoadingMovements(false);
        }
    };

    useEffect(() => {
        loadItems();
        loadEnums();
        loadSucursales();
        loadProveedores();
    }, []);

    const loadSucursales = async () => {
        try {
            const data = await sucursalesApi.obtenerTodos();
            setSucursales(data);
            if (data.length > 0 && !selectedSucursalId) {
                const mainLocation = data.find(loc => loc.es_principal) || data[0];
                setSelectedSucursalId(mainLocation.id);
            }
        } catch (error) {
            console.error("Error loading locations:", error);
        }
    };

    const loadProveedores = async () => {
        try {
            const data = await proveedoresApi.obtenerTodos();
            setProveedores(data);
        } catch (error) {
            console.error("Error loading suppliers:", error);
        }
    };

    const loadEnums = async () => {
        try {
            const [categoriesRes, unitsRes] = await Promise.all([
                enumsApi.getInventoryCategories(),
                enumsApi.getInventoryUnits()
            ]);
            console.log("Enums Response - Categories:", categoriesRes);
            console.log("Enums Response - Units:", unitsRes);

            const categories = categoriesRes?.categories?.length > 0
                ? categoriesRes.categories
                : ["Carnes", "Verduras", "Granos", "Lácteos", "Bebidas", "Condimentos", "Otros"]; // Fallback

            const units = unitsRes?.units?.length > 0
                ? unitsRes.units
                : ["kg", "g", "L", "mL", "unid", "pza", "oz", "lb"]; // Fallback

            setEnums({ categories, units });

        } catch (error) {
            console.error("Error loading enums:", error);
            // Fallback on error
            setEnums({
                categories: ["Carnes", "Verduras", "Granos", "Lácteos", "Bebidas", "Condimentos", "Otros"],
                units: ["kg", "g", "L", "mL", "unid", "pza", "oz", "lb"]
            });
        }
    };

    const loadItems = async () => {
        try {
            setLoading(true);
            const data = await inventarioApi.obtenerTodos();
            setItems(data);
        } catch (error) {
            console.error("Error loading inventory:", error);
            toast.error("Error al cargar el inventario");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const submitData: any = {
                nombre: formData.nombre,
                categoria: formData.categoria,
                cantidad: formData.cantidad,
                unidad: formData.unidad,
                stock_minimo: formData.stock_minimo,
                costo_unitario: formData.costo_unitario,
                sucursal_id: formData.sucursal_id || selectedSucursalId,
            };

            if (!submitData.sucursal_id) {
                toast.error("Debes seleccionar una sucursal");
                return;
            }

            // Ensure numeric values are valid
            if (isNaN(submitData.cantidad)) submitData.cantidad = 0;
            if (isNaN(submitData.stock_minimo)) submitData.stock_minimo = 0;
            if (isNaN(submitData.costo_unitario)) submitData.costo_unitario = 0;

            if (formData.stock_maximo !== undefined && formData.stock_maximo > 0) {
                submitData.stock_maximo = formData.stock_maximo;
            }
            if (formData.proveedor_id && formData.proveedor_id !== "none") {
                submitData.proveedor_id = formData.proveedor_id;
            }
            if (formData.fecha_vencimiento) {
                submitData.fecha_vencimiento = formData.fecha_vencimiento;
            }
            if (formData.codigo_barras) {
                submitData.codigo_barras = formData.codigo_barras;
            }

            if (editingItem) {
                await inventarioApi.actualizar(editingItem.id, submitData);
                toast.success("Insumo actualizado correctamente");
            } else {
                await inventarioApi.crear(submitData);
                toast.success("Insumo creado correctamente");
            }
            setIsDialogOpen(false);
            resetForm();
            loadItems();
        } catch (error: any) {
            console.error("Error saving item:", error);
            const errorData = error.response?.data || error;
            const errorMessage = errorData.detail
                ? (typeof errorData.detail === 'string' ? errorData.detail : JSON.stringify(errorData.detail))
                : "Error al guardar el insumo";
            toast.error(errorMessage);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("¿Estás seguro de eliminar este insumo?")) return;

        try {
            await inventarioApi.eliminar(id);
            toast.success("Insumo eliminado correctamente");
            loadItems();
        } catch (error) {
            console.error("Error deleting item:", error);
            toast.error("Error al eliminar el insumo");
        }
    };

    const handleEdit = async (item: ItemInventario) => {
        setEditingItem(item);
        try {
            const fullItem = await inventarioApi.obtenerPorId(item.id);
            setFormData({
                nombre: fullItem.nombre,
                categoria: fullItem.categoria,
                cantidad: fullItem.cantidad,
                unidad: fullItem.unidad,
                stock_minimo: fullItem.stock_minimo,
                stock_maximo: fullItem.stock_maximo,
                costo_unitario: fullItem.costo_unitario,
                proveedor_id: fullItem.proveedor_id,
                sucursal_id: fullItem.sucursal_id,
                fecha_vencimiento: fullItem.fecha_vencimiento ? new Date(fullItem.fecha_vencimiento).toISOString().split('T')[0] : undefined,
                codigo_barras: fullItem.codigo_barras || ""
            });
        } catch (error) {
            console.error("Error loading item details:", error);
            setFormData({
                nombre: item.nombre,
                categoria: item.categoria,
                cantidad: item.cantidad,
                unidad: item.unidad,
                stock_minimo: item.stock_minimo,
                stock_maximo: item.stock_maximo,
                costo_unitario: item.costo_unitario,
                proveedor_id: item.proveedor_id,
                sucursal_id: item.sucursal_id,
                fecha_vencimiento: item.fecha_vencimiento ? new Date(item.fecha_vencimiento).toISOString().split('T')[0] : undefined,
                codigo_barras: item.codigo_barras || ""
            });
        }
        setIsDialogOpen(true);
    };

    const handleMovementSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const submitData: any = {
                item_inventario_id: movementFormData.item_inventario_id,
                sucursal_id: selectedSucursalId,
                tipo_movimiento: movementFormData.tipo_movimiento,
                cantidad: movementFormData.cantidad,
                unidad: movementFormData.unidad,
                notas: movementFormData.notas
            };

            if (movementFormData.costo_unitario > 0) {
                submitData.costo_unitario = movementFormData.costo_unitario;
            }

            if (movementFormData.tipo_movimiento === "TRANSFERENCIA" && movementFormData.sucursal_destino_id) {
                // Logic for transfer would be handled by backend or creating two movements
                // For now, we just send it as is if backend supports it, or we add it to notes
                submitData.notas = `${submitData.notas} (Transferencia a sucursal ID: ${movementFormData.sucursal_destino_id})`;
            }

            await movimientosApi.crear(submitData);
            toast.success("Movimiento registrado correctamente");
            setIsMovementDialogOpen(false);

            // Reset form
            setMovementFormData({
                item_inventario_id: "",
                tipo_movimiento: "AJUSTE",
                cantidad: 0,
                unidad: "",
                costo_unitario: 0,
                notas: "",
                sucursal_destino_id: ""
            });

            loadItems(); // Reload items to update stock
            loadMovements(); // Reload history
        } catch (error: any) {
            console.error("Error registering movement:", error);
            toast.error("Error al registrar el movimiento");
        }
    };

    const handleViewCostHistory = async (item: ItemInventario) => {
        setEditingItem(item);
        try {
            // Fetch movements for this item
            const allMovements = await movimientosApi.obtenerTodos();
            const itemMovements = allMovements
                .filter(m => m.item_inventario_id === item.id && m.costo_unitario && m.costo_unitario > 0)
                .sort((a, b) => new Date(b.fecha_creacion).getTime() - new Date(a.fecha_creacion).getTime());

            const history = itemMovements.map(m => ({
                fecha: m.fecha_creacion,
                costo: m.costo_unitario || 0,
                tipo: m.tipo_movimiento
            }));

            // Add current cost as the latest if no movements or different
            if (history.length === 0 || history[0].costo !== item.costo_unitario) {
                history.unshift({
                    fecha: new Date().toISOString(),
                    costo: item.costo_unitario,
                    tipo: "ACTUAL"
                });
            }

            setCostHistory(history);
            setIsCostHistoryDialogOpen(true);
        } catch (error) {
            console.error("Error loading cost history:", error);
            toast.error("Error al cargar historial de costos");
        }
    };

    const resetForm = () => {
        setFormData({
            nombre: "",
            categoria: "",
            cantidad: 0,
            unidad: "kg",
            stock_minimo: 0,
            stock_maximo: undefined,
            costo_unitario: 0,
            proveedor_id: undefined,
            sucursal_id: selectedSucursalId || "",
            fecha_vencimiento: undefined,
            codigo_barras: ""
        });
        setEditingItem(null);
    };

    const filteredItems = items.filter(item =>
        item.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.categoria.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Pagination logic
    const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedItems = filteredItems.slice(startIndex, endIndex);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    const getStockStatus = (item: ItemInventario) => {
        const percentage = (item.cantidad / item.stock_minimo) * 100;
        if (percentage <= 100) return { status: "critical", color: "text-[#EA5455]", bg: "bg-[#EA5455]/10", border: "border-[#EA5455]/20" };
        if (percentage <= 150) return { status: "low", color: "text-[#FF9F43]", bg: "bg-[#FF9F43]/10", border: "border-[#FF9F43]/20" };
        return { status: "good", color: "text-[#28C76F]", bg: "bg-[#28C76F]/10", border: "border-[#28C76F]/20" };
    };

    const criticalItems = items.filter(item => item.cantidad <= item.stock_minimo).length;
    const totalValue = items.reduce((sum, item) => sum + (item.cantidad * item.costo_unitario), 0);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-8 w-full relative">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-foreground mb-3 text-3xl font-bold">Inventario</h1>
                    <p className="text-muted-foreground text-base">Gestiona todos los insumos de tu negocio</p>
                </div>
                <div className="flex gap-2">
                    <Button
                        type="button"
                        className="bg-muted/50 hover:bg-muted text-foreground border border-primary/10"
                        onClick={() => {
                            setMovementFormData({
                                item_inventario_id: "",
                                tipo_movimiento: "AJUSTE",
                                cantidad: 0,
                                unidad: "",
                                costo_unitario: 0,
                                notas: "",
                                sucursal_destino_id: ""
                            });
                            setIsMovementDialogOpen(true);
                        }}
                    >
                        <History className="w-4 h-4 mr-2" />
                        <span className="hidden sm:inline">Registrar Movimiento</span>
                        <span className="sm:hidden">Movimiento</span>
                    </Button>
                    <Button
                        type="button"
                        className="bg-[#F26522] hover:bg-[#F26522]/90 text-[#1B1B1B] shadow-lg hover:shadow-[#F26522]/50 transition-all duration-300"
                        onClick={() => {
                            resetForm();
                            setIsDialogOpen(true);
                        }}
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        <span className="hidden sm:inline">Agregar Insumo</span>
                        <span className="sm:hidden">Agregar</span>
                    </Button>
                </div>
            </div>

            {/* Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={(open: boolean) => {
                setIsDialogOpen(open);
                if (!open) resetForm();
            }}>
                <DialogContent className="bg-white border-[#F26522]/20 shadow-xl sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle className="text-[#1B1B1B] font-bold text-lg uppercase tracking-wide">
                            {editingItem ? "Editar Insumo" : "Agregar Nuevo Insumo"}
                        </DialogTitle>
                        <DialogDescription className="text-muted-foreground">
                            {editingItem ? "Modifica los datos del insumo" : "Completa los datos para agregar un nuevo insumo al inventario"}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex-1 overflow-y-auto px-1 pr-2 pb-6">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <Label className="text-[#1B1B1B]/80 font-semibold">Nombre del Insumo</Label>
                                <Input
                                    className="bg-white border-[#F26522]/20 text-[#1B1B1B] focus:border-[#F26522] focus:ring-[#F26522]/20"
                                    placeholder="Ej: Tomate"
                                    value={formData.nombre}
                                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <Label className="text-[#1B1B1B]/80 font-semibold">Categoría</Label>
                                <Select
                                    value={formData.categoria}
                                    onValueChange={(value: string) => setFormData({ ...formData, categoria: value })}
                                    required
                                >
                                    <SelectTrigger className="bg-white border-[#F26522]/20 text-[#1B1B1B] focus:border-[#F26522] focus:ring-[#F26522]/20">
                                        <SelectValue placeholder="Selecciona una categoría" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white border-[#F26522]/20 z-[9999]">
                                        {enums.categories.map((cat) => (
                                            <SelectItem key={cat} value={cat} className="text-[#1B1B1B] focus:bg-[#F26522]/10 focus:text-[#1B1B1B]">
                                                {cat}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-[#1B1B1B]/80 font-semibold">Cantidad</Label>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        className="bg-white border-[#F26522]/20 text-[#1B1B1B] focus:border-[#F26522] focus:ring-[#F26522]/20"
                                        placeholder="0"
                                        value={formData.cantidad}
                                        onChange={(e) => setFormData({ ...formData, cantidad: parseFloat(e.target.value) || 0 })}
                                        required
                                    />
                                </div>
                                <div>
                                    <Label className="text-[#1B1B1B]/80 font-semibold">Unidad</Label>
                                    <Select
                                        value={formData.unidad}
                                        onValueChange={(value: string) => setFormData({ ...formData, unidad: value })}
                                        required
                                    >
                                        <SelectTrigger className="bg-white border-[#F26522]/20 text-[#1B1B1B] focus:border-[#F26522] focus:ring-[#F26522]/20">
                                            <SelectValue placeholder="Selecciona una unidad" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-white border-[#F26522]/20 z-[9999]">
                                            {enums.units.map((unit) => (
                                                <SelectItem key={unit} value={unit} className="text-[#1B1B1B] focus:bg-[#F26522]/10 focus:text-[#1B1B1B]">
                                                    {unit}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-[#1B1B1B]/80 font-semibold">Stock Mínimo</Label>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        className="bg-white border-[#F26522]/20 text-[#1B1B1B] focus:border-[#F26522] focus:ring-[#F26522]/20"
                                        placeholder="0"
                                        value={formData.stock_minimo}
                                        onChange={(e) => setFormData({ ...formData, stock_minimo: parseFloat(e.target.value) || 0 })}
                                        required
                                    />
                                </div>
                                <div>
                                    <Label className="text-[#1B1B1B]/80 font-semibold">Costo por Unidad (Bs.)</Label>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        className="bg-white border-[#F26522]/20 text-[#1B1B1B] focus:border-[#F26522] focus:ring-[#F26522]/20"
                                        placeholder="0.00"
                                        value={formData.costo_unitario}
                                        onChange={(e) => setFormData({ ...formData, costo_unitario: parseFloat(e.target.value) || 0 })}
                                        required
                                    />
                                </div>
                            </div>
                            <div>
                                <Label className="text-[#1B1B1B]/80 font-semibold">Sucursal *</Label>
                                <Select
                                    value={formData.sucursal_id || selectedSucursalId}
                                    onValueChange={(value: string) => setFormData({ ...formData, sucursal_id: value })}
                                    required
                                >
                                    <SelectTrigger className="bg-white border-[#F26522]/20 text-[#1B1B1B] focus:border-[#F26522] focus:ring-[#F26522]/20">
                                        <SelectValue placeholder="Selecciona una sucursal" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white border-[#F26522]/20 z-[9999]">
                                        {sucursales.map((loc) => (
                                            <SelectItem key={loc.id} value={loc.id} className="text-[#1B1B1B] focus:bg-[#F26522]/10 focus:text-[#1B1B1B]">
                                                {loc.nombre}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label className="text-[#1B1B1B]/80 font-semibold">Proveedor</Label>
                                <Select
                                    value={formData.proveedor_id || "none"}
                                    onValueChange={(value: string) => setFormData({ ...formData, proveedor_id: value === "none" ? undefined : value })}
                                >
                                    <SelectTrigger className="bg-white border-[#F26522]/20 text-[#1B1B1B] focus:border-[#F26522] focus:ring-[#F26522]/20">
                                        <SelectValue placeholder="Selecciona un proveedor" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white border-[#F26522]/20 z-[9999]">
                                        <SelectItem value="none" className="text-muted-foreground focus:bg-[#F26522]/10">
                                            (Ninguno)
                                        </SelectItem>
                                        {proveedores.map((sup) => (
                                            <SelectItem key={sup.id} value={sup.id} className="text-[#1B1B1B] focus:bg-[#F26522]/10 focus:text-[#1B1B1B]">
                                                {sup.nombre}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-[#1B1B1B]/80 font-semibold">Stock Máximo</Label>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        className="bg-white border-[#F26522]/20 text-[#1B1B1B] focus:border-[#F26522] focus:ring-[#F26522]/20"
                                        placeholder="Opcional"
                                        value={formData.stock_maximo || ""}
                                        onChange={(e) => setFormData({ ...formData, stock_maximo: e.target.value ? parseFloat(e.target.value) : undefined })}
                                    />
                                </div>
                                <div>
                                    <Label className="text-[#1B1B1B]/80 font-semibold">Fecha de Caducidad</Label>
                                    <Input
                                        type="date"
                                        className="bg-white border-[#F26522]/20 text-[#1B1B1B] focus:border-[#F26522] focus:ring-[#F26522]/20"
                                        value={formData.fecha_vencimiento || ""}
                                        onChange={(e) => setFormData({ ...formData, fecha_vencimiento: e.target.value || undefined })}
                                    />
                                </div>
                            </div>
                            <div>
                                <Label className="text-[#1B1B1B]/80 font-semibold">Código de Barras</Label>
                                <Input
                                    className="bg-white border-[#F26522]/20 text-[#1B1B1B] focus:border-[#F26522] focus:ring-[#F26522]/20"
                                    placeholder="Código de barras (opcional)"
                                    value={formData.codigo_barras}
                                    onChange={(e) => setFormData({ ...formData, codigo_barras: e.target.value })}
                                />
                            </div>
                            <Button type="submit" className="w-full bg-[#F26522] hover:bg-[#F26522]/90 text-[#1B1B1B] font-bold shadow-md">
                                {editingItem ? "Actualizar Insumo" : "Guardar Insumo"}
                            </Button>
                        </form>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Cost History Dialog */}
            <Dialog open={isCostHistoryDialogOpen} onOpenChange={setIsCostHistoryDialogOpen}>
                <DialogContent className="bg-white border-[#F26522]/20 shadow-xl sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle className="text-[#1B1B1B] font-bold text-lg uppercase tracking-wide">Historial de Costos</DialogTitle>
                        <DialogDescription className="text-muted-foreground">
                            Evolución del costo unitario para: <span className="text-[#F26522] font-semibold">{editingItem?.nombre}</span>
                        </DialogDescription>
                    </DialogHeader>
                    <div className="mt-4">
                        <div className="relative overflow-x-auto rounded-lg border border-[#F26522]/20">
                            <table className="w-full text-sm text-left text-muted-foreground">
                                <thead className="text-xs text-[#1B1B1B] uppercase bg-[#F26522]/10 font-bold">
                                    <tr>
                                        <th className="px-4 py-3">Fecha</th>
                                        <th className="px-4 py-3">Tipo</th>
                                        <th className="px-4 py-3 text-right">Costo Unit.</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {costHistory.map((record, index) => (
                                        <tr key={index} className="border-b border-[#F26522]/10 hover:bg-[#F26522]/5">
                                            <td className="px-4 py-2">{new Date(record.fecha).toLocaleDateString()}</td>
                                            <td className="px-4 py-2">{record.tipo}</td>
                                            <td className="px-4 py-2 text-right font-medium text-[#1B1B1B]">Bs. {record.costo.toFixed(2)}</td>
                                        </tr>
                                    ))}
                                    {costHistory.length === 0 && (
                                        <tr>
                                            <td colSpan={3} className="px-4 py-4 text-center">No hay historial disponible</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Movement Dialog */}
            <Dialog open={isMovementDialogOpen} onOpenChange={setIsMovementDialogOpen}>
                <DialogContent className="bg-white border-[#F26522]/20 shadow-xl sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle className="text-[#1B1B1B] font-bold text-lg uppercase tracking-wide">Registrar Movimiento</DialogTitle>
                        <DialogDescription className="text-muted-foreground">
                            Registra entradas, salidas, mermas o ajustes de inventario.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleMovementSubmit} className="space-y-4">
                        <div>
                            <Label className="text-[#1B1B1B]/80 font-semibold">Insumo</Label>
                            <Select
                                value={movementFormData.item_inventario_id}
                                onValueChange={(value: string) => {
                                    const item = items.find(i => i.id === value);
                                    setMovementFormData({
                                        ...movementFormData,
                                        item_inventario_id: value,
                                        unidad: item?.unidad || ""
                                    });
                                }}
                                required
                            >
                                <SelectTrigger className="bg-white border-[#F26522]/20 text-[#1B1B1B] focus:border-[#F26522] focus:ring-[#F26522]/20">
                                    <SelectValue placeholder="Selecciona un insumo" />
                                </SelectTrigger>
                                <SelectContent className="bg-white border-[#F26522]/20 z-[9999]">
                                    {items.map((item) => (
                                        <SelectItem key={item.id} value={item.id} className="text-[#1B1B1B] focus:bg-[#F26522]/10 focus:text-[#1B1B1B]">
                                            {item.nombre} ({item.cantidad} {item.unidad})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label className="text-[#1B1B1B]/80 font-semibold">Tipo de Movimiento</Label>
                            <Select
                                value={movementFormData.tipo_movimiento}
                                onValueChange={(value: string) => setMovementFormData({ ...movementFormData, tipo_movimiento: value })}
                                required
                            >
                                <SelectTrigger className="bg-white border-[#F26522]/20 text-[#1B1B1B] focus:border-[#F26522] focus:ring-[#F26522]/20">
                                    <SelectValue placeholder="Selecciona el tipo" />
                                </SelectTrigger>
                                <SelectContent className="bg-white border-[#F26522]/20 z-[9999]">
                                    <SelectItem value="ENTRADA" className="text-[#1B1B1B] focus:bg-[#28C76F]/10 focus:text-[#1B1B1B]">ENTRADA (Compra/Reposición)</SelectItem>
                                    <SelectItem value="SALIDA" className="text-[#1B1B1B] focus:bg-[#F26522]/10 focus:text-[#1B1B1B]">SALIDA (Uso interno)</SelectItem>
                                    <SelectItem value="MERMA" className="text-[#1B1B1B] focus:bg-[#EA5455]/10 focus:text-[#1B1B1B]">MERMA (Desperdicio/Daño)</SelectItem>
                                    <SelectItem value="AJUSTE" className="text-[#1B1B1B] focus:bg-[#FF9F43]/10 focus:text-[#1B1B1B]">AJUSTE (Corrección de stock)</SelectItem>
                                    <SelectItem value="TRANSFERENCIA" className="text-[#1B1B1B] focus:bg-[#F26522]/10 focus:text-[#1B1B1B]">TRANSFERENCIA (Entre sucursales)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label className="text-[#1B1B1B]/80 font-semibold">Cantidad</Label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    className="bg-white border-[#F26522]/20 text-[#1B1B1B] focus:border-[#F26522] focus:ring-[#F26522]/20"
                                    placeholder="0"
                                    value={movementFormData.cantidad}
                                    onChange={(e) => setMovementFormData({ ...movementFormData, cantidad: parseFloat(e.target.value) || 0 })}
                                    required
                                />
                            </div>
                            <div>
                                <Label className="text-[#1B1B1B]/80 font-semibold">Unidad</Label>
                                <Input
                                    className="bg-gray-100 border-[#F26522]/10 text-[#1B1B1B]/70"
                                    value={movementFormData.unidad}
                                    readOnly
                                />
                            </div>
                        </div>
                        {movementFormData.tipo_movimiento === "ENTRADA" && (
                            <div>
                                <Label className="text-[#1B1B1B]/80 font-semibold">Costo Unitario (Bs.)</Label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    className="bg-white border-[#F26522]/20 text-[#1B1B1B] focus:border-[#F26522] focus:ring-[#F26522]/20"
                                    placeholder="Opcional"
                                    value={movementFormData.costo_unitario}
                                    onChange={(e) => setMovementFormData({ ...movementFormData, costo_unitario: parseFloat(e.target.value) || 0 })}
                                />
                            </div>
                        )}
                        {movementFormData.tipo_movimiento === "TRANSFERENCIA" && (
                            <div>
                                <Label className="text-[#1B1B1B]/80 font-semibold">Sucursal Destino</Label>
                                <Select
                                    value={movementFormData.sucursal_destino_id}
                                    onValueChange={(value: string) => setMovementFormData({ ...movementFormData, sucursal_destino_id: value })}
                                    required
                                >
                                    <SelectTrigger className="bg-white border-[#F26522]/20 text-[#1B1B1B] focus:border-[#F26522] focus:ring-[#F26522]/20">
                                        <SelectValue placeholder="Selecciona sucursal destino" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white border-[#F26522]/20 z-[9999]">
                                        {sucursales.filter(s => s.id !== selectedSucursalId).map((loc) => (
                                            <SelectItem key={loc.id} value={loc.id} className="text-[#1B1B1B] focus:bg-[#F26522]/10 focus:text-[#1B1B1B]">
                                                {loc.nombre}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                        <div>
                            <Label className="text-[#1B1B1B]/80 font-semibold">Notas / Motivo</Label>
                            <Input
                                className="bg-white border-[#F26522]/20 text-[#1B1B1B] focus:border-[#F26522] focus:ring-[#F26522]/20"
                                placeholder="Explica el motivo del movimiento"
                                value={movementFormData.notas}
                                onChange={(e) => setMovementFormData({ ...movementFormData, notas: e.target.value })}
                            />
                        </div>
                        <Button type="submit" className="w-full bg-[#F26522] hover:bg-[#F26522]/90 text-[#1B1B1B] font-bold shadow-md">
                            Registrar Movimiento
                        </Button>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Tabs for Inventory and History */}
            <Tabs defaultValue="inventory" className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-background border border-[#F26522]/20 p-1 h-auto mb-8 shadow-sm rounded-lg">
                    <TabsTrigger
                        value="inventory"
                        className="text-muted-foreground data-[state=active]:text-[#F26522] data-[state=active]:bg-[#F26522]/10 data-[state=active]:font-bold py-2 transition-all duration-300"
                    >
                        <Package className="w-4 h-4 mr-2" />
                        Inventario
                    </TabsTrigger>
                    <TabsTrigger
                        value="history"
                        className="text-muted-foreground data-[state=active]:text-[#F26522] data-[state=active]:bg-[#F26522]/10 data-[state=active]:font-bold py-2 transition-all duration-300"
                    >
                        <History className="w-4 h-4 mr-2" />
                        Historial de Movimientos
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="inventory" className="space-y-8">
                    {/* Stats */}
                    {/* Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                        <Card className="bg-[#F26522]/10 border-[#F26522]/20 p-6 hover:bg-[#F26522]/20 transition-all duration-300 shadow-sm transform hover:-translate-y-1 hover:shadow-md">
                            <div className="flex items-center gap-4">
                                <div className="bg-white/80 p-3 rounded-lg shadow-sm">
                                    <Package className="w-6 h-6 text-[#F26522]" />
                                </div>
                                <div>
                                    <div className="text-foreground/80 mb-1 text-sm font-bold uppercase tracking-wide">Total de Insumos</div>
                                    <div className="text-foreground text-3xl font-bold tabular-nums tracking-tight">{items.length}</div>
                                    <div className="text-xs text-foreground/60 font-medium">productos registrados</div>
                                </div>
                            </div>
                        </Card>
                        <Card className="bg-[#EA5455]/10 border-[#EA5455]/20 p-6 hover:bg-[#EA5455]/20 transition-all duration-300 shadow-sm transform hover:-translate-y-1 hover:shadow-md">
                            <div className="flex items-center gap-4">
                                <div className="bg-white/80 p-3 rounded-lg shadow-sm">
                                    <AlertTriangle className="w-6 h-6 text-[#EA5455]" />
                                </div>
                                <div>
                                    <div className="text-foreground/80 mb-1 text-sm font-bold uppercase tracking-wide">Stock Crítico</div>
                                    <div className="text-foreground text-3xl font-bold tabular-nums tracking-tight">{criticalItems}</div>
                                    <div className="text-xs text-foreground/60 font-medium">requieren atención</div>
                                </div>
                            </div>
                        </Card>
                        <Card className="bg-[#28C76F]/10 border-[#28C76F]/20 p-6 hover:bg-[#28C76F]/20 transition-all duration-300 shadow-sm transform hover:-translate-y-1 hover:shadow-md">
                            <div className="flex items-center gap-4">
                                <div className="bg-white/80 p-3 rounded-lg shadow-sm">
                                    <CheckCircle2 className="w-6 h-6 text-[#28C76F]" />
                                </div>
                                <div>
                                    <div className="text-foreground/80 mb-1 text-sm font-bold uppercase tracking-wide">Valor Total</div>
                                    <div className="text-foreground text-3xl font-bold tabular-nums tracking-tight">Bs. {totalValue.toLocaleString('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                                    <div className="text-xs text-foreground/60 font-medium">en inventario</div>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Search */}
                    <Card className="bg-background border-[#F26522]/20 p-4 shadow-sm">
                        <div className="relative group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-hover:text-[#F26522] transition-colors" />
                            <Input
                                className="pl-10 bg-white border-[#F26522]/20 text-[#1B1B1B] focus:border-[#F26522] focus:ring-[#F26522]/20 transition-all"
                                placeholder="Buscar insumos por nombre o categoría..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </Card>

                    {/* Inventory Table - Desktop */}
                    <Card className="bg-white border-[#F26522]/20 overflow-hidden hidden md:block shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-[#F26522]/10 border-b border-[#F26522]/20">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-[#1B1B1B] font-bold text-xs uppercase tracking-wider">Insumo</th>
                                        <th className="px-6 py-4 text-left text-[#1B1B1B] font-bold text-xs uppercase tracking-wider">Categoría</th>
                                        <th className="px-6 py-4 text-left text-[#1B1B1B] font-bold text-xs uppercase tracking-wider">Cantidad</th>
                                        <th className="px-6 py-4 text-left text-[#1B1B1B] font-bold text-xs uppercase tracking-wider">Stock Mínimo</th>
                                        <th className="px-6 py-4 text-left text-[#1B1B1B] font-bold text-xs uppercase tracking-wider">Costo/Unidad</th>
                                        <th className="px-6 py-4 text-left text-[#1B1B1B] font-bold text-xs uppercase tracking-wider">Proveedor</th>
                                        <th className="px-6 py-4 text-left text-[#1B1B1B] font-bold text-xs uppercase tracking-wider">Estado</th>
                                        <th className="px-6 py-4 text-left text-[#1B1B1B] font-bold text-xs uppercase tracking-wider">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#F26522]/10">
                                    {filteredItems.length === 0 ? (
                                        <tr>
                                            <td colSpan={8} className="px-6 py-12 text-center">
                                                <div className="flex flex-col items-center gap-4">
                                                    <Package className="w-16 h-16 text-muted-foreground/30" />
                                                    <p className="text-muted-foreground text-lg font-medium">
                                                        {searchTerm ? "No se encontraron insumos" : "No hay insumos. Agrega tu primer insumo."}
                                                    </p>
                                                    {!searchTerm && (
                                                        <Button
                                                            className="bg-[#F26522] hover:bg-[#F26522]/90 text-[#1B1B1B] mt-2 shadow-sm"
                                                            onClick={() => {
                                                                resetForm();
                                                                setIsDialogOpen(true);
                                                            }}
                                                        >
                                                            <Plus className="w-4 h-4 mr-2" />
                                                            Agregar Primer Insumo
                                                        </Button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        paginatedItems.map((item) => {
                                            const status = getStockStatus(item);
                                            const proveedor = proveedores.find(p => p.id === item.proveedor_id);
                                            return (
                                                <tr key={item.id} className="hover:bg-[#F26522]/5 transition-colors border-b border-[#F26522]/10">
                                                    <td className="px-6 py-4">
                                                        <div className="text-[#1B1B1B] font-bold">{item.nombre}</div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="px-3 py-1 bg-[#F4F5F7] rounded-full text-[#1B1B1B]/70 text-sm font-medium border border-[#F26522]/10">{item.categoria}</span>
                                                    </td>
                                                    <td className="px-6 py-4 text-[#1B1B1B] font-medium tabular-nums">
                                                        {item.cantidad} {item.unidad}
                                                    </td>
                                                    <td className="px-6 py-4 text-[#1B1B1B]/60 tabular-nums">
                                                        {item.stock_minimo} {item.unidad}
                                                    </td>
                                                    <td className="px-6 py-4 text-[#1B1B1B] font-semibold tabular-nums">
                                                        Bs. {item.costo_unitario.toFixed(2)}
                                                    </td>
                                                    <td className="px-6 py-4 text-[#1B1B1B]/60">
                                                        {proveedor?.nombre || "-"}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-bold ${status.bg} ${status.border} border ${status.color}`}>
                                                            {status.status === "critical" && <AlertTriangle className="w-4 h-4" />}
                                                            {status.status === "low" && <AlertTriangle className="w-4 h-4" />}
                                                            {status.status === "good" && <CheckCircle2 className="w-4 h-4" />}
                                                            {status.status === "critical" && "Crítico"}
                                                            {status.status === "low" && "Bajo"}
                                                            {status.status === "good" && "Bueno"}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-2">
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleViewCostHistory(item)}
                                                                className="text-[#1B1B1B]/60 hover:bg-[#F26522]/10 hover:text-[#F26522]"
                                                                title="Ver Historial de Costos"
                                                            >
                                                                <History className="w-4 h-4" />
                                                            </Button>
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleEdit(item)}
                                                                className="text-[#1B1B1B]/60 hover:bg-[#F26522]/10 hover:text-[#F26522]"
                                                            >
                                                                <Edit className="w-4 h-4" />
                                                            </Button>
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleDelete(item.id)}
                                                                className="text-[#1B1B1B]/60 hover:bg-[#EA5455]/10 hover:text-[#EA5455]"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </Button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination - Desktop */}
                        {filteredItems.length > itemsPerPage && (
                            <div className="mt-6 flex justify-center">
                                <Pagination>
                                    <PaginationContent>
                                        <PaginationItem>
                                            <PaginationPrevious
                                                href="#"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    if (currentPage > 1) setCurrentPage(currentPage - 1);
                                                }}
                                                className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer text-foreground hover:text-primary"}
                                                size="default"
                                            />
                                        </PaginationItem>
                                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                            <PaginationItem key={page}>
                                                <PaginationLink
                                                    href="#"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        setCurrentPage(page);
                                                    }}
                                                    isActive={currentPage === page}
                                                    className="cursor-pointer text-foreground hover:text-primary data-[active=true]:bg-primary/20 data-[active=true]:text-primary"
                                                    size="icon"
                                                >
                                                    {page}
                                                </PaginationLink>
                                            </PaginationItem>
                                        ))}
                                        <PaginationItem>
                                            <PaginationNext
                                                href="#"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
                                                }}
                                                className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer text-foreground hover:text-primary"}
                                                size="default"
                                            />
                                        </PaginationItem>
                                    </PaginationContent>
                                </Pagination>
                            </div>
                        )}
                    </Card>
                </TabsContent>

                <TabsContent value="history" className="space-y-6">
                    <Card className="bg-white border-[#F26522]/20 p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-[#1B1B1B] text-lg font-bold uppercase tracking-wide">Historial de Movimientos</h3>
                            <div className="flex gap-2">
                                <Select
                                    value={selectedItemForHistory || "all"}
                                    onValueChange={(value: string) => {
                                        setSelectedItemForHistory(value === "all" ? null : value);
                                        loadMovements(value === "all" ? null : value);
                                    }}
                                >
                                    <SelectTrigger className="bg-white border-[#F26522]/20 text-[#1B1B1B] w-64 focus:border-[#F26522] focus:ring-[#F26522]/20">
                                        <SelectValue placeholder="Filtrar por item" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white border-[#F26522]/20 z-[9999]">
                                        <SelectItem value="all" className="text-[#1B1B1B] focus:bg-[#F26522]/10 focus:text-[#1B1B1B]">
                                            Todos los items
                                        </SelectItem>
                                        {items.map((item) => (
                                            <SelectItem key={item.id} value={item.id} className="text-[#1B1B1B] focus:bg-[#F26522]/10 focus:text-[#1B1B1B]">
                                                {item.nombre}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {loadingMovements ? (
                            <div className="flex items-center justify-center h-64">
                                <Loader2 className="w-8 h-8 animate-spin text-[#F26522]" />
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-[#F26522]/10 border-b border-[#F26522]/20">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-[#1B1B1B] font-bold text-xs uppercase tracking-wider">Fecha</th>
                                            <th className="px-6 py-4 text-left text-[#1B1B1B] font-bold text-xs uppercase tracking-wider">Item</th>
                                            <th className="px-6 py-4 text-left text-[#1B1B1B] font-bold text-xs uppercase tracking-wider">Tipo</th>
                                            <th className="px-6 py-4 text-left text-[#1B1B1B] font-bold text-xs uppercase tracking-wider">Cantidad</th>
                                            <th className="px-6 py-4 text-left text-[#1B1B1B] font-bold text-xs uppercase tracking-wider">Costo Unit.</th>
                                            <th className="px-6 py-4 text-left text-[#1B1B1B] font-bold text-xs uppercase tracking-wider">Referencia</th>
                                            <th className="px-6 py-4 text-left text-[#1B1B1B] font-bold text-xs uppercase tracking-wider">Notas</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#F26522]/10">
                                        {movimientos.length === 0 ? (
                                            <tr>
                                                <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">
                                                    <div className="flex flex-col items-center gap-2">
                                                        <History className="w-12 h-12 text-muted-foreground/30" />
                                                        <p className="font-medium">No se encontraron movimientos.</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : (
                                            movimientos.map((movement) => {
                                                const item = items.find(i => i.id === movement.item_inventario_id);
                                                const movementTypeColors: Record<string, string> = {
                                                    ENTRADA: "text-[#28C76F]",
                                                    SALIDA: "text-[#EA5455]",
                                                    AJUSTE: "text-[#FF9F43]",
                                                    MERMA: "text-[#EA5455]",
                                                    CADUCIDAD: "text-[#EA5455]",
                                                    ROBO: "text-[#EA5455]",
                                                    TRANSFERENCIA: "text-[#7367F0]"
                                                };
                                                return (
                                                    <tr key={movement.id} className="hover:bg-[#F26522]/5 transition-colors border-b border-[#F26522]/10">
                                                        <td className="px-6 py-4 text-[#1B1B1B]/80 tabular-nums">
                                                            {new Date(movement.fecha_creacion).toLocaleDateString()}
                                                        </td>
                                                        <td className="px-6 py-4 text-[#1B1B1B] font-medium">
                                                            {item?.nombre || "Item desconocido"}
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className={`font-bold text-xs uppercase tracking-wide ${movementTypeColors[movement.tipo_movimiento] || "text-[#1B1B1B]"}`}>
                                                                {movement.tipo_movimiento}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 text-[#1B1B1B] font-medium tabular-nums">
                                                            {movement.cantidad} {movement.unidad}
                                                        </td>
                                                        <td className="px-6 py-4 text-[#1B1B1B]/60 tabular-nums">
                                                            {movement.costo_unitario ? `Bs. ${movement.costo_unitario.toFixed(2)}` : "-"}
                                                        </td>
                                                        <td className="px-6 py-4 text-[#1B1B1B]/60 text-xs">
                                                            {movement.referencia_id ? `${movement.tipo_referencia} #${movement.referencia_id.slice(0, 8)}` : "-"}
                                                        </td>
                                                        <td className="px-6 py-4 text-[#1B1B1B]/60 text-sm max-w-[200px] truncate" title={movement.notas}>
                                                            {movement.notas || "-"}
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}