
import React, { useEffect, useReducer } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Switch } from "../ui/switch";
import { Loader2 } from "lucide-react";
import { Proveedor } from "../../types";

interface SupplierDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (data: Omit<Proveedor, "id" | "created_at" | "updated_at">) => Promise<void>;
    initialData: Proveedor | null;
}

// Reducer for form state
type FormState = Omit<Proveedor, "id" | "created_at" | "updated_at">;

type FormAction =
    | { type: "SET_FIELD"; field: keyof FormState; value: any }
    | { type: "RESET"; initialState: FormState };

const initialFormState: FormState = {
    nombre: "",
    nombre_contacto: "",
    telefono: "",
    email: "",
    direccion: "",
    ciudad: "",
    zona: "",
    nit: "",
    terminos_pago: "",
    calificacion: 0,
    activo: true,
    notas: "",
};

function formReducer(state: FormState, action: FormAction): FormState {
    switch (action.type) {
        case "SET_FIELD":
            return { ...state, [action.field]: action.value };
        case "RESET":
            return action.initialState;
        default:
            return state;
    }
}

export function SupplierDialog({ open, onOpenChange, onSubmit, initialData }: SupplierDialogProps) {
    const [formData, dispatch] = useReducer(formReducer, initialFormState);
    const [saving, setSaving] = React.useState(false);
    const [errors, setErrors] = React.useState<Record<string, string>>({});

    useEffect(() => {
        if (open) {
            dispatch({ type: "RESET", initialState: initialData || initialFormState });
            setErrors({});
        }
    }, [open, initialData]);

    const validate = () => {
        const newErrors: Record<string, string> = {};
        if (!formData.nombre.trim() || formData.nombre.length < 3) {
            newErrors.nombre = "El nombre es requerido y debe tener al menos 3 caracteres.";
        }
        if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = "El email no es válido.";
        }
        if (formData.calificacion !== undefined && (formData.calificacion < 0 || formData.calificacion > 5)) {
            newErrors.calificacion = "La calificación debe estar entre 0 y 5.";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        setSaving(true);
        try {
            await onSubmit(formData);
            onOpenChange(false);
        } catch (error) {
            // Error handling is managed by parent via toast usually
        } finally {
            setSaving(false);
        }
    };

    const handleChange = (field: keyof FormState, value: any) => {
        dispatch({ type: "SET_FIELD", field, value });
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: "" }));
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="bg-white border-[#F26522]/20 text-[#1B1B1B] max-w-3xl max-h-[90vh] overflow-y-auto p-0">
                <DialogHeader className="px-6 py-4 border-b border-[#F26522]/10 bg-[#F26522]/5">
                    <DialogTitle className="text-[#1B1B1B] text-xl font-bold uppercase tracking-wide">
                        {initialData ? "Editar Proveedor" : "Nuevo Proveedor"}
                    </DialogTitle>
                    <DialogDescription className="text-[#1B1B1B]/60">
                        {initialData
                            ? "Modifica los datos del proveedor"
                            : "Completa los datos para crear un nuevo proveedor"}
                    </DialogDescription>
                </DialogHeader>

                <div className="p-6">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <Label className="text-[#1B1B1B] font-medium mb-1.5 block">Nombre del Proveedor *</Label>
                            <Input
                                className={`bg-white border-[#F26522]/20 text-[#1B1B1B] focus:border-[#F26522] focus:ring-[#F26522]/20 ${errors.nombre ? "border-red-500" : ""}`}
                                placeholder="Ej: Distribuidora ABC"
                                value={formData.nombre}
                                onChange={(e) => handleChange("nombre", e.target.value)}
                            />
                            {errors.nombre && <p className="text-red-500 text-xs mt-1">{errors.nombre}</p>}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <Label className="text-[#1B1B1B] font-medium mb-1.5 block">Contacto</Label>
                                <Input
                                    className="bg-white border-[#F26522]/20 text-[#1B1B1B] focus:border-[#F26522] focus:ring-[#F26522]/20"
                                    placeholder="Nombre del contacto"
                                    value={formData.nombre_contacto || ""}
                                    onChange={(e) => handleChange("nombre_contacto", e.target.value)}
                                />
                            </div>
                            <div>
                                <Label className="text-[#1B1B1B] font-medium mb-1.5 block">Teléfono</Label>
                                <Input
                                    className="bg-white border-[#F26522]/20 text-[#1B1B1B] focus:border-[#F26522] focus:ring-[#F26522]/20 tabular-nums"
                                    placeholder="777-XXXXX"
                                    value={formData.telefono || ""}
                                    onChange={(e) => handleChange("telefono", e.target.value)}
                                />
                            </div>
                        </div>

                        <div>
                            <Label className="text-[#1B1B1B] font-medium mb-1.5 block">Email</Label>
                            <Input
                                type="email"
                                className={`bg-white border-[#F26522]/20 text-[#1B1B1B] focus:border-[#F26522] focus:ring-[#F26522]/20 ${errors.email ? "border-red-500" : ""}`}
                                placeholder="proveedor@email.com"
                                value={formData.email || ""}
                                onChange={(e) => handleChange("email", e.target.value)}
                            />
                            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="sm:col-span-2">
                                <Label className="text-[#1B1B1B] font-medium mb-1.5 block">Dirección</Label>
                                <Input
                                    className="bg-white border-[#F26522]/20 text-[#1B1B1B] focus:border-[#F26522] focus:ring-[#F26522]/20"
                                    placeholder="Dirección completa"
                                    value={formData.direccion || ""}
                                    onChange={(e) => handleChange("direccion", e.target.value)}
                                />
                            </div>

                            <div>
                                <Label className="text-[#1B1B1B] font-medium mb-1.5 block">Ciudad</Label>
                                <Input
                                    className="bg-white border-[#F26522]/20 text-[#1B1B1B] focus:border-[#F26522] focus:ring-[#F26522]/20"
                                    placeholder="La Paz"
                                    value={formData.ciudad || ""}
                                    onChange={(e) => handleChange("ciudad", e.target.value)}
                                />
                            </div>
                            <div>
                                <Label className="text-[#1B1B1B] font-medium mb-1.5 block">Zona</Label>
                                <Input
                                    className="bg-white border-[#F26522]/20 text-[#1B1B1B] focus:border-[#F26522] focus:ring-[#F26522]/20"
                                    placeholder="Ej: Sopocachi"
                                    value={formData.zona || ""}
                                    onChange={(e) => handleChange("zona", e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <Label className="text-[#1B1B1B] font-medium mb-1.5 block">NIT / RUC</Label>
                                <Input
                                    className="bg-white border-[#F26522]/20 text-[#1B1B1B] focus:border-[#F26522] focus:ring-[#F26522]/20 tabular-nums"
                                    placeholder="Número de identificación tributaria"
                                    value={formData.nit || ""}
                                    onChange={(e) => handleChange("nit", e.target.value)}
                                />
                            </div>
                            <div>
                                <Label className="text-[#1B1B1B] font-medium mb-1.5 block">Términos de Pago</Label>
                                <Input
                                    className="bg-white border-[#F26522]/20 text-[#1B1B1B] focus:border-[#F26522] focus:ring-[#F26522]/20"
                                    placeholder="Ej: 30 días, Contado"
                                    value={formData.terminos_pago || ""}
                                    onChange={(e) => handleChange("terminos_pago", e.target.value)}
                                />
                            </div>
                        </div>

                        <div>
                            <Label className="text-[#1B1B1B] font-medium mb-1.5 block">Calificación (1-5)</Label>
                            <Input
                                type="number"
                                min="0"
                                max="5"
                                step="0.1"
                                className={`bg-white border-[#F26522]/20 text-[#1B1B1B] focus:border-[#F26522] focus:ring-[#F26522]/20 tabular-nums ${errors.calificacion ? "border-red-500" : ""}`}
                                placeholder="0"
                                value={formData.calificacion || ""}
                                onChange={(e) => handleChange("calificacion", parseFloat(e.target.value) || 0)}
                            />
                            {errors.calificacion && <p className="text-red-500 text-xs mt-1">{errors.calificacion}</p>}
                        </div>

                        <div>
                            <Label className="text-[#1B1B1B] font-medium mb-1.5 block">Notas</Label>
                            <Textarea
                                className="bg-white border-[#F26522]/20 text-[#1B1B1B] focus:border-[#F26522] focus:ring-[#F26522]/20"
                                placeholder="Información adicional sobre el proveedor"
                                rows={3}
                                value={formData.notas || ""}
                                onChange={(e) => handleChange("notas", e.target.value)}
                            />
                        </div>

                        <div className="flex items-center gap-2 pt-2">
                            <Switch
                                checked={formData.activo}
                                onCheckedChange={(checked: boolean) => handleChange("activo", checked)}
                                className="data-[state=checked]:bg-[#28C76F]"
                            />
                            <Label className="text-[#1B1B1B] font-medium">Proveedor Activo</Label>
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-[#F26522]/10 mt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                                disabled={saving}
                                className="border-[#1B1B1B]/10 text-[#1B1B1B] hover:bg-[#F26522]/5 hover:text-[#F26522] hover:border-[#F26522]/30"
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="submit"
                                disabled={saving}
                                className="bg-[#F26522] hover:bg-[#F26522]/90 text-white font-bold shadow-md min-w-[100px]"
                            >
                                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : (initialData ? "Actualizar" : "Crear")}
                            </Button>
                        </div>
                    </form>
                </div>
            </DialogContent>
        </Dialog>
    );
}
