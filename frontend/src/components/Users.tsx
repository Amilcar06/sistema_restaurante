import { useState, useEffect, useMemo, useRef } from "react";
import { Plus, Search, Edit, Trash2, Loader2, Shield, ShieldCheck, AlertTriangle } from "lucide-react";
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
import { Switch } from "./ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { usuariosApi, sucursalesApi, rolesApi } from "../services/api";
import { Usuario, Sucursal, Rol } from "../types";
import { toast } from "sonner";
import axios from "axios";

export function Users() {
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState<Usuario[]>([]);
  const [sucursales, setSucursales] = useState<Sucursal[]>([]);
  const [roles, setRoles] = useState<Rol[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Dialog states
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<Usuario | null>(null);

  // Refs for auto-focus
  const firstInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    email: "",
    nombre_usuario: "",
    nombre_completo: "",
    telefono: "",
    contrasena: "",
    activo: true,
    es_superusuario: false,
    rol_id: "none",
    sucursal_default_id: "none"
  });

  // Auto-focus on dialog open
  useEffect(() => {
    if (isDialogOpen) {
      setTimeout(() => firstInputRef.current?.focus(), 50);
    }
  }, [isDialogOpen]);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [usersData, sucursalesData, rolesData] = await Promise.all([
        usuariosApi.obtenerTodos(),
        sucursalesApi.obtenerTodos(),
        rolesApi.obtenerTodos()
      ]);
      setUsers(usersData);
      setSucursales(sucursalesData);
      setRoles(rolesData);
    } catch (error) {
      console.error("Error loading initial data:", error);
      toast.error("Error al cargar los datos del sistema");
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const data = await usuariosApi.obtenerTodos();
      setUsers(data);
    } catch (error) {
      console.error("Error loading users:", error);
    }
  };

  // Helper to update form data
  const updateForm = (key: keyof typeof formData, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  // Filter users with useMemo to prevent unnecessary re-renders
  const filteredUsers = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return users.filter(user =>
      user.nombre_usuario.toLowerCase().includes(term) ||
      user.email.toLowerCase().includes(term) ||
      (user.nombre_completo && user.nombre_completo.toLowerCase().includes(term))
    );
  }, [users, searchTerm]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;

    try {
      setSaving(true);
      const submitData: any = {
        email: formData.email,
        nombre_usuario: formData.nombre_usuario,
        nombre_completo: formData.nombre_completo || undefined,
        telefono: formData.telefono || undefined,
        activo: formData.activo,
        es_superusuario: formData.es_superusuario,
        rol_id: formData.es_superusuario ? undefined : (formData.rol_id === "none" ? undefined : formData.rol_id),
        sucursal_default_id: formData.es_superusuario ? undefined : (formData.sucursal_default_id === "none" ? undefined : formData.sucursal_default_id)
      };

      if (editingUser) {
        if (formData.contrasena) {
          submitData.contrasena = formData.contrasena;
        }
        await usuariosApi.actualizar(editingUser.id, submitData);
        toast.success("Usuario actualizado correctamente");
      } else {
        if (!formData.contrasena) {
          toast.error("La contraseña es requerida para nuevos usuarios");
          return;
        }
        submitData.contrasena = formData.contrasena;
        await usuariosApi.crear(submitData);
        toast.success("Usuario creado correctamente");
      }
      setIsDialogOpen(false);
      resetForm();
      loadUsers();
    } catch (error: any) {
      console.error("Error saving user:", error);
      let errorMessage = "Error al guardar el usuario";
      if (axios.isAxiosError(error)) {
        errorMessage = error.response?.data?.detail || error.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = (id: string) => {
    setUserToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!userToDelete) return;
    try {
      await usuariosApi.eliminar(userToDelete);
      toast.success("Usuario eliminado correctamente");
      loadUsers();
    } catch (error: any) {
      console.error("Error deleting user:", error);
      const errorMessage = axios.isAxiosError(error)
        ? error.response?.data?.detail || "Error al eliminar"
        : "Error al eliminar el usuario";
      toast.error(errorMessage);
    } finally {
      setIsDeleteDialogOpen(false);
      setUserToDelete(null);
    }
  };

  const handleEdit = (user: Usuario) => {
    setEditingUser(user);
    setFormData({
      email: user.email,
      nombre_usuario: user.nombre_usuario,
      nombre_completo: user.nombre_completo || "",
      telefono: user.telefono || "",
      contrasena: "",
      activo: user.activo,
      es_superusuario: user.es_superusuario,
      rol_id: user.rol_id || "none",
      sucursal_default_id: user.sucursal_default_id || "none"
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      email: "",
      nombre_usuario: "",
      nombre_completo: "",
      telefono: "",
      contrasena: "",
      activo: true,
      es_superusuario: false,
      rol_id: "none",
      sucursal_default_id: "none"
    });
    setEditingUser(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-[#F26522]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[#1B1B1B] text-3xl font-bold mb-2 uppercase tracking-tight">Gestión de Usuarios</h1>
          <p className="text-[#1B1B1B]/60 font-medium">Administra acceso y roles del sistema</p>
        </div>
        <Button
          type="button"
          className="bg-[#F26522] hover:bg-[#F26522]/90 text-white font-bold shadow-lg transition-all"
          onClick={() => {
            resetForm();
            setIsDialogOpen(true);
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Usuario
        </Button>
      </div>

      <Card className="bg-white border-[#F26522]/20 p-6 shadow-sm">
        {/* Delete Alert Dialog */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent className="bg-white border-[#F26522]/20 text-[#1B1B1B]">
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2 text-[#EA5455]">
                <AlertTriangle className="w-5 h-5" />
                ¿Estás absolutamente seguro?
              </AlertDialogTitle>
              <AlertDialogDescription className="text-[#1B1B1B]/70">
                Esta acción no se puede deshacer. Esto eliminará permanentemente al usuario y removerá sus datos de nuestros servidores.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="border-[#1B1B1B]/10 hover:bg-[#1B1B1B]/5 text-[#1B1B1B]">Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-[#EA5455] hover:bg-[#EA5455]/90 text-white">
                Eliminar Usuario
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Create/Edit Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={(open: boolean) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogContent className="bg-white border-[#F26522]/20 text-[#1B1B1B] max-h-[90vh] overflow-y-auto p-0 sm:max-w-lg">
            <DialogHeader className="px-6 py-4 border-b border-[#F26522]/10 bg-[#F26522]/5">
              <DialogTitle className="text-[#1B1B1B] text-xl font-bold uppercase tracking-wide">
                {editingUser ? "Editar Usuario" : "Crear Nuevo Usuario"}
              </DialogTitle>
              <DialogDescription className="text-[#1B1B1B]/60">
                {editingUser ? "Modifica los datos del usuario" : "Completa los datos para crear un nuevo usuario"}
              </DialogDescription>
            </DialogHeader>
            <div className="p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <Label className="text-[#1B1B1B] font-medium mb-1.5 block">Email</Label>
                    <Input
                      ref={firstInputRef}
                      type="email"
                      className="bg-white border-[#F26522]/20 text-[#1B1B1B] focus:border-[#F26522] focus:ring-[#F26522]/20"
                      placeholder="usuario@ejemplo.com"
                      value={formData.email}
                      onChange={(e) => updateForm("email", e.target.value)}
                      pattern="^[^\s@]+@[^\s@]+\.[^\s@]+$"
                      title="Ingresa un correo electrónico válido"
                      required
                    />
                  </div>
                  <div>
                    <Label className="text-[#1B1B1B] font-medium mb-1.5 block">Nombre de Usuario</Label>
                    <Input
                      className="bg-white border-[#F26522]/20 text-[#1B1B1B] focus:border-[#F26522] focus:ring-[#F26522]/20"
                      placeholder="usuario123"
                      value={formData.nombre_usuario}
                      onChange={(e) => updateForm("nombre_usuario", e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label className="text-[#1B1B1B] font-medium mb-1.5 block">Teléfono</Label>
                    <Input
                      className="bg-white border-[#F26522]/20 text-[#1B1B1B] focus:border-[#F26522] focus:ring-[#F26522]/20"
                      placeholder="+591 70000000"
                      value={formData.telefono}
                      onChange={(e) => updateForm("telefono", e.target.value)}
                      pattern="^[0-9+\s-]{6,}$"
                      title="Número telefónico válido (mínimo 6 dígitos)"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-[#1B1B1B] font-medium mb-1.5 block">Nombre Completo</Label>
                  <Input
                    className="bg-white border-[#F26522]/20 text-[#1B1B1B] focus:border-[#F26522] focus:ring-[#F26522]/20"
                    placeholder="Juan Pérez"
                    value={formData.nombre_completo}
                    onChange={(e) => updateForm("nombre_completo", e.target.value)}
                  />
                </div>

                <div>
                  <Label className="text-[#1B1B1B] font-medium mb-1.5 block">
                    Contraseña {editingUser && <span className="text-[#F26522] text-xs font-normal">(Dejar vacío para mantener actual)</span>}
                  </Label>
                  <Input
                    type="password"
                    className="bg-white border-[#F26522]/20 text-[#1B1B1B] focus:border-[#F26522] focus:ring-[#F26522]/20"
                    placeholder="••••••••"
                    value={formData.contrasena}
                    onChange={(e) => updateForm("contrasena", e.target.value)}
                    required={!editingUser}
                    minLength={6}
                  />
                </div>

                {/* Superuser Switch - Influences disable state of others */}
                <div className="flex items-center space-x-2 bg-[#F26522]/5 p-3 rounded-lg border border-[#F26522]/10">
                  <Switch
                    id="es_superusuario"
                    checked={formData.es_superusuario}
                    onCheckedChange={(checked: boolean) => updateForm("es_superusuario", checked)}
                    className="data-[state=checked]:bg-[#F26522]"
                    aria-label="Activar modo Superusuario"
                  />
                  <div>
                    <Label htmlFor="es_superusuario" className="text-[#1B1B1B] font-bold cursor-pointer">Superusuario (Admin Total)</Label>
                    <p className="text-xs text-[#1B1B1B]/60">Tiene acceso total a todas las sucursales y configuraciones.</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className={`font-medium mb-1.5 block ${formData.es_superusuario ? "text-gray-400" : "text-[#1B1B1B]"}`}>Sucursal Default</Label>
                    <Select
                      value={formData.sucursal_default_id}
                      onValueChange={(value: string) => updateForm("sucursal_default_id", value)}
                      disabled={formData.es_superusuario}
                    >
                      <SelectTrigger className="bg-white border-[#F26522]/20 text-[#1B1B1B] disabled:opacity-50">
                        <SelectValue placeholder="Selecciona" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-[#F26522]/20 z-[9999]">
                        <SelectItem value="none" className="text-[#1B1B1B]/60">(Ninguna)</SelectItem>
                        {sucursales.map((loc) => (
                          <SelectItem key={loc.id} value={loc.id} className="text-[#1B1B1B]">{loc.nombre}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className={`font-medium mb-1.5 block ${formData.es_superusuario ? "text-gray-400" : "text-[#1B1B1B]"}`}>Rol de Usuario</Label>
                    <Select
                      value={formData.rol_id}
                      onValueChange={(value: string) => updateForm("rol_id", value)}
                      disabled={formData.es_superusuario}
                    >
                      <SelectTrigger className="bg-white border-[#F26522]/20 text-[#1B1B1B] disabled:opacity-50">
                        <SelectValue placeholder="Selecciona" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-[#F26522]/20 z-[9999]">
                        <SelectItem value="none" className="text-[#1B1B1B]/60">(Sin rol)</SelectItem>
                        {roles.map((rol) => (
                          <SelectItem key={rol.id} value={rol.id} className="text-[#1B1B1B]">{rol.nombre}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center space-x-2 pt-2">
                  <Switch
                    id="activo"
                    checked={formData.activo}
                    onCheckedChange={(checked: boolean) => updateForm("activo", checked)}
                    className="data-[state=checked]:bg-[#28C76F]"
                    aria-label="Activar o desactivar cuenta de usuario"
                  />
                  <Label htmlFor="activo" className="text-[#1B1B1B] font-medium">Cuenta Activa</Label>
                </div>

                <div className="pt-4 border-t border-[#F26522]/10 mt-4">
                  <Button
                    type="submit"
                    className="w-full bg-[#F26522] hover:bg-[#F26522]/90 text-white font-bold shadow-md"
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Guardando...
                      </>
                    ) : (
                      editingUser ? "Actualizar Usuario" : "Crear Usuario"
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </DialogContent>
        </Dialog>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#1B1B1B]/40" />
          <Input
            className="pl-10 bg-white border-[#F26522]/20 text-[#1B1B1B] focus:border-[#F26522] focus:ring-[#F26522]/20"
            placeholder="Buscar usuarios por nombre, email o usuario..."
            value={searchTerm}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="overflow-x-auto rounded-lg border border-[#F26522]/20 max-h-[70vh] overflow-y-auto scrollbar-thin scrollbar-thumb-[#F26522]/20 scrollbar-track-transparent">
          <table className="w-full" role="table" aria-label="Lista de usuarios">
            <thead className="bg-[#F26522]/10 border-b border-[#F26522]/20 sticky top-0 z-10 backdrop-blur-sm">
              <tr>
                <th className="px-6 py-4 text-left text-[#1B1B1B] font-bold uppercase tracking-wider text-xs">Usuario</th>
                <th className="px-6 py-4 text-left text-[#1B1B1B] font-bold uppercase tracking-wider text-xs">Email</th>
                <th className="px-6 py-4 text-left text-[#1B1B1B] font-bold uppercase tracking-wider text-xs">Nombre</th>
                <th className="px-6 py-4 text-left text-[#1B1B1B] font-bold uppercase tracking-wider text-xs">Teléfono</th>
                <th className="px-6 py-4 text-left text-[#1B1B1B] font-bold uppercase tracking-wider text-xs">Estado</th>
                <th className="px-6 py-4 text-left text-[#1B1B1B] font-bold uppercase tracking-wider text-xs">Rol</th>
                <th className="px-6 py-4 text-left text-[#1B1B1B] font-bold uppercase tracking-wider text-xs">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F26522]/10">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-[#1B1B1B]/60 font-medium">
                    No se encontraron usuarios.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-[#F26522]/5 transition-colors group">
                    <td className="px-6 py-4 text-[#1B1B1B] font-medium">{user.nombre_usuario}</td>
                    <td className="px-6 py-4 text-[#1B1B1B]/80">{user.email}</td>
                    <td className="px-6 py-4 text-[#1B1B1B]/80">{user.nombre_completo || "-"}</td>
                    <td className="px-6 py-4 text-[#1B1B1B]/80 tabular-nums">{user.telefono || "-"}</td>
                    <td className="px-6 py-4">
                      {user.activo ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#28C76F]/10 text-[#28C76F] border border-[#28C76F]/20">
                          Activo
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#EA5455]/10 text-[#EA5455] border border-[#EA5455]/20">
                          Inactivo
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-[#1B1B1B]/80">
                      {user.es_superusuario ? (
                        <span className="flex items-center text-yellow-500 font-bold bg-yellow-500/10 px-2 py-1 rounded w-fit">
                          <ShieldCheck className="w-4 h-4 mr-1.5" />
                          Super Admin
                        </span>
                      ) : (
                        <span className="flex items-center text-[#1B1B1B]/70">
                          <Shield className="w-4 h-4 mr-1.5 text-[#F26522]" />
                          {roles.find(r => r.id === user.rol_id)?.nombre || "Usuario"}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(user)}
                        className="text-[#1B1B1B]/40 hover:text-[#F26522] hover:bg-[#F26522]/10"
                        title="Editar usuario"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => confirmDelete(user.id)}
                        className="text-[#1B1B1B]/40 hover:text-[#EA5455] hover:bg-[#EA5455]/10"
                        disabled={user.es_superusuario}
                        title={user.es_superusuario ? "No se puede eliminar un superusuario" : "Eliminar usuario"}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
