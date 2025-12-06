import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Loader2, Eye, EyeOff, AlertCircle, ArrowRight } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card } from './ui/card';
import LogoWeb from '../assets/LogoWeb.png';
import { motion } from 'framer-motion';

export function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!username || !password) {
      setError("Por favor completa todos los campos.");
      return;
    }

    try {
      setIsSubmitting(true);
      await login(username, password);
      // Simular un pequeño delay para la animación de éxito si se deseara
      navigate('/dashboard');
    } catch (err) {
      setError("Credenciales incorrectas. Por favor intenta nuevamente.");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fafafa] p-4 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] right-[-5%] w-[300px] h-[300px] bg-[#F26522]/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[-5%] w-[250px] h-[250px] bg-[#1B1B1B]/5 rounded-full blur-3xl pointer-events-none"></div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-md"
      >
        <Card className="p-8 sm:p-10 space-y-8 bg-white border border-[#F26522]/10 shadow-2xl shadow-[#1B1B1B]/5 backdrop-blur-sm relative z-10">

          {/* Logo y Encabezado */}
          <div className="text-center space-y-4">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 10 }}
              className="flex justify-center"
            >
              <img src={LogoWeb} alt="GastroSmart Logo" className="h-28 w-auto object-contain drop-shadow-sm" />
            </motion.div>
            <div>
              <h1 className="text-3xl font-black text-[#1B1B1B] tracking-tight">
                Gastro<span className="text-[#F26522]">Smart</span>
              </h1>
              <p className="text-[#1B1B1B]/60 mt-2 font-medium">Bienvenido de nuevo</p>
            </div>
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-lg text-sm flex items-center gap-2"
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </motion.div>
            )}

            <div className="space-y-2">
              <Label htmlFor="username" className="text-[#1B1B1B] font-bold">
                Usuario
              </Label>
              <motion.div whileFocus={{ scale: 1.01 }} className="relative">
                <Input
                  id="username"
                  type="text"
                  placeholder="ej. admin"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={isSubmitting}
                  className="h-12 bg-white text-[#1B1B1B] placeholder:text-[#1B1B1B]/30 border-[#1B1B1B]/10 focus:border-[#F26522] focus:ring-[#F26522]/20 selection:bg-[#F26522] selection:text-white transition-all duration-300"
                  autoComplete="username"
                />
              </motion.div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-[#1B1B1B] font-bold">
                  Contraseña
                </Label>
                <a href="#" className="text-xs text-[#F26522] hover:underline font-medium" onClick={(e) => e.preventDefault()}>
                  ¿Olvidaste tu contraseña?
                </a>
              </div>
              <motion.div whileFocus={{ scale: 1.01 }} className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isSubmitting}
                  className="h-12 bg-white text-[#1B1B1B] placeholder:text-[#1B1B1B]/30 border-[#1B1B1B]/10 focus:border-[#F26522] focus:ring-[#F26522]/20 pr-10 selection:bg-[#F26522] selection:text-white transition-all duration-300"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#1B1B1B]/40 hover:text-[#F26522] transition-colors focus:outline-none"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </motion.div>
            </div>

            <Button
              type="submit"
              className="group w-full h-12 bg-[#F26522] hover:bg-[#F26522]/90 text-white font-bold text-lg rounded-xl shadow-lg shadow-[#F26522]/20 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Iniciando...
                </>
              ) : (
                <>
                  Iniciar Sesión
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </Button>
          </form>

          {/* Información de desarrollo */}
          <div className="pt-4 border-t border-[#1B1B1B]/5">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-start gap-3">
              <div className="w-2 h-2 mt-1.5 rounded-full bg-yellow-500 shrink-0 animate-pulse"></div>
              <p className="text-xs text-yellow-800 font-medium leading-relaxed">
                <span className="font-bold block mb-0.5">Modo Desarrollo Activo</span>
                Puedes usar cualquier credencial para acceder al sistema (ej. admin / admin).
              </p>
            </div>
          </div>
        </Card>

        <p className="text-center text-[#1B1B1B]/30 text-sm mt-8">
          © {new Date().getFullYear()} GastroSmart AI
        </p>
      </motion.div>
    </div>
  );
}

