
import { useState, useMemo } from "react";
import { Plus, Search, Edit, Trash2, Tag } from "lucide-react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Switch } from "./ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Promocion } from "../types";
import { toast } from "sonner";
import { usePromotions } from "../hooks/usePromotions";
import { FormInput } from "./ui/FormInput";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Skeleton } from "./ui/skeleton";

export function Promotions() {
  const { promociones, sucursales, loading, createPromotion, updatePromotion, deletePromotion } = usePromotions();
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<Promocion | null>(null);

  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    tipo_descuento: "PORCENTAJE" as 'PORCENTAJE' | 'MONTO_FIJO' | '2X1',
    valor_descuento: 0,
    compra_minima: undefined as number | undefined,
    descuento_maximo: undefined as number | undefined,
    fecha_inicio: "",
    fecha_fin: "",
    activa: true,
    aplicable_a: "TODOS" as 'TODOS' | 'RECETAS' | 'CATEGORIAS' | 'ITEMS',
    sucursal_id: "none"
  });

  const filteredPromociones = useMemo(() =>
    promociones.filter(promo =>
      promo.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (promo.descripcion && promo.descripcion.toLowerCase().includes(searchTerm.toLowerCase()))
    ),
    [promociones, searchTerm]
  );

  const handleEdit = (promocion: Promocion) => {
    setEditingPromotion(promocion);

    // Format dates for input[type="datetime-local"]
    // Removing the 'T' and seconds if standard or just ensuring it fits
    // Using date-fns usually ensures safe handling, but for input value we need YYYY-MM-DDTHH:mm
    const formatDateForInput = (dateString: string) => {
      try {
        return new Date(dateString).toISOString().slice(0, 16);
      } catch (e) {
        return "";
      }
    };

    setFormData({
      nombre: promocion.nombre,
      descripcion: promocion.descripcion || "",
      tipo_descuento: promocion.tipo_descuento as any,
      valor_descuento: promocion.valor_descuento,
      compra_minima: promocion.compra_minima,
      descuento_maximo: promocion.descuento_maximo,
      fecha_inicio: formatDateForInput(promocion.fecha_inicio),
      fecha_fin: formatDateForInput(promocion.fecha_fin),
      activa: promocion.activa,
      aplicable_a: promocion.aplicable_a as any || "TODOS",
      sucursal_id: promocion.sucursal_id || "none"
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      nombre: "",
      descripcion: "",
      tipo_descuento: "PORCENTAJE",
      valor_descuento: 0,
      compra_minima: undefined,
      descuento_maximo: undefined,
      fecha_inicio: "",
      fecha_fin: "",
      activa: true,
      aplicable_a: "TODOS",
      sucursal_id: "none"
    });
    setEditingPromotion(null);
  };

  const validateForm = () => {
    if (new Date(formData.fecha_fin) <= new Date(formData.fecha_inicio)) {
      toast.error("La fecha de fin debe ser posterior a la fecha de inicio");
      return false;
    }
    if (formData.tipo_descuento !== '2X1' && formData.valor_descuento <= 0) {
      toast.error("El valor de descuento debe ser mayor a cero");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const submitData: any = {
        nombre: formData.nombre,
        descripcion: formData.descripcion || undefined,
        tipo_descuento: formData.tipo_descuento,
        valor_descuento: formData.valor_descuento,
        compra_minima: formData.compra_minima || undefined,
        descuento_maximo: formData.descuento_maximo || undefined,
        // Ensure ISO string for backend
        fecha_inicio: new Date(formData.fecha_inicio).toISOString(),
        fecha_fin: new Date(formData.fecha_fin).toISOString(),
        activa: formData.activa,
        aplicable_a: formData.aplicable_a,
        sucursal_id: formData.sucursal_id === "none" ? undefined : formData.sucursal_id
      };

      if (editingPromotion) {
        await updatePromotion(editingPromotion.id, submitData);
      } else {
        await createPromotion(submitData);
      }
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      // handled in hook
    }
  };

  const handleDeleteClick = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar esta promoción?")) return;
    await deletePromotion(id);
  };

  const getDiscountTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      PORCENTAJE: "Porcentaje",
      MONTO_FIJO: "Monto Fijo",
      "2X1": "2x1"
    };
    return labels[type] || type;
  };

  const isActive = (promo: Promocion) => {
    const now = new Date();
    const start = new Date(promo.fecha_inicio);
    const end = new Date(promo.fecha_fin);
    return promo.activa && now >= start && now <= end;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[#1B1B1B] text-3xl font-bold mb-2 uppercase tracking-tight">Gestión de Promociones</h1>
          <p className="text-[#1B1B1B]/60 font-medium">Administra las ofertas y descuentos</p>
        </div>
        <Button
          type="button"
          className="bg-[#F26522] hover:bg-[#F26522]/90 text-white font-bold shadow-lg transition-all duration-300"
          onClick={() => {
            resetForm();
            setIsDialogOpen(true);
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Nueva Promoción
        </Button>
      </div>

      <Card className="bg-white border-[#F26522]/20 p-6 shadow-sm">
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogContent className="bg-white border-[#F26522]/20 text-[#1B1B1B] max-h-[90vh] overflow-y-auto p-0 max-w-2xl">
            <DialogHeader className="px-6 py-4 border-b border-[#F26522]/10 bg-[#F26522]/5">
              <DialogTitle className="text-[#1B1B1B] text-xl font-bold uppercase tracking-wide">
                {editingPromotion ? "Editar Promoción" : "Crear Nueva Promoción"}
              </DialogTitle>
              <DialogDescription className="text-[#1B1B1B]/60">
                {editingPromotion ? "Modifica los datos de la promoción" : "Completa los datos para crear una nueva promoción"}
              </DialogDescription>
            </DialogHeader>
            <div className="p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <FormInput
                  label="Nombre"
                  id="nombre"
                  placeholder="Ej: Descuento de Verano"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  required
                />

                <div>
                  <Label htmlFor="descripcion" className="text-[#1B1B1B] font-medium mb-1.5 block">Descripción</Label>
                  <Textarea
                    id="descripcion"
                    className="bg-white border-[#F26522]/20 text-[#1B1B1B] focus:border-[#F26522] focus:ring-[#F26522]/20"
                    placeholder="Descripción de la promoción"
                    value={formData.descripcion}
                    onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-[#1B1B1B] font-medium mb-1.5 block">Tipo de Descuento</Label>
                    <Select
                      value={formData.tipo_descuento}
                      onValueChange={(value: 'PORCENTAJE' | 'MONTO_FIJO' | '2X1') => setFormData({ ...formData, tipo_descuento: value })}
                      required
                    >
                      <SelectTrigger className="bg-white border-[#F26522]/20 text-[#1B1B1B]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-[#F26522]/20 z-[9999]">
                        <SelectItem value="PORCENTAJE">Porcentaje</SelectItem>
                        <SelectItem value="MONTO_FIJO">Monto Fijo</SelectItem>
                        <SelectItem value="2X1">2x1</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <FormInput
                    label={`Valor ${formData.tipo_descuento === 'PORCENTAJE' ? '(%)' : '(Bs.)'}`}
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0"
                    value={formData.valor_descuento}
                    onChange={(e) => setFormData({ ...formData, valor_descuento: parseFloat(e.target.value) || 0 })}
                    required
                    disabled={formData.tipo_descuento === '2X1'}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormInput
                    label="Compra Mínima (Bs.)"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0"
                    value={formData.compra_minima || ""}
                    onChange={(e) => setFormData({ ...formData, compra_minima: e.target.value ? parseFloat(e.target.value) : undefined })}
                  />
                  <FormInput
                    label="Descuento Máximo (Bs.)"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0"
                    value={formData.descuento_maximo || ""}
                    onChange={(e) => setFormData({ ...formData, descuento_maximo: e.target.value ? parseFloat(e.target.value) : undefined })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormInput
                    label="Fecha de Inicio"
                    type="datetime-local"
                    value={formData.fecha_inicio}
                    onChange={(e) => setFormData({ ...formData, fecha_inicio: e.target.value })}
                    required
                  />
                  <FormInput
                    label="Fecha de Fin"
                    type="datetime-local"
                    value={formData.fecha_fin}
                    onChange={(e) => setFormData({ ...formData, fecha_fin: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label className="text-[#1B1B1B] font-medium mb-1.5 block">Aplicable a</Label>
                  <Select
                    value={formData.aplicable_a}
                    onValueChange={(value: 'TODOS' | 'RECETAS' | 'CATEGORIAS' | 'ITEMS') => setFormData({ ...formData, aplicable_a: value })}
                  >
                    <SelectTrigger className="bg-white border-[#F26522]/20 text-[#1B1B1B]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-[#F26522]/20 z-[9999]">
                      <SelectItem value="TODOS">Todos</SelectItem>
                      <SelectItem value="RECETAS">Recetas Específicas</SelectItem>
                      <SelectItem value="CATEGORIAS">Categorías</SelectItem>
                      <SelectItem value="ITEMS">Items Específicos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-[#1B1B1B] font-medium mb-1.5 block">Sucursal</Label>
                  <Select
                    value={formData.sucursal_id}
                    onValueChange={(value: string) => setFormData({ ...formData, sucursal_id: value })}
                  >
                    <SelectTrigger className="bg-white border-[#F26522]/20 text-[#1B1B1B]">
                      <SelectValue placeholder="Todas las sucursales" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-[#F26522]/20 z-[9999]">
                      <SelectItem value="none" className="text-[#1B1B1B]/60">Todas las sucursales</SelectItem>
                      {sucursales.map((loc) => (
                        <SelectItem key={loc.id} value={loc.id}>
                          {loc.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2 pt-2">
                  <Switch
                    id="activa"
                    checked={formData.activa}
                    onCheckedChange={(checked: boolean) => setFormData({ ...formData, activa: checked })}
                    className="data-[state=checked]:bg-[#28C76F]"
                  />
                  <Label htmlFor="activa" className="text-[#1B1B1B] font-medium">Activa</Label>
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t border-[#F26522]/10">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      resetForm();
                      setIsDialogOpen(false);
                    }}
                    className="border-[#1B1B1B]/20 text-[#1B1B1B] hover:bg-[#1B1B1B]/5"
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" className="bg-[#F26522] hover:bg-[#F26522]/90 text-white font-bold">
                    {editingPromotion ? "Actualizar Promoción" : "Crear Promoción"}
                  </Button>
                </div>
              </form>
            </div>
          </DialogContent>
        </Dialog>

        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#1B1B1B]/40" />
          <Input
            className="pl-10 bg-white border-[#F26522]/20 text-[#1B1B1B] focus:border-[#F26522] focus:ring-[#F26522]/20"
            placeholder="Buscar promociones por nombre o descripción..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="overflow-x-auto rounded-lg border border-[#F26522]/20">
          <table className="w-full">
            <thead className="bg-[#F26522]/10 border-b border-[#F26522]/20">
              <tr>
                <th className="px-6 py-4 text-left text-[#1B1B1B] font-bold uppercase tracking-wider text-xs">Nombre</th>
                <th className="px-6 py-4 text-left text-[#1B1B1B] font-bold uppercase tracking-wider text-xs">Tipo</th>
                <th className="px-6 py-4 text-left text-[#1B1B1B] font-bold uppercase tracking-wider text-xs">Descuento</th>
                <th className="px-6 py-4 text-left text-[#1B1B1B] font-bold uppercase tracking-wider text-xs">Período</th>
                <th className="px-6 py-4 text-left text-[#1B1B1B] font-bold uppercase tracking-wider text-xs">Estado</th>
                <th className="px-6 py-4 text-left text-[#1B1B1B] font-bold uppercase tracking-wider text-xs">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F26522]/10">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>
                    <td className="px-6 py-4"><Skeleton className="h-4 w-32" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-4 w-24" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-4 w-16" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-4 w-48" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-6 w-16 rounded-full" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-8 w-16" /></td>
                  </tr>
                ))
              ) : filteredPromociones.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-[#1B1B1B]/60">
                      <Tag className="w-12 h-12 mb-3 text-[#1B1B1B]/20" />
                      <p className="font-medium">No se encontraron promociones.</p>
                      <Button
                        variant="link"
                        onClick={() => setIsDialogOpen(true)}
                        className="text-[#F26522] mt-2"
                      >
                        Crear una nueva
                      </Button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredPromociones.map((promo) => {
                  const active = isActive(promo);
                  return (
                    <tr key={promo.id} className="bg-white hover:bg-[#F26522]/5 transition-colors">
                      <td className="px-6 py-4 text-[#1B1B1B] font-medium">{promo.nombre}</td>
                      <td className="px-6 py-4 text-[#1B1B1B]/80">{getDiscountTypeLabel(promo.tipo_descuento)}</td>
                      <td className="px-6 py-4 text-[#1B1B1B]/80 font-mono">
                        {promo.tipo_descuento === 'PORCENTAJE'
                          ? `${promo.valor_descuento}%`
                          : `Bs. ${promo.valor_descuento.toFixed(2)}`}
                      </td>
                      <td className="px-6 py-4 text-[#1B1B1B]/60 text-sm">
                        {format(new Date(promo.fecha_inicio), "dd MMM yyyy", { locale: es })} - {format(new Date(promo.fecha_fin), "dd MMM yyyy", { locale: es })}
                      </td>
                      <td className="px-6 py-4">
                        {active ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#28C76F]/10 text-[#28C76F] border border-[#28C76F]/20">
                            Activa
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#1B1B1B]/10 text-[#1B1B1B]/60 border border-[#1B1B1B]/10">
                            Inactiva
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(promo)}
                          aria-label={`Editar ${promo.nombre}`}
                          className="text-[#1B1B1B]/40 hover:text-[#F26522] hover:bg-[#F26522]/10 h-8 w-8"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteClick(promo.id)}
                          aria-label={`Eliminar ${promo.nombre}`}
                          className="text-[#1B1B1B]/40 hover:text-[#EA5455] hover:bg-[#EA5455]/10 h-8 w-8"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
