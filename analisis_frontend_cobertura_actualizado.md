# 🎨 Análisis de Cobertura del Frontend - GastroSmart AI (Actualizado)

## Resumen Ejecutivo

> [!WARNING]
> **El frontend cubre aproximadamente el 45% de los requerimientos del backend**. Se han detectado mejoras en el módulo de **Ventas**, pero persisten vacíos críticos en la gestión de **Roles**, **Compras**, **Unidades** y **Movimientos de Inventario**.

---

## 📊 Estado Actual de Componentes

### Componentes Principales

| # | Componente | Estado | Cambios Recientes | Tablas Backend Cubiertas |
|---|-----------|--------|-------------------|-------------------------|
| 1 | **Dashboard** | ✅ Completo | - | Vistas agregadas |
| 2 | **Inventory** | ⚠️ Parcial | Sin cambios significativos | `inventory_items`, `inventory_movements` (lectura) |
| 3 | **Recipes** | ✅ Completo | - | `recipes`, `recipe_ingredients` |
| 4 | **Sales** | 🟡 Mejorado | ✅ Tipos de venta (Local/Delivery)<br>✅ Datos de cliente/delivery<br>❌ Sin integración con recetas | `sales`, `sale_items` |
| 5 | **BusinessLocations** | ✅ Completo | - | `business_locations` |
| 6 | **Suppliers** | ✅ Completo | - | `suppliers` |
| 7 | **Users** | ⚠️ Básico | Sin cambios (Solo Admin/Usuario) | `users` (sin roles granulares) |
| 8 | **Promotions** | ✅ Completo | - | `promotions` |
| 9 | **Reports** | ✅ Completo | - | Reportes agregados |
| 10 | **Settings** | ⚠️ Básico | - | Configuraciones generales |
| 11 | **Chatbot** | ✅ Completo | - | `chatbot_logs` |
| 12 | **Login** | ✅ Completo | - | Autenticación |

---

## 🔍 Análisis Detallado de Cambios y Brechas

### 💰 MÓDULO: Ventas (Sales.tsx)
**Estado: MEJORADO pero INCOMPLETO**

✅ **Lo Nuevo (Implementado):**
*   **Tipos de Venta**: Selector para `LOCAL`, `DELIVERY`, `TAKEAWAY`.
*   **Datos de Delivery**: Campos para `servicio_delivery` (PedidosYa, etc.), `nombre_cliente`, `telefono_cliente`.
*   **Datos de Local**: Campo para `numero_mesa`.

❌ **Lo que Falta (Crítico):**
*   **Integración con Recetas**: Los items siguen siendo texto libre (`Input`). No se pueden seleccionar platos del menú (`recipes`), lo que impide descontar inventario automáticamente y controlar precios.
*   **Selección de Mesero**: Aunque el backend lo soporta y el estado `formData` tiene `mesero_id`, **no existe el campo visual en el formulario** para seleccionar un mesero.
*   **Promociones**: No hay interfaz para aplicar las promociones creadas en `Promotions.tsx`.

### 📦 MÓDULO: Inventario (Inventory.tsx)
**Estado: ESTÁTICO (Faltan funciones de gestión)**

✅ **Lo que hay:**
*   CRUD de items completo.
*   Visualización de historial de movimientos.

❌ **Lo que Falta (Crítico):**
*   **Movimientos Manuales**: No hay interfaz para registrar **Mermas**, **Ajustes** o **Transferencias** entre sucursales. Solo se pueden ver movimientos pasados.
*   **Historial de Costos**: No existe la visualización de la evolución de precios (`inventory_cost_history`).
*   **Compras**: No existe el módulo de Órdenes de Compra (`purchase_orders`). El stock solo sube editando el item manualmente, lo cual no es escalable ni auditable.

### 👥 MÓDULO: Usuarios y Seguridad (Users.tsx)
**Estado: BÁSICO (Bloqueante para roles)**

❌ **Problema Persistente:**
*   El sistema sigue usando un modelo binario: `es_superusuario` (Sí/No).
*   **No existe gestión de Roles**: No se pueden crear roles como "Cajero", "Cocinero", "Mesero".
*   **No existe gestión de Permisos**: No hay matriz de permisos.
*   **Sin asignación por Sucursal**: Un usuario es admin o no, pero no se puede definir que sea "Cajero en Sucursal A" y "Mesero en Sucursal B".

### ⚙️ MÓDULO: Configuración
**Estado: INCOMPLETO**

❌ **Faltantes:**
*   **Unidades de Medida**: No hay interfaz para gestionar unidades (`units`). Se depende de las hardcodeadas.

---

## 📋 Recomendaciones de Acción Inmediata

### Prioridad 1: Integridad de Datos en Ventas
1.  **Refactorizar `Sales.tsx`**: Cambiar el input de items por un `Select` o `Combobox` que busque en `recipes`.
2.  **Agregar Selector de Mesero**: Añadir el dropdown de usuarios (filtrado por rol si existiera) al formulario de venta LOCAL.

### Prioridad 2: Gestión de Inventario Real
1.  **Crear Diálogo de Movimientos**: En `Inventory.tsx`, agregar botón "Registrar Movimiento" que permita crear entradas/salidas manuales (especialmente Mermas).
2.  **Crear Módulo de Compras**: Implementar `PurchaseOrders.tsx` para dar entrada formal al stock.

### Prioridad 3: Sistema de Roles
1.  **Crear `Roles.tsx`**: Permitir crear roles dinámicos.
2.  **Actualizar `Users.tsx`**: Reemplazar el switch `es_superusuario` por un selector de Roles.

## 📉 Resumen de Cobertura Numérica

| Módulo | Estado Anterior | Estado Actual | Tendencia |
|--------|-----------------|---------------|-----------|
| Ventas | 25% | 40% | ↗️ Mejora |
| Inventario | 20% | 20% | ➡️ Igual |
| Usuarios | 0% | 0% | ➡️ Igual |
| Configuración| 67% | 67% | ➡️ Igual |
| **Global** | **32%** | **35%** | ↗️ Leve Mejora |
