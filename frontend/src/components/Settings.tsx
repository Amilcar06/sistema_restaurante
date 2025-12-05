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
        <h1 className="text-foreground mb-2">Configuración</h1>
        <p className="text-muted-foreground">Personaliza tu experiencia con GastroSmart AI</p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-muted/50 border-primary/20 p-1 h-auto gap-1">
          <TabsTrigger
            value="general"
            className="text-muted-foreground data-[state=active]:text-primary data-[state=active]:bg-primary/10 py-2.5 transition-all duration-300 hover:text-foreground"
          >
            <SettingsIcon className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">General</span>
          </TabsTrigger>
          <TabsTrigger
            value="profile"
            className="text-muted-foreground data-[state=active]:text-primary data-[state=active]:bg-primary/10 py-2.5 transition-all duration-300 hover:text-foreground"
          >
            <User className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Perfil</span>
          </TabsTrigger>
          <TabsTrigger
            value="notifications"
            className="text-muted-foreground data-[state=active]:text-primary data-[state=active]:bg-primary/10 py-2.5 transition-all duration-300 hover:text-foreground"
          >
            <Bell className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Notificaciones</span>
          </TabsTrigger>
          <TabsTrigger
            value="system"
            className="text-muted-foreground data-[state=active]:text-primary data-[state=active]:bg-primary/10 py-2.5 transition-all duration-300 hover:text-foreground"
          >
            <Database className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Sistema</span>
          </TabsTrigger>
        </TabsList>

        {/* Tab Content: General */}
        <TabsContent value="general" className="mt-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-foreground text-xl font-semibold mb-1">Configuración General</h2>
              <p className="text-muted-foreground">Ajustes básicos del sistema</p>
            </div>
          </div>
          <Card className="bg-card border-primary/20 p-6">
            <form onSubmit={handleGeneralSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="currency" className="text-foreground/80 mb-2 block">
                    Moneda del Sistema
                  </Label>
                  <Select
                    value={generalSettings.moneda}
                    onValueChange={(value: string) => setGeneralSettings({ ...generalSettings, moneda: value })}
                  >
                    <SelectTrigger className="bg-muted/50 border-primary/20 text-foreground">
                      <SelectValue placeholder="Selecciona moneda" />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-primary/20">
                      <SelectItem value="BOB" className="text-foreground focus:bg-primary/20">Boliviano (BOB)</SelectItem>
                      <SelectItem value="USD" className="text-foreground focus:bg-primary/20">Dólar (USD)</SelectItem>
                      <SelectItem value="EUR" className="text-foreground focus:bg-primary/20">Euro (EUR)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="taxRate" className="text-foreground/80 mb-2 block">
                    Impuesto (%)
                  </Label>
                  <Input
                    id="taxRate"
                    type="number"
                    className="bg-muted/50 border-primary/20 text-foreground"
                    value={generalSettings.impuesto_porcentaje}
                    onChange={(e) => setGeneralSettings({ ...generalSettings, impuesto_porcentaje: parseFloat(e.target.value) })}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="logoUrl" className="text-foreground/80 mb-2 block">
                  URL del Logo
                </Label>
                <Input
                  id="logoUrl"
                  className="bg-muted/50 border-primary/20 text-foreground"
                  placeholder="https://ejemplo.com/logo.png"
                  value={generalSettings.logo_url || ""}
                  onChange={(e) => setGeneralSettings({ ...generalSettings, logo_url: e.target.value })}
                />
              </div>
              <div className="pt-4">
                <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  Guardar Configuración
                </Button>
              </div>
            </form>
          </Card>
        </TabsContent>

        {/* Tab Content: Perfil */}
        <TabsContent value="profile" className="mt-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-foreground text-xl font-semibold mb-1">Perfil del Negocio</h2>
              <p className="text-muted-foreground">Gestiona la información de tu restaurante</p>
            </div>
          </div>
          <Card className="bg-card border-primary/20 p-6 hover:bg-muted/50 transition-all duration-300">
            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div>
                <Label htmlFor="restaurantName" className="text-foreground/80 mb-2 block">
                  Nombre del Restaurante
                </Label>
                <Input
                  id="restaurantName"
                  className="bg-muted/50 border-primary/20 text-foreground"
                  placeholder="Mi Restaurante"
                  value={profileData.restaurantName}
                  onChange={(e) => setProfileData({ ...profileData, restaurantName: e.target.value })}
                  required
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="owner" className="text-foreground/80 mb-2 block">
                    Propietario
                  </Label>
                  <Input
                    id="owner"
                    className="bg-muted/50 border-primary/20 text-foreground"
                    placeholder="Nombre completo"
                    value={profileData.owner}
                    onChange={(e) => setProfileData({ ...profileData, owner: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="phone" className="text-foreground/80 mb-2 block">
                    Teléfono
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    className="bg-muted/50 border-primary/20 text-foreground"
                    placeholder="+591 00000000"
                    value={profileData.phone}
                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="address" className="text-foreground/80 mb-2 block">
                  Dirección
                </Label>
                <Input
                  id="address"
                  className="bg-muted/50 border-primary/20 text-foreground"
                  placeholder="Dirección del local"
                  value={profileData.address}
                  onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                />
              </div>
              <div className="pt-4">
                <Button
                  type="submit"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  Guardar Cambios
                </Button>
              </div>
            </form>
          </Card>
        </TabsContent>

        {/* Tab Content: Notificaciones */}
        <TabsContent value="notifications" className="mt-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-foreground text-xl font-semibold mb-1">Configuración de Notificaciones</h2>
              <p className="text-muted-foreground">Elige qué alertas recibir</p>
            </div>
          </div>
          <Card className="bg-card border-primary/20 p-6">
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border border-primary/10">
                <div className="flex-1">
                  <div className="text-foreground font-medium mb-1">Alertas de Stock Crítico</div>
                  <div className="text-muted-foreground text-sm">
                    Recibir notificaciones cuando un insumo esté bajo el nivel mínimo
                  </div>
                </div>
                <Switch
                  checked={generalSettings.notif_stock_critico}
                  onCheckedChange={(checked: boolean) =>
                    setGeneralSettings({ ...generalSettings, notif_stock_critico: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border border-primary/10">
                <div className="flex-1">
                  <div className="text-foreground font-medium mb-1">Reporte Diario</div>
                  <div className="text-muted-foreground text-sm">
                    Resumen de ventas al final del día
                  </div>
                </div>
                <Switch
                  checked={generalSettings.notif_reporte_diario}
                  onCheckedChange={(checked: boolean) =>
                    setGeneralSettings({ ...generalSettings, notif_reporte_diario: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border border-primary/10">
                <div className="flex-1">
                  <div className="text-foreground font-medium mb-1">Sugerencias de IA</div>
                  <div className="text-muted-foreground text-sm">
                    Recomendaciones automáticas para mejorar rentabilidad
                  </div>
                </div>
                <Switch
                  checked={generalSettings.notif_sugerencias_ia}
                  onCheckedChange={(checked: boolean) =>
                    setGeneralSettings({ ...generalSettings, notif_sugerencias_ia: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border border-primary/10">
                <div className="flex-1">
                  <div className="text-foreground font-medium mb-1">Alertas de Márgenes Bajos</div>
                  <div className="text-muted-foreground text-sm">
                    Notificar cuando un plato tenga margen inferior al 50%
                  </div>
                </div>
                <Switch
                  checked={generalSettings.notif_margen_bajo}
                  onCheckedChange={(checked: boolean) =>
                    setGeneralSettings({ ...generalSettings, notif_margen_bajo: checked })
                  }
                />
              </div>

              <div className="pt-4">
                <Button
                  onClick={handleGeneralSubmit}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
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
          <Card className="bg-card border-primary/20 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-primary/10 p-2 rounded-lg">
                <Lock className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-foreground text-xl font-semibold">Seguridad</h3>
            </div>
            <form onSubmit={handleSecuritySubmit} className="space-y-4">
              <div>
                <Label htmlFor="currentPassword" className="text-foreground/80 mb-2 block">
                  Contraseña Actual
                </Label>
                <Input
                  id="currentPassword"
                  type="password"
                  className="bg-muted/50 border-primary/20 text-foreground"
                  placeholder="Ingresa tu contraseña actual"
                  value={securityData.currentPassword}
                  onChange={(e) => setSecurityData({ ...securityData, currentPassword: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="newPassword" className="text-foreground/80 mb-2 block">
                  Nueva Contraseña
                </Label>
                <Input
                  id="newPassword"
                  type="password"
                  className="bg-muted/50 border-primary/20 text-foreground"
                  placeholder="Mínimo 6 caracteres"
                  value={securityData.newPassword}
                  onChange={(e) => setSecurityData({ ...securityData, newPassword: e.target.value })}
                  required
                  minLength={6}
                />
              </div>
              <div>
                <Label htmlFor="confirmPassword" className="text-foreground/80 mb-2 block">
                  Confirmar Contraseña
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  className="bg-muted/50 border-primary/20 text-foreground"
                  placeholder="Confirma tu nueva contraseña"
                  value={securityData.confirmPassword}
                  onChange={(e) => setSecurityData({ ...securityData, confirmPassword: e.target.value })}
                  required
                />
              </div>
              <div className="pt-4">
                <Button
                  type="submit"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  Actualizar Contraseña
                </Button>
              </div>
            </form>
          </Card>

          {/* Base de Datos y Soporte */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-card border-primary/20 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-primary/10 p-2 rounded-lg">
                  <Database className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-foreground text-lg font-semibold">Base de Datos</h3>
              </div>
              <p className="text-muted-foreground mb-4 text-sm">
                Gestiona los datos de tu sistema
              </p>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full border-primary/20 text-foreground hover:bg-muted/10"
                  onClick={() => toast.info("Función de exportación próximamente")}
                >
                  Exportar Datos
                </Button>
                <Button
                  variant="outline"
                  className="w-full border-primary/20 text-foreground hover:bg-muted/10"
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

            <Card className="bg-card border-primary/20 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-primary/10 p-2 rounded-lg">
                  <HelpCircle className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-foreground text-lg font-semibold">Soporte</h3>
              </div>
              <p className="text-muted-foreground mb-4 text-sm">
                Obtén ayuda con el sistema
              </p>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full border-primary/20 text-foreground hover:bg-muted/10"
                  onClick={() => toast.info("Tutorial próximamente disponible")}
                >
                  Ver Tutorial
                </Button>
                <Button
                  variant="outline"
                  className="w-full border-primary/20 text-foreground hover:bg-muted/10"
                  onClick={() => window.open("https://github.com", "_blank")}
                >
                  Documentación
                </Button>
                <Button
                  variant="outline"
                  className="w-full border-primary/20 text-foreground hover:bg-muted/10"
                  onClick={() => toast.info("Contacto: soporte@gastrosmart.ai")}
                >
                  Contactar Soporte
                </Button>
              </div>
            </Card>
          </div>

          {/* Footer Info */}
          <Card className="bg-card border-primary/20 p-6">
            <div className="text-center">
              <div className="text-foreground font-semibold mb-2">GastroSmart AI v1.0.0</div>
              <div className="text-muted-foreground text-sm">
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
