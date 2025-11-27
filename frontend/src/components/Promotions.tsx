import { useState, useEffect } from "react";
import { Plus, Search, Tag, Edit, Trash2, Loader2, Calendar, Percent } from "lucide-react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Switch } from "./ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { promocionesApi, sucursalesApi } from "../services/api";
import { Promocion, Sucursal } from "../types";
import { toast } from "sonner";

export function Promotions() {
  const [searchTerm, setSearchTerm] = useState("");
  const [promociones, setPromociones] = useState<Promocion[]>([]);
  const [sucursales, setSucursales] = useState<Sucursal[]>([]);
  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    loadPromociones();
    loadSucursales();
  }, []);

  const loadPromociones = async () => {
    try {
      setLoading(true);
      const data = await promocionesApi.obtenerTodos();
      setPromociones(data);
    } catch (error) {
      console.error("Error loading promotions:", error);
      toast.error("Error al cargar las promociones");
    } finally {
      setLoading(false);
    }
  };

  const loadSucursales = async () => {
    try {
      const data = await sucursalesApi.obtenerTodos();
      setSucursales(data);
    } catch (error) {
      console.error("Error loading locations:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const submitData: any = {
        nombre: formData.nombre,
        descripcion: formData.descripcion || undefined,
        tipo_descuento: formData.tipo_descuento,
        valor_descuento: formData.valor_descuento,
        compra_minima: formData.compra_minima || undefined,
        descuento_maximo: formData.descuento_maximo || undefined,
        fecha_inicio: new Date(formData.fecha_inicio).toISOString(),
        fecha_fin: new Date(formData.fecha_fin).toISOString(),
        activa: formData.activa,
        aplicable_a: formData.aplicable_a,
        sucursal_id: formData.sucursal_id === "none" ? undefined : formData.sucursal_id
      };

      if (editingPromotion) {
        await promocionesApi.actualizar(editingPromotion.id, submitData);
        toast.success("Promoción actualizada correctamente");
      } else {
        await promocionesApi.crear(submitData);
        toast.success("Promoción creada correctamente");
      }
      setIsDialogOpen(false);
      resetForm();
      loadPromociones();
    } catch (error: any) {
      console.error("Error saving promotion:", error);
      toast.error(error.message || "Error al guardar la promoción");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar esta promoción?")) return;
    try {
      await promocionesApi.eliminar(id);
      toast.success("Promoción eliminada correctamente");
      loadPromociones();
    } catch (error) {
      console.error("Error deleting promotion:", error);
      toast.error("Error al eliminar la promoción");
    }
  };

  const handleEdit = (promocion: Promocion) => {
    setEditingPromotion(promocion);
    setFormData({
      nombre: promocion.nombre,
      descripcion: promocion.descripcion || "",
      tipo_descuento: promocion.tipo_descuento as any,
      valor_descuento: promocion.valor_descuento,
      compra_minima: promocion.compra_minima,
      descuento_maximo: promocion.descuento_maximo,
      fecha_inicio: new Date(promocion.fecha_inicio).toISOString().slice(0, 16),
      fecha_fin: new Date(promocion.fecha_fin).toISOString().slice(0, 16),
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

  const filteredPromociones = promociones.filter(promo =>
    promo.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (promo.descripcion && promo.descripcion.toLowerCase().includes(searchTerm.toLowerCase()))
  );

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-[#FF6B35]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-white mb-2">Gestión de Promociones</h1>
          <p className="text-white/60">Administra las ofertas y descuentos</p>
        </div>
        <Button
          type="button"
          className="bg-[#FF6B35] hover:bg-[#FF6B35]/90 text-white"
          onClick={() => {
            resetForm();
            setIsDialogOpen(true);
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Nueva Promoción
        </Button>
      </div>

      <Card className="bg-white/5 border-[#FF6B35]/20 p-6">

        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogContent className="bg-[#020617] border-[#FF6B35]/20 max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-white">
                {editingPromotion ? "Editar Promoción" : "Crear Nueva Promoción"}
              </DialogTitle>
              <DialogDescription className="text-white/60">
                {editingPromotion ? "Modifica los datos de la promoción" : "Completa los datos para crear una nueva promoción"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label className="text-white/80">Nombre</Label>
                <Input
                  className="bg-white/5 border-[#FF6B35]/20 text-white"
                  placeholder="Ej: Descuento de Verano"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label className="text-white/80">Descripción</Label>
                <Textarea
                  className="bg-white/5 border-[#FF6B35]/20 text-white"
                  placeholder="Descripción de la promoción"
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-white/80">Tipo de Descuento</Label>
                  <Select
                    value={formData.tipo_descuento}
                    onValueChange={(value: 'PORCENTAJE' | 'MONTO_FIJO' | '2X1') => setFormData({ ...formData, tipo_descuento: value })}
                    required
                  >
                    <SelectTrigger className="bg-white/5 border-[#FF6B35]/20 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#020617] border-[#FF6B35]/20">
                      <SelectItem value="PORCENTAJE" className="text-white focus:bg-[#FF6B35]/20">Porcentaje</SelectItem>
                      <SelectItem value="MONTO_FIJO" className="text-white focus:bg-[#FF6B35]/20">Monto Fijo</SelectItem>
                      <SelectItem value="2X1" className="text-white focus:bg-[#FF6B35]/20">2x1</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-white/80">
                    Valor {formData.tipo_descuento === 'PORCENTAJE' ? '(%)' : '(Bs.)'}
                  </Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    className="bg-white/5 border-[#FF6B35]/20 text-white"
                    placeholder="0"
                    value={formData.valor_descuento}
                    onChange={(e) => setFormData({ ...formData, valor_descuento: parseFloat(e.target.value) || 0 })}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-white/80">Compra Mínima (Bs.)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    className="bg-white/5 border-[#FF6B35]/20 text-white"
                    placeholder="0"
                    value={formData.compra_minima || ""}
                    onChange={(e) => setFormData({ ...formData, compra_minima: e.target.value ? parseFloat(e.target.value) : undefined })}
                  />
                </div>
                <div>
                  <Label className="text-white/80">Descuento Máximo (Bs.)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    className="bg-white/5 border-[#FF6B35]/20 text-white"
                    placeholder="0"
                    value={formData.descuento_maximo || ""}
                    onChange={(e) => setFormData({ ...formData, descuento_maximo: e.target.value ? parseFloat(e.target.value) : undefined })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-white/80">Fecha de Inicio</Label>
                  <Input
                    type="datetime-local"
                    className="bg-white/5 border-[#FF6B35]/20 text-white"
                    value={formData.fecha_inicio}
                    onChange={(e) => setFormData({ ...formData, fecha_inicio: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label className="text-white/80">Fecha de Fin</Label>
                  <Input
                    type="datetime-local"
                    className="bg-white/5 border-[#FF6B35]/20 text-white"
                    value={formData.fecha_fin}
                    onChange={(e) => setFormData({ ...formData, fecha_fin: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div>
                <Label className="text-white/80">Aplicable a</Label>
                <Select
                  value={formData.aplicable_a}
                  onValueChange={(value: 'TODOS' | 'RECETAS' | 'CATEGORIAS' | 'ITEMS') => setFormData({ ...formData, aplicable_a: value })}
                >
                  <SelectTrigger className="bg-white/5 border-[#FF6B35]/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#020617] border-[#FF6B35]/20">
                    <SelectItem value="TODOS" className="text-white focus:bg-[#FF6B35]/20">Todos</SelectItem>
                    <SelectItem value="RECETAS" className="text-white focus:bg-[#FF6B35]/20">Recetas Específicas</SelectItem>
                    <SelectItem value="CATEGORIAS" className="text-white focus:bg-[#FF6B35]/20">Categorías</SelectItem>
                    <SelectItem value="ITEMS" className="text-white focus:bg-[#FF6B35]/20">Items Específicos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-white/80">Sucursal</Label>
                <Select
                  value={formData.sucursal_id}
                  onValueChange={(value) => setFormData({ ...formData, sucursal_id: value })}
                >
                  <SelectTrigger className="bg-white/5 border-[#FF6B35]/20 text-white">
                    <SelectValue placeholder="Todas las sucursales" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#020617] border-[#FF6B35]/20">
                    <SelectItem value="none" className="text-white/60 focus:bg-[#FF6B35]/20">
                      Todas las sucursales
                    </SelectItem>
                    {sucursales.map((loc) => (
                      <SelectItem key={loc.id} value={loc.id} className="text-white focus:bg-[#FF6B35]/20">
                        {loc.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="activa"
                  checked={formData.activa}
                  onCheckedChange={(checked) => setFormData({ ...formData, activa: checked })}
                />
                <Label htmlFor="activa" className="text-white/80">Activa</Label>
              </div>
              <Button type="submit" className="w-full bg-[#FF6B35] hover:bg-[#FF6B35]/90 text-white">
                {editingPromotion ? "Actualizar Promoción" : "Crear Promoción"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
          <Input
            className="pl-10 bg-white/5 border-[#FF6B35]/20 text-white"
            placeholder="Buscar promociones por nombre o descripción..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5 border-b border-[#FF6B35]/20">
              <tr>
                <th className="px-6 py-4 text-left text-white/80">Nombre</th>
                <th className="px-6 py-4 text-left text-white/80">Tipo</th>
                <th className="px-6 py-4 text-left text-white/80">Descuento</th>
                <th className="px-6 py-4 text-left text-white/80">Período</th>
                <th className="px-6 py-4 text-left text-white/80">Estado</th>
                <th className="px-6 py-4 text-left text-white/80">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredPromociones.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-white/60">
                    No se encontraron promociones.
                  </td>
                </tr>
              ) : (
                filteredPromociones.map((promo) => {
                  const active = isActive(promo);
                  return (
                    <tr key={promo.id} className="border-b border-[#FF6B35]/10 last:border-b-0">
                      <td className="px-6 py-4 text-white">{promo.nombre}</td>
                      <td className="px-6 py-4 text-white/80">{getDiscountTypeLabel(promo.tipo_descuento)}</td>
                      <td className="px-6 py-4 text-white/80">
                        {promo.tipo_descuento === 'PORCENTAJE'
                          ? `${promo.valor_descuento}%`
                          : `Bs. ${promo.valor_descuento.toFixed(2)}`}
                      </td>
                      <td className="px-6 py-4 text-white/60 text-sm">
                        {new Date(promo.fecha_inicio).toLocaleDateString('es-BO')} - {new Date(promo.fecha_fin).toLocaleDateString('es-BO')}
                      </td>
                      <td className="px-6 py-4">
                        {active ? (
                          <span className="text-green-400">Activa</span>
                        ) : (
                          <span className="text-white/60">Inactiva</span>
                        )}
                      </td>
                      <td className="px-6 py-4 flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(promo)}
                          className="text-blue-400 hover:bg-blue-500/10"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(promo.id)}
                          className="text-red-400 hover:bg-red-500/10"
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
