import { useState, useMemo } from "react";
import { Plus, Search, Truck } from "lucide-react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "./ui/alert-dialog";
import { SupplierCard } from "./suppliers/SupplierCard";
import { SupplierDialog } from "./suppliers/SupplierDialog";
import { useSuppliers } from "../hooks/useSuppliers";
import { Proveedor } from "../types";
import { Skeleton } from "./ui/skeleton";

export function Suppliers() {
  const { proveedores, loading, createSupplier, updateSupplier, deleteSupplier } = useSuppliers();
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Proveedor | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filteredProveedores = useMemo(() => {
    return proveedores.filter((proveedor) =>
      proveedor.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      proveedor.nombre_contacto?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      proveedor.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [proveedores, searchTerm]);

  const handleOpenCreate = () => {
    setEditingSupplier(null);
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (proveedor: Proveedor) => {
    setEditingSupplier(proveedor);
    setIsDialogOpen(true);
  };

  const handleSubmit = async (data: Omit<Proveedor, "id" | "created_at" | "updated_at">) => {
    if (editingSupplier) {
      await updateSupplier(editingSupplier.id, data);
    } else {
      await createSupplier(data);
    }
  };

  const handleDeleteClick = (id: string) => {
    setDeleteId(id);
  };

  const confirmDelete = async () => {
    if (deleteId) {
      await deleteSupplier(deleteId);
      setDeleteId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[#1B1B1B] text-3xl font-bold mb-2 uppercase tracking-tight">Proveedores</h1>
          <p className="text-[#1B1B1B]/60 font-medium">Gestiona tus proveedores de insumos</p>
        </div>
        <Button
          onClick={handleOpenCreate}
          className="bg-[#F26522] hover:bg-[#F26522]/90 text-white font-bold shadow-lg transition-all"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Proveedor
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#1B1B1B]/40 w-5 h-5" />
        <Input
          placeholder="Buscar proveedores..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 bg-white border-[#F26522]/20 text-[#1B1B1B] focus:border-[#F26522] focus:ring-[#F26522]/20"
        />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="p-6 border-[#F26522]/10 bg-white">
              <div className="flex gap-4">
                <Skeleton className="h-10 w-10 rounded-lg" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-5/6" />
              </div>
            </Card>
          ))}
        </div>
      ) : filteredProveedores.length === 0 ? (
        <Card className="bg-white border-[#F26522]/20 p-12 text-center shadow-sm">
          <Truck className="w-16 h-16 text-[#1B1B1B]/20 mx-auto mb-4" />
          <p className="text-[#1B1B1B]/60 font-medium mb-4">No hay proveedores registrados</p>
          <Button variant="outline" onClick={handleOpenCreate} className="border-[#F26522]/30 hover:bg-[#F26522]/5 text-[#F26522]">
            Crear el primero
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProveedores.map((proveedor) => (
            <SupplierCard
              key={proveedor.id}
              proveedor={proveedor}
              onEdit={handleOpenEdit}
              onDelete={handleDeleteClick}
            />
          ))}
        </div>
      )}

      <SupplierDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSubmit={handleSubmit}
        initialData={editingSupplier}
      />

      <AlertDialog open={!!deleteId} onOpenChange={(open: boolean) => !open && setDeleteId(null)}>
        <AlertDialogContent className="bg-white border-[#F26522]/20">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[#1B1B1B]">¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription className="text-[#1B1B1B]/60">
              Esta acción no se puede deshacer. Se eliminará permanentemente al proveedor.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-[#1B1B1B]/10 text-[#1B1B1B] hover:bg-gray-100">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-[#EA5455] hover:bg-[#EA5455]/90 text-white"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
