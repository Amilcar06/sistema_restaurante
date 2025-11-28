/**
 * API Service - Cliente API centralizado para comunicación con el backend
 * Actualizado para usar endpoints y tipos en español
 */
import {
  Usuario,
  Sucursal,
  ItemInventario,
  Receta,
  Venta,
  Promocion,
  Proveedor,
  MovimientoInventario,
  OrdenCompra,
  ResumenReporte,
  DashboardResponse,
  ReporteMensual,
  RendimientoCategoria,
  MargenGanancia,
  MetodoPagoReporte,
  MensajeChat,
  RespuestaChat,
  Rol,
  Configuracion
} from '../types';

const API_BASE_URL = (import.meta as any).env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;

    const headers: any = {
      ...options.headers,
    };

    // Only set Content-Type to json if body is NOT FormData
    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }

    const config: RequestInit = {
      headers,
      ...options,
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: 'An error occurred' }));
        const errorMessage = error.detail || error.message || `HTTP error! status: ${response.status}`;
        const apiError = new Error(errorMessage);
        (apiError as any).response = { data: error, status: response.status };
        throw apiError;
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data instanceof FormData ? data : (data ? JSON.stringify(data) : undefined),
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data instanceof FormData ? data : (data ? JSON.stringify(data) : undefined),
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);

// --- Servicios API ---

export const inventarioApi = {
  obtenerTodos: () => apiClient.get<ItemInventario[]>('/inventario/'),
  obtenerPorId: (id: string) => apiClient.get<ItemInventario>(`/inventario/${id}`),
  crear: (item: Partial<ItemInventario>) => apiClient.post<ItemInventario>('/inventario/', item),
  actualizar: (id: string, item: Partial<ItemInventario>) => apiClient.put<ItemInventario>(`/inventario/${id}`, item),
  eliminar: (id: string) => apiClient.delete(`/inventario/${id}`),
};

export const recetasApi = {
  obtenerTodos: () => apiClient.get<Receta[]>('/recetas/'),
  obtenerPorId: (id: string) => apiClient.get<Receta>(`/recetas/${id}`),
  crear: (receta: Partial<Receta>) => apiClient.post<Receta>('/recetas/', receta),
  actualizar: (id: string, receta: Partial<Receta>) => apiClient.put<Receta>(`/recetas/${id}`, receta),
  eliminar: (id: string) => apiClient.delete(`/recetas/${id}`),
};

export const ventasApi = {
  obtenerTodos: () => apiClient.get<Venta[]>('/ventas/'),
  obtenerPorId: (id: string) => apiClient.get<Venta>(`/ventas/${id}`),
  crear: (venta: Partial<Venta>) => apiClient.post<Venta>('/ventas/', venta),
  eliminar: (id: string) => apiClient.delete(`/ventas/${id}`), // Nota: Normalmente no se eliminan ventas, se cancelan
};

export const sucursalesApi = {
  obtenerTodos: () => apiClient.get<Sucursal[]>('/sucursales/'),
  obtenerPorId: (id: string) => apiClient.get<Sucursal>(`/sucursales/${id}`),
  crear: (sucursal: Partial<Sucursal>) => apiClient.post<Sucursal>('/sucursales/', sucursal),
  actualizar: (id: string, sucursal: Partial<Sucursal>) => apiClient.put<Sucursal>(`/sucursales/${id}`, sucursal),
  eliminar: (id: string) => apiClient.delete(`/sucursales/${id}`),
};

export const proveedoresApi = {
  obtenerTodos: () => apiClient.get<Proveedor[]>('/proveedores/'),
  obtenerPorId: (id: string) => apiClient.get<Proveedor>(`/proveedores/${id}`),
  crear: (proveedor: Partial<Proveedor>) => apiClient.post<Proveedor>('/proveedores/', proveedor),
  actualizar: (id: string, proveedor: Partial<Proveedor>) => apiClient.put<Proveedor>(`/proveedores/${id}`, proveedor),
  eliminar: (id: string) => apiClient.delete(`/proveedores/${id}`),
};

export const usuariosApi = {
  obtenerTodos: () => apiClient.get<Usuario[]>('/usuarios/'),
  obtenerPorId: (id: string) => apiClient.get<Usuario>(`/usuarios/${id}`),
  crear: (usuario: Partial<Usuario> & { contrasena: string }) => apiClient.post<Usuario>('/usuarios/', usuario),
  actualizar: (id: string, usuario: Partial<Usuario> & { contrasena?: string }) => apiClient.put<Usuario>(`/usuarios/${id}`, usuario),
  eliminar: (id: string) => apiClient.delete(`/usuarios/${id}`),
};

