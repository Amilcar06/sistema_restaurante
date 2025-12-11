
import React from "react";
import { Proveedor } from "../../types";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Edit, Trash2, Truck, Star, Phone, Mail, MapPin, CreditCard } from "lucide-react";
import { motion } from "framer-motion";

interface SupplierCardProps {
    proveedor: Proveedor;
    onEdit: (proveedor: Proveedor) => void;
    onDelete: (id: string) => void;
}

export const SupplierCard = React.memo(({ proveedor, onEdit, onDelete }: SupplierCardProps) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            whileHover={{ y: -5 }}
            transition={{ duration: 0.2 }}
        >
            <Card className="bg-white border-[#F26522]/20 p-6 shadow-sm hover:shadow-lg transition-all duration-300 group h-full flex flex-col justify-between">
                <div>
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-[#F26522]/10 rounded-lg group-hover:bg-[#F26522] transition-colors duration-300">
                                <Truck className="w-5 h-5 text-[#F26522] group-hover:text-white transition-colors duration-300" />
                            </div>
                            <div>
                                <h3 className="text-[#1B1B1B] font-bold uppercase tracking-wide text-sm sm:text-base">
                                    {proveedor.nombre}
                                </h3>
                                {proveedor.calificacion !== undefined && (
                                    <div className="flex items-center gap-1 mt-1">
                                        {[...Array(5)].map((_, i) => (
                                            <Star
                                                key={i}
                                                className={`w-3 h-3 ${i < Math.round(proveedor.calificacion || 0)
                                                        ? "text-yellow-500 fill-yellow-500"
                                                        : "text-[#1B1B1B]/10"
                                                    }`}
                                            />
                                        ))}
                                        <span className="text-xs text-[#1B1B1B]/60 ml-1 font-mono">
                                            {(proveedor.calificacion || 0).toFixed(1)}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="flex gap-1">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => onEdit(proveedor)}
                                className="text-[#1B1B1B]/40 hover:text-[#F26522] hover:bg-[#F26522]/10 h-8 w-8"
                                aria-label={`Editar ${proveedor.nombre}`}
                            >
                                <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => onDelete(proveedor.id)}
                                className="text-[#1B1B1B]/40 hover:text-[#EA5455] hover:bg-[#EA5455]/10 h-8 w-8"
                                aria-label={`Eliminar ${proveedor.nombre}`}
                            >
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>

                    <div className="space-y-2 text-sm border-t border-[#F26522]/10 pt-3">
                        {proveedor.nombre_contacto && (
                            <p className="text-[#1B1B1B]/80 flex items-center gap-2">
                                <span className="text-[#1B1B1B]/50 font-medium w-4 flex justify-center">
                                    <span className="text-xs">👤</span>
                                </span>
                                <span className="truncate">{proveedor.nombre_contacto}</span>
                            </p>
                        )}
                        {proveedor.telefono && (
                            <p className="text-[#1B1B1B]/80 tabular-nums flex items-center gap-2">
                                <Phone className="w-3.5 h-3.5 text-[#1B1B1B]/40" />
                                <span>{proveedor.telefono}</span>
                            </p>
                        )}
                        {proveedor.email && (
                            <p className="text-[#1B1B1B]/80 truncate flex items-center gap-2">
                                <Mail className="w-3.5 h-3.5 text-[#1B1B1B]/40" />
                                <span className="truncate" title={proveedor.email}>{proveedor.email}</span>
                            </p>
                        )}
                        {(proveedor.ciudad || proveedor.zona) && (
                            <p className="text-[#1B1B1B]/80 flex items-center gap-2">
                                <MapPin className="w-3.5 h-3.5 text-[#1B1B1B]/40" />
                                <span className="truncate">
                                    {proveedor.ciudad}
                                    {proveedor.ciudad && proveedor.zona ? ", " : ""}
                                    {proveedor.zona}
                                </span>
                            </p>
                        )}
                        {proveedor.terminos_pago && (
                            <p className="text-[#1B1B1B]/80 flex items-center gap-2">
                                <CreditCard className="w-3.5 h-3.5 text-[#1B1B1B]/40" />
                                <span className="truncate">{proveedor.terminos_pago}</span>
                            </p>
                        )}
                    </div>
                </div>

                <div className="mt-4 pt-2 border-t border-[#F26522]/10 flex items-center justify-between">
                    <span
                        className={`text-xs px-2 py-1 rounded font-bold uppercase tracking-wider ${proveedor.activo
                                ? "bg-[#28C76F]/10 text-[#28C76F] border border-[#28C76F]/20"
                                : "bg-[#EA5455]/10 text-[#EA5455] border border-[#EA5455]/20"
                            }`}
                    >
                        {proveedor.activo ? "Activo" : "Inactivo"}
                    </span>
                </div>
            </Card>
        </motion.div>
    );
});

SupplierCard.displayName = "SupplierCard";
