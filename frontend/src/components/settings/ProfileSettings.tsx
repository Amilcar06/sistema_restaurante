
import { useState } from "react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { FormInput } from "../ui/FormInput";
import { toast } from "sonner";
import { motion } from "framer-motion";

export function ProfileSettings() {
    const [profileData, setProfileData] = useState({
        restaurantName: "Mi Restaurante", // Default or fetch from somewhere else if needed
        owner: "",
        phone: "",
        address: ""
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Simulate save
        toast.success("Perfil actualizado correctamente");
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.05 }}
            className="space-y-6"
        >
            <div className="flex items-center justify-between border-b border-[#F26522]/10 pb-4">
                <div>
                    <h2 className="text-[#1B1B1B] text-xl font-bold uppercase tracking-wide mb-1">Perfil del Negocio</h2>
                    <p className="text-[#1B1B1B]/60 text-sm">Gestiona la información de tu restaurante</p>
                </div>
            </div>
            <Card className="bg-white border-[#F26522]/20 p-6 shadow-sm">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <FormInput
                        label="Nombre del Restaurante"
                        placeholder="Mi Restaurante"
                        value={profileData.restaurantName}
                        onChange={(e) => setProfileData({ ...profileData, restaurantName: e.target.value })}
                        required
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormInput
                            label="Propietario"
                            placeholder="Nombre completo"
                            value={profileData.owner}
                            onChange={(e) => setProfileData({ ...profileData, owner: e.target.value })}
                        />
                        <FormInput
                            label="Teléfono"
                            type="tel"
                            placeholder="+591 00000000"
                            value={profileData.phone}
                            onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                        />
                    </div>
                    <FormInput
                        label="Dirección"
                        placeholder="Dirección del local"
                        value={profileData.address}
                        onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                    />
                    <div className="pt-4 border-t border-[#F26522]/10 flex justify-end">
                        <Button
                            type="submit"
                            className="bg-[#F26522] hover:bg-[#F26522]/90 text-white font-bold shadow-md"
                        >
                            Guardar Cambios
                        </Button>
                    </div>
                </form>
            </Card>
        </motion.div>
    );
}
