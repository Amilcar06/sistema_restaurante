import { useState, useEffect } from "react";
import { Plus, Search, Truck, Edit, Trash2, Loader2, Star } from "lucide-react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Switch } from "./ui/switch";
import { suppliersApi, type Supplier } from "../services/api";
import { toast } from "sonner";

export function Suppliers() {
  const [searchTerm, setSearchTerm] = useState("");
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    contact_name: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    zone: "",
    tax_id: "",
    payment_terms: "",
    rating: 0,
    is_active: true,
    notes: "",
  });

  useEffect(() => {
    loadSuppliers();
  }, []);

  const loadSuppliers = async () => {
    try {
      setLoading(true);
      const data = await suppliersApi.getAll();
      setSuppliers(data);
    } catch (error) {
      console.error("Error loading suppliers:", error);
      toast.error("Error al cargar los proveedores");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (supplier?: Supplier) => {
    if (supplier) {
      setEditingSupplier(supplier);
      setFormData({
        name: supplier.name,
        contact_name: supplier.contact_name || "",
        phone: supplier.phone || "",
        email: supplier.email || "",
        address: supplier.address || "",
        city: supplier.city || "",
        zone: supplier.zone || "",
        tax_id: supplier.tax_id || "",
        payment_terms: supplier.payment_terms || "",
        rating: supplier.rating || 0,
        is_active: supplier.is_active,
        notes: supplier.notes || "",
      });
    } else {
      setEditingSupplier(null);
      setFormData({
        name: "",
        contact_name: "",
        phone: "",
        email: "",
        address: "",
        city: "",
        zone: "",
        tax_id: "",
        payment_terms: "",
        rating: 0,
        is_active: true,
        notes: "",
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingSupplier(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingSupplier) {
        await suppliersApi.update(editingSupplier.id, formData);
        toast.success("Proveedor actualizado exitosamente");
      } else {
        await suppliersApi.create(formData);
        toast.success("Proveedor creado exitosamente");
      }
      handleCloseDialog();
      loadSuppliers();
    } catch (error: any) {
      console.error("Error saving supplier:", error);
      toast.error(error.message || "Error al guardar el proveedor");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar este proveedor?")) return;
    try {
      await suppliersApi.delete(id);
      toast.success("Proveedor eliminado exitosamente");
      loadSuppliers();
    } catch (error: any) {
      console.error("Error deleting supplier:", error);
      toast.error(error.message || "Error al eliminar el proveedor");
    }
  };

  const filteredSuppliers = suppliers.filter((supplier) =>
    supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.contact_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-white text-3xl font-bold mb-2">Proveedores</h1>
          <p className="text-white/60">Gestiona tus proveedores de insumos</p>
        </div>
        <Button
          onClick={() => handleOpenDialog()}
          className="bg-[#209C8A] hover:bg-[#209C8A]/90 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Proveedor
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 w-5 h-5" />
        <Input
          placeholder="Buscar proveedores..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 bg-white/5 border-[#209C8A]/20 text-white"
        />
      </div>

      {/* Suppliers List */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="w-8 h-8 text-[#209C8A] animate-spin" />
        </div>
      ) : filteredSuppliers.length === 0 ? (
        <Card className="bg-white/5 border-[#209C8A]/20 p-12 text-center">
          <Truck className="w-16 h-16 text-white/20 mx-auto mb-4" />
          <p className="text-white/60">No hay proveedores registrados</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSuppliers.map((supplier) => (
            <Card
              key={supplier.id}
              className="bg-white/5 border-[#209C8A]/20 p-6 hover:border-[#209C8A]/40 transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Truck className="w-5 h-5 text-[#209C8A]" />
                  <div>
                    <h3 className="text-white font-semibold">{supplier.name}</h3>
                    {supplier.rating && (
                      <div className="flex items-center gap-1 mt-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 ${
                              i < Math.round(supplier.rating!)
                                ? "text-yellow-400 fill-yellow-400"
                                : "text-white/20"
                            }`}
                          />
                        ))}
                        <span className="text-xs text-white/60 ml-1">
                          {supplier.rating.toFixed(1)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleOpenDialog(supplier)}
                    className="text-[#209C8A] hover:bg-[#209C8A]/20"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(supplier.id)}
                    className="text-red-400 hover:bg-red-500/20"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                {supplier.contact_name && (
                  <p className="text-white/80">
                    <span className="text-white/60">Contacto:</span> {supplier.contact_name}
                  </p>
                )}
                {supplier.phone && (
                  <p className="text-white/80">
                    <span className="text-white/60">Teléfono:</span> {supplier.phone}
                  </p>
                )}
                {supplier.email && (
                  <p className="text-white/80">
                    <span className="text-white/60">Email:</span> {supplier.email}
                  </p>
                )}
                {supplier.city && (
                  <p className="text-white/80">
                    <span className="text-white/60">Ubicación:</span> {supplier.city}
                    {supplier.zone && `, ${supplier.zone}`}
                  </p>
                )}
                {supplier.payment_terms && (
                  <p className="text-white/80">
                    <span className="text-white/60">Términos:</span> {supplier.payment_terms}
                  </p>
                )}
                <div className="flex items-center gap-2 pt-2">
                  <span className={`text-xs px-2 py-1 rounded ${
                    supplier.is_active
                      ? "bg-green-500/20 text-green-400"
                      : "bg-red-500/20 text-red-400"
                  }`}>
                    {supplier.is_active ? "Activo" : "Inactivo"}
                  </span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-[#020617] border-[#209C8A]/20 text-white max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white">
              {editingSupplier ? "Editar Proveedor" : "Nuevo Proveedor"}
            </DialogTitle>
            <DialogDescription className="text-white/60">
              {editingSupplier
                ? "Modifica los datos del proveedor"
                : "Completa los datos para crear un nuevo proveedor"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label className="text-white/80">Nombre del Proveedor *</Label>
              <Input
                required
                className="bg-white/5 border-[#209C8A]/20 text-white"
                placeholder="Ej: Distribuidora ABC"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-white/80">Contacto</Label>
                <Input
                  className="bg-white/5 border-[#209C8A]/20 text-white"
                  placeholder="Nombre del contacto"
                  value={formData.contact_name}
                  onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
                />
              </div>
              <div>
                <Label className="text-white/80">Teléfono</Label>
                <Input
                  className="bg-white/5 border-[#209C8A]/20 text-white"
                  placeholder="777-XXXXX"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label className="text-white/80">Email</Label>
              <Input
                type="email"
                className="bg-white/5 border-[#209C8A]/20 text-white"
                placeholder="proveedor@email.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div>
              <Label className="text-white/80">Dirección</Label>
              <Input
                className="bg-white/5 border-[#209C8A]/20 text-white"
                placeholder="Dirección completa"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-white/80">Ciudad</Label>
                <Input
                  className="bg-white/5 border-[#209C8A]/20 text-white"
                  placeholder="La Paz"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                />
              </div>
              <div>
                <Label className="text-white/80">Zona</Label>
                <Input
                  className="bg-white/5 border-[#209C8A]/20 text-white"
                  placeholder="Ej: Sopocachi"
                  value={formData.zone}
                  onChange={(e) => setFormData({ ...formData, zone: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-white/80">NIT / RUC</Label>
                <Input
                  className="bg-white/5 border-[#209C8A]/20 text-white"
                  placeholder="Número de identificación tributaria"
                  value={formData.tax_id}
                  onChange={(e) => setFormData({ ...formData, tax_id: e.target.value })}
                />
              </div>
              <div>
                <Label className="text-white/80">Términos de Pago</Label>
                <Input
                  className="bg-white/5 border-[#209C8A]/20 text-white"
                  placeholder="Ej: 30 días, Contado"
                  value={formData.payment_terms}
                  onChange={(e) => setFormData({ ...formData, payment_terms: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label className="text-white/80">Calificación (1-5)</Label>
              <Input
                type="number"
                min="1"
                max="5"
                step="0.1"
                className="bg-white/5 border-[#209C8A]/20 text-white"
                placeholder="0"
                value={formData.rating || ""}
                onChange={(e) => setFormData({ ...formData, rating: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div>
              <Label className="text-white/80">Notas</Label>
              <Textarea
                className="bg-white/5 border-[#209C8A]/20 text-white"
                placeholder="Información adicional sobre el proveedor"
                rows={3}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>
            <div className="flex items-center gap-2 pt-2">
              <Switch
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
              <Label className="text-white/80">Proveedor Activo</Label>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseDialog}
                className="border-[#209C8A]/20 text-white hover:bg-white/5"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="bg-[#209C8A] hover:bg-[#209C8A]/90 text-white"
              >
                {editingSupplier ? "Actualizar" : "Crear"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

