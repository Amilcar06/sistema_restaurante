# GastroSmart AI - Backend

Backend API para el Sistema Integral de Control Gastronómico con IA.

## Stack Tecnológico

- **FastAPI**: Framework web moderno y rápido para Python
- **PostgreSQL/MongoDB**: Base de datos (configurable)
- **SQLAlchemy**: ORM para PostgreSQL
- **Motor/PyMongo**: Drivers para MongoDB
- **OpenAI/LangChain**: Integración con IA para el chatbot
- **Pydantic**: Validación de datos y esquemas

## Instalación

1. Crear un entorno virtual:
```bash
python -m venv venv
source venv/bin/activate  # En Windows: venv\Scripts\activate
```

2. Instalar dependencias:
```bash
pip install -r requirements.txt
```

3. Configurar variables de entorno:
```bash
cp .env.example .env
# Editar .env con tus configuraciones
```

4. Configurar base de datos:

**Para PostgreSQL:**
```bash
# Crear base de datos
createdb gastrosmart

# Ejecutar migraciones (cuando estén listas)
alembic upgrade head
```

**Para MongoDB:**
```bash
# Asegúrate de tener MongoDB corriendo
mongod
```

## Ejecutar el servidor

```bash
python run.py
```

O con uvicorn directamente:
```bash
uvicorn app.main:app --reload --port 8000
```

El servidor estará disponible en `http://localhost:8000`

## Documentación API

Una vez que el servidor esté corriendo, puedes acceder a:
- Swagger UI: `http://localhost:8000/api/docs`
- ReDoc: `http://localhost:8000/api/redoc`

## Estructura del Proyecto

```
backend/
├── app/
│   ├── api/           # Endpoints de la API
│   ├── core/          # Configuración y base de datos
│   ├── models/        # Modelos de base de datos (SQLAlchemy)
│   ├── schemas/       # Esquemas Pydantic
│   └── services/      # Lógica de negocio (AI, etc.)
├── requirements.txt
├── .env.example
└── run.py
```

## Configuración de IA

Para usar el chatbot con IA real, necesitas:

1. Obtener una API key de OpenAI: https://platform.openai.com/api-keys
2. Agregarla al archivo `.env`:
```
OPENAI_API_KEY=tu-api-key-aqui
```

Si no tienes API key, el sistema usará respuestas basadas en reglas como fallback.

## Próximos Pasos

- [ ] Implementar autenticación de usuarios
- [ ] Completar endpoints CRUD para inventario, recetas y ventas
- [ ] Implementar queries reales a la base de datos
- [ ] Agregar migraciones de base de datos con Alembic
- [ ] Mejorar integración del chatbot con datos reales del negocio
- [ ] Agregar tests unitarios e integración

