import { useState, useEffect } from "react";
import { Plus, Calendar, DollarSign, TrendingUp, Package, Loader2, Trash2 } from "lucide-react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "./ui/dialog";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "./ui/pagination";
import { salesApi, enumsApi, businessLocationsApi, type Sale as ApiSale, type BusinessLocation } from "../services/api";
import { toast } from "sonner";

interface Sale {
  id: string;
  created_at: string;
  items: Array<{
    item_name: string;
    quantity: number;
    unit_price: number;
    total: number;
  }>;
  total: number;
  subtotal: number;
  tax: number;
  payment_method?: string;
}

export function Sales() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    location_id: "",
    table_number: "",
    waiter_id: "",
    sale_type: "LOCAL" as "LOCAL" | "DELIVERY" | "TAKEAWAY",
    delivery_service: "",
    customer_name: "",
    customer_phone: "",
    items: [] as Array<{ item_name: string; quantity: number; unit_price: number }>,
    payment_method: "EFECTIVO" as "EFECTIVO" | "QR" | "TARJETA",
    notes: "",
    discount_amount: 0
  });
  const [paymentMethods, setPaymentMethods] = useState<string[]>([]);
  const [locations, setLocations] = useState<BusinessLocation[]>([]);

  useEffect(() => {
    loadSales();
    loadPaymentMethods();
    loadLocations();
  }, []);

  const loadLocations = async () => {
    try {
      const data = await businessLocationsApi.getAll();
      setLocations(data);
      if (data.length > 0 && !formData.location_id) {
        const mainLocation = data.find(loc => loc.is_main) || data[0];
        setFormData(prev => ({ ...prev, location_id: mainLocation.id }));
      }
    } catch (error) {
      console.error("Error loading locations:", error);
    }
  };

  const loadPaymentMethods = async () => {
    try {
      const res = await enumsApi.getPaymentMethods();
      setPaymentMethods(res.methods);
      // Set default if available
      if (res.methods.length > 0 && !res.methods.includes(formData.payment_method)) {
        setFormData(prev => ({ ...prev, payment_method: res.methods[0] as "EFECTIVO" | "QR" | "TARJETA" }));
      }
    } catch (error) {
      console.error("Error loading payment methods:", error);
    }
  };

  const loadSales = async () => {
    try {
      setLoading(true);
      const data = await salesApi.getAll();
      const mappedSales = data.map(sale => ({
        id: sale.id,
        created_at: sale.created_at,
        items: sale.items || [],
        total: sale.total,
        subtotal: sale.subtotal,
        tax: sale.tax,
        payment_method: sale.payment_method
      }));
      setSales(mappedSales);
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
      if (!formData.location_id) {
        toast.error("Debes seleccionar una sucursal");
        return;
      }

      if (formData.items.length === 0) {
        toast.error("Debes agregar al menos un item a la venta");
        return;
      }

      const subtotal = formData.items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
      const tax = subtotal * 0.13; // 13% IVA
      const finalTotal = subtotal - formData.discount_amount + tax;

      const saleData: any = {
        location_id: formData.location_id,
        sale_type: formData.sale_type,
        subtotal,
        discount_amount: formData.discount_amount,
        tax,
        total: finalTotal,
        payment_method: formData.payment_method,
        items: formData.items.map(item => ({
          item_name: item.item_name,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total: item.quantity * item.unit_price
        }))
      };

      // Add optional fields
      if (formData.table_number) {
        saleData.table_number = formData.table_number;
      }
      if (formData.waiter_id) {
        saleData.waiter_id = formData.waiter_id;
      }
      if (formData.delivery_service) {
        saleData.delivery_service = formData.delivery_service;
      }
      if (formData.customer_name) {
        saleData.customer_name = formData.customer_name;
      }
      if (formData.customer_phone) {
        saleData.customer_phone = formData.customer_phone;
      }
      if (formData.notes) {
        saleData.notes = formData.notes;
      }

      await salesApi.create(saleData);

      toast.success("Venta registrada correctamente");
      setIsDialogOpen(false);
      resetForm();
      loadSales();
    } catch (error: any) {
      console.error("Error creating sale:", error);

      // Extract error message from API response
      let errorMessage = "Error al registrar la venta";
      if (error?.message) {
        errorMessage = error.message;
      } else if (error?.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }

      // Show specific error message
      if (errorMessage.includes("Stock insuficiente") || errorMessage.includes("stock")) {
        toast.error(errorMessage, { duration: 5000 });
      } else if (errorMessage.includes("cerrado") || errorMessage.includes("horario")) {
        toast.error(errorMessage, { duration: 5000 });
      } else {
        toast.error(errorMessage);
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar esta venta?")) return;

    try {
      await salesApi.delete(id);
      toast.success("Venta eliminada correctamente. El inventario ha sido restaurado.");
      loadSales();
    } catch (error: any) {
      console.error("Error deleting sale:", error);
      const errorMessage = error?.response?.data?.detail || error?.message || "Error al eliminar la venta";
      toast.error(errorMessage);
    }
  };

  const resetForm = () => {
    const mainLocation = locations.find(loc => loc.is_main) || locations[0];
    setFormData({
      location_id: mainLocation?.id || "",
      table_number: "",
      waiter_id: "",
      sale_type: "LOCAL" as "LOCAL" | "DELIVERY" | "TAKEAWAY",
      delivery_service: "",
      customer_name: "",
      customer_phone: "",
      items: [],
      payment_method: "EFECTIVO" as "EFECTIVO" | "QR" | "TARJETA",
      notes: "",
      discount_amount: 0
    });
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { item_name: "", quantity: 1, unit_price: 0 }]
    });
  };

  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
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

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit' });
  };

  // Filter today's sales
  const today = new Date().toDateString();
  const todaySales = sales.filter(sale => new Date(sale.created_at).toDateString() === today);
  const todayRevenue = todaySales.reduce((sum, sale) => sum + sale.total, 0);
  const totalItems = todaySales.reduce((sum, sale) => sum + sale.items.reduce((s, item) => s + item.quantity, 0), 0);
  const avgTicket = todaySales.length > 0 ? todayRevenue / todaySales.length : 0;

  // Pagination logic
  const sortedSales = [...sales].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  const totalPages = Math.ceil(sortedSales.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedSales = sortedSales.slice(startIndex, endIndex);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-[#209C8A]" />
      </div>
    );
  }

  return (
    <div className="space-y-8 w-full relative">
      {/* Header */}
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-white mb-2">Ventas</h1>
          <p className="text-white/60">Registra y analiza las ventas diarias</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="bg-[#209C8A] hover:bg-[#209C8A]/90 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Nueva Venta
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-[#020617] border-[#209C8A]/20 max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-white">Registrar Nueva Venta</DialogTitle>
              <DialogDescription className="text-white/60">
                Agrega los platos vendidos y selecciona el método de pago
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-white/80">Sucursal *</Label>
                  <Select
                    value={formData.location_id}
                    onValueChange={(value) => setFormData({ ...formData, location_id: value })}
                    required
                  >
                    <SelectTrigger className="bg-white/5 border-[#209C8A]/20 text-white">
                      <SelectValue placeholder="Selecciona sucursal" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#020617] border-[#209C8A]/20">
                      {locations.map((loc) => (
                        <SelectItem key={loc.id} value={loc.id} className="text-white focus:bg-[#209C8A]/20">
                          {loc.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-white/80">Tipo de Venta</Label>
                  <Select
                    value={formData.sale_type}
                    onValueChange={(value: "LOCAL" | "DELIVERY" | "TAKEAWAY") => setFormData({ ...formData, sale_type: value })}
                  >
                    <SelectTrigger className="bg-white/5 border-[#209C8A]/20 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#020617] border-[#209C8A]/20">
                      <SelectItem value="LOCAL" className="text-white focus:bg-[#209C8A]/20">Local</SelectItem>
                      <SelectItem value="DELIVERY" className="text-white focus:bg-[#209C8A]/20">Delivery</SelectItem>
                      <SelectItem value="TAKEAWAY" className="text-white focus:bg-[#209C8A]/20">Para Llevar</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {formData.sale_type === "LOCAL" && (
                <div>
                  <Label className="text-white/80">Número de Mesa</Label>
                  <Input
                    className="bg-white/5 border-[#209C8A]/20 text-white"
                    placeholder="Ej: 5"
                    value={formData.table_number}
                    onChange={(e) => setFormData({ ...formData, table_number: e.target.value })}
                  />
                </div>
              )}
              {formData.sale_type === "DELIVERY" && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-white/80">Servicio de Delivery</Label>
                    <Input
                      className="bg-white/5 border-[#209C8A]/20 text-white"
                      placeholder="PedidosYa, Ahora, etc."
                      value={formData.delivery_service}
                      onChange={(e) => setFormData({ ...formData, delivery_service: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label className="text-white/80">Cliente</Label>
                    <Input
                      className="bg-white/5 border-[#209C8A]/20 text-white"
                      placeholder="Nombre del cliente"
                      value={formData.customer_name}
                      onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                    />
                  </div>
                </div>
              )}
              <div>
                <Label className="text-white/80 mb-2 block">Platos</Label>
                <div className="space-y-2">
                  {formData.items.map((item, index) => (
                    <div key={index} className="flex gap-2 items-center bg-white/5 p-2 rounded">
                      <Input
                        className="bg-white/5 border-[#209C8A]/20 text-white flex-1"
                        placeholder="Nombre del plato"
                        value={item.item_name}
                        onChange={(e) => updateItem(index, "item_name", e.target.value)}
                        required
                      />
                      <Input
                        type="number"
                        className="bg-white/5 border-[#209C8A]/20 text-white w-20"
                        placeholder="Cant."
                        value={item.quantity}
                        onChange={(e) => updateItem(index, "quantity", parseInt(e.target.value) || 1)}
                        required
                        min="1"
                      />
                      <Input
                        type="number"
                        step="0.01"
                        className="bg-white/5 border-[#209C8A]/20 text-white w-24"
                        placeholder="Precio"
                        value={item.unit_price}
                        onChange={(e) => updateItem(index, "unit_price", parseFloat(e.target.value) || 0)}
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
                    className="w-full border-[#209C8A]/40 text-[#209C8A] hover:bg-[#209C8A]/20 hover:text-white hover:border-[#209C8A] bg-transparent"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Agregar Plato
                  </Button>
                </div>
              </div>
              <div>
                <Label className="text-white/80">Descuento (Bs.)</Label>
                <Input
                  type="number"
                  step="0.01"
                  className="bg-white/5 border-[#209C8A]/20 text-white"
                  placeholder="0.00"
                  value={formData.discount_amount}
                  onChange={(e) => setFormData({ ...formData, discount_amount: parseFloat(e.target.value) || 0 })}
                  min="0"
                />
              </div>
              <div>
                <Label className="text-white/80">Método de Pago</Label>
                <Select
                  value={formData.payment_method}
                  onValueChange={(value: "EFECTIVO" | "QR" | "TARJETA") =>
                    setFormData({ ...formData, payment_method: value })
                  }
                >
                  <SelectTrigger className="bg-white/5 border-[#209C8A]/20 text-white">
                    <SelectValue placeholder="Selecciona método de pago" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#020617] border-[#209C8A]/20">
                    {paymentMethods.map((method) => (
                      <SelectItem
                        key={method}
                        value={method}
                        className="text-white focus:bg-[#209C8A]/20"
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
                  className="bg-white/5 border-[#209C8A]/20 text-white"
                  placeholder="Notas adicionales (opcional)"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </div>
              <div className="pt-4 border-t border-[#209C8A]/20">
                {(() => {
                  const subtotal = formData.items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
                  const tax = subtotal * 0.13;
                  const total = subtotal - formData.discount_amount + tax;
                  return (
                    <>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white/60">Subtotal:</span>
                        <span className="text-white">
                          Bs. {subtotal.toFixed(2)}
                        </span>
                      </div>
                      {formData.discount_amount > 0 && (
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-white/60">Descuento:</span>
                          <span className="text-red-400">
                            - Bs. {formData.discount_amount.toFixed(2)}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white/60">IVA (13%):</span>
                        <span className="text-white">
                          Bs. {tax.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t border-[#209C8A]/20">
                        <span className="text-white font-semibold">Total:</span>
                        <span className="text-[#209C8A] text-lg font-semibold">
                          Bs. {total.toFixed(2)}
                        </span>
                      </div>
                    </>
                  );
                })()}
              </div>
              <Button
                type="submit"
                className="w-full bg-[#209C8A] hover:bg-[#209C8A]/90 text-white"
                disabled={formData.items.length === 0}
              >
                Registrar Venta
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-white/5 border-[#209C8A]/20 p-6">
          <div className="flex items-center gap-4">
            <div className="bg-[#209C8A]/10 p-3 rounded-lg">
              <Calendar className="w-6 h-6 text-[#209C8A]" />
            </div>
            <div>
              <div className="text-white/60 mb-1">Ventas de Hoy</div>
              <div className="text-white">{todaySales.length} ventas</div>
            </div>
          </div>
        </Card>
        <Card className="bg-white/5 border-[#209C8A]/20 p-6">
          <div className="flex items-center gap-4">
            <div className="bg-[#209C8A]/10 p-3 rounded-lg">
              <DollarSign className="w-6 h-6 text-[#209C8A]" />
            </div>
            <div>
              <div className="text-white/60 mb-1">Ingresos del Día</div>
              <div className="text-white">Bs. {todayRevenue.toFixed(2)}</div>
            </div>
          </div>
        </Card>
        <Card className="bg-white/5 border-[#209C8A]/20 p-6">
          <div className="flex items-center gap-4">
            <div className="bg-[#209C8A]/10 p-3 rounded-lg">
              <Package className="w-6 h-6 text-[#209C8A]" />
            </div>
            <div>
              <div className="text-white/60 mb-1">Platos Vendidos</div>
              <div className="text-white">{totalItems} unidades</div>
            </div>
          </div>
        </Card>
        <Card className="bg-white/5 border-[#209C8A]/20 p-6">
          <div className="flex items-center gap-4">
            <div className="bg-[#209C8A]/10 p-3 rounded-lg">
              <TrendingUp className="w-6 h-6 text-[#209C8A]" />
            </div>
            <div>
              <div className="text-white/60 mb-1">Ticket Promedio</div>
              <div className="text-white">Bs. {avgTicket.toFixed(2)}</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Sales List */}
      <Card className="bg-white/5 border-[#209C8A]/20 p-6">
        <h3 className="text-white mb-4">Ventas Recientes</h3>
        {sales.length === 0 ? (
          <p className="text-white/60 text-center py-8">No hay ventas registradas</p>
        ) : (
          <div className="space-y-4">
            {paginatedSales.map((sale) => (
              <div key={sale.id} className="bg-white/5 rounded-lg p-4 border border-[#209C8A]/10">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="text-white mb-1">Venta #{sale.id.slice(0, 8)}</div>
                    <div className="text-white/60">{formatDate(sale.created_at)} • {formatTime(sale.created_at)}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <div className="text-[#209C8A]">Bs. {sale.total.toFixed(2)}</div>
                      <div className="text-white/60">
                        {sale.payment_method === "EFECTIVO" ? "Efectivo" :
                          sale.payment_method === "QR" ? "QR" :
                            sale.payment_method === "TARJETA" ? "Tarjeta" :
                              sale.payment_method || "N/A"}
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
                        {item.quantity}x {item.item_name}
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
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer text-white hover:text-[#209C8A]"}
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
                      className="cursor-pointer text-white hover:text-[#209C8A] data-[active=true]:bg-[#209C8A]/20 data-[active=true]:text-[#209C8A]"
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
                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer text-white hover:text-[#209C8A]"}
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
