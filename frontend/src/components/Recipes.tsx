import { useState, useEffect } from "react";
import { Plus, Search, ChefHat, DollarSign, Loader2, Edit, Trash2, X } from "lucide-react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "./ui/dialog";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "./ui/pagination";
import { recipesApi, inventoryApi, enumsApi, businessLocationsApi, type Recipe as ApiRecipe, type InventoryItem, type BusinessLocation } from "../services/api";
import { toast } from "sonner";
import { Switch } from "./ui/switch";

interface Recipe {
  id: string;
  name: string;
  category: string;
  ingredients: Array<{
    id?: string;
    ingredient_name: string;
    quantity: number;
    unit: string;
    cost: number;
    inventory_item_id?: string;
  }>;
  cost: number;
  price: number;
  margin: number;
  servings: number;
}

interface IngredientForm {
  id: string;
  inventory_item_id: string | null;
  ingredient_name: string;
  quantity: number;
  unit: string;
  cost: number;
}

export function Recipes() {
  const [searchTerm, setSearchTerm] = useState("");
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [loadingInventory, setLoadingInventory] = useState(false);
  const [businessLocations, setBusinessLocations] = useState<BusinessLocation[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    subcategory: "",
    price: 0,
    servings: 1,
    description: "",
    instructions: "",
    preparation_time: 0,
    location_id: "",
    is_available: true
  });
  const [ingredients, setIngredients] = useState<IngredientForm[]>([]);
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
      loadBusinessLocations();
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
      const data = await recipesApi.getAll();
      const mappedRecipes = data.map(recipe => ({
        id: recipe.id,
        name: recipe.name,
        category: recipe.category,
        ingredients: recipe.ingredients || [],
        cost: recipe.cost,
        price: recipe.price,
        margin: recipe.margin,
        servings: recipe.servings
      }));
      setRecipes(mappedRecipes);
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
      const items = await inventoryApi.getAll();
      setInventoryItems(items);
    } catch (error) {
      console.error("Error loading inventory:", error);
      toast.error("Error al cargar el inventario");
    } finally {
      setLoadingInventory(false);
    }
  };

  const loadBusinessLocations = async () => {
    try {
      const locations = await businessLocationsApi.getAll();
      setBusinessLocations(locations);
    } catch (error) {
      console.error("Error loading business locations:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (ingredients.length === 0) {
      toast.error("La receta debe tener al menos un ingrediente");
      return;
    }

    try {
      const recipeData = {
        ...formData,
        ingredients: ingredients.map(ing => {
          const { id, ...ingredientData } = ing;
          return {
            inventory_item_id: ingredientData.inventory_item_id || undefined,
            ingredient_name: ingredientData.ingredient_name,
            quantity: ingredientData.quantity,
            unit: ingredientData.unit,
            cost: ingredientData.cost
          };
        })
      };

      if (editingRecipe) {
        await recipesApi.update(editingRecipe.id, recipeData);
        toast.success("Receta actualizada correctamente");
      } else {
        await recipesApi.create(recipeData);
        toast.success("Receta creada correctamente");
      }
      setIsDialogOpen(false);
      resetForm();
      loadRecipes();
    } catch (error: any) {
      console.error("Error saving recipe:", error);
      
      // Extract error message from API response
      let errorMessage = "Error al guardar la receta";
      if (error?.message) {
        errorMessage = error.message;
      } else if (error?.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      // Show specific error for margin validation
      if (errorMessage.includes("precio") || errorMessage.includes("costo") || errorMessage.includes("margen")) {
        toast.error(errorMessage, { duration: 6000 });
      } else {
        toast.error(errorMessage);
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar esta receta?")) return;
    
    try {
      await recipesApi.delete(id);
      toast.success("Receta eliminada correctamente");
      loadRecipes();
    } catch (error) {
      console.error("Error deleting recipe:", error);
      toast.error("Error al eliminar la receta");
    }
  };

  const handleEdit = async (recipe: Recipe) => {
    setEditingRecipe(recipe);
    // Load full recipe data from API
    try {
      const fullRecipe = await recipesApi.getById(recipe.id);
      setFormData({
        name: fullRecipe.name,
        category: fullRecipe.category,
        subcategory: fullRecipe.subcategory || "",
        price: fullRecipe.price,
        servings: fullRecipe.servings,
        description: fullRecipe.description || "",
        instructions: fullRecipe.instructions || "",
        preparation_time: fullRecipe.preparation_time || 0,
        location_id: fullRecipe.location_id || "",
        is_available: fullRecipe.is_available ?? true
      });
      
      // Map ingredients to form format from full recipe
      const mappedIngredients: IngredientForm[] = (fullRecipe.ingredients || []).map(ing => ({
        id: ing.id || `ingredient-${Date.now()}-${Math.random()}`,
        inventory_item_id: ing.inventory_item_id || null,
        ingredient_name: ing.ingredient_name,
        quantity: ing.quantity,
        unit: ing.unit,
        cost: ing.cost
      }));
      setIngredients(mappedIngredients);
    } catch (error) {
      console.error("Error loading recipe details:", error);
      // Fallback to basic data
      setFormData({
        name: recipe.name,
        category: recipe.category,
        subcategory: "",
        price: recipe.price,
        servings: recipe.servings,
        description: "",
        instructions: "",
        preparation_time: 0,
        location_id: "",
        is_available: true
      });
      
      // Map ingredients to form format from basic recipe
      const mappedIngredients: IngredientForm[] = (recipe.ingredients || []).map(ing => ({
        id: ing.id || `ingredient-${Date.now()}-${Math.random()}`,
        inventory_item_id: ing.inventory_item_id || null,
        ingredient_name: ing.ingredient_name,
        quantity: ing.quantity,
        unit: ing.unit,
        cost: ing.cost
      }));
      setIngredients(mappedIngredients);
    }
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      category: "",
      subcategory: "",
      price: 0,
      servings: 1,
      description: "",
      instructions: "",
      preparation_time: 0,
      location_id: "",
      is_available: true
    });
    setIngredients([]);
    setEditingRecipe(null);
  };

  const addIngredient = () => {
    const newIngredient: IngredientForm = {
      id: `ingredient-${Date.now()}-${Math.random()}`,
      inventory_item_id: null,
      ingredient_name: "",
      quantity: 0,
      unit: "kg",
      cost: 0
    };
    setIngredients(prev => [...prev, newIngredient]);
  };

  const removeIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const updateIngredient = (index: number, field: keyof IngredientForm, value: any) => {
    const updated = [...ingredients];
    const ingredient = { ...updated[index] };
    
    if (field === "inventory_item_id") {
      // When selecting from inventory, auto-fill name, unit, and calculate cost
      const selectedItem = inventoryItems.find(item => item.id === value);
      if (selectedItem) {
        ingredient.inventory_item_id = value;
        ingredient.ingredient_name = selectedItem.name;
        ingredient.unit = selectedItem.unit;
        // Calculate cost based on quantity and cost_per_unit
        const quantity = ingredient.quantity || 0;
        ingredient.cost = quantity * selectedItem.cost_per_unit;
      } else {
        ingredient.inventory_item_id = null;
      }
    } else if (field === "quantity") {
      ingredient.quantity = parseFloat(value) || 0;
      // Recalculate cost if inventory item is selected
      if (ingredient.inventory_item_id) {
        const selectedItem = inventoryItems.find(item => item.id === ingredient.inventory_item_id);
        if (selectedItem) {
          ingredient.cost = ingredient.quantity * selectedItem.cost_per_unit;
        }
      }
    } else {
      (ingredient as any)[field] = value;
    }
    
    updated[index] = ingredient;
    setIngredients(updated);
  };

  const calculateTotalCost = () => {
    return ingredients.reduce((sum, ing) => sum + ing.cost, 0);
  };

  const calculateMargin = () => {
    const totalCost = calculateTotalCost();
    if (formData.price > 0 && totalCost > 0) {
      return ((formData.price - totalCost) / formData.price * 100);
    }
    return 0;
  };

  const filteredRecipes = recipes.filter(recipe =>
    recipe.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    recipe.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredRecipes.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedRecipes = filteredRecipes.slice(startIndex, endIndex);

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const avgMargin = recipes.length > 0 
    ? recipes.reduce((sum, recipe) => sum + recipe.margin, 0) / recipes.length 
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
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="bg-[#FF6B35] hover:bg-[#FF6B35]/90 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Nueva Receta
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-[#020617] border-[#FF6B35]/20 max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-white">
                {editingRecipe ? "Editar Receta" : "Crear Nueva Receta"}
              </DialogTitle>
              <DialogDescription className="text-white/60">
                {editingRecipe ? "Modifica los datos de la receta" : "Completa los datos para crear una nueva receta"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-white/80">Nombre del Plato</Label>
                  <Input 
                    className="bg-white/5 border-[#FF6B35]/20 text-white" 
                    placeholder="Ej: Pique Macho"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label className="text-white/80">Categoría</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({...formData, category: value})}
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
                    value={formData.subcategory}
                    onChange={(e) => setFormData({...formData, subcategory: e.target.value})}
                  />
                </div>
                <div>
                  <Label className="text-white/80">Sucursal</Label>
                  <Select
                    value={formData.location_id}
                    onValueChange={(value) => setFormData({...formData, location_id: value})}
                  >
                    <SelectTrigger className="bg-white/5 border-[#FF6B35]/20 text-white">
                      <SelectValue placeholder="Selecciona una sucursal" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#020617] border-[#FF6B35]/20">
                      {businessLocations.map((loc) => (
                        <SelectItem key={loc.id} value={loc.id} className="text-white focus:bg-[#FF6B35]/20">
                          {loc.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.is_available}
                  onCheckedChange={(checked) => setFormData({...formData, is_available: checked})}
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
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value) || 0})}
                    required
                  />
                </div>
                <div>
                  <Label className="text-white/80">Porciones</Label>
                  <Input 
                    type="number" 
                    className="bg-white/5 border-[#FF6B35]/20 text-white" 
                    placeholder="1"
                    value={formData.servings}
                    onChange={(e) => setFormData({...formData, servings: parseInt(e.target.value) || 1})}
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
                    value={formData.preparation_time}
                    onChange={(e) => setFormData({...formData, preparation_time: parseInt(e.target.value) || 0})}
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
                    onClick={(e) => {
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

                {ingredients.length === 0 && (
                  <div className="text-center py-4 text-white/60 text-sm">
                    No hay ingredientes. Agrega al menos uno.
                  </div>
                )}

                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {ingredients.map((ingredient, index) => (
                    <Card key={ingredient.id} className="bg-white/5 border-[#FF6B35]/20 p-4">
                      <div className="flex items-start gap-3">
                        <div className="flex-1 grid grid-cols-12 gap-2">
                          <div className="col-span-12 md:col-span-4">
                            <Label className="text-white/60 text-xs mb-1 block">Ingrediente</Label>
                            <Select
                              value={ingredient.inventory_item_id || "manual"}
                              onValueChange={(value) => {
                                if (value === "manual") {
                                  updateIngredient(index, "inventory_item_id", null);
                                } else {
                                  updateIngredient(index, "inventory_item_id", value);
                                }
                              }}
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
                                    {item.name} ({item.category}) - Bs. {item.cost_per_unit.toFixed(2)}/{item.unit}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          
                          {!ingredient.inventory_item_id && (
                            <div className="col-span-12 md:col-span-4">
                              <Label className="text-white/60 text-xs mb-1 block">Nombre Manual</Label>
                              <Input
                                className="bg-white/5 border-[#FF6B35]/20 text-white h-9"
                                placeholder="Nombre del ingrediente"
                                value={ingredient.ingredient_name}
                                onChange={(e) => updateIngredient(index, "ingredient_name", e.target.value)}
                                required={!ingredient.inventory_item_id}
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
                              value={ingredient.quantity || ""}
                              onChange={(e) => updateIngredient(index, "quantity", e.target.value)}
                              required
                              min="0"
                            />
                          </div>

                          <div className="col-span-6 md:col-span-2">
                            <Label className="text-white/60 text-xs mb-1 block">Unidad</Label>
                            <Select
                              value={ingredient.unit}
                              onValueChange={(value) => updateIngredient(index, "unit", value)}
                              required
                              disabled={!!ingredient.inventory_item_id}
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
                              value={ingredient.cost.toFixed(2)}
                              onChange={(e) => updateIngredient(index, "cost", parseFloat(e.target.value) || 0)}
                              required
                              disabled={!!ingredient.inventory_item_id}
                            />
                            {ingredient.inventory_item_id && (
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
              {ingredients.length > 0 && (
                <Card className="bg-[#FF6B35]/10 border-[#FF6B35]/30 p-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-white/80">Costo Total de Ingredientes:</span>
                      <span className="text-white font-semibold">Bs. {calculateTotalCost().toFixed(2)}</span>
                    </div>
                    {formData.price > 0 && (
                      <>
                        <div className="flex items-center justify-between">
                          <span className="text-white/80">Precio de Venta:</span>
                          <span className="text-[#FF6B35] font-semibold">Bs. {formData.price.toFixed(2)}</span>
                        </div>
                        <div className="flex items-center justify-between pt-2 border-t border-[#FF6B35]/20">
                          <span className="text-white/80">Ganancia:</span>
                          <span className="text-[#FF6B35] font-semibold">
                            Bs. {(formData.price - calculateTotalCost()).toFixed(2)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-white/80">Margen:</span>
                          <span className={`font-semibold ${
                            calculateMargin() >= 70 ? "text-[#FF6B35]" :
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
                  disabled={ingredients.length === 0}
                >
                  {editingRecipe ? "Actualizar Receta" : "Guardar Receta"}
                </Button>
              </div>
            </form>
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
                  <h3 className="text-white mb-2 text-lg font-semibold">{recipe.name}</h3>
                  <span className="px-3 py-1 bg-white/10 rounded-full text-white/70 text-sm font-medium">{recipe.category}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`px-3 py-1 rounded-full ${
                    recipe.margin >= 70 ? "bg-[#FF6B35]/20 text-[#FF6B35]" :
                    recipe.margin >= 50 ? "bg-yellow-500/20 text-yellow-400" :
                    "bg-red-500/20 text-red-400"
                  }`}>
                    {recipe.margin.toFixed(1)}% margen
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

              {recipe.ingredients.length > 0 && (
                <div className="space-y-4 mb-6">
                  <div className="text-white/60">Ingredientes:</div>
                  {recipe.ingredients.map((ingredient, idx) => (
                    <div key={idx} className="flex items-center justify-between text-sm">
                      <span className="text-white/80">
                        {ingredient.ingredient_name} ({ingredient.quantity} {ingredient.unit})
                      </span>
                      <span className="text-white/60">Bs. {ingredient.cost.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="pt-4 border-t border-[#FF6B35]/20 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-white/60">Costo Total:</span>
                  <span className="text-white">Bs. {recipe.cost.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/60">Precio de Venta:</span>
                  <span className="text-[#FF6B35]">Bs. {recipe.price.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/60">Ganancia:</span>
                  <span className="text-[#FF6B35]">Bs. {(recipe.price - recipe.cost).toFixed(2)}</span>
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
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}
