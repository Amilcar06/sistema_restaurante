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

### 5. Inicializar la Base de Datos y Datos Demo

El proyecto incluye dos opciones de inicialización: una básica y una completa para demostración ("Parrillada El Buen Gusto").

#### Opción A: Modo Demo "Beef & Beer" (Recomendado)
Esta opción carga un restaurante completo con menú de parrillada y cerveza, inventario detallado y **300 ventas históricas**.

```bash
# Ejecutar script de demo (Recrea tablas y datos)
python scripts/seed_beef_and_beer.py
```

> **🔑 Credenciales Demo (Beef & Beer):**
> - **Admin (Dueño)**: `admin@beefandbeer.bo` / `admin123`
> - **Gerente**: `gerente@beefandbeer.bo` / `gerente123`
> - **Chef**: `chef@beefandbeer.bo` / `chef123`
> - **Cajero**: `cajero@beefandbeer.bo` / `cajero123`

#### Opción B: Instalación Limpia (Solo Admin)
Usa esta opción si quieres empezar tu propio restaurante desde cero.

```bash
# 1. Reiniciar tablas
python scripts/reset_db_spanish.py

# 2. Cargar datos base (Roles y Admin)
python scripts/seed_spanish.py
```

> **Credenciales Base:** `admin@gastrosmart.ai` / `admin123`

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
2.  Inicia sesión con las credenciales de la demo (`admin@beefandbeer.bo` / `admin123`).
3.  **Dashboard**: Deberías ver gráficos de ventas y alertas de stock (no vacío).
4.  **Chatbot**: Abre el chat (esquina inferior derecha) y pregunta "¿Cuánto vendí hoy?".
5.  **Recetas/Inventario**: Navega para ver los datos precargados de carnes y bebidas.

## 🛠️ Solución de Problemas Comunes

-   **Error de conexión a BD**: Verifica que PostgreSQL esté corriendo y que las credenciales en `backend/.env` sean correctas.
-   **Error CORS**: Asegúrate de que `http://localhost:5173` esté en la lista `CORS_ORIGINS` en `backend/.env`.
-   **Error 422 en Login**: Asegúrate de estar usando el frontend actualizado que envía los datos como `FormData` correctamente.
