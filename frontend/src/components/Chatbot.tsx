import { useState, useRef, useEffect } from "react";
import { X, Send, Bot, Loader2, Sparkles } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { chatbotApi } from "../services/api";
import { MensajeChat } from "../types";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
}

interface ChatbotProps {
  isOpen: boolean;
  onToggle: () => void;
}

export function Chatbot({ isOpen, onToggle }: ChatbotProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "¡Hola! Soy el asistente inteligente de GastroSmart AI. Puedo ayudarte con información sobre tu negocio. ¿Qué te gustaría saber?",
      sender: "bot",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | undefined>();

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const quickQuestions = [
    "¿Cuánto gané esta semana?",
    "¿Qué insumo se está acabando?",
    "¿Cuál es mi plato más rentable?",
    "¿Cuántas ventas tuve hoy?"
  ];

  // Auto-scroll when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Auto-focus input when chat opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  const handleSendMessage = async (textToSend: string = input) => {
    if (!textToSend.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: textToSend,
      sender: "user",
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const apiMessage: MensajeChat = {
        message: textToSend,
        conversation_id: conversationId
      };

      const response = await chatbotApi.enviarMensaje(apiMessage);

      if (response.conversation_id) {
        setConversationId(response.conversation_id);
      }

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response.response,
        sender: "bot",
        timestamp: new Date(response.timestamp)
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "Lo siento, hubo un error al procesar tu mensaje. Por favor, intenta de nuevo. 🤖",
        sender: "bot",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickQuestion = (question: string) => {
    // Send immediately with visual feedback
    handleSendMessage(question);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Send on Enter (without Shift)
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
    // Allow new line with Shift + Enter (default behavior for input/textarea)
  };

  return (
    <>
      {/* Floating Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={onToggle}
            className="fixed bottom-6 right-6 bg-[#F26522] hover:bg-[#F26522]/90 text-white w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110 z-[1000]"
            aria-label="Abrir chat de asistente IA"
          >
            <Sparkles className="w-6 h-6" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chatbot Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed bottom-6 right-6 w-96 h-[600px] bg-white border border-[#F26522]/20 rounded-xl shadow-2xl flex flex-col z-[1000] overflow-hidden sm:w-[380px] w-[calc(100vw-3rem)]"
          >
            {/* Header */}
            <div className="bg-[#1B1B1B] p-4 flex items-center justify-between border-b-4 border-[#F26522]">
              <div className="flex items-center gap-3">
                <div className="bg-[#F26522] w-10 h-10 rounded-full flex items-center justify-center ring-2 ring-white/20">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-white font-bold text-sm">GastroSmart AI</div>
                  <div className="text-[#28C76F] text-xs font-medium flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#28C76F] animate-pulse"></span>
                    En línea
                  </div>
                </div>
              </div>
              <button
                onClick={onToggle}
                className="text-white/60 hover:text-white transition-colors p-1 hover:bg-white/10 rounded-lg"
                aria-label="Cerrar chat"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div
              className="flex-1 p-4 overflow-y-auto space-y-4 bg-[#F8F8F8]"
              aria-live="polite"
            >
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-sm relative group ${message.sender === "user"
                      ? "bg-[#F26522] text-white rounded-br-none"
                      : "bg-white text-[#1B1B1B] border border-gray-100 rounded-bl-none"
                      }`}
                  >
                    <p className="whitespace-pre-line text-sm leading-relaxed">{message.text}</p>
                    <div className={`text-[10px] mt-1 opacity-60 font-medium ${message.sender === 'user' ? 'text-white/80 text-right' : 'text-gray-400'}`}>
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </motion.div>
              ))}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-none px-4 py-3 flex items-center gap-1.5 shadow-sm">
                    <span className="w-2 h-2 bg-[#F26522] rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="w-2 h-2 bg-[#F26522] rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="w-2 h-2 bg-[#F26522] rounded-full animate-bounce"></span>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Questions */}
            {messages.length <= 1 && (
              <div className="px-4 pb-2 bg-[#F8F8F8]">
                <div className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">Sugerencias:</div>
                <div className="flex flex-wrap gap-2">
                  {quickQuestions.map((question, index) => (
                    <button
                      key={index}
                      onClick={() => handleQuickQuestion(question)}
                      className="px-3 py-1.5 bg-white hover:bg-[#F26522] hover:text-white border border-gray-200 rounded-lg text-gray-600 text-xs font-medium transition-all shadow-sm hover:shadow-md hover:border-[#F26522]"
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <div className="p-4 bg-white border-t border-gray-100">
              <div className="flex gap-2 items-end">
                <Input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Escribe tu consulta..."
                  className="bg-[#F4F5F7] border-transparent focus-visible:bg-white focus-visible:ring-2 focus-visible:ring-[#F26522] text-[#1B1B1B] min-h-[44px] py-3"
                  aria-label="Escribe tu mensaje para el asistente"
                />
                <Button
                  onClick={() => handleSendMessage()}
                  disabled={isLoading || !input.trim()}
                  className="bg-[#F26522] hover:bg-[#F26522]/90 text-white h-11 w-11 rounded-lg shrink-0 shadow-lg shadow-[#F26522]/20 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:shadow-none"
                  aria-label="Enviar mensaje"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
