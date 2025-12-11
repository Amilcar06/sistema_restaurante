import requests
import json

url = "http://localhost:8000/api/v1/chatbot/chat"
headers = {
    "Content-Type": "application/json"
}
data = {
    "message": "Hola, cuanto vendi hoy?",
    "sender": "user"
}

try:
    print(f"Sending POST to {url}...")
    response = requests.post(url, headers=headers, json=data)
    
    print(f"Status Code: {response.status_code}")
    print("Response Body:")
    try:
        print(json.dumps(response.json(), indent=2))
    except:
        print(response.text)
        
except Exception as e:
    print(f"Request execution failed: {e}")