export const rolesApi = {
  obtenerTodos: () => apiClient.get<Rol[]>('/roles/'),
  obtenerPorId: (id: string) => apiClient.get<Rol>(`/roles/${id}`),
  crear: (rol: Partial<Rol>) => apiClient.post<Rol>('/roles/', rol),
  actualizar: (id: string, rol: Partial<Rol>) => apiClient.put<Rol>(`/roles/${id}`, rol),
  eliminar: (id: string) => apiClient.delete(`/roles/${id}`),
  obtenerPermisos: () => apiClient.get<{ id: string; nombre: string; descripcion: string; recurso: string; accion: string }[]>('/roles/permisos'),
};

export const configuracionApi = {
  obtener: () => apiClient.get<Configuracion>('/configuracion/'),
  actualizar: (config: Partial<Configuracion>) => apiClient.put<Configuracion>('/configuracion/', config),
};

export const authApi = {
  login: (username: string, password: string) => {
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);
    return apiClient.post<{ access_token: string; token_type: string; usuario: any }>('/login/access-token', formData);
  },
  recoverPassword: (email: string) => apiClient.post<{ message: string }>('/recover-password', { email }),
  resetPassword: (token: string, new_password: string) => apiClient.post<{ message: string }>('/reset-password', { token, new_password: new_password }),
};

export const promocionesApi = {
  obtenerTodos: () => apiClient.get<Promocion[]>('/promociones/'),
  obtenerPorId: (id: string) => apiClient.get<Promocion>(`/promociones/${id}`),
  crear: (promocion: Partial<Promocion>) => apiClient.post<Promocion>('/promociones/', promocion),
  actualizar: (id: string, promocion: Partial<Promocion>) => apiClient.put<Promocion>(`/promociones/${id}`, promocion),
  eliminar: (id: string) => apiClient.delete(`/promociones/${id}`),
};

export const movimientosApi = {
  obtenerTodos: () => apiClient.get<MovimientoInventario[]>('/movimientos-inventario/'),
  crear: (movimiento: Partial<MovimientoInventario>) => apiClient.post<MovimientoInventario>('/movimientos-inventario/', movimiento),
};

export const ordenesCompraApi = {
  obtenerTodos: () => apiClient.get<OrdenCompra[]>('/ordenes-compra/'),
  obtenerPorId: (id: string) => apiClient.get<OrdenCompra>(`/ordenes-compra/${id}`),
  crear: (orden: Partial<OrdenCompra>) => apiClient.post<OrdenCompra>('/ordenes-compra/', orden),
  actualizar: (id: string, orden: Partial<OrdenCompra>) => apiClient.put<OrdenCompra>(`/ordenes-compra/${id}`, orden),
};

export const onboardingApi = {
  crearRestaurante: (data: any) => apiClient.post('/onboarding/restaurante', data),
  crearSucursal: (data: any) => apiClient.post('/onboarding/sucursal', data),
};

// Servicios pendientes de refactorizar completamente en backend, pero mapeados aquí

export const dashboardApi = {
  obtenerEstadisticas: () => apiClient.get<DashboardResponse>('/dashboard/stats'),
};

export const reportesApi = {
  obtenerMensual: (meses: number = 6) => apiClient.get<ReporteMensual[]>(`/reports/monthly?months=${meses}`),
  obtenerRendimientoCategorias: (dias: number = 30) => apiClient.get<RendimientoCategoria[]>(`/reports/categories?days=${dias}`),
  obtenerMargenesGanancia: () => apiClient.get<MargenGanancia[]>('/reports/margins'),
  obtenerMetodosPagoReporte: (dias: number = 30) => apiClient.get<MetodoPagoReporte[]>(`/reports/payment-methods?days=${dias}`),
  obtenerResumen: (dias: number = 30) => apiClient.get<ResumenReporte>(`/reports/summary?days=${dias}`),
  exportarReporte: (formato: 'json' | 'csv', dias: number = 30) => apiClient.get<any>(`/reports/export?format=${formato}&days=${dias}`),
};

export const chatbotApi = {
  enviarMensaje: (data: MensajeChat) => apiClient.post<RespuestaChat>('/chatbot/chat', data),
};

export const enumsApi = {
  getInventoryCategories: () => apiClient.get<{ categories: string[] }>('/enums/inventory/categories'),
  getInventoryUnits: () => apiClient.get<{ units: string[] }>('/enums/inventory/units'),
  getRecipeCategories: () => apiClient.get<{ categories: string[] }>('/enums/recipe/categories'),
  getRecipeIngredientUnits: () => apiClient.get<{ units: string[] }>('/enums/recipe/ingredient-units'),
  getPaymentMethods: () => apiClient.get<{ methods: string[] }>('/enums/payment/methods'),
};
