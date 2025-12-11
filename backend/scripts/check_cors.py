import sys
import os

# Add backend to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.config import settings

print(f"Loaded CORS_ORIGINS type: {type(settings.CORS_ORIGINS)}")
print(f"Loaded CORS_ORIGINS value: {settings.CORS_ORIGINS}")
