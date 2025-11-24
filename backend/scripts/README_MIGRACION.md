# 📋 Guía de Migración de Base de Datos

## Pasos para Aplicar los Cambios

### 1. Activar Entorno Virtual

```bash
cd backend
source venv/bin/activate
```

### 2. Aplicar Migraciones de Alembic

```bash
# Aplicar todas las migraciones pendientes
alembic upgrade head
```

### 3. Ejecutar Script de Migración de Datos

```bash
# Este script creará:
# - Ubicación por defecto
# - Unidades base
# - Asignará location_id a items, recetas y ventas existentes
# - Creará entradas en cost_history
python scripts/migrate_data.py
```

### 4. (Opcional) Hacer location_id NOT NULL

Después de migrar los datos, puedes crear una migración adicional para hacer `location_id` NOT NULL:

```bash
alembic revision -m "Make location_id NOT NULL after data migration"
```

Luego editar la migración para agregar:

```python
def upgrade():
    # Hacer location_id NOT NULL después de migrar datos
    op.alter_column('inventory_items', 'location_id', nullable=False)
    op.alter_column('sales', 'location_id', nullable=False)
    op.alter_column('sales', 'sale_type', nullable=False, server_default='LOCAL')
    op.alter_column('sales', 'status', nullable=False, server_default='COMPLETED')
```

## Verificación

Después de aplicar las migraciones, verifica:

1. **Ubicación por defecto creada**:
   ```bash
   python -c "from app.core.database import SessionLocal; from app.models.business_location import BusinessLocation; db = SessionLocal(); loc = db.query(BusinessLocation).filter(BusinessLocation.is_main == True).first(); print(f'Ubicación: {loc.name if loc else \"No encontrada\"}'); db.close()"
   ```

2. **Unidades creadas**:
   ```bash
   python -c "from app.core.database import SessionLocal; from app.models.unit import Unit; db = SessionLocal(); units = db.query(Unit).count(); print(f'Unidades: {units}'); db.close()"
   ```

3. **Items con location_id**:
   ```bash
   python -c "from app.core.database import SessionLocal; from app.models.inventory import InventoryItem; db = SessionLocal(); items = db.query(InventoryItem).filter(InventoryItem.location_id != None).count(); total = db.query(InventoryItem).count(); print(f'Items con location_id: {items}/{total}'); db.close()"
   ```

## Solución de Problemas

### Error: "location_id cannot be null"

Si obtienes este error, significa que hay datos existentes sin `location_id`. Ejecuta el script de migración de datos primero.

### Error: "psycopg2 not found"

Asegúrate de estar en el entorno virtual:
```bash
source venv/bin/activate
pip install -r requirements.txt
```

### Error: "metadata is reserved"

Ya corregido: el campo `metadata` en `ChatbotLog` fue renombrado a `log_metadata`.

---

**Nota**: Si tienes datos de producción, haz un backup antes de ejecutar las migraciones.

