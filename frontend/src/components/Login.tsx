import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card } from './ui/card';
import LogoWeb from '../assets/LogoWeb.png';

export function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username || !password) {
      return;
    }

    try {
      setIsSubmitting(true);
      await login(username, password);
      navigate('/dashboard');
    } catch (error) {
      // Error ya manejado en el contexto
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md p-8 space-y-6 border-border shadow-xl">
        {/* Logo y Título */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <img src={LogoWeb} alt="GastroSmart Logo" className="h-32 w-auto object-contain" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Gastro<span className="text-primary">Smart</span>
            </h1>
            <p className="text-muted-foreground mt-2">Sistema de Control Gastronómico</p>
          </div>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username" className="text-foreground">
              Usuario
            </Label>
            <Input
              id="username"
              type="text"
              placeholder="Ingresa tu usuario"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={isSubmitting}
              className="bg-background text-foreground placeholder:text-muted-foreground border-input focus-visible:ring-primary selection:bg-[#F26522] selection:text-[#1B1B1B]"
              autoComplete="username"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-foreground">
              Contraseña
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Ingresa tu contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isSubmitting}
                className="bg-background text-foreground placeholder:text-muted-foreground border-input focus-visible:ring-primary pr-10 selection:bg-[#F26522] selection:text-[#1B1B1B]"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors focus:outline-none"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-[#F26522] hover:bg-[#F26522]/90 text-[#1B1B1B] font-bold"
            disabled={isSubmitting || !username || !password}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Iniciando sesión...
              </>
            ) : (
              'Iniciar Sesión'
            )}
          </Button>
        </form>

        {/* Información de desarrollo */}
        <div className="pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground text-center">
            Modo desarrollo: Usa cualquier credencial para acceder
          </p>
        </div>
      </Card>
    </div>
  );
}

