# 🗄️ Diseño de Base de Datos Mejorada - GastroSmart AI

## 📋 Tabla de Contenidos

1. [Resumen de Mejoras](#resumen-de-mejoras)
2. [Modelos Nuevos](#modelos-nuevos)
3. [Modelos Modificados](#modelos-modificados)
4. [Relaciones y Diagrama ER](#relaciones-y-diagrama-er)
5. [Migraciones Recomendadas](#migraciones-recomendadas)
6. [Índices y Optimizaciones](#índices-y-optimizaciones)

---

## Resumen de Mejoras

### 🔥 Cambios Críticos Implementados

1. ✅ **Historial de Precios** - `inventory_cost_history`
2. ✅ **Movimientos de Inventario** - `inventory_movements`
3. ✅ **Preparaciones Intermedias** - `recipe_components`
4. ✅ **Sistema de Unidades con Conversión** - `units`, `unit_conversions`
5. ✅ **Multi-sucursal** - `business_locations`
6. ✅ **Versionado de Recetas** - `recipe_versions`
7. ✅ **Logs del Chatbot** - `chatbot_logs`
8. ✅ **Proveedores** - `suppliers`
9. ✅ **Roles y Permisos** - `roles`, `permissions`, `user_roles`
10. ✅ **Mesas y Meseros** - Campos en `sales`
11. ✅ **Descuentos y Promociones** - `promotions`, `sale_discounts`
12. ✅ **Caducidad de Productos** - Campos en `inventory_items`
13. ✅ **Órdenes de Compra** - `purchase_orders`, `purchase_order_items`

---

## Modelos Nuevos

### 1. Units (Unidades de Medida)

**Propósito**: Sistema centralizado de unidades con conversiones reales.

```python
class Unit(Base):
    __tablename__ = "units"
    
    id = Column(String, primary_key=True)
    code = Column(String, unique=True, nullable=False)  # kg, g, lb, atado, cuchara
    name = Column(String, nullable=False)  # Kilogramo, Gramo, Libra, Atado, Cuchara
    type = Column(String, nullable=False)  # weight, volume, piece, custom
    base_unit_id = Column(String, ForeignKey("units.id"))  # Unidad base para conversión
    factor_to_base = Column(Float, nullable=False, default=1.0)  # Factor de conversión
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relaciones
    base_unit = relationship("Unit", remote_side=[id], backref="derived_units")
    inventory_items = relationship("InventoryItem", back_populates="unit_ref")
    recipe_ingredients = relationship("RecipeIngredient", back_populates="unit_ref")
```

**Ejemplos de Datos**:
```python
# Unidades base
{"code": "g", "name": "Gramo", "type": "weight", "factor_to_base": 1.0}
{"code": "kg", "name": "Kilogramo", "type": "weight", "base_unit_id": "g", "factor_to_base": 1000.0}
{"code": "lb", "name": "Libra", "type": "weight", "base_unit_id": "g", "factor_to_base": 453.592}
{"code": "atado", "name": "Atado", "type": "custom", "factor_to_base": 1.0}  # Sin conversión directa
{"code": "cuchara", "name": "Cuchara", "type": "volume", "factor_to_base": 15.0}  # 15ml
```

---

### 2. Suppliers (Proveedores)

**Propósito**: Gestión de proveedores con información de contacto y evaluación.

```python
class Supplier(Base):
    __tablename__ = "suppliers"
    
    id = Column(String, primary_key=True)
    name = Column(String, nullable=False, index=True)
    contact_name = Column(String)
    phone = Column(String)
    email = Column(String)
    address = Column(Text)
    city = Column(String)  # La Paz, El Alto, etc.
    zone = Column(String)  # Rodríguez, Tacagua, Achumani, etc.
    tax_id = Column(String)  # NIT para facturación
    payment_terms = Column(String)  # "30 días", "contado", etc.
    rating = Column(Float)  # 1-5 estrellas
    is_active = Column(Boolean, default=True)
    notes = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    user_id = Column(String, ForeignKey("users.id"))
    
    # Relaciones
    inventory_items = relationship("InventoryItem", back_populates="supplier_ref")
    purchase_orders = relationship("PurchaseOrder", back_populates="supplier")
    cost_history = relationship("InventoryCostHistory", back_populates="supplier")
```

---

### 3. BusinessLocations (Sucursales)

**Propósito**: Soporte multi-sucursal para restaurantes con múltiples ubicaciones.

```python
class BusinessLocation(Base):
    __tablename__ = "business_locations"
    
    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)  # "Sucursal Centro", "Sopocachi", etc.
    address = Column(Text, nullable=False)
    city = Column(String, default="La Paz")
    zone = Column(String)  # Zona específica
    phone = Column(String)
    email = Column(String)
    is_main = Column(Boolean, default=False)  # Sucursal principal
    is_active = Column(Boolean, default=True)
    open_hours = Column(JSON)  # {"monday": {"open": "08:00", "close": "22:00"}, ...}
    created_at = Column(DateTime, default=datetime.utcnow)
    user_id = Column(String, ForeignKey("users.id"))
    
    # Relaciones
    inventory_items = relationship("InventoryItem", back_populates="location")
    recipes = relationship("Recipe", back_populates="location")
    sales = relationship("Sale", back_populates="location")
    inventory_movements = relationship("InventoryMovement", back_populates="location")
```

---

### 4. InventoryCostHistory (Historial de Precios)

**Propósito**: Registrar cambios de precios para análisis histórico y auditoría.

```python
class InventoryCostHistory(Base):
    __tablename__ = "inventory_cost_history"
    
    id = Column(String, primary_key=True)
    inventory_item_id = Column(String, ForeignKey("inventory_items.id"), nullable=False)
    cost_per_unit = Column(Float, nullable=False)
    supplier_id = Column(String, ForeignKey("suppliers.id"))
    date = Column(DateTime, nullable=False, default=datetime.utcnow, index=True)
    reason = Column(String)  # "compra", "ajuste", "inflación", "estacional"
    notes = Column(Text)
    user_id = Column(String, ForeignKey("users.id"))
    
    # Relaciones
    inventory_item = relationship("InventoryItem", back_populates="cost_history")
    supplier = relationship("Supplier", back_populates="cost_history")
```

**Uso**:
- Análisis de tendencias de precios
- Cálculo de márgenes históricos
- Predicciones de IA basadas en estacionalidad
- Auditoría para SUNAT

---

### 5. InventoryMovements (Movimientos de Inventario)

**Propósito**: Auditoría completa de todos los movimientos de inventario.

```python
class InventoryMovement(Base):
    __tablename__ = "inventory_movements"
    
    id = Column(String, primary_key=True)
    inventory_item_id = Column(String, ForeignKey("inventory_items.id"), nullable=False)
    location_id = Column(String, ForeignKey("business_locations.id"), nullable=False)
    movement_type = Column(String, nullable=False)  # ENTRADA, SALIDA, AJUSTE, MERMA, CADUCIDAD, ROBO
    quantity = Column(Float, nullable=False)
    unit = Column(String, nullable=False)
    cost_per_unit = Column(Float)  # Costo al momento del movimiento
    reference_id = Column(String)  # ID de venta, compra, etc.
    reference_type = Column(String)  # "sale", "purchase", "adjustment", etc.
    notes = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    user_id = Column(String, ForeignKey("users.id"))
    
    # Relaciones
    inventory_item = relationship("InventoryItem", back_populates="movements")
    location = relationship("BusinessLocation", back_populates="inventory_movements")
```

**Tipos de Movimiento**:
- `ENTRADA`: Compra de proveedor
- `SALIDA`: Venta o uso en receta
- `AJUSTE`: Corrección manual
- `MERMA`: Pérdida por manipulación
- `CADUCIDAD`: Producto vencido
- `ROBO`: Pérdida por robo
- `TRANSFERENCIA`: Entre sucursales

---

### 6. RecipeVersions (Versiones de Recetas)

**Propósito**: Mantener historial de cambios en recetas para auditoría y análisis.

```python
class RecipeVersion(Base):
    __tablename__ = "recipe_versions"
    
    id = Column(String, primary_key=True)
    recipe_id = Column(String, ForeignKey("recipes.id"), nullable=False)
    version_number = Column(Integer, nullable=False)
    name = Column(String, nullable=False)
    description = Column(Text)
    category = Column(String, nullable=False)
    price = Column(Float, nullable=False)
    cost = Column(Float, nullable=False)
    margin = Column(Float, nullable=False)
    preparation_time = Column(Integer)
    servings = Column(Integer, nullable=False)
    instructions = Column(Text)
    is_active = Column(Boolean, default=False)  # Solo una versión activa por receta
    change_reason = Column(String)  # "precio", "ingredientes", "presentación"
    created_at = Column(DateTime, default=datetime.utcnow)
    user_id = Column(String, ForeignKey("users.id"))
    
    # Relaciones
    recipe = relationship("Recipe", back_populates="versions")
    ingredients = relationship("RecipeIngredientVersion", back_populates="recipe_version")
```

---

### 7. RecipeComponents (Preparaciones Intermedias)

**Propósito**: Permitir que recetas usen otras recetas como ingredientes.

```python
class RecipeComponent(Base):
    __tablename__ = "recipe_components"
    
    id = Column(String, primary_key=True)
    recipe_id = Column(String, ForeignKey("recipes.id"), nullable=False)  # Receta principal
    subrecipe_id = Column(String, ForeignKey("recipes.id"), nullable=False)  # Receta usada como ingrediente
    quantity = Column(Float, nullable=False)  # Cantidad de la sub-receta
    unit = Column(String, nullable=False)
    notes = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relaciones
    recipe = relationship("Recipe", foreign_keys=[recipe_id], back_populates="components")
    subrecipe = relationship("Recipe", foreign_keys=[subrecipe_id], back_populates="used_in_recipes")
```

**Ejemplo de Uso**:
- Receta "Anticucho" usa "Salsa para Anticucho" (sub-receta)
- Receta "Pique Macho" usa "Adobo" (sub-receta)
- Permite calcular costos en cascada

---

### 8. ChatbotLogs (Logs del Chatbot)

**Propósito**: Registrar todas las interacciones con el chatbot para análisis y mejora.

```python
class ChatbotLog(Base):
    __tablename__ = "chatbot_logs"
    
    id = Column(String, primary_key=True)
    user_id = Column(String, ForeignKey("users.id"))
    session_id = Column(String, index=True)  # Para agrupar conversaciones
    message = Column(Text, nullable=False)
    response = Column(Text, nullable=False)
    intent = Column(String)  # Clasificación de intención
    confidence = Column(Float)  # Confianza de la respuesta
    metadata = Column(JSON)  # Datos adicionales: contexto, sugerencias, etc.
    response_time_ms = Column(Integer)  # Tiempo de respuesta en ms
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    
    # Relaciones
    user = relationship("User", back_populates="chatbot_logs")
```

**Uso**:
- Análisis de preguntas frecuentes
- Mejora del modelo de IA
- Identificación de intenciones no cubiertas
- Métricas de satisfacción

---

### 9. Roles y Permisos

**Propósito**: Sistema de control de acceso granular.

```python
class Role(Base):
    __tablename__ = "roles"
    
    id = Column(String, primary_key=True)
    name = Column(String, unique=True, nullable=False)  # admin, manager, cashier, cook, waiter
    description = Column(Text)
    is_system = Column(Boolean, default=False)  # Roles del sistema no se pueden eliminar
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relaciones
    users = relationship("UserRole", back_populates="role")
    permissions = relationship("RolePermission", back_populates="role")

class Permission(Base):
    __tablename__ = "permissions"
    
    id = Column(String, primary_key=True)
    name = Column(String, unique=True, nullable=False)  # inventory.create, sales.delete, etc.
    resource = Column(String, nullable=False)  # inventory, sales, recipes, etc.
    action = Column(String, nullable=False)  # create, read, update, delete, export
    description = Column(Text)
    
    # Relaciones
    roles = relationship("RolePermission", back_populates="permission")

class RolePermission(Base):
    __tablename__ = "role_permissions"
    
    id = Column(String, primary_key=True)
    role_id = Column(String, ForeignKey("roles.id"), nullable=False)
    permission_id = Column(String, ForeignKey("permissions.id"), nullable=False)
    
    # Relaciones
    role = relationship("Role", back_populates="permissions")
    permission = relationship("Permission", back_populates="roles")
    
    __table_args__ = (UniqueConstraint('role_id', 'permission_id'),)

class UserRole(Base):
    __tablename__ = "user_roles"
    
    id = Column(String, primary_key=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    role_id = Column(String, ForeignKey("roles.id"), nullable=False)
    location_id = Column(String, ForeignKey("business_locations.id"))  # Rol específico por sucursal
    assigned_at = Column(DateTime, default=datetime.utcnow)
    assigned_by = Column(String, ForeignKey("users.id"))
    
    # Relaciones
    user = relationship("User", foreign_keys=[user_id], back_populates="roles")
    role = relationship("Role", back_populates="users")
    location = relationship("BusinessLocation")
    assigner = relationship("User", foreign_keys=[assigned_by])
    
    __table_args__ = (UniqueConstraint('user_id', 'role_id', 'location_id'),)
```

**Roles Predefinidos**:
- `admin`: Acceso total
- `manager`: Gestión de inventario, recetas, reportes
- `cashier`: Crear ventas, ver inventario
- `cook`: Ver recetas, reportar mermas
- `waiter`: Crear ventas, ver menú

---

### 10. Promotions (Promociones y Descuentos)

**Propósito**: Sistema de descuentos y promociones.

```python
class Promotion(Base):
    __tablename__ = "promotions"
    
    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    description = Column(Text)
    discount_type = Column(String, nullable=False)  # percentage, fixed_amount, buy_x_get_y
    discount_value = Column(Float, nullable=False)  # Porcentaje o monto fijo
    min_purchase = Column(Float)  # Compra mínima requerida
    max_discount = Column(Float)  # Descuento máximo
    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime, nullable=False)
    is_active = Column(Boolean, default=True)
    applicable_to = Column(String)  # all, recipes, categories, specific_items
    applicable_ids = Column(JSON)  # IDs de recetas/categorías específicas
    location_id = Column(String, ForeignKey("business_locations.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    user_id = Column(String, ForeignKey("users.id"))
    
    # Relaciones
    location = relationship("BusinessLocation")
    sale_discounts = relationship("SaleDiscount", back_populates="promotion")

class SaleDiscount(Base):
    __tablename__ = "sale_discounts"
    
    id = Column(String, primary_key=True)
    sale_id = Column(String, ForeignKey("sales.id"), nullable=False)
    promotion_id = Column(String, ForeignKey("promotions.id"))
    discount_type = Column(String, nullable=False)  # promotion, manual, loyalty
    discount_amount = Column(Float, nullable=False)
    reason = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    user_id = Column(String, ForeignKey("users.id"))
    
    # Relaciones
    sale = relationship("Sale", back_populates="discounts")
    promotion = relationship("Promotion", back_populates="sale_discounts")
```

---

### 11. PurchaseOrders (Órdenes de Compra)

**Propósito**: Gestión de compras a proveedores.

```python
class PurchaseOrder(Base):
    __tablename__ = "purchase_orders"
    
    id = Column(String, primary_key=True)
    order_number = Column(String, unique=True, nullable=False, index=True)
    supplier_id = Column(String, ForeignKey("suppliers.id"), nullable=False)
    location_id = Column(String, ForeignKey("business_locations.id"), nullable=False)
    status = Column(String, nullable=False, default="PENDING")  # PENDING, APPROVED, RECEIVED, CANCELLED
    total_amount = Column(Float, nullable=False)
    expected_delivery_date = Column(DateTime)
    received_date = Column(DateTime)
    notes = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    created_by = Column(String, ForeignKey("users.id"))
    approved_by = Column(String, ForeignKey("users.id"))
    
    # Relaciones
    supplier = relationship("Supplier", back_populates="purchase_orders")
    location = relationship("BusinessLocation")
    items = relationship("PurchaseOrderItem", back_populates="purchase_order", cascade="all, delete-orphan")
    creator = relationship("User", foreign_keys=[created_by])
    approver = relationship("User", foreign_keys=[approved_by])

class PurchaseOrderItem(Base):
    __tablename__ = "purchase_order_items"
    
    id = Column(String, primary_key=True)
    purchase_order_id = Column(String, ForeignKey("purchase_orders.id"), nullable=False)
    inventory_item_id = Column(String, ForeignKey("inventory_items.id"))
    item_name = Column(String, nullable=False)  # Por si no existe en inventario aún
    quantity = Column(Float, nullable=False)
    unit = Column(String, nullable=False)
    unit_price = Column(Float, nullable=False)
    total = Column(Float, nullable=False)
    received_quantity = Column(Float, default=0.0)
    
    # Relaciones
    purchase_order = relationship("PurchaseOrder", back_populates="items")
    inventory_item = relationship("InventoryItem")
```

---

## Modelos Modificados

### 1. User (Mejorado)

```python
class User(Base):
    __tablename__ = "users"
    
    id = Column(String, primary_key=True)
    email = Column(String, unique=True, nullable=False, index=True)
    username = Column(String, unique=True, nullable=False, index=True)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String)
    phone = Column(String)  # NUEVO
    is_active = Column(Boolean, default=True)
    is_superuser = Column(Boolean, default=False)
    default_location_id = Column(String, ForeignKey("business_locations.id"))  # NUEVO
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_login = Column(DateTime)  # NUEVO
    
    # Relaciones
    default_location = relationship("BusinessLocation")
    roles = relationship("UserRole", back_populates="user")
    chatbot_logs = relationship("ChatbotLog", back_populates="user")
```

---

### 2. InventoryItem (Mejorado)

```python
class InventoryItem(Base):
    __tablename__ = "inventory_items"
    
    id = Column(String, primary_key=True)
    name = Column(String, nullable=False, index=True)
    category = Column(String, nullable=False, index=True)
    quantity = Column(Float, nullable=False, default=0.0)
    unit = Column(String, nullable=False)
    unit_id = Column(String, ForeignKey("units.id"))  # NUEVO: Referencia a tabla units
    min_stock = Column(Float, nullable=False)
    max_stock = Column(Float)  # NUEVO: Stock máximo recomendado
    cost_per_unit = Column(Float, nullable=False)
    supplier_id = Column(String, ForeignKey("suppliers.id"))  # NUEVO: FK a suppliers
    supplier = Column(String)  # Mantener para compatibilidad
    location_id = Column(String, ForeignKey("business_locations.id"), nullable=False)  # NUEVO
    expiry_date = Column(DateTime)  # NUEVO: Fecha de caducidad
    barcode = Column(String, unique=True, index=True)  # NUEVO: Código de barras
    last_updated = Column(DateTime, default=datetime.utcnow, index=True)
    user_id = Column(String, ForeignKey("users.id"))
    
    # Campos para IA
    popularity_score = Column(Float, default=0.0)  # NUEVO: Basado en uso
    seasonal_factor = Column(JSON)  # NUEVO: {"enero": 1.2, "septiembre": 0.8}
    demand_forecast = Column(Float)  # NUEVO: Predicción de demanda
    
    # Relaciones
    unit_ref = relationship("Unit", back_populates="inventory_items")
    supplier_ref = relationship("Supplier", back_populates="inventory_items")
    location = relationship("BusinessLocation", back_populates="inventory_items")
    recipe_ingredients = relationship("RecipeIngredient", back_populates="inventory_item")
    cost_history = relationship("InventoryCostHistory", back_populates="inventory_item")
    movements = relationship("InventoryMovement", back_populates="inventory_item")
    purchase_order_items = relationship("PurchaseOrderItem", back_populates="inventory_item")
```

---

### 3. Recipe (Mejorado)

```python
class Recipe(Base):
    __tablename__ = "recipes"
    
    id = Column(String, primary_key=True)
    name = Column(String, nullable=False, index=True)
    description = Column(Text)
    category = Column(String, nullable=False, index=True)
    subcategory = Column(String)  # NUEVO: Subcategoría (ej: "Carnes Rojas", "Carnes Blancas")
    price = Column(Float, nullable=False)
    cost = Column(Float, nullable=False)
    margin = Column(Float, nullable=False)
    preparation_time = Column(Integer)
    servings = Column(Integer, nullable=False, default=1)
    instructions = Column(Text)
    location_id = Column(String, ForeignKey("business_locations.id"))  # NUEVO
    is_available = Column(Boolean, default=True)  # NUEVO: Disponible para venta
    popularity_score = Column(Float, default=0.0)  # NUEVO: Basado en ventas
    current_version = Column(Integer, default=1)  # NUEVO: Versión actual
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    user_id = Column(String, ForeignKey("users.id"))
    
    # Relaciones
    location = relationship("BusinessLocation", back_populates="recipes")
    ingredients = relationship("RecipeIngredient", back_populates="recipe", cascade="all, delete-orphan")
    components = relationship("RecipeComponent", foreign_keys="RecipeComponent.recipe_id", back_populates="recipe")
    used_in_recipes = relationship("RecipeComponent", foreign_keys="RecipeComponent.subrecipe_id", back_populates="subrecipe")
    versions = relationship("RecipeVersion", back_populates="recipe")
    sale_items = relationship("SaleItem", back_populates="recipe")
```

---

### 4. Sale (Mejorado)

```python
class Sale(Base):
    __tablename__ = "sales"
    
    id = Column(String, primary_key=True)
    sale_number = Column(String, unique=True, index=True)  # NUEVO: Número de venta legible
    location_id = Column(String, ForeignKey("business_locations.id"), nullable=False)  # NUEVO
    table_number = Column(String)  # NUEVO: Número de mesa
    waiter_id = Column(String, ForeignKey("users.id"))  # NUEVO: Mesero
    sale_type = Column(String, nullable=False, default="LOCAL")  # NUEVO: LOCAL, DELIVERY, TAKEAWAY
    delivery_service = Column(String)  # NUEVO: PedidosYa, Ahora, etc.
    customer_name = Column(String)  # NUEVO: Nombre del cliente
    customer_phone = Column(String)  # NUEVO: Teléfono del cliente
    subtotal = Column(Float, nullable=False)
    discount_amount = Column(Float, default=0.0)  # NUEVO: Descuento total
    tax = Column(Float, nullable=False, default=0.0)
    total = Column(Float, nullable=False)
    payment_method = Column(String, nullable=False)
    notes = Column(Text)
    status = Column(String, default="COMPLETED")  # NUEVO: COMPLETED, CANCELLED, REFUNDED
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    user_id = Column(String, ForeignKey("users.id"))
    
    # Relaciones
    location = relationship("BusinessLocation", back_populates="sales")
    waiter = relationship("User", foreign_keys=[waiter_id])
    items = relationship("SaleItem", back_populates="sale", cascade="all, delete-orphan")
    discounts = relationship("SaleDiscount", back_populates="sale")
```

---

## Relaciones y Diagrama ER

### Diagrama de Relaciones Principales

```
Users
  ├── UserRoles ──> Roles ──> RolePermissions ──> Permissions
  ├── ChatbotLogs
  └── Sales (como waiter_id y user_id)

BusinessLocations
  ├── InventoryItems
  ├── Recipes
  ├── Sales
  └── InventoryMovements

InventoryItems
  ├── Unit (unit_id)
  ├── Supplier (supplier_id)
  ├── BusinessLocation (location_id)
  ├── InventoryCostHistory
  ├── InventoryMovements
  └── RecipeIngredients

Recipes
  ├── BusinessLocation (location_id)
  ├── RecipeVersions
  ├── RecipeComponents (como recipe_id)
  ├── RecipeComponents (como subrecipe_id)
  └── RecipeIngredients

Sales
  ├── BusinessLocation (location_id)
  ├── User (waiter_id)
  ├── SaleItems
  └── SaleDiscounts ──> Promotions

Suppliers
  ├── InventoryItems
  ├── PurchaseOrders
  └── InventoryCostHistory

PurchaseOrders
  ├── Supplier
  ├── BusinessLocation
  └── PurchaseOrderItems ──> InventoryItems
```

---

## Índices y Optimizaciones

### Índices Recomendados

```sql
-- Performance críticos
CREATE INDEX idx_inventory_items_location ON inventory_items(location_id);
CREATE INDEX idx_inventory_items_category ON inventory_items(category);
CREATE INDEX idx_sales_location_date ON sales(location_id, created_at);
CREATE INDEX idx_sales_created_at ON sales(created_at DESC);
CREATE INDEX idx_inventory_movements_item_date ON inventory_movements(inventory_item_id, created_at DESC);
CREATE INDEX idx_cost_history_item_date ON inventory_cost_history(inventory_item_id, date DESC);
CREATE INDEX idx_chatbot_logs_session ON chatbot_logs(session_id, created_at);
CREATE INDEX idx_recipe_versions_recipe ON recipe_versions(recipe_id, version_number DESC);

-- Búsquedas frecuentes
CREATE INDEX idx_inventory_items_name ON inventory_items USING gin(to_tsvector('spanish', name));
CREATE INDEX idx_recipes_name ON recipes USING gin(to_tsvector('spanish', name));
CREATE INDEX idx_suppliers_name ON suppliers(name);

-- Unicidad
CREATE UNIQUE INDEX idx_sale_number ON sales(sale_number);
CREATE UNIQUE INDEX idx_purchase_order_number ON purchase_orders(order_number);
```

### Vistas Materializadas (Para IA y Reportes)

```sql
-- Vista: Top productos más vendidos (últimos 30 días)
CREATE MATERIALIZED VIEW mv_top_selling_items AS
SELECT 
    si.item_name,
    si.recipe_id,
    SUM(si.quantity) as total_sold,
    SUM(si.total) as total_revenue,
    COUNT(DISTINCT s.id) as sale_count
FROM sale_items si
JOIN sales s ON si.sale_id = s.id
WHERE s.created_at >= NOW() - INTERVAL '30 days'
GROUP BY si.item_name, si.recipe_id
ORDER BY total_sold DESC;

-- Vista: Costos históricos promedio por mes
CREATE MATERIALIZED VIEW mv_monthly_cost_averages AS
SELECT 
    ich.inventory_item_id,
    DATE_TRUNC('month', ich.date) as month,
    AVG(ich.cost_per_unit) as avg_cost,
    MIN(ich.cost_per_unit) as min_cost,
    MAX(ich.cost_per_unit) as max_cost
FROM inventory_cost_history ich
GROUP BY ich.inventory_item_id, DATE_TRUNC('month', ich.date);

-- Vista: Márgenes por receta (últimos 90 días)
CREATE MATERIALIZED VIEW mv_recipe_margins AS
SELECT 
    r.id as recipe_id,
    r.name,
    r.category,
    AVG(r.margin) as avg_margin,
    COUNT(DISTINCT s.id) as sale_count,
    SUM(si.total) as total_revenue
FROM recipes r
JOIN sale_items si ON si.recipe_id = r.id
JOIN sales s ON si.sale_id = s.id
WHERE s.created_at >= NOW() - INTERVAL '90 days'
GROUP BY r.id, r.name, r.category;
```

---

## Migraciones Recomendadas

### Fase 1: Infraestructura Base (Semana 1)
1. Crear tabla `units` y `unit_conversions`
2. Crear tabla `suppliers`
3. Crear tabla `business_locations`
4. Agregar campos a `users` (phone, default_location_id)

### Fase 2: Inventario Mejorado (Semana 2)
1. Crear tabla `inventory_cost_history`
2. Crear tabla `inventory_movements`
3. Modificar `inventory_items` (agregar FK a suppliers, locations, units)
4. Migrar datos existentes

### Fase 3: Recetas Avanzadas (Semana 3)
1. Crear tabla `recipe_versions`
2. Crear tabla `recipe_components`
3. Modificar `recipes` (agregar location_id, subcategory, etc.)
4. Migrar recetas existentes a versión 1

### Fase 4: Ventas Mejoradas (Semana 4)
1. Modificar `sales` (agregar location_id, table_number, waiter_id, etc.)
2. Crear tabla `promotions`
3. Crear tabla `sale_discounts`
4. Crear tabla `purchase_orders` y `purchase_order_items`

### Fase 5: Seguridad y Logs (Semana 5)
1. Crear tablas `roles`, `permissions`, `role_permissions`, `user_roles`
2. Crear tabla `chatbot_logs`
3. Asignar roles por defecto a usuarios existentes

### Fase 6: Optimización (Semana 6)
1. Crear índices
2. Crear vistas materializadas
3. Configurar refresh automático de vistas

---

## Scripts de Migración de Datos

### Migrar Inventario Existente

```python
# Script para migrar inventory_items existentes
def migrate_inventory_items():
    # 1. Crear unidad por defecto si no existe
    default_unit = Unit(
        id=str(uuid.uuid4()),
        code="unid",
        name="Unidad",
        type="piece",
        factor_to_base=1.0
    )
    
    # 2. Crear ubicación por defecto
    default_location = BusinessLocation(
        id=str(uuid.uuid4()),
        name="Sucursal Principal",
        address="La Paz",
        is_main=True
    )
    
    # 3. Migrar items existentes
    for item in old_inventory_items:
        # Asignar location_id
        item.location_id = default_location.id
        
        # Buscar o crear unidad
        unit = find_or_create_unit(item.unit)
        item.unit_id = unit.id
        
        # Crear entrada en cost_history
        cost_history = InventoryCostHistory(
            inventory_item_id=item.id,
            cost_per_unit=item.cost_per_unit,
            date=item.last_updated or datetime.utcnow(),
            reason="migración"
        )
```

---

## Conclusión

Esta base de datos mejorada satisface todas las necesidades identificadas:

✅ **Historial completo** de precios y movimientos
✅ **Multi-sucursal** con separación de datos
✅ **Versionado** de recetas para auditoría
✅ **Preparaciones intermedias** para recetas complejas
✅ **Sistema de unidades** con conversiones reales
✅ **Logs del chatbot** para análisis y mejora
✅ **Roles y permisos** granulares
✅ **Promociones y descuentos** flexibles
✅ **Órdenes de compra** para gestión de proveedores
✅ **Campos adicionales** para mesas, meseros, delivery

**Próximos pasos**:
1. Crear modelos SQLAlchemy para todas las tablas
2. Generar migraciones con Alembic
3. Crear scripts de migración de datos
4. Actualizar servicios y endpoints
5. Actualizar documentación

---

**Versión del Documento**: 2.0.0  
**Última Actualización**: 2025-01-22  
**Autor**: Sistema GastroSmart AI

