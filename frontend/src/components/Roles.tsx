import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Plus, Search, Shield, Edit, Trash2, Loader2, AlertTriangle, Info } from "lucide-react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "./ui/alert-dialog";
import { Label } from "./ui/label";
import { rolesApi } from "../services/api";
import { Rol, Permiso } from "../types";
import { toast } from "sonner";
import { Checkbox } from "./ui/checkbox";
import { Badge } from "./ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";

// --- Sub-components for Modularity ---

interface RolCardProps {
    rol: Rol;
    onEdit: (rol: Rol) => void;
    onDelete: (id: string) => void;
}

const RolCard = React.memo(({ rol, onEdit, onDelete }: RolCardProps) => (
    <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
    >
        <Card className="bg-white border-[#F26522]/20 p-6 hover:bg-white hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 shadow-sm group h-full flex flex-col justify-between relative overflow-hidden">
            {/* Decorative Top Border */}
            <div className={`absolute top-0 left-0 w-full h-1 ${rol.es_sistema ? "bg-[#00CFE8]" : "bg-[#F26522]"}`} />

            <div>
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg transition-colors duration-300 ${rol.es_sistema ? "bg-[#00CFE8]/10 group-hover:bg-[#00CFE8]" : "bg-[#F26522]/10 group-hover:bg-[#F26522]"}`}>
                            <Shield className={`w-6 h-6 transition-colors duration-300 ${rol.es_sistema ? "text-[#00CFE8] group-hover:text-white" : "text-[#F26522] group-hover:text-white"}`} />
                        </div>
                        <div>
                            <h3 className="text-[#1B1B1B] font-bold text-lg uppercase tracking-wide">{rol.nombre}</h3>
                            {rol.es_sistema && (
                                <span className="text-[10px] font-bold uppercase tracking-wider text-[#00CFE8] bg-[#00CFE8]/10 px-2 py-0.5 rounded border border-[#00CFE8]/20 flex items-center gap-1 w-fit mt-1">
                                    <Shield className="w-3 h-3" /> Sistema
                                </span>
                            )}
                        </div>
                    </div>
                    <div className="flex gap-1">
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-[#1B1B1B]/40 hover:text-[#F26522] hover:bg-[#F26522]/10 h-8 w-8"
                                    onClick={() => onEdit(rol)}
                                    aria-label={`Editar rol ${rol.nombre}`}
                                >
                                    <Edit className="w-4 h-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent><p>Editar Rol {rol.es_sistema && "(Sistema)"}</p></TooltipContent>
                        </Tooltip>

                        {!rol.es_sistema && (
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="text-[#1B1B1B]/40 hover:text-[#EA5455] hover:bg-[#EA5455]/10 h-8 w-8"
                                        onClick={() => onDelete(rol.id)}
                                        aria-label={`Eliminar rol ${rol.nombre}`}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent><p>Eliminar Rol</p></TooltipContent>
                            </Tooltip>
                        )}
                        {rol.es_sistema && (
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant="ghost" size="icon" className="text-gray-300 cursor-not-allowed">
                                        <Info className="w-4 h-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Rol de sistema (Solo permisos editables)</p>
                                </TooltipContent>
                            </Tooltip>
                        )}
                    </div>
                </div>
                <p className="text-[#1B1B1B]/70 text-sm mb-4 font-medium leading-relaxed">
                    {rol.descripcion || "Sin descripción disponible para este rol."}
                </p>
            </div>

            <div className="border-t border-[#F26522]/10 pt-3 flex justify-between items-center text-xs text-[#1B1B1B]/40 font-mono">
                <span>{rol.permisos?.length || 0} Permisos</span>
                <span>{new Date(rol.fecha_creacion).toLocaleDateString('es-BO', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
            </div>
        </Card>
    </motion.div>
));

interface PermisosSelectorProps {
    permisos: Permiso[];
    selectedPermisos: string[];
    onToggle: (id: string) => void;
    onToggleAll: (ids: string[], selected: boolean) => void;
}

const PermisosSelector = React.memo(({ permisos, selectedPermisos, onToggle, onToggleAll }: PermisosSelectorProps) => {
    // Group permissions by resource
    const permisosPorRecurso = useMemo(() => {
        return permisos.reduce((acc, permiso) => {
            const recurso = permiso.recurso || 'Otros';
            if (!acc[recurso]) acc[recurso] = [];
            acc[recurso].push(permiso);
            return acc;
        }, {} as Record<string, Permiso[]>);
    }, [permisos]);

    return (
        <div className="bg-[#F8F8F8] border border-[#F26522]/20 rounded-lg p-4 max-h-[300px] overflow-y-auto shadow-inner space-y-6">
            {/* Global Actions */}
            <div className="flex gap-2 mb-2 sticky top-0 bg-[#F8F8F8] z-10 py-1 border-b border-gray-200">
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-xs h-7 hover:bg-[#F26522]/10 hover:text-[#F26522]"
                    onClick={() => onToggleAll(permisos.map(p => p.id), true)}
                >
                    Seleccionar Todo
                </Button>
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-xs h-7 hover:bg-[#EA5455]/10 hover:text-[#EA5455]"
                    onClick={() => onToggleAll([], false)}
                >
                    Deseleccionar Todo
                </Button>
                <span className="ml-auto text-xs text-gray-500 flex items-center">
                    {selectedPermisos.length} seleccionados
                </span>
            </div>

            {Object.entries(permisosPorRecurso).sort().map(([recurso, perms]) => {
                const allSelected = perms.every(p => selectedPermisos.includes(p.id));

                return (
                    <div key={recurso} className="bg-white p-3 rounded-md shadow-sm border border-gray-100">
                        <div className="flex justify-between items-center mb-3 border-b border-[#F26522]/10 pb-2">
                            <h4 className="text-[#1B1B1B] font-bold text-sm capitalize flex items-center gap-2">
                                <span className="w-1.5 h-4 bg-[#F26522] rounded-full"></span>
                                {recurso}
                            </h4>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-6 text-[10px] px-2 text-gray-400 hover:text-[#F26522]"
                                onClick={() => {
                                    const ids = perms.map(p => p.id);
                                    onToggleAll(ids, !allSelected);
                                }}
                            >
                                {allSelected ? "Ninguno" : "Todos"}
                            </Button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2" role="group" aria-label={`Permisos de ${recurso}`}>
                            {perms.map(permiso => (
                                <label
                                    key={permiso.id}
                                    className={`flex items-start space-x-2 p-2 rounded border transition-all duration-200 cursor-pointer hover:shadow-sm ${selectedPermisos.includes(permiso.id) ? "bg-[#F26522]/5 border-[#F26522]/30" : "bg-transparent border-transparent hover:bg-gray-50"}`}
                                >
                                    <div className="pt-0.5">
                                        <Checkbox
                                            id={permiso.id}
                                            checked={selectedPermisos.includes(permiso.id)}
                                            onCheckedChange={() => onToggle(permiso.id)}
                                            className="border-[#F26522]/30 data-[state=checked]:bg-[#F26522] data-[state=checked]:border-[#F26522]"
                                        />
                                    </div>
                                    <div className="grid gap-0.5">
                                        <span className="text-xs font-medium leading-none text-[#1B1B1B]">
                                            {permiso.nombre}
                                        </span>
                                        {permiso.descripcion && (
                                            <p className="text-[10px] text-gray-400 leading-tight">{permiso.descripcion}</p>
                                        )}
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>
                );
            })}
        </div>
    );
});


// --- Main Component ---

export function Roles() {
    const [roles, setRoles] = useState<Rol[]>([]);
    const [permisos, setPermisos] = useState<Permiso[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [isLoading, setIsLoading] = useState(true);

    // Dialog States
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    // Selection States
    const [editingRole, setEditingRole] = useState<Rol | null>(null);
    const [roleToDelete, setRoleToDelete] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        nombre: "",
        descripcion: "",
        es_sistema: false,
        permisos: [] as string[]
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setIsLoading(true);
            const [rolesData, permisosData] = await Promise.all([
                rolesApi.obtenerTodos(),
                rolesApi.obtenerPermisos()
            ]);
            setRoles(rolesData);
            setPermisos(permisosData);
        } catch (error) {
            console.error("Error loading data:", error);
            toast.error("Error al cargar los datos del sistema");
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenCreate = () => {
        resetForm();
        setIsDialogOpen(true);
    };

    const handleEdit = useCallback((rol: Rol) => {
        setEditingRole(rol);
        setFormData({
            nombre: rol.nombre,
            descripcion: rol.descripcion || "",
            es_sistema: rol.es_sistema,
            permisos: rol.permisos?.map(p => p.id) || []
        });
        setIsDialogOpen(true);
    }, []);

    const handleDeleteClick = useCallback((id: string) => {
        const role = roles.find(r => r.id === id);
        if (role?.es_sistema) {
            toast.error("No se puede eliminar un rol de sistema");
            return;
        }
        setRoleToDelete(id);
        setIsDeleteDialogOpen(true);
    }, [roles]);

    const performDelete = async () => {
        if (!roleToDelete) return;

        // Optimistic update
        const previousRoles = [...roles];
        setRoles(prev => prev.filter(r => r.id !== roleToDelete));
        setIsDeleteDialogOpen(false);

        try {
            await rolesApi.eliminar(roleToDelete);
            toast.success("Rol eliminado correctamente");
            setRoleToDelete(null);
        } catch (error) {
            console.error("Error deleting role:", error);
            // Revert on error
            setRoles(previousRoles);
            toast.error("No se pudo eliminar el rol");
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (formData.nombre.length < 3) {
            toast.error("El nombre debe tener al menos 3 caracteres");
            return;
        }

        try {
            if (editingRole) {
                // Remove system role block


                await rolesApi.actualizar(editingRole.id, formData as any);
                toast.success(`Rol "${formData.nombre}" actualizado`);

                // Update local state without full reload
                setRoles(prev => prev.map(r => r.id === editingRole.id ? { ...r, ...formData, permisos: permisos.filter(p => formData.permisos.includes(p.id)) } : r));

            } else {
                await rolesApi.crear(formData as any);
                toast.success(`Rol "${formData.nombre}" creado`);
                // Use a reload for creation to get the ID properly, or mock it if we trust strict consistency
                await loadRoles(); // Fallback to reload for created items is safer for IDs
            }

            setIsDialogOpen(false);
            resetForm();
        } catch (error: any) {
            console.error("Error saving role:", error);
            const errorData = error.response?.data || error;
            const errorMessage = errorData.detail
                ? (typeof errorData.detail === 'string' ? errorData.detail : "Error de validación")
                : "Error al guardar el rol";
            toast.error(errorMessage);
        }
    };

    // Helper to reload just roles if needed
    const loadRoles = async () => {
        const data = await rolesApi.obtenerTodos();
        setRoles(data);
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

    const handlePermissionToggle = useCallback((permisoId: string) => {
        setFormData(prev => {
            const currentPermisos = new Set(prev.permisos);
            if (currentPermisos.has(permisoId)) {
                currentPermisos.delete(permisoId);
            } else {
                currentPermisos.add(permisoId);
            }
            return { ...prev, permisos: Array.from(currentPermisos) };
        });
    }, []);

    const handleToggleAllPermissions = useCallback((ids: string[], selected: boolean) => {
        setFormData(prev => {
            const currentPermisos = new Set(prev.permisos);
            if (selected) {
                ids.forEach(id => currentPermisos.add(id));
            } else {
                if (ids.length === 0) {
                    // Clear all if ids is empty (Total deselect)
                    return { ...prev, permisos: [] };
                }
                ids.forEach(id => currentPermisos.delete(id));
            }
            return { ...prev, permisos: Array.from(currentPermisos) };
        });
    }, []);

    const filteredRoles = useMemo(() =>
        roles.filter(rol => rol.nombre.toLowerCase().includes(searchTerm.toLowerCase())),
        [roles, searchTerm]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="w-8 h-8 animate-spin text-[#F26522]" />
            </div>
        );
    }

    return (
        <TooltipProvider>
            <div className="space-y-8 w-full relative">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-[#1B1B1B] mb-2 text-3xl font-bold uppercase tracking-tight">Roles y Permisos</h1>
                        <p className="text-[#1B1B1B]/60 text-base font-medium">Gestiona los roles y niveles de acceso</p>
                    </div>
                    <Button
                        className="bg-[#F26522] hover:bg-[#F26522]/90 text-white font-bold shadow-lg transition-all duration-300"
                        onClick={handleOpenCreate}
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
                            placeholder="Buscar roles por nombre..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </Card>

                {filteredRoles.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-lg border border-dashed border-gray-300">
                        <Shield className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500 font-medium">No se encontraron roles.</p>
                        {searchTerm && <p className="text-sm text-gray-400">Prueba con otra búsqueda.</p>}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <AnimatePresence>
                            {filteredRoles.map((rol) => (
                                <RolCard
                                    key={rol.id}
                                    rol={rol}
                                    onEdit={handleEdit}
                                    onDelete={handleDeleteClick}
                                />
                            ))}
                        </AnimatePresence>
                    </div>
                )}

                {/* Create/Edit Dialog */}
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogContent className="bg-white border-[#F26522]/20 text-[#1B1B1B] max-w-3xl p-0 overflow-hidden max-h-[90vh] flex flex-col">
                        <DialogHeader className="px-6 py-4 border-b border-[#F26522]/10 bg-[#F26522]/5 shrink-0">
                            <DialogTitle className="text-[#1B1B1B] text-xl font-bold uppercase tracking-wide">
                                {editingRole ? "Editar Rol" : "Nuevo Rol"}
                            </DialogTitle>
                            <DialogDescription className="text-[#1B1B1B]/60">
                                {editingRole ? "Modifica los permisos del rol" : "Crea un nuevo rol y asigna permisos"}
                            </DialogDescription>
                        </DialogHeader>

                        <div className="flex-1 overflow-y-auto px-6 py-6">
                            <form id="role-form" onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <Label className="text-[#1B1B1B] font-medium mb-1.5 block">Nombre del Rol <span className="text-[#EA5455]">*</span></Label>
                                        <Input
                                            className="bg-white border-[#F26522]/20 text-[#1B1B1B] focus:border-[#F26522] focus:ring-[#F26522]/20"
                                            value={formData.nombre}
                                            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                                            placeholder="Ej: Gerente de Ventas"
                                            required
                                            minLength={3}
                                            disabled={editingRole?.es_sistema}
                                            title={editingRole?.es_sistema ? "El nombre de roles de sistema no se puede cambiar" : ""}
                                        />
                                    </div>
                                    <div>
                                        <Label className="text-[#1B1B1B] font-medium mb-1.5 block">Descripción</Label>
                                        <Input
                                            className="bg-white border-[#F26522]/20 text-[#1B1B1B] focus:border-[#F26522] focus:ring-[#F26522]/20"
                                            value={formData.descripcion}
                                            onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                                            placeholder="Breve descripción de responsabilidades"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <Label className="text-[#1B1B1B] font-bold text-sm uppercase tracking-wider text-[#F26522]">
                                            Permisos del Sistema
                                        </Label>
                                        <Badge variant="outline" className="border-[#F26522]/20 text-[#F26522]">
                                            {formData.permisos.length} seleccionados
                                        </Badge>
                                    </div>

                                    <PermisosSelector
                                        permisos={permisos}
                                        selectedPermisos={formData.permisos}
                                        onToggle={handlePermissionToggle}
                                        onToggleAll={handleToggleAllPermissions}
                                    />
                                </div>
                            </form>
                        </div>

                        <div className="p-4 border-t border-[#F26522]/10 bg-gray-50 flex justify-end gap-3 shrink-0">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => setIsDialogOpen(false)}
                                className="text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="submit"
                                form="role-form"
                                className="bg-[#F26522] hover:bg-[#F26522]/90 text-white font-bold min-w-[120px]"
                            >
                                {editingRole ? "Guardar Cambios" : "Crear Rol"}
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>

                {/* Delete Confirmation Dialog */}
                <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                    <AlertDialogContent className="bg-white border-[#F26522]/20 text-[#1B1B1B]">
                        <AlertDialogHeader>
                            <AlertDialogTitle className="flex items-center gap-2 text-[#EA5455]">
                                <AlertTriangle className="w-5 h-5" />
                                ¿Eliminar este rol permanentemente?
                            </AlertDialogTitle>
                            <AlertDialogDescription className="text-[#1B1B1B]/70">
                                Esta acción no se puede deshacer. Los usuarios asignados a este rol podrían perder acceso a funcionalidades del sistema.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel className="border-[#1B1B1B]/10 hover:bg-[#1B1B1B]/5 text-[#1B1B1B]">Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={performDelete} className="bg-[#EA5455] hover:bg-[#EA5455]/90 text-white">
                                Eliminar Rol
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </TooltipProvider>
    );
}
