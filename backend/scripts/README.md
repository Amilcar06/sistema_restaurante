# Scripts de Verificación

Scripts útiles para verificar que el sistema está configurado correctamente.

## Scripts Disponibles

### 1. `check_database.py`
Verifica la conexión a PostgreSQL y crea las tablas si no existen.

```bash
cd backend
source venv/bin/activate
python scripts/check_database.py
```

**Qué verifica:**
- ✅ Conexión a PostgreSQL
- ✅ Versión de PostgreSQL
- ✅ Existencia de tablas
- ✅ Crea tablas si no existen

### 2. `check_api.py`
Verifica que la API esté funcionando correctamente (requiere que el servidor esté corriendo).

```bash
# Terminal 1: Inicia el servidor
cd backend
source venv/bin/activate
python run.py

# Terminal 2: Verifica la API
cd backend
source venv/bin/activate
python scripts/check_api.py
```

**Qué verifica:**
- ✅ Servidor está corriendo
- ✅ Endpoints principales funcionan
- ✅ Configuración CORS
- ✅ Chatbot responde

### 3. `verify_all.py` ⭐ (Recomendado)
Verificación completa del sistema (backend, base de datos, API, frontend-backend).

```bash
# Asegúrate de que backend y frontend estén corriendo
cd backend
source venv/bin/activate
python scripts/verify_all.py
```

**Qué verifica:**
- ✅ Servidor backend
- ✅ Conexión a PostgreSQL
- ✅ Endpoints API
- ✅ Configuración CORS
- ✅ Comunicación frontend-backend

## Uso Rápido

Para una verificación rápida completa:

```bash
# 1. Verificar base de datos
python scripts/check_database.py

# 2. Iniciar servidor (en otra terminal)
python run.py

# 3. Verificar todo
python scripts/verify_all.py
```

