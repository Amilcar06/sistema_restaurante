# GastroSmart AI - Frontend

Frontend React + TypeScript + Tailwind CSS para el Sistema Integral de Control Gastronómico con IA.

## Stack Tecnológico

- **React 18**: Biblioteca de UI
- **TypeScript**: Tipado estático
- **Vite**: Build tool y dev server
- **Tailwind CSS**: Estilos utilitarios
- **shadcn/ui**: Componentes UI basados en Radix UI
- **Recharts**: Gráficos y visualizaciones

## Instalación

1. Instalar dependencias:
```bash
npm install
```

2. Configurar variables de entorno:
```bash
cp .env.example .env
# Editar .env si necesitas cambiar la URL del backend
```

## Ejecutar en desarrollo

```bash
npm run dev
```

El frontend estará disponible en `http://localhost:5173` (o el puerto que Vite asigne)

## Build para producción

```bash
npm run build
```

Los archivos compilados estarán en la carpeta `dist/`

## Estructura del Proyecto

```
frontend/
├── src/
│   ├── components/     # Componentes React
│   │   ├── ui/        # Componentes UI reutilizables (shadcn)
│   │   ├── Dashboard.tsx
│   │   ├── Inventory.tsx
│   │   ├── Recipes.tsx
│   │   ├── Sales.tsx
│   │   ├── Reports.tsx
│   │   ├── Chatbot.tsx
│   │   └── ...
│   ├── services/      # Servicios de API
│   │   └── api.ts     # Cliente API y funciones
│   ├── App.tsx        # Componente principal
│   ├── main.tsx       # Punto de entrada
│   └── index.css      # Estilos globales
├── package.json
├── vite.config.ts
└── .env.example
```

## Colores y Diseño

El proyecto mantiene un diseño oscuro con los siguientes colores principales:

- **Background**: `#020617` (muy oscuro)
- **Primary/Accent**: `#209C8A` (verde turquesa)
- **Text**: Blanco con diferentes opacidades (`text-white`, `text-white/60`, etc.)
- **Cards**: `bg-white/5` con bordes `border-[#209C8A]/20`

## Conexión con Backend

El frontend se conecta al backend a través de la API REST. La URL base se configura en `.env`:

```
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

Todos los servicios de API están centralizados en `src/services/api.ts`.

## Características

- ✅ Dashboard con estadísticas y gráficos
- ✅ Gestión de inventario
- ✅ Gestión de recetas
- ✅ Registro de ventas
- ✅ Chatbot con IA integrado
- ✅ Reportes y análisis
- ✅ Diseño responsive
- ✅ Tema oscuro consistente

## Próximos Pasos

- [ ] Agregar autenticación de usuarios
- [ ] Implementar manejo de errores más robusto
- [ ] Agregar loading states en todos los componentes
- [ ] Implementar caché de datos
- [ ] Agregar tests unitarios
- [ ] Optimizar bundle size

