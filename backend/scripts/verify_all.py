#!/usr/bin/env python3
"""
Script completo de verificación del sistema GastroSmart AI
Verifica: Backend, Base de Datos, API y Frontend
"""
import sys
import os
import subprocess
import requests
import time

# Colores para terminal
class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    RESET = '\033[0m'
    BOLD = '\033[1m'

def print_header(text):
    print(f"\n{Colors.BOLD}{Colors.BLUE}{'='*60}{Colors.RESET}")
    print(f"{Colors.BOLD}{Colors.BLUE}{text}{Colors.RESET}")
    print(f"{Colors.BOLD}{Colors.BLUE}{'='*60}{Colors.RESET}\n")

def print_success(text):
    print(f"{Colors.GREEN}✅ {text}{Colors.RESET}")

def print_error(text):
    print(f"{Colors.RED}❌ {text}{Colors.RESET}")

def print_warning(text):
    print(f"{Colors.YELLOW}⚠️  {text}{Colors.RESET}")

def print_info(text):
    print(f"   {text}")

def check_backend_server():
    """Verifica que el servidor backend esté corriendo"""
    print_header("1. VERIFICACIÓN DEL SERVIDOR BACKEND")
    
    try:
        response = requests.get("http://localhost:8000/health", timeout=3)
        if response.status_code == 200:
            print_success("Servidor backend está corriendo en http://localhost:8000")
            return True
        else:
            print_error(f"Servidor respondió con código {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print_error("No se puede conectar al servidor backend")
        print_info("💡 Inicia el servidor con: cd backend && python run.py")
        return False
    except Exception as e:
        print_error(f"Error: {str(e)}")
        return False

def check_database():
    """Verifica la conexión a la base de datos"""
    print_header("2. VERIFICACIÓN DE BASE DE DATOS POSTGRESQL")
    
    try:
        response = requests.get("http://localhost:8000/api/v1/health/database", timeout=5)
        if response.status_code == 200:
            data = response.json()
            
            if data.get("status") == "connected":
                print_success("Conexión a PostgreSQL exitosa")
                print_info(f"Versión: {data.get('version', 'N/A')}")
                print_info(f"Tablas encontradas: {data.get('tables_count', 0)}")
                
                tables = data.get('tables', [])
                if tables:
                    print_info("Tablas:")
                    for table in tables:
                        print_info(f"  - {table}")
                else:
                    print_warning("No hay tablas en la base de datos")
                    print_info("💡 Ejecuta: cd backend && alembic upgrade head")
                
                return True
            else:
                print_error(f"Estado de BD: {data.get('status')}")
                print_info(f"Mensaje: {data.get('message', 'N/A')}")
                return False
        else:
            print_error(f"Error al verificar BD: Status {response.status_code}")
            return False
    except Exception as e:
        print_error(f"Error al verificar base de datos: {str(e)}")
        return False

def check_api_endpoints():
    """Verifica los endpoints principales de la API"""
    print_header("3. VERIFICACIÓN DE ENDPOINTS API")
    
    endpoints = [
        ("/", "Root"),
        ("/api/v1/health/", "Health Check"),
        ("/api/v1/dashboard/stats", "Dashboard Stats"),
        ("/api/v1/chatbot/chat", "Chatbot (POST)"),
    ]
    
    all_ok = True
    for endpoint, name in endpoints:
        try:
            if endpoint == "/api/v1/chatbot/chat":
                # POST request para chatbot
                response = requests.post(
                    f"http://localhost:8000{endpoint}",
                    json={"message": "test"},
                    timeout=5
                )
            else:
                response = requests.get(f"http://localhost:8000{endpoint}", timeout=5)
            
            if response.status_code in [200, 501]:
                status = "✅" if response.status_code == 200 else "⚠️ "
                print(f"   {status} {name}: {endpoint}")
            else:
                print_error(f"{name}: {endpoint} - Status {response.status_code}")
                all_ok = False
        except Exception as e:
            print_error(f"{name}: {endpoint} - Error: {str(e)}")
            all_ok = False
    
    return all_ok

def check_cors():
    """Verifica la configuración CORS"""
    print_header("4. VERIFICACIÓN DE CORS")
    
    try:
        headers = {
            "Origin": "http://localhost:5173",
            "Access-Control-Request-Method": "GET"
        }
        response = requests.options("http://localhost:8000/health", headers=headers, timeout=5)
        
        cors_origin = response.headers.get("Access-Control-Allow-Origin")
        if cors_origin:
            print_success("CORS configurado correctamente")
            print_info(f"Allow-Origin: {cors_origin}")
            return True
        else:
            print_warning("CORS no está configurado")
            return False
    except Exception as e:
        print_warning(f"No se pudo verificar CORS: {str(e)}")
        return False

def check_frontend():
    """Verifica que el frontend pueda comunicarse con el backend"""
    print_header("5. VERIFICACIÓN DE COMUNICACIÓN FRONTEND-BACKEND")
    
    print_info("Verificando que el frontend pueda hacer requests al backend...")
    
    # Simular un request desde el frontend
    try:
        headers = {
            "Origin": "http://localhost:5173",
            "Content-Type": "application/json"
        }
        
        # Test 1: Health check
        response = requests.get("http://localhost:8000/api/v1/health/", headers=headers, timeout=5)
        if response.status_code == 200:
            print_success("Frontend puede comunicarse con backend (Health Check)")
        else:
            print_error(f"Error en Health Check: {response.status_code}")
            return False
        
        # Test 2: Dashboard
        response = requests.get("http://localhost:8000/api/v1/dashboard/stats", headers=headers, timeout=5)
        if response.status_code == 200:
            print_success("Frontend puede obtener datos del Dashboard")
        else:
            print_warning(f"Dashboard respondió con: {response.status_code}")
        
        # Test 3: Chatbot
        response = requests.post(
            "http://localhost:8000/api/v1/chatbot/chat",
            json={"message": "Hola"},
            headers=headers,
            timeout=10
        )
        if response.status_code == 200:
            print_success("Frontend puede comunicarse con el Chatbot")
        else:
            print_warning(f"Chatbot respondió con: {response.status_code}")
        
        return True
    except Exception as e:
        print_error(f"Error al verificar comunicación: {str(e)}")
        return False

def main():
    """Función principal"""
    print(f"\n{Colors.BOLD}{Colors.BLUE}")
    print("=" * 60)
    print("  GASTROSMART AI - VERIFICACIÓN COMPLETA DEL SISTEMA")
    print("=" * 60)
    print(f"{Colors.RESET}\n")
    
    results = {
        "Backend": False,
        "Base de Datos": False,
        "API Endpoints": False,
        "CORS": False,
        "Frontend-Backend": False
    }
    
    # Verificaciones
    results["Backend"] = check_backend_server()
    if not results["Backend"]:
        print_error("\n⚠️  El servidor backend no está corriendo. Inicia el servidor primero.")
        print_info("Comando: cd backend && python run.py")
        sys.exit(1)
    
    results["Base de Datos"] = check_database()
    results["API Endpoints"] = check_api_endpoints()
    results["CORS"] = check_cors()
    results["Frontend-Backend"] = check_frontend()
    
    # Resumen
    print_header("RESUMEN DE VERIFICACIÓN")
    
    for check, result in results.items():
        if result:
            print_success(f"{check}: OK")
        else:
            print_error(f"{check}: FALLO")
    
    all_passed = all(results.values())
    
    print(f"\n{Colors.BOLD}{'='*60}{Colors.RESET}")
    if all_passed:
        print_success("¡TODAS LAS VERIFICACIONES PASARON!")
        print_info("Tu sistema está configurado correctamente ✅")
    else:
        print_warning("ALGUNAS VERIFICACIONES FALLARON")
        print_info("Revisa los errores arriba y corrige los problemas")
    print(f"{Colors.BOLD}{'='*60}{Colors.RESET}\n")
    
    return 0 if all_passed else 1

if __name__ == "__main__":
    sys.exit(main())

