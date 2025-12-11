import { useState, useEffect } from "react";
import { Plus, Calendar, DollarSign, TrendingUp, Package, Loader2, Trash2, Eye } from "lucide-react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger, DialogFooter } from "./ui/dialog";
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

  const [isAddItemDialogOpen, setIsAddItemDialogOpen] = useState(false);
  const [tempItem, setTempItem] = useState<VentaFormItem>({
    nombre_item: "",
    cantidad: 1,
    precio_unitario: 0,
    receta_id: undefined
  });

  const [paymentMethods, setPaymentMethods] = useState<string[]>([]);
  const [sucursales, setSucursales] = useState<Sucursal[]>([]);
  const [recipes, setRecipes] = useState<Receta[]>([]);
  const [users, setUsers] = useState<Usuario[]>([]);
  const [promotions, setPromotions] = useState<Promocion[]>([]);
  const [selectedPromotionId, setSelectedPromotionId] = useState<string>("none");
  const [selectedSale, setSelectedSale] = useState<Venta | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);

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
          receta_id: item.receta_id,
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

  const handleViewDetails = (sale: Venta) => {
    setSelectedSale(sale);
    setIsDetailsDialogOpen(true);
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


  const removeItem = (index: number) => {
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index)
    });
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
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 w-full relative">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[#1B1B1B] mb-3 text-3xl font-bold">Ventas y Pedidos</h1>
          <p className="text-muted-foreground text-base">Registra y gestiona las ventas diarias</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open: boolean) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="bg-[#F26522] hover:bg-[#F26522]/90 text-white font-bold shadow-lg transition-all duration-300">
              <Plus className="w-4 h-4 mr-2" />
              Nueva Venta
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-white border-[#F26522]/20 max-w-4xl max-h-[90vh] overflow-hidden flex flex-col p-0">
            <DialogHeader className="px-6 py-4 border-b border-[#F26522]/10 bg-[#F26522]/5">
              <DialogTitle className="text-[#1B1B1B] text-xl font-bold uppercase tracking-wide">Nueva Venta</DialogTitle>
              <DialogDescription className="text-[#1B1B1B]/60">Registra una nueva transacción de venta</DialogDescription>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto px-6 py-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <Label className="text-[#1B1B1B] font-medium mb-2 block">Sucursal</Label>
                    <Select
                      value={formData.sucursal_id}
                      onValueChange={(value: string) => setFormData({ ...formData, sucursal_id: value })}
                      required
                    >
                      <SelectTrigger className="bg-white border-[#F26522]/20 text-[#1B1B1B] focus:border-[#F26522] focus:ring-[#F26522]/20">
                        <SelectValue placeholder="Selecciona sucursal" />
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
                    <Label className="text-[#1B1B1B] font-medium mb-2 block">Tipo de Venta</Label>
                    <Select
                      value={formData.tipo_venta}
                      onValueChange={(value: "LOCAL" | "DELIVERY" | "TAKEAWAY") => setFormData({ ...formData, tipo_venta: value })}
                    >
                      <SelectTrigger className="bg-white border-[#F26522]/20 text-[#1B1B1B] focus:border-[#F26522] focus:ring-[#F26522]/20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-[#F26522]/20 z-[9999]">
                        <SelectItem value="LOCAL" className="text-[#1B1B1B] focus:bg-[#F26522]/10">Local</SelectItem>
                        <SelectItem value="DELIVERY" className="text-[#1B1B1B] focus:bg-[#F26522]/10">Delivery</SelectItem>
                        <SelectItem value="TAKEAWAY" className="text-[#1B1B1B] focus:bg-[#F26522]/10">Para Llevar</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                {formData.tipo_venta === "LOCAL" && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-[#1B1B1B] font-medium mb-2 block">Número de Mesa</Label>
                      <Input
                        className="bg-white border-[#F26522]/20 text-[#1B1B1B] focus:border-[#F26522] focus:ring-[#F26522]/20 tabular-nums"
                        placeholder="Ej: 5"
                        value={formData.numero_mesa}
                        onChange={(e) => setFormData({ ...formData, numero_mesa: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label className="text-[#1B1B1B] font-medium mb-2 block">Mesero</Label>
                      <Select
                        value={formData.mesero_id}
                        onValueChange={(value: string) => setFormData({ ...formData, mesero_id: value })}
                      >
                        <SelectTrigger className="bg-white border-[#F26522]/20 text-[#1B1B1B] focus:border-[#F26522] focus:ring-[#F26522]/20">
                          <SelectValue placeholder="Selecciona mesero" />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-[#F26522]/20 z-[9999]">
                          {users.map((user) => (
                            <SelectItem key={user.id} value={user.id} className="text-[#1B1B1B] focus:bg-[#F26522]/10 focus:text-[#1B1B1B]">
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
                      <Label className="text-[#1B1B1B] font-medium mb-2 block">Servicio de Delivery</Label>
                      <Input
                        className="bg-white border-[#F26522]/20 text-[#1B1B1B] focus:border-[#F26522] focus:ring-[#F26522]/20"
                        placeholder="PedidosYa, Ahora, etc."
                        value={formData.servicio_delivery}
                        onChange={(e) => setFormData({ ...formData, servicio_delivery: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label className="text-[#1B1B1B] font-medium mb-2 block">Cliente</Label>
                      <Input
                        className="bg-white border-[#F26522]/20 text-[#1B1B1B] focus:border-[#F26522] focus:ring-[#F26522]/20"
                        placeholder="Nombre del cliente"
                        value={formData.nombre_cliente}
                        onChange={(e) => setFormData({ ...formData, nombre_cliente: e.target.value })}
                      />
                    </div>
                  </div>
                )}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-[#1B1B1B] font-medium block">Platos y Productos</Label>
                    <Button
                      type="button"
                      onClick={() => {
                        setTempItem({ nombre_item: "", cantidad: 1, precio_unitario: 0, receta_id: undefined });
                        setIsAddItemDialogOpen(true);
                      }}
                      className="bg-[#F26522] hover:bg-[#F26522]/90 text-white text-xs font-bold"
                      size="sm"
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      Agregar Plato
                    </Button>
                  </div>

                  {formData.items.length === 0 ? (
                    <div className="text-center py-8 bg-[#F4F5F7] rounded-lg border border-dashed border-[#1B1B1B]/20">
                      <p className="text-[#1B1B1B]/60 text-sm">No hay platos agregados a la venta</p>
                    </div>
                  ) : (
                    <div className="bg-white border border-[#F26522]/20 rounded-lg overflow-hidden">
                      <table className="w-full text-sm text-left">
                        <thead className="bg-[#F26522]/10 text-[#1B1B1B] font-bold uppercase text-xs">
                          <tr>
                            <th className="px-4 py-2">Plato</th>
                            <th className="px-4 py-2 text-center">Cant.</th>
                            <th className="px-4 py-2 text-right">Precio</th>
                            <th className="px-4 py-2 text-right">Total</th>
                            <th className="px-4 py-2 text-center">Acciones</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#F26522]/10">
                          {formData.items.map((item, index) => (
                            <tr key={index} className="hover:bg-[#F26522]/5 transition-colors">
                              <td className="px-4 py-2 font-medium text-[#1B1B1B]">{item.nombre_item}</td>
                              <td className="px-4 py-2 text-center tabular-nums">{item.cantidad}</td>
                              <td className="px-4 py-2 text-right tabular-nums">Bs. {item.precio_unitario.toFixed(2)}</td>
                              <td className="px-4 py-2 text-right font-bold text-[#F26522] tabular-nums">Bs. {(item.cantidad * item.precio_unitario).toFixed(2)}</td>
                              <td className="px-4 py-2 text-center">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeItem(index)}
                                  className="text-[#1B1B1B]/40 hover:text-[#EA5455] hover:bg-[#EA5455]/10 h-8 w-8 p-0"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-[#1B1B1B] font-medium mb-2 block">Promoción</Label>
                    <Select
                      value={selectedPromotionId}
                      onValueChange={setSelectedPromotionId}
                    >
                      <SelectTrigger className="bg-white border-[#F26522]/20 text-[#1B1B1B] focus:border-[#F26522] focus:ring-[#F26522]/20">
                        <SelectValue placeholder="Selecciona promoción" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-[#F26522]/20 z-[9999]">
                        <SelectItem value="none" className="text-[#1B1B1B] focus:bg-[#F26522]/10">
                          (Sin promoción)
                        </SelectItem>
                        {promotions.map((promo) => (
                          <SelectItem key={promo.id} value={promo.id} className="text-[#1B1B1B] focus:bg-[#F26522]/10 focus:text-[#F26522]">
                            {promo.nombre} ({promo.tipo_descuento === "porcentaje" ? `${promo.valor_descuento}%` : `Bs. ${promo.valor_descuento}`})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-[#1B1B1B] font-medium mb-2 block">Descuento (Bs.)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      className="bg-white border-[#F26522]/20 text-[#1B1B1B] focus:border-[#F26522] focus:ring-[#F26522]/20 tabular-nums"
                      placeholder="0.00"
                      value={formData.monto_descuento}
                      onChange={(e) => setFormData({ ...formData, monto_descuento: parseFloat(e.target.value) || 0 })}
                      min="0"
                      readOnly={selectedPromotionId !== "none"}
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-[#1B1B1B] font-medium mb-2 block">Método de Pago</Label>
                  <Select
                    value={formData.metodo_pago}
                    onValueChange={(value: "EFECTIVO" | "QR" | "TARJETA") =>
                      setFormData({ ...formData, metodo_pago: value })
                    }
                  >
                    <SelectTrigger className="bg-white border-[#F26522]/20 text-[#1B1B1B] focus:border-[#F26522] focus:ring-[#F26522]/20">
                      <SelectValue placeholder="Selecciona método de pago" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-[#F26522]/20 z-[9999]">
                      {paymentMethods.map((method) => (
                        <SelectItem
                          key={method}
                          value={method}
                          className="text-[#1B1B1B] focus:bg-[#F26522]/10 focus:text-[#1B1B1B]"
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
                  <Label className="text-[#1B1B1B] font-medium mb-2 block">Notas</Label>
                  <Input
                    className="bg-white border-[#F26522]/20 text-[#1B1B1B] focus:border-[#F26522] focus:ring-[#F26522]/20"
                    placeholder="Notas adicionales (opcional)"
                    value={formData.notas}
                    onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
                  />
                </div>
                <div className="pt-4 border-t border-[#F26522]/20">
                  {(() => {
                    const subtotal = formData.items.reduce((sum, item) => sum + (item.cantidad * item.precio_unitario), 0);
                    const impuesto = subtotal * 0.13;
                    const total = subtotal - formData.monto_descuento + impuesto;
                    return (
                      <div className="bg-[#F26522]/5 p-4 rounded-lg border border-[#F26522]/10 space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-[#1B1B1B]/60 font-medium">Subtotal:</span>
                          <span className="text-[#1B1B1B] tabular-nums font-mono">
                            Bs. {subtotal.toFixed(2)}
                          </span>
                        </div>
                        {formData.monto_descuento > 0 && (
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-[#EA5455] font-medium">Descuento:</span>
                            <span className="text-[#EA5455] tabular-nums font-mono">
                              - Bs. {formData.monto_descuento.toFixed(2)}
                            </span>
                          </div>
                        )}
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-[#1B1B1B]/60 font-medium">IVA (13%):</span>
                          <span className="text-[#1B1B1B] tabular-nums font-mono">
                            Bs. {impuesto.toFixed(2)}
                          </span>
                        </div>
                        <div className="border-t border-[#F26522]/20 my-2"></div>
                        <div className="flex items-center justify-between">
                          <span className="text-[#1B1B1B] text-lg font-bold uppercase tracking-tight">Total:</span>
                          <span className="text-[#F26522] text-2xl font-black tabular-nums tracking-tighter">
                            Bs. {total.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    );
                  })()}
                </div>
                <Button
                  type="submit"
                  className="w-full bg-[#28C76F] hover:bg-[#28C76F]/90 text-white font-bold"
                  disabled={formData.items.length === 0}
                >
                  Registrar Venta
                </Button>
              </form>
            </div>
          </DialogContent>
        </Dialog>

        {/* Add Item Dialog */}
        <Dialog open={isAddItemDialogOpen} onOpenChange={setIsAddItemDialogOpen}>
          <DialogContent className="bg-white border-[#F26522]/20 max-w-lg p-0">
            <DialogHeader className="px-6 py-4 border-b border-[#F26522]/10 bg-[#F26522]/5">
              <DialogTitle className="text-[#1B1B1B] text-lg font-bold uppercase tracking-wide">Agregar Plato</DialogTitle>
              <DialogDescription className="text-[#1B1B1B]/60">Selecciona un plato o producto para agregar a la venta</DialogDescription>
            </DialogHeader>
            <div className="p-6 space-y-4">
              <div>
                <Label className="text-[#1B1B1B] font-medium mb-2 block">Plato / Producto</Label>
                <Select
                  value={tempItem.receta_id || "custom"}
                  onValueChange={(value: string) => {
                    if (value === "custom") {
                      setTempItem(prev => ({ ...prev, receta_id: undefined, nombre_item: "", precio_unitario: 0 }));
                    } else {
                      const recipe = recipes.find(r => r.id === value);
                      if (recipe) {
                        setTempItem(prev => ({
                          ...prev,
                          receta_id: value,
                          nombre_item: recipe.nombre,
                          precio_unitario: recipe.precio
                        }));
                      }
                    }
                  }}
                >
                  <SelectTrigger className="bg-white border-[#F26522]/20 text-[#1B1B1B] focus:border-[#F26522] focus:ring-[#F26522]/20">
                    <SelectValue placeholder="Selecciona un plato" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-[#F26522]/20 z-[99999]">
                    <SelectItem value="custom" className="text-[#1B1B1B] focus:bg-[#F26522]/10">(Item Manual)</SelectItem>
                    {recipes.map((recipe) => (
                      <SelectItem key={recipe.id} value={recipe.id} className="text-[#1B1B1B] focus:bg-[#F26522]/10">
                        {recipe.nombre} - Bs. {recipe.precio.toFixed(2)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {!tempItem.receta_id && (
                <div>
                  <Label className="text-[#1B1B1B] font-medium mb-2 block">Nombre del Item</Label>
                  <Input
                    className="bg-white border-[#F26522]/20 text-[#1B1B1B] focus:border-[#F26522] focus:ring-[#F26522]/20"
                    placeholder="Ej. Bebida Gaseosa"
                    value={tempItem.nombre_item}
                    onChange={(e) => setTempItem(prev => ({ ...prev, nombre_item: e.target.value }))}
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-[#1B1B1B] font-medium mb-2 block">Cantidad</Label>
                  <Input
                    type="number"
                    min="1"
                    className="bg-white border-[#F26522]/20 text-[#1B1B1B] focus:border-[#F26522] focus:ring-[#F26522]/20"
                    value={tempItem.cantidad}
                    onChange={(e) => setTempItem(prev => ({ ...prev, cantidad: parseInt(e.target.value) || 1 }))}
                  />
                </div>
                <div>
                  <Label className="text-[#1B1B1B] font-medium mb-2 block">Precio Unitario (Bs.)</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    className="bg-white border-[#F26522]/20 text-[#1B1B1B] focus:border-[#F26522] focus:ring-[#F26522]/20"
                    value={tempItem.precio_unitario}
                    onChange={(e) => setTempItem(prev => ({ ...prev, precio_unitario: parseFloat(e.target.value) || 0 }))}
                  />
                </div>
              </div>

              <div className="text-right pt-2 border-t border-[#F26522]/10">
                <span className="text-[#1B1B1B]/60 font-medium mr-2">Subtotal Item:</span>
                <span className="text-[#F26522] font-bold text-lg">Bs. {(tempItem.cantidad * tempItem.precio_unitario).toFixed(2)}</span>
              </div>
            </div>
            <DialogFooter className="bg-[#F4F5F7] px-6 py-4">
              <Button
                variant="outline"
                onClick={() => setIsAddItemDialogOpen(false)}
                className="border-[#1B1B1B]/20 text-[#1B1B1B] hover:bg-[#1B1B1B]/5"
              >
                Cancelar
              </Button>
              <Button
                onClick={() => {
                  if (!tempItem.nombre_item) {
                    toast.error("El nombre del item es requerido");
                    return;
                  }
                  setFormData(prev => ({ ...prev, items: [...prev.items, tempItem] }));
                  setIsAddItemDialogOpen(false);
                }}
                className="bg-[#F26522] hover:bg-[#F26522]/90 text-white font-bold"
              >
                Agregar a la Venta
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Sale Details Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="bg-white border-[#F26522]/20 text-[#1B1B1B] max-w-2xl max-h-[90vh] overflow-y-auto p-0 shadow-2xl">
          <DialogHeader className="px-8 py-6 border-b border-[#F26522]/10 bg-[#F26522]/5">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-[#1B1B1B] text-2xl font-bold uppercase tracking-tight mb-1">
                  Detalles de Venta
                </DialogTitle>
                <DialogDescription className="text-[#1B1B1B]/60 font-medium">
                  ID: #{selectedSale?.id.slice(0, 8)}
                </DialogDescription>
              </div>
              <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border
                ${selectedSale?.tipo_venta === 'LOCAL' ? 'bg-[#F26522]/10 text-[#F26522] border-[#F26522]/20' :
                  selectedSale?.tipo_venta === 'DELIVERY' ? 'bg-[#28C76F]/10 text-[#28C76F] border-[#28C76F]/20' :
                    'bg-[#7367F0]/10 text-[#7367F0] border-[#7367F0]/20'}`}>
                {selectedSale?.tipo_venta}
              </div>
            </div>
          </DialogHeader>

          {selectedSale && (
            <div className="p-8 space-y-8">
              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <h4 className="text-[#F26522] text-xs font-bold uppercase tracking-widest mb-3">Información General</h4>
                  <div className="space-y-2 text-sm text-[#1B1B1B]/80">
                    <div className="flex justify-between border-b border-dashed border-[#1B1B1B]/10 pb-1">
                      <span className="text-[#1B1B1B]/60">Fecha:</span>
                      <span className="font-mono">{new Date(selectedSale.fecha_creacion).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between border-b border-dashed border-[#1B1B1B]/10 pb-1">
                      <span className="text-[#1B1B1B]/60">Hora:</span>
                      <span className="font-mono">{new Date(selectedSale.fecha_creacion).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div className="flex justify-between border-b border-dashed border-[#1B1B1B]/10 pb-1">
                      <span className="text-[#1B1B1B]/60">Sucursal:</span>
                      <span className="font-medium">{sucursales.find(s => s.id === selectedSale.sucursal_id)?.nombre || "Sucursal"}</span>
                    </div>
                    <div className="flex justify-between border-b border-dashed border-[#1B1B1B]/10 pb-1">
                      <span className="text-[#1B1B1B]/60">Atendido por:</span>
                      <span className="font-medium">
                        {users.find(u => u.id === selectedSale.mesero_id)?.nombre_completo || "Personal"}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-[#F26522] text-xs font-bold uppercase tracking-widest mb-3">Cliente / Servicio</h4>
                  <div className="space-y-2 text-sm text-[#1B1B1B]/80">
                    {selectedSale.tipo_venta === 'LOCAL' ? (
                      <div className="flex justify-between border-b border-dashed border-[#1B1B1B]/10 pb-1">
                        <span className="text-[#1B1B1B]/60">Mesa:</span>
                        <span className="font-bold text-lg">#{selectedSale.numero_mesa}</span>
                      </div>
                    ) : (
                      <>
                        <div className="flex justify-between border-b border-dashed border-[#1B1B1B]/10 pb-1">
                          <span className="text-[#1B1B1B]/60">Cliente:</span>
                          <span className="font-medium">{selectedSale.nombre_cliente || "N/A"}</span>
                        </div>
                        {selectedSale.tipo_venta === 'DELIVERY' && (
                          <div className="flex justify-between border-b border-dashed border-[#1B1B1B]/10 pb-1">
                            <span className="text-[#1B1B1B]/60">Delivery:</span>
                            <span className="font-medium">{selectedSale.servicio_delivery || "Propio"}</span>
                          </div>
                        )}
                        {selectedSale.telefono_cliente && (
                          <div className="flex justify-between border-b border-dashed border-[#1B1B1B]/10 pb-1">
                            <span className="text-[#1B1B1B]/60">Teléfono:</span>
                            <span className="font-mono">{selectedSale.telefono_cliente}</span>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <div>
                <h4 className="text-[#F26522] text-xs font-bold uppercase tracking-widest mb-3">Detalle de Consumo</h4>
                <div className="border border-[#1B1B1B]/10 rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-[#1B1B1B] text-white">
                      <tr>
                        <th className="px-4 py-2 text-left font-bold uppercase text-xs">Item</th>
                        <th className="px-4 py-2 text-center font-bold uppercase text-xs">Cant.</th>
                        <th className="px-4 py-2 text-right font-bold uppercase text-xs">P. Unit</th>
                        <th className="px-4 py-2 text-right font-bold uppercase text-xs">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1B1B1B]/10 bg-[#F4F5F7]">
                      {selectedSale.items.map((item, idx) => (
                        <tr key={idx}>
                          <td className="px-4 py-2 font-medium text-[#1B1B1B]">{item.nombre_item}</td>
                          <td className="px-4 py-2 text-center tabular-nums text-[#1B1B1B]/70">{item.cantidad}</td>
                          <td className="px-4 py-2 text-right tabular-nums text-[#1B1B1B]/70">{item.precio_unitario.toFixed(2)}</td>
                          <td className="px-4 py-2 text-right tabular-nums font-bold text-[#1B1B1B]">
                            {(item.cantidad * item.precio_unitario).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Financial Summary */}
              <div className="flex justify-end">
                <div className="w-1/2 space-y-3 bg-[#F26522]/5 p-4 rounded-lg border border-[#F26522]/10">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-[#1B1B1B]/60 font-medium">Subtotal</span>
                    <span className="text-[#1B1B1B] font-mono tabular-nums">Bs. {selectedSale.subtotal.toFixed(2)}</span>
                  </div>
                  {selectedSale.monto_descuento > 0 && (
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-[#EA5455] font-medium">Descuento</span>
                      <span className="text-[#EA5455] font-mono tabular-nums">- Bs. {selectedSale.monto_descuento.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-[#1B1B1B]/60 font-medium whitespace-nowrap">Impuestos (13%)</span>
                    <span className="text-[#1B1B1B] font-mono tabular-nums">Bs. {selectedSale.impuesto.toFixed(2)}</span>
                  </div>
                  <div className="border-t border-[#F26522]/20 my-2"></div>
                  <div className="flex justify-between items-end">
                    <div>
                      <span className="text-[#1B1B1B] font-bold text-lg uppercase tracking-wider block">Total</span>
                      <span className="text-xs text-[#1B1B1B]/50 font-medium uppercase mt-1">
                        Pago: {selectedSale.metodo_pago}
                      </span>
                    </div>
                    <span className="text-[#F26522] font-black text-2xl tabular-nums tracking-tighter">
                      Bs. {selectedSale.total.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {selectedSale.notas && (
                <div className="bg-[#FFF4E5] border-l-4 border-[#F26522] p-3 text-sm italic text-[#1B1B1B]/80">
                  <span className="font-bold not-italic mr-1">Nota:</span> "{selectedSale.notas}"
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-[#7367F0]/10 border-[#7367F0]/20 p-6 hover:bg-[#7367F0]/20 transition-all duration-300 transform hover:-translate-y-1 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="bg-white/80 p-3 rounded-lg shadow-sm">
              <Calendar className="w-6 h-6 text-[#7367F0]" />
            </div>
            <div>
              <div className="text-[#1B1B1B]/60 text-sm font-bold uppercase tracking-wide mb-1">Ventas de Hoy</div>
              <div className="text-[#1B1B1B] text-2xl font-bold tabular-nums">{todaySales.length} ventas</div>
            </div>
          </div>
        </Card>
        <Card className="bg-[#28C76F]/10 border-[#28C76F]/20 p-6 hover:bg-[#28C76F]/20 transition-all duration-300 transform hover:-translate-y-1 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="bg-white/80 p-3 rounded-lg shadow-sm">
              <DollarSign className="w-6 h-6 text-[#28C76F]" />
            </div>
            <div>
              <div className="text-[#1B1B1B]/60 text-sm font-bold uppercase tracking-wide mb-1">Ingresos del Día</div>
              <div className="text-[#1B1B1B] text-2xl font-bold tabular-nums">Bs. {todayRevenue.toFixed(2)}</div>
            </div>
          </div>
        </Card>
        <Card className="bg-[#F26522]/10 border-[#F26522]/20 p-6 hover:bg-[#F26522]/20 transition-all duration-300 transform hover:-translate-y-1 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="bg-white/80 p-3 rounded-lg shadow-sm">
              <Package className="w-6 h-6 text-[#F26522]" />
            </div>
            <div>
              <div className="text-[#1B1B1B]/60 text-sm font-bold uppercase tracking-wide mb-1">Platos Vendidos</div>
              <div className="text-[#1B1B1B] text-2xl font-bold tabular-nums">{totalItems} unidades</div>
            </div>
          </div>
        </Card>
        <Card className="bg-[#00CFE8]/10 border-[#00CFE8]/20 p-6 hover:bg-[#00CFE8]/20 transition-all duration-300 transform hover:-translate-y-1 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="bg-white/80 p-3 rounded-lg shadow-sm">
              <TrendingUp className="w-6 h-6 text-[#00CFE8]" />
            </div>
            <div>
              <div className="text-[#1B1B1B]/60 text-sm font-bold uppercase tracking-wide mb-1">Ticket Promedio</div>
              <div className="text-[#1B1B1B] text-2xl font-bold tabular-nums">Bs. {avgTicket.toFixed(2)}</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Sales List */}
      <Card className="bg-card border-primary/20 p-6">
        {sales.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">No hay ventas registradas</p>
        ) : (
          <div className="space-y-4">
            {paginatedSales.map((sale) => (
              <Card key={sale.id} className="bg-white border-[#F26522]/20 p-6 hover:bg-white hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 shadow-sm">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-[#1B1B1B] font-bold text-lg tabular-nums">#{sale.id.slice(0, 8)}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase tracking-wide
                      ${sale.tipo_venta === 'LOCAL' ? 'bg-[#F26522]/10 text-[#F26522] border border-[#F26522]/20' :
                          sale.tipo_venta === 'DELIVERY' ? 'bg-[#28C76F]/10 text-[#28C76F] border border-[#28C76F]/20' :
                            'bg-[#7367F0]/10 text-[#7367F0] border border-[#7367F0]/20'}`}>
                        {sale.tipo_venta}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-[#1B1B1B]/60 text-sm font-medium">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(sale.fecha_creacion).toLocaleDateString()} • {new Date(sale.fecha_creacion).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <div className="flex items-center gap-1 uppercase">
                        {sale.tipo_venta === "LOCAL" ? `Mesa ${sale.numero_mesa}` : sale.nombre_cliente || "Cliente Casual"}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[#F26522] font-bold text-2xl mb-1 tabular-nums tracking-tight">Bs. {sale.total.toFixed(2)}</div>
                    <div className="text-[#1B1B1B] text-xs font-bold uppercase tracking-wide bg-[#F4F5F7] px-2 py-1 rounded inline-block border border-gray-200">
                      {sale.metodo_pago === "EFECTIVO" ? "Efectivo" :
                        sale.metodo_pago === "QR" ? "QR" :
                          sale.metodo_pago === "TARJETA" ? "Tarjeta" :
                            sale.metodo_pago || "N/A"}
                    </div>
                  </div>
                </div>

                <div className="border-t border-[#F26522]/10 pt-4">
                  <div className="space-y-2">
                    {sale.items.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between text-sm group hover:bg-[#F26522]/5 p-1 rounded transition-colors">
                        <span className="text-[#1B1B1B]/80 font-medium">
                          <span className="text-[#F26522] font-bold mr-2">{item.cantidad}x</span>
                          {item.nombre_item}
                        </span>
                        <span className="text-[#1B1B1B] tabular-nums font-medium">Bs. {item.total.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions Footer */}
                <div className="mt-4 pt-4 border-t border-[#F26522]/10 flex justify-end items-center gap-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-[#1B1B1B]/60 hover:text-[#F26522] hover:bg-[#F26522]/10"
                    onClick={() => handleViewDetails(sale)}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Ver Detalles
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(sale.id)}
                    className="text-[#1B1B1B]/40 hover:text-[#EA5455] hover:bg-[#EA5455]/10"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Eliminar
                  </Button>
                </div>
              </Card>
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
                    className={currentPage === 1
                      ? "pointer-events-none opacity-30 text-[#1B1B1B]"
                      : "cursor-pointer text-[#1B1B1B] hover:text-[#F26522] hover:bg-[#F26522]/10 transition-colors"}
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
                      className={`cursor-pointer transition-colors font-medium
                        ${currentPage === page
                          ? "bg-[#F26522] text-white hover:bg-[#F26522]/90 border-transparent shadow-md"
                          : "text-[#1B1B1B] hover:text-[#F26522] hover:bg-[#F26522]/10 hover:border-[#F26522]/30"}`}
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
                    className={currentPage === totalPages
                      ? "pointer-events-none opacity-30 text-[#1B1B1B]"
                      : "cursor-pointer text-[#1B1B1B] hover:text-[#F26522] hover:bg-[#F26522]/10 transition-colors"}
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
