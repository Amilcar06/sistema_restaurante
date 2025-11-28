import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from 'sonner';
import { Usuario } from '../types';
import { authApi } from '../services/api';

interface AuthContextType {
  usuario: Usuario | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (nombreUsuario: string, contrasena: string) => Promise<void>;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
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

      // Llamada real a la API
      const response = await authApi.login(nombreUsuario, contrasena);
      const { usuario: usuarioData, access_token } = response;

      // Guardar token y usuario
      localStorage.setItem('token', access_token);
      setUsuario(usuarioData);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ usuario: usuarioData }));

      toast.success('Sesión iniciada correctamente');
    } catch (error: any) {
      console.error("Login error:", error.response?.data?.detail || error.message || error);
      toast.error(error?.response?.data?.detail || 'Error al iniciar sesión');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUsuario(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem('token');
    toast.success('Sesión cerrada');
  };

  const hasPermission = (permission: string): boolean => {
    if (!usuario) return false;
    if (usuario.es_superusuario) return true;
    if (usuario.permisos?.includes('all') || usuario.permisos?.includes('admin')) return true;
    return usuario.permisos?.includes(permission) || false;
  };

  return (
    <AuthContext.Provider
      value={{
        usuario,
        isAuthenticated: !!usuario,
        isLoading,
        login,
        logout,
        hasPermission,
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
