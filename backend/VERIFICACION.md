# 🔍 Guía de Verificación - GastroSmart AI

Esta guía te ayudará a verificar que todo el sistema está configurado y funcionando correctamente.

## 📋 Checklist de Verificación

### 1. ✅ Verificar Backend y Base de Datos

#### Opción A: Script Automático (Recomendado)

```bash
cd backend
source venv/bin/activate  # Windows: venv\Scripts\activate

# Verificar base de datos
python scripts/check_database.py

# Verificar API (necesita que el servidor esté corriendo)
python scripts/check_api.py

# Verificación completa
python scripts/verify_all.py
```

#### Opción B: Manual

**1.1. Verificar conexión a PostgreSQL:**

```bash
cd backend
source venv/bin/activate
python scripts/check_database.py
```

**1.2. Crear las tablas (si no existen):**

```bash
# Opción 1: Usar Alembic (recomendado)
alembic revision --autogenerate -m "Initial migration"
alembic upgrade head

# Opción 2: Crear directamente desde Python
python scripts/check_database.py
# Cuando pregunte, responde 's' para crear las tablas
```

**1.3. Verificar que el servidor esté corriendo:**

```bash
# En una terminal, inicia el servidor
cd backend
source venv/bin/activate
python run.py
```

**1.4. En otra terminal, verifica la API:**

```bash
cd backend
source venv/bin/activate
python scripts/check_api.py
```

### 2. ✅ Verificar Endpoints de la API

Una vez que el servidor esté corriendo, puedes verificar manualmente:

#### Health Check
```bash
curl http://localhost:8000/health
```

#### Database Status
```bash
curl http://localhost:8000/api/v1/health/database
```

#### Dashboard Stats
```bash
curl http://localhost:8000/api/v1/dashboard/stats
```

#### Chatbot
```bash
curl -X POST http://localhost:8000/api/v1/chatbot/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hola"}'
```

### 3. ✅ Verificar Frontend-Backend

**3.1. Inicia el frontend:**

```bash
cd frontend
npm install  # Solo la primera vez
npm run dev
```

**3.2. Verifica en el navegador:**

1. Abre `http://localhost:5173`
2. Abre las DevTools (F12)
3. Ve a la pestaña "Network"
4. Interactúa con la aplicación
5. Verifica que las requests a `http://localhost:8000` sean exitosas

**3.3. Prueba el Chatbot:**

1. Haz clic en el botón del chatbot (esquina inferior derecha)
2. Envía un mensaje
3. Verifica que recibas una respuesta

### 4. ✅ Verificación Completa Automática

Ejecuta el script de verificación completa (requiere que backend y frontend estén corriendo):

```bash
cd backend
source venv/bin/activate
python scripts/verify_all.py
```

## 🔧 Solución de Problemas

### Error: "No se puede conectar a PostgreSQL"

**Solución:**
1. Verifica que PostgreSQL esté corriendo:
   ```bash
   # macOS
   brew services list | grep postgresql
   
   # Linux
   sudo systemctl status postgresql
   ```

2. Verifica las credenciales en `.env`:
   ```bash
   cat backend/.env | grep DATABASE_URL
   ```

3. Crea la base de datos si no existe:
   ```bash
   createdb gastrosmart
   ```

### Error: "No hay tablas en la base de datos"

**Solución:**
```bash
cd backend
source venv/bin/activate
alembic upgrade head
```

O ejecuta:
```bash
python scripts/check_database.py
# Responde 's' cuando pregunte
```

### Error: "CORS no está configurado"

**Solución:**
Verifica que en `backend/.env` tengas:
```
CORS_ORIGINS=http://localhost:3000,http://localhost:5173
```

### Error: "Frontend no puede conectar con backend"

**Solución:**
1. Verifica que el backend esté corriendo en `http://localhost:8000`
2. Verifica que en `frontend/.env` tengas:
   ```
   VITE_API_BASE_URL=http://localhost:8000/api/v1
   ```
3. Verifica CORS en el backend

## 📊 Endpoints de Verificación

Una vez que todo esté corriendo, puedes acceder a:

- **API Root**: http://localhost:8000/
- **Health Check**: http://localhost:8000/health
- **Database Status**: http://localhost:8000/api/v1/health/database
- **API Docs (Swagger)**: http://localhost:8000/api/docs
- **API Docs (ReDoc)**: http://localhost:8000/api/redoc
- **Frontend**: http://localhost:5173

## ✅ Checklist Final

- [ ] PostgreSQL está corriendo
- [ ] Base de datos `gastrosmart` existe
- [ ] Tablas están creadas
- [ ] Backend está corriendo en puerto 8000
- [ ] Frontend está corriendo en puerto 5173
- [ ] Health check responde OK
- [ ] Database status muestra "connected"
- [ ] CORS está configurado
- [ ] Frontend puede hacer requests al backend
- [ ] Chatbot responde correctamente

## 🎉 ¡Todo Listo!

Si todas las verificaciones pasan, tu sistema está completamente configurado y funcionando. Puedes comenzar a desarrollar y usar la aplicación.

