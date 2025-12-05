# GastroSmart AI - Sistema Integral de Control Gastronómico con IA

Sistema completo para la gestión de negocios gastronómicos con integración de Inteligencia Artificial, diseñado para optimizar la gestión operativa y financiera.

## 📋 Descripción

GastroSmart AI es una plataforma tecnológica que combina Inteligencia Artificial, análisis de datos y automatización inteligente para transformar la gestión de restaurantes. Permite el control de inventarios, recetas, ventas, personal y reportes financieros, todo potenciado por un asistente virtual inteligente.

## 🚀 Características Principales

- **Dashboard Interactivo**: Métricas clave en tiempo real (Ventas, Inventario, Costos).
- **Chatbot IA Inteligente**: Asistente "ChefBot" integrado (Python/FastAPI) que responde sobre tu negocio usando datos reales (Ventas del día, Alertas de Stock, Rentabilidad).
- **Gestión de Inventario**: Control de stock e insumos.
- **Ventas y Pedidos**: Registro de ordenes y métodos de pago.
- **Recetas y Costos**: Cálculo de márgenes y gestión de menú.
- **Modo Demo**: Script de seeding con datos realistas para "Parrillada El Buen Gusto".
- **Punto de Venta (POS)**: Registro ágil de ventas y control de caja.
- **Roles y Permisos**: Sistema robusto de autenticación y autorización con roles personalizables.
- **Chatbot con IA**: Asistente virtual para consultas sobre el negocio en lenguaje natural.
- **Reportes Avanzados**: Análisis de ventas, rendimiento de categorías y proyecciones.
- **Gestión de Personal**: Administración de usuarios, roles y asignación de sucursales.

## 🏗️ Arquitectura

El proyecto utiliza una arquitectura moderna y escalable:

### Backend (Python/FastAPI)
- **Framework**: FastAPI (Alto rendimiento, asíncrono)
- **Base de Datos**: PostgreSQL (Principal) / MongoDB (Opcional)
- **ORM**: SQLAlchemy
- **IA**: OpenAI API / LangChain
- **Seguridad**: OAuth2 con JWT (Tokens firmados)
- **Email**: Servicio SMTP integrado

### Frontend (React/TypeScript)
- **Framework**: React 18 con Vite
- **Lenguaje**: TypeScript
- **Estilos**: Tailwind CSS + shadcn/ui
- **Gráficos**: Recharts
- **Estado**: Context API + Hooks personalizados

## 📚 Documentación

- **Guía de Instalación Detallada**: Ver [GUIA_INSTALACION.md](./GUIA_INSTALACION.md) para instrucciones paso a paso de despliegue.
- **API Docs**: `http://localhost:8000/api/docs` (Swagger UI)
- **API ReDoc**: `http://localhost:8000/api/redoc`

## 👥 Equipo de Desarrollo

- Quispe Ortiz Luis Alfredo
- Yujra Chipana Amilcar Josias
- Quispe Mamani Juan Gabriel
- Leon Guzman Mabel
- Gomez Ramos Jose Guadalupe
- Macias Quispe Alejandro Sergio

---

**Materia**: Emprendimiento e Innovación Tecnológica  
**Docente**: Lic. Juan Cayoja Cortez  
**Universidad Mayor de San Andrés**  
**La Paz - Bolivia**
