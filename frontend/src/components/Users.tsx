import { useState, useEffect } from "react";
import { Plus, Search, Users as UsersIcon, Edit, Trash2, Loader2, Shield, ShieldCheck } from "lucide-react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { usersApi, businessLocationsApi, type User as ApiUser, type BusinessLocation } from "../services/api";
import { toast } from "sonner";

interface User {
  id: string;
  email: string;
  username: string;
  full_name?: string;
  phone?: string;
  is_active: boolean;
  is_superuser: boolean;
  default_location_id?: string;
  created_at: string;
  updated_at: string;
  last_login?: string;
}

export function Users() {
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [locations, setLocations] = useState<BusinessLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    full_name: "",
    phone: "",
    password: "",
    is_active: true,
    is_superuser: false,
    default_location_id: "none"
  });

  useEffect(() => {
    loadUsers();
    loadLocations();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await usersApi.getAll();
      setUsers(data);
    } catch (error) {
      console.error("Error loading users:", error);
      toast.error("Error al cargar los usuarios");
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
        email: formData.email,
        username: formData.username,
        full_name: formData.full_name || undefined,
        phone: formData.phone || undefined,
        is_active: formData.is_active,
        is_superuser: formData.is_superuser,
        default_location_id: formData.default_location_id === "none" ? undefined : formData.default_location_id
      };

      if (editingUser) {
        if (formData.password) {
          submitData.password = formData.password;
        }
        await usersApi.update(editingUser.id, submitData);
        toast.success("Usuario actualizado correctamente");
      } else {
        if (!formData.password) {
          toast.error("La contraseña es requerida para nuevos usuarios");
          return;
        }
        submitData.password = formData.password;
        await usersApi.create(submitData);
        toast.success("Usuario creado correctamente");
      }
      setIsDialogOpen(false);
      resetForm();
      loadUsers();
    } catch (error: any) {
      console.error("Error saving user:", error);
      toast.error(error.message || "Error al guardar el usuario");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar este usuario?")) return;
    try {
      await usersApi.delete(id);
      toast.success("Usuario eliminado correctamente");
      loadUsers();
    } catch (error: any) {
      console.error("Error deleting user:", error);
      toast.error(error.message || "Error al eliminar el usuario");
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      email: user.email,
      username: user.username,
      full_name: user.full_name || "",
      phone: user.phone || "",
      password: "",
      is_active: user.is_active,
      is_superuser: user.is_superuser,
      default_location_id: user.default_location_id || "none"
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      email: "",
      username: "",
      full_name: "",
      phone: "",
      password: "",
      is_active: true,
      is_superuser: false,
      default_location_id: "none"
    });
    setEditingUser(null);
  };

  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.full_name && user.full_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

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
          <h1 className="text-white mb-2">Gestión de Usuarios</h1>
          <p className="text-white/60">Administra los usuarios del sistema</p>
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
          Nuevo Usuario
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
                {editingUser ? "Editar Usuario" : "Crear Nuevo Usuario"}
              </DialogTitle>
              <DialogDescription className="text-white/60">
                {editingUser ? "Modifica los datos del usuario" : "Completa los datos para crear un nuevo usuario"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label className="text-white/80">Email</Label>
                <Input
                  type="email"
                  className="bg-white/5 border-[#209C8A]/20 text-white"
                  placeholder="usuario@ejemplo.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label className="text-white/80">Nombre de Usuario</Label>
                <Input
                  className="bg-white/5 border-[#209C8A]/20 text-white"
                  placeholder="usuario123"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label className="text-white/80">Nombre Completo</Label>
                <Input
                  className="bg-white/5 border-[#209C8A]/20 text-white"
                  placeholder="Juan Pérez"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                />
              </div>
              <div>
                <Label className="text-white/80">Teléfono</Label>
                <Input
                  className="bg-white/5 border-[#209C8A]/20 text-white"
                  placeholder="+591 77788990"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              <div>
                <Label className="text-white/80">
                  Contraseña {editingUser && "(dejar vacío para no cambiar)"}
                </Label>
                <Input
                  type="password"
                  className="bg-white/5 border-[#209C8A]/20 text-white"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required={!editingUser}
                  minLength={6}
                />
              </div>
              <div>
                <Label className="text-white/80">Sucursal por Defecto</Label>
                <Select
                  value={formData.default_location_id}
                  onValueChange={(value) => setFormData({ ...formData, default_location_id: value })}
                >
                  <SelectTrigger className="bg-white/5 border-[#209C8A]/20 text-white">
                    <SelectValue placeholder="Selecciona una sucursal" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#020617] border-[#209C8A]/20">
                    <SelectItem value="none" className="text-white/60 focus:bg-[#209C8A]/20">
                      (Ninguna)
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
                <Label htmlFor="is_active" className="text-white/80">Usuario Activo</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_superuser"
                  checked={formData.is_superuser}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_superuser: checked })}
                />
                <Label htmlFor="is_superuser" className="text-white/80">Administrador</Label>
              </div>
              <Button type="submit" className="w-full bg-[#209C8A] hover:bg-[#209C8A]/90 text-white">
                {editingUser ? "Actualizar Usuario" : "Crear Usuario"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
          <Input
            className="pl-10 bg-white/5 border-[#209C8A]/20 text-white"
            placeholder="Buscar usuarios por nombre, email o usuario..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5 border-b border-[#209C8A]/20">
              <tr>
                <th className="px-6 py-4 text-left text-white/80">Usuario</th>
                <th className="px-6 py-4 text-left text-white/80">Email</th>
                <th className="px-6 py-4 text-left text-white/80">Nombre</th>
                <th className="px-6 py-4 text-left text-white/80">Teléfono</th>
                <th className="px-6 py-4 text-left text-white/80">Estado</th>
                <th className="px-6 py-4 text-left text-white/80">Rol</th>
                <th className="px-6 py-4 text-left text-white/80">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-white/60">
                    No se encontraron usuarios.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b border-[#209C8A]/10 last:border-b-0">
                    <td className="px-6 py-4 text-white">{user.username}</td>
                    <td className="px-6 py-4 text-white/80">{user.email}</td>
                    <td className="px-6 py-4 text-white/80">{user.full_name || "N/A"}</td>
                    <td className="px-6 py-4 text-white/80">{user.phone || "N/A"}</td>
                    <td className="px-6 py-4 text-white/80">
                      {user.is_active ? (
                        <span className="text-[#209C8A]">Activo</span>
                      ) : (
                        <span className="text-red-400">Inactivo</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-white/80">
                      {user.is_superuser ? (
                        <span className="flex items-center text-yellow-400">
                          <ShieldCheck className="w-4 h-4 mr-1" />
                          Admin
                        </span>
                      ) : (
                        <span className="flex items-center text-white/60">
                          <Shield className="w-4 h-4 mr-1" />
                          Usuario
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
                        className="text-red-400 hover:bg-red-500/10"
                        disabled={user.is_superuser}
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

