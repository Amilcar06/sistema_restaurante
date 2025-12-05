import { useState, useEffect } from "react";
import { Plus, Search, Edit, Trash2, Loader2, Shield, ShieldCheck } from "lucide-react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { usuariosApi, sucursalesApi, rolesApi } from "../services/api";
import { Usuario, Sucursal, Rol } from "../types";
import { toast } from "sonner";

export function Users() {
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState<Usuario[]>([]);
  const [sucursales, setSucursales] = useState<Sucursal[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<Usuario | null>(null);

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

  const [roles, setRoles] = useState<Rol[]>([]);

  useEffect(() => {
    loadUsers();
    loadSucursales();
    loadRoles();
  }, []);

  const loadRoles = async () => {
    try {
      const data = await rolesApi.obtenerTodos();
      setRoles(data);
    } catch (error) {
      console.error("Error loading roles:", error);
    }
  };

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await usuariosApi.obtenerTodos();
      setUsers(data);
    } catch (error) {
      console.error("Error loading users:", error);
      toast.error("Error al cargar los usuarios");
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
        email: formData.email,
        nombre_usuario: formData.nombre_usuario,
        nombre_completo: formData.nombre_completo || undefined,
        telefono: formData.telefono || undefined,
        activo: formData.activo,
        es_superusuario: formData.es_superusuario,
        rol_id: formData.rol_id === "none" ? undefined : formData.rol_id,
        sucursal_default_id: formData.sucursal_default_id === "none" ? undefined : formData.sucursal_default_id
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
      if (error?.message) {
        errorMessage = error.message;
      } else if (error?.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      }
      toast.error(errorMessage);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar este usuario?")) return;
    try {
      await usuariosApi.eliminar(id);
      toast.success("Usuario eliminado correctamente");
      loadUsers();
    } catch (error: any) {
      console.error("Error deleting user:", error);
      const errorMessage = error?.response?.data?.detail || error?.message || "Error al eliminar el usuario";
      toast.error(errorMessage);
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

  const filteredUsers = users.filter(user =>
    user.nombre_usuario.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.nombre_completo && user.nombre_completo.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-foreground mb-2">Gestión de Usuarios</h1>
          <p className="text-muted-foreground">Administra los usuarios del sistema</p>
        </div>
        <Button
          type="button"
          className="bg-primary hover:bg-primary/90 text-primary-foreground"
          onClick={() => {
            resetForm();
            setIsDialogOpen(true);
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Usuario
        </Button>
      </div>

      <Card className="bg-card border-primary/20 p-6">

        <Dialog open={isDialogOpen} onOpenChange={(open: boolean) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogContent className="bg-card border-primary/20 max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-foreground">
                {editingUser ? "Editar Usuario" : "Crear Nuevo Usuario"}
              </DialogTitle>
              <DialogDescription className="text-muted-foreground">
                {editingUser ? "Modifica los datos del usuario" : "Completa los datos para crear un nuevo usuario"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label className="text-foreground/80">Email</Label>
                <Input
                  type="email"
                  className="bg-muted/50 border-primary/20 text-foreground"
                  placeholder="usuario@ejemplo.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label className="text-foreground/80">Nombre de Usuario</Label>
                <Input
                  className="bg-muted/50 border-primary/20 text-foreground"
                  placeholder="usuario123"
                  value={formData.nombre_usuario}
                  onChange={(e) => setFormData({ ...formData, nombre_usuario: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label className="text-foreground/80">Nombre Completo</Label>
                <Input
                  className="bg-muted/50 border-primary/20 text-foreground"
                  placeholder="Juan Pérez"
                  value={formData.nombre_completo}
                  onChange={(e) => setFormData({ ...formData, nombre_completo: e.target.value })}
                />
              </div>
              <div>
                <Label className="text-foreground/80">Teléfono</Label>
                <Input
                  className="bg-muted/50 border-primary/20 text-foreground"
                  placeholder="+591 77788990"
                  value={formData.telefono}
                  onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                />
              </div>
              <div>
                <Label className="text-foreground/80">
                  Contraseña {editingUser && "(dejar vacío para no cambiar)"}
                </Label>
                <Input
                  type="password"
                  className="bg-muted/50 border-primary/20 text-foreground"
                  placeholder="••••••••"
                  value={formData.contrasena}
                  onChange={(e) => setFormData({ ...formData, contrasena: e.target.value })}
                  required={!editingUser}
                  minLength={6}
                />
              </div>
              <div>
                <Label className="text-foreground/80">Sucursal por Defecto</Label>
                <Select
                  value={formData.sucursal_default_id}
                  onValueChange={(value: string) => setFormData({ ...formData, sucursal_default_id: value })}
                >
                  <SelectTrigger className="bg-muted/50 border-primary/20 text-foreground">
                    <SelectValue placeholder="Selecciona una sucursal" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-primary/20">
                    <SelectItem value="none" className="text-muted-foreground focus:bg-primary/20">
                      (Ninguna)
                    </SelectItem>
                    {sucursales.map((loc) => (
                      <SelectItem key={loc.id} value={loc.id} className="text-foreground focus:bg-primary/20">
                        {loc.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="activo"
                  checked={formData.activo}
                  onCheckedChange={(checked: boolean) => setFormData({ ...formData, activo: checked })}
                />
                <Label htmlFor="activo" className="text-foreground/80">Usuario Activo</Label>
              </div>
              <div>
                <Label className="text-foreground/80">Rol de Usuario</Label>
                <Select
                  value={formData.rol_id}
                  onValueChange={(value: string) => setFormData({ ...formData, rol_id: value })}
                >
                  <SelectTrigger className="bg-muted/50 border-primary/20 text-foreground">
                    <SelectValue placeholder="Selecciona un rol" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-primary/20">
                    <SelectItem value="none" className="text-muted-foreground focus:bg-primary/20">
                      (Sin rol específico)
                    </SelectItem>
                    {roles.map((rol) => (
                      <SelectItem key={rol.id} value={rol.id} className="text-foreground focus:bg-primary/20">
                        {rol.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="es_superusuario"
                  checked={formData.es_superusuario}
                  onCheckedChange={(checked: boolean) => setFormData({ ...formData, es_superusuario: checked })}
                />
                <Label htmlFor="es_superusuario" className="text-foreground/80">Es Superusuario (Admin Total)</Label>
              </div>
              <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                {editingUser ? "Actualizar Usuario" : "Crear Usuario"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            className="pl-10 bg-muted/50 border-primary/20 text-foreground"
            placeholder="Buscar usuarios por nombre, email o usuario..."
            value={searchTerm}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50 border-b border-primary/20">
              <tr>
                <th className="px-6 py-4 text-left text-foreground/80">Usuario</th>
                <th className="px-6 py-4 text-left text-foreground/80">Email</th>
                <th className="px-6 py-4 text-left text-foreground/80">Nombre</th>
                <th className="px-6 py-4 text-left text-foreground/80">Teléfono</th>
                <th className="px-6 py-4 text-left text-foreground/80">Estado</th>
                <th className="px-6 py-4 text-left text-foreground/80">Rol</th>
                <th className="px-6 py-4 text-left text-foreground/80">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-muted-foreground">
                    No se encontraron usuarios.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b border-primary/10 last:border-b-0">
                    <td className="px-6 py-4 text-foreground">{user.nombre_usuario}</td>
                    <td className="px-6 py-4 text-foreground/80">{user.email}</td>
                    <td className="px-6 py-4 text-foreground/80">{user.nombre_completo || "N/A"}</td>
                    <td className="px-6 py-4 text-foreground/80">{user.telefono || "N/A"}</td>
                    <td className="px-6 py-4 text-foreground/80">
                      {user.activo ? (
                        <span className="text-primary">Activo</span>
                      ) : (
                        <span className="text-destructive">Inactivo</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-foreground/80">
                      {user.es_superusuario ? (
                        <span className="flex items-center text-yellow-400">
                          <ShieldCheck className="w-4 h-4 mr-1" />
                          Super Admin
                        </span>
                      ) : (
                        <span className="flex items-center text-muted-foreground">
                          <Shield className="w-4 h-4 mr-1" />
                          {roles.find(r => r.id === user.rol_id)?.nombre || "Usuario"}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(user)}
                        className="text-blue-400 hover:bg-blue-500/10"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(user.id)}
                        className="text-destructive hover:bg-destructive/10"
                        disabled={user.es_superusuario}
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
