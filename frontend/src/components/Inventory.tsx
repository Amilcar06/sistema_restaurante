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
    if (percentage <= 100) return { status: "critical", color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20" };
    if (percentage <= 150) return { status: "low", color: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/20" };
    return { status: "good", color: "text-[#FF6B35]", bg: "bg-[#FF6B35]/10", border: "border-[#FF6B35]/20" };
  };

  const criticalItems = items.filter(item => item.cantidad <= item.stock_minimo).length;
  const totalValue = items.reduce((sum, item) => sum + (item.cantidad * item.costo_unitario), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-[#FF6B35]" />
      </div>
    );
  }

  return (
    <div className="space-y-8 w-full relative">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-white mb-3 text-3xl font-bold">Inventario</h1>
          <p className="text-white/60 text-base">Gestiona todos los insumos de tu negocio</p>
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            className="bg-white/10 hover:bg-white/20 text-white border border-white/10"
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
            className="bg-[#FF6B35] hover:bg-[#FF6B35]/90 text-white shadow-lg hover:shadow-[#FF6B35]/50 transition-all duration-300"
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
        <DialogContent className="bg-[#020617] border-[#FF6B35]/20">
          <DialogHeader>
            <DialogTitle className="text-white">
              {editingItem ? "Editar Insumo" : "Agregar Nuevo Insumo"}
            </DialogTitle>
            <DialogDescription className="text-white/60">
              {editingItem ? "Modifica los datos del insumo" : "Completa los datos para agregar un nuevo insumo al inventario"}
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto px-1 pr-2 pb-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label className="text-white/80">Nombre del Insumo</Label>
                <Input
                  className="bg-white/5 border-[#FF6B35]/20 text-white"
                  placeholder="Ej: Tomate"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label className="text-white/80">Categoría</Label>
                <Select
                  value={formData.categoria}
                  onValueChange={(value: string) => setFormData({ ...formData, categoria: value })}
                  required
                >
                  <SelectTrigger className="bg-white/5 border-[#FF6B35]/20 text-white">
                    <SelectValue placeholder="Selecciona una categoría" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#020617] border-[#FF6B35]/20">
                    {enums.categories.map((cat) => (
                      <SelectItem key={cat} value={cat} className="text-white focus:bg-[#FF6B35]/20">
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-white/80">Cantidad</Label>
                  <Input
                    type="number"
                    step="0.01"
                    className="bg-white/5 border-[#FF6B35]/20 text-white"
                    placeholder="0"
                    value={formData.cantidad}
                    onChange={(e) => setFormData({ ...formData, cantidad: parseFloat(e.target.value) || 0 })}
                    required
                  />
                </div>
                <div>
                  <Label className="text-white/80">Unidad</Label>
                  <Select
                    value={formData.unidad}
                    onValueChange={(value: string) => setFormData({ ...formData, unidad: value })}
                    required
                  >
                    <SelectTrigger className="bg-white/5 border-[#FF6B35]/20 text-white">
                      <SelectValue placeholder="Selecciona una unidad" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#020617] border-[#FF6B35]/20">
                      {enums.units.map((unit) => (
                        <SelectItem key={unit} value={unit} className="text-white focus:bg-[#FF6B35]/20">
                          {unit}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-white/80">Stock Mínimo</Label>
                  <Input
                    type="number"
                    step="0.01"
                    className="bg-white/5 border-[#FF6B35]/20 text-white"
                    placeholder="0"
                    value={formData.stock_minimo}
                    onChange={(e) => setFormData({ ...formData, stock_minimo: parseFloat(e.target.value) || 0 })}
                    required
                  />
                </div>
                <div>
                  <Label className="text-white/80">Costo por Unidad (Bs.)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    className="bg-white/5 border-[#FF6B35]/20 text-white"
                    placeholder="0.00"
                    value={formData.costo_unitario}
                    onChange={(e) => setFormData({ ...formData, costo_unitario: parseFloat(e.target.value) || 0 })}
                    required
                  />
                </div>
              </div>
              <div>
                <Label className="text-white/80">Sucursal *</Label>
                <Select
                  value={formData.sucursal_id || selectedSucursalId}
                  onValueChange={(value: string) => setFormData({ ...formData, sucursal_id: value })}
                  required
                >
                  <SelectTrigger className="bg-white/5 border-[#FF6B35]/20 text-white">
                    <SelectValue placeholder="Selecciona una sucursal" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#020617] border-[#FF6B35]/20">
                    {sucursales.map((loc) => (
                      <SelectItem key={loc.id} value={loc.id} className="text-white focus:bg-[#FF6B35]/20">
                        {loc.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-white/80">Proveedor</Label>
                <Select
                  value={formData.proveedor_id || "none"}
                  onValueChange={(value: string) => setFormData({ ...formData, proveedor_id: value === "none" ? undefined : value })}
                >
                  <SelectTrigger className="bg-white/5 border-[#FF6B35]/20 text-white">
                    <SelectValue placeholder="Selecciona un proveedor" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#020617] border-[#FF6B35]/20">
                    <SelectItem value="none" className="text-white/60 focus:bg-[#FF6B35]/20">
                      (Ninguno)
                    </SelectItem>
                    {proveedores.map((sup) => (
                      <SelectItem key={sup.id} value={sup.id} className="text-white focus:bg-[#FF6B35]/20">
                        {sup.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-white/80">Stock Máximo</Label>
                  <Input
                    type="number"
                    step="0.01"
                    className="bg-white/5 border-[#FF6B35]/20 text-white"
                    placeholder="Opcional"
                    value={formData.stock_maximo || ""}
                    onChange={(e) => setFormData({ ...formData, stock_maximo: e.target.value ? parseFloat(e.target.value) : undefined })}
                  />
                </div>
                <div>
                  <Label className="text-white/80">Fecha de Caducidad</Label>
                  <Input
                    type="date"
                    className="bg-white/5 border-[#FF6B35]/20 text-white"
                    value={formData.fecha_vencimiento || ""}
                    onChange={(e) => setFormData({ ...formData, fecha_vencimiento: e.target.value || undefined })}
                  />
                </div>
              </div>
              <div>
                <Label className="text-white/80">Código de Barras</Label>
                <Input
                  className="bg-white/5 border-[#FF6B35]/20 text-white"
                  placeholder="Código de barras (opcional)"
                  value={formData.codigo_barras}
                  onChange={(e) => setFormData({ ...formData, codigo_barras: e.target.value })}
                />
              </div>
              <Button type="submit" className="w-full bg-[#FF6B35] hover:bg-[#FF6B35]/90 text-white">
                {editingItem ? "Actualizar Insumo" : "Guardar Insumo"}
              </Button>
            </form>
          </div>
        </DialogContent>
      </Dialog>

      {/* Cost History Dialog */}
      <Dialog open={isCostHistoryDialogOpen} onOpenChange={setIsCostHistoryDialogOpen}>
        <DialogContent className="bg-[#020617] border-[#FF6B35]/20">
          <DialogHeader>
            <DialogTitle className="text-white">Historial de Costos</DialogTitle>
            <DialogDescription className="text-white/60">
              Evolución del costo unitario para: <span className="text-white font-medium">{editingItem?.nombre}</span>
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            <div className="relative overflow-x-auto">
              <table className="w-full text-sm text-left text-white/60">
                <thead className="text-xs text-white/40 uppercase bg-white/5">
                  <tr>
                    <th className="px-4 py-2">Fecha</th>
                    <th className="px-4 py-2">Tipo</th>
                    <th className="px-4 py-2 text-right">Costo Unit.</th>
                  </tr>
                </thead>
                <tbody>
                  {costHistory.map((record, index) => (
                    <tr key={index} className="border-b border-white/5">
                      <td className="px-4 py-2">{new Date(record.fecha).toLocaleDateString()}</td>
                      <td className="px-4 py-2">{record.tipo}</td>
                      <td className="px-4 py-2 text-right font-medium text-white">Bs. {record.costo.toFixed(2)}</td>
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
        <DialogContent className="bg-[#020617] border-[#FF6B35]/20">
          <DialogHeader>
            <DialogTitle className="text-white">Registrar Movimiento Manual</DialogTitle>
            <DialogDescription className="text-white/60">
              Registra entradas, salidas, mermas o ajustes de inventario.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleMovementSubmit} className="space-y-4">
            <div>
              <Label className="text-white/80">Insumo</Label>
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
                <SelectTrigger className="bg-white/5 border-[#FF6B35]/20 text-white">
                  <SelectValue placeholder="Selecciona un insumo" />
                </SelectTrigger>
                <SelectContent className="bg-[#020617] border-[#FF6B35]/20">
                  {items.map((item) => (
                    <SelectItem key={item.id} value={item.id} className="text-white focus:bg-[#FF6B35]/20">
                      {item.nombre} ({item.cantidad} {item.unidad})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-white/80">Tipo de Movimiento</Label>
              <Select
                value={movementFormData.tipo_movimiento}
                onValueChange={(value: string) => setMovementFormData({ ...movementFormData, tipo_movimiento: value })}
                required
              >
                <SelectTrigger className="bg-white/5 border-[#FF6B35]/20 text-white">
                  <SelectValue placeholder="Selecciona el tipo" />
                </SelectTrigger>
                <SelectContent className="bg-[#020617] border-[#FF6B35]/20">
                  <SelectItem value="ENTRADA" className="text-white focus:bg-[#FF6B35]/20">ENTRADA (Compra/Reposición)</SelectItem>
                  <SelectItem value="SALIDA" className="text-white focus:bg-[#FF6B35]/20">SALIDA (Uso interno)</SelectItem>
                  <SelectItem value="MERMA" className="text-white focus:bg-[#FF6B35]/20">MERMA (Desperdicio/Daño)</SelectItem>
                  <SelectItem value="AJUSTE" className="text-white focus:bg-[#FF6B35]/20">AJUSTE (Corrección de stock)</SelectItem>
                  <SelectItem value="TRANSFERENCIA" className="text-white focus:bg-[#FF6B35]/20">TRANSFERENCIA (Entre sucursales)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-white/80">Cantidad</Label>
                <Input
                  type="number"
                  step="0.01"
                  className="bg-white/5 border-[#FF6B35]/20 text-white"
                  placeholder="0"
                  value={movementFormData.cantidad}
                  onChange={(e) => setMovementFormData({ ...movementFormData, cantidad: parseFloat(e.target.value) || 0 })}
                  required
                />
              </div>
              <div>
                <Label className="text-white/80">Unidad</Label>
                <Input
                  className="bg-white/5 border-[#FF6B35]/20 text-white"
                  value={movementFormData.unidad}
                  readOnly
                />
              </div>
            </div>
            {movementFormData.tipo_movimiento === "ENTRADA" && (
              <div>
                <Label className="text-white/80">Costo Unitario (Bs.)</Label>
                <Input
                  type="number"
                  step="0.01"
                  className="bg-white/5 border-[#FF6B35]/20 text-white"
                  placeholder="Opcional"
                  value={movementFormData.costo_unitario}
                  onChange={(e) => setMovementFormData({ ...movementFormData, costo_unitario: parseFloat(e.target.value) || 0 })}
                />
              </div>
            )}
            {movementFormData.tipo_movimiento === "TRANSFERENCIA" && (
              <div>
                <Label className="text-white/80">Sucursal Destino</Label>
                <Select
                  value={movementFormData.sucursal_destino_id}
                  onValueChange={(value: string) => setMovementFormData({ ...movementFormData, sucursal_destino_id: value })}
                  required
                >
                  <SelectTrigger className="bg-white/5 border-[#FF6B35]/20 text-white">
                    <SelectValue placeholder="Selecciona sucursal destino" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#020617] border-[#FF6B35]/20">
                    {sucursales.filter(s => s.id !== selectedSucursalId).map((loc) => (
                      <SelectItem key={loc.id} value={loc.id} className="text-white focus:bg-[#FF6B35]/20">
                        {loc.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div>
              <Label className="text-white/80">Notas / Motivo</Label>
              <Input
                className="bg-white/5 border-[#FF6B35]/20 text-white"
                placeholder="Explica el motivo del movimiento"
                value={movementFormData.notas}
                onChange={(e) => setMovementFormData({ ...movementFormData, notas: e.target.value })}
              />
            </div>
            <Button type="submit" className="w-full bg-[#FF6B35] hover:bg-[#FF6B35]/90 text-white">
              Registrar Movimiento
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Tabs for Inventory and History */}
      <Tabs defaultValue="inventory" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-white/5 border-[#FF6B35]/20 p-1 h-auto mb-6">
          <TabsTrigger
            value="inventory"
            className="text-white/60 data-[state=active]:text-[#FF6B35] data-[state=active]:bg-[#FF6B35]/10 py-2"
          >
            <Package className="w-4 h-4 mr-2" />
            Inventario
          </TabsTrigger>
          <TabsTrigger
            value="history"
            className="text-white/60 data-[state=active]:text-[#FF6B35] data-[state=active]:bg-[#FF6B35]/10 py-2"
          >
            <History className="w-4 h-4 mr-2" />
            Historial de Movimientos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="inventory" className="space-y-8">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="bg-white/5 border-[#FF6B35]/20 p-6 hover:bg-white/10 hover:border-[#FF6B35]/40 transition-all duration-300">
              <div className="flex items-center gap-4">
                <div className="bg-[#FF6B35]/10 p-3 rounded-lg hover:bg-[#FF6B35]/20 transition-colors">
                  <Package className="w-6 h-6 text-[#FF6B35]" />
                </div>
                <div>
                  <div className="text-white/70 mb-1 text-sm font-medium">Total de Insumos</div>
                  <div className="text-white text-2xl font-bold">{items.length} productos</div>
                </div>
              </div>
            </Card>
            <Card className="bg-white/5 border-red-500/20 p-6 hover:bg-white/10 hover:border-red-500/40 transition-all duration-300">
              <div className="flex items-center gap-4">
                <div className="bg-red-500/10 p-3 rounded-lg hover:bg-red-500/20 transition-colors">
                  <AlertTriangle className="w-6 h-6 text-red-400" />
                </div>
                <div>
                  <div className="text-white/70 mb-1 text-sm font-medium">Stock Crítico</div>
                  <div className="text-white text-2xl font-bold">{criticalItems} items</div>
                </div>
              </div>
            </Card>
            <Card className="bg-white/5 border-[#FF6B35]/20 p-6 hover:bg-white/10 hover:border-[#FF6B35]/40 transition-all duration-300">
              <div className="flex items-center gap-4">
                <div className="bg-[#FF6B35]/10 p-3 rounded-lg hover:bg-[#FF6B35]/20 transition-colors">
                  <CheckCircle2 className="w-6 h-6 text-[#FF6B35]" />
                </div>
                <div>
                  <div className="text-white/70 mb-1 text-sm font-medium">Valor Total</div>
                  <div className="text-white text-2xl font-bold">Bs. {totalValue.toFixed(2)}</div>
                </div>
              </div>
            </Card>
          </div>

          {/* Search */}
          <Card className="bg-white/5 border-[#FF6B35]/20 p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
              <Input
                className="pl-10 bg-white/5 border-[#FF6B35]/20 text-white"
                placeholder="Buscar insumos por nombre o categoría..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </Card>

          {/* Inventory Table - Desktop */}
          <Card className="bg-white/5 border-[#FF6B35]/20 overflow-hidden hidden md:block">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/5 border-b border-[#FF6B35]/20">
                  <tr>
                    <th className="px-6 py-4 text-left text-white/80">Insumo</th>
                    <th className="px-6 py-4 text-left text-white/80">Categoría</th>
                    <th className="px-6 py-4 text-left text-white/80">Cantidad</th>
                    <th className="px-6 py-4 text-left text-white/80">Stock Mínimo</th>
                    <th className="px-6 py-4 text-left text-white/80">Costo/Unidad</th>
                    <th className="px-6 py-4 text-left text-white/80">Proveedor</th>
                    <th className="px-6 py-4 text-left text-white/80">Estado</th>
                    <th className="px-6 py-4 text-left text-white/80">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#FF6B35]/10">
                  {filteredItems.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center gap-4">
                          <Package className="w-16 h-16 text-white/30" />
                          <p className="text-white/70 text-lg font-medium">
                            {searchTerm ? "No se encontraron insumos" : "No hay insumos. Agrega tu primer insumo."}
                          </p>
                          {!searchTerm && (
                            <Button
                              className="bg-[#FF6B35] hover:bg-[#FF6B35]/90 text-white mt-2"
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
                        <tr key={item.id} className="hover:bg-white/10 transition-colors border-b border-[#FF6B35]/10">
                          <td className="px-6 py-4">
                            <div className="text-white font-medium">{item.nombre}</div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="px-3 py-1 bg-white/10 rounded-full text-white/80 text-sm font-medium">{item.categoria}</span>
                          </td>
                          <td className="px-6 py-4 text-white font-medium">
                            {item.cantidad} {item.unidad}
                          </td>
                          <td className="px-6 py-4 text-white/70">
                            {item.stock_minimo} {item.unidad}
                          </td>
                          <td className="px-6 py-4 text-white font-semibold">
                            Bs. {item.costo_unitario.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 text-white/70">
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
                                className="text-white hover:bg-blue-500/20 hover:text-blue-400 transition-all"
                                title="Ver Historial de Costos"
                              >
                                <History className="w-4 h-4" />
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEdit(item)}
                                className="text-white hover:bg-[#FF6B35]/20 hover:text-[#FF6B35] transition-all"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(item.id)}
                                className="text-white hover:bg-red-500/20 hover:text-red-400 transition-all"
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
                        className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer text-white hover:text-[#FF6B35]"}
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
                          className="cursor-pointer text-white hover:text-[#FF6B35] data-[active=true]:bg-[#FF6B35]/20 data-[active=true]:text-[#FF6B35]"
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
                        className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer text-white hover:text-[#FF6B35]"}
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
          <Card className="bg-white/5 border-[#FF6B35]/20 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-white text-lg font-semibold">Historial de Movimientos</h3>
              <div className="flex gap-2">
                <Select
                  value={selectedItemForHistory || "all"}
                  onValueChange={(value: string) => {
                    setSelectedItemForHistory(value === "all" ? null : value);
                    loadMovements(value === "all" ? null : value);
                  }}
                >
                  <SelectTrigger className="bg-white/5 border-[#FF6B35]/20 text-white w-64">
                    <SelectValue placeholder="Filtrar por item" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#020617] border-[#FF6B35]/20">
                    <SelectItem value="all" className="text-white focus:bg-[#FF6B35]/20">
                      Todos los items
                    </SelectItem>
                    {items.map((item) => (
                      <SelectItem key={item.id} value={item.id} className="text-white focus:bg-[#FF6B35]/20">
                        {item.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {loadingMovements ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-[#FF6B35]" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-white/5 border-b border-[#FF6B35]/20">
                    <tr>
                      <th className="px-6 py-4 text-left text-white/80">Fecha</th>
                      <th className="px-6 py-4 text-left text-white/80">Item</th>
                      <th className="px-6 py-4 text-left text-white/80">Tipo</th>
                      <th className="px-6 py-4 text-left text-white/80">Cantidad</th>
                      <th className="px-6 py-4 text-left text-white/80">Costo Unit.</th>
                      <th className="px-6 py-4 text-left text-white/80">Referencia</th>
                      <th className="px-6 py-4 text-left text-white/80">Notas</th>
                    </tr>
                  </thead>
                  <tbody>
                    {movimientos.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-4 text-center text-white/60">
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
                          <tr key={movement.id} className="hover:bg-white/10 transition-colors border-b border-[#FF6B35]/10">
                            <td className="px-6 py-4 text-white/70">
                              {new Date(movement.fecha_creacion).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 text-white font-medium">
                              {item?.nombre || "Item desconocido"}
                            </td>
                            <td className="px-6 py-4">
                              <span className={`font-medium ${movementTypeColors[movement.tipo_movimiento] || "text-white"}`}>
                                {movement.tipo_movimiento}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-white">
                              {movement.cantidad} {movement.unidad}
                            </td>
                            <td className="px-6 py-4 text-white/70">
                              {movement.costo_unitario ? `Bs. ${movement.costo_unitario.toFixed(2)}` : "-"}
                            </td>
                            <td className="px-6 py-4 text-white/70">
                              {movement.referencia_id ? `${movement.tipo_referencia} #${movement.referencia_id.slice(0, 8)}` : "-"}
                            </td>
                            <td className="px-6 py-4 text-white/60 text-sm">
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
