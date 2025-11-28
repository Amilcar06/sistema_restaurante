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

  const addIngredient = () => {
    const newIngredient: IngredienteForm = {
      id: `ingredient-${Date.now()}-${Math.random()}`,
      item_inventario_id: null,
      nombre_ingrediente: "",
      cantidad: 0,
      unidad: "kg",
      costo: 0
    };
    setIngredientes(prev => [...prev, newIngredient]);
  };

  const removeIngredient = (index: number) => {
    setIngredientes(ingredientes.filter((_, i) => i !== index));
  };

  const updateIngredient = (index: number, field: keyof IngredienteForm, value: any) => {
    const updated = [...ingredientes];
    const ingredient = { ...updated[index] };

    if (field === "item_inventario_id") {
      const selectedItem = inventoryItems.find(item => item.id === value);
      if (selectedItem) {
        ingredient.item_inventario_id = value;
        ingredient.nombre_ingrediente = selectedItem.nombre;
        ingredient.unidad = selectedItem.unidad;
        const quantity = ingredient.cantidad || 0;
        ingredient.costo = quantity * selectedItem.costo_unitario;
      } else {
        ingredient.item_inventario_id = null;
      }
    } else if (field === "cantidad") {
      ingredient.cantidad = parseFloat(value) || 0;
      if (ingredient.item_inventario_id) {
        const selectedItem = inventoryItems.find(item => item.id === ingredient.item_inventario_id);
        if (selectedItem) {
          ingredient.costo = ingredient.cantidad * selectedItem.costo_unitario;
        }
      }
    } else {
      (ingredient as any)[field] = value;
    }

    updated[index] = ingredient;
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
        <Loader2 className="w-8 h-8 animate-spin text-[#FF6B35]" />
      </div>
    );
  }

  return (
    <div className="space-y-8 w-full relative">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-white mb-3 text-3xl font-bold">Recetas y Costos</h1>
          <p className="text-white/60 text-base">Gestiona las recetas y calcula costos por plato</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open: boolean) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="bg-[#FF6B35] hover:bg-[#FF6B35]/90 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Nueva Receta
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-[#020617] border-[#FF6B35]/20 max-w-4xl">
            <DialogHeader className="px-1">
              <DialogTitle className="text-white">
                {editingRecipe ? "Editar Receta" : "Crear Nueva Receta"}
              </DialogTitle>
              <DialogDescription className="text-white/60">
                {editingRecipe ? "Modifica los datos de la receta" : "Completa los datos para crear una nueva receta"}
              </DialogDescription>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto px-1 pr-2 pb-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-white/80">Nombre del Plato</Label>
                    <Input
                      className="bg-white/5 border-[#FF6B35]/20 text-white"
                      placeholder="Ej: Pique Macho"
                      value={formData.nombre}
                      onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label className="text-white/80">Categoría</Label>
                    <Select
                      value={formData.categoria}
                      onValueChange={(value: string) => setFormData({ ...formData, categoria: value })}
                      required
                    >
                      <SelectTrigger className="bg-white/5 border-[#FF6B35]/20 text-white">
                        <SelectValue placeholder="Selecciona una categoría" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#020617] border-[#FF6B35]/20">
                        {enums.recipeCategories.map((cat) => (
                          <SelectItem key={cat} value={cat} className="text-white focus:bg-[#FF6B35]/20">
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-white/80">Subcategoría</Label>
                    <Input
                      className="bg-white/5 border-[#FF6B35]/20 text-white"
                      placeholder="Ej: Carnes Rojas, Carnes Blancas"
                      value={formData.subcategoria}
                      onChange={(e) => setFormData({ ...formData, subcategoria: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label className="text-white/80">Sucursal</Label>
                    <Select
                      value={formData.sucursal_id}
                      onValueChange={(value: string) => setFormData({ ...formData, sucursal_id: value })}
                    >
                      <SelectTrigger className="bg-white/5 border-[#FF6B35]/20 text-white">
                        <SelectValue placeholder="Selecciona una sucursal" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#020617] border-[#FF6B35]/20">
                        {sucursales.map((loc) => (
                          <SelectItem key={loc.id} value={loc.id} className="text-white focus:bg-[#FF6B35]/20">
                            {loc.nombre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Switch
                    checked={formData.disponible}
                    onCheckedChange={(checked: boolean) => setFormData({ ...formData, disponible: checked })}
                  />
                  <Label className="text-white/80">Disponible para venta</Label>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label className="text-white/80">Precio de Venta (Bs.)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      className="bg-white/5 border-[#FF6B35]/20 text-white"
                      placeholder="0.00"
                      value={formData.precio}
                      onChange={(e) => setFormData({ ...formData, precio: parseFloat(e.target.value) || 0 })}
                      required
                    />
                  </div>
                  <div>
                    <Label className="text-white/80">Porciones</Label>
                    <Input
                      type="number"
                      className="bg-white/5 border-[#FF6B35]/20 text-white"
                      placeholder="1"
                      value={formData.porciones}
                      onChange={(e) => setFormData({ ...formData, porciones: parseInt(e.target.value) || 1 })}
                      required
                      min="1"
                    />
                  </div>
                  <div>
                    <Label className="text-white/80">Tiempo Preparación (min)</Label>
                    <Input
                      type="number"
                      className="bg-white/5 border-[#FF6B35]/20 text-white"
                      placeholder="0"
                      value={formData.tiempo_preparacion}
                      onChange={(e) => setFormData({ ...formData, tiempo_preparacion: parseInt(e.target.value) || 0 })}
                      min="0"
                    />
                  </div>
                </div>

                {/* Ingredients Section */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-white/80">Ingredientes</Label>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={(e: React.MouseEvent) => {
                        e.preventDefault();
                        e.stopPropagation();
                        addIngredient();
                      }}
                      className="border-[#FF6B35]/40 text-[#FF6B35] hover:bg-[#FF6B35]/20 hover:text-white hover:border-[#FF6B35] bg-transparent"
                      size="sm"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Agregar Ingrediente
                    </Button>
                  </div>

                  {ingredientes.length === 0 && (
                    <div className="text-center py-4 text-white/60 text-sm">
                      No hay ingredientes. Agrega al menos uno.
                    </div>
                  )}

                  <div className="space-y-3">
                    {ingredientes.map((ingredient, index) => (
                      <Card key={ingredient.id} className="bg-white/5 border-[#FF6B35]/20 p-4">
                        <div className="flex items-start gap-3">
                          <div className="flex-1 grid grid-cols-12 gap-2">
                            <div className="col-span-12 md:col-span-4">
                              <Label className="text-white/60 text-xs mb-1 block">Ingrediente</Label>
                              <Select
                                value={ingredient.item_inventario_id || "manual"}
                                onValueChange={(value: string) => {
                                  if (value === "manual") {
                                    updateIngredient(index, "item_inventario_id", null);
                                  } else {
                                    updateIngredient(index, "item_inventario_id", value);
                                  }
                                }}
                                disabled={loadingInventory}
                              >
                                <SelectTrigger className="bg-white/5 border-[#FF6B35]/20 text-white h-9">
                                  <SelectValue placeholder="Seleccionar del inventario" />
                                </SelectTrigger>
                                <SelectContent className="bg-[#020617] border-[#FF6B35]/20 max-h-60">
                                  <SelectItem value="manual" className="text-white/60 focus:bg-[#FF6B35]/20">
                                    Ingrediente manual
                                  </SelectItem>
                                  {inventoryItems.map((item) => (
                                    <SelectItem
                                      key={item.id}
                                      value={item.id}
                                      className="text-white focus:bg-[#FF6B35]/20"
                                    >
                                      {item.nombre} ({item.categoria}) - Bs. {item.costo_unitario.toFixed(2)}/{item.unidad}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            {!ingredient.item_inventario_id && (
                              <div className="col-span-12 md:col-span-4">
                                <Label className="text-white/60 text-xs mb-1 block">Nombre Manual</Label>
                                <Input
                                  className="bg-white/5 border-[#FF6B35]/20 text-white h-9"
                                  placeholder="Nombre del ingrediente"
                                  value={ingredient.nombre_ingrediente}
                                  onChange={(e) => updateIngredient(index, "nombre_ingrediente", e.target.value)}
                                  required={!ingredient.item_inventario_id}
                                />
                              </div>
                            )}

                            <div className="col-span-6 md:col-span-2">
                              <Label className="text-white/60 text-xs mb-1 block">Cantidad</Label>
                              <Input
                                type="number"
                                step="0.01"
                                className="bg-white/5 border-[#FF6B35]/20 text-white h-9"
                                placeholder="0"
                                value={ingredient.cantidad || ""}
                                onChange={(e) => updateIngredient(index, "cantidad", e.target.value)}
                                required
                                min="0"
                              />
                            </div>

                            <div className="col-span-6 md:col-span-2">
                              <Label className="text-white/60 text-xs mb-1 block">Unidad</Label>
                              <Select
                                value={ingredient.unidad}
                                onValueChange={(value: string) => updateIngredient(index, "unidad", value)}
                                required
                                disabled={!!ingredient.item_inventario_id}
                              >
                                <SelectTrigger className="bg-white/5 border-[#FF6B35]/20 text-white h-9">
                                  <SelectValue placeholder="Selecciona unidad" />
                                </SelectTrigger>
                                <SelectContent className="bg-[#020617] border-[#FF6B35]/20">
                                  {enums.ingredientUnits.map((unit) => (
                                    <SelectItem key={unit} value={unit} className="text-white focus:bg-[#FF6B35]/20">
                                      {unit}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="col-span-12 md:col-span-2">
                              <Label className="text-white/60 text-xs mb-1 block">Costo (Bs.)</Label>
                              <Input
                                type="number"
                                step="0.01"
                                className="bg-white/5 border-[#FF6B35]/20 text-white h-9"
                                placeholder="0.00"
                                value={ingredient.costo.toFixed(2)}
                                onChange={(e) => updateIngredient(index, "costo", parseFloat(e.target.value) || 0)}
                                required
                                disabled={!!ingredient.item_inventario_id}
                              />
                              {ingredient.item_inventario_id && (
                                <p className="text-xs text-white/40 mt-1">Calculado automáticamente</p>
                              )}
                            </div>

                            <div className="col-span-12 md:col-span-2 flex items-end">
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeIngredient(index)}
                                className="text-red-400 hover:bg-red-500/10 h-9"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* Cost Summary */}
                {ingredientes.length > 0 && (
                  <Card className="bg-[#FF6B35]/10 border-[#FF6B35]/30 p-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-white/80">Costo Total de Ingredientes:</span>
                        <span className="text-white font-semibold">Bs. {calculateTotalCost().toFixed(2)}</span>
                      </div>
                      {formData.precio > 0 && (
                        <>
                          <div className="flex items-center justify-between">
                            <span className="text-white/80">Precio de Venta:</span>
                            <span className="text-[#FF6B35] font-semibold">Bs. {formData.precio.toFixed(2)}</span>
                          </div>
                          <div className="flex items-center justify-between pt-2 border-t border-[#FF6B35]/20">
                            <span className="text-white/80">Ganancia:</span>
                            <span className="text-[#FF6B35] font-semibold">
                              Bs. {(formData.precio - calculateTotalCost()).toFixed(2)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-white/80">Margen:</span>
                            <span className={`font-semibold ${calculateMargin() >= 70 ? "text-[#FF6B35]" :
                              calculateMargin() >= 50 ? "text-yellow-400" :
                                "text-red-400"
                              }`}>
                              {calculateMargin().toFixed(1)}%
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  </Card>
                )}

                <div className="flex gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                    className="flex-1 border-[#FF6B35]/40 text-[#FF6B35] hover:bg-[#FF6B35]/20 hover:text-white hover:border-[#FF6B35] bg-transparent"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-[#FF6B35] hover:bg-[#FF6B35]/90 text-white"
                    disabled={ingredientes.length === 0}
                  >
                    {editingRecipe ? "Actualizar Receta" : "Guardar Receta"}
                  </Button>
                </div>
              </form>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="bg-white/5 border-[#FF6B35]/20 p-6 hover:bg-white/10 hover:border-[#FF6B35]/40 transition-all duration-300">
          <div className="flex items-center gap-4">
            <div className="bg-[#FF6B35]/10 p-3 rounded-lg hover:bg-[#FF6B35]/20 transition-colors">
              <ChefHat className="w-6 h-6 text-[#FF6B35]" />
            </div>
            <div>
              <div className="text-white/70 mb-1 text-sm font-medium">Total de Recetas</div>
              <div className="text-white text-2xl font-bold">{totalRecipes} platos</div>
            </div>
          </div>
        </Card>
        <Card className="bg-white/5 border-[#FF6B35]/20 p-6 hover:bg-white/10 hover:border-[#FF6B35]/40 transition-all duration-300">
          <div className="flex items-center gap-4">
            <div className="bg-[#FF6B35]/10 p-3 rounded-lg hover:bg-[#FF6B35]/20 transition-colors">
              <DollarSign className="w-6 h-6 text-[#FF6B35]" />
            </div>
            <div>
              <div className="text-white/70 mb-1 text-sm font-medium">Margen Promedio</div>
              <div className="text-white text-2xl font-bold">{avgMargin.toFixed(1)}%</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Search */}
      <Card className="bg-white/5 border-[#FF6B35]/20 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
          <Input
            className="pl-10 bg-white/5 border-[#FF6B35]/20 text-white"
            placeholder="Buscar recetas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </Card>

      {/* Recipes Grid */}
      {filteredRecipes.length === 0 ? (
        <Card className="bg-white/5 border-[#FF6B35]/20 p-12 text-center">
          <p className="text-white/60 text-lg">
            {searchTerm ? "No se encontraron recetas" : "No hay recetas. Crea tu primera receta."}
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {paginatedRecipes.map((recipe) => (
            <Card key={recipe.id} className="bg-white/5 border-[#FF6B35]/20 p-6 hover:bg-white/10 hover:border-[#FF6B35]/40 transition-all duration-300">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="text-white mb-2 text-lg font-semibold">{recipe.nombre}</h3>
                  <span className="px-3 py-1 bg-white/10 rounded-full text-white/70 text-sm font-medium">{recipe.categoria}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`px-3 py-1 rounded-full ${recipe.margen >= 70 ? "bg-[#FF6B35]/20 text-[#FF6B35]" :
                    recipe.margen >= 50 ? "bg-yellow-500/20 text-yellow-400" :
                      "bg-red-500/20 text-red-400"
                    }`}>
                    {recipe.margen.toFixed(1)}% margen
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(recipe)}
                    className="text-[#FF6B35] hover:bg-[#FF6B35]/10"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(recipe.id)}
                    className="text-red-400 hover:bg-red-500/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <div className="text-white/60 text-sm mb-1">Costo</div>
                  <div className="text-white font-semibold">Bs. {recipe.costo.toFixed(2)}</div>
                </div>
                <div>
                  <div className="text-white/60 text-sm mb-1">Precio Venta</div>
                  <div className="text-[#FF6B35] font-semibold">Bs. {recipe.precio.toFixed(2)}</div>
                </div>
              </div>

              <div className="border-t border-[#FF6B35]/10 pt-4">
                <div className="text-white/60 text-sm mb-2">Ingredientes principales:</div>
                <div className="flex flex-wrap gap-2">
                  {recipe.ingredientes.slice(0, 3).map((ing, i) => (
                    <span key={i} className="text-white/80 text-sm bg-white/5 px-2 py-1 rounded">
                      {ing.nombre_ingrediente}
                    </span>
                  ))}
                  {recipe.ingredientes.length > 3 && (
                    <span className="text-white/60 text-sm px-2 py-1">
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
                  className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer text-white hover:text-[#FF6B35]"}
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
                    className="cursor-pointer text-white hover:text-[#FF6B35] data-[active=true]:bg-[#FF6B35]/20 data-[active=true]:text-[#FF6B35]"
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
                  className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer text-white hover:text-[#FF6B35]"}
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
