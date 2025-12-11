import { useState, useEffect } from "react";
import { Plus, Search, Truck, Calendar, X } from "lucide-react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import {
    ordenesCompraApi,
    proveedoresApi,
    inventarioApi,
    sucursalesApi
} from "../services/api";
import {
    OrdenCompra,
    Proveedor,
    ItemInventario,
    Sucursal,
    ItemOrdenCompra
} from "../types";
import { toast } from "sonner";

export function PurchaseOrders() {
    const [orders, setOrders] = useState<OrdenCompra[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [suppliers, setSuppliers] = useState<Proveedor[]>([]);
    const [inventoryItems, setInventoryItems] = useState<ItemInventario[]>([]);
    const [sucursales, setSucursales] = useState<Sucursal[]>([]);
    // const [units, setUnits] = useState<string[]>([]);

    // Form State
    const [formData, setFormData] = useState({
        proveedor_id: "",
        sucursal_id: "",
        fecha_entrega_esperada: "",
        notas: "",
        items: [] as Partial<ItemOrdenCompra>[]
    });

    useEffect(() => {
        loadOrders();
        loadDependencies();
    }, []);

    const loadOrders = async () => {
        try {
            setLoading(true);
            const data = await ordenesCompraApi.obtenerTodos();
            setOrders(data);
        } catch (error) {
            console.error("Error loading orders:", error);
            toast.error("Error al cargar órdenes de compra");
        } finally {
            setLoading(false);
        }
    };

    const loadDependencies = async () => {
        try {
            const [provData, invData, sucData] = await Promise.all([
                proveedoresApi.obtenerTodos(),
                inventarioApi.obtenerTodos(),
                sucursalesApi.obtenerTodos()
            ]);
            setSuppliers(provData);
            setInventoryItems(invData);
            setSucursales(sucData);
            // setUnits(unitsRes.units);

            if (sucData.length > 0) {
                const main = sucData.find(s => s.es_principal) || sucData[0];
                setFormData(prev => ({ ...prev, sucursal_id: main.id }));
            }
        } catch (error) {
            console.error("Error loading dependencies:", error);
        }
    };

    const handleAddItem = () => {
        setFormData({
            ...formData,
            items: [...formData.items, { nombre_item: "", cantidad: 1, precio_unitario: 0, unidad: "unid" }]
        });
    };

    const handleRemoveItem = (index: number) => {
        const newItems = [...formData.items];
        newItems.splice(index, 1);
        setFormData({ ...formData, items: newItems });
    };

    const updateItem = (index: number, field: string, value: any) => {
        const newItems = [...formData.items];
        (newItems[index] as any)[field] = value;

        // Auto-fill details if existing item selected
        if (field === "item_inventario_id") {
            const item = inventoryItems.find(i => i.id === value);
            if (item) {
                newItems[index].nombre_item = item.nombre;
                newItems[index].unidad = item.unidad;
                newItems[index].precio_unitario = item.costo_unitario;
            }
        }

        // Calculate total
        if (field === "cantidad" || field === "precio_unitario") {
            const qty = field === "cantidad" ? value : newItems[index].cantidad || 0;
            const price = field === "precio_unitario" ? value : newItems[index].precio_unitario || 0;
            newItems[index].total = qty * price;
        }

        setFormData({ ...formData, items: newItems });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (formData.items.length === 0) {
                toast.error("Debes agregar al menos un item");
                return;
            }

            const total = formData.items.reduce((sum, item) => sum + ((item.cantidad || 0) * (item.precio_unitario || 0)), 0);

            const submitData = {
                proveedor_id: formData.proveedor_id,
                sucursal_id: formData.sucursal_id,
                fecha_entrega_esperada: formData.fecha_entrega_esperada || undefined,
                notas: formData.notas,
                monto_total: total,
                items: formData.items
            };

            await ordenesCompraApi.crear(submitData as any);
            toast.success("Orden de compra creada correctamente");
            setIsDialogOpen(false);
            resetForm();
            loadOrders();
        } catch (error) {
            console.error("Error creating order:", error);
            toast.error("Error al crear la orden de compra");
        }
    };

    const resetForm = () => {
        const main = sucursales.find(s => s.es_principal) || sucursales[0];
        setFormData({
            proveedor_id: "",
            sucursal_id: main?.id || "",
            fecha_entrega_esperada: "",
            notas: "",
            items: []
        });
    };

    const filteredOrders = orders.filter(order =>
        order.numero_orden.toLowerCase().includes(searchTerm.toLowerCase()) ||
        suppliers.find(s => s.id === order.proveedor_id)?.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8 w-full relative">
            {loading && (
                <div className="absolute inset-0 bg-background/50 z-50 flex items-center justify-center rounded-lg">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            )}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-[#1B1B1B] mb-3 text-3xl font-bold">Órdenes de Compra</h1>
                    <p className="text-muted-foreground text-base">Gestiona tus pedidos a proveedores</p>
                </div>
                <Button
                    className="bg-[#F26522] hover:bg-[#F26522]/90 text-[#1B1B1B] shadow-lg hover:shadow-[#F26522]/50 transition-all duration-300 font-bold"
                    onClick={() => setIsDialogOpen(true)}
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Nueva Orden
                </Button>
            </div>

            <Card className="bg-white border-[#F26522]/20 p-4 shadow-sm">
                <div className="relative group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-hover:text-[#F26522] transition-colors" />
                    <Input
                        className="pl-10 bg-white border-[#F26522]/20 text-[#1B1B1B] focus:border-[#F26522] focus:ring-[#F26522]/20 transition-all"
                        placeholder="Buscar por número de orden o proveedor..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </Card>

            <div className="grid grid-cols-1 gap-4">
                {filteredOrders.map((order) => {
                    const supplier = suppliers.find(s => s.id === order.proveedor_id);
                    return (
                        <Card key={order.id} className="bg-white border-[#F26522]/20 p-6 hover:bg-white hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 shadow-sm">
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="text-[#1B1B1B] font-bold text-lg tabular-nums tracking-wide">{order.numero_orden}</h3>
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase tracking-wide
                      ${order.estado === 'PENDIENTE' ? 'bg-[#FF9F43]/10 text-[#FF9F43] border border-[#FF9F43]/20' :
                                                order.estado === 'RECIBIDA' ? 'bg-[#28C76F]/10 text-[#28C76F] border border-[#28C76F]/20' :
                                                    'bg-[#EA5455]/10 text-[#EA5455] border border-[#EA5455]/20'}`}>
                                            {order.estado}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-4 text-[#1B1B1B]/60 text-sm font-medium">
                                        <div className="flex items-center gap-1 group-hover:text-[#F26522] transition-colors">
                                            <Truck className="w-4 h-4" />
                                            {supplier?.nombre || "Proveedor desconocido"}
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Calendar className="w-4 h-4" />
                                            {new Date(order.fecha_creacion).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-[#F26522] font-bold text-xl mb-1 tabular-nums tracking-tight">Bs. {order.monto_total.toFixed(2)}</div>
                                    <div className="text-[#1B1B1B]/60 text-sm font-medium">{order.items.length} items</div>
                                </div>
                            </div>
                        </Card>
                    );
                })}
                {filteredOrders.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                        No se encontraron órdenes de compra.
                    </div>
                )}
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="bg-white border-[#F26522]/20 max-w-3xl flex flex-col p-0 overflow-hidden">
                    <DialogHeader className="px-6 py-4 border-b border-[#F26522]/10 bg-[#F26522]/5">
                        <DialogTitle className="text-[#1B1B1B] text-xl font-bold uppercase tracking-wide">Nueva Orden de Compra</DialogTitle>
                        <DialogDescription className="text-[#1B1B1B]/60">Crea un nuevo pedido a proveedor</DialogDescription>
                    </DialogHeader>
                    <div className="flex-1 overflow-y-auto px-6 py-4">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-[#1B1B1B] font-medium mb-2 block">Proveedor</Label>
                                    <Select
                                        value={formData.proveedor_id}
                                        onValueChange={(value: string) => setFormData({ ...formData, proveedor_id: value })}
                                        required
                                    >
                                        <SelectTrigger className="bg-white border-[#F26522]/20 text-[#1B1B1B] focus:border-[#F26522] focus:ring-[#F26522]/20">
                                            <SelectValue placeholder="Selecciona proveedor" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-white border-[#F26522]/20 z-[9999]">
                                            {suppliers.map((s) => (
                                                <SelectItem key={s.id} value={s.id} className="text-[#1B1B1B] focus:bg-[#F26522]/10 focus:text-[#1B1B1B]">
                                                    {s.nombre}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label className="text-[#1B1B1B] font-medium mb-2 block">Sucursal</Label>
                                    <Select
                                        value={formData.sucursal_id}
                                        onValueChange={(value: string) => setFormData({ ...formData, sucursal_id: value })}
                                        required
                                    >
                                        <SelectTrigger className="bg-muted/50 border-primary/20 text-foreground">
                                            <SelectValue placeholder="Selecciona sucursal" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-card border-primary/20">
                                            {sucursales.map((s) => (
                                                <SelectItem key={s.id} value={s.id} className="text-foreground focus:bg-primary/20">
                                                    {s.nombre}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div>
                                <Label className="text-foreground/80">Fecha Entrega Esperada</Label>
                                <Input
                                    type="date"
                                    className="bg-muted/50 border-primary/20 text-foreground"
                                    value={formData.fecha_entrega_esperada}
                                    onChange={(e) => setFormData({ ...formData, fecha_entrega_esperada: e.target.value })}
                                />
                            </div>

                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <Label className="text-foreground/80">Items del Pedido</Label>
                                    <Button type="button" size="sm" onClick={handleAddItem} className="bg-primary/20 text-primary hover:bg-primary/30">
                                        <Plus className="w-4 h-4 mr-1" /> Agregar Item
                                    </Button>
                                </div>
                                <div className="space-y-3">
                                    {formData.items.map((item, index) => (
                                        <div key={index} className="flex gap-2 items-start bg-muted/50 p-3 rounded border border-primary/10">
                                            <div className="grid grid-cols-12 gap-2 w-full">
                                                <div className="col-span-4">
                                                    <Label className="text-xs text-muted-foreground mb-1 block">Insumo (Opcional)</Label>
                                                    <Select
                                                        value={item.item_inventario_id || "custom"}
                                                        onValueChange={(value: string) => {
                                                            if (value === "custom") {
                                                                updateItem(index, "item_inventario_id", undefined);
                                                                updateItem(index, "nombre_item", "");
                                                            } else {
                                                                updateItem(index, "item_inventario_id", value);
                                                            }
                                                        }}
                                                    >
                                                        <SelectTrigger className="h-8 bg-muted/50 border-primary/10 text-foreground text-xs">
                                                            <SelectValue placeholder="Selecciona..." />
                                                        </SelectTrigger>
                                                        <SelectContent className="bg-card border-primary/20">
                                                            <SelectItem value="custom" className="text-muted-foreground focus:bg-primary/20">Manual</SelectItem>
                                                            {inventoryItems.map((i) => (
                                                                <SelectItem key={i.id} value={i.id} className="text-foreground focus:bg-primary/20">
                                                                    {i.nombre}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="col-span-3">
                                                    <Label className="text-xs text-muted-foreground mb-1 block">Nombre</Label>
                                                    <Input
                                                        className="h-8 bg-muted/50 border-primary/10 text-foreground text-xs"
                                                        value={item.nombre_item}
                                                        onChange={(e) => updateItem(index, "nombre_item", e.target.value)}
                                                        placeholder="Nombre item"
                                                        readOnly={!!item.item_inventario_id}
                                                    />
                                                </div>
                                                <div className="col-span-2">
                                                    <Label className="text-xs text-muted-foreground mb-1 block">Cant.</Label>
                                                    <Input
                                                        type="number"
                                                        className="h-8 bg-muted/50 border-primary/10 text-foreground text-xs"
                                                        value={item.cantidad}
                                                        onChange={(e) => updateItem(index, "cantidad", parseFloat(e.target.value))}
                                                    />
                                                </div>
                                                <div className="col-span-3">
                                                    <Label className="text-xs text-muted-foreground mb-1 block">Costo Unit.</Label>
                                                    <Input
                                                        type="number"
                                                        className="h-8 bg-muted/50 border-primary/10 text-foreground text-xs"
                                                        value={item.precio_unitario}
                                                        onChange={(e) => updateItem(index, "precio_unitario", parseFloat(e.target.value))}
                                                    />
                                                </div>
                                            </div>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-muted-foreground hover:text-destructive mt-6"
                                                onClick={() => handleRemoveItem(index)}
                                            >
                                                <X className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <Label className="text-foreground/80">Notas</Label>
                                <Input
                                    className="bg-muted/50 border-primary/20 text-foreground"
                                    value={formData.notas}
                                    onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
                                />
                            </div>

                            <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                                Crear Orden de Compra
                            </Button>
                        </form>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
