# Configuración de Inteligencia Artificial (IA) 🧠

GastroSmart AI utiliza un potente "ChefBot" capaz de responder preguntas sobre tu negocio en tiempo real. Este bot puede funcionar con OpenAI (oficial) o con alternativas gratuitas y locales.

## Opción 1: OpenAI (Oficial y Recomendado) 🚀

Es la opción más fácil, estable y potente (GPT-3.5 o GPT-4).

1.  Regístrate en [OpenAI Platform](https://platform.openai.com/).
2.  Crea una API Key en [API Keys](https://platform.openai.com/api-keys).
3.  Edita tu archivo `backend/.env`:

```env
OPENAI_API_KEY=sk-tu-clave-secreta-aqui
AI_MODEL=gpt-3.5-turbo
```

---

## Opción 2: Groq (Gratis, Rápido y en la Nube) ⚡

[Groq](https://groq.com/) ofrece inferencia ultra-rápida y tiene un plan gratuito muy generoso para modelos open-source como Llama 3 o Mixtral.

1.  Obtén tu API Key en la [Consola de Groq](https://console.groq.com/keys).
2.  Edita tu archivo `backend/.env`:

```env
# Clave de Groq
OPENAI_API_KEY=gsk-tu-clave-de-groq-aqui

# URL Base de Groq (compatible con OpenAI)
OPENAI_API_BASE=https://api.groq.com/openai/v1

# Modelo (Llama 3.3 es excelente y rápido)
AI_MODEL=llama-3.3-70b-versatile
```

---

## Opción 3: LocalAI / LM Studio (Totalmente Gratis y Privado) 🏠

Si tienes una buena computadora (GPU recomendada), puedes correr el modelo localmente sin enviar datos a internet.

### Usando LM Studio:
1.  Descarga [LM Studio](https://lmstudio.ai/).
2.  Descarga un modelo ligero (ej. `Llama 3 8B Instruct`).
3.  Inicia el "Local Server" en LM Studio (puerto 1234 por defecto).
4.  Edita tu archivo `backend/.env`:

```env
# Clave (puede ser cualquier cosa en local)
OPENAI_API_KEY=lm-studio

# URL Local
OPENAI_API_BASE=http://localhost:1234/v1

# El modelo debe coincidir con el seleccionado en LM Studio (o dejalo genérico)
AI_MODEL=local-model
```

---

## Verificación ✅

1.  Reinicia el backend (`python run.py`).
2.  Abre el Chatbot en el frontend.
3.  Pregunta: "¿Qué plato me recomiendas para vender hoy?".
4.  Si responde con datos del negocio, ¡está funcionando!
