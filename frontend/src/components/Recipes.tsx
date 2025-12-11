import { useState, useEffect } from "react";
import { Plus, Search, ChefHat, DollarSign, Loader2, Edit, Trash2, X } from "lucide-react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "./ui/dialog";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "./ui/pagination";
import {
  recetasApi,
  inventarioApi,
  enumsApi,
  sucursalesApi
} from "../services/api";
import {
  Receta,
  ItemInventario,
  Sucursal
} from "../types";
import { toast } from "sonner";
import { Switch } from "./ui/switch";

interface IngredienteForm {
  id: string;
  item_inventario_id: string | null;
  nombre_ingrediente: string;
  cantidad: number;
  unidad: string;
  costo: number;
}

export function Recipes() {
  const [searchTerm, setSearchTerm] = useState("");
  const [recipes, setRecipes] = useState<Receta[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<Receta | null>(null);
  const [inventoryItems, setInventoryItems] = useState<ItemInventario[]>([]);
  const [loadingInventory, setLoadingInventory] = useState(false);
  const [sucursales, setSucursales] = useState<Sucursal[]>([]);

  const [formData, setFormData] = useState({
    nombre: "",
    categoria: "",
    subcategoria: "",
    precio: 0,
    porciones: 1,
    descripcion: "",
    instrucciones: "",
    tiempo_preparacion: 0,
    sucursal_id: "",
    disponible: true
  });

  const [ingredientes, setIngredientes] = useState<IngredienteForm[]>([]);
  const [enums, setEnums] = useState<{
    recipeCategories: string[];
    ingredientUnits: string[];
  }>({
    recipeCategories: [],
    ingredientUnits: []
  });

  // Nested Dialog State for Ingredients
  const [isIngredientDialogOpen, setIsIngredientDialogOpen] = useState(false);
  const [currentIngredientIndex, setCurrentIngredientIndex] = useState<number | null>(null);
  const [tempIngredient, setTempIngredient] = useState<IngredienteForm>({
    id: "",
    item_inventario_id: null,
    nombre_ingrediente: "",
    cantidad: 0,
    unidad: "",
    costo: 0
  });

  useEffect(() => {
    loadRecipes();
    loadEnums();
  }, []);

  useEffect(() => {
    if (isDialogOpen) {
      loadInventoryItems();
      loadSucursales();
    }
  }, [isDialogOpen]);

  const loadEnums = async () => {
    try {
      const [categoriesRes, unitsRes] = await Promise.all([
        enumsApi.getRecipeCategories(),
        enumsApi.getRecipeIngredientUnits()
      ]);
      setEnums({
        recipeCategories: categoriesRes.categories,
        ingredientUnits: unitsRes.units
      });
    } catch (error) {
      console.error("Error loading enums:", error);
    }
  };

  const loadRecipes = async () => {
    try {
      setLoading(true);
      const data = await recetasApi.obtenerTodos();
      setRecipes(data);
    } catch (error) {
      console.error("Error loading recipes:", error);
      toast.error("Error al cargar las recetas");
    } finally {
      setLoading(false);
    }
  };

  const loadInventoryItems = async () => {
    try {
      setLoadingInventory(true);
      const items = await inventarioApi.obtenerTodos();
      setInventoryItems(items);
    } catch (error) {
      console.error("Error loading inventory:", error);
      toast.error("Error al cargar el inventario");
    } finally {
      setLoadingInventory(false);
    }
  };

  const loadSucursales = async () => {
    try {
      const data = await sucursalesApi.obtenerTodos();
      setSucursales(data);
    } catch (error) {
      console.error("Error loading business locations:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (ingredientes.length === 0) {
      toast.error("La receta debe tener al menos un ingrediente");
      return;
    }

    try {
      const recipeData: any = {
        ...formData,
        ingredientes: ingredientes.map(ing => {
          return {
            item_inventario_id: ing.item_inventario_id || undefined,
            nombre_ingrediente: ing.nombre_ingrediente,
            cantidad: ing.cantidad,
            unidad: ing.unidad,
            costo: ing.costo
          };
        })
      };

      // Calcular costo total y margen
      const costoTotal = ingredientes.reduce((sum, ing) => sum + ing.costo, 0);
      recipeData.costo = costoTotal;

      if (formData.precio > 0) {
        recipeData.margen = ((formData.precio - costoTotal) / formData.precio * 100);
      } else {
        recipeData.margen = 0;
      }

      if (editingRecipe) {
        await recetasApi.actualizar(editingRecipe.id, recipeData);
        toast.success("Receta actualizada correctamente");
      } else {
        await recetasApi.crear(recipeData);
        toast.success("Receta creada correctamente");
      }
      setIsDialogOpen(false);
      resetForm();
      loadRecipes();
    } catch (error: any) {
      console.error("Error saving recipe:", error);

      let errorMessage = "Error al guardar la receta";
      if (error?.message) {
        errorMessage = error.message;
      } else if (error?.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      }

      toast.error(errorMessage);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar esta receta?")) return;

    try {
      await recetasApi.eliminar(id);
      toast.success("Receta eliminada correctamente");
      loadRecipes();
    } catch (error) {
      console.error("Error deleting recipe:", error);
      toast.error("Error al eliminar la receta");
    }
  };

  const handleEdit = async (recipe: Receta) => {
    setEditingRecipe(recipe);
    try {
      const fullRecipe = await recetasApi.obtenerPorId(recipe.id);
      setFormData({
        nombre: fullRecipe.nombre,
        categoria: fullRecipe.categoria,
        subcategoria: fullRecipe.subcategoria || "",
        precio: fullRecipe.precio,
        porciones: fullRecipe.porciones,
        descripcion: fullRecipe.descripcion || "",
        instrucciones: fullRecipe.instrucciones || "",
        tiempo_preparacion: fullRecipe.tiempo_preparacion || 0,
        sucursal_id: fullRecipe.sucursal_id || "",
        disponible: fullRecipe.disponible ?? true
      });

      const mappedIngredients: IngredienteForm[] = (fullRecipe.ingredientes || []).map(ing => ({
        id: ing.id || `ingredient-${Date.now()}-${Math.random()}`,
        item_inventario_id: ing.item_inventario_id || null,
        nombre_ingrediente: ing.nombre_ingrediente,
        cantidad: ing.cantidad,
        unidad: ing.unidad,
        costo: ing.costo
      }));
      setIngredientes(mappedIngredients);
    } catch (error) {
      console.error("Error loading recipe details:", error);
      // Fallback
      setFormData({
        nombre: recipe.nombre,
        categoria: recipe.categoria,
        subcategoria: recipe.subcategoria || "",
        precio: recipe.precio,
        porciones: recipe.porciones,
        descripcion: recipe.descripcion || "",
        instrucciones: recipe.instrucciones || "",
        tiempo_preparacion: recipe.tiempo_preparacion || 0,
        sucursal_id: recipe.sucursal_id || "",
        disponible: recipe.disponible ?? true
      });

      const mappedIngredients: IngredienteForm[] = (recipe.ingredientes || []).map(ing => ({
        id: ing.id || `ingredient-${Date.now()}-${Math.random()}`,
        item_inventario_id: ing.item_inventario_id || null,
        nombre_ingrediente: ing.nombre_ingrediente,
        cantidad: ing.cantidad,
        unidad: ing.unidad,
        costo: ing.costo
      }));
      setIngredientes(mappedIngredients);
    }
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      nombre: "",
      categoria: "",
      subcategoria: "",
      precio: 0,
      porciones: 1,
      descripcion: "",
      instrucciones: "",
      tiempo_preparacion: 0,
      sucursal_id: "",
      disponible: true
    });
    setIngredientes([]);
    setEditingRecipe(null);
  };

  const openIngredientDialog = (index: number | null = null) => {
    if (index !== null && ingredientes[index]) {
      setTempIngredient({ ...ingredientes[index] });
      setCurrentIngredientIndex(index);
    } else {
      setTempIngredient({
        id: Date.now().toString(),
        item_inventario_id: null,
        nombre_ingrediente: "",
        cantidad: 0,
        unidad: "",
        costo: 0
      });
      setCurrentIngredientIndex(null);
    }
    setIsIngredientDialogOpen(true);
  };

  const saveIngredient = () => {
    if (tempIngredient.cantidad <= 0) {
      toast.error("La cantidad debe ser mayor a 0");
      return;
    }
    if (!tempIngredient.item_inventario_id && !tempIngredient.nombre_ingrediente) {
      toast.error("Debe seleccionar un insumo o ingresar un nombre");
      return;
    }

    const updated = [...ingredientes];
    if (currentIngredientIndex !== null) {
      updated[currentIngredientIndex] = tempIngredient;
    } else {
      updated.push(tempIngredient);
    }
    setIngredientes(updated);
    setIsIngredientDialogOpen(false);
  };

  const updateTempIngredient = (field: keyof IngredienteForm, value: any) => {
    const updated = { ...tempIngredient };
    if (field === "item_inventario_id") {
      updated.item_inventario_id = value;
      const selectedItem = inventoryItems.find(item => item.id === value);
      if (selectedItem) {
        updated.nombre_ingrediente = selectedItem.nombre;
        updated.unidad = selectedItem.unidad;
        updated.costo = updated.cantidad * selectedItem.costo_unitario;
      }
    } else if (field === "cantidad") {
      updated.cantidad = parseFloat(value) || 0;
      if (updated.item_inventario_id) {
        const selectedItem = inventoryItems.find(item => item.id === updated.item_inventario_id);
        if (selectedItem) {
          updated.costo = updated.cantidad * selectedItem.costo_unitario;
        }
      }
    } else {
      (updated as any)[field] = value;
    }
    setTempIngredient(updated);
  };

  const removeIngredient = (index: number) => {
    const updated = [...ingredientes];
    updated.splice(index, 1);
    setIngredientes(updated);
  };

  const calculateTotalCost = () => {
    return ingredientes.reduce((sum, ing) => sum + ing.costo, 0);
  };

  const calculateMargin = () => {
    const totalCost = calculateTotalCost();
    if (formData.precio > 0 && totalCost > 0) {
      return ((formData.precio - totalCost) / formData.precio * 100);
    }
    return 0;
  };

  const filteredRecipes = recipes.filter(recipe =>
    recipe.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    recipe.categoria.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredRecipes.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedRecipes = filteredRecipes.slice(startIndex, endIndex);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const avgMargin = recipes.length > 0
    ? recipes.reduce((sum, recipe) => sum + recipe.margen, 0) / recipes.length
    : 0;
  const totalRecipes = recipes.length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 w-full relative">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-foreground mb-3 text-3xl font-bold">Recetas y Costos</h1>
          <p className="text-muted-foreground text-base">Gestiona las recetas y calcula costos por plato</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open: boolean) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="bg-[#F26522] hover:bg-[#F26522]/90 text-[#1B1B1B] shadow-lg hover:shadow-[#F26522]/50 transition-all duration-300 font-bold">
              <Plus className="w-4 h-4 mr-2" />
              Nueva Receta
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-white border-[#F26522]/20 max-w-4xl max-h-[90vh] overflow-hidden flex flex-col p-0">
            <DialogHeader className="px-6 py-4 border-b border-[#F26522]/10 bg-[#F26522]/5">
              <DialogTitle className="text-[#1B1B1B] text-xl font-bold uppercase tracking-wide">
                {editingRecipe ? "Editar Receta" : "Crear Nueva Receta"}
              </DialogTitle>
              <DialogDescription className="text-[#1B1B1B]/60">
                {editingRecipe ? "Modifica los datos de la receta" : "Completa los datos para crear una nueva receta"}
              </DialogDescription>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto px-6 py-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <Label className="text-[#1B1B1B] font-medium mb-2 block">Nombre del Plato</Label>
                    <Input
                      className="bg-white border-[#F26522]/20 text-[#1B1B1B] focus:border-[#F26522] focus:ring-[#F26522]/20 transition-all font-medium"
                      placeholder="Ej: Pique Macho"
                      value={formData.nombre}
                      onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label className="text-[#1B1B1B] font-medium mb-2 block">Categoría</Label>
                    <Select
                      value={formData.categoria}
                      onValueChange={(value: string) => setFormData({ ...formData, categoria: value })}
                      required
                    >
                      <SelectTrigger className="bg-white border-[#F26522]/20 text-[#1B1B1B] focus:border-[#F26522] focus:ring-[#F26522]/20">
                        <SelectValue placeholder="Selecciona una categoría" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-[#F26522]/20 z-[9999]">
                        {enums.recipeCategories.map((cat) => (
                          <SelectItem key={cat} value={cat} className="text-[#1B1B1B] focus:bg-[#F26522]/10 focus:text-[#1B1B1B]">
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <Label className="text-[#1B1B1B] font-medium mb-2 block">Subcategoría</Label>
                    <Input
                      className="bg-white border-[#F26522]/20 text-[#1B1B1B] focus:border-[#F26522] focus:ring-[#F26522]/20 transition-all"
                      placeholder="Ej: Carnes Rojas, Carnes Blancas"
                      value={formData.subcategoria}
                      onChange={(e) => setFormData({ ...formData, subcategoria: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label className="text-[#1B1B1B] font-medium mb-2 block">Sucursal</Label>
                    <Select
                      value={formData.sucursal_id}
                      onValueChange={(value: string) => setFormData({ ...formData, sucursal_id: value })}
                    >
                      <SelectTrigger className="bg-white border-[#F26522]/20 text-[#1B1B1B] focus:border-[#F26522] focus:ring-[#F26522]/20">
                        <SelectValue placeholder="Selecciona una sucursal" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-[#F26522]/20 z-[9999]">
                        {sucursales.map((loc) => (
                          <SelectItem key={loc.id} value={loc.id} className="text-[#1B1B1B] focus:bg-[#F26522]/10 focus:text-[#1B1B1B]">
                            {loc.nombre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-4 bg-[#F4F5F7] rounded-lg border border-[#F26522]/10">
                  <Switch
                    checked={formData.disponible}
                    onCheckedChange={(checked: boolean) => setFormData({ ...formData, disponible: checked })}
                    className="data-[state=checked]:bg-[#28C76F]"
                  />
                  <Label className="text-[#1B1B1B] font-medium">Disponible para venta</Label>
                </div>

                <div className="grid grid-cols-3 gap-6">
                  <div>
                    <Label className="text-[#1B1B1B] font-medium mb-2 block">Precio de Venta (Bs.)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      className="bg-white border-[#F26522]/20 text-[#1B1B1B] focus:border-[#F26522] focus:ring-[#F26522]/20 transition-all tabular-nums font-bold"
                      placeholder="0.00"
                      value={formData.precio}
                      onChange={(e) => setFormData({ ...formData, precio: parseFloat(e.target.value) || 0 })}
                      required
                    />
                  </div>
                  <div>
                    <Label className="text-[#1B1B1B] font-medium mb-2 block">Porciones</Label>
                    <Input
                      type="number"
                      className="bg-white border-[#F26522]/20 text-[#1B1B1B] focus:border-[#F26522] focus:ring-[#F26522]/20 transition-all tabular-nums"
                      placeholder="1"
                      value={formData.porciones}
                      onChange={(e) => setFormData({ ...formData, porciones: parseInt(e.target.value) || 1 })}
                      required
                      min="1"
                    />
                  </div>
                  <div>
                    <Label className="text-[#1B1B1B] font-medium mb-2 block">Tiempo Prep. (min)</Label>
                    <Input
                      type="number"
                      className="bg-white border-[#F26522]/20 text-[#1B1B1B] focus:border-[#F26522] focus:ring-[#F26522]/20 transition-all tabular-nums"
                      placeholder="0"
                      value={formData.tiempo_preparacion}
                      onChange={(e) => setFormData({ ...formData, tiempo_preparacion: parseInt(e.target.value) || 0 })}
                      min="0"
                    />
                  </div>
                </div>

                {/* Ingredients Section - Simplified View */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-[#1B1B1B] font-bold uppercase tracking-wide text-sm">Ingredientes</Label>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={(e) => {
                        e.preventDefault();
                        openIngredientDialog();
                      }}
                      className="border-[#F26522] text-[#F26522] hover:bg-[#F26522] hover:text-white transition-all font-semibold"
                      size="sm"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Agregar Ingrediente
                    </Button>
                  </div>

                  {ingredientes.length === 0 ? (
                    <div className="text-center py-8 text-[#1B1B1B]/40 text-sm border-2 border-dashed border-[#F26522]/20 rounded-lg bg-[#F26522]/5">
                      No hay ingredientes. Agrega componentes para calcular el costo.
                    </div>
                  ) : (
                    <div className="rounded-lg border border-[#F26522]/20 overflow-hidden">
                      <table className="w-full text-sm">
                        <thead className="bg-[#F26522]/10 text-[#1B1B1B] font-bold uppercase text-xs">
                          <tr>
                            <th className="px-4 py-2 text-left">Ingrediente</th>
                            <th className="px-4 py-2 text-right">Cant.</th>
                            <th className="px-4 py-2 text-left">Unidad</th>
                            <th className="px-4 py-2 text-right">Costo</th>
                            <th className="px-4 py-2 text-center">Acciones</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#F26522]/10 bg-white">
                          {ingredientes.map((ing, i) => (
                            <tr key={ing.id} className="hover:bg-[#F26522]/5 transition-colors">
                              <td className="px-4 py-2 font-medium text-[#1B1B1B]">{ing.nombre_ingrediente || "Sin nombre"}</td>
                              <td className="px-4 py-2 text-right tabular-nums">{ing.cantidad}</td>
                              <td className="px-4 py-2 text-muted-foreground">{ing.unidad}</td>
                              <td className="px-4 py-2 text-right tabular-nums font-semibold">Bs. {ing.costo.toFixed(2)}</td>
                              <td className="px-4 py-2 text-center flex justify-center gap-1">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => openIngredientDialog(i)}
                                  className="h-8 w-8 p-0 text-[#1B1B1B]/60 hover:text-[#F26522] hover:bg-[#F26522]/10"
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeIngredient(i)}
                                  className="h-8 w-8 p-0 text-[#1B1B1B]/60 hover:text-[#EA5455] hover:bg-[#EA5455]/10"
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Cost Summary - Fixed at Bottom */}
                <Card className="bg-white border-[#F26522]/20 text-[#1B1B1B] p-6 rounded-lg shadow-lg mt-6">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-[#1B1B1B]/80">
                      <span className="text-sm font-medium uppercase tracking-wide">Costo Ingredientes</span>
                      <span className="font-bold tabular-nums">Bs. {calculateTotalCost().toFixed(2)}</span>
                    </div>
                    {formData.precio > 0 && (
                      <>
                        <div className="w-full h-px bg-[#F26522]/10 my-2"></div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium uppercase tracking-wide text-[#1B1B1B]/80">Precio Venta</span>
                          <span className="text-[#F26522] font-bold text-xl tabular-nums">Bs. {formData.precio.toFixed(2)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium uppercase tracking-wide text-[#1B1B1B]/80">Ganancia Neta</span>
                          <span className="text-[#28C76F] font-bold tabular-nums">
                            Bs. {(formData.precio - calculateTotalCost()).toFixed(2)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between bg-[#F4F5F7] p-2 rounded mt-2 border border-[#F26522]/10">
                          <span className="text-sm font-bold uppercase tracking-wide text-[#1B1B1B]">Margen</span>
                          <span className={`font-bold tabular-nums text-lg ${calculateMargin() > 0 ? "text-[#28C76F]" : "text-[#EA5455]"}`}>
                            {calculateMargin().toFixed(1)}%
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </Card>

                <div className="flex gap-4 pt-4 border-t border-[#F26522]/10">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                    className="flex-1 border-[#1B1B1B]/20 text-[#1B1B1B] hover:bg-[#1B1B1B]/5"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-[#F26522] hover:bg-[#F26522]/90 text-white font-bold shadow-md hover:shadow-lg transition-all"
                  >
                    {editingRecipe ? "Guardar Cambios" : "Crear Receta"}
                  </Button>
                </div>
              </form>
            </div>
          </DialogContent>
        </Dialog>

        {/* Nested Dialog for Ingredient Management */}
        <Dialog open={isIngredientDialogOpen} onOpenChange={setIsIngredientDialogOpen}>
          <DialogContent className="bg-white border-[#F26522]/20 shadow-xl z-[99999] sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="text-[#1B1B1B] text-lg font-bold uppercase tracking-wide">
                {currentIngredientIndex !== null ? "Editar Ingrediente" : "Agregar Ingrediente"}
              </DialogTitle>
              <DialogDescription className="text-[#1B1B1B]/60">
                Detalla el ingrediente y su costo.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label className="text-[#1B1B1B]/80 font-semibold mb-1 block">Insumo del Inventario</Label>
                <Select
                  value={tempIngredient.item_inventario_id || "manual"}
                  onValueChange={(value: string) => {
                    if (value === "manual") {
                      updateTempIngredient("item_inventario_id", null);
                    } else {
                      updateTempIngredient("item_inventario_id", value);
                    }
                  }}
                  disabled={loadingInventory}
                >
                  <SelectTrigger className="bg-white border-[#F26522]/20 text-[#1B1B1B] focus:border-[#F26522] focus:ring-[#F26522]/20">
                    <SelectValue placeholder="Seleccionar" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-[#F26522]/20 z-[99999]">
                    <SelectItem value="manual" className="text-[#1B1B1B] focus:bg-[#F26522]/10">
                      Ingrediente Manual / Otro
                    </SelectItem>
                    {inventoryItems.map((item) => (
                      <SelectItem key={item.id} value={item.id} className="text-[#1B1B1B] focus:bg-[#F26522]/10">
                        {item.nombre} ({item.unidad}) - Bs. {item.costo_unitario}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {!tempIngredient.item_inventario_id && (
                <div>
                  <Label className="text-[#1B1B1B]/80 font-semibold mb-1 block">Nombre Manual</Label>
                  <Input
                    className="bg-white border-[#F26522]/20 text-[#1B1B1B] focus:border-[#F26522] focus:ring-[#F26522]/20"
                    placeholder="Ej: Sal, Pimienta..."
                    value={tempIngredient.nombre_ingrediente}
                    onChange={(e) => updateTempIngredient("nombre_ingrediente", e.target.value)}
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-[#1B1B1B]/80 font-semibold mb-1 block">Cantidad</Label>
                  <Input
                    type="number"
                    step="0.01"
                    className="bg-white border-[#F26522]/20 text-[#1B1B1B] focus:border-[#F26522] focus:ring-[#F26522]/20 tabular-nums"
                    placeholder="0"
                    value={tempIngredient.cantidad || ""}
                    onChange={(e) => updateTempIngredient("cantidad", e.target.value)}
                  />
                </div>
                <div>
                  <Label className="text-[#1B1B1B]/80 font-semibold mb-1 block">Unidad</Label>
                  <Select
                    value={tempIngredient.unidad}
                    onValueChange={(value: string) => updateTempIngredient("unidad", value)}
                    disabled={!!tempIngredient.item_inventario_id}
                  >
                    <SelectTrigger className="bg-white border-[#F26522]/20 text-[#1B1B1B] focus:border-[#F26522] focus:ring-[#F26522]/20">
                      <SelectValue placeholder="Unidad" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-[#F26522]/20 z-[99999]">
                      {enums.ingredientUnits.map((u) => (
                        <SelectItem key={u} value={u} className="text-[#1B1B1B] focus:bg-[#F26522]/10">
                          {u}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label className="text-[#1B1B1B]/80 font-semibold mb-1 block">Costo Total (Bs.)</Label>
                <Input
                  type="number"
                  step="0.01"
                  className="bg-[#F4F5F7] border-[#F26522]/10 text-[#1B1B1B] focus:border-[#F26522] focus:ring-[#F26522]/20 tabular-nums font-bold"
                  placeholder="0.00"
                  value={tempIngredient.costo}
                  onChange={(e) => updateTempIngredient("costo", parseFloat(e.target.value) || 0)}
                  disabled={!!tempIngredient.item_inventario_id}
                />
              </div>

              <div className="pt-2 flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsIngredientDialogOpen(false)}
                  className="flex-1 border-[#1B1B1B]/20 text-[#1B1B1B]"
                >
                  Cancelar
                </Button>
                <Button
                  type="button"
                  onClick={saveIngredient}
                  className="flex-1 bg-[#F26522] hover:bg-[#F26522]/90 text-white font-bold shadow-md"
                >
                  Guardar Ingrediente
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <Card className="bg-[#F26522]/10 border-[#F26522]/20 p-6 hover:bg-[#F26522]/20 transition-all duration-300 shadow-sm transform hover:-translate-y-1 hover:shadow-md">
          <div className="flex items-center gap-4">
            <div className="bg-white/80 p-3 rounded-lg shadow-sm">
              <ChefHat className="w-6 h-6 text-[#F26522]" />
            </div>
            <div>
              <div className="text-foreground/80 mb-1 text-sm font-bold uppercase tracking-wide">Total de Recetas</div>
              <div className="text-foreground text-3xl font-bold tabular-nums tracking-tight">{totalRecipes}</div>
              <div className="text-xs text-foreground/60 font-medium">platos registrados</div>
            </div>
          </div>
        </Card>
        <Card className="bg-[#28C76F]/10 border-[#28C76F]/20 p-6 hover:bg-[#28C76F]/20 transition-all duration-300 shadow-sm transform hover:-translate-y-1 hover:shadow-md">
          <div className="flex items-center gap-4">
            <div className="bg-white/80 p-3 rounded-lg shadow-sm">
              <DollarSign className="w-6 h-6 text-[#28C76F]" />
            </div>
            <div>
              <div className="text-foreground/80 mb-1 text-sm font-bold uppercase tracking-wide">Margen Promedio</div>
              <div className="text-foreground text-3xl font-bold tabular-nums tracking-tight">{avgMargin.toFixed(1)}%</div>
              <div className="text-xs text-foreground/60 font-medium">rentabilidad global</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Search */}
      <Card className="bg-background border-[#F26522]/20 p-4 shadow-sm">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-hover:text-[#F26522] transition-colors" />
          <Input
            className="pl-10 bg-white border-[#F26522]/20 text-[#1B1B1B] focus:border-[#F26522] focus:ring-[#F26522]/20 transition-all"
            placeholder="Buscar recetas por nombre o categoría..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </Card>

      {/* Recipes Grid */}
      {/* Recipes Grid */}
      {filteredRecipes.length === 0 ? (
        <Card className="bg-white border-[#F26522]/20 p-12 text-center shadow-sm">
          <p className="text-muted-foreground text-lg">
            {searchTerm ? "No se encontraron recetas" : "No hay recetas. Crea tu primera receta."}
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {paginatedRecipes.map((recipe) => (
            <Card key={recipe.id} className="bg-white border-[#F26522]/20 p-6 hover:bg-white hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 shadow-sm">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="text-[#1B1B1B] mb-2 text-lg font-bold uppercase tracking-wide">{recipe.nombre}</h3>
                  <span className="px-3 py-1 bg-[#F4F5F7] rounded-full text-[#1B1B1B]/70 text-sm font-medium border border-[#F26522]/10">{recipe.categoria}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`px-3 py-1 rounded-full font-bold text-xs tracking-wide ${recipe.margen > 0 ? "bg-[#28C76F]/10 text-[#28C76F] border border-[#28C76F]/20" :
                    "bg-[#EA5455]/10 text-[#EA5455] border border-[#EA5455]/20"
                    }`}>
                    {recipe.margen.toFixed(1)}% margen
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(recipe)}
                    className="text-[#1B1B1B]/60 hover:text-[#F26522] hover:bg-[#F26522]/10 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(recipe.id)}
                    className="text-[#1B1B1B]/60 hover:text-[#EA5455] hover:bg-[#EA5455]/10 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <div className="text-[#1B1B1B]/60 text-xs font-bold uppercase tracking-wide mb-1">Costo</div>
                  <div className="text-[#1B1B1B] font-bold text-xl tabular-nums tracking-tight">Bs. {recipe.costo.toFixed(2)}</div>
                </div>
                <div>
                  <div className="text-[#1B1B1B]/60 text-xs font-bold uppercase tracking-wide mb-1">Precio Venta</div>
                  <div className="text-[#F26522] font-bold text-xl tabular-nums tracking-tight">Bs. {recipe.precio.toFixed(2)}</div>
                </div>
              </div>

              <div className="border-t border-[#F26522]/10 pt-4">
                <div className="text-[#1B1B1B]/60 text-xs font-bold uppercase tracking-wide mb-2">Ingredientes principales:</div>
                <div className="flex flex-wrap gap-2">
                  {recipe.ingredientes.slice(0, 3).map((ing, i) => (
                    <span key={i} className="text-[#1B1B1B]/80 text-xs bg-[#F4F5F7] px-2 py-1 rounded border border-gray-200">
                      {ing.nombre_ingrediente}
                    </span>
                  ))}
                  {recipe.ingredientes.length > 3 && (
                    <span className="text-[#1B1B1B]/60 text-xs px-2 py-1 font-medium">
                      +{recipe.ingredientes.length - 3} más
                    </span>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {filteredRecipes.length > itemsPerPage && (
        <div className="mt-6 flex justify-center">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage > 1) setCurrentPage(currentPage - 1);
                  }}
                  className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer text-foreground hover:text-primary"}
                  size="default"
                />
              </PaginationItem>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <PaginationItem key={page}>
                  <PaginationLink
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setCurrentPage(page);
                    }}
                    isActive={currentPage === page}
                    className="cursor-pointer text-foreground hover:text-primary data-[active=true]:bg-primary/20 data-[active=true]:text-primary"
                    size="icon"
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
                  }}
                  className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer text-foreground hover:text-primary"}
                  size="default"
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}
