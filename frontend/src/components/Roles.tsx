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
                    <h1 className="text-foreground mb-3 text-3xl font-bold">Roles y Permisos</h1>
                    <p className="text-muted-foreground text-base">Gestiona los roles y niveles de acceso</p>
                </div>
                <Button
                    className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg"
                    onClick={() => {
                        resetForm();
                        setIsDialogOpen(true);
                    }}
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Nuevo Rol
                </Button>
            </div>

            <Card className="bg-card border-primary/20 p-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                        className="pl-10 bg-muted/50 border-primary/20 text-foreground"
                        placeholder="Buscar roles..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredRoles.map((rol) => (
                    <Card key={rol.id} className="bg-card border-primary/20 p-6 hover:bg-muted/50 transition-all">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary/20 rounded-lg">
                                    <Shield className="w-6 h-6 text-primary" />
                                </div>
                                <div>
                                    <h3 className="text-foreground font-bold text-lg">{rol.nombre}</h3>
                                    {rol.es_sistema && (
                                        <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full">
                                            Sistema
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div className="flex gap-2">
                                {!rol.es_sistema && (
                                    <>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="text-muted-foreground hover:text-foreground"
                                            onClick={() => handleEdit(rol)}
                                        >
                                            <Edit className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="text-muted-foreground hover:text-destructive"
                                            onClick={() => handleDelete(rol.id)}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </>
                                )}
                            </div>
                        </div>
                        <p className="text-muted-foreground text-sm mb-4">
                            {rol.descripcion || "Sin descripción"}
                        </p>
                        <div className="text-xs text-muted-foreground">
                            Creado: {new Date(rol.fecha_creacion).toLocaleDateString()}
                        </div>
                    </Card>
                ))}
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="bg-card border-primary/20 max-w-3xl">
                    <DialogHeader>
                        <DialogTitle className="text-foreground">
                            {editingRole ? "Editar Rol" : "Nuevo Rol"}
                        </DialogTitle>
                        <DialogDescription className="text-muted-foreground">
                            {editingRole ? "Modifica los permisos del rol" : "Crea un nuevo rol y asigna permisos"}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex-1 overflow-y-auto px-1 pr-2 pb-6">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <Label className="text-foreground/80">Nombre del Rol</Label>
                                <Input
                                    className="bg-muted/50 border-primary/20 text-foreground"
                                    value={formData.nombre}
                                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <Label className="text-foreground/80">Descripción</Label>
                                <Input
                                    className="bg-muted/50 border-primary/20 text-foreground"
                                    value={formData.descripcion}
                                    onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                                />
                            </div>
                            <div>
                                <Label className="text-foreground/80 mb-2 block">Permisos</Label>
                                <div className="bg-muted/50 border border-primary/20 rounded-lg p-4 max-h-60 overflow-y-auto">
                                    {Object.entries(permisosPorRecurso).map(([recurso, perms]) => (
                                        <div key={recurso} className="mb-4 last:mb-0">
                                            <h4 className="text-primary font-semibold text-sm mb-2 capitalize">{recurso}</h4>
                                            <div className="grid grid-cols-1 gap-2">
                                                {perms.map(permiso => (
                                                    <div key={permiso.id} className="flex items-center space-x-2">
                                                        <Checkbox
                                                            id={permiso.id}
                                                            checked={formData.permisos.includes(permiso.id)}
                                                            onCheckedChange={() => handlePermissionToggle(permiso.id)}
                                                            className="border-muted-foreground data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                                                        />
                                                        <label
                                                            htmlFor={permiso.id}
                                                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-foreground/80"
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
                            <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                                {editingRole ? "Guardar Cambios" : "Crear Rol"}
                            </Button>
                        </form>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
