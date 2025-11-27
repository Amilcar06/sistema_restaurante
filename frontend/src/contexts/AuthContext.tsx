import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';

interface User {
  id: string;
  username: string;
  email: string;
  full_name?: string;
  role?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'gastrosmart_auth';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Cargar sesión guardada al iniciar
  useEffect(() => {
    const savedAuth = localStorage.getItem(AUTH_STORAGE_KEY);
    if (savedAuth) {
      try {
        const authData = JSON.parse(savedAuth);
        setUser(authData.user);
      } catch (error) {
        console.error('Error loading saved auth:', error);
        localStorage.removeItem(AUTH_STORAGE_KEY);
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string) => {
    try {
      setIsLoading(true);
      
      // Simulación de login - En producción esto debería llamar a tu API
      // Por ahora, aceptamos cualquier credencial para desarrollo
      // TODO: Reemplazar con llamada real a la API de autenticación
      
      // Simular delay de red
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Crear usuario simulado
      const mockUser: User = {
        id: '1',
        username: username,
        email: `${username}@gastrosmart.com`,
        full_name: username,
        role: 'admin'
      };
      
      setUser(mockUser);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ user: mockUser }));
      
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
    setUser(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
    toast.success('Sesión cerrada');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
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

