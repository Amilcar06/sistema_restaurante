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
      const data = await movimientosApi.obtenerTodos();

      let filtered = data;
      if (itemId) {
        filtered = filtered.filter(m => m.item_inventario_id === itemId);
      }
      if (selectedSucursalId) {
        filtered = filtered.filter(m => m.sucursal_id === selectedSucursalId);
      }

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
      setEnums({
        categories: categoriesRes.categories,
        units: unitsRes.units
      });
    } catch (error) {
      console.error("Error loading enums:", error);
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
    if (percentage <= 100) return { status: "critical", color: "text-destructive", bg: "bg-destructive/10", border: "border-destructive/20" };
    if (percentage <= 150) return { status: "low", color: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/20" };
    return { status: "good", color: "text-primary", bg: "bg-primary/10", border: "border-primary/20" };
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
            className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-primary/50 transition-all duration-300"
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
        <DialogContent className="bg-card border-primary/20">
          <DialogHeader>
            <DialogTitle className="text-foreground">
              {editingItem ? "Editar Insumo" : "Agregar Nuevo Insumo"}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              {editingItem ? "Modifica los datos del insumo" : "Completa los datos para agregar un nuevo insumo al inventario"}
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto px-1 pr-2 pb-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label className="text-foreground/80">Nombre del Insumo</Label>
                <Input
                  className="bg-muted/50 border-primary/20 text-foreground"
                  placeholder="Ej: Tomate"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label className="text-foreground/80">Categoría</Label>
                <Select
                  value={formData.categoria}
                  onValueChange={(value: string) => setFormData({ ...formData, categoria: value })}
                  required
                >
                  <SelectTrigger className="bg-muted/50 border-primary/20 text-foreground">
                    <SelectValue placeholder="Selecciona una categoría" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-primary/20">
                    {enums.categories.map((cat) => (
                      <SelectItem key={cat} value={cat} className="text-foreground focus:bg-primary/20">
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-foreground/80">Cantidad</Label>
                  <Input
                    type="number"
                    step="0.01"
                    className="bg-muted/50 border-primary/20 text-foreground"
                    placeholder="0"
                    value={formData.cantidad}
                    onChange={(e) => setFormData({ ...formData, cantidad: parseFloat(e.target.value) || 0 })}
                    required
                  />
                </div>
                <div>
                  <Label className="text-foreground/80">Unidad</Label>
                  <Select
                    value={formData.unidad}
                    onValueChange={(value: string) => setFormData({ ...formData, unidad: value })}
                    required
                  >
                    <SelectTrigger className="bg-muted/50 border-primary/20 text-foreground">
                      <SelectValue placeholder="Selecciona una unidad" />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-primary/20">
                      {enums.units.map((unit) => (
                        <SelectItem key={unit} value={unit} className="text-foreground focus:bg-primary/20">
                          {unit}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-foreground/80">Stock Mínimo</Label>
                  <Input
                    type="number"
                    step="0.01"
                    className="bg-muted/50 border-primary/20 text-foreground"
                    placeholder="0"
                    value={formData.stock_minimo}
                    onChange={(e) => setFormData({ ...formData, stock_minimo: parseFloat(e.target.value) || 0 })}
                    required
                  />
                </div>
                <div>
                  <Label className="text-foreground/80">Costo por Unidad (Bs.)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    className="bg-muted/50 border-primary/20 text-foreground"
                    placeholder="0.00"
                    value={formData.costo_unitario}
                    onChange={(e) => setFormData({ ...formData, costo_unitario: parseFloat(e.target.value) || 0 })}
                    required
                  />
                </div>
              </div>
              <div>
                <Label className="text-foreground/80">Sucursal *</Label>
                <Select
                  value={formData.sucursal_id || selectedSucursalId}
                  onValueChange={(value: string) => setFormData({ ...formData, sucursal_id: value })}
                  required
                >
                  <SelectTrigger className="bg-muted/50 border-primary/20 text-foreground">
                    <SelectValue placeholder="Selecciona una sucursal" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-primary/20">
                    {sucursales.map((loc) => (
                      <SelectItem key={loc.id} value={loc.id} className="text-foreground focus:bg-primary/20">
                        {loc.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-foreground/80">Proveedor</Label>
                <Select
                  value={formData.proveedor_id || "none"}
                  onValueChange={(value: string) => setFormData({ ...formData, proveedor_id: value === "none" ? undefined : value })}
                >
                  <SelectTrigger className="bg-muted/50 border-primary/20 text-foreground">
                    <SelectValue placeholder="Selecciona un proveedor" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-primary/20">
                    <SelectItem value="none" className="text-muted-foreground focus:bg-primary/20">
                      (Ninguno)
                    </SelectItem>
                    {proveedores.map((sup) => (
                      <SelectItem key={sup.id} value={sup.id} className="text-foreground focus:bg-primary/20">
                        {sup.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-foreground/80">Stock Máximo</Label>
                  <Input
                    type="number"
                    step="0.01"
                    className="bg-muted/50 border-primary/20 text-foreground"
                    placeholder="Opcional"
                    value={formData.stock_maximo || ""}
                    onChange={(e) => setFormData({ ...formData, stock_maximo: e.target.value ? parseFloat(e.target.value) : undefined })}
                  />
                </div>
                <div>
                  <Label className="text-foreground/80">Fecha de Caducidad</Label>
                  <Input
                    type="date"
                    className="bg-muted/50 border-primary/20 text-foreground"
                    value={formData.fecha_vencimiento || ""}
                    onChange={(e) => setFormData({ ...formData, fecha_vencimiento: e.target.value || undefined })}
                  />
                </div>
              </div>
              <div>
                <Label className="text-foreground/80">Código de Barras</Label>
                <Input
                  className="bg-muted/50 border-primary/20 text-foreground"
                  placeholder="Código de barras (opcional)"
                  value={formData.codigo_barras}
                  onChange={(e) => setFormData({ ...formData, codigo_barras: e.target.value })}
                />
              </div>
              <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                {editingItem ? "Actualizar Insumo" : "Guardar Insumo"}
              </Button>
            </form>
          </div>
        </DialogContent>
      </Dialog>

      {/* Cost History Dialog */}
      <Dialog open={isCostHistoryDialogOpen} onOpenChange={setIsCostHistoryDialogOpen}>
        <DialogContent className="bg-card border-primary/20">
          <DialogHeader>
            <DialogTitle className="text-foreground">Historial de Costos</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Evolución del costo unitario para: <span className="text-foreground font-medium">{editingItem?.nombre}</span>
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            <div className="relative overflow-x-auto">
              <table className="w-full text-sm text-left text-muted-foreground">
                <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
                  <tr>
                    <th className="px-4 py-2">Fecha</th>
                    <th className="px-4 py-2">Tipo</th>
                    <th className="px-4 py-2 text-right">Costo Unit.</th>
                  </tr>
                </thead>
                <tbody>
                  {costHistory.map((record, index) => (
                    <tr key={index} className="border-b border-primary/10">
                      <td className="px-4 py-2">{new Date(record.fecha).toLocaleDateString()}</td>
                      <td className="px-4 py-2">{record.tipo}</td>
                      <td className="px-4 py-2 text-right font-medium text-foreground">Bs. {record.costo.toFixed(2)}</td>
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
        <DialogContent className="bg-card border-primary/20">
          <DialogHeader>
            <DialogTitle className="text-foreground">Registrar Movimiento Manual</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Registra entradas, salidas, mermas o ajustes de inventario.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleMovementSubmit} className="space-y-4">
            <div>
              <Label className="text-foreground/80">Insumo</Label>
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
                <SelectTrigger className="bg-muted/50 border-primary/20 text-foreground">
                  <SelectValue placeholder="Selecciona un insumo" />
                </SelectTrigger>
                <SelectContent className="bg-card border-primary/20">
                  {items.map((item) => (
                    <SelectItem key={item.id} value={item.id} className="text-foreground focus:bg-primary/20">
                      {item.nombre} ({item.cantidad} {item.unidad})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-foreground/80">Tipo de Movimiento</Label>
              <Select
                value={movementFormData.tipo_movimiento}
                onValueChange={(value: string) => setMovementFormData({ ...movementFormData, tipo_movimiento: value })}
                required
              >
                <SelectTrigger className="bg-muted/50 border-primary/20 text-foreground">
                  <SelectValue placeholder="Selecciona el tipo" />
                </SelectTrigger>
                <SelectContent className="bg-card border-primary/20">
                  <SelectItem value="ENTRADA" className="text-foreground focus:bg-primary/20">ENTRADA (Compra/Reposición)</SelectItem>
                  <SelectItem value="SALIDA" className="text-foreground focus:bg-primary/20">SALIDA (Uso interno)</SelectItem>
                  <SelectItem value="MERMA" className="text-foreground focus:bg-primary/20">MERMA (Desperdicio/Daño)</SelectItem>
                  <SelectItem value="AJUSTE" className="text-foreground focus:bg-primary/20">AJUSTE (Corrección de stock)</SelectItem>
                  <SelectItem value="TRANSFERENCIA" className="text-foreground focus:bg-primary/20">TRANSFERENCIA (Entre sucursales)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-foreground/80">Cantidad</Label>
                <Input
                  type="number"
                  step="0.01"
                  className="bg-muted/50 border-primary/20 text-foreground"
                  placeholder="0"
                  value={movementFormData.cantidad}
                  onChange={(e) => setMovementFormData({ ...movementFormData, cantidad: parseFloat(e.target.value) || 0 })}
                  required
                />
              </div>
              <div>
                <Label className="text-foreground/80">Unidad</Label>
                <Input
                  className="bg-muted/50 border-primary/20 text-foreground"
                  value={movementFormData.unidad}
                  readOnly
                />
              </div>
            </div>
            {movementFormData.tipo_movimiento === "ENTRADA" && (
              <div>
                <Label className="text-foreground/80">Costo Unitario (Bs.)</Label>
                <Input
                  type="number"
                  step="0.01"
                  className="bg-muted/50 border-primary/20 text-foreground"
                  placeholder="Opcional"
                  value={movementFormData.costo_unitario}
                  onChange={(e) => setMovementFormData({ ...movementFormData, costo_unitario: parseFloat(e.target.value) || 0 })}
                />
              </div>
            )}
            {movementFormData.tipo_movimiento === "TRANSFERENCIA" && (
              <div>
                <Label className="text-foreground/80">Sucursal Destino</Label>
                <Select
                  value={movementFormData.sucursal_destino_id}
                  onValueChange={(value: string) => setMovementFormData({ ...movementFormData, sucursal_destino_id: value })}
                  required
                >
                  <SelectTrigger className="bg-muted/50 border-primary/20 text-foreground">
                    <SelectValue placeholder="Selecciona sucursal destino" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-primary/20">
                    {sucursales.filter(s => s.id !== selectedSucursalId).map((loc) => (
                      <SelectItem key={loc.id} value={loc.id} className="text-foreground focus:bg-primary/20">
                        {loc.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div>
              <Label className="text-foreground/80">Notas / Motivo</Label>
              <Input
                className="bg-muted/50 border-primary/20 text-foreground"
                placeholder="Explica el motivo del movimiento"
                value={movementFormData.notas}
                onChange={(e) => setMovementFormData({ ...movementFormData, notas: e.target.value })}
              />
            </div>
            <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
              Registrar Movimiento
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Tabs for Inventory and History */}
      <Tabs defaultValue="inventory" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-muted/50 border-primary/20 p-1 h-auto mb-6">
          <TabsTrigger
            value="inventory"
            className="text-muted-foreground data-[state=active]:text-primary data-[state=active]:bg-primary/10 py-2"
          >
            <Package className="w-4 h-4 mr-2" />
            Inventario
          </TabsTrigger>
          <TabsTrigger
            value="history"
            className="text-muted-foreground data-[state=active]:text-primary data-[state=active]:bg-primary/10 py-2"
          >
            <History className="w-4 h-4 mr-2" />
            Historial de Movimientos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="inventory" className="space-y-8">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="bg-card border-primary/20 p-6 hover:bg-muted/50 hover:border-primary/40 transition-all duration-300">
              <div className="flex items-center gap-4">
                <div className="bg-primary/10 p-3 rounded-lg hover:bg-primary/20 transition-colors">
                  <Package className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <div className="text-muted-foreground mb-1 text-sm font-medium">Total de Insumos</div>
                  <div className="text-foreground text-2xl font-bold">{items.length} productos</div>
                </div>
              </div>
            </Card>
            <Card className="bg-card border-destructive/20 p-6 hover:bg-muted/50 hover:border-destructive/40 transition-all duration-300">
              <div className="flex items-center gap-4">
                <div className="bg-destructive/10 p-3 rounded-lg hover:bg-destructive/20 transition-colors">
                  <AlertTriangle className="w-6 h-6 text-destructive" />
                </div>
                <div>
                  <div className="text-muted-foreground mb-1 text-sm font-medium">Stock Crítico</div>
                  <div className="text-foreground text-2xl font-bold">{criticalItems} items</div>
                </div>
              </div>
            </Card>
            <Card className="bg-card border-primary/20 p-6 hover:bg-muted/50 hover:border-primary/40 transition-all duration-300">
              <div className="flex items-center gap-4">
                <div className="bg-primary/10 p-3 rounded-lg hover:bg-primary/20 transition-colors">
                  <CheckCircle2 className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <div className="text-muted-foreground mb-1 text-sm font-medium">Valor Total</div>
                  <div className="text-foreground text-2xl font-bold">Bs. {totalValue.toFixed(2)}</div>
                </div>
              </div>
            </Card>
          </div>

          {/* Search */}
          <Card className="bg-card border-primary/20 p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                className="pl-10 bg-muted/50 border-primary/20 text-foreground"
                placeholder="Buscar insumos por nombre o categoría..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </Card>

          {/* Inventory Table - Desktop */}
          <Card className="bg-card border-primary/20 overflow-hidden hidden md:block">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50 border-b border-primary/20">
                  <tr>
                    <th className="px-6 py-4 text-left text-foreground/80">Insumo</th>
                    <th className="px-6 py-4 text-left text-foreground/80">Categoría</th>
                    <th className="px-6 py-4 text-left text-foreground/80">Cantidad</th>
                    <th className="px-6 py-4 text-left text-foreground/80">Stock Mínimo</th>
                    <th className="px-6 py-4 text-left text-foreground/80">Costo/Unidad</th>
                    <th className="px-6 py-4 text-left text-foreground/80">Proveedor</th>
                    <th className="px-6 py-4 text-left text-foreground/80">Estado</th>
                    <th className="px-6 py-4 text-left text-foreground/80">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-primary/10">
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
                              className="bg-primary hover:bg-primary/90 text-primary-foreground mt-2"
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
                        <tr key={item.id} className="hover:bg-muted/50 transition-colors border-b border-primary/10">
                          <td className="px-6 py-4">
                            <div className="text-foreground font-medium">{item.nombre}</div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="px-3 py-1 bg-muted rounded-full text-muted-foreground text-sm font-medium">{item.categoria}</span>
                          </td>
                          <td className="px-6 py-4 text-foreground font-medium">
                            {item.cantidad} {item.unidad}
                          </td>
                          <td className="px-6 py-4 text-muted-foreground">
                            {item.stock_minimo} {item.unidad}
                          </td>
                          <td className="px-6 py-4 text-foreground font-semibold">
                            Bs. {item.costo_unitario.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 text-muted-foreground">
                            {proveedor?.nombre || "-"}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${status.bg} ${status.border} border ${status.color}`}>
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
                                className="text-foreground hover:bg-blue-500/20 hover:text-blue-400 transition-all"
                                title="Ver Historial de Costos"
                              >
                                <History className="w-4 h-4" />
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEdit(item)}
                                className="text-foreground hover:bg-primary/20 hover:text-primary transition-all"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(item.id)}
                                className="text-foreground hover:bg-destructive/20 hover:text-destructive transition-all"
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
          <Card className="bg-card border-primary/20 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-foreground text-lg font-semibold">Historial de Movimientos</h3>
              <div className="flex gap-2">
                <Select
                  value={selectedItemForHistory || "all"}
                  onValueChange={(value: string) => {
                    setSelectedItemForHistory(value === "all" ? null : value);
                    loadMovements(value === "all" ? null : value);
                  }}
                >
                  <SelectTrigger className="bg-muted/50 border-primary/20 text-foreground w-64">
                    <SelectValue placeholder="Filtrar por item" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-primary/20">
                    <SelectItem value="all" className="text-foreground focus:bg-primary/20">
                      Todos los items
                    </SelectItem>
                    {items.map((item) => (
                      <SelectItem key={item.id} value={item.id} className="text-foreground focus:bg-primary/20">
                        {item.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {loadingMovements ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50 border-b border-primary/20">
                    <tr>
                      <th className="px-6 py-4 text-left text-foreground/80">Fecha</th>
                      <th className="px-6 py-4 text-left text-foreground/80">Item</th>
                      <th className="px-6 py-4 text-left text-foreground/80">Tipo</th>
                      <th className="px-6 py-4 text-left text-foreground/80">Cantidad</th>
                      <th className="px-6 py-4 text-left text-foreground/80">Costo Unit.</th>
                      <th className="px-6 py-4 text-left text-foreground/80">Referencia</th>
                      <th className="px-6 py-4 text-left text-foreground/80">Notas</th>
                    </tr>
                  </thead>
                  <tbody>
                    {movimientos.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-4 text-center text-muted-foreground">
                          No se encontraron movimientos.
                        </td>
                      </tr>
                    ) : (
                      movimientos.map((movement) => {
                        const item = items.find(i => i.id === movement.item_inventario_id);
                        const movementTypeColors: Record<string, string> = {
                          ENTRADA: "text-green-400",
                          SALIDA: "text-red-400",
                          AJUSTE: "text-yellow-400",
                          MERMA: "text-orange-400",
                          CADUCIDAD: "text-red-500",
                          ROBO: "text-red-600",
                          TRANSFERENCIA: "text-blue-400"
                        };
                        return (
                          <tr key={movement.id} className="hover:bg-muted/50 transition-colors border-b border-primary/10">
                            <td className="px-6 py-4 text-muted-foreground">
                              {new Date(movement.fecha_creacion).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 text-foreground font-medium">
                              {item?.nombre || "Item desconocido"}
                            </td>
                            <td className="px-6 py-4">
                              <span className={`font-medium ${movementTypeColors[movement.tipo_movimiento] || "text-foreground"}`}>
                                {movement.tipo_movimiento}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-foreground">
                              {movement.cantidad} {movement.unidad}
                            </td>
                            <td className="px-6 py-4 text-muted-foreground">
                              {movement.costo_unitario ? `Bs. ${movement.costo_unitario.toFixed(2)}` : "-"}
                            </td>
                            <td className="px-6 py-4 text-muted-foreground">
                              {movement.referencia_id ? `${movement.tipo_referencia} #${movement.referencia_id.slice(0, 8)}` : "-"}
                            </td>
                            <td className="px-6 py-4 text-muted-foreground text-sm">
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
