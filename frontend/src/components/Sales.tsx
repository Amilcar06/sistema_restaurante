import { useState, useEffect } from "react";
import { Plus, Calendar, DollarSign, TrendingUp, Package, Loader2, Trash2 } from "lucide-react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "./ui/dialog";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "./ui/pagination";
import {
  ventasApi,
  enumsApi,
  sucursalesApi,
  recetasApi,
  usuariosApi,
  promocionesApi
} from "../services/api";
import {
  Venta,
  Sucursal,
  Receta,
  Usuario,
  Promocion
} from "../types";
import { toast } from "sonner";

interface VentaFormItem {
  receta_id?: string;
  nombre_item: string;
  cantidad: number;
  precio_unitario: number;
}

export function Sales() {
  const [sales, setSales] = useState<Venta[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [formData, setFormData] = useState({
    sucursal_id: "",
    numero_mesa: "",
    mesero_id: "",
    tipo_venta: "LOCAL" as "LOCAL" | "DELIVERY" | "TAKEAWAY",
    servicio_delivery: "",
    nombre_cliente: "",
    telefono_cliente: "",
    items: [] as VentaFormItem[],
    metodo_pago: "EFECTIVO" as "EFECTIVO" | "QR" | "TARJETA",
    notas: "",
    monto_descuento: 0
  });

  const [paymentMethods, setPaymentMethods] = useState<string[]>([]);
  const [sucursales, setSucursales] = useState<Sucursal[]>([]);
  const [recipes, setRecipes] = useState<Receta[]>([]);
  const [users, setUsers] = useState<Usuario[]>([]);
  const [promotions, setPromotions] = useState<Promocion[]>([]);
  const [selectedPromotionId, setSelectedPromotionId] = useState<string>("none");

  useEffect(() => {
    loadSales();
    loadPaymentMethods();
    loadSucursales();
    loadRecipes();
    loadUsers();
    loadPromotions();
  }, []);

  const loadRecipes = async () => {
    try {
      const data = await recetasApi.obtenerTodos();
      setRecipes(data.filter(r => r.disponible));
    } catch (error) {
      console.error("Error loading recipes:", error);
    }
  };

  const loadUsers = async () => {
    try {
      const data = await usuariosApi.obtenerTodos();
      setUsers(data.filter(u => u.activo));
    } catch (error) {
      console.error("Error loading users:", error);
    }
  };

  const loadPromotions = async () => {
    try {
      const data = await promocionesApi.obtenerTodos();
      setPromotions(data.filter(p => p.activa));
    } catch (error) {
      console.error("Error loading promotions:", error);
    }
  };

  const loadSucursales = async () => {
    try {
      const data = await sucursalesApi.obtenerTodos();
      setSucursales(data);
      if (data.length > 0 && !formData.sucursal_id) {
        const mainLocation = data.find(loc => loc.es_principal) || data[0];
        setFormData(prev => ({ ...prev, sucursal_id: mainLocation.id }));
      }
    } catch (error) {
      console.error("Error loading locations:", error);
    }
  };

  const loadPaymentMethods = async () => {
    try {
      const res = await enumsApi.getPaymentMethods();
      setPaymentMethods(res.methods);
      if (res.methods.length > 0 && !res.methods.includes(formData.metodo_pago)) {
        setFormData(prev => ({ ...prev, metodo_pago: res.methods[0] as any }));
      }
    } catch (error) {
      console.error("Error loading payment methods:", error);
    }
  };

  const loadSales = async () => {
    try {
      setLoading(true);
      const data = await ventasApi.obtenerTodos();
      setSales(data);
    } catch (error) {
      console.error("Error loading sales:", error);
      toast.error("Error al cargar las ventas");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!formData.sucursal_id) {
        toast.error("Debes seleccionar una sucursal");
        return;
      }

      if (formData.items.length === 0) {
        toast.error("Debes agregar al menos un item a la venta");
        return;
      }

      const subtotal = formData.items.reduce((sum, item) => sum + (item.cantidad * item.precio_unitario), 0);
      const impuesto = subtotal * 0.13; // 13% IVA
      const total = subtotal - formData.monto_descuento + impuesto;

      const saleData: any = {
        sucursal_id: formData.sucursal_id,
        tipo_venta: formData.tipo_venta,
        subtotal,
        monto_descuento: formData.monto_descuento,
        impuesto,
        total,
        metodo_pago: formData.metodo_pago,
        items: formData.items.map(item => ({
          nombre_item: item.nombre_item,
          cantidad: item.cantidad,
          precio_unitario: item.precio_unitario,
          total: item.cantidad * item.precio_unitario
        }))
      };

      if (formData.numero_mesa) saleData.numero_mesa = formData.numero_mesa;
      if (formData.mesero_id) saleData.mesero_id = formData.mesero_id;
      if (formData.servicio_delivery) saleData.servicio_delivery = formData.servicio_delivery;
      if (formData.nombre_cliente) saleData.nombre_cliente = formData.nombre_cliente;
      if (formData.telefono_cliente) saleData.telefono_cliente = formData.telefono_cliente;
      if (formData.notas) saleData.notas = formData.notas;

      await ventasApi.crear(saleData);

      toast.success("Venta registrada correctamente");
      setIsDialogOpen(false);
      resetForm();
      loadSales();
    } catch (error: any) {
      console.error("Error creating sale:", error);
      let errorMessage = "Error al registrar la venta";
      if (error?.message) {
        errorMessage = error.message;
      } else if (error?.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      }
      toast.error(errorMessage);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar esta venta?")) return;

    try {
      await ventasApi.eliminar(id);
      toast.success("Venta eliminada correctamente");
      loadSales();
    } catch (error: any) {
      console.error("Error deleting sale:", error);
      const errorMessage = error?.response?.data?.detail || error?.message || "Error al eliminar la venta";
      toast.error(errorMessage);
    }
  };

  const resetForm = () => {
    const mainLocation = sucursales.find(loc => loc.es_principal) || sucursales[0];
    setFormData({
      sucursal_id: mainLocation?.id || "",
      numero_mesa: "",
      mesero_id: "",
      tipo_venta: "LOCAL",
      servicio_delivery: "",
      nombre_cliente: "",
      telefono_cliente: "",
      items: [],
      metodo_pago: "EFECTIVO",
      notas: "",
      monto_descuento: 0
    });
    setSelectedPromotionId("none");
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { nombre_item: "", cantidad: 1, precio_unitario: 0, receta_id: undefined }]
    });
  };

  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...formData.items];
    (newItems[index] as any)[field] = value;

    if (field === "receta_id") {
      const recipe = recipes.find(r => r.id === value);
      if (recipe) {
        newItems[index].nombre_item = recipe.nombre;
        newItems[index].precio_unitario = recipe.precio;
      }
    }

    setFormData({ ...formData, items: newItems });
  };

  const removeItem = (index: number) => {
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index)
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-BO');
  };

  const applyPromotion = () => {
    if (selectedPromotionId === "none") {
      setFormData(prev => ({ ...prev, monto_descuento: 0 }));
      return;
    }
    const promo = promotions.find(p => p.id === selectedPromotionId);
    if (!promo) return;

    const subtotal = formData.items.reduce((sum, item) => sum + (item.cantidad * item.precio_unitario), 0);
    let discount = 0;

    if (promo.tipo_descuento === "porcentaje") {
      discount = subtotal * (promo.valor_descuento / 100);
    } else if (promo.tipo_descuento === "monto_fijo") {
      discount = promo.valor_descuento;
    }

    if (promo.descuento_maximo && discount > promo.descuento_maximo) {
      discount = promo.descuento_maximo;
    }

    setFormData(prev => ({ ...prev, monto_descuento: discount }));
  };

  useEffect(() => {
    applyPromotion();
  }, [selectedPromotionId, formData.items]);

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit' });
  };

  // Filter today's sales
  const today = new Date().toDateString();
  const todaySales = sales.filter(sale => new Date(sale.fecha_creacion).toDateString() === today);
  const todayRevenue = todaySales.reduce((sum, sale) => sum + sale.total, 0);
  const totalItems = todaySales.reduce((sum, sale) => sum + sale.items.reduce((s, item) => s + item.cantidad, 0), 0);
  const avgTicket = todaySales.length > 0 ? todayRevenue / todaySales.length : 0;

  // Pagination logic
  const sortedSales = [...sales].sort((a, b) => new Date(b.fecha_creacion).getTime() - new Date(a.fecha_creacion).getTime());
  const totalPages = Math.ceil(sortedSales.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedSales = sortedSales.slice(startIndex, endIndex);

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
          <h1 className="text-white mb-3 text-3xl font-bold">Ventas</h1>
          <p className="text-white/60 text-base">Registra y analiza las ventas diarias</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open: boolean) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="bg-[#FF6B35] hover:bg-[#FF6B35]/90 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Nueva Venta
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-[#020617] border-[#FF6B35]/20 max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-white">Registrar Nueva Venta</DialogTitle>
              <DialogDescription className="text-white/60">
                Agrega los platos vendidos y selecciona el método de pago
              </DialogDescription>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto px-1 pr-2 pb-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-white/80">Sucursal *</Label>
                    <Select
                      value={formData.sucursal_id}
                      onValueChange={(value: string) => setFormData({ ...formData, sucursal_id: value })}
                      required
                    >
                      <SelectTrigger className="bg-white/5 border-[#FF6B35]/20 text-white">
                        <SelectValue placeholder="Selecciona sucursal" />
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
                    <Label className="text-white/80">Tipo de Venta</Label>
                    <Select
                      value={formData.tipo_venta}
                      onValueChange={(value: "LOCAL" | "DELIVERY" | "TAKEAWAY") => setFormData({ ...formData, tipo_venta: value })}
                    >
                      <SelectTrigger className="bg-white/5 border-[#FF6B35]/20 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#020617] border-[#FF6B35]/20">
                        <SelectItem value="LOCAL" className="text-white focus:bg-[#FF6B35]/20">Local</SelectItem>
                        <SelectItem value="DELIVERY" className="text-white focus:bg-[#FF6B35]/20">Delivery</SelectItem>
                        <SelectItem value="TAKEAWAY" className="text-white focus:bg-[#FF6B35]/20">Para Llevar</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                {formData.tipo_venta === "LOCAL" && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-white/80">Número de Mesa</Label>
                      <Input
                        className="bg-white/5 border-[#FF6B35]/20 text-white"
                        placeholder="Ej: 5"
                        value={formData.numero_mesa}
                        onChange={(e) => setFormData({ ...formData, numero_mesa: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label className="text-white/80">Mesero</Label>
                      <Select
                        value={formData.mesero_id}
                        onValueChange={(value: string) => setFormData({ ...formData, mesero_id: value })}
                      >
                        <SelectTrigger className="bg-white/5 border-[#FF6B35]/20 text-white">
                          <SelectValue placeholder="Selecciona mesero" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#020617] border-[#FF6B35]/20">
                          {users.map((user) => (
                            <SelectItem key={user.id} value={user.id} className="text-white focus:bg-[#FF6B35]/20">
                              {user.nombre_completo || user.nombre_usuario}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
                {formData.tipo_venta === "DELIVERY" && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-white/80">Servicio de Delivery</Label>
                      <Input
                        className="bg-white/5 border-[#FF6B35]/20 text-white"
                        placeholder="PedidosYa, Ahora, etc."
                        value={formData.servicio_delivery}
                        onChange={(e) => setFormData({ ...formData, servicio_delivery: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label className="text-white/80">Cliente</Label>
                      <Input
                        className="bg-white/5 border-[#FF6B35]/20 text-white"
                        placeholder="Nombre del cliente"
                        value={formData.nombre_cliente}
                        onChange={(e) => setFormData({ ...formData, nombre_cliente: e.target.value })}
                      />
                    </div>
                  </div>
                )}
                <div>
                  <Label className="text-white/80 mb-2 block">Platos</Label>
                  <div className="space-y-2">
                    {formData.items.map((item, index) => (
                      <div key={index} className="flex gap-2 items-center bg-white/5 p-2 rounded">
                        <div className="flex-1 min-w-[200px]">
                          <Select
                            value={item.receta_id || "custom"}
                            onValueChange={(value: string) => {
                              if (value === "custom") {
                                updateItem(index, "receta_id", undefined);
                                updateItem(index, "nombre_item", "");
                                updateItem(index, "precio_unitario", 0);
                              } else {
                                updateItem(index, "receta_id", value);
                              }
                            }}
                          >
                            <SelectTrigger className="bg-white/5 border-[#FF6B35]/20 text-white h-10 w-full">
                              <SelectValue placeholder="Selecciona plato" />
                            </SelectTrigger>
                            <SelectContent className="bg-[#020617] border-[#FF6B35]/20">
                              <SelectItem value="custom" className="text-white/60 focus:bg-[#FF6B35]/20">
                                (Item Manual)
                              </SelectItem>
                              {recipes.map((recipe) => (
                                <SelectItem key={recipe.id} value={recipe.id} className="text-white focus:bg-[#FF6B35]/20">
                                  {recipe.nombre}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        {!item.receta_id && (
                          <Input
                            className="bg-white/5 border-[#FF6B35]/20 text-white flex-1"
                            placeholder="Nombre del plato"
                            value={item.nombre_item}
                            onChange={(e) => updateItem(index, "nombre_item", e.target.value)}
                            required
                          />
                        )}
                        <Input
                          type="number"
                          className="bg-white/5 border-[#FF6B35]/20 text-white w-20"
                          placeholder="Cant."
                          value={item.cantidad}
                          onChange={(e) => updateItem(index, "cantidad", parseInt(e.target.value) || 1)}
                          required
                          min="1"
                        />
                        <Input
                          type="number"
                          step="0.01"
                          className="bg-white/5 border-[#FF6B35]/20 text-white w-24"
                          placeholder="Precio"
                          value={item.precio_unitario}
                          onChange={(e) => updateItem(index, "precio_unitario", parseFloat(e.target.value) || 0)}
                          required
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItem(index)}
                          className="text-red-400 hover:bg-red-500/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={addItem}
                      className="w-full border-[#FF6B35]/40 text-[#FF6B35] hover:bg-[#FF6B35]/20 hover:text-white hover:border-[#FF6B35] bg-transparent"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Agregar Plato
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-white/80">Promoción</Label>
                    <Select
                      value={selectedPromotionId}
                      onValueChange={setSelectedPromotionId}
                    >
                      <SelectTrigger className="bg-white/5 border-[#FF6B35]/20 text-white">
                        <SelectValue placeholder="Selecciona promoción" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#020617] border-[#FF6B35]/20">
                        <SelectItem value="none" className="text-white/60 focus:bg-[#FF6B35]/20">
                          (Sin promoción)
                        </SelectItem>
                        {promotions.map((promo) => (
                          <SelectItem key={promo.id} value={promo.id} className="text-white focus:bg-[#FF6B35]/20">
                            {promo.nombre} ({promo.tipo_descuento === "porcentaje" ? `${promo.valor_descuento}%` : `Bs. ${promo.valor_descuento}`})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-white/80">Descuento (Bs.)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      className="bg-white/5 border-[#FF6B35]/20 text-white"
                      placeholder="0.00"
                      value={formData.monto_descuento}
                      onChange={(e) => setFormData({ ...formData, monto_descuento: parseFloat(e.target.value) || 0 })}
                      min="0"
                      readOnly={selectedPromotionId !== "none"}
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-white/80">Método de Pago</Label>
                  <Select
                    value={formData.metodo_pago}
                    onValueChange={(value: "EFECTIVO" | "QR" | "TARJETA") =>
                      setFormData({ ...formData, metodo_pago: value })
                    }
                  >
                    <SelectTrigger className="bg-white/5 border-[#FF6B35]/20 text-white">
                      <SelectValue placeholder="Selecciona método de pago" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#020617] border-[#FF6B35]/20">
                      {paymentMethods.map((method) => (
                        <SelectItem
                          key={method}
                          value={method}
                          className="text-white focus:bg-[#FF6B35]/20"
                        >
                          {method === "EFECTIVO" ? "Efectivo" :
                            method === "QR" ? "QR" :
                              method === "TARJETA" ? "Tarjeta" : method}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-white/80">Notas</Label>
                  <Input
                    className="bg-white/5 border-[#FF6B35]/20 text-white"
                    placeholder="Notas adicionales (opcional)"
                    value={formData.notas}
                    onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
                  />
                </div>
                <div className="pt-4 border-t border-[#FF6B35]/20">
                  {(() => {
                    const subtotal = formData.items.reduce((sum, item) => sum + (item.cantidad * item.precio_unitario), 0);
                    const impuesto = subtotal * 0.13;
                    const total = subtotal - formData.monto_descuento + impuesto;
                    return (
                      <>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-white/60">Subtotal:</span>
                          <span className="text-white">
                            Bs. {subtotal.toFixed(2)}
                          </span>
                        </div>
                        {formData.monto_descuento > 0 && (
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-white/60">Descuento:</span>
                            <span className="text-red-400">
                              - Bs. {formData.monto_descuento.toFixed(2)}
                            </span>
                          </div>
                        )}
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-white/60">IVA (13%):</span>
                          <span className="text-white">
                            Bs. {impuesto.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between pt-2 border-t border-[#FF6B35]/20">
                          <span className="text-white font-semibold">Total:</span>
                          <span className="text-[#FF6B35] text-lg font-semibold">
                            Bs. {total.toFixed(2)}
                          </span>
                        </div>
                      </>
                    );
                  })()}
                </div>
                <Button
                  type="submit"
                  className="w-full bg-[#FF6B35] hover:bg-[#FF6B35]/90 text-white"
                  disabled={formData.items.length === 0}
                >
                  Registrar Venta
                </Button>
              </form>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-white/5 border-[#FF6B35]/20 p-6">
          <div className="flex items-center gap-4">
            <div className="bg-[#FF6B35]/10 p-3 rounded-lg">
              <Calendar className="w-6 h-6 text-[#FF6B35]" />
            </div>
            <div>
              <div className="text-white/60 mb-1">Ventas de Hoy</div>
              <div className="text-white">{todaySales.length} ventas</div>
            </div>
          </div>
        </Card>
        <Card className="bg-white/5 border-[#FF6B35]/20 p-6">
          <div className="flex items-center gap-4">
            <div className="bg-[#FF6B35]/10 p-3 rounded-lg">
              <DollarSign className="w-6 h-6 text-[#FF6B35]" />
            </div>
            <div>
              <div className="text-white/60 mb-1">Ingresos del Día</div>
              <div className="text-white">Bs. {todayRevenue.toFixed(2)}</div>
            </div>
          </div>
        </Card>
        <Card className="bg-white/5 border-[#FF6B35]/20 p-6">
          <div className="flex items-center gap-4">
            <div className="bg-[#FF6B35]/10 p-3 rounded-lg">
              <Package className="w-6 h-6 text-[#FF6B35]" />
            </div>
            <div>
              <div className="text-white/60 mb-1">Platos Vendidos</div>
              <div className="text-white">{totalItems} unidades</div>
            </div>
          </div>
        </Card>
        <Card className="bg-white/5 border-[#FF6B35]/20 p-6">
          <div className="flex items-center gap-4">
            <div className="bg-[#FF6B35]/10 p-3 rounded-lg">
              <TrendingUp className="w-6 h-6 text-[#FF6B35]" />
            </div>
            <div>
              <div className="text-white/60 mb-1">Ticket Promedio</div>
              <div className="text-white">Bs. {avgTicket.toFixed(2)}</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Sales List */}
      <Card className="bg-white/5 border-[#FF6B35]/20 p-6">
        <h3 className="text-white mb-4">Ventas Recientes</h3>
        {sales.length === 0 ? (
          <p className="text-white/60 text-center py-8">No hay ventas registradas</p>
        ) : (
          <div className="space-y-4">
            {paginatedSales.map((sale) => (
              <div key={sale.id} className="bg-white/5 rounded-lg p-4 border border-[#FF6B35]/10">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="text-white mb-1">Venta #{sale.id.slice(0, 8)}</div>
                    <div className="text-white/60">{formatDate(sale.fecha_creacion)} • {formatTime(sale.fecha_creacion)}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <div className="text-[#FF6B35]">Bs. {sale.total.toFixed(2)}</div>
                      <div className="text-white/60">
                        {sale.metodo_pago === "EFECTIVO" ? "Efectivo" :
                          sale.metodo_pago === "QR" ? "QR" :
                            sale.metodo_pago === "TARJETA" ? "Tarjeta" :
                              sale.metodo_pago || "N/A"}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(sale.id)}
                      className="text-red-400 hover:bg-red-500/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  {sale.items.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between text-sm">
                      <span className="text-white/80">
                        {item.cantidad}x {item.nombre_item}
                      </span>
                      <span className="text-white/60">Bs. {item.total.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {sortedSales.length > itemsPerPage && (
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
    </div>
  );
}
