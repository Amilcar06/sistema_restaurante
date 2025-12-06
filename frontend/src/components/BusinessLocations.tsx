import { useState, useEffect } from "react";
import { Plus, Search, MapPin, Edit, Trash2, Loader2, Building2 } from "lucide-react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";
import { sucursalesApi } from "../services/api";
import { Sucursal } from "../types";
import { toast } from "sonner";

export function BusinessLocations() {
  const [searchTerm, setSearchTerm] = useState("");
  const [sucursales, setSucursales] = useState<Sucursal[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Sucursal | null>(null);
  const [formData, setFormData] = useState({
    nombre: "",
    direccion: "",
    ciudad: "La Paz",
    zona: "",
    telefono: "",
    email: "",
    es_principal: false,
    activa: true,
  });

  useEffect(() => {
    loadSucursales();
  }, []);

  const loadSucursales = async () => {
    try {
      setLoading(true);
      const data = await sucursalesApi.obtenerTodos();
      setSucursales(data);
    } catch (error) {
      console.error("Error loading locations:", error);
      toast.error("Error al cargar las sucursales");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (sucursal?: Sucursal) => {
    if (sucursal) {
      setEditingLocation(sucursal);
      setFormData({
        nombre: sucursal.nombre,
        direccion: sucursal.direccion,
        ciudad: sucursal.ciudad || "La Paz",
        zona: sucursal.zona || "",
        telefono: sucursal.telefono || "",
        email: sucursal.email || "",
        es_principal: sucursal.es_principal,
        activa: sucursal.activa,
      });
    } else {
      setEditingLocation(null);
      setFormData({
        nombre: "",
        direccion: "",
        ciudad: "La Paz",
        zona: "",
        telefono: "",
        email: "",
        es_principal: false,
        activa: true,
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
        await sucursalesApi.actualizar(editingLocation.id, formData);
        toast.success("Sucursal actualizada exitosamente");
      } else {
        await sucursalesApi.crear(formData);
        toast.success("Sucursal creada exitosamente");
      }
      handleCloseDialog();
      loadSucursales();
    } catch (error: any) {
      console.error("Error saving location:", error);
      toast.error(error.message || "Error al guardar la sucursal");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar esta sucursal?")) return;
    try {
      await sucursalesApi.eliminar(id);
      toast.success("Sucursal eliminada exitosamente");
      loadSucursales();
    } catch (error: any) {
      console.error("Error deleting location:", error);
      toast.error(error.message || "Error al eliminar la sucursal");
    }
  };

  const filteredSucursales = sucursales.filter((sucursal) =>
    sucursal.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sucursal.direccion.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[#1B1B1B] text-3xl font-bold mb-2 uppercase tracking-tight">Sucursales</h1>
          <p className="text-[#1B1B1B]/60 font-medium">Gestiona las ubicaciones de tu negocio</p>
        </div>
        <Button
          onClick={() => handleOpenDialog()}
          className="bg-[#F26522] hover:bg-[#F26522]/90 text-white font-bold shadow-lg transition-all duration-300"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nueva Sucursal
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#1B1B1B]/40 w-5 h-5" />
        <Input
          placeholder="Buscar sucursales..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 bg-white border-[#F26522]/20 text-[#1B1B1B] focus:border-[#F26522] focus:ring-[#F26522]/20"
        />
      </div>

      {/* Locations List */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="w-8 h-8 text-[#F26522] animate-spin" />
        </div>
      ) : filteredSucursales.length === 0 ? (
        <Card className="bg-white border-[#F26522]/20 p-12 text-center shadow-sm">
          <Building2 className="w-16 h-16 text-[#1B1B1B]/20 mx-auto mb-4" />
          <p className="text-[#1B1B1B]/60 text-lg font-medium">No hay sucursales registradas</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSucursales.map((sucursal) => (
            <Card
              key={sucursal.id}
              className="bg-white border-[#F26522]/20 p-6 hover:bg-white hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 shadow-sm group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="bg-[#F26522]/10 p-2 rounded-lg group-hover:bg-[#F26522] transition-colors duration-300">
                    <MapPin className="w-5 h-5 text-[#F26522] group-hover:text-white transition-colors duration-300" />
                  </div>
                  <div>
                    <h3 className="text-[#1B1B1B] font-bold text-lg">{sucursal.nombre}</h3>
                    {sucursal.es_principal && (
                      <span className="text-xs font-bold uppercase tracking-wide text-[#F26522] bg-[#F26522]/10 px-2 py-0.5 rounded border border-[#F26522]/20">
                        Principal
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleOpenDialog(sucursal)}
                    className="text-[#1B1B1B]/40 hover:text-[#F26522] hover:bg-[#F26522]/10"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(sucursal.id)}
                    className="text-[#1B1B1B]/40 hover:text-[#EA5455] hover:bg-[#EA5455]/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div className="space-y-3 text-sm">
                <p className="text-[#1B1B1B]/80 flex items-start gap-2">
                  <span className="text-[#1B1B1B]/40 font-semibold min-w-[70px]">Dirección:</span>
                  <span className="font-medium">{sucursal.direccion}</span>
                </p>
                <p className="text-[#1B1B1B]/80 flex items-start gap-2">
                  <span className="text-[#1B1B1B]/40 font-semibold min-w-[70px]">Ciudad:</span>
                  <span className="font-medium">{sucursal.ciudad}{sucursal.zona && `, ${sucursal.zona}`}</span>
                </p>
                {sucursal.telefono && (
                  <p className="text-[#1B1B1B]/80 flex items-center gap-2">
                    <span className="text-[#1B1B1B]/40 font-semibold min-w-[70px]">Teléfono:</span>
                    <span className="font-medium tabular-nums">{sucursal.telefono}</span>
                  </p>
                )}
                {sucursal.email && (
                  <p className="text-[#1B1B1B]/80 flex items-center gap-2">
                    <span className="text-[#1B1B1B]/40 font-semibold min-w-[70px]">Email:</span>
                    <span className="font-medium">{sucursal.email}</span>
                  </p>
                )}
                <div className="flex items-center gap-2 pt-3 border-t border-[#F26522]/10 mt-2">
                  <span className={`text-xs px-2 py-1 rounded-full font-bold uppercase tracking-wide border ${sucursal.activa
                    ? "bg-[#28C76F]/10 text-[#28C76F] border-[#28C76F]/20"
                    : "bg-[#EA5455]/10 text-[#EA5455] border-[#EA5455]/20"
                    }`}>
                    {sucursal.activa ? "Activa" : "Inactiva"}
                  </span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-white border-[#F26522]/20 text-[#1B1B1B] max-w-2xl p-0 overflow-hidden">
          <DialogHeader className="px-6 py-4 border-b border-[#F26522]/10 bg-[#F26522]/5">
            <DialogTitle className="text-[#1B1B1B] text-xl font-bold uppercase tracking-wide">
              {editingLocation ? "Editar Sucursal" : "Nueva Sucursal"}
            </DialogTitle>
            <DialogDescription className="text-[#1B1B1B]/60">
              {editingLocation
                ? "Modifica los datos de la sucursal"
                : "Completa los datos para crear una nueva sucursal"}
            </DialogDescription>
          </DialogHeader>
          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label className="text-[#1B1B1B] font-medium mb-1.5 block">Nombre de la Sucursal *</Label>
                <Input
                  required
                  className="bg-white border-[#F26522]/20 text-[#1B1B1B] focus:border-[#F26522] focus:ring-[#F26522]/20"
                  placeholder="Ej: Sucursal Centro"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                />
              </div>
              <div>
                <Label className="text-[#1B1B1B] font-medium mb-1.5 block">Dirección *</Label>
                <Input
                  required
                  className="bg-white border-[#F26522]/20 text-[#1B1B1B] focus:border-[#F26522] focus:ring-[#F26522]/20"
                  placeholder="Dirección completa"
                  value={formData.direccion}
                  onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-[#1B1B1B] font-medium mb-1.5 block">Ciudad</Label>
                  <Input
                    className="bg-white border-[#F26522]/20 text-[#1B1B1B] focus:border-[#F26522] focus:ring-[#F26522]/20"
                    placeholder="La Paz"
                    value={formData.ciudad}
                    onChange={(e) => setFormData({ ...formData, ciudad: e.target.value })}
                  />
                </div>
                <div>
                  <Label className="text-[#1B1B1B] font-medium mb-1.5 block">Zona</Label>
                  <Input
                    className="bg-white border-[#F26522]/20 text-[#1B1B1B] focus:border-[#F26522] focus:ring-[#F26522]/20"
                    placeholder="Ej: Sopocachi, Centro"
                    value={formData.zona}
                    onChange={(e) => setFormData({ ...formData, zona: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-[#1B1B1B] font-medium mb-1.5 block">Teléfono</Label>
                  <Input
                    className="bg-white border-[#F26522]/20 text-[#1B1B1B] focus:border-[#F26522] focus:ring-[#F26522]/20"
                    placeholder="777-XXXXX"
                    value={formData.telefono}
                    onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                  />
                </div>
                <div>
                  <Label className="text-[#1B1B1B] font-medium mb-1.5 block">Email</Label>
                  <Input
                    type="email"
                    className="bg-white border-[#F26522]/20 text-[#1B1B1B] focus:border-[#F26522] focus:ring-[#F26522]/20"
                    placeholder="sucursal@restaurante.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex items-center justify-between pt-4 pb-2">
                <div className="flex items-center gap-3">
                  <Switch
                    checked={formData.es_principal}
                    onCheckedChange={(checked: boolean) => setFormData({ ...formData, es_principal: checked })}
                    className="data-[state=checked]:bg-[#F26522]"
                  />
                  <Label className="text-[#1B1B1B] font-medium">Sucursal Principal</Label>
                </div>
                <div className="flex items-center gap-3">
                  <Switch
                    checked={formData.activa}
                    onCheckedChange={(checked: boolean) => setFormData({ ...formData, activa: checked })}
                    className="data-[state=checked]:bg-[#28C76F]"
                  />
                  <Label className="text-[#1B1B1B] font-medium">Activa</Label>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-6 border-t border-[#F26522]/10">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCloseDialog}
                  className="border-[#1B1B1B]/20 text-[#1B1B1B] hover:bg-[#1B1B1B]/5"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="bg-[#F26522] hover:bg-[#F26522]/90 text-white font-bold"
                >
                  {editingLocation ? "Actualizar" : "Crear"}
                </Button>
              </div>
            </form>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
