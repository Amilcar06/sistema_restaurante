"""
Recipes API endpoints
"""
from fastapi import APIRouter, Depends, HTTPException
from typing import List
from sqlalchemy.orm import Session
from sqlalchemy import desc
from datetime import datetime
import uuid

from app.schemas.recipe import RecipeCreate, RecipeUpdate, RecipeResponse, RecipeIngredientCreate
from app.core.database import get_db
from app.models.recipe import Recipe, RecipeIngredient

router = APIRouter()

@router.get("/", response_model=List[RecipeResponse])
async def get_recipes(db: Session = Depends(get_db)):
    """
    Get all recipes
    """
    recipes = db.query(Recipe).order_by(desc(Recipe.created_at)).all()
    # Eager load ingredients
    for recipe in recipes:
        _ = recipe.ingredients  # Trigger lazy load
    return recipes

@router.post("/", response_model=RecipeResponse)
async def create_recipe(recipe: RecipeCreate, db: Session = Depends(get_db)):
    """
    Create a new recipe with ingredients
    Calculates cost automatically from inventory items if inventory_item_id is provided
    """
    from app.models.inventory import InventoryItem
    
    # Process ingredients and calculate costs
    processed_ingredients = []
    for ing in recipe.ingredients:
        calculated_cost = ing.cost
        
        # If inventory_item_id is provided, calculate cost from inventory
        if ing.inventory_item_id:
            inventory_item = db.query(InventoryItem).filter(
                InventoryItem.id == ing.inventory_item_id
            ).first()
            
            if inventory_item:
                # Calculate cost: quantity * cost_per_unit
                calculated_cost = ing.quantity * inventory_item.cost_per_unit
                # Use inventory item name if not provided
                ingredient_name = ing.ingredient_name or inventory_item.name
            else:
                raise HTTPException(
                    status_code=404, 
                    detail=f"Inventory item {ing.inventory_item_id} not found"
                )
        else:
            ingredient_name = ing.ingredient_name
        
        processed_ingredients.append({
            "inventory_item_id": ing.inventory_item_id,
            "ingredient_name": ingredient_name,
            "quantity": ing.quantity,
            "unit": ing.unit.value if hasattr(ing.unit, 'value') else str(ing.unit),
            "cost": calculated_cost
        })
    
    # Calculate total cost from processed ingredients
    total_cost = sum(ing["cost"] for ing in processed_ingredients)
    
    # Validation: Price must be greater than cost
    if recipe.price <= total_cost:
        raise HTTPException(
            status_code=400,
            detail=f"El precio de venta (Bs. {recipe.price:.2f}) debe ser mayor que el costo (Bs. {total_cost:.2f}). "
                   f"Margen mínimo recomendado: 30% (Bs. {total_cost * 1.3:.2f})"
        )
    
    margin = ((recipe.price - total_cost) / recipe.price * 100) if recipe.price > 0 else 0
    
    # Warning for low margin (but allow it)
    if margin < 30:
        # Log warning but don't block creation
        pass
    
    db_recipe = Recipe(
        id=str(uuid.uuid4()),
        name=recipe.name,
        description=recipe.description,
        category=recipe.category.value if hasattr(recipe.category, 'value') else str(recipe.category),
        price=recipe.price,
        cost=total_cost,
        margin=margin,
        preparation_time=recipe.preparation_time,
        servings=recipe.servings,
        instructions=recipe.instructions,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    db.add(db_recipe)
    db.flush()  # Get the ID
    
    # Create ingredients
    for ing in processed_ingredients:
        db_ingredient = RecipeIngredient(
            id=str(uuid.uuid4()),
            recipe_id=db_recipe.id,
            inventory_item_id=ing["inventory_item_id"],
            ingredient_name=ing["ingredient_name"],
            quantity=ing["quantity"],
            unit=ing["unit"].value if hasattr(ing["unit"], 'value') else str(ing["unit"]),
            cost=ing["cost"]
        )
        db.add(db_ingredient)
    
    db.commit()
    db.refresh(db_recipe)
    return db_recipe

@router.get("/{recipe_id}", response_model=RecipeResponse)
async def get_recipe(recipe_id: str, db: Session = Depends(get_db)):
    """
    Get a specific recipe
    """
    recipe = db.query(Recipe).filter(Recipe.id == recipe_id).first()
    if not recipe:
        raise HTTPException(status_code=404, detail="Recipe not found")
    # Trigger lazy load of ingredients
    _ = recipe.ingredients
    return recipe

@router.put("/{recipe_id}", response_model=RecipeResponse)
async def update_recipe(
    recipe_id: str, 
    recipe: RecipeUpdate, 
    db: Session = Depends(get_db)
):
    """
    Update a recipe
    Recalculates cost automatically from inventory items if inventory_item_id is provided
    """
    from app.models.inventory import InventoryItem
    
    db_recipe = db.query(Recipe).filter(Recipe.id == recipe_id).first()
    if not db_recipe:
        raise HTTPException(status_code=404, detail="Recipe not found")
    
    # Update recipe fields
    update_data = recipe.model_dump(exclude_unset=True, exclude={"ingredients"})
    
    # If ingredients are provided, update them
    if recipe.ingredients is not None:
        # Delete existing ingredients
        db.query(RecipeIngredient).filter(RecipeIngredient.recipe_id == recipe_id).delete()
        
        # Process ingredients and calculate costs
        processed_ingredients = []
        for ing in recipe.ingredients:
            calculated_cost = ing.cost
            
            # If inventory_item_id is provided, calculate cost from inventory
            if ing.inventory_item_id:
                inventory_item = db.query(InventoryItem).filter(
                    InventoryItem.id == ing.inventory_item_id
                ).first()
                
                if inventory_item:
                    calculated_cost = ing.quantity * inventory_item.cost_per_unit
                    ingredient_name = ing.ingredient_name or inventory_item.name
                else:
                    raise HTTPException(
                        status_code=404,
                        detail=f"Inventory item {ing.inventory_item_id} not found"
                    )
            else:
                ingredient_name = ing.ingredient_name
            
            processed_ingredients.append({
                "inventory_item_id": ing.inventory_item_id,
                "ingredient_name": ingredient_name,
                "quantity": ing.quantity,
                "unit": ing.unit.value if hasattr(ing.unit, 'value') else str(ing.unit),
                "cost": calculated_cost
            })
            
            # Add new ingredients
            db_ingredient = RecipeIngredient(
                id=str(uuid.uuid4()),
                recipe_id=recipe_id,
                inventory_item_id=processed_ingredients[-1]["inventory_item_id"],
                ingredient_name=processed_ingredients[-1]["ingredient_name"],
                quantity=processed_ingredients[-1]["quantity"],
                unit=processed_ingredients[-1]["unit"],
                cost=processed_ingredients[-1]["cost"]
            )
            db.add(db_ingredient)
        
        # Recalculate cost
        total_cost = sum(ing["cost"] for ing in processed_ingredients)
        update_data["cost"] = total_cost
        recipe_price = update_data.get("price", db_recipe.price)
        
        # Validation: Price must be greater than cost
        if recipe_price <= total_cost:
            raise HTTPException(
                status_code=400,
                detail=f"El precio de venta (Bs. {recipe_price:.2f}) debe ser mayor que el costo (Bs. {total_cost:.2f}). "
                       f"Margen mínimo recomendado: 30% (Bs. {total_cost * 1.3:.2f})"
            )
        
        if recipe_price > 0:
            update_data["margin"] = ((recipe_price - total_cost) / recipe_price * 100)
            
            # Warning for low margin
            if update_data["margin"] < 30:
                pass  # Log warning but allow
    
    # Update recipe fields
    for field, value in update_data.items():
        setattr(db_recipe, field, value)
    
    db_recipe.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(db_recipe)
    return db_recipe

@router.delete("/{recipe_id}")
async def delete_recipe(recipe_id: str, db: Session = Depends(get_db)):
    """
    Delete a recipe (cascade will delete ingredients)
    """
    db_recipe = db.query(Recipe).filter(Recipe.id == recipe_id).first()
    if not db_recipe:
        raise HTTPException(status_code=404, detail="Recipe not found")
    
    db.delete(db_recipe)
    db.commit()
    return {"message": "Recipe deleted successfully"}
