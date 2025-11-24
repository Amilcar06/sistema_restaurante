"""
Inventory Service - Business logic for inventory management
"""
from sqlalchemy.orm import Session
from typing import List, Dict, Optional
from datetime import datetime
from app.models.inventory import InventoryItem
from app.models.recipe import Recipe, RecipeIngredient


class InventoryService:
    """Service for inventory operations and validations"""
    
    @staticmethod
    def check_stock_availability(
        recipe_id: str,
        quantity: int,
        db: Session
    ) -> Dict[str, any]:
        """
        Check if there's enough stock for a recipe
        
        Returns:
            {
                "available": bool,
                "missing_items": List[Dict],
                "sufficient": bool
            }
        """
        recipe = db.query(Recipe).filter(Recipe.id == recipe_id).first()
        if not recipe:
            return {
                "available": False,
                "missing_items": [{"item": "Recipe not found", "required": 0, "available": 0}],
                "sufficient": False
            }
        
        missing_items = []
        sufficient = True
        
        for ingredient in recipe.ingredients:
            if ingredient.inventory_item_id:
                inventory_item = db.query(InventoryItem).filter(
                    InventoryItem.id == ingredient.inventory_item_id
                ).first()
                
                if inventory_item:
                    # Calculate required quantity for the sale
                    # If recipe serves 4 and we're selling 2, we need half the ingredients
                    required_quantity = (ingredient.quantity * quantity) / recipe.servings
                    available_quantity = inventory_item.quantity
                    
                    if available_quantity < required_quantity:
                        sufficient = False
                        missing_items.append({
                            "item": inventory_item.name,
                            "required": round(required_quantity, 2),
                            "available": round(available_quantity, 2),
                            "unit": inventory_item.unit,
                            "shortage": round(required_quantity - available_quantity, 2)
                        })
        
        return {
            "available": sufficient,
            "missing_items": missing_items,
            "sufficient": sufficient
        }
    
    @staticmethod
    def update_inventory_from_sale(
        recipe_id: str,
        quantity: int,
        db: Session,
        operation: str = "subtract"  # "subtract" or "add" (for rollback)
    ) -> Dict[str, any]:
        """
        Update inventory quantities based on a sale
        
        Args:
            recipe_id: ID of the recipe being sold
            quantity: Number of servings being sold
            db: Database session
            operation: "subtract" to reduce stock, "add" to restore stock
        
        Returns:
            {
                "success": bool,
                "updated_items": List[Dict],
                "errors": List[str]
            }
        """
        recipe = db.query(Recipe).filter(Recipe.id == recipe_id).first()
        if not recipe:
            return {
                "success": False,
                "updated_items": [],
                "errors": ["Recipe not found"]
            }
        
        updated_items = []
        errors = []
        multiplier = -1 if operation == "subtract" else 1
        
        for ingredient in recipe.ingredients:
            if ingredient.inventory_item_id:
                inventory_item = db.query(InventoryItem).filter(
                    InventoryItem.id == ingredient.inventory_item_id
                ).first()
                
                if inventory_item:
                    # Calculate quantity to update
                    quantity_to_update = (ingredient.quantity * quantity / recipe.servings) * multiplier
                    new_quantity = inventory_item.quantity + quantity_to_update
                    
                    # Validate that we don't go negative
                    if new_quantity < 0 and operation == "subtract":
                        errors.append(
                            f"Insufficient stock for {inventory_item.name}. "
                            f"Available: {inventory_item.quantity}{inventory_item.unit}, "
                            f"Required: {abs(quantity_to_update)}{inventory_item.unit}"
                        )
                        continue
                    
                    inventory_item.quantity = max(0, new_quantity)  # Ensure non-negative
                    inventory_item.last_updated = datetime.utcnow()
                    
                    updated_items.append({
                        "item": inventory_item.name,
                        "previous_quantity": inventory_item.quantity - quantity_to_update,
                        "new_quantity": inventory_item.quantity,
                        "change": quantity_to_update,
                        "unit": inventory_item.unit
                    })
        
        if errors:
            return {
                "success": False,
                "updated_items": updated_items,
                "errors": errors
            }
        
        db.commit()
        return {
            "success": True,
            "updated_items": updated_items,
            "errors": []
        }
    
    @staticmethod
    def get_critical_stock_items(db: Session) -> List[InventoryItem]:
        """
        Get all inventory items with critical stock (quantity <= min_stock)
        """
        return db.query(InventoryItem).filter(
            InventoryItem.quantity <= InventoryItem.min_stock
        ).all()
    
    @staticmethod
    def get_low_stock_items(db: Session, threshold_multiplier: float = 1.2) -> List[InventoryItem]:
        """
        Get items with low stock (quantity <= min_stock * threshold_multiplier)
        Default threshold is 20% above minimum
        """
        return db.query(InventoryItem).filter(
            InventoryItem.quantity <= (InventoryItem.min_stock * threshold_multiplier)
        ).all()

