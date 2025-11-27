# 📚 Documentación Completa del Backend - GastroSmart AI

## 📋 Tabla de Contenidos

1. [Introducción](#introducción)
2. [Arquitectura del Sistema](#arquitectura-del-sistema)
3. [Estructura del Proyecto](#estructura-del-proyecto)
4. [Configuración](#configuración)
5. [Workflow del Sistema](#workflow-del-sistema)
6. [Modelos de Base de Datos](#modelos-de-base-de-datos)
7. [Schemas (Pydantic)](#schemas-pydantic)
8. [Endpoints API](#endpoints-api)
9. [Servicios](#servicios)
10. [Validaciones](#validaciones)
11. [Enums y Constantes](#enums-y-constantes)
12. [Mejoras Implementadas](#mejoras-implementadas)
13. [Mejoras Pendientes](#mejoras-pendientes)
14. [Instalación y Configuración](#instalación-y-configuración)
15. [Uso y Ejemplos](#uso-y-ejemplos)

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

## Workflow del Sistema

### Flujo Principal de Operaciones

```
┌─────────────────────────────────────────────────────────────┐
│                    WORKFLOW GASTROSMART AI                   │
└─────────────────────────────────────────────────────────────┘

1. CONFIGURACIÓN INICIAL
   ├── Crear Sucursales (BusinessLocations)
   ├── Registrar Proveedores (Suppliers)
   ├── Configurar Unidades de Medida (Units)
   └── Crear Usuarios con Roles (Users + UserRoles)

2. GESTIÓN DE INVENTARIO
   ├── Registrar Items (InventoryItems)
   │   ├── Asignar a Sucursal
   │   ├── Asignar Proveedor
   │   ├── Definir Unidad de Medida
   │   └── Establecer Stock Mínimo/Máximo
   ├── Registrar Historial de Costos (InventoryCostHistory)
   └── Registrar Movimientos (InventoryMovements)
       ├── ENTRADA: Compras de proveedores
       ├── SALIDA: Uso en recetas/ventas
       ├── AJUSTE: Correcciones manuales
       ├── MERMA: Pérdidas por manipulación
       ├── CADUCIDAD: Productos vencidos
       └── TRANSFERENCIA: Entre sucursales

3. GESTIÓN DE RECETAS
   ├── Crear Receta (Recipes)
   │   ├── Asignar a Sucursal
   │   ├── Definir Categoría/Subcategoría
   │   └── Establecer Precio
   ├── Agregar Ingredientes (RecipeIngredients)
   │   ├── Vincular con InventoryItems (opcional)
   │   └── Definir Cantidad y Unidad
   ├── Usar Sub-recetas (RecipeComponents)
   │   └── Recetas que usan otras recetas como ingredientes
   └── Versionar Recetas (RecipeVersions)
       └── Mantener historial de cambios

4. PROCESO DE VENTA
   ├── Crear Venta (Sales)
   │   ├── Seleccionar Sucursal
   │   ├── Asignar Mesa/Mesero (opcional)
   │   ├── Definir Tipo: LOCAL/DELIVERY/TAKEAWAY
   │   └── Agregar Items (SaleItems)
   ├── Aplicar Promociones (Promotions → SaleDiscounts)
   ├── Validar Stock Disponible
   ├── Calcular Totales (subtotal, descuentos, tax, total)
   ├── Registrar Pago
   └── Actualizar Inventario Automáticamente
       └── Generar Movimientos de SALIDA

5. REPORTES Y ANÁLISIS
   ├── Dashboard con Estadísticas
   ├── Reportes de Ventas
   ├── Análisis de Márgenes
   ├── Alertas de Stock Crítico
   └── Predicciones de IA

6. CHATBOT CON IA
   ├── Usuario hace pregunta
   ├── Sistema consulta datos (inventario, ventas, recetas)
   ├── IA genera respuesta contextual
   └── Registrar en ChatbotLogs
```

### Flujo de Datos entre Módulos

```
┌──────────────┐
│  Suppliers   │──┐
└──────────────┘  │
                  ├──> InventoryItems ──> RecipeIngredients ──> Recipes
┌──────────────┐  │
│   Units      │──┘
└──────────────┘
                  │
┌──────────────┐  │
│BusinessLocs  │──┼──> InventoryItems
└──────────────┘  │    Recipes
                  │    Sales
                  │    InventoryMovements
                  │
┌──────────────┐  │
│   Recipes    │──┼──> SaleItems ──> Sales
└──────────────┘  │
                  │
┌──────────────┐  │
│ Promotions   │──┘──> SaleDiscounts ──> Sales
└──────────────┘
```

---

## Modelos de Base de Datos

### Resumen de Tablas

El sistema cuenta con **22 tablas** organizadas en los siguientes módulos:

#### Módulo de Usuarios y Seguridad (4 tablas)
- `users` - Usuarios del sistema
- `roles` - Roles del sistema
- `permissions` - Permisos disponibles
- `role_permissions` - Asignación de permisos a roles
- `user_roles` - Asignación de roles a usuarios

#### Módulo de Configuración (3 tablas)
- `units` - Unidades de medida
- `suppliers` - Proveedores
- `business_locations` - Sucursales

#### Módulo de Inventario (4 tablas)
- `inventory_items` - Items de inventario
- `inventory_cost_history` - Historial de precios
- `inventory_movements` - Movimientos de inventario
- `purchase_orders` - Órdenes de compra
- `purchase_order_items` - Items de órdenes de compra

#### Módulo de Recetas (4 tablas)
- `recipes` - Recetas
- `recipe_ingredients` - Ingredientes de recetas
- `recipe_components` - Sub-recetas (preparaciones intermedias)
- `recipe_versions` - Versiones de recetas

#### Módulo de Ventas (3 tablas)
- `sales` - Ventas
- `sale_items` - Items de venta
- `promotions` - Promociones
- `sale_discounts` - Descuentos aplicados

#### Módulo de IA (1 tabla)
- `chatbot_logs` - Logs del chatbot

---

### 1. Users (Usuarios) / Users Table

**Ubicación**: `app/models/user.py`  
**Tabla**: `users`

**Descripción en Español**:  
Almacena información de los usuarios del sistema. Incluye datos de autenticación, información personal y configuración de ubicación por defecto.

**Description in English**:  
Stores system user information. Includes authentication data, personal information, and default location configuration.

```python
class User(Base):
    __tablename__ = "users"
    
    id = Column(String, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String)
    phone = Column(String)  # Teléfono / Phone
    is_active = Column(Boolean, default=True)
    is_superuser = Column(Boolean, default=False)
    default_location_id = Column(String, ForeignKey("business_locations.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_login = Column(DateTime)  # Último acceso / Last login
```

**Campos Principales / Main Fields**:
- `email`: Email único del usuario / Unique user email
- `username`: Nombre de usuario único / Unique username
- `hashed_password`: Contraseña hasheada / Hashed password
- `phone`: Teléfono de contacto / Contact phone
- `default_location_id`: Sucursal por defecto / Default location
- `last_login`: Fecha del último acceso / Last login date

**Relaciones / Relationships**:
- `default_location`: Many-to-One con `BusinessLocation`
- `roles`: One-to-Many con `UserRole`
- `chatbot_logs`: One-to-Many con `ChatbotLog`

---

### 2. Units (Unidades de Medida) / Units Table

**Ubicación**: `app/models/unit.py`  
**Tabla**: `units`

**Descripción en Español**:  
Sistema centralizado de unidades de medida con soporte para conversiones automáticas. Permite definir unidades base y derivadas con factores de conversión.

**Description in English**:  
Centralized measurement unit system with support for automatic conversions. Allows defining base and derived units with conversion factors.

```python
class Unit(Base):
    __tablename__ = "units"
    
    id = Column(String, primary_key=True, index=True)
    code = Column(String, unique=True, nullable=False, index=True)  # kg, g, lb
    name = Column(String, nullable=False)  # Kilogramo, Gramo, Libra
    type = Column(String, nullable=False)  # weight, volume, piece, custom
    base_unit_id = Column(String, ForeignKey("units.id"))
    factor_to_base = Column(Float, nullable=False, default=1.0)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
```

**Campos Principales / Main Fields**:
- `code`: Código único de la unidad (kg, g, L) / Unique unit code
- `name`: Nombre completo de la unidad / Full unit name
- `type`: Tipo: peso, volumen, pieza, personalizado / Type: weight, volume, piece, custom
- `base_unit_id`: Unidad base para conversión / Base unit for conversion
- `factor_to_base`: Factor de conversión a unidad base / Conversion factor to base unit

**Relaciones / Relationships**:
- `base_unit`: Many-to-One con `Unit` (self-referencing)
- `inventory_items`: One-to-Many con `InventoryItem`
- `recipe_ingredients`: One-to-Many con `RecipeIngredient`

---

### 3. Suppliers (Proveedores) / Suppliers Table

**Ubicación**: `app/models/supplier.py`  
**Tabla**: `suppliers`

**Descripción en Español**:  
Gestiona información de proveedores incluyendo datos de contacto, términos de pago, calificaciones y ubicación geográfica.

**Description in English**:  
Manages supplier information including contact data, payment terms, ratings, and geographic location.

```python
class Supplier(Base):
    __tablename__ = "suppliers"
    
    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False, index=True)
    contact_name = Column(String)  # Nombre de contacto / Contact name
    phone = Column(String)
    email = Column(String)
    address = Column(Text)
    city = Column(String)  # La Paz, El Alto
    zone = Column(String)  # Zona específica / Specific zone
    tax_id = Column(String)  # NIT para facturación / Tax ID
    payment_terms = Column(String)  # "30 días", "contado" / Payment terms
    rating = Column(Float)  # 1-5 estrellas / 1-5 stars
    is_active = Column(Boolean, default=True)
    notes = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    user_id = Column(String, ForeignKey("users.id"))
```

**Relaciones / Relationships**:
- `inventory_items`: One-to-Many con `InventoryItem`
- `purchase_orders`: One-to-Many con `PurchaseOrder`
- `cost_history`: One-to-Many con `InventoryCostHistory`

---

### 4. BusinessLocations (Sucursales) / Business Locations Table

**Ubicación**: `app/models/business_location.py`  
**Tabla**: `business_locations`

**Descripción en Español**:  
Soporte multi-sucursal para restaurantes con múltiples ubicaciones. Cada sucursal puede tener su propio inventario, recetas y ventas.

**Description in English**:  
Multi-location support for restaurants with multiple locations. Each location can have its own inventory, recipes, and sales.

```python
class BusinessLocation(Base):
    __tablename__ = "business_locations"
    
    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)  # "Sucursal Centro"
    address = Column(Text, nullable=False)
    city = Column(String, default="La Paz")
    zone = Column(String)  # Zona específica / Specific zone
    phone = Column(String)
    email = Column(String)
    is_main = Column(Boolean, default=False)  # Sucursal principal / Main location
    is_active = Column(Boolean, default=True)
    open_hours = Column(JSON)  # Horarios de apertura / Opening hours
    created_at = Column(DateTime, default=datetime.utcnow)
    user_id = Column(String, ForeignKey("users.id"))
```

**Relaciones / Relationships**:
- `inventory_items`: One-to-Many con `InventoryItem`
- `recipes`: One-to-Many con `Recipe`
- `sales`: One-to-Many con `Sale`
- `inventory_movements`: One-to-Many con `InventoryMovement`
- `users_default`: One-to-Many con `User` (default_location)

---

### 5. InventoryItem (Inventario) / Inventory Items Table

**Ubicación**: `app/models/inventory.py`  
**Tabla**: `inventory_items`

**Descripción en Español**:  
Items de inventario con soporte multi-sucursal, historial de precios, movimientos, y campos para análisis de IA (popularidad, estacionalidad, predicción de demanda).

**Description in English**:  
Inventory items with multi-location support, price history, movements, and fields for AI analysis (popularity, seasonality, demand forecasting).

```python
class InventoryItem(Base):
    __tablename__ = "inventory_items"
    
    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False, index=True)
    category = Column(String, nullable=False, index=True)
    quantity = Column(Float, nullable=False, default=0.0)
    unit = Column(String, nullable=False)  # kg, L, unid
    unit_id = Column(String, ForeignKey("units.id"))  # FK a units
    min_stock = Column(Float, nullable=False)
    max_stock = Column(Float)  # Stock máximo recomendado / Max recommended stock
    cost_per_unit = Column(Float, nullable=False)
    supplier_id = Column(String, ForeignKey("suppliers.id"))  # FK a suppliers
    supplier = Column(String)  # Mantener para compatibilidad / Keep for compatibility
    location_id = Column(String, ForeignKey("business_locations.id"), nullable=False)
    expiry_date = Column(DateTime)  # Fecha de caducidad / Expiry date
    barcode = Column(String, unique=True, index=True)  # Código de barras / Barcode
    last_updated = Column(DateTime, default=datetime.utcnow, index=True)
    user_id = Column(String, ForeignKey("users.id"))
    
    # Campos para IA / AI Fields
    popularity_score = Column(Float, default=0.0)  # Basado en uso / Based on usage
    seasonal_factor = Column(JSON)  # {"enero": 1.2, "septiembre": 0.8}
    demand_forecast = Column(Float)  # Predicción de demanda / Demand forecast
```

**Relaciones / Relationships**:
- `unit_ref`: Many-to-One con `Unit`
- `supplier_ref`: Many-to-One con `Supplier`
- `location`: Many-to-One con `BusinessLocation`
- `recipe_ingredients`: One-to-Many con `RecipeIngredient`
- `cost_history`: One-to-Many con `InventoryCostHistory`
- `movements`: One-to-Many con `InventoryMovement`
- `purchase_order_items`: One-to-Many con `PurchaseOrderItem`

---

### 6. InventoryCostHistory (Historial de Precios) / Inventory Cost History Table

**Ubicación**: `app/models/inventory_cost_history.py`  
**Tabla**: `inventory_cost_history`

**Descripción en Español**:  
Registra todos los cambios de precios de items de inventario para análisis histórico, auditoría y predicciones de IA basadas en estacionalidad.

**Description in English**:  
Records all price changes of inventory items for historical analysis, auditing, and AI predictions based on seasonality.

```python
class InventoryCostHistory(Base):
    __tablename__ = "inventory_cost_history"
    
    id = Column(String, primary_key=True, index=True)
    inventory_item_id = Column(String, ForeignKey("inventory_items.id"), nullable=False, index=True)
    cost_per_unit = Column(Float, nullable=False)
    supplier_id = Column(String, ForeignKey("suppliers.id"))
    date = Column(DateTime, nullable=False, default=datetime.utcnow, index=True)
    reason = Column(String)  # "compra", "ajuste", "inflación", "estacional"
    notes = Column(Text)
    user_id = Column(String, ForeignKey("users.id"))
```

**Relaciones / Relationships**:
- `inventory_item`: Many-to-One con `InventoryItem`
- `supplier`: Many-to-One con `Supplier`

---

### 7. InventoryMovement (Movimientos de Inventario) / Inventory Movements Table

**Ubicación**: `app/models/inventory_movement.py`  
**Tabla**: `inventory_movements`

**Descripción en Español**:  
Auditoría completa de todos los movimientos de inventario. Registra entradas, salidas, ajustes, mermas, caducidades y transferencias entre sucursales.

**Description in English**:  
Complete audit trail of all inventory movements. Records entries, exits, adjustments, waste, expirations, and transfers between locations.

```python
class InventoryMovement(Base):
    __tablename__ = "inventory_movements"
    
    id = Column(String, primary_key=True, index=True)
    inventory_item_id = Column(String, ForeignKey("inventory_items.id"), nullable=False, index=True)
    location_id = Column(String, ForeignKey("business_locations.id"), nullable=False)
    movement_type = Column(String, nullable=False)  # ENTRADA, SALIDA, AJUSTE, MERMA, CADUCIDAD, ROBO, TRANSFERENCIA
    quantity = Column(Float, nullable=False)
    unit = Column(String, nullable=False)
    cost_per_unit = Column(Float)  # Costo al momento del movimiento / Cost at movement time
    reference_id = Column(String)  # ID de venta, compra, etc. / Reference ID
    reference_type = Column(String)  # "sale", "purchase", "adjustment"
    notes = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    user_id = Column(String, ForeignKey("users.id"))
```

**Tipos de Movimiento / Movement Types**:
- `ENTRADA` / `ENTRY`: Compra de proveedor / Supplier purchase
- `SALIDA` / `EXIT`: Venta o uso en receta / Sale or recipe usage
- `AJUSTE` / `ADJUSTMENT`: Corrección manual / Manual correction
- `MERMA` / `WASTE`: Pérdida por manipulación / Loss from handling
- `CADUCIDAD` / `EXPIRATION`: Producto vencido / Expired product
- `ROBO` / `THEFT`: Pérdida por robo / Loss from theft
- `TRANSFERENCIA` / `TRANSFER`: Entre sucursales / Between locations

**Relaciones / Relationships**:
- `inventory_item`: Many-to-One con `InventoryItem`
- `location`: Many-to-One con `BusinessLocation`

---

### 8. PurchaseOrder (Órdenes de Compra) / Purchase Orders Table

**Ubicación**: `app/models/purchase_order.py`  
**Tabla**: `purchase_orders`

**Descripción en Español**:  
Gestión de órdenes de compra a proveedores con seguimiento de estado (PENDIENTE, APROBADA, RECIBIDA, CANCELADA).

**Description in English**:  
Purchase order management for suppliers with status tracking (PENDING, APPROVED, RECEIVED, CANCELLED).

```python
class PurchaseOrder(Base):
    __tablename__ = "purchase_orders"
    
    id = Column(String, primary_key=True, index=True)
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
```

**Relaciones / Relationships**:
- `supplier`: Many-to-One con `Supplier`
- `location`: Many-to-One con `BusinessLocation`
- `items`: One-to-Many con `PurchaseOrderItem`
- `creator`: Many-to-One con `User` (created_by)
- `approver`: Many-to-One con `User` (approved_by)

---

### 9. PurchaseOrderItem (Items de Orden de Compra) / Purchase Order Items Table

**Ubicación**: `app/models/purchase_order.py`  
**Tabla**: `purchase_order_items`

**Descripción en Español**:  
Items individuales de una orden de compra con cantidad solicitada y cantidad recibida.

**Description in English**:  
Individual items of a purchase order with requested and received quantities.

```python
class PurchaseOrderItem(Base):
    __tablename__ = "purchase_order_items"
    
    id = Column(String, primary_key=True, index=True)
    purchase_order_id = Column(String, ForeignKey("purchase_orders.id"), nullable=False)
    inventory_item_id = Column(String, ForeignKey("inventory_items.id"))
    item_name = Column(String, nullable=False)  # Por si no existe en inventario / If not in inventory
    quantity = Column(Float, nullable=False)
    unit = Column(String, nullable=False)
    unit_price = Column(Float, nullable=False)
    total = Column(Float, nullable=False)
    received_quantity = Column(Float, default=0.0)  # Cantidad recibida / Received quantity
```

**Relaciones / Relationships**:
- `purchase_order`: Many-to-One con `PurchaseOrder`
- `inventory_item`: Many-to-One con `InventoryItem` (opcional)

---

### 10. Recipe (Recetas) / Recipes Table

**Ubicación**: `app/models/recipe.py`  
**Tabla**: `recipes`

**Descripción en Español**:  
Recetas de platos con cálculo automático de costos y márgenes. Soporta multi-sucursal, versionado, subcategorías y disponibilidad.

**Description in English**:  
Dish recipes with automatic cost and margin calculation. Supports multi-location, versioning, subcategories, and availability.

```python
class Recipe(Base):
    __tablename__ = "recipes"
    
    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False, index=True)
    description = Column(Text)
    category = Column(String, nullable=False, index=True)
    subcategory = Column(String)  # "Carnes Rojas", "Carnes Blancas"
    price = Column(Float, nullable=False)
    cost = Column(Float, nullable=False, default=0.0)  # Calculado / Calculated
    margin = Column(Float, nullable=False, default=0.0)  # Porcentaje / Percentage
    preparation_time = Column(Integer)  # en minutos / in minutes
    servings = Column(Integer, default=1)
    instructions = Column(Text)
    location_id = Column(String, ForeignKey("business_locations.id"))
    is_available = Column(Boolean, default=True)  # Disponible para venta / Available for sale
    popularity_score = Column(Float, default=0.0)  # Basado en ventas / Based on sales
    current_version = Column(Integer, default=1)  # Versión actual / Current version
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    user_id = Column(String, ForeignKey("users.id"))
```

**Relaciones / Relationships**:
- `location`: Many-to-One con `BusinessLocation`
- `ingredients`: One-to-Many con `RecipeIngredient`
- `components`: One-to-Many con `RecipeComponent` (como receta principal)
- `used_in_recipes`: One-to-Many con `RecipeComponent` (como sub-receta)
- `versions`: One-to-Many con `RecipeVersion`
- `sale_items`: One-to-Many con `SaleItem`

---

### 11. RecipeIngredient (Ingredientes de Recetas) / Recipe Ingredients Table

**Ubicación**: `app/models/recipe.py`  
**Tabla**: `recipe_ingredients`

**Descripción en Español**:  
Ingredientes individuales de una receta. Pueden estar vinculados a items de inventario o ser ingredientes manuales.

**Description in English**:  
Individual ingredients of a recipe. Can be linked to inventory items or be manual ingredients.

```python
class RecipeIngredient(Base):
    __tablename__ = "recipe_ingredients"
    
    id = Column(String, primary_key=True, index=True)
    recipe_id = Column(String, ForeignKey("recipes.id"), nullable=False)
    inventory_item_id = Column(String, ForeignKey("inventory_items.id"))  # Opcional / Optional
    ingredient_name = Column(String, nullable=False)  # Nombre si no está en inventario / Name if not in inventory
    quantity = Column(Float, nullable=False)
    unit = Column(String, nullable=False)
    unit_id = Column(String, ForeignKey("units.id"))  # FK a units
    cost = Column(Float, nullable=False)  # Costo de este ingrediente / Cost for this ingredient
```

**Relaciones / Relationships**:
- `recipe`: Many-to-One con `Recipe`
- `inventory_item`: Many-to-One con `InventoryItem` (opcional)
- `unit_ref`: Many-to-One con `Unit`

---

### 12. RecipeComponent (Preparaciones Intermedias) / Recipe Components Table

**Ubicación**: `app/models/recipe_component.py`  
**Tabla**: `recipe_components`

**Descripción en Español**:  
Permite que recetas usen otras recetas como ingredientes (preparaciones intermedias). Ejemplo: "Anticucho" usa "Salsa para Anticucho".

**Description in English**:  
Allows recipes to use other recipes as ingredients (intermediate preparations). Example: "Anticucho" uses "Salsa para Anticucho".

```python
class RecipeComponent(Base):
    __tablename__ = "recipe_components"
    
    id = Column(String, primary_key=True, index=True)
    recipe_id = Column(String, ForeignKey("recipes.id"), nullable=False)  # Receta principal / Main recipe
    subrecipe_id = Column(String, ForeignKey("recipes.id"), nullable=False)  # Sub-receta / Sub-recipe
    quantity = Column(Float, nullable=False)  # Cantidad de la sub-receta / Sub-recipe quantity
    unit = Column(String, nullable=False)
    notes = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
```

**Relaciones / Relationships**:
- `recipe`: Many-to-One con `Recipe` (receta principal)
- `subrecipe`: Many-to-One con `Recipe` (sub-receta usada como ingrediente)

---

### 13. RecipeVersion (Versiones de Recetas) / Recipe Versions Table

**Ubicación**: `app/models/recipe_version.py`  
**Tabla**: `recipe_versions`

**Descripción en Español**:  
Mantiene historial de cambios en recetas para auditoría y análisis. Solo una versión activa por receta.

**Description in English**:  
Maintains change history of recipes for auditing and analysis. Only one active version per recipe.

```python
class RecipeVersion(Base):
    __tablename__ = "recipe_versions"
    
    id = Column(String, primary_key=True, index=True)
    recipe_id = Column(String, ForeignKey("recipes.id"), nullable=False, index=True)
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
    is_active = Column(Boolean, default=False)  # Solo una activa / Only one active
    change_reason = Column(String)  # "precio", "ingredientes", "presentación"
    created_at = Column(DateTime, default=datetime.utcnow)
    user_id = Column(String, ForeignKey("users.id"))
```

**Relaciones / Relationships**:
- `recipe`: Many-to-One con `Recipe`

---

### 14. Sale (Ventas) / Sales Table

**Ubicación**: `app/models/sale.py`  
**Tabla**: `sales`

**Descripción en Español**:  
Ventas con soporte para mesas, meseros, tipos de venta (LOCAL/DELIVERY/TAKEAWAY), clientes, descuentos y múltiples métodos de pago.

**Description in English**:  
Sales with support for tables, waiters, sale types (LOCAL/DELIVERY/TAKEAWAY), customers, discounts, and multiple payment methods.

```python
class Sale(Base):
    __tablename__ = "sales"
    
    id = Column(String, primary_key=True, index=True)
    sale_number = Column(String, unique=True, index=True)  # Número legible / Readable number
    location_id = Column(String, ForeignKey("business_locations.id"), nullable=False)
    table_number = Column(String)  # Número de mesa / Table number
    waiter_id = Column(String, ForeignKey("users.id"))  # Mesero / Waiter
    sale_type = Column(String, nullable=False, default="LOCAL")  # LOCAL, DELIVERY, TAKEAWAY
    delivery_service = Column(String)  # PedidosYa, Ahora, etc.
    customer_name = Column(String)  # Nombre del cliente / Customer name
    customer_phone = Column(String)  # Teléfono del cliente / Customer phone
    subtotal = Column(Float, nullable=False)
    discount_amount = Column(Float, default=0.0)  # Descuento total / Total discount
    tax = Column(Float, default=0.0)
    total = Column(Float, nullable=False)
    payment_method = Column(String)  # EFECTIVO, QR, TARJETA
    notes = Column(Text)
    status = Column(String, default="COMPLETED")  # COMPLETED, CANCELLED, REFUNDED
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    user_id = Column(String, ForeignKey("users.id"))
```

**Relaciones / Relationships**:
- `location`: Many-to-One con `BusinessLocation`
- `waiter`: Many-to-One con `User` (waiter_id)
- `items`: One-to-Many con `SaleItem`
- `discounts`: One-to-Many con `SaleDiscount`

---

### 15. SaleItem (Items de Venta) / Sale Items Table

**Ubicación**: `app/models/sale.py`  
**Tabla**: `sale_items`

**Descripción en Español**:  
Items individuales de una venta. Vinculados a recetas para cálculo automático de costos y actualización de inventario.

**Description in English**:  
Individual items of a sale. Linked to recipes for automatic cost calculation and inventory updates.

```python
class SaleItem(Base):
    __tablename__ = "sale_items"
    
    id = Column(String, primary_key=True, index=True)
    sale_id = Column(String, ForeignKey("sales.id"), nullable=False)
    recipe_id = Column(String, ForeignKey("recipes.id"))  # Opcional / Optional
    item_name = Column(String, nullable=False)
    quantity = Column(Integer, nullable=False, default=1)
    unit_price = Column(Float, nullable=False)
    total = Column(Float, nullable=False)
```

**Relaciones / Relationships**:
- `sale`: Many-to-One con `Sale`
- `recipe`: Many-to-One con `Recipe` (opcional)

---

### 16. Promotion (Promociones) / Promotions Table

**Ubicación**: `app/models/promotion.py`  
**Tabla**: `promotions`

**Descripción en Español**:  
Sistema de promociones y descuentos con múltiples tipos (porcentaje, monto fijo, compra X lleva Y) y aplicabilidad flexible.

**Description in English**:  
Promotion and discount system with multiple types (percentage, fixed amount, buy X get Y) and flexible applicability.

```python
class Promotion(Base):
    __tablename__ = "promotions"
    
    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(Text)
    discount_type = Column(String, nullable=False)  # percentage, fixed_amount, buy_x_get_y
    discount_value = Column(Float, nullable=False)  # Porcentaje o monto / Percentage or amount
    min_purchase = Column(Float)  # Compra mínima / Minimum purchase
    max_discount = Column(Float)  # Descuento máximo / Maximum discount
    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime, nullable=False)
    is_active = Column(Boolean, default=True)
    applicable_to = Column(String)  # all, recipes, categories, specific_items
    applicable_ids = Column(JSON)  # IDs específicos / Specific IDs
    location_id = Column(String, ForeignKey("business_locations.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    user_id = Column(String, ForeignKey("users.id"))
```

**Relaciones / Relationships**:
- `location`: Many-to-One con `BusinessLocation`
- `sale_discounts`: One-to-Many con `SaleDiscount`

---

### 17. SaleDiscount (Descuentos Aplicados) / Sale Discounts Table

**Ubicación**: `app/models/promotion.py`  
**Tabla**: `sale_discounts`

**Descripción en Español**:  
Registra descuentos aplicados a ventas, ya sea por promoción, manual o programa de lealtad.

**Description in English**:  
Records discounts applied to sales, whether from promotion, manual, or loyalty program.

```python
class SaleDiscount(Base):
    __tablename__ = "sale_discounts"
    
    id = Column(String, primary_key=True, index=True)
    sale_id = Column(String, ForeignKey("sales.id"), nullable=False)
    promotion_id = Column(String, ForeignKey("promotions.id"))  # Opcional / Optional
    discount_type = Column(String, nullable=False)  # promotion, manual, loyalty
    discount_amount = Column(Float, nullable=False)
    reason = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    user_id = Column(String, ForeignKey("users.id"))
```

**Relaciones / Relationships**:
- `sale`: Many-to-One con `Sale`
- `promotion`: Many-to-One con `Promotion` (opcional)

---

### 18. Role (Roles) / Roles Table

**Ubicación**: `app/models/role.py`  
**Tabla**: `roles`

**Descripción en Español**:  
Roles del sistema (admin, manager, cashier, cook, waiter) con soporte para roles personalizados.

**Description in English**:  
System roles (admin, manager, cashier, cook, waiter) with support for custom roles.

```python
class Role(Base):
    __tablename__ = "roles"
    
    id = Column(String, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False, index=True)  # admin, manager, cashier, cook, waiter
    description = Column(Text)
    is_system = Column(Boolean, default=False)  # No se puede eliminar / Cannot be deleted
    created_at = Column(DateTime, default=datetime.utcnow)
```

**Relaciones / Relationships**:
- `users`: One-to-Many con `UserRole`
- `permissions`: One-to-Many con `RolePermission`

---

### 19. Permission (Permisos) / Permissions Table

**Ubicación**: `app/models/role.py`  
**Tabla**: `permissions`

**Descripción en Español**:  
Permisos granulares del sistema (inventory.create, sales.delete, etc.) organizados por recurso y acción.

**Description in English**:  
Granular system permissions (inventory.create, sales.delete, etc.) organized by resource and action.

```python
class Permission(Base):
    __tablename__ = "permissions"
    
    id = Column(String, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False, index=True)  # inventory.create, sales.delete
    resource = Column(String, nullable=False)  # inventory, sales, recipes
    action = Column(String, nullable=False)  # create, read, update, delete, export
    description = Column(Text)
```

**Relaciones / Relationships**:
- `roles`: One-to-Many con `RolePermission`

---

### 20. RolePermission (Permisos de Roles) / Role Permissions Table

**Ubicación**: `app/models/role.py`  
**Tabla**: `role_permissions`

**Descripción en Español**:  
Tabla de unión que asigna permisos a roles. Constraint único en (role_id, permission_id).

**Description in English**:  
Junction table that assigns permissions to roles. Unique constraint on (role_id, permission_id).

```python
class RolePermission(Base):
    __tablename__ = "role_permissions"
    
    id = Column(String, primary_key=True, index=True)
    role_id = Column(String, ForeignKey("roles.id"), nullable=False)
    permission_id = Column(String, ForeignKey("permissions.id"), nullable=False)
    
    __table_args__ = (UniqueConstraint('role_id', 'permission_id'),)
```

---

### 21. UserRole (Roles de Usuario) / User Roles Table

**Ubicación**: `app/models/role.py`  
**Tabla**: `user_roles`

**Descripción en Español**:  
Asigna roles a usuarios con soporte para roles específicos por sucursal. Un usuario puede tener múltiples roles.

**Description in English**:  
Assigns roles to users with support for location-specific roles. A user can have multiple roles.

```python
class UserRole(Base):
    __tablename__ = "user_roles"
    
    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    role_id = Column(String, ForeignKey("roles.id"), nullable=False)
    location_id = Column(String, ForeignKey("business_locations.id"))  # Rol por sucursal / Location-specific role
    assigned_at = Column(DateTime, default=datetime.utcnow)
    assigned_by = Column(String, ForeignKey("users.id"))
    
    __table_args__ = (UniqueConstraint('user_id', 'role_id', 'location_id'),)
```

**Relaciones / Relationships**:
- `user`: Many-to-One con `User`
- `role`: Many-to-One con `Role`
- `location`: Many-to-One con `BusinessLocation` (opcional)
- `assigner`: Many-to-One con `User` (assigned_by)

---

### 22. ChatbotLog (Logs del Chatbot) / Chatbot Logs Table

**Ubicación**: `app/models/chatbot_log.py`  
**Tabla**: `chatbot_logs`

**Descripción en Español**:  
Registra todas las interacciones con el chatbot para análisis, mejora del modelo de IA y métricas de satisfacción.

**Description in English**:  
Records all chatbot interactions for analysis, AI model improvement, and satisfaction metrics.

```python
class ChatbotLog(Base):
    __tablename__ = "chatbot_logs"
    
    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"))
    session_id = Column(String, index=True)  # Para agrupar conversaciones / Group conversations
    message = Column(Text, nullable=False)
    response = Column(Text, nullable=False)
    intent = Column(String)  # Clasificación de intención / Intent classification
    confidence = Column(Float)  # Confianza de la respuesta / Response confidence
    log_metadata = Column(JSON)  # Datos adicionales / Additional data
    response_time_ms = Column(Integer)  # Tiempo de respuesta / Response time
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
```

**Relaciones / Relationships**:
- `user`: Many-to-One con `User`

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

---

## Mejoras Implementadas

### ✅ Funcionalidades Completadas

#### 1. Sistema Multi-Sucursal
- ✅ Tabla `business_locations` implementada
- ✅ Soporte para múltiples ubicaciones
- ✅ Inventario, recetas y ventas por sucursal
- ✅ Usuarios con ubicación por defecto
- ✅ Roles específicos por sucursal

#### 2. Gestión de Proveedores
- ✅ Tabla `suppliers` implementada
- ✅ Información de contacto completa
- ✅ Calificación de proveedores (1-5 estrellas)
- ✅ Términos de pago
- ✅ Vinculación con items de inventario

#### 3. Sistema de Unidades de Medida
- ✅ Tabla `units` implementada
- ✅ Soporte para conversiones automáticas
- ✅ Tipos: peso, volumen, pieza, personalizado
- ✅ Factores de conversión a unidad base
- ✅ Vinculación con inventario y recetas

#### 4. Historial de Precios
- ✅ Tabla `inventory_cost_history` implementada
- ✅ Registro de todos los cambios de precio
- ✅ Razones de cambio (compra, ajuste, inflación, estacional)
- ✅ Vinculación con proveedores
- ✅ Soporte para análisis histórico y predicciones de IA

#### 5. Movimientos de Inventario
- ✅ Tabla `inventory_movements` implementada
- ✅ Tipos: ENTRADA, SALIDA, AJUSTE, MERMA, CADUCIDAD, ROBO, TRANSFERENCIA
- ✅ Auditoría completa de movimientos
- ✅ Referencias a ventas, compras, ajustes
- ✅ Costo al momento del movimiento

#### 6. Versionado de Recetas
- ✅ Tabla `recipe_versions` implementada
- ✅ Historial completo de cambios
- ✅ Razones de cambio (precio, ingredientes, presentación)
- ✅ Solo una versión activa por receta
- ✅ Soporte para auditoría

#### 7. Preparaciones Intermedias
- ✅ Tabla `recipe_components` implementada
- ✅ Recetas que usan otras recetas como ingredientes
- ✅ Cálculo de costos en cascada
- ✅ Ejemplo: "Anticucho" usa "Salsa para Anticucho"

#### 8. Órdenes de Compra
- ✅ Tablas `purchase_orders` y `purchase_order_items` implementadas
- ✅ Gestión completa de compras a proveedores
- ✅ Estados: PENDIENTE, APROBADA, RECIBIDA, CANCELADA
- ✅ Seguimiento de cantidad solicitada vs recibida
- ✅ Fechas de entrega esperadas y reales

#### 9. Sistema de Promociones
- ✅ Tablas `promotions` y `sale_discounts` implementadas
- ✅ Tipos: porcentaje, monto fijo, compra X lleva Y
- ✅ Aplicabilidad flexible (todos, recetas, categorías, items específicos)
- ✅ Descuentos máximos y compras mínimas
- ✅ Promociones por sucursal
- ✅ Registro de descuentos aplicados

#### 10. Roles y Permisos
- ✅ Tablas `roles`, `permissions`, `role_permissions`, `user_roles` implementadas
- ✅ Sistema granular de permisos (recurso.acción)
- ✅ Roles predefinidos: admin, manager, cashier, cook, waiter
- ✅ Roles personalizados
- ✅ Permisos específicos por sucursal
- ✅ Roles del sistema protegidos

#### 11. Ventas Mejoradas
- ✅ Campos adicionales en `sales`:
  - `sale_number`: Número de venta legible
  - `location_id`: Sucursal
  - `table_number`: Mesa
  - `waiter_id`: Mesero
  - `sale_type`: LOCAL, DELIVERY, TAKEAWAY
  - `delivery_service`: Servicio de delivery
  - `customer_name` y `customer_phone`: Datos del cliente
  - `discount_amount`: Descuento total
  - `status`: COMPLETED, CANCELLED, REFUNDED

#### 12. Inventario Mejorado
- ✅ Campos adicionales en `inventory_items`:
  - `unit_id`: FK a tabla units
  - `supplier_id`: FK a tabla suppliers
  - `location_id`: FK a business_locations
  - `max_stock`: Stock máximo recomendado
  - `expiry_date`: Fecha de caducidad
  - `barcode`: Código de barras
  - `popularity_score`: Basado en uso
  - `seasonal_factor`: Factores estacionales (JSON)
  - `demand_forecast`: Predicción de demanda

#### 13. Recetas Mejoradas
- ✅ Campos adicionales en `recipes`:
  - `subcategory`: Subcategoría (Carnes Rojas, Carnes Blancas)
  - `location_id`: Sucursal
  - `is_available`: Disponible para venta
  - `popularity_score`: Basado en ventas
  - `current_version`: Versión actual

#### 14. Logs del Chatbot
- ✅ Tabla `chatbot_logs` implementada
- ✅ Registro de todas las interacciones
- ✅ Agrupación por sesión
- ✅ Clasificación de intenciones
- ✅ Nivel de confianza
- ✅ Tiempo de respuesta
- ✅ Metadatos adicionales (JSON)

#### 15. Usuarios Mejorados
- ✅ Campos adicionales en `users`:
  - `phone`: Teléfono de contacto
  - `default_location_id`: Sucursal por defecto
  - `last_login`: Último acceso

---

## Mejoras Pendientes

### 🔄 Funcionalidades en Desarrollo

#### 1. Autenticación y Seguridad
- [ ] Autenticación JWT completa
- [ ] Refresh tokens
- [ ] Recuperación de contraseña
- [ ] Verificación de email
- [ ] Autenticación de dos factores (2FA)
- [ ] Rate limiting por usuario/IP
- [ ] Logs de seguridad y auditoría

#### 2. Integraciones
- [ ] Integración con sistemas de pago (Stripe, PayPal, etc.)
- [ ] API de facturación electrónica (SUNAT para Bolivia)
- [ ] Integración con servicios de delivery (PedidosYa, Ahora, etc.)
- [ ] Sincronización con sistemas POS externos
- [ ] Exportación a sistemas contables

#### 3. Reportes Avanzados
- [ ] Exportación de reportes a PDF
- [ ] Reportes programados (email automático)
- [ ] Dashboards personalizables
- [ ] Análisis predictivo avanzado
- [ ] Comparativas entre períodos
- [ ] Reportes por sucursal comparativos

#### 4. Optimización y Performance
- [ ] Cache con Redis
- [ ] Índices adicionales para consultas frecuentes
- [ ] Vistas materializadas para reportes
- [ ] Paginación optimizada
- [ ] Compresión de respuestas
- [ ] CDN para assets estáticos

#### 5. Notificaciones en Tiempo Real
- [ ] WebSockets para notificaciones
- [ ] Notificaciones push
- [ ] Alertas de stock crítico en tiempo real
- [ ] Notificaciones de nuevas ventas
- [ ] Sistema de mensajería interna

#### 6. Funcionalidades de IA
- [ ] Predicción de demanda mejorada
- [ ] Sugerencias de precios dinámicos
- [ ] Análisis de sentimiento en comentarios
- [ ] Recomendaciones de menú personalizadas
- [ ] Detección de anomalías en ventas
- [ ] Optimización automática de inventario

#### 7. Gestión Avanzada
- [ ] Transferencias entre sucursales
- [ ] Ajustes de inventario masivos
- [ ] Importación/exportación de datos (CSV, Excel)
- [ ] Plantillas de recetas
- [ ] Menús estacionales
- [ ] Gestión de comandas de cocina

#### 8. Testing y Calidad
- [ ] Tests unitarios completos
- [ ] Tests de integración
- [ ] Tests end-to-end
- [ ] Cobertura de código > 80%
- [ ] Tests de carga y performance
- [ ] Tests de seguridad

#### 9. Documentación
- [ ] Documentación de API mejorada
- [ ] Guías de integración
- [ ] Tutoriales en video
- [ ] Documentación de deployment
- [ ] Runbooks operacionales

#### 10. Mobile y Apps
- [ ] API móvil optimizada
- [ ] App para meseros (tablet)
- [ ] App para cocina
- [ ] App para administradores
- [ ] Notificaciones push móviles

---

## Diagrama de Relaciones Completo

```
┌─────────────┐
│    Users    │
└──────┬──────┘
       │
       ├──> UserRoles ──> Roles ──> RolePermissions ──> Permissions
       ├──> ChatbotLogs
       ├──> Sales (waiter_id, user_id)
       └──> DefaultLocation ──> BusinessLocations

┌─────────────┐
│BusinessLocs │
└──────┬──────┘
       │
       ├──> InventoryItems
       ├──> Recipes
       ├──> Sales
       ├──> InventoryMovements
       ├──> UserRoles (location-specific)
       ├──> Promotions
       └──> PurchaseOrders

┌─────────────┐
│  Suppliers  │
└──────┬──────┘
       │
       ├──> InventoryItems
       ├──> PurchaseOrders
       └──> InventoryCostHistory

┌─────────────┐
│    Units    │
└──────┬──────┘
       │
       ├──> InventoryItems
       └──> RecipeIngredients

┌─────────────┐
│InventoryItems│
└──────┬───────┘
       │
       ├──> Unit (unit_id)
       ├──> Supplier (supplier_id)
       ├──> BusinessLocation (location_id)
       ├──> InventoryCostHistory
       ├──> InventoryMovements
       ├──> RecipeIngredients
       └──> PurchaseOrderItems

┌─────────────┐
│   Recipes   │
└──────┬──────┘
       │
       ├──> BusinessLocation (location_id)
       ├──> RecipeVersions
       ├──> RecipeComponents (como recipe_id)
       ├──> RecipeComponents (como subrecipe_id)
       ├──> RecipeIngredients
       └──> SaleItems

┌─────────────┐
│    Sales    │
└──────┬──────┘
       │
       ├──> BusinessLocation (location_id)
       ├──> User (waiter_id)
       ├──> SaleItems ──> Recipes
       └──> SaleDiscounts ──> Promotions

┌─────────────┐
│ Promotions  │
└──────┬──────┘
       │
       ├──> BusinessLocation (location_id)
       └──> SaleDiscounts ──> Sales

┌─────────────┐
│PurchaseOrders│
└──────┬───────┘
       │
       ├──> Supplier
       ├──> BusinessLocation
       └──> PurchaseOrderItems ──> InventoryItems
```

---

## Conclusión

El backend de GastroSmart AI proporciona una API RESTful completa, robusta y bien documentada para gestionar todas las operaciones de un restaurante. Con la nueva estructura de base de datos mejorada, el sistema soporta:

✅ **Multi-sucursal** completo  
✅ **Historial completo** de precios y movimientos  
✅ **Versionado** de recetas para auditoría  
✅ **Preparaciones intermedias** para recetas complejas  
✅ **Sistema de unidades** con conversiones  
✅ **Gestión de proveedores** y órdenes de compra  
✅ **Promociones y descuentos** flexibles  
✅ **Roles y permisos** granulares  
✅ **Logs del chatbot** para análisis  
✅ **Campos para IA** (popularidad, estacionalidad, predicciones)

Con validaciones exhaustivas, integración con IA, y un sistema de alertas, está listo para uso en producción con las configuraciones de seguridad adecuadas.

---

**Versión del Documento**: 2.0.0  
**Última Actualización**: 2025-01-26  
**Autor**: Sistema GastroSmart AI

