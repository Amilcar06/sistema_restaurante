import { useState, useEffect } from "react";
import { Plus, Search, Truck, Edit, Trash2, Loader2, Star } from "lucide-react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Switch } from "./ui/switch";
import { proveedoresApi } from "../services/api";
import { Proveedor } from "../types";
import { toast } from "sonner";

export function Suppliers() {
  const [searchTerm, setSearchTerm] = useState("");
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Proveedor | null>(null);
  const [formData, setFormData] = useState({
    nombre: "",
    nombre_contacto: "",
    telefono: "",
    email: "",
    direccion: "",
    ciudad: "",
    zona: "",
    nit: "",
    terminos_pago: "",
    calificacion: 0,
    activo: true,
    notas: "",
  });

  useEffect(() => {
    loadProveedores();
  }, []);

  const loadProveedores = async () => {
    try {
      setLoading(true);
      const data = await proveedoresApi.obtenerTodos();
      setProveedores(data);
    } catch (error) {
      console.error("Error loading suppliers:", error);
      toast.error("Error al cargar los proveedores");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (proveedor?: Proveedor) => {
    if (proveedor) {
      setEditingSupplier(proveedor);
      setFormData({
        nombre: proveedor.nombre,
        nombre_contacto: proveedor.nombre_contacto || "",
        telefono: proveedor.telefono || "",
        email: proveedor.email || "",
        direccion: proveedor.direccion || "",
        ciudad: proveedor.ciudad || "",
        zona: proveedor.zona || "",
        nit: proveedor.nit || "",
        terminos_pago: proveedor.terminos_pago || "",
        calificacion: proveedor.calificacion || 0,
        activo: proveedor.activo,
        notas: proveedor.notas || "",
      });
    } else {
      setEditingSupplier(null);
      setFormData({
        nombre: "",
        nombre_contacto: "",
        telefono: "",
        email: "",
        direccion: "",
        ciudad: "",
        zona: "",
        nit: "",
        terminos_pago: "",
        calificacion: 0,
        activo: true,
        notas: "",
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
        await proveedoresApi.actualizar(editingSupplier.id, formData);
        toast.success("Proveedor actualizado exitosamente");
      } else {
        await proveedoresApi.crear(formData);
        toast.success("Proveedor creado exitosamente");
      }
      handleCloseDialog();
      loadProveedores();
    } catch (error: any) {
      console.error("Error saving supplier:", error);
      toast.error(error.message || "Error al guardar el proveedor");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar este proveedor?")) return;
    try {
      await proveedoresApi.eliminar(id);
      toast.success("Proveedor eliminado exitosamente");
      loadProveedores();
    } catch (error: any) {
      console.error("Error deleting supplier:", error);
      toast.error(error.message || "Error al eliminar el proveedor");
    }
  };

  const filteredProveedores = proveedores.filter((proveedor) =>
    proveedor.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    proveedor.nombre_contacto?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    proveedor.email?.toLowerCase().includes(searchTerm.toLowerCase())
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
          className="bg-[#FF6B35] hover:bg-[#FF6B35]/90 text-white"
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
          className="pl-10 bg-white/5 border-[#FF6B35]/20 text-white"
        />
      </div>

      {/* Suppliers List */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="w-8 h-8 text-[#FF6B35] animate-spin" />
        </div>
      ) : filteredProveedores.length === 0 ? (
        <Card className="bg-white/5 border-[#FF6B35]/20 p-12 text-center">
          <Truck className="w-16 h-16 text-white/20 mx-auto mb-4" />
          <p className="text-white/60">No hay proveedores registrados</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProveedores.map((proveedor) => (
            <Card
              key={proveedor.id}
              className="bg-white/5 border-[#FF6B35]/20 p-6 hover:border-[#FF6B35]/40 transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Truck className="w-5 h-5 text-[#FF6B35]" />
                  <div>
                    <h3 className="text-white font-semibold">{proveedor.nombre}</h3>
                    {proveedor.calificacion && (
                      <div className="flex items-center gap-1 mt-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 ${i < Math.round(proveedor.calificacion!)
                                ? "text-yellow-400 fill-yellow-400"
                                : "text-white/20"
                              }`}
                          />
                        ))}
                        <span className="text-xs text-white/60 ml-1">
                          {proveedor.calificacion.toFixed(1)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleOpenDialog(proveedor)}
                    className="text-[#FF6B35] hover:bg-[#FF6B35]/20"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(proveedor.id)}
                    className="text-red-400 hover:bg-red-500/20"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                {proveedor.nombre_contacto && (
                  <p className="text-white/80">
                    <span className="text-white/60">Contacto:</span> {proveedor.nombre_contacto}
                  </p>
                )}
                {proveedor.telefono && (
                  <p className="text-white/80">
                    <span className="text-white/60">Teléfono:</span> {proveedor.telefono}
                  </p>
                )}
                {proveedor.email && (
                  <p className="text-white/80">
                    <span className="text-white/60">Email:</span> {proveedor.email}
                  </p>
                )}
                {proveedor.ciudad && (
                  <p className="text-white/80">
                    <span className="text-white/60">Ubicación:</span> {proveedor.ciudad}
                    {proveedor.zona && `, ${proveedor.zona}`}
                  </p>
                )}
                {proveedor.terminos_pago && (
                  <p className="text-white/80">
                    <span className="text-white/60">Términos:</span> {proveedor.terminos_pago}
                  </p>
                )}
                <div className="flex items-center gap-2 pt-2">
                  <span className={`text-xs px-2 py-1 rounded ${proveedor.activo
                      ? "bg-green-500/20 text-green-400"
                      : "bg-red-500/20 text-red-400"
                    }`}>
                    {proveedor.activo ? "Activo" : "Inactivo"}
                  </span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-[#020617] border-[#FF6B35]/20 text-white max-w-3xl max-h-[90vh] overflow-y-auto">
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
                className="bg-white/5 border-[#FF6B35]/20 text-white"
                placeholder="Ej: Distribuidora ABC"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-white/80">Contacto</Label>
                <Input
                  className="bg-white/5 border-[#FF6B35]/20 text-white"
                  placeholder="Nombre del contacto"
                  value={formData.nombre_contacto}
                  onChange={(e) => setFormData({ ...formData, nombre_contacto: e.target.value })}
                />
              </div>
              <div>
                <Label className="text-white/80">Teléfono</Label>
                <Input
                  className="bg-white/5 border-[#FF6B35]/20 text-white"
                  placeholder="777-XXXXX"
                  value={formData.telefono}
                  onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label className="text-white/80">Email</Label>
              <Input
                type="email"
                className="bg-white/5 border-[#FF6B35]/20 text-white"
                placeholder="proveedor@email.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div>
              <Label className="text-white/80">Dirección</Label>
              <Input
                className="bg-white/5 border-[#FF6B35]/20 text-white"
                placeholder="Dirección completa"
                value={formData.direccion}
                onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-white/80">Ciudad</Label>
                <Input
                  className="bg-white/5 border-[#FF6B35]/20 text-white"
                  placeholder="La Paz"
                  value={formData.ciudad}
                  onChange={(e) => setFormData({ ...formData, ciudad: e.target.value })}
                />
              </div>
              <div>
                <Label className="text-white/80">Zona</Label>
                <Input
                  className="bg-white/5 border-[#FF6B35]/20 text-white"
                  placeholder="Ej: Sopocachi"
                  value={formData.zona}
                  onChange={(e) => setFormData({ ...formData, zona: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-white/80">NIT / RUC</Label>
                <Input
                  className="bg-white/5 border-[#FF6B35]/20 text-white"
                  placeholder="Número de identificación tributaria"
                  value={formData.nit}
                  onChange={(e) => setFormData({ ...formData, nit: e.target.value })}
                />
              </div>
              <div>
                <Label className="text-white/80">Términos de Pago</Label>
                <Input
                  className="bg-white/5 border-[#FF6B35]/20 text-white"
                  placeholder="Ej: 30 días, Contado"
                  value={formData.terminos_pago}
                  onChange={(e) => setFormData({ ...formData, terminos_pago: e.target.value })}
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
                className="bg-white/5 border-[#FF6B35]/20 text-white"
                placeholder="0"
                value={formData.calificacion || ""}
                onChange={(e) => setFormData({ ...formData, calificacion: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div>
              <Label className="text-white/80">Notas</Label>
              <Textarea
                className="bg-white/5 border-[#FF6B35]/20 text-white"
                placeholder="Información adicional sobre el proveedor"
                rows={3}
                value={formData.notas}
                onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
              />
            </div>
            <div className="flex items-center gap-2 pt-2">
              <Switch
                checked={formData.activo}
                onCheckedChange={(checked) => setFormData({ ...formData, activo: checked })}
              />
              <Label className="text-white/80">Proveedor Activo</Label>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseDialog}
                className="border-[#FF6B35]/20 text-white hover:bg-white/5"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="bg-[#FF6B35] hover:bg-[#FF6B35]/90 text-white"
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
