import { useState, useEffect } from "react";
import { Plus, Search, Shield, Edit, Trash2 } from "lucide-react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Label } from "./ui/label";
import { rolesApi } from "../services/api";
import { Rol, Permiso } from "../types";
import { toast } from "sonner";
import { Checkbox } from "./ui/checkbox";

export function Roles() {
    const [roles, setRoles] = useState<Rol[]>([]);
    const [permisos, setPermisos] = useState<Permiso[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingRole, setEditingRole] = useState<Rol | null>(null);

    const [formData, setFormData] = useState({
        nombre: "",
        descripcion: "",
        es_sistema: false,
        permisos: [] as string[]
    });

    useEffect(() => {
        loadRoles();
        loadPermisos();
    }, []);

    const loadPermisos = async () => {
        try {
            const data = await rolesApi.obtenerPermisos();
            setPermisos(data);
        } catch (error) {
            console.error("Error loading permissions:", error);
            toast.error("Error al cargar permisos");
        }
    };

    const loadRoles = async () => {
        try {
            const data = await rolesApi.obtenerTodos();
            setRoles(data);
        } catch (error) {
            console.error("Error loading roles:", error);
            toast.error("Error al cargar roles");
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingRole) {
                await rolesApi.actualizar(editingRole.id, formData as any);
                toast.success("Rol actualizado correctamente");
            } else {
                await rolesApi.crear(formData as any);
                toast.success("Rol creado correctamente");
            }
            setIsDialogOpen(false);
            resetForm();
            loadRoles();
        } catch (error: any) {
            console.error("Error saving role:", error);
            const errorData = error.response?.data || error;
            const errorMessage = errorData.detail
                ? (typeof errorData.detail === 'string' ? errorData.detail : JSON.stringify(errorData.detail))
                : "Error al guardar el rol";
            toast.error(errorMessage);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("¿Estás seguro de eliminar este rol?")) return;
        try {
            await rolesApi.eliminar(id);
            toast.success("Rol eliminado correctamente");
            loadRoles();
        } catch (error) {
            console.error("Error deleting role:", error);
            toast.error("Error al eliminar el rol");
        }
    };

    const resetForm = () => {
        setFormData({
            nombre: "",
            descripcion: "",
            es_sistema: false,
            permisos: []
        });
        setEditingRole(null);
    };

    const handleEdit = (rol: Rol) => {
        setEditingRole(rol);
        setFormData({
            nombre: rol.nombre,
            descripcion: rol.descripcion || "",
            es_sistema: rol.es_sistema,
            permisos: rol.permisos?.map(p => p.id) || []
        });
        setIsDialogOpen(true);
    };

    const filteredRoles = roles.filter(rol =>
        rol.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handlePermissionToggle = (permisoId: string) => {
        setFormData(prev => {
            const currentPermisos = prev.permisos;
            if (currentPermisos.includes(permisoId)) {
                return { ...prev, permisos: currentPermisos.filter(id => id !== permisoId) };
            } else {
                return { ...prev, permisos: [...currentPermisos, permisoId] };
            }
        });
    };

    // Agrupar permisos por recurso
    const permisosPorRecurso = permisos.reduce((acc, permiso) => {
        if (!acc[permiso.recurso]) {
            acc[permiso.recurso] = [];
        }
        acc[permiso.recurso].push(permiso);
        return acc;
    }, {} as Record<string, Permiso[]>);

    return (
        <div className="space-y-8 w-full relative">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-[#1B1B1B] mb-3 text-3xl font-bold uppercase tracking-tight">Roles y Permisos</h1>
                    <p className="text-[#1B1B1B]/60 text-base font-medium">Gestiona los roles y niveles de acceso</p>
                </div>
                <Button
                    className="bg-[#F26522] hover:bg-[#F26522]/90 text-white font-bold shadow-lg transition-all duration-300"
                    onClick={() => {
                        resetForm();
                        setIsDialogOpen(true);
                    }}
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Nuevo Rol
                </Button>
            </div>

            <Card className="bg-white border-[#F26522]/20 p-4 shadow-sm">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#1B1B1B]/40" />
                    <Input
                        className="pl-10 bg-white border-[#F26522]/20 text-[#1B1B1B] focus:border-[#F26522] focus:ring-[#F26522]/20"
                        placeholder="Buscar roles..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredRoles.map((rol) => (
                    <Card key={rol.id} className="bg-white border-[#F26522]/20 p-6 hover:bg-white hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 shadow-sm group">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-[#F26522]/10 rounded-lg group-hover:bg-[#F26522] transition-colors duration-300">
                                    <Shield className="w-6 h-6 text-[#F26522] group-hover:text-white transition-colors duration-300" />
                                </div>
                                <div>
                                    <h3 className="text-[#1B1B1B] font-bold text-lg uppercase tracking-wide">{rol.nombre}</h3>
                                    {rol.es_sistema && (
                                        <span className="text-xs font-bold uppercase tracking-wide text-[#00CFE8] bg-[#00CFE8]/10 px-2 py-0.5 rounded border border-[#00CFE8]/20">
                                            Sistema
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div className="flex gap-1">
                                {!rol.es_sistema && (
                                    <>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="text-[#1B1B1B]/40 hover:text-[#F26522] hover:bg-[#F26522]/10"
                                            onClick={() => handleEdit(rol)}
                                        >
                                            <Edit className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="text-[#1B1B1B]/40 hover:text-[#EA5455] hover:bg-[#EA5455]/10"
                                            onClick={() => handleDelete(rol.id)}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </>
                                )}
                            </div>
                        </div>
                        <p className="text-[#1B1B1B]/70 text-sm mb-4 font-medium border-t border-[#F26522]/10 pt-3">
                            {rol.descripcion || "Sin descripción"}
                        </p>
                        <div className="text-xs text-[#1B1B1B]/40 font-mono text-right">
                            Creado: {new Date(rol.fecha_creacion).toLocaleDateString('es-BO')}
                        </div>
                    </Card>
                ))}
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="bg-white border-[#F26522]/20 text-[#1B1B1B] max-w-3xl p-0 overflow-hidden">
                    <DialogHeader className="px-6 py-4 border-b border-[#F26522]/10 bg-[#F26522]/5">
                        <DialogTitle className="text-[#1B1B1B] text-xl font-bold uppercase tracking-wide">
                            {editingRole ? "Editar Rol" : "Nuevo Rol"}
                        </DialogTitle>
                        <DialogDescription className="text-[#1B1B1B]/60">
                            {editingRole ? "Modifica los permisos del rol" : "Crea un nuevo rol y asigna permisos"}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex-1 overflow-y-auto px-6 py-6 pb-6 max-h-[70vh]">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <Label className="text-[#1B1B1B] font-medium mb-1.5 block">Nombre del Rol</Label>
                                <Input
                                    className="bg-white border-[#F26522]/20 text-[#1B1B1B] focus:border-[#F26522] focus:ring-[#F26522]/20"
                                    value={formData.nombre}
                                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <Label className="text-[#1B1B1B] font-medium mb-1.5 block">Descripción</Label>
                                <Input
                                    className="bg-white border-[#F26522]/20 text-[#1B1B1B] focus:border-[#F26522] focus:ring-[#F26522]/20"
                                    value={formData.descripcion}
                                    onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                                />
                            </div>
                            <div>
                                <Label className="text-[#1B1B1B] font-medium mb-2 block uppercase text-xs tracking-wider text-[#F26522]">Permisos</Label>
                                <div className="bg-white border border-[#F26522]/20 rounded-lg p-4 max-h-60 overflow-y-auto shadow-inner">
                                    {Object.entries(permisosPorRecurso).map(([recurso, perms]) => (
                                        <div key={recurso} className="mb-4 last:mb-0">
                                            <h4 className="text-[#1B1B1B] font-bold text-sm mb-2 capitalize border-b border-[#F26522]/10 pb-1">{recurso}</h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                {perms.map(permiso => (
                                                    <div key={permiso.id} className="flex items-center space-x-2 bg-[#F26522]/5 p-2 rounded border border-transparent hover:border-[#F26522]/20 transition-colors">
                                                        <Checkbox
                                                            id={permiso.id}
                                                            checked={formData.permisos.includes(permiso.id)}
                                                            onCheckedChange={() => handlePermissionToggle(permiso.id)}
                                                            className="border-[#F26522]/40 data-[state=checked]:bg-[#F26522] data-[state=checked]:border-[#F26522]"
                                                        />
                                                        <label
                                                            htmlFor={permiso.id}
                                                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-[#1B1B1B]/80 cursor-pointer w-full"
                                                        >
                                                            {permiso.descripcion || permiso.nombre}
                                                        </label>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="pt-4 border-t border-[#F26522]/10 flex justify-end">
                                <Button type="submit" className="bg-[#F26522] hover:bg-[#F26522]/90 text-white font-bold w-full md:w-auto">
                                    {editingRole ? "Guardar Cambios" : "Crear Rol"}
                                </Button>
                            </div>
                        </form>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
