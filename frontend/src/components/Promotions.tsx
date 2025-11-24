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
import { promotionsApi, businessLocationsApi, type Promotion as ApiPromotion, type BusinessLocation } from "../services/api";
import { toast } from "sonner";

interface Promotion {
  id: string;
  name: string;
  description?: string;
  discount_type: 'percentage' | 'fixed_amount' | 'buy_x_get_y';
  discount_value: number;
  min_purchase?: number;
  max_discount?: number;
  start_date: string;
  end_date: string;
  is_active: boolean;
  applicable_to?: 'all' | 'recipes' | 'categories' | 'specific_items';
  applicable_ids?: string[];
  location_id?: string;
  created_at: string;
  user_id?: string;
}

export function Promotions() {
  const [searchTerm, setSearchTerm] = useState("");
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [locations, setLocations] = useState<BusinessLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    discount_type: "percentage" as 'percentage' | 'fixed_amount' | 'buy_x_get_y',
    discount_value: 0,
    min_purchase: undefined as number | undefined,
    max_discount: undefined as number | undefined,
    start_date: "",
    end_date: "",
    is_active: true,
    applicable_to: "all" as 'all' | 'recipes' | 'categories' | 'specific_items',
    location_id: "none"
  });

  useEffect(() => {
    loadPromotions();
    loadLocations();
  }, []);

  const loadPromotions = async () => {
    try {
      setLoading(true);
      const data = await promotionsApi.getAll();
      setPromotions(data);
    } catch (error) {
      console.error("Error loading promotions:", error);
      toast.error("Error al cargar las promociones");
    } finally {
      setLoading(false);
    }
  };

  const loadLocations = async () => {
    try {
      const data = await businessLocationsApi.getAll();
      setLocations(data);
    } catch (error) {
      console.error("Error loading locations:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const submitData: any = {
        name: formData.name,
        description: formData.description || undefined,
        discount_type: formData.discount_type,
        discount_value: formData.discount_value,
        min_purchase: formData.min_purchase || undefined,
        max_discount: formData.max_discount || undefined,
        start_date: new Date(formData.start_date).toISOString(),
        end_date: new Date(formData.end_date).toISOString(),
        is_active: formData.is_active,
        applicable_to: formData.applicable_to,
        location_id: formData.location_id === "none" ? undefined : formData.location_id
      };

      if (editingPromotion) {
        await promotionsApi.update(editingPromotion.id, submitData);
        toast.success("Promoción actualizada correctamente");
      } else {
        await promotionsApi.create(submitData);
        toast.success("Promoción creada correctamente");
      }
      setIsDialogOpen(false);
      resetForm();
      loadPromotions();
    } catch (error: any) {
      console.error("Error saving promotion:", error);
      toast.error(error.message || "Error al guardar la promoción");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar esta promoción?")) return;
    try {
      await promotionsApi.delete(id);
      toast.success("Promoción eliminada correctamente");
      loadPromotions();
    } catch (error) {
      console.error("Error deleting promotion:", error);
      toast.error("Error al eliminar la promoción");
    }
  };

  const handleEdit = (promotion: Promotion) => {
    setEditingPromotion(promotion);
    setFormData({
      name: promotion.name,
      description: promotion.description || "",
      discount_type: promotion.discount_type,
      discount_value: promotion.discount_value,
      min_purchase: promotion.min_purchase,
      max_discount: promotion.max_discount,
      start_date: new Date(promotion.start_date).toISOString().split('T')[0],
      end_date: new Date(promotion.end_date).toISOString().split('T')[0],
      is_active: promotion.is_active,
      applicable_to: promotion.applicable_to || "all",
      location_id: promotion.location_id || "none"
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      discount_type: "percentage",
      discount_value: 0,
      min_purchase: undefined,
      max_discount: undefined,
      start_date: "",
      end_date: "",
      is_active: true,
      applicable_to: "all",
      location_id: "none"
    });
    setEditingPromotion(null);
  };

  const filteredPromotions = promotions.filter(promo =>
    promo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (promo.description && promo.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getDiscountTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      percentage: "Porcentaje",
      fixed_amount: "Monto Fijo",
      buy_x_get_y: "Compra X Lleva Y"
    };
    return labels[type] || type;
  };

  const isActive = (promo: Promotion) => {
    const now = new Date();
    const start = new Date(promo.start_date);
    const end = new Date(promo.end_date);
    return promo.is_active && now >= start && now <= end;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-[#209C8A]" />
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
          className="bg-[#209C8A] hover:bg-[#209C8A]/90 text-white"
          onClick={() => {
            resetForm();
            setIsDialogOpen(true);
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Nueva Promoción
        </Button>
      </div>

      <Card className="bg-white/5 border-[#209C8A]/20 p-6">

        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogContent className="bg-[#020617] border-[#209C8A]/20 max-h-[90vh] overflow-y-auto">
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
                  className="bg-white/5 border-[#209C8A]/20 text-white"
                  placeholder="Ej: Descuento de Verano"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label className="text-white/80">Descripción</Label>
                <Textarea
                  className="bg-white/5 border-[#209C8A]/20 text-white"
                  placeholder="Descripción de la promoción"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-white/80">Tipo de Descuento</Label>
                  <Select
                    value={formData.discount_type}
                    onValueChange={(value: 'percentage' | 'fixed_amount' | 'buy_x_get_y') => setFormData({ ...formData, discount_type: value })}
                    required
                  >
                    <SelectTrigger className="bg-white/5 border-[#209C8A]/20 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#020617] border-[#209C8A]/20">
                      <SelectItem value="percentage" className="text-white focus:bg-[#209C8A]/20">Porcentaje</SelectItem>
                      <SelectItem value="fixed_amount" className="text-white focus:bg-[#209C8A]/20">Monto Fijo</SelectItem>
                      <SelectItem value="buy_x_get_y" className="text-white focus:bg-[#209C8A]/20">Compra X Lleva Y</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-white/80">
                    Valor {formData.discount_type === 'percentage' ? '(%)' : '(Bs.)'}
                  </Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    className="bg-white/5 border-[#209C8A]/20 text-white"
                    placeholder="0"
                    value={formData.discount_value}
                    onChange={(e) => setFormData({ ...formData, discount_value: parseFloat(e.target.value) || 0 })}
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
                    className="bg-white/5 border-[#209C8A]/20 text-white"
                    placeholder="0"
                    value={formData.min_purchase || ""}
                    onChange={(e) => setFormData({ ...formData, min_purchase: e.target.value ? parseFloat(e.target.value) : undefined })}
                  />
                </div>
                <div>
                  <Label className="text-white/80">Descuento Máximo (Bs.)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    className="bg-white/5 border-[#209C8A]/20 text-white"
                    placeholder="0"
                    value={formData.max_discount || ""}
                    onChange={(e) => setFormData({ ...formData, max_discount: e.target.value ? parseFloat(e.target.value) : undefined })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-white/80">Fecha de Inicio</Label>
                  <Input
                    type="datetime-local"
                    className="bg-white/5 border-[#209C8A]/20 text-white"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label className="text-white/80">Fecha de Fin</Label>
                  <Input
                    type="datetime-local"
                    className="bg-white/5 border-[#209C8A]/20 text-white"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div>
                <Label className="text-white/80">Aplicable a</Label>
                <Select
                  value={formData.applicable_to}
                  onValueChange={(value: 'all' | 'recipes' | 'categories' | 'specific_items') => setFormData({ ...formData, applicable_to: value })}
                >
                  <SelectTrigger className="bg-white/5 border-[#209C8A]/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#020617] border-[#209C8A]/20">
                    <SelectItem value="all" className="text-white focus:bg-[#209C8A]/20">Todos</SelectItem>
                    <SelectItem value="recipes" className="text-white focus:bg-[#209C8A]/20">Recetas Específicas</SelectItem>
                    <SelectItem value="categories" className="text-white focus:bg-[#209C8A]/20">Categorías</SelectItem>
                    <SelectItem value="specific_items" className="text-white focus:bg-[#209C8A]/20">Items Específicos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-white/80">Sucursal</Label>
                <Select
                  value={formData.location_id}
                  onValueChange={(value) => setFormData({ ...formData, location_id: value })}
                >
                  <SelectTrigger className="bg-white/5 border-[#209C8A]/20 text-white">
                    <SelectValue placeholder="Todas las sucursales" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#020617] border-[#209C8A]/20">
                    <SelectItem value="none" className="text-white/60 focus:bg-[#209C8A]/20">
                      Todas las sucursales
                    </SelectItem>
                    {locations.map((loc) => (
                      <SelectItem key={loc.id} value={loc.id} className="text-white focus:bg-[#209C8A]/20">
                        {loc.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label htmlFor="is_active" className="text-white/80">Activa</Label>
              </div>
              <Button type="submit" className="w-full bg-[#209C8A] hover:bg-[#209C8A]/90 text-white">
                {editingPromotion ? "Actualizar Promoción" : "Crear Promoción"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
          <Input
            className="pl-10 bg-white/5 border-[#209C8A]/20 text-white"
            placeholder="Buscar promociones por nombre o descripción..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5 border-b border-[#209C8A]/20">
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
              {filteredPromotions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-white/60">
                    No se encontraron promociones.
                  </td>
                </tr>
              ) : (
                filteredPromotions.map((promo) => {
                  const active = isActive(promo);
                  return (
                    <tr key={promo.id} className="border-b border-[#209C8A]/10 last:border-b-0">
                      <td className="px-6 py-4 text-white">{promo.name}</td>
                      <td className="px-6 py-4 text-white/80">{getDiscountTypeLabel(promo.discount_type)}</td>
                      <td className="px-6 py-4 text-white/80">
                        {promo.discount_type === 'percentage'
                          ? `${promo.discount_value}%`
                          : `Bs. ${promo.discount_value.toFixed(2)}`}
                      </td>
                      <td className="px-6 py-4 text-white/60 text-sm">
                        {new Date(promo.start_date).toLocaleDateString('es-BO')} - {new Date(promo.end_date).toLocaleDateString('es-BO')}
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

