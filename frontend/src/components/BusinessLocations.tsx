import { useState, useEffect } from "react";
import { Plus, Search, MapPin, Edit, Trash2, Loader2, Building2 } from "lucide-react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";
import { businessLocationsApi, type BusinessLocation } from "../services/api";
import { toast } from "sonner";

export function BusinessLocations() {
  const [searchTerm, setSearchTerm] = useState("");
  const [locations, setLocations] = useState<BusinessLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<BusinessLocation | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    city: "La Paz",
    zone: "",
    phone: "",
    email: "",
    is_main: false,
    is_active: true,
  });

  useEffect(() => {
    loadLocations();
  }, []);

  const loadLocations = async () => {
    try {
      setLoading(true);
      const data = await businessLocationsApi.getAll();
      setLocations(data);
    } catch (error) {
      console.error("Error loading locations:", error);
      toast.error("Error al cargar las sucursales");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (location?: BusinessLocation) => {
    if (location) {
      setEditingLocation(location);
      setFormData({
        name: location.name,
        address: location.address,
        city: location.city || "La Paz",
        zone: location.zone || "",
        phone: location.phone || "",
        email: location.email || "",
        is_main: location.is_main,
        is_active: location.is_active,
      });
    } else {
      setEditingLocation(null);
      setFormData({
        name: "",
        address: "",
        city: "La Paz",
        zone: "",
        phone: "",
        email: "",
        is_main: false,
        is_active: true,
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingLocation(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingLocation) {
        await businessLocationsApi.update(editingLocation.id, formData);
        toast.success("Sucursal actualizada exitosamente");
      } else {
        await businessLocationsApi.create(formData);
        toast.success("Sucursal creada exitosamente");
      }
      handleCloseDialog();
      loadLocations();
    } catch (error: any) {
      console.error("Error saving location:", error);
      toast.error(error.message || "Error al guardar la sucursal");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar esta sucursal?")) return;
    try {
      await businessLocationsApi.delete(id);
      toast.success("Sucursal eliminada exitosamente");
      loadLocations();
    } catch (error: any) {
      console.error("Error deleting location:", error);
      toast.error(error.message || "Error al eliminar la sucursal");
    }
  };

  const filteredLocations = locations.filter((location) =>
    location.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    location.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-white text-3xl font-bold mb-2">Sucursales</h1>
          <p className="text-white/60">Gestiona las ubicaciones de tu negocio</p>
        </div>
        <Button
          onClick={() => handleOpenDialog()}
          className="bg-[#209C8A] hover:bg-[#209C8A]/90 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nueva Sucursal
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 w-5 h-5" />
        <Input
          placeholder="Buscar sucursales..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 bg-white/5 border-[#209C8A]/20 text-white"
        />
      </div>

      {/* Locations List */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="w-8 h-8 text-[#209C8A] animate-spin" />
        </div>
      ) : filteredLocations.length === 0 ? (
        <Card className="bg-white/5 border-[#209C8A]/20 p-12 text-center">
          <Building2 className="w-16 h-16 text-white/20 mx-auto mb-4" />
          <p className="text-white/60">No hay sucursales registradas</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredLocations.map((location) => (
            <Card
              key={location.id}
              className="bg-white/5 border-[#209C8A]/20 p-6 hover:border-[#209C8A]/40 transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-[#209C8A]" />
                  <div>
                    <h3 className="text-white font-semibold">{location.name}</h3>
                    {location.is_main && (
                      <span className="text-xs text-[#209C8A] bg-[#209C8A]/20 px-2 py-1 rounded">
                        Principal
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleOpenDialog(location)}
                    className="text-[#209C8A] hover:bg-[#209C8A]/20"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(location.id)}
                    className="text-red-400 hover:bg-red-500/20"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <p className="text-white/80">
                  <span className="text-white/60">Dirección:</span> {location.address}
                </p>
                <p className="text-white/80">
                  <span className="text-white/60">Ciudad:</span> {location.city}
                  {location.zone && `, ${location.zone}`}
                </p>
                {location.phone && (
                  <p className="text-white/80">
                    <span className="text-white/60">Teléfono:</span> {location.phone}
                  </p>
                )}
                {location.email && (
                  <p className="text-white/80">
                    <span className="text-white/60">Email:</span> {location.email}
                  </p>
                )}
                <div className="flex items-center gap-2 pt-2">
                  <span className={`text-xs px-2 py-1 rounded ${
                    location.is_active
                      ? "bg-green-500/20 text-green-400"
                      : "bg-red-500/20 text-red-400"
                  }`}>
                    {location.is_active ? "Activa" : "Inactiva"}
                  </span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-[#020617] border-[#209C8A]/20 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white">
              {editingLocation ? "Editar Sucursal" : "Nueva Sucursal"}
            </DialogTitle>
            <DialogDescription className="text-white/60">
              {editingLocation
                ? "Modifica los datos de la sucursal"
                : "Completa los datos para crear una nueva sucursal"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label className="text-white/80">Nombre de la Sucursal *</Label>
              <Input
                required
                className="bg-white/5 border-[#209C8A]/20 text-white"
                placeholder="Ej: Sucursal Centro"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div>
              <Label className="text-white/80">Dirección *</Label>
              <Input
                required
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
                  placeholder="Ej: Sopocachi, Centro"
                  value={formData.zone}
                  onChange={(e) => setFormData({ ...formData, zone: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-white/80">Teléfono</Label>
                <Input
                  className="bg-white/5 border-[#209C8A]/20 text-white"
                  placeholder="777-XXXXX"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              <div>
                <Label className="text-white/80">Email</Label>
                <Input
                  type="email"
                  className="bg-white/5 border-[#209C8A]/20 text-white"
                  placeholder="sucursal@restaurante.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>
            <div className="flex items-center justify-between pt-4">
              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.is_main}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_main: checked })}
                />
                <Label className="text-white/80">Sucursal Principal</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label className="text-white/80">Activa</Label>
              </div>
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
                {editingLocation ? "Actualizar" : "Crear"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

