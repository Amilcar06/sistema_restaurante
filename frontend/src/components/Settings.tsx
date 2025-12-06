import { useState, useEffect } from "react";
import { User, Bell, Lock, Database, HelpCircle, Settings as SettingsIcon } from "lucide-react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { toast } from "sonner";
import { configuracionApi } from "../services/api";
import { Configuracion } from "../types";

export function Settings() {
  const [activeTab, setActiveTab] = useState("general");

  const [generalSettings, setGeneralSettings] = useState<Partial<Configuracion>>({
    moneda: "BOB",
    impuesto_porcentaje: 13,
    logo_url: "",
    notif_stock_critico: true,
    notif_reporte_diario: true,
    notif_sugerencias_ia: true,
    notif_margen_bajo: false
  });

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const data = await configuracionApi.obtener();
      setGeneralSettings(data);
    } catch (error) {
      console.error("Error loading config:", error);
      toast.error("Error al cargar la configuración");
    }
  };

  // Estado para formulario de perfil
  const [profileData, setProfileData] = useState({
    restaurantName: "",
    owner: "",
    phone: "",
    address: ""
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

  // Handler para general
  const handleGeneralSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await configuracionApi.actualizar(generalSettings);
      toast.success("Configuración general actualizada");
    } catch (error) {
      console.error("Error saving config:", error);
      toast.error("Error al guardar la configuración");
    }
  };

  return (
    <div className="space-y-6 w-full relative">
      {/* Header */}
      <div>
        <h1 className="text-[#1B1B1B] mb-2 text-3xl font-bold uppercase tracking-tight">Configuración</h1>
        <p className="text-[#1B1B1B]/60 text-base font-medium">Personaliza tu experiencia con GastroSmart AI</p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-[#F26522]/10 border border-[#F26522]/20 p-1 h-auto gap-1">
          <TabsTrigger
            value="general"
            className="text-[#1B1B1B]/60 data-[state=active]:text-[#F26522] data-[state=active]:bg-white data-[state=active]:shadow-sm py-2.5 transition-all duration-300 hover:text-[#F26522] font-semibold uppercase tracking-wide text-xs"
          >
            <SettingsIcon className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">General</span>
          </TabsTrigger>
          <TabsTrigger
            value="profile"
            className="text-[#1B1B1B]/60 data-[state=active]:text-[#F26522] data-[state=active]:bg-white data-[state=active]:shadow-sm py-2.5 transition-all duration-300 hover:text-[#F26522] font-semibold uppercase tracking-wide text-xs"
          >
            <User className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Perfil</span>
          </TabsTrigger>
          <TabsTrigger
            value="notifications"
            className="text-[#1B1B1B]/60 data-[state=active]:text-[#F26522] data-[state=active]:bg-white data-[state=active]:shadow-sm py-2.5 transition-all duration-300 hover:text-[#F26522] font-semibold uppercase tracking-wide text-xs"
          >
            <Bell className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Notificaciones</span>
          </TabsTrigger>
          <TabsTrigger
            value="system"
            className="text-[#1B1B1B]/60 data-[state=active]:text-[#F26522] data-[state=active]:bg-white data-[state=active]:shadow-sm py-2.5 transition-all duration-300 hover:text-[#F26522] font-semibold uppercase tracking-wide text-xs"
          >
            <Database className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Sistema</span>
          </TabsTrigger>
        </TabsList>

        {/* Tab Content: General */}
        <TabsContent value="general" className="mt-8 space-y-6">
          <div className="flex items-center justify-between border-b border-[#F26522]/10 pb-4">
            <div>
              <h2 className="text-[#1B1B1B] text-xl font-bold uppercase tracking-wide mb-1">Configuración General</h2>
              <p className="text-[#1B1B1B]/60 text-sm">Ajustes básicos del sistema</p>
            </div>
          </div>
          <Card className="bg-white border-[#F26522]/20 p-6 shadow-sm">
            <form onSubmit={handleGeneralSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="currency" className="text-[#1B1B1B] font-medium mb-1.5 block">
                    Moneda del Sistema
                  </Label>
                  <Select
                    value={generalSettings.moneda}
                    onValueChange={(value: string) => setGeneralSettings({ ...generalSettings, moneda: value })}
                  >
                    <SelectTrigger className="bg-white border-[#F26522]/20 text-[#1B1B1B]">
                      <SelectValue placeholder="Selecciona moneda" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-[#F26522]/20 z-[9999]">
                      <SelectItem value="BOB" className="text-[#1B1B1B] focus:bg-[#F26522]/10 focus:text-[#F26522]">Boliviano (BOB)</SelectItem>
                      <SelectItem value="USD" className="text-[#1B1B1B] focus:bg-[#F26522]/10 focus:text-[#F26522]">Dólar (USD)</SelectItem>
                      <SelectItem value="EUR" className="text-[#1B1B1B] focus:bg-[#F26522]/10 focus:text-[#F26522]">Euro (EUR)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="taxRate" className="text-[#1B1B1B] font-medium mb-1.5 block">
                    Impuesto (%)
                  </Label>
                  <Input
                    id="taxRate"
                    type="number"
                    className="bg-white border-[#F26522]/20 text-[#1B1B1B] focus:border-[#F26522] focus:ring-[#F26522]/20 tabular-nums"
                    value={generalSettings.impuesto_porcentaje}
                    onChange={(e) => setGeneralSettings({ ...generalSettings, impuesto_porcentaje: parseFloat(e.target.value) })}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="logoUrl" className="text-[#1B1B1B] font-medium mb-1.5 block">
                  URL del Logo
                </Label>
                <Input
                  id="logoUrl"
                  className="bg-white border-[#F26522]/20 text-[#1B1B1B] focus:border-[#F26522] focus:ring-[#F26522]/20"
                  placeholder="https://ejemplo.com/logo.png"
                  value={generalSettings.logo_url || ""}
                  onChange={(e) => setGeneralSettings({ ...generalSettings, logo_url: e.target.value })}
                />
              </div>
              <div className="pt-4 border-t border-[#F26522]/10">
                <Button type="submit" className="bg-[#F26522] hover:bg-[#F26522]/90 text-white font-bold shadow-md">
                  Guardar Configuración
                </Button>
              </div>
            </form>
          </Card>
        </TabsContent>

        {/* Tab Content: Perfil */}
        <TabsContent value="profile" className="mt-8 space-y-6">
          <div className="flex items-center justify-between border-b border-[#F26522]/10 pb-4">
            <div>
              <h2 className="text-[#1B1B1B] text-xl font-bold uppercase tracking-wide mb-1">Perfil del Negocio</h2>
              <p className="text-[#1B1B1B]/60 text-sm">Gestiona la información de tu restaurante</p>
            </div>
          </div>
          <Card className="bg-white border-[#F26522]/20 p-6 shadow-sm">
            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div>
                <Label htmlFor="restaurantName" className="text-[#1B1B1B] font-medium mb-1.5 block">
                  Nombre del Restaurante
                </Label>
                <Input
                  id="restaurantName"
                  className="bg-white border-[#F26522]/20 text-[#1B1B1B] focus:border-[#F26522] focus:ring-[#F26522]/20"
                  placeholder="Mi Restaurante"
                  value={profileData.restaurantName}
                  onChange={(e) => setProfileData({ ...profileData, restaurantName: e.target.value })}
                  required
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="owner" className="text-[#1B1B1B] font-medium mb-1.5 block">
                    Propietario
                  </Label>
                  <Input
                    id="owner"
                    className="bg-white border-[#F26522]/20 text-[#1B1B1B] focus:border-[#F26522] focus:ring-[#F26522]/20"
                    placeholder="Nombre completo"
                    value={profileData.owner}
                    onChange={(e) => setProfileData({ ...profileData, owner: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="phone" className="text-[#1B1B1B] font-medium mb-1.5 block">
                    Teléfono
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    className="bg-white border-[#F26522]/20 text-[#1B1B1B] focus:border-[#F26522] focus:ring-[#F26522]/20"
                    placeholder="+591 00000000"
                    value={profileData.phone}
                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="address" className="text-[#1B1B1B] font-medium mb-1.5 block">
                  Dirección
                </Label>
                <Input
                  id="address"
                  className="bg-white border-[#F26522]/20 text-[#1B1B1B] focus:border-[#F26522] focus:ring-[#F26522]/20"
                  placeholder="Dirección del local"
                  value={profileData.address}
                  onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                />
              </div>
              <div className="pt-4 border-t border-[#F26522]/10">
                <Button
                  type="submit"
                  className="bg-[#F26522] hover:bg-[#F26522]/90 text-white font-bold shadow-md"
                >
                  Guardar Cambios
                </Button>
              </div>
            </form>
          </Card>
        </TabsContent>

        {/* Tab Content: Notificaciones */}
        <TabsContent value="notifications" className="mt-8 space-y-6">
          <div className="flex items-center justify-between border-b border-[#F26522]/10 pb-4">
            <div>
              <h2 className="text-[#1B1B1B] text-xl font-bold uppercase tracking-wide mb-1">Configuración de Notificaciones</h2>
              <p className="text-[#1B1B1B]/60 text-sm">Elige qué alertas recibir</p>
            </div>
          </div>
          <Card className="bg-white border-[#F26522]/20 p-6 shadow-sm">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-[#F26522]/10 hover:border-[#F26522]/30 transition-colors">
                <div className="flex-1">
                  <div className="text-[#1B1B1B] font-bold mb-1">Alertas de Stock Crítico</div>
                  <div className="text-[#1B1B1B]/60 text-sm">
                    Recibir notificaciones cuando un insumo esté bajo el nivel mínimo
                  </div>
                </div>
                <Switch
                  className="data-[state=checked]:bg-[#28C76F]"
                  checked={generalSettings.notif_stock_critico}
                  onCheckedChange={(checked: boolean) =>
                    setGeneralSettings({ ...generalSettings, notif_stock_critico: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-[#F26522]/10 hover:border-[#F26522]/30 transition-colors">
                <div className="flex-1">
                  <div className="text-[#1B1B1B] font-bold mb-1">Reporte Diario</div>
                  <div className="text-[#1B1B1B]/60 text-sm">
                    Resumen de ventas al final del día
                  </div>
                </div>
                <Switch
                  className="data-[state=checked]:bg-[#F26522]"
                  checked={generalSettings.notif_reporte_diario}
                  onCheckedChange={(checked: boolean) =>
                    setGeneralSettings({ ...generalSettings, notif_reporte_diario: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-[#F26522]/10 hover:border-[#F26522]/30 transition-colors">
                <div className="flex-1">
                  <div className="text-[#1B1B1B] font-bold mb-1">Sugerencias de IA</div>
                  <div className="text-[#1B1B1B]/60 text-sm">
                    Recomendaciones automáticas para mejorar rentabilidad
                  </div>
                </div>
                <Switch
                  className="data-[state=checked]:bg-[#7367F0]"
                  checked={generalSettings.notif_sugerencias_ia}
                  onCheckedChange={(checked: boolean) =>
                    setGeneralSettings({ ...generalSettings, notif_sugerencias_ia: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-[#F26522]/10 hover:border-[#F26522]/30 transition-colors">
                <div className="flex-1">
                  <div className="text-[#1B1B1B] font-bold mb-1">Alertas de Márgenes Bajos</div>
                  <div className="text-[#1B1B1B]/60 text-sm">
                    Notificar cuando un plato tenga margen inferior al 50%
                  </div>
                </div>
                <Switch
                  className="data-[state=checked]:bg-[#EA5455]"
                  checked={generalSettings.notif_margen_bajo}
                  onCheckedChange={(checked: boolean) =>
                    setGeneralSettings({ ...generalSettings, notif_margen_bajo: checked })
                  }
                />
              </div>

              <div className="pt-4 border-t border-[#F26522]/10">
                <Button
                  onClick={handleGeneralSubmit}
                  className="bg-[#F26522] hover:bg-[#F26522]/90 text-white font-bold shadow-md"
                >
                  Guardar Preferencias
                </Button>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Tab Content: Sistema */}
        <TabsContent value="system" className="mt-8 space-y-6">
          {/* Seguridad */}
          <Card className="bg-white border-[#F26522]/20 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6 border-b border-[#F26522]/10 pb-4">
              <div className="bg-[#F26522]/10 p-2 rounded-lg">
                <Lock className="w-6 h-6 text-[#F26522]" />
              </div>
              <h3 className="text-[#1B1B1B] text-xl font-bold uppercase tracking-wide">Seguridad</h3>
            </div>
            <form onSubmit={handleSecuritySubmit} className="space-y-4">
              <div>
                <Label htmlFor="currentPassword" className="text-[#1B1B1B] font-medium mb-1.5 block">
                  Contraseña Actual
                </Label>
                <Input
                  id="currentPassword"
                  type="password"
                  className="bg-white border-[#F26522]/20 text-[#1B1B1B] focus:border-[#F26522] focus:ring-[#F26522]/20"
                  placeholder="Ingresa tu contraseña actual"
                  value={securityData.currentPassword}
                  onChange={(e) => setSecurityData({ ...securityData, currentPassword: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="newPassword" className="text-[#1B1B1B] font-medium mb-1.5 block">
                  Nueva Contraseña
                </Label>
                <Input
                  id="newPassword"
                  type="password"
                  className="bg-white border-[#F26522]/20 text-[#1B1B1B] focus:border-[#F26522] focus:ring-[#F26522]/20"
                  placeholder="Mínimo 6 caracteres"
                  value={securityData.newPassword}
                  onChange={(e) => setSecurityData({ ...securityData, newPassword: e.target.value })}
                  required
                  minLength={6}
                />
              </div>
              <div>
                <Label htmlFor="confirmPassword" className="text-[#1B1B1B] font-medium mb-1.5 block">
                  Confirmar Contraseña
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  className="bg-white border-[#F26522]/20 text-[#1B1B1B] focus:border-[#F26522] focus:ring-[#F26522]/20"
                  placeholder="Confirma tu nueva contraseña"
                  value={securityData.confirmPassword}
                  onChange={(e) => setSecurityData({ ...securityData, confirmPassword: e.target.value })}
                  required
                />
              </div>
              <div className="pt-4 border-t border-[#F26522]/10">
                <Button
                  type="submit"
                  className="bg-[#F26522] hover:bg-[#F26522]/90 text-white font-bold shadow-md"
                >
                  Actualizar Contraseña
                </Button>
              </div>
            </form>
          </Card>

          {/* Base de Datos y Soporte */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-white border-[#F26522]/20 p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4 border-b border-[#F26522]/10 pb-3">
                <div className="bg-[#F26522]/10 p-2 rounded-lg">
                  <Database className="w-6 h-6 text-[#F26522]" />
                </div>
                <h3 className="text-[#1B1B1B] text-lg font-bold uppercase tracking-wide">Base de Datos</h3>
              </div>
              <p className="text-[#1B1B1B]/60 mb-6 text-sm font-medium">
                Gestiona los datos de tu sistema
              </p>
              <div className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full border-[#1B1B1B]/10 text-[#1B1B1B] hover:bg-[#F26522]/5 hover:text-[#F26522] hover:border-[#F26522]/30 transition-all font-medium"
                  onClick={() => toast.info("Función de exportación próximamente")}
                >
                  Exportar Datos
                </Button>
                <Button
                  variant="outline"
                  className="w-full border-[#1B1B1B]/10 text-[#1B1B1B] hover:bg-[#F26522]/5 hover:text-[#F26522] hover:border-[#F26522]/30 transition-all font-medium"
                  onClick={() => toast.info("Función de importación próximamente")}
                >
                  Importar Datos
                </Button>
                <Button
                  variant="outline"
                  className="w-full border-[#EA5455]/30 text-[#EA5455] hover:bg-[#EA5455]/10 font-medium"
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

            <Card className="bg-white border-[#F26522]/20 p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4 border-b border-[#F26522]/10 pb-3">
                <div className="bg-[#F26522]/10 p-2 rounded-lg">
                  <HelpCircle className="w-6 h-6 text-[#F26522]" />
                </div>
                <h3 className="text-[#1B1B1B] text-lg font-bold uppercase tracking-wide">Soporte</h3>
              </div>
              <p className="text-[#1B1B1B]/60 mb-6 text-sm font-medium">
                Obtén ayuda con el sistema
              </p>
              <div className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full border-[#1B1B1B]/10 text-[#1B1B1B] hover:bg-[#F26522]/5 hover:text-[#F26522] hover:border-[#F26522]/30 transition-all font-medium"
                  onClick={() => toast.info("Tutorial próximamente disponible")}
                >
                  Ver Tutorial
                </Button>
                <Button
                  variant="outline"
                  className="w-full border-[#1B1B1B]/10 text-[#1B1B1B] hover:bg-[#F26522]/5 hover:text-[#F26522] hover:border-[#F26522]/30 transition-all font-medium"
                  onClick={() => window.open("https://github.com", "_blank")}
                >
                  Documentación
                </Button>
                <Button
                  variant="outline"
                  className="w-full border-[#1B1B1B]/10 text-[#1B1B1B] hover:bg-[#F26522]/5 hover:text-[#F26522] hover:border-[#F26522]/30 transition-all font-medium"
                  onClick={() => toast.info("Contacto: soporte@gastrosmart.ai")}
                >
                  Contactar Soporte
                </Button>
              </div>
            </Card>
          </div>

          {/* Footer Info */}
          <Card className="bg-white border-[#F26522]/10 p-6 shadow-sm">
            <div className="text-center">
              <div className="text-[#1B1B1B] font-bold mb-2 uppercase tracking-wide">GastroSmart AI v1.0.0</div>
              <div className="text-[#1B1B1B]/40 text-sm font-medium">
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
