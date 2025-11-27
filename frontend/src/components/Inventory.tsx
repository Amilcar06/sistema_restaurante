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
import { inventoryApi, enumsApi, businessLocationsApi, suppliersApi, inventoryMovementsApi, type InventoryItem as ApiInventoryItem, type BusinessLocation, type Supplier, type InventoryMovement } from "../services/api";
import { toast } from "sonner";

interface InventoryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  min_stock: number;
  cost_per_unit: number;
  supplier?: string;
  last_updated: string;
}

export function Inventory() {
  const [searchTerm, setSearchTerm] = useState("");
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    quantity: 0,
    unit: "kg",
    min_stock: 0,
    max_stock: undefined as number | undefined,
    cost_per_unit: 0,
    supplier: "",
    supplier_id: undefined as string | undefined,
    location_id: "",
    expiry_date: undefined as string | undefined,
    barcode: ""
  });
  const [enums, setEnums] = useState<{
    categories: string[];
    units: string[];
  }>({
    categories: [],
    units: []
  });
  const [locations, setLocations] = useState<BusinessLocation[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [selectedLocationId, setSelectedLocationId] = useState<string>("");
  const [movements, setMovements] = useState<InventoryMovement[]>([]);
  const [loadingMovements, setLoadingMovements] = useState(false);
  const [selectedItemForHistory, setSelectedItemForHistory] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const loadMovements = async (itemId: string | null = null) => {
    try {
      setLoadingMovements(true);
      const params: any = {};
      if (itemId) params.inventory_item_id = itemId;
      if (selectedLocationId) params.location_id = selectedLocationId;

      const data = await inventoryMovementsApi.getAll(params);
      setMovements(data);
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
    loadLocations();
    loadSuppliers();
  }, []);

  const loadLocations = async () => {
    try {
      const data = await businessLocationsApi.getAll();
      setLocations(data);
      if (data.length > 0 && !selectedLocationId) {
        const mainLocation = data.find(loc => loc.is_main) || data[0];
        setSelectedLocationId(mainLocation.id);
      }
    } catch (error) {
      console.error("Error loading locations:", error);
    }
  };

  const loadSuppliers = async () => {
    try {
      const data = await suppliersApi.getAll();
      setSuppliers(data);
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
      const data = await inventoryApi.getAll();
      // Map API response to component format
      const mappedItems = data.map(item => ({
        id: item.id,
        name: item.name,
        category: item.category,
        quantity: item.quantity,
        unit: item.unit,
        min_stock: item.min_stock,
        cost_per_unit: item.cost_per_unit,
        supplier: item.supplier || "",
        last_updated: item.last_updated
      }));
      setItems(mappedItems);
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
      // Prepare data for API
      const submitData: any = {
        name: formData.name,
        category: formData.category,
        quantity: formData.quantity,
        unit: formData.unit,
        min_stock: formData.min_stock,
        cost_per_unit: formData.cost_per_unit,
        location_id: formData.location_id || selectedLocationId,
      };

      // Add optional fields if they have values
      if (formData.max_stock !== undefined && formData.max_stock > 0) {
        submitData.max_stock = formData.max_stock;
      }
      if (formData.supplier_id) {
        submitData.supplier_id = formData.supplier_id;
      }
      if (formData.supplier) {
        submitData.supplier = formData.supplier;
      }
      if (formData.expiry_date) {
        submitData.expiry_date = formData.expiry_date;
      }
      if (formData.barcode) {
        submitData.barcode = formData.barcode;
      }

      if (editingItem) {
        // Update existing item
        await inventoryApi.update(editingItem.id, submitData);
        toast.success("Insumo actualizado correctamente");
      } else {
        // Create new item
        await inventoryApi.create(submitData);
        toast.success("Insumo creado correctamente");
      }
      setIsDialogOpen(false);
      resetForm();
      loadItems();
    } catch (error: any) {
      console.error("Error saving item:", error);
      const errorMessage = error?.message || error?.response?.data?.detail || "Error al guardar el insumo";
      toast.error(errorMessage);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar este insumo?")) return;

    try {
      await inventoryApi.delete(id);
      toast.success("Insumo eliminado correctamente");
      loadItems();
    } catch (error) {
      console.error("Error deleting item:", error);
      toast.error("Error al eliminar el insumo");
    }
  };

  const handleEdit = async (item: InventoryItem) => {
    setEditingItem(item);
    // Load full item data from API to get all fields
    try {
      const fullItem = await inventoryApi.getById(item.id);
      setFormData({
        name: fullItem.name,
        category: fullItem.category,
        quantity: fullItem.quantity,
        unit: fullItem.unit,
        min_stock: fullItem.min_stock,
        max_stock: fullItem.max_stock,
        cost_per_unit: fullItem.cost_per_unit,
        supplier: fullItem.supplier || "",
        supplier_id: fullItem.supplier_id,
        location_id: fullItem.location_id,
        expiry_date: fullItem.expiry_date ? new Date(fullItem.expiry_date).toISOString().split('T')[0] : undefined,
        barcode: fullItem.barcode || ""
      });
    } catch (error) {
      console.error("Error loading item details:", error);
      // Fallback to basic data
      setFormData({
        name: item.name,
        category: item.category,
        quantity: item.quantity,
        unit: item.unit,
        min_stock: item.min_stock,
        max_stock: undefined,
        cost_per_unit: item.cost_per_unit,
        supplier: item.supplier || "",
        supplier_id: undefined,
        location_id: "",
        expiry_date: undefined,
        barcode: ""
      });
    }
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      category: "",
      quantity: 0,
      unit: "kg",
      min_stock: 0,
      max_stock: undefined,
      cost_per_unit: 0,
      supplier: "",
      supplier_id: undefined,
      location_id: selectedLocationId || "",
      expiry_date: undefined,
      barcode: ""
    });
    setEditingItem(null);
  };

  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedItems = filteredItems.slice(startIndex, endIndex);

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const getStockStatus = (item: InventoryItem) => {
    const percentage = (item.quantity / item.min_stock) * 100;
    if (percentage <= 100) return { status: "critical", color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20" };
    if (percentage <= 150) return { status: "low", color: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/20" };
    return { status: "good", color: "text-[#FF6B35]", bg: "bg-[#FF6B35]/10", border: "border-[#FF6B35]/20" };
  };

  const criticalItems = items.filter(item => item.quantity <= item.min_stock).length;
  const totalValue = items.reduce((sum, item) => sum + (item.quantity * item.cost_per_unit), 0);

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

      {/* Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => {
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
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label className="text-white/80">Nombre del Insumo</Label>
              <Input
                className="bg-white/5 border-[#FF6B35]/20 text-white"
                placeholder="Ej: Tomate"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div>
              <Label className="text-white/80">Categoría</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
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
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: parseFloat(e.target.value) || 0 })}
                  required
                />
              </div>
              <div>
                <Label className="text-white/80">Unidad</Label>
                <Select
                  value={formData.unit}
                  onValueChange={(value) => setFormData({ ...formData, unit: value })}
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
                  value={formData.min_stock}
                  onChange={(e) => setFormData({ ...formData, min_stock: parseFloat(e.target.value) || 0 })}
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
                  value={formData.cost_per_unit}
                  onChange={(e) => setFormData({ ...formData, cost_per_unit: parseFloat(e.target.value) || 0 })}
                  required
                />
              </div>
            </div>
            <div>
              <Label className="text-white/80">Sucursal *</Label>
              <Select
                value={formData.location_id || selectedLocationId}
                onValueChange={(value) => setFormData({ ...formData, location_id: value })}
                required
              >
                <SelectTrigger className="bg-white/5 border-[#FF6B35]/20 text-white">
                  <SelectValue placeholder="Selecciona una sucursal" />
                </SelectTrigger>
                <SelectContent className="bg-[#020617] border-[#FF6B35]/20">
                  {locations.map((loc) => (
                    <SelectItem key={loc.id} value={loc.id} className="text-white focus:bg-[#FF6B35]/20">
                      {loc.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-white/80">Proveedor</Label>
              <Select
                value={formData.supplier_id || "none"}
                onValueChange={(value) => setFormData({ ...formData, supplier_id: value === "none" ? undefined : value })}
              >
                <SelectTrigger className="bg-white/5 border-[#FF6B35]/20 text-white">
                  <SelectValue placeholder="Selecciona un proveedor" />
                </SelectTrigger>
                <SelectContent className="bg-[#020617] border-[#FF6B35]/20">
                  <SelectItem value="none" className="text-white/60 focus:bg-[#FF6B35]/20">
                    (Ninguno)
                  </SelectItem>
                  {suppliers.map((sup) => (
                    <SelectItem key={sup.id} value={sup.id} className="text-white focus:bg-[#FF6B35]/20">
                      {sup.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-white/80">Proveedor (texto libre)</Label>
              <Input
                className="bg-white/5 border-[#FF6B35]/20 text-white"
                placeholder="Nombre del proveedor (si no está en la lista)"
                value={formData.supplier}
                onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-white/80">Stock Máximo</Label>
                <Input
                  type="number"
                  step="0.01"
                  className="bg-white/5 border-[#FF6B35]/20 text-white"
                  placeholder="Opcional"
                  value={formData.max_stock || ""}
                  onChange={(e) => setFormData({ ...formData, max_stock: e.target.value ? parseFloat(e.target.value) : undefined })}
                />
              </div>
              <div>
                <Label className="text-white/80">Fecha de Caducidad</Label>
                <Input
                  type="date"
                  className="bg-white/5 border-[#FF6B35]/20 text-white"
                  value={formData.expiry_date || ""}
                  onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value || undefined })}
                />
              </div>
            </div>
            <div>
              <Label className="text-white/80">Código de Barras</Label>
              <Input
                className="bg-white/5 border-[#FF6B35]/20 text-white"
                placeholder="Código de barras (opcional)"
                value={formData.barcode}
                onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
              />
            </div>
            <Button type="submit" className="w-full bg-[#FF6B35] hover:bg-[#FF6B35]/90 text-white">
              {editingItem ? "Actualizar Insumo" : "Guardar Insumo"}
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
                      return (
                        <tr key={item.id} className="hover:bg-white/10 transition-colors border-b border-[#FF6B35]/10">
                          <td className="px-6 py-4">
                            <div className="text-white font-medium">{item.name}</div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="px-3 py-1 bg-white/10 rounded-full text-white/80 text-sm font-medium">{item.category}</span>
                          </td>
                          <td className="px-6 py-4 text-white font-medium">
                            {item.quantity} {item.unit}
                          </td>
                          <td className="px-6 py-4 text-white/70">
                            {item.min_stock} {item.unit}
                          </td>
                          <td className="px-6 py-4 text-white font-semibold">
                            Bs. {item.cost_per_unit.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 text-white/70">
                            {item.supplier || "-"}
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
                  onValueChange={(value) => {
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
                        {item.name}
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
                    {movements.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-4 text-center text-white/60">
                          No se encontraron movimientos.
                        </td>
                      </tr>
                    ) : (
                      movements.map((movement) => {
                        const item = items.find(i => i.id === movement.inventory_item_id);
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
                          <tr key={movement.id} className="border-b border-[#FF6B35]/10 last:border-b-0">
                            <td className="px-6 py-4 text-white/80">
                              {new Date(movement.created_at).toLocaleString('es-BO')}
                            </td>
                            <td className="px-6 py-4 text-white">{item?.name || "N/A"}</td>
                            <td className="px-6 py-4">
                              <span className={`${movementTypeColors[movement.movement_type] || "text-white/80"}`}>
                                {movement.movement_type}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-white">
                              {movement.quantity} {movement.unit}
                            </td>
                            <td className="px-6 py-4 text-white/80">
                              {movement.cost_per_unit ? `Bs. ${movement.cost_per_unit.toFixed(2)}` : "N/A"}
                            </td>
                            <td className="px-6 py-4 text-white/60">
                              {movement.reference_type && movement.reference_id ? (
                                <span className="text-xs">{movement.reference_type}: {movement.reference_id.substring(0, 8)}...</span>
                              ) : "-"}
                            </td>
                            <td className="px-6 py-4 text-white/60">
                              {movement.notes || "-"}
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
