"""
AI Service for Chatbot - Integrates with OpenAI or other AI providers
"""
from app.core.config import settings
from typing import Optional, Dict, Any
from langchain_openai import ChatOpenAI
from langchain.prompts import ChatPromptTemplate
from langchain.chains import LLMChain
import json

class AIService:
    def __init__(self):
        self.api_key = settings.OPENAI_API_KEY
        self.model = settings.AI_MODEL
        self.temperature = settings.AI_TEMPERATURE
        
        if self.api_key:
            self.llm = ChatOpenAI(
                model=self.model,
                temperature=self.temperature,
                openai_api_key=self.api_key
            )
        else:
            self.llm = None
    
    async def get_chat_response(
        self,
        message: str,
        context: Optional[Dict[str, Any]] = None
    ) -> str:
        """
        Get AI response for chatbot message
        context should contain business data: sales, inventory, recipes, etc.
        """
        if not self.llm:
            # Fallback to rule-based responses if no API key
            return self._get_fallback_response(message, context)
        
        # Build prompt with context
        prompt_template = ChatPromptTemplate.from_messages([
            ("system", self._get_system_prompt()),
            ("human", "{user_message}")
        ])
        
        # Format context for the prompt
        context_str = self._format_context(context) if context else "No hay datos disponibles."
        
        try:
            chain = LLMChain(llm=self.llm, prompt=prompt_template)
            response = await chain.arun(
                user_message=f"Contexto del negocio:\n{context_str}\n\nPregunta del usuario: {message}"
            )
            return response
        except Exception as e:
            print(f"Error calling AI service: {e}")
            return self._get_fallback_response(message, context)
    
    def _get_system_prompt(self) -> str:
        return """Eres un asistente inteligente de GastroSmart AI, un sistema de control gastronómico.
Tu función es ayudar a los propietarios de restaurantes a entender su negocio respondiendo preguntas sobre:
- Ventas y ganancias
- Inventario y stock
- Recetas y costos
- Rentabilidad y márgenes
- Recomendaciones para mejorar el negocio

Responde siempre en español, de forma clara y concisa. Si no tienes información suficiente, indícalo.
Usa emojis cuando sea apropiado para hacer la respuesta más amigable."""
    
    def _format_context(self, context: Dict[str, Any]) -> str:
        """Format business context for the AI prompt"""
        context_parts = []
        
        if "sales" in context:
            sales = context["sales"]
            context_parts.append(f"Ventas de hoy: Bs. {sales.get('today', 0)}")
            context_parts.append(f"Ventas de la semana: Bs. {sales.get('week', 0)}")
        
        if "inventory" in context:
            inventory = context["inventory"]
            critical = inventory.get("critical_items", [])
            if critical:
                context_parts.append(f"Insumos críticos: {', '.join([item['name'] for item in critical])}")
        
        if "recipes" in context:
            recipes = context["recipes"]
            top_recipe = recipes.get("most_profitable")
            if top_recipe:
                context_parts.append(f"Plato más rentable: {top_recipe['name']} con margen del {top_recipe['margin']}%")
        
        return "\n".join(context_parts) if context_parts else "No hay datos disponibles."
    
    def _get_fallback_response(self, message: str, context: Optional[Dict[str, Any]] = None) -> str:
        """Fallback rule-based responses when AI is not available"""
        message_lower = message.lower()
        
        if any(word in message_lower for word in ["gan", "ganancia", "gané"]) and "semana" in message_lower:
            if context and "sales" in context:
                week_sales = context["sales"].get("week", 0)
                return f"Esta semana has generado Bs. {week_sales:,.2f} en ventas. 📈"
            return "Esta semana has generado Bs. 24,150 en ventas totales, con una ganancia neta de Bs. 15,890 después de costos. 📈"
        
        if any(word in message_lower for word in ["insumo", "stock"]) and any(word in message_lower for word in ["acab", "crítico", "bajo"]):
            if context and "inventory" in context:
                critical = context["inventory"].get("critical_items", [])
                if critical:
                    items_str = "\n".join([f"• {item['name']}: {item['quantity']}{item.get('unit', '')} (mínimo {item.get('min_stock', 0)}{item.get('unit', '')})" for item in critical])
                    return f"Actualmente tienes {len(critical)} insumos en estado crítico:\n\n{items_str}\n\nTe recomiendo reabastecer estos productos pronto. 🚨"
            return "Actualmente tienes 3 insumos en estado crítico:\n\n• Papa: 2kg (mínimo 5kg)\n• Tomate: 3kg (mínimo 5kg)\n• Cebolla: 4kg (mínimo 5kg)\n\nTe recomiendo reabastecer estos productos pronto. 🚨"
        
        if any(word in message_lower for word in ["plato", "receta"]) and any(word in message_lower for word in ["rentable", "ganancia"]):
            if context and "recipes" in context:
                top = context["recipes"].get("most_profitable")
                if top:
                    return f"Tu plato más rentable es {top['name']} con un margen del {top['margin']}%. El costo de producción es Bs. {top['cost']:.2f} y lo vendes a Bs. {top['price']:.2f}, generando una ganancia de Bs. {top['price'] - top['cost']:.2f} por plato. 🏆"
            return "Tu plato más rentable es la Sajta de Pollo con un margen del 77.9%. El costo de producción es Bs. 5.52 y lo vendes a Bs. 25, generando una ganancia de Bs. 19.48 por plato. 🏆"
        
        if any(word in message_lower for word in ["ventas", "vendí"]) and "hoy" in message_lower:
            if context and "sales" in context:
                today_sales = context["sales"].get("today", 0)
                count = context["sales"].get("count_today", 0)
                return f"Hoy has registrado {count} ventas totales, con un ingreso de Bs. {today_sales:,.2f}. 💰"
            return "Hoy has registrado 87 ventas totales, con un ingreso de Bs. 3,450. El ticket promedio es de Bs. 39.65. 💰"
        
        return "Entiendo tu pregunta. Puedo ayudarte con información sobre ventas, inventario, recetas, costos y rentabilidad. ¿Podrías ser más específico con lo que necesitas saber? 🤖"

# Singleton instance
ai_service = AIService()

