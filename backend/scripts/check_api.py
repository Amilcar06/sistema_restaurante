#!/usr/bin/env python3
"""
Script para verificar que la API está funcionando correctamente
"""
import requests
import sys
import time

API_BASE_URL = "http://localhost:8000"

def check_server_running():
    """Verifica si el servidor está corriendo"""
    print("=" * 60)
    print("VERIFICACIÓN DE API BACKEND")
    print("=" * 60)
    
    print(f"\n🔌 Verificando servidor en {API_BASE_URL}...")
    try:
        response = requests.get(f"{API_BASE_URL}/health", timeout=5)
        if response.status_code == 200:
            print("   ✅ Servidor está corriendo!")
            return True
        else:
            print(f"   ❌ Servidor respondió con código {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("   ❌ No se puede conectar al servidor")
        print("   💡 Asegúrate de que el backend esté corriendo:")
        print("      cd backend && python run.py")
        return False
    except Exception as e:
        print(f"   ❌ Error: {str(e)}")
        return False

def check_endpoints():
    """Verifica que los endpoints principales funcionen"""
    print(f"\n📡 Verificando endpoints...")
    
    endpoints = [
        ("/", "Root"),
        ("/health", "Health Check"),
        ("/api/v1/dashboard/stats", "Dashboard Stats"),
        ("/api/v1/inventory/", "Inventory List"),
        ("/api/v1/recipes/", "Recipes List"),
        ("/api/v1/sales/", "Sales List"),
    ]
    
    all_ok = True
    for endpoint, name in endpoints:
        try:
            response = requests.get(f"{API_BASE_URL}{endpoint}", timeout=5)
            if response.status_code in [200, 501]:  # 501 es OK para endpoints no implementados
                status = "✅" if response.status_code == 200 else "⚠️  (No implementado)"
                print(f"   {status} {name}: {endpoint}")
            else:
                print(f"   ❌ {name}: {endpoint} - Status {response.status_code}")
                all_ok = False
        except Exception as e:
            print(f"   ❌ {name}: {endpoint} - Error: {str(e)}")
            all_ok = False
    
    return all_ok

def check_cors():
    """Verifica la configuración CORS"""
    print(f"\n🌐 Verificando CORS...")
    try:
        headers = {
            "Origin": "http://localhost:5173",
            "Access-Control-Request-Method": "GET"
        }
        response = requests.options(f"{API_BASE_URL}/health", headers=headers, timeout=5)
        
        cors_headers = {
            "Access-Control-Allow-Origin": response.headers.get("Access-Control-Allow-Origin"),
            "Access-Control-Allow-Methods": response.headers.get("Access-Control-Allow-Methods"),
        }
        
        if cors_headers["Access-Control-Allow-Origin"]:
            print("   ✅ CORS configurado correctamente")
            print(f"      Allow-Origin: {cors_headers['Access-Control-Allow-Origin']}")
            return True
        else:
            print("   ⚠️  CORS no está configurado")
            return False
    except Exception as e:
        print(f"   ⚠️  No se pudo verificar CORS: {str(e)}")
        return False

def check_chatbot():
    """Verifica el endpoint del chatbot"""
    print(f"\n🤖 Verificando Chatbot...")
    try:
        payload = {
            "message": "Hola, ¿cómo estás?",
            "conversation_id": None
        }
        response = requests.post(
            f"{API_BASE_URL}/api/v1/chatbot/chat",
            json=payload,
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            print("   ✅ Chatbot funcionando!")
            print(f"      Respuesta: {data.get('response', '')[:50]}...")
            return True
        else:
            print(f"   ❌ Chatbot error: Status {response.status_code}")
            print(f"      {response.text}")
            return False
    except Exception as e:
        print(f"   ❌ Error al probar chatbot: {str(e)}")
        return False

def main():
    """Función principal"""
    print("\n" + "=" * 60)
    print("GASTROSMART AI - VERIFICACIÓN DE API")
    print("=" * 60 + "\n")
    
    # Verificar servidor
    if not check_server_running():
        sys.exit(1)
    
    # Verificar endpoints
    check_endpoints()
    
    # Verificar CORS
    check_cors()
    
    # Verificar chatbot
    check_chatbot()
    
    print("\n" + "=" * 60)
    print("✅ Verificación completada!")
    print("=" * 60 + "\n")

if __name__ == "__main__":
    main()

