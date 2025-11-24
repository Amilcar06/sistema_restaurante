import { useState } from "react";
import { User, Users as UsersIcon, Bell, Lock, Database, HelpCircle, MapPin, Truck, Tag } from "lucide-react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { BusinessLocations } from "./BusinessLocations";
import { Suppliers } from "./Suppliers";
import { Users } from "./Users";
import { Promotions } from "./Promotions";
import { toast } from "sonner";

export function Settings() {
  const [activeTab, setActiveTab] = useState("profile");

  // Estado para formulario de perfil
  const [profileData, setProfileData] = useState({
    restaurantName: "",
    owner: "",
    phone: "",
    address: ""
  });

  // Estado para notificaciones
  const [notifications, setNotifications] = useState({
    criticalStock: true,
    dailyReport: true,
    aiSuggestions: true,
    lowMargin: false
  });

  // Estado para seguridad
  const [securityData, setSecurityData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  // Handler para perfil
  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Aquí iría la lógica para guardar el perfil
    toast.success("Perfil actualizado correctamente");
  };

  // Handler para seguridad
  const handleSecuritySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (securityData.newPassword !== securityData.confirmPassword) {
      toast.error("Las contraseñas no coinciden");
      return;
    }
    if (securityData.newPassword.length < 6) {
      toast.error("La contraseña debe tener al menos 6 caracteres");
      return;
    }
    // Aquí iría la lógica para actualizar la contraseña
    toast.success("Contraseña actualizada correctamente");
    setSecurityData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: ""
    });
  };

  return (
    <div className="space-y-6 w-full relative">
      {/* Header */}
      <div>
        <h1 className="text-white mb-2">Configuración</h1>
        <p className="text-white/60">Personaliza tu experiencia con GastroSmart AI</p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 bg-white/5 border-[#FF6B35]/20 p-1 h-auto gap-1 overflow-x-auto">
          <TabsTrigger
            value="profile"
            className="text-white/60 data-[state=active]:text-[#FF6B35] data-[state=active]:bg-[#FF6B35]/10 py-2.5 transition-all duration-300 hover:text-white"
          >
            <User className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Perfil</span>
          </TabsTrigger>
          <TabsTrigger
            value="users"
            className="text-white/60 data-[state=active]:text-[#FF6B35] data-[state=active]:bg-[#FF6B35]/10 py-2.5 transition-all duration-300 hover:text-white"
          >
            <UsersIcon className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Usuarios</span>
          </TabsTrigger>
          <TabsTrigger
            value="locations"
            className="text-white/60 data-[state=active]:text-[#FF6B35] data-[state=active]:bg-[#FF6B35]/10 py-2.5 transition-all duration-300 hover:text-white"
          >
            <MapPin className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Sucursales</span>
          </TabsTrigger>
          <TabsTrigger
            value="suppliers"
            className="text-white/60 data-[state=active]:text-[#FF6B35] data-[state=active]:bg-[#FF6B35]/10 py-2.5 transition-all duration-300 hover:text-white"
          >
            <Truck className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Proveedores</span>
          </TabsTrigger>
          <TabsTrigger
            value="promotions"
            className="text-white/60 data-[state=active]:text-[#FF6B35] data-[state=active]:bg-[#FF6B35]/10 py-2.5 transition-all duration-300 hover:text-white"
          >
            <Tag className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Promociones</span>
          </TabsTrigger>
          <TabsTrigger
            value="notifications"
            className="text-white/60 data-[state=active]:text-[#FF6B35] data-[state=active]:bg-[#FF6B35]/10 py-2.5 transition-all duration-300 hover:text-white"
          >
            <Bell className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Notificaciones</span>
          </TabsTrigger>
          <TabsTrigger
            value="system"
            className="text-white/60 data-[state=active]:text-[#FF6B35] data-[state=active]:bg-[#FF6B35]/10 py-2.5 transition-all duration-300 hover:text-white"
          >
            <Database className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Sistema</span>
          </TabsTrigger>
        </TabsList>

        {/* Tab Content: Perfil */}
        <TabsContent value="profile" className="mt-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-white text-xl font-semibold mb-1">Perfil del Negocio</h2>
              <p className="text-white/60">Gestiona la información de tu restaurante</p>
            </div>
          </div>
          <Card className="bg-white/5 border-[#FF6B35]/20 p-6 hover:bg-white/10 transition-all duration-300">
            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div>
                <Label htmlFor="restaurantName" className="text-white/80 mb-2 block">
                  Nombre del Restaurante
                </Label>
                <Input
                  id="restaurantName"
                  className="bg-white/5 border-[#FF6B35]/20 text-white"
                  placeholder="Mi Restaurante"
                  value={profileData.restaurantName}
                  onChange={(e) => setProfileData({ ...profileData, restaurantName: e.target.value })}
                  required
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="owner" className="text-white/80 mb-2 block">
                    Propietario
                  </Label>
                  <Input
                    id="owner"
                    className="bg-white/5 border-[#FF6B35]/20 text-white"
                    placeholder="Nombre completo"
                    value={profileData.owner}
                    onChange={(e) => setProfileData({ ...profileData, owner: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="phone" className="text-white/80 mb-2 block">
                    Teléfono
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    className="bg-white/5 border-[#FF6B35]/20 text-white"
                    placeholder="+591 00000000"
                    value={profileData.phone}
                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="address" className="text-white/80 mb-2 block">
                  Dirección
                </Label>
                <Input
                  id="address"
                  className="bg-white/5 border-[#FF6B35]/20 text-white"
                  placeholder="Dirección del local"
                  value={profileData.address}
                  onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                />
              </div>
              <div className="pt-4">
                <Button
                  type="submit"
                  className="bg-[#FF6B35] hover:bg-[#FF6B35]/90 text-white"
                >
                  Guardar Cambios
                </Button>
              </div>
            </form>
          </Card>
        </TabsContent>

        {/* Tab Content: Sucursales */}
        <TabsContent value="locations" className="mt-6">
          <BusinessLocations />
        </TabsContent>

        {/* Tab Content: Usuarios */}
        <TabsContent value="users" className="mt-6">
          <Users />
        </TabsContent>

        {/* Tab Content: Proveedores */}
        <TabsContent value="suppliers" className="mt-6">
          <Suppliers />
        </TabsContent>

        {/* Tab Content: Promociones */}
        <TabsContent value="promotions" className="mt-6">
          <Promotions />
        </TabsContent>

        {/* Tab Content: Notificaciones */}
        <TabsContent value="notifications" className="mt-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-white text-xl font-semibold mb-1">Configuración de Notificaciones</h2>
              <p className="text-white/60">Elige qué alertas recibir</p>
            </div>
          </div>
          <Card className="bg-white/5 border-[#FF6B35]/20 p-6">
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-[#FF6B35]/10">
                <div className="flex-1">
                  <div className="text-white font-medium mb-1">Alertas de Stock Crítico</div>
                  <div className="text-white/60 text-sm">
                    Recibir notificaciones cuando un insumo esté bajo el nivel mínimo
                  </div>
                </div>
                <Switch
                  checked={notifications.criticalStock}
                  onCheckedChange={(checked) =>
                    setNotifications({ ...notifications, criticalStock: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-[#FF6B35]/10">
                <div className="flex-1">
                  <div className="text-white font-medium mb-1">Reporte Diario</div>
                  <div className="text-white/60 text-sm">
                    Resumen de ventas al final del día
                  </div>
                </div>
                <Switch
                  checked={notifications.dailyReport}
                  onCheckedChange={(checked) =>
                    setNotifications({ ...notifications, dailyReport: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-[#FF6B35]/10">
                <div className="flex-1">
                  <div className="text-white font-medium mb-1">Sugerencias de IA</div>
                  <div className="text-white/60 text-sm">
                    Recomendaciones automáticas para mejorar rentabilidad
                  </div>
                </div>
                <Switch
                  checked={notifications.aiSuggestions}
                  onCheckedChange={(checked) =>
                    setNotifications({ ...notifications, aiSuggestions: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-[#FF6B35]/10">
                <div className="flex-1">
                  <div className="text-white font-medium mb-1">Alertas de Márgenes Bajos</div>
                  <div className="text-white/60 text-sm">
                    Notificar cuando un plato tenga margen inferior al 50%
                  </div>
                </div>
                <Switch
                  checked={notifications.lowMargin}
                  onCheckedChange={(checked) =>
                    setNotifications({ ...notifications, lowMargin: checked })
                  }
                />
              </div>

              <div className="pt-4">
                <Button
                  onClick={() => {
                    // Aquí iría la lógica para guardar las preferencias
                    toast.success("Preferencias de notificaciones guardadas");
                  }}
                  className="bg-[#FF6B35] hover:bg-[#FF6B35]/90 text-white"
                >
                  Guardar Preferencias
                </Button>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Tab Content: Sistema */}
        <TabsContent value="system" className="mt-6 space-y-6">
          {/* Seguridad */}
          <Card className="bg-white/5 border-[#FF6B35]/20 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-[#FF6B35]/10 p-2 rounded-lg">
                <Lock className="w-6 h-6 text-[#FF6B35]" />
              </div>
              <h3 className="text-white text-xl font-semibold">Seguridad</h3>
            </div>
            <form onSubmit={handleSecuritySubmit} className="space-y-4">
              <div>
                <Label htmlFor="currentPassword" className="text-white/80 mb-2 block">
                  Contraseña Actual
                </Label>
                <Input
                  id="currentPassword"
                  type="password"
                  className="bg-white/5 border-[#FF6B35]/20 text-white"
                  placeholder="Ingresa tu contraseña actual"
                  value={securityData.currentPassword}
                  onChange={(e) => setSecurityData({ ...securityData, currentPassword: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="newPassword" className="text-white/80 mb-2 block">
                  Nueva Contraseña
                </Label>
                <Input
                  id="newPassword"
                  type="password"
                  className="bg-white/5 border-[#FF6B35]/20 text-white"
                  placeholder="Mínimo 6 caracteres"
                  value={securityData.newPassword}
                  onChange={(e) => setSecurityData({ ...securityData, newPassword: e.target.value })}
                  required
                  minLength={6}
                />
              </div>
              <div>
                <Label htmlFor="confirmPassword" className="text-white/80 mb-2 block">
                  Confirmar Contraseña
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  className="bg-white/5 border-[#FF6B35]/20 text-white"
                  placeholder="Confirma tu nueva contraseña"
                  value={securityData.confirmPassword}
                  onChange={(e) => setSecurityData({ ...securityData, confirmPassword: e.target.value })}
                  required
                />
              </div>
              <div className="pt-4">
                <Button
                  type="submit"
                  className="bg-[#FF6B35] hover:bg-[#FF6B35]/90 text-white"
                >
                  Actualizar Contraseña
                </Button>
              </div>
            </form>
          </Card>

          {/* Base de Datos y Soporte */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-white/5 border-[#FF6B35]/20 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-[#FF6B35]/10 p-2 rounded-lg">
                  <Database className="w-6 h-6 text-[#FF6B35]" />
                </div>
                <h3 className="text-white text-lg font-semibold">Base de Datos</h3>
              </div>
              <p className="text-white/60 mb-4 text-sm">
                Gestiona los datos de tu sistema
              </p>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full border-[#FF6B35]/20 text-white hover:bg-white/5"
                  onClick={() => toast.info("Función de exportación próximamente")}
                >
                  Exportar Datos
                </Button>
                <Button
                  variant="outline"
                  className="w-full border-[#FF6B35]/20 text-white hover:bg-white/5"
                  onClick={() => toast.info("Función de importación próximamente")}
                >
                  Importar Datos
                </Button>
                <Button
                  variant="outline"
                  className="w-full border-red-500/20 text-red-400 hover:bg-red-500/10"
                  onClick={() => {
                    if (confirm("¿Estás seguro de resetear la base de datos? Esta acción no se puede deshacer.")) {
                      toast.error("Función deshabilitada por seguridad");
                    }
                  }}
                >
                  Resetear Base de Datos
                </Button>
              </div>
            </Card>

            <Card className="bg-white/5 border-[#FF6B35]/20 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-[#FF6B35]/10 p-2 rounded-lg">
                  <HelpCircle className="w-6 h-6 text-[#FF6B35]" />
                </div>
                <h3 className="text-white text-lg font-semibold">Soporte</h3>
              </div>
              <p className="text-white/60 mb-4 text-sm">
                Obtén ayuda con el sistema
              </p>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full border-[#FF6B35]/20 text-white hover:bg-white/5"
                  onClick={() => toast.info("Tutorial próximamente disponible")}
                >
                  Ver Tutorial
                </Button>
                <Button
                  variant="outline"
                  className="w-full border-[#FF6B35]/20 text-white hover:bg-white/5"
                  onClick={() => window.open("https://github.com", "_blank")}
                >
                  Documentación
                </Button>
                <Button
                  variant="outline"
                  className="w-full border-[#FF6B35]/20 text-white hover:bg-white/5"
                  onClick={() => toast.info("Contacto: soporte@gastrosmart.ai")}
                >
                  Contactar Soporte
                </Button>
              </div>
            </Card>
          </div>

          {/* Footer Info */}
          <Card className="bg-white/5 border-[#FF6B35]/20 p-6">
            <div className="text-center">
              <div className="text-white font-semibold mb-2">GastroSmart AI v1.0.0</div>
              <div className="text-white/60 text-sm">
                © 2025 Sistema Integral de Control Gastronómico<br />
                Desarrollado por UMSA - Carrera de Informática
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
