# 📚 Documentación Completa del Backend - GastroSmart AI

## 📋 Tabla de Contenidos

1. [Introducción](#introducción)
2. [Arquitectura del Sistema](#arquitectura-del-sistema)
3. [Estructura del Proyecto](#estructura-del-proyecto)
4. [Configuración](#configuración)
5. [Modelos de Base de Datos](#modelos-de-base-de-datos)
6. [Schemas (Pydantic)](#schemas-pydantic)
7. [Endpoints API](#endpoints-api)
8. [Servicios](#servicios)
9. [Validaciones](#validaciones)
10. [Enums y Constantes](#enums-y-constantes)
11. [Instalación y Configuración](#instalación-y-configuración)
12. [Uso y Ejemplos](#uso-y-ejemplos)

---

## Introducción

**GastroSmart AI** es un sistema integral de control gastronómico con inteligencia artificial desarrollado con **FastAPI** (Python). El backend proporciona una API RESTful completa para gestionar inventario, recetas, ventas, reportes y un chatbot con IA.

### Características Principales

- ✅ **API RESTful** completa con FastAPI
- ✅ **Base de datos PostgreSQL** con SQLAlchemy ORM
- ✅ **Validaciones robustas** con Pydantic
- ✅ **Integración con IA** (OpenAI/LangChain) para chatbot
- ✅ **Sistema de alertas** de stock crítico
- ✅ **Validaciones de negocio** (stock, horarios, márgenes)
- ✅ **CORS configurado** para frontend
- ✅ **Documentación automática** (Swagger/ReDoc)

---

## Arquitectura del Sistema

### Stack Tecnológico

```
Backend:
├── Framework: FastAPI 0.109.0
├── Base de Datos: PostgreSQL (SQLAlchemy 2.0.25)
├── ORM: SQLAlchemy
├── Validación: Pydantic 2.5.3
├── Migraciones: Alembic 1.13.1
├── IA: OpenAI + LangChain
└── Servidor: Uvicorn
```

### Patrón de Arquitectura

El backend sigue una arquitectura en capas:

```
┌─────────────────────────────────────┐
│         API Layer (FastAPI)         │
│  ┌───────────────────────────────┐  │
│  │   Endpoints (app/api/v1/)     │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│      Service Layer                  │
│  ┌───────────────────────────────┐  │
│  │   Services (app/services/)   │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│      Data Layer                     │
│  ┌───────────────────────────────┐  │
│  │   Models (app/models/)        │  │
│  │   Schemas (app/schemas/)      │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│      Database (PostgreSQL)          │
└─────────────────────────────────────┘
```

---

## Estructura del Proyecto

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                    # Aplicación FastAPI principal
│   │
│   ├── core/                      # Configuración central
│   │   ├── __init__.py
│   │   ├── config.py              # Configuración de la aplicación
│   │   ├── database.py            # Configuración de base de datos
│   │   └── enums.py               # Enums y constantes
│   │
│   ├── models/                    # Modelos SQLAlchemy (ORM)
│   │   ├── __init__.py
│   │   ├── user.py                # Modelo de usuarios
│   │   ├── inventory.py           # Modelo de inventario
│   │   ├── recipe.py              # Modelo de recetas
│   │   └── sale.py                # Modelo de ventas
│   │
│   ├── schemas/                   # Schemas Pydantic (validación)
│   │   ├── __init__.py
│   │   ├── inventory.py           # Schemas de inventario
│   │   ├── recipe.py              # Schemas de recetas
│   │   ├── sale.py                # Schemas de ventas
│   │   ├── dashboard.py          # Schemas del dashboard
│   │   └── chatbot.py            # Schemas del chatbot
│   │
│   ├── api/                       # Endpoints de la API
│   │   ├── __init__.py
│   │   └── v1/                    # API versión 1
│   │       ├── __init__.py        # Router principal
│   │       ├── health.py          # Health checks
│   │       ├── enums.py          # Endpoint de enums
│   │       ├── inventory.py      # CRUD de inventario
│   │       ├── recipes.py         # CRUD de recetas
│   │       ├── sales.py           # CRUD de ventas
│   │       ├── dashboard.py      # Estadísticas del dashboard
│   │       ├── reports.py         # Reportes
│   │       ├── alerts.py          # Alertas de stock
│   │       └── chatbot.py         # Chatbot con IA
│   │
│   └── services/                  # Lógica de negocio
│       ├── __init__.py
│       ├── inventory_service.py   # Servicio de inventario
│       └── ai_service.py          # Servicio de IA
│
├── alembic/                       # Migraciones de base de datos
│   ├── versions/                  # Versiones de migraciones
│   ├── env.py                     # Configuración de Alembic
│   └── alembic.ini                 # Configuración de Alembic
│
├── scripts/                        # Scripts de utilidad
│   ├── check_database.py         # Verificar conexión DB
│   ├── check_api.py              # Verificar API
│   └── verify_all.py             # Verificación completa
│
├── requirements.txt               # Dependencias Python
├── .env.example                  # Ejemplo de variables de entorno
├── run.py                        # Script para ejecutar el servidor
└── README.md                     # Documentación básica
```

---

## Configuración

### Variables de Entorno

El sistema utiliza variables de entorno para configuración. Crear un archivo `.env` en la raíz del backend:

```env
# Base de Datos
DATABASE_URL=postgresql://usuario:password@localhost:5432/gastrosmart
DATABASE_TYPE=postgresql

# API
API_V1_PREFIX=/api/v1
SECRET_KEY=tu-clave-secreta-cambiar-en-produccion
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# IA (OpenAI)
OPENAI_API_KEY=sk-tu-api-key-aqui
AI_MODEL=gpt-3.5-turbo
AI_TEMPERATURE=0.7

# CORS (separados por comas)
CORS_ORIGINS=http://localhost:3000,http://localhost:5173

# Ambiente
ENVIRONMENT=development

# Horarios de Operación (24 horas)
BUSINESS_OPEN_HOUR=8
BUSINESS_CLOSE_HOUR=22
BUSINESS_DAYS=0,1,2,3,4,5,6  # 0=Lunes, 6=Domingo
```

### Configuración en `app/core/config.py`

```python
class Settings(BaseSettings):
    # Base de datos
    DATABASE_URL: str
    DATABASE_TYPE: str = "postgresql"
    
    # API
    API_V1_PREFIX: str = "/api/v1"
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    
    # IA
    OPENAI_API_KEY: str = ""
    AI_MODEL: str = "gpt-3.5-turbo"
    AI_TEMPERATURE: float = 0.7
    
    # CORS
    CORS_ORIGINS: Union[str, List[str]]
    
    # Horarios de negocio
    BUSINESS_OPEN_HOUR: int = 8
    BUSINESS_CLOSE_HOUR: int = 22
    BUSINESS_DAYS: List[int] = [0, 1, 2, 3, 4, 5, 6]
```

---

## Modelos de Base de Datos

### 1. User (Usuarios)

**Ubicación**: `app/models/user.py`

```python
class User(Base):
    __tablename__ = "users"
    
    id = Column(String, primary_key=True)
    email = Column(String, unique=True, nullable=False)
    username = Column(String, unique=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String)
    is_active = Column(Boolean, default=True)
    is_superuser = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow)
```

**Relaciones**: Ninguna directa (FK desde otras tablas)

---

### 2. InventoryItem (Inventario)

**Ubicación**: `app/models/inventory.py`

```python
class InventoryItem(Base):
    __tablename__ = "inventory_items"
    
    id = Column(String, primary_key=True)
    name = Column(String, nullable=False, index=True)
    category = Column(String, nullable=False)
    quantity = Column(Float, nullable=False, default=0.0)
    unit = Column(String, nullable=False)  # kg, L, unid, etc.
    min_stock = Column(Float, nullable=False)
    cost_per_unit = Column(Float, nullable=False)
    supplier = Column(String)
    last_updated = Column(DateTime, default=datetime.utcnow)
    user_id = Column(String, ForeignKey("users.id"))
    
    # Relaciones
    recipe_ingredients = relationship("RecipeIngredient", back_populates="inventory_item")
```

**Relaciones**:
- `recipe_ingredients`: One-to-Many con `RecipeIngredient`

---

### 3. Recipe (Recetas)

**Ubicación**: `app/models/recipe.py`

```python
class Recipe(Base):
    __tablename__ = "recipes"
    
    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    description = Column(Text)
    category = Column(String, nullable=False)
    price = Column(Float, nullable=False)
    cost = Column(Float, nullable=False)
    margin = Column(Float, nullable=False)
    preparation_time = Column(Integer)
    servings = Column(Integer, nullable=False, default=1)
    instructions = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow)
    user_id = Column(String, ForeignKey("users.id"))
    
    # Relaciones
    ingredients = relationship("RecipeIngredient", back_populates="recipe", cascade="all, delete-orphan")
```

**Relaciones**:
- `ingredients`: One-to-Many con `RecipeIngredient`

---

### 4. RecipeIngredient (Ingredientes de Recetas)

**Ubicación**: `app/models/recipe.py`

```python
class RecipeIngredient(Base):
    __tablename__ = "recipe_ingredients"
    
    id = Column(String, primary_key=True)
    recipe_id = Column(String, ForeignKey("recipes.id"), nullable=False)
    inventory_item_id = Column(String, ForeignKey("inventory_items.id"))
    ingredient_name = Column(String, nullable=False)
    quantity = Column(Float, nullable=False)
    unit = Column(String, nullable=False)
    cost = Column(Float, nullable=False)
    
    # Relaciones
    recipe = relationship("Recipe", back_populates="ingredients")
    inventory_item = relationship("InventoryItem", back_populates="recipe_ingredients")
```

**Relaciones**:
- `recipe`: Many-to-One con `Recipe`
- `inventory_item`: Many-to-One con `InventoryItem` (opcional)

---

### 5. Sale (Ventas)

**Ubicación**: `app/models/sale.py`

```python
class Sale(Base):
    __tablename__ = "sales"
    
    id = Column(String, primary_key=True)
    subtotal = Column(Float, nullable=False)
    tax = Column(Float, nullable=False, default=0.0)
    total = Column(Float, nullable=False)
    payment_method = Column(String, nullable=False)  # EFECTIVO, QR, TARJETA
    notes = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    user_id = Column(String, ForeignKey("users.id"))
    
    # Relaciones
    items = relationship("SaleItem", back_populates="sale", cascade="all, delete-orphan")
```

**Relaciones**:
- `items`: One-to-Many con `SaleItem`

---

### 6. SaleItem (Items de Venta)

**Ubicación**: `app/models/sale.py`

```python
class SaleItem(Base):
    __tablename__ = "sale_items"
    
    id = Column(String, primary_key=True)
    sale_id = Column(String, ForeignKey("sales.id"), nullable=False)
    recipe_id = Column(String, ForeignKey("recipes.id"))
    item_name = Column(String, nullable=False)
    quantity = Column(Integer, nullable=False)
    unit_price = Column(Float, nullable=False)
    total = Column(Float, nullable=False)
    
    # Relaciones
    sale = relationship("Sale", back_populates="items")
```

**Relaciones**:
- `sale`: Many-to-One con `Sale`
- `recipe`: Many-to-One con `Recipe` (opcional)

---

## Schemas (Pydantic)

Los schemas Pydantic proporcionan validación de datos y serialización. Se dividen en tres tipos:

1. **Base**: Campos comunes
2. **Create**: Para crear nuevos registros (con validaciones estrictas)
3. **Update**: Para actualizar registros (campos opcionales)
4. **Response**: Para respuestas (compatible con datos existentes)

### InventoryItem Schemas

**Ubicación**: `app/schemas/inventory.py`

#### InventoryItemCreate
- `name`: str (2-200 caracteres, validación regex)
- `category`: InventoryCategory (enum)
- `quantity`: float (0 - 999,999.99, 2 decimales)
- `unit`: InventoryUnit (enum)
- `min_stock`: float (0 - 999,999.99, 2 decimales)
- `cost_per_unit`: float (> 0, <= 99,999.99, 2 decimales)
- `supplier`: Optional[str] (max 200 caracteres)

**Validaciones**:
- Nombre: Solo letras, números, espacios, guiones, acentos
- Nombre no puede ser solo números
- Capitalización automática de nombres
- Precisión de 2 decimales para cantidades y costos

#### InventoryItemResponse
- Todos los campos de Create + `id`, `last_updated`, `user_id`
- `category` y `unit` como `str` (compatible con datos existentes)

---

### Recipe Schemas

**Ubicación**: `app/schemas/recipe.py`

#### RecipeCreate
- `name`: str (2-200 caracteres)
- `description`: Optional[str] (max 2000 caracteres)
- `category`: RecipeCategory (enum)
- `price`: float (> 0, <= 9,999.99, 2 decimales)
- `preparation_time`: Optional[int] (0-1440 minutos)
- `servings`: int (1-1000, default: 1)
- `instructions`: Optional[str] (max 5000 caracteres)
- `ingredients`: List[RecipeIngredientCreate] (mínimo 1)

**Validaciones**:
- Mínimo 1 ingrediente requerido
- Precio debe ser > costo (validado en endpoint)
- Margen mínimo recomendado: 30%

#### RecipeIngredientCreate
- `ingredient_name`: str (2-200 caracteres)
- `quantity`: float (> 0, <= 10,000, 3 decimales)
- `unit`: RecipeIngredientUnit (enum)
- `cost`: float (>= 0, <= 9,999.99, 2 decimales)
- `inventory_item_id`: Optional[str]

---

### Sale Schemas

**Ubicación**: `app/schemas/sale.py`

#### SaleCreate
- `subtotal`: float (>= 0, <= 999,999.99, 2 decimales)
- `tax`: float (>= 0, <= 999,999.99, 2 decimales, default: 0.0)
- `total`: float (> 0, <= 999,999.99, 2 decimales)
- `payment_method`: PaymentMethod (enum: EFECTIVO, QR, TARJETA)
- `notes`: Optional[str] (max 500 caracteres)
- `items`: List[SaleItemCreate] (mínimo 1)

**Validaciones**:
- `total` = `subtotal` + `tax` (tolerancia: ±0.01)
- Mínimo 1 item requerido
- Validación de stock antes de crear venta
- Validación de horarios de operación

#### SaleItemCreate
- `recipe_id`: Optional[str]
- `item_name`: str (2-200 caracteres)
- `quantity`: int (1-1000)
- `unit_price`: float (> 0, <= 9,999.99, 2 decimales)
- `total`: float (> 0, <= 999,999.99, 2 decimales)

**Validaciones**:
- `total` = `quantity` × `unit_price` (tolerancia: ±0.01)

---

## Endpoints API

### Base URL
```
http://localhost:8000/api/v1
```

### Documentación Interactiva
- **Swagger UI**: `http://localhost:8000/api/docs`
- **ReDoc**: `http://localhost:8000/api/redoc`

---

### 1. Health Check

**Router**: `app/api/v1/health.py`

#### `GET /health/`
Health check básico del servicio.

**Respuesta**:
```json
{
  "status": "healthy",
  "service": "GastroSmart AI API",
  "version": "1.0.0"
}
```

#### `GET /health/database`
Verifica conexión y estado de la base de datos.

**Respuesta**:
```json
{
  "status": "connected",
  "database_type": "postgresql",
  "version": "PostgreSQL 14.x",
  "tables_count": 6,
  "tables": ["users", "inventory_items", "recipes", ...]
}
```

---

### 2. Enums

**Router**: `app/api/v1/enums.py`

#### `GET /enums/`
Obtiene todos los enums disponibles.

**Respuesta**:
```json
{
  "inventory_categories": ["Carnes", "Verduras", "Granos", ...],
  "inventory_units": ["kg", "g", "L", "mL", ...],
  "recipe_categories": ["Plato Principal", "Entrada", ...],
  "recipe_ingredient_units": ["kg", "g", "L", "cucharada", ...],
  "payment_methods": ["EFECTIVO", "QR", "TARJETA"]
}
```

#### `GET /enums/inventory/categories`
Obtiene categorías de inventario.

#### `GET /enums/inventory/units`
Obtiene unidades de inventario.

#### `GET /enums/recipe/categories`
Obtiene categorías de recetas.

#### `GET /enums/recipe/ingredient-units`
Obtiene unidades de ingredientes.

#### `GET /enums/payment/methods`
Obtiene métodos de pago.

---

### 3. Inventory (Inventario)

**Router**: `app/api/v1/inventory.py`

#### `GET /inventory/`
Obtiene todos los items de inventario.

**Respuesta**: `List[InventoryItemResponse]`

#### `POST /inventory/`
Crea un nuevo item de inventario.

**Body**: `InventoryItemCreate`

**Validaciones**:
- Nombre: 2-200 caracteres, formato válido
- Categoría: Enum válido
- Cantidad: >= 0, <= 999,999.99, 2 decimales
- Unidad: Enum válido
- Costo: > 0, <= 99,999.99, 2 decimales

#### `GET /inventory/{item_id}`
Obtiene un item específico.

#### `PUT /inventory/{item_id}`
Actualiza un item de inventario.

**Body**: `InventoryItemUpdate` (todos los campos opcionales)

#### `DELETE /inventory/{item_id}`
Elimina un item de inventario.

---

### 4. Recipes (Recetas)

**Router**: `app/api/v1/recipes.py`

#### `GET /recipes/`
Obtiene todas las recetas.

**Query Parameters**:
- `skip`: int (default: 0)
- `limit`: int (default: 100)

**Respuesta**: `List[RecipeResponse]` (con ingredientes lazy-loaded)

#### `POST /recipes/`
Crea una nueva receta.

**Body**: `RecipeCreate`

**Validaciones**:
- Mínimo 1 ingrediente
- Precio > costo (margen positivo)
- Margen mínimo recomendado: 30%
- Cálculo automático de costo total

**Lógica**:
- Si `inventory_item_id` está presente, calcula costo desde inventario
- Si no, usa costo manual del ingrediente
- Calcula `cost` total y `margin` automáticamente

#### `GET /recipes/{recipe_id}`
Obtiene una receta específica con sus ingredientes.

#### `PUT /recipes/{recipe_id}`
Actualiza una receta.

**Body**: `RecipeUpdate` (todos los campos opcionales)

**Validaciones**:
- Si se actualiza precio, valida que sea > costo
- Recalcula costos si se modifican ingredientes

#### `DELETE /recipes/{recipe_id}`
Elimina una receta (cascade elimina ingredientes).

---

### 5. Sales (Ventas)

**Router**: `app/api/v1/sales.py`

#### `GET /sales/`
Obtiene todas las ventas.

**Query Parameters**:
- `start_date`: str (ISO format, opcional)
- `end_date`: str (ISO format, opcional)

**Respuesta**: `List[SaleResponse]`

#### `POST /sales/`
Crea una nueva venta.

**Body**: `SaleCreate`

**Validaciones Críticas**:
1. **Horarios de operación**: Valida que la venta se realice en horario válido
2. **Stock disponible**: Verifica stock para todos los ingredientes
3. **Totales correctos**: Valida que `total` = `subtotal` + `tax`
4. **Items requeridos**: Mínimo 1 item

**Lógica**:
- Valida stock antes de crear venta
- Actualiza inventario automáticamente (reduce stock)
- Si falla actualización, hace rollback de la venta

#### `GET /sales/{sale_id}`
Obtiene una venta específica.

#### `DELETE /sales/{sale_id}`
Elimina una venta y restaura el inventario.

**Lógica**:
- Restaura stock de todos los ingredientes utilizados
- Rollback completo de la venta

#### `GET /sales/stats/today`
Obtiene estadísticas de ventas del día actual.

**Respuesta**:
```json
{
  "total_sales": 1500.50,
  "count": 25,
  "dishes_sold": 45,
  "average_ticket": 60.02
}
```

---

### 6. Dashboard

**Router**: `app/api/v1/dashboard.py`

#### `GET /dashboard/stats`
Obtiene estadísticas completas del dashboard.

**Respuesta**: `DashboardResponse`

**Incluye**:
- Ventas del día (con comparación con ayer)
- Platos vendidos del día
- Items críticos de inventario
- Margen promedio
- Top 5 platos más vendidos (últimos 7 días)
- Alertas de stock crítico
- Ventas por día (últimos 7 días)
- Distribución por categorías

---

### 7. Reports (Reportes)

**Router**: `app/api/v1/reports.py`

#### `GET /reports/monthly-trend`
Tendencia mensual de ventas.

**Query Parameters**:
- `months`: int (default: 6)

#### `GET /reports/category-performance`
Rendimiento por categoría.

**Query Parameters**:
- `start_date`: str (opcional)
- `end_date`: str (opcional)

#### `GET /reports/profit-margins`
Análisis de márgenes de ganancia.

#### `GET /reports/payment-methods`
Distribución por método de pago.

#### `GET /reports/export`
Exporta reportes en formato CSV o JSON.

**Query Parameters**:
- `format`: str ("csv" o "json")
- `report_type`: str (tipo de reporte)

---

### 8. Alerts (Alertas)

**Router**: `app/api/v1/alerts.py`

#### `GET /alerts/stock-critical`
Obtiene items con stock crítico (quantity <= min_stock).

**Respuesta**:
```json
{
  "count": 3,
  "alerts": [
    {
      "id": "...",
      "name": "Pollo",
      "quantity": 2.5,
      "min_stock": 5.0,
      "unit": "kg",
      "percentage": 50.0,
      "shortage": 2.5,
      "severity": "critical"
    }
  ]
}
```

#### `GET /alerts/stock-low`
Obtiene items con stock bajo (quantity <= min_stock * threshold).

**Query Parameters**:
- `threshold`: float (default: 1.2)

#### `GET /alerts/recipes-low-margin`
Obtiene recetas con márgenes bajos.

**Query Parameters**:
- `min_margin`: float (default: 30.0)

#### `GET /alerts/all`
Obtiene todas las alertas (críticas, bajas, márgenes).

---

### 9. Chatbot

**Router**: `app/api/v1/chatbot.py`

#### `POST /chatbot/message`
Envía un mensaje al chatbot con IA.

**Body**:
```json
{
  "message": "¿Cuál es el plato más vendido?",
  "context": {
    "user_id": "...",
    "session_id": "..."
  }
}
```

**Respuesta**:
```json
{
  "response": "El plato más vendido es...",
  "suggestions": ["Ver recetas", "Ver reportes"]
}
```

**Lógica**:
- Usa OpenAI GPT-3.5-turbo
- Contexto del sistema: información sobre inventario, recetas, ventas
- Respuestas contextuales basadas en datos reales

---

## Servicios

### 1. InventoryService

**Ubicación**: `app/services/inventory_service.py`

Servicio para operaciones de inventario y validaciones.

#### Métodos:

##### `check_stock_availability(recipe_id, quantity, db)`
Verifica si hay suficiente stock para una receta.

**Parámetros**:
- `recipe_id`: str
- `quantity`: int (cantidad de porciones a vender)
- `db`: Session

**Retorna**:
```python
{
    "available": bool,
    "missing_items": List[Dict],
    "sufficient": bool
}
```

**Lógica**:
- Calcula cantidad requerida: `(ingredient.quantity * quantity) / recipe.servings`
- Compara con stock disponible
- Retorna items faltantes con detalles

##### `update_inventory_from_sale(recipe_id, quantity, db, operation)`
Actualiza inventario basado en una venta.

**Parámetros**:
- `recipe_id`: str
- `quantity`: int
- `db`: Session
- `operation`: str ("subtract" o "add")

**Retorna**:
```python
{
    "success": bool,
    "updated_items": List[Dict],
    "errors": List[str]
}
```

**Lógica**:
- Calcula cantidad a actualizar: `(ingredient.quantity * quantity / recipe.servings) * multiplier`
- `multiplier`: -1 para "subtract", +1 para "add"
- Valida que no se vaya a negativo
- Actualiza `last_updated`

##### `get_critical_stock_items(db)`
Obtiene items con stock crítico.

##### `get_low_stock_items(db, threshold_multiplier)`
Obtiene items con stock bajo.

---

### 2. AIService

**Ubicación**: `app/services/ai_service.py`

Servicio para integración con OpenAI/LangChain.

#### Métodos:

##### `generate_response(message, context)`
Genera respuesta del chatbot usando IA.

**Parámetros**:
- `message`: str
- `context`: Dict (información del sistema)

**Retorna**: str (respuesta del chatbot)

**Lógica**:
- Usa LangChain con ChatOpenAI
- Prompt template con contexto del sistema
- Respuestas contextuales basadas en datos reales

---

## Validaciones

### Validaciones de Entrada (Pydantic)

#### InventoryItem
- ✅ Nombre: 2-200 caracteres, regex válido, no solo números
- ✅ Categoría: Enum válido
- ✅ Cantidad: >= 0, <= 999,999.99, 2 decimales
- ✅ Unidad: Enum válido
- ✅ Costo: > 0, <= 99,999.99, 2 decimales
- ✅ Capitalización automática de nombres

#### Recipe
- ✅ Nombre: 2-200 caracteres, regex válido
- ✅ Categoría: Enum válido
- ✅ Precio: > 0, <= 9,999.99, 2 decimales
- ✅ Mínimo 1 ingrediente
- ✅ Precio > costo (validado en endpoint)
- ✅ Margen mínimo recomendado: 30%

#### Sale
- ✅ Mínimo 1 item
- ✅ Total = subtotal + tax (tolerancia: ±0.01)
- ✅ Método de pago: Enum válido
- ✅ Validación de stock antes de crear
- ✅ Validación de horarios de operación

### Validaciones de Negocio

#### Ventas
1. **Horarios**: Solo permite ventas en horario de operación
2. **Stock**: Verifica disponibilidad antes de permitir venta
3. **Actualización automática**: Reduce stock al confirmar venta
4. **Rollback**: Restaura stock al cancelar venta

#### Recetas
1. **Márgenes**: Precio debe ser > costo
2. **Ingredientes**: Mínimo 1 ingrediente requerido
3. **Cálculo automático**: Costo calculado desde ingredientes

---

## Enums y Constantes

**Ubicación**: `app/core/enums.py`

### InventoryCategory
```python
CARNES = "Carnes"
VERDURAS = "Verduras"
GRANOS = "Granos"
LACTEOS = "Lácteos"
BEBIDAS = "Bebidas"
CONDIMENTOS = "Condimentos"
OTROS = "Otros"
```

### InventoryUnit
```python
KG = "kg"
G = "g"
L = "L"
ML = "mL"
UNID = "unid"
PZA = "pza"
OZ = "oz"
LB = "lb"
```

### RecipeCategory
```python
PLATO_PRINCIPAL = "Plato Principal"
ENTRADA = "Entrada"
POSTRE = "Postre"
BEBIDA = "Bebida"
ACOMPANAMIENTO = "Acompañamiento"
```

### RecipeIngredientUnit
```python
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
```

### PaymentMethod
```python
EFECTIVO = "EFECTIVO"
QR = "QR"
TARJETA = "TARJETA"
```

---

## Instalación y Configuración

### Requisitos Previos

- Python 3.9+
- PostgreSQL 12+
- pip

### Pasos de Instalación

1. **Clonar o navegar al directorio del backend**:
```bash
cd backend
```

2. **Crear entorno virtual**:
```bash
python -m venv venv
source venv/bin/activate  # En Windows: venv\Scripts\activate
```

3. **Instalar dependencias**:
```bash
pip install -r requirements.txt
```

4. **Configurar base de datos PostgreSQL**:
```bash
# Crear base de datos
createdb gastrosmart

# O usando psql
psql -U postgres
CREATE DATABASE gastrosmart;
```

5. **Configurar variables de entorno**:
```bash
cp .env.example .env
# Editar .env con tus configuraciones
```

6. **Ejecutar migraciones**:
```bash
alembic upgrade head
```

7. **Ejecutar el servidor**:
```bash
python run.py
# O
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Verificación

1. **Health Check**:
```bash
curl http://localhost:8000/health
```

2. **Documentación**:
- Abrir en navegador: `http://localhost:8000/api/docs`

3. **Verificar base de datos**:
```bash
python scripts/check_database.py
```

4. **Verificar API completa**:
```bash
python scripts/verify_all.py
```

---

## Uso y Ejemplos

### Ejemplo 1: Crear Item de Inventario

```python
import requests

url = "http://localhost:8000/api/v1/inventory/"
data = {
    "name": "Tomate",
    "category": "Verduras",
    "quantity": 50.0,
    "unit": "kg",
    "min_stock": 10.0,
    "cost_per_unit": 5.50,
    "supplier": "Proveedor ABC"
}

response = requests.post(url, json=data)
print(response.json())
```

### Ejemplo 2: Crear Receta

```python
url = "http://localhost:8000/api/v1/recipes/"
data = {
    "name": "Pollo a la Plancha",
    "category": "Plato Principal",
    "price": 45.00,
    "servings": 4,
    "preparation_time": 30,
    "ingredients": [
        {
            "inventory_item_id": "uuid-del-pollo",
            "ingredient_name": "Pollo",
            "quantity": 0.5,
            "unit": "kg",
            "cost": 15.00
        },
        {
            "ingredient_name": "Arroz",
            "quantity": 0.3,
            "unit": "kg",
            "cost": 3.00
        }
    ]
}

response = requests.post(url, json=data)
print(response.json())
```

### Ejemplo 3: Crear Venta

```python
url = "http://localhost:8000/api/v1/sales/"
data = {
    "items": [
        {
            "recipe_id": "uuid-de-la-receta",
            "item_name": "Pollo a la Plancha",
            "quantity": 2,
            "unit_price": 45.00,
            "total": 90.00
        }
    ],
    "subtotal": 90.00,
    "tax": 11.70,  # 13% IVA
    "total": 101.70,
    "payment_method": "EFECTIVO",
    "notes": "Mesa 5"
}

response = requests.post(url, json=data)
print(response.json())
```

### Ejemplo 4: Obtener Alertas de Stock

```python
url = "http://localhost:8000/api/v1/alerts/stock-critical"
response = requests.get(url)
alerts = response.json()

for alert in alerts["alerts"]:
    print(f"⚠️ {alert['name']}: {alert['quantity']}{alert['unit']} restantes (mínimo: {alert['min_stock']}{alert['unit']})")
```

### Ejemplo 5: Chatbot

```python
url = "http://localhost:8000/api/v1/chatbot/message"
data = {
    "message": "¿Cuál es el plato más vendido hoy?",
    "context": {
        "user_id": "user-123"
    }
}

response = requests.post(url, json=data)
print(response.json()["response"])
```

---

## Migraciones de Base de Datos

### Crear Nueva Migración

```bash
alembic revision --autogenerate -m "Descripción de la migración"
```

### Aplicar Migraciones

```bash
alembic upgrade head
```

### Revertir Migración

```bash
alembic downgrade -1
```

### Ver Estado de Migraciones

```bash
alembic current
alembic history
```

---

## Seguridad

### Configuración de Producción

1. **Cambiar SECRET_KEY**:
```env
SECRET_KEY=tu-clave-secreta-super-segura-aqui
```

2. **Configurar CORS correctamente**:
```env
CORS_ORIGINS=https://tudominio.com
```

3. **Usar HTTPS**:
- Configurar reverse proxy (Nginx)
- Certificados SSL válidos

4. **Variables de entorno**:
- Nunca commitear `.env`
- Usar secretos en producción

5. **Base de datos**:
- Usar conexiones seguras
- Credenciales fuertes
- Backup regular

---

## Testing

### Ejecutar Tests (cuando estén implementados)

```bash
pytest
pytest --cov=app tests/
```

### Verificar Endpoints Manualmente

```bash
# Health check
curl http://localhost:8000/api/v1/health/

# Obtener inventario
curl http://localhost:8000/api/v1/inventory/

# Obtener enums
curl http://localhost:8000/api/v1/enums/
```

---

## Troubleshooting

### Error: CORS bloqueado

**Solución**: Verificar que `CORS_ORIGINS` en `.env` incluya el origen del frontend.

### Error: No se puede conectar a la base de datos

**Solución**: 
1. Verificar que PostgreSQL esté corriendo
2. Verificar `DATABASE_URL` en `.env`
3. Verificar credenciales

### Error: Enum no válido

**Solución**: Verificar que el valor enviado coincida exactamente con los valores del enum. Usar `/api/v1/enums/` para ver valores válidos.

### Error: Stock insuficiente

**Solución**: Verificar que haya suficiente stock en inventario antes de crear venta.

---

## Próximas Mejoras

- [ ] Autenticación JWT completa
- [ ] Sistema de roles y permisos
- [ ] Tests unitarios y de integración
- [ ] Cache con Redis
- [ ] WebSockets para notificaciones en tiempo real
- [ ] Exportación de reportes a PDF
- [ ] Integración con sistemas de pago
- [ ] API de facturación electrónica

---

## Conclusión

El backend de GastroSmart AI proporciona una API RESTful completa, robusta y bien documentada para gestionar todas las operaciones de un restaurante. Con validaciones exhaustivas, integración con IA, y un sistema de alertas, está listo para uso en producción con las configuraciones de seguridad adecuadas.

---

**Versión del Documento**: 1.0.0  
**Última Actualización**: 2025-01-22  
**Autor**: Sistema GastroSmart AI

