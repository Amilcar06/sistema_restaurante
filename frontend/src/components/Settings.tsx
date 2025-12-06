
import { useState } from "react";
import { User, Bell, Database, Settings as SettingsIcon } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { GeneralSettings } from "./settings/GeneralSettings";
import { ProfileSettings } from "./settings/ProfileSettings";
import { NotificationSettings } from "./settings/NotificationSettings";
import { SystemSettings } from "./settings/SystemSettings";
import { motion, AnimatePresence } from "framer-motion";

export function Settings() {
  const [activeTab, setActiveTab] = useState("general");

  const tabTriggerClass = "text-[#1B1B1B]/60 data-[state=active]:text-[#F26522] data-[state=active]:bg-white data-[state=active]:shadow-sm py-2.5 transition-all duration-300 hover:text-[#F26522] font-semibold uppercase tracking-wide text-xs flex items-center justify-center";

  return (
    <div className="space-y-6 w-full relative max-w-5xl mx-auto">
      {/* Header & Breadcrumb */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex items-center gap-2 text-xs font-medium text-[#1B1B1B]/40 mb-2 uppercase tracking-wide">
          <span>Inicio</span>
          <span>/</span>
          <span className="text-[#F26522]">Configuración</span>
        </div>
        <h1 className="text-[#1B1B1B] mb-2 text-3xl font-bold uppercase tracking-tight">Configuración</h1>
        <p className="text-[#1B1B1B]/60 text-base font-medium">Personaliza tu experiencia con GastroSmart AI</p>
      </motion.div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-[#F26522]/10 border border-[#F26522]/20 p-1 h-auto gap-1 rounded-lg">
          <TabsTrigger value="general" className={tabTriggerClass}>
            <SettingsIcon className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">General</span>
          </TabsTrigger>
          <TabsTrigger value="profile" className={tabTriggerClass}>
            <User className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Perfil</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className={tabTriggerClass}>
            <Bell className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Notificaciones</span>
          </TabsTrigger>
          <TabsTrigger value="system" className={tabTriggerClass}>
            <Database className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Sistema</span>
          </TabsTrigger>
        </TabsList>

        <AnimatePresence mode="wait">
          <TabsContent value="general" className="mt-8 focus:outline-none">
            <GeneralSettings />
          </TabsContent>
        </AnimatePresence>

        <TabsContent value="profile" className="mt-8 focus:outline-none">
          <ProfileSettings />
        </TabsContent>

        <TabsContent value="notifications" className="mt-8 focus:outline-none">
          <NotificationSettings />
        </TabsContent>

        <TabsContent value="system" className="mt-8 focus:outline-none">
          <SystemSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
}
