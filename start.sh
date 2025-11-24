#!/bin/bash

# Script para iniciar tanto el backend como el frontend

echo "🚀 Iniciando GastroSmart AI..."

# Verificar si estamos en el directorio correcto
if [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    echo "❌ Error: Este script debe ejecutarse desde la raíz del proyecto"
    exit 1
fi

# Función para iniciar backend
start_backend() {
    echo "📦 Iniciando backend..."
    cd backend
    
    # Verificar si existe el entorno virtual
    if [ ! -d "venv" ]; then
        echo "⚠️  Creando entorno virtual..."
        python3 -m venv venv
    fi
    
    source venv/bin/activate 2>/dev/null || source venv/Scripts/activate 2>/dev/null
    
    # Verificar si están instaladas las dependencias
    if ! python -c "import fastapi" 2>/dev/null; then
        echo "📥 Instalando dependencias del backend..."
        pip install -r requirements.txt
    fi
    
    echo "🔧 Iniciando servidor backend en http://localhost:8000"
    python run.py &
    BACKEND_PID=$!
    cd ..
}

# Función para iniciar frontend
start_frontend() {
    echo "📦 Iniciando frontend..."
    cd frontend
    
    # Verificar si están instaladas las dependencias
    if [ ! -d "node_modules" ]; then
        echo "📥 Instalando dependencias del frontend..."
        npm install
    fi
    
    echo "🎨 Iniciando servidor frontend en http://localhost:5173"
    npm run dev &
    FRONTEND_PID=$!
    cd ..
}

# Iniciar ambos servicios
start_backend
sleep 2
start_frontend

echo ""
echo "✅ Servicios iniciados:"
echo "   - Backend: http://localhost:8000"
echo "   - Frontend: http://localhost:5173"
echo "   - API Docs: http://localhost:8000/api/docs"
echo ""
echo "Presiona Ctrl+C para detener ambos servicios"

# Esperar a que se presione Ctrl+C
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT
wait

