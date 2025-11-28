# Guía de Instalación y Despliegue - GastroSmart AI

Esta guía detalla los pasos necesarios para levantar el proyecto completo (Backend y Frontend) en un entorno local.

## 📋 Prerrequisitos

Asegúrate de tener instalado lo siguiente:

1.  **Python 3.9+**: [Descargar Python](https://www.python.org/downloads/)
2.  **Node.js 18+ y npm**: [Descargar Node.js](https://nodejs.org/)
3.  **PostgreSQL**: [Descargar PostgreSQL](https://www.postgresql.org/download/) (Recomendado v14+)
4.  **Git**: [Descargar Git](https://git-scm.com/)

---

## 🔧 Configuración del Backend

### 1. Clonar el repositorio (si no lo has hecho)
```bash
git clone https://github.com/Amilcar06/sistema_restaurante.git
cd sistema_restaurante
```

### 2. Preparar el entorno Python
Navega a la carpeta del backend:
```bash
cd backend
```

Crea un entorno virtual:
```bash
# Windows
python -m venv venv
venv\Scripts\activate

# macOS/Linux
python3 -m venv venv
source venv/bin/activate
```

### 3. Instalar dependencias
```bash
pip install -r requirements.txt
```

### 4. Configurar variables de entorno
Crea un archivo `.env` basado en el ejemplo:
```bash
cp .env.example .env
```

Edita el archivo `.env` con tus credenciales. Asegúrate de configurar la base de datos y el correo (opcional para desarrollo, requerido para recuperación de contraseña):

```env
# Base de Datos
DATABASE_URL=postgresql://usuario:password@localhost:5432/gastrosmart
DATABASE_TYPE=postgresql

# Configuración General
API_V1_PREFIX=/api/v1
SECRET_KEY=tu_clave_secreta_segura
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Email (SMTP) - Necesario para "Olvidé mi contraseña"
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu_email@gmail.com
SMTP_PASSWORD=tu_app_password
EMAILS_FROM_EMAIL=info@gastrosmart.ai
```

### 5. Inicializar la Base de Datos
Ejecuta los scripts para crear las tablas y poblar datos iniciales (roles, permisos, usuario admin):

```bash
# 1. Reiniciar/Crear tablas (¡Cuidado! Borra datos existentes)
python scripts/reset_db_spanish.py

# 2. Cargar datos semilla (Roles, Permisos, Admin)
python scripts/seed_spanish.py
```

> **Credenciales por defecto creadas:**
> - **Email**: `admin@gastrosmart.ai`
> - **Password**: `admin123`

### 6. Ejecutar el servidor
```bash
python run.py
```
El backend estará corriendo en `http://localhost:8000`.

---

## 💻 Configuración del Frontend

### 1. Preparar el entorno Node
Abre una nueva terminal y navega a la carpeta del frontend:
```bash
cd frontend
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar variables de entorno
Crea un archivo `.env` (o `.env.local`):
```bash
cp .env.example .env
```
Asegúrate de que la URL del backend sea correcta:
```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

### 4. Ejecutar en modo desarrollo
```bash
npm run dev
```
El frontend estará disponible en `http://localhost:5173`.

---

## ✅ Verificación

1.  Abre tu navegador en `http://localhost:5173`.
2.  Inicia sesión con las credenciales por defecto (`admin@gastrosmart.ai` / `admin123`).
3.  Deberías ver el Dashboard principal.
4.  Prueba navegar a "Recetas" o "Inventario" para verificar la conexión con la base de datos.

## 🛠️ Solución de Problemas Comunes

-   **Error de conexión a BD**: Verifica que PostgreSQL esté corriendo y que las credenciales en `backend/.env` sean correctas.
-   **Error CORS**: Asegúrate de que `http://localhost:5173` esté en la lista `CORS_ORIGINS` en `backend/.env`.
-   **Error 422 en Login**: Asegúrate de estar usando el frontend actualizado que envía los datos como `FormData` correctamente.
