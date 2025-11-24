# GastroSmart AI - Sistema Integral de Control Gastronómico con IA

Sistema completo para la gestión de negocios gastronómicos con integración de Inteligencia Artificial.

## 📋 Descripción

GastroSmart AI es una plataforma tecnológica que combina Inteligencia Artificial, análisis de datos y automatización inteligente para transformar la gestión operativa y financiera de los negocios gastronómicos en Bolivia.

## 🏗️ Arquitectura

El proyecto está dividido en dos partes principales:

### Backend (Python/FastAPI)
- **Ubicación**: `/backend`
- **Stack**: FastAPI, PostgreSQL/MongoDB, SQLAlchemy, OpenAI/LangChain
- **Puerto**: 8000
- **Documentación API**: http://localhost:8000/api/docs

### Frontend (React/TypeScript)
- **Ubicación**: `/frontend`
- **Stack**: React, TypeScript, Vite, Tailwind CSS, shadcn/ui
- **Puerto**: 5173 (desarrollo)

## 🚀 Inicio Rápido

### Prerrequisitos

- Python 3.9+ (para backend)
- Node.js 18+ y npm (para frontend)
- PostgreSQL o MongoDB (para base de datos)
- (Opcional) OpenAI API Key (para chatbot con IA)

### Backend

1. Navegar a la carpeta backend:
```bash
cd backend
```

2. Crear entorno virtual:
```bash
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
```

3. Instalar dependencias:
```bash
pip install -r requirements.txt
```

4. Configurar variables de entorno:
```bash
cp .env.example .env
# Editar .env con tus configuraciones
```

5. Ejecutar servidor:
```bash
python run.py
```

El backend estará disponible en `http://localhost:8000`

### Frontend

1. Navegar a la carpeta frontend:
```bash
cd frontend
```

2. Instalar dependencias:
```bash
npm install
```

3. Configurar variables de entorno:
```bash
cp .env.example .env
```

4. Ejecutar en desarrollo:
```bash
npm run dev
```

El frontend estará disponible en `http://localhost:5173`

## 📁 Estructura del Proyecto

```
GastroSmart AI Project Overview/
├── backend/                 # Backend Python/FastAPI
│   ├── app/
│   │   ├── api/            # Endpoints de la API
│   │   ├── core/           # Configuración y base de datos
│   │   ├── models/         # Modelos de base de datos
│   │   ├── schemas/        # Esquemas Pydantic
│   │   └── services/       # Lógica de negocio (AI, etc.)
│   ├── requirements.txt
│   ├── .env.example
│   └── run.py
│
├── frontend/               # Frontend React/TypeScript
│   ├── src/
│   │   ├── components/     # Componentes React
│   │   ├── services/       # Servicios de API
│   │   └── ...
│   ├── package.json
│   └── vite.config.ts
│
└── README.md
```

## 🎨 Diseño y Colores

El proyecto mantiene un diseño oscuro consistente:

- **Background principal**: `#020617`
- **Color primario/accent**: `#209C8A` (verde turquesa)
- **Texto**: Blanco con diferentes opacidades
- **Cards**: Fondo semitransparente con bordes del color primario

## 🤖 Chatbot con IA

El chatbot utiliza OpenAI (configurable) para responder preguntas sobre el negocio en lenguaje natural. Si no se proporciona una API key, el sistema usa respuestas basadas en reglas como fallback.

### Configurar IA

1. Obtener API key de OpenAI: https://platform.openai.com/api-keys
2. Agregar al archivo `backend/.env`:
```
OPENAI_API_KEY=tu-api-key-aqui
```

## 🗄️ Base de Datos

El sistema soporta tanto PostgreSQL como MongoDB. Configura el tipo en `backend/.env`:

```env
DATABASE_TYPE=postgresql  # o mongodb
DATABASE_URL=postgresql://user:password@localhost:5432/gastrosmart
```

## 📚 Documentación

- **Backend API**: http://localhost:8000/api/docs (Swagger UI)
- **Backend ReDoc**: http://localhost:8000/api/redoc
- Ver `backend/README.md` para más detalles del backend
- Ver `frontend/README.md` para más detalles del frontend

## 🔧 Características Principales

- ✅ Dashboard con estadísticas en tiempo real
- ✅ Gestión de inventario con alertas automáticas
- ✅ Gestión de recetas con cálculo de costos
- ✅ Registro de ventas
- ✅ Chatbot inteligente con IA
- ✅ Reportes y análisis
- ✅ API REST completa
- ✅ Diseño responsive

## 🛠️ Tecnologías Utilizadas

### Backend
- FastAPI
- SQLAlchemy / Motor
- PostgreSQL / MongoDB
- OpenAI / LangChain
- Pydantic

### Frontend
- React 18
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui
- Recharts

## 📝 Próximos Pasos

- [ ] Implementar autenticación de usuarios
- [ ] Completar endpoints CRUD con queries reales
- [ ] Agregar migraciones de base de datos
- [ ] Mejorar integración del chatbot con datos reales
- [ ] Agregar tests unitarios e integración
- [ ] Implementar caché y optimizaciones

## 👥 Equipo

- Quispe Ortiz Luis Alfredo
- Yujra Chipana Amilcar Josias
- Quispe Mamani Juan Gabriel
- Leon Guzman Mabel
- Gomez Ramos Jose Guadalupe
- Macias Quispe Alejandro Sergio

## 📄 Licencia

Este proyecto es parte del curso de Emprendimiento e Innovación Tecnológica de la Universidad Mayor de San Andrés.

---

**Docente**: Lic. Juan Cayoja Cortez  
**Materia**: Emprendimiento e Innovación Tecnológica  
**Fecha**: 20/10/2025  
**La Paz - Bolivia**
