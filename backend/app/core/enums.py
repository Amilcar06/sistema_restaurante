"""
Enums and constants for GastroSmart AI
"""
from enum import Enum
from typing import List

class InventoryCategory(str, Enum):
    """Categorías de inventario"""
    CARNES = "Carnes"
    VERDURAS = "Verduras"
    GRANOS = "Granos"
    LACTEOS = "Lácteos"
    BEBIDAS = "Bebidas"
    CONDIMENTOS = "Condimentos"
    OTROS = "Otros"

class InventoryUnit(str, Enum):
    """Unidades de medida para inventario"""
    KG = "kg"
    G = "g"
    L = "L"
    ML = "mL"
    UNID = "unid"
    PZA = "pza"
    OZ = "oz"
    LB = "lb"

class RecipeCategory(str, Enum):
    """Categorías de recetas"""
    PLATO_PRINCIPAL = "Plato Principal"
    ENTRADA = "Entrada"
    POSTRE = "Postre"
    BEBIDA = "Bebida"
    ACOMPANAMIENTO = "Acompañamiento"

class RecipeIngredientUnit(str, Enum):
    """Unidades de medida para ingredientes de recetas"""
    KG = "kg"
    G = "g"
    L = "L"
    ML = "mL"
    UNID = "unid"
    PZA = "pza"
    OZ = "oz"
    LB = "lb"
    CUCHARADA = "cucharada"
    CUCHARADITA = "cucharadita"

class PaymentMethod(str, Enum):
    """Métodos de pago"""
    EFECTIVO = "EFECTIVO"
    QR = "QR"
    TARJETA = "TARJETA"

# Listas para uso en frontend
INVENTORY_CATEGORIES: List[str] = [cat.value for cat in InventoryCategory]
INVENTORY_UNITS: List[str] = [unit.value for unit in InventoryUnit]
RECIPE_CATEGORIES: List[str] = [cat.value for cat in RecipeCategory]
RECIPE_INGREDIENT_UNITS: List[str] = [unit.value for unit in RecipeIngredientUnit]
PAYMENT_METHODS: List[str] = [method.value for method in PaymentMethod]

