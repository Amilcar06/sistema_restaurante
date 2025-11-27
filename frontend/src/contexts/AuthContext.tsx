import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { Usuario } from '../types';

interface AuthContextType {
  usuario: Usuario | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (nombreUsuario: string, contrasena: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'gastrosmart_auth_es';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Cargar sesión guardada al iniciar
  useEffect(() => {
    const savedAuth = localStorage.getItem(AUTH_STORAGE_KEY);
    if (savedAuth) {
      try {
        const authData = JSON.parse(savedAuth);
        setUsuario(authData.usuario);
      } catch (error) {
        console.error('Error loading saved auth:', error);
        localStorage.removeItem(AUTH_STORAGE_KEY);
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (nombreUsuario: string, contrasena: string) => {
    try {
      setIsLoading(true);

      // Simulación de login - En producción esto debería llamar a tu API
      // Por ahora, aceptamos cualquier credencial para desarrollo

      // Simular delay de red
      await new Promise(resolve => setTimeout(resolve, 500));

      // Crear usuario simulado en español
      const mockUsuario: Usuario = {
        id: '1',
        nombre_usuario: nombreUsuario,
        email: `${nombreUsuario}@gastrosmart.com`,
        nombre_completo: nombreUsuario,
        activo: true,
        es_superusuario: true, // Para facilitar pruebas
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      setUsuario(mockUsuario);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ usuario: mockUsuario }));

      toast.success('Sesión iniciada correctamente');
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(error?.message || 'Error al iniciar sesión');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUsuario(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
    toast.success('Sesión cerrada');
  };

  return (
    <AuthContext.Provider
      value={{
        usuario,
        isAuthenticated: !!usuario,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
