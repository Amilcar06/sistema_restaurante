/**
 * API Service - Centralized API client for backend communication
 */
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

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
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: 'An error occurred' }));
        // FastAPI returns 'detail' field for errors
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
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);

// Type definitions
export interface BusinessLocation {
  id: string;
  name: string;
  address: string;
  city: string;
  zone?: string;
  phone?: string;
  email?: string;
  is_main: boolean;
  is_active: boolean;
  open_hours?: Record<string, any>;
  created_at: string;
}

export interface Supplier {
  id: string;
  name: string;
  contact_name?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  zone?: string;
  tax_id?: string;
  payment_terms?: string;
  rating?: number;
  is_active: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  unit_id?: string;
  min_stock: number;
  max_stock?: number;
  cost_per_unit: number;
  supplier_id?: string;
  supplier?: string;
  location_id: string;
  expiry_date?: string;
  barcode?: string;
  popularity_score: number;
  seasonal_factor?: Record<string, number>;
  demand_forecast?: number;
  last_updated: string;
}

export interface Recipe {
  id: string;
  name: string;
  description?: string;
  category: string;
  subcategory?: string;
  price: number;
  cost: number;
  margin: number;
  preparation_time?: number;
  servings: number;
  instructions?: string;
  location_id?: string;
  is_available: boolean;
  popularity_score: number;
  current_version: number;
  created_at: string;
  updated_at: string;
  ingredients: RecipeIngredient[];
}

export interface RecipeIngredient {
  id: string;
  recipe_id: string;
  ingredient_name: string;
  quantity: number;
  unit: string;
  cost: number;
  inventory_item_id?: string;
}

export interface Sale {
  id: string;
  sale_number?: string;
  location_id: string;
  table_number?: string;
  waiter_id?: string;
  sale_type: string;  // LOCAL, DELIVERY, TAKEAWAY
  delivery_service?: string;
  customer_name?: string;
  customer_phone?: string;
  total: number;
  subtotal: number;
  discount_amount: number;
  tax: number;
  payment_method?: string;
  notes?: string;
  status: string;  // COMPLETED, CANCELLED, REFUNDED
  created_at: string;
  items: SaleItem[];
}

export interface SaleItem {
  id: string;
  sale_id: string;
  recipe_id?: string;
  item_name: string;
  quantity: number;
  unit_price: number;
  total: number;
}

export interface ChatMessage {
  message: string;
  conversation_id?: string;
}

export interface ChatResponse {
  response: string;
  conversation_id: string;
  timestamp: string;
  sources?: any[];
}

export interface DashboardStats {
  total_sales_today: number;
  critical_inventory_count: number;
  dishes_sold_today: number;
  average_margin: number;
  sales_change_percent: number;
  dishes_change_percent: number;
  margin_change_percent: number;
}

export interface TopDish {
  name: string;
  sales_count: number;
  revenue: number;
}

export interface Alert {
  type: string;
  message: string;
}

export interface DashboardData {
  stats: DashboardStats;
  top_dishes: TopDish[];
  alerts: Alert[];
  sales_by_day: Array<{ day: string; ventas: number }>;
  category_distribution: Array<{ name: string; value: number }>;
}

// API Service functions
export const inventoryApi = {
  getAll: () => apiClient.get<InventoryItem[]>('/inventory/'),
  getById: (id: string) => apiClient.get<InventoryItem>(`/inventory/${id}`),
  create: (item: Partial<InventoryItem>) => apiClient.post<InventoryItem>('/inventory/', item),
  update: (id: string, item: Partial<InventoryItem>) => apiClient.put<InventoryItem>(`/inventory/${id}`, item),
  delete: (id: string) => apiClient.delete(`/inventory/${id}`),
};

export const recipesApi = {
  getAll: () => apiClient.get<Recipe[]>('/recipes/'),
  getById: (id: string) => apiClient.get<Recipe>(`/recipes/${id}`),
  create: (recipe: Partial<Recipe>) => apiClient.post<Recipe>('/recipes/', recipe),
  update: (id: string, recipe: Partial<Recipe>) => apiClient.put<Recipe>(`/recipes/${id}`, recipe),
  delete: (id: string) => apiClient.delete(`/recipes/${id}`),
};

export const salesApi = {
  getAll: () => apiClient.get<Sale[]>('/sales/'),
  getById: (id: string) => apiClient.get<Sale>(`/sales/${id}`),
  create: (sale: Partial<Sale>) => apiClient.post<Sale>('/sales/', sale),
  delete: (id: string) => apiClient.delete(`/sales/${id}`),
};

export const chatbotApi = {
  chat: (message: ChatMessage) => apiClient.post<ChatResponse>('/chatbot/chat', message),
};

export const dashboardApi = {
  getStats: () => apiClient.get<DashboardData>('/dashboard/stats'),
};

export interface StockAlert {
  id: string;
  name: string;
  category: string;
  quantity: number;
  min_stock: number;
  unit: string;
  percentage: number;
  shortage?: number;
  severity: 'critical' | 'warning';
}

export interface LowMarginAlert {
  id: string;
  name: string;
  category: string;
  price: number;
  cost: number;
  margin: number;
  recommended_price: number;
  severity: 'critical' | 'warning';
}

export interface AlertsResponse {
  critical_stock: {
    count: number;
    alerts: StockAlert[];
  };
  low_stock: {
    count: number;
    alerts: StockAlert[];
  };
  low_margin_recipes: {
    count: number;
    alerts: LowMarginAlert[];
  };
  total_alerts: number;
}

export const alertsApi = {
  getCriticalStock: () => apiClient.get<{count: number; alerts: StockAlert[]}>('/alerts/stock-critical'),
  getLowStock: (threshold?: number) => apiClient.get<{count: number; alerts: StockAlert[]}>(`/alerts/stock-low${threshold ? `?threshold=${threshold}` : ''}`),
  getLowMarginRecipes: (minMargin?: number) => apiClient.get<{count: number; alerts: LowMarginAlert[]}>(`/alerts/recipes-low-margin${minMargin ? `?min_margin=${minMargin}` : ''}`),
  getAll: () => apiClient.get<AlertsResponse>('/alerts/all'),
};

export interface EnumsResponse {
  inventory_categories: string[];
  inventory_units: string[];
  recipe_categories: string[];
  recipe_ingredient_units: string[];
  payment_methods: string[];
}

export const enumsApi = {
  getAll: () => apiClient.get<EnumsResponse>('/enums/'),
  getInventoryCategories: () => apiClient.get<{categories: string[]}>('/enums/inventory/categories'),
  getInventoryUnits: () => apiClient.get<{units: string[]}>('/enums/inventory/units'),
  getRecipeCategories: () => apiClient.get<{categories: string[]}>('/enums/recipe/categories'),
  getRecipeIngredientUnits: () => apiClient.get<{units: string[]}>('/enums/recipe/ingredient-units'),
  getPaymentMethods: () => apiClient.get<{methods: string[]}>('/enums/payment/methods'),
};

export const businessLocationsApi = {
  getAll: () => apiClient.get<BusinessLocation[]>('/business-locations/'),
  getById: (id: string) => apiClient.get<BusinessLocation>(`/business-locations/${id}`),
  create: (location: Partial<BusinessLocation>) => apiClient.post<BusinessLocation>('/business-locations/', location),
  update: (id: string, location: Partial<BusinessLocation>) => apiClient.put<BusinessLocation>(`/business-locations/${id}`, location),
  delete: (id: string) => apiClient.delete(`/business-locations/${id}`),
};

export const suppliersApi = {
  getAll: () => apiClient.get<Supplier[]>('/suppliers/'),
  getById: (id: string) => apiClient.get<Supplier>(`/suppliers/${id}`),
  create: (supplier: Partial<Supplier>) => apiClient.post<Supplier>('/suppliers/', supplier),
  update: (id: string, supplier: Partial<Supplier>) => apiClient.put<Supplier>(`/suppliers/${id}`, supplier),
  delete: (id: string) => apiClient.delete(`/suppliers/${id}`),
};

export interface User {
  id: string;
  email: string;
  username: string;
  full_name?: string;
  phone?: string;
  is_active: boolean;
  is_superuser: boolean;
  default_location_id?: string;
  created_at: string;
  updated_at: string;
  last_login?: string;
}

export const usersApi = {
  getAll: () => apiClient.get<User[]>('/users/'),
  getById: (id: string) => apiClient.get<User>(`/users/${id}`),
  create: (user: Partial<User & { password: string }>) => apiClient.post<User>('/users/', user),
  update: (id: string, user: Partial<User & { password?: string }>) => apiClient.put<User>(`/users/${id}`, user),
  delete: (id: string) => apiClient.delete(`/users/${id}`),
};

export interface Promotion {
  id: string;
  name: string;
  description?: string;
  discount_type: 'percentage' | 'fixed_amount' | 'buy_x_get_y';
  discount_value: number;
  min_purchase?: number;
  max_discount?: number;
  start_date: string;
  end_date: string;
  is_active: boolean;
  applicable_to?: 'all' | 'recipes' | 'categories' | 'specific_items';
  applicable_ids?: string[];
  location_id?: string;
  created_at: string;
  user_id?: string;
}

export const promotionsApi = {
  getAll: (location_id?: string, is_active?: boolean) => {
    const params = new URLSearchParams();
    if (location_id) params.append('location_id', location_id);
    if (is_active !== undefined) params.append('is_active', String(is_active));
    return apiClient.get<Promotion[]>(`/promotions/?${params.toString()}`);
  },
  getById: (id: string) => apiClient.get<Promotion>(`/promotions/${id}`),
  getActive: (location_id?: string) => {
    const params = location_id ? `?location_id=${location_id}` : '';
    return apiClient.get<Promotion[]>(`/promotions/active/current${params}`);
  },
  create: (promotion: Partial<Promotion>) => apiClient.post<Promotion>('/promotions/', promotion),
  update: (id: string, promotion: Partial<Promotion>) => apiClient.put<Promotion>(`/promotions/${id}`, promotion),
  delete: (id: string) => apiClient.delete(`/promotions/${id}`),
};

export interface InventoryMovement {
  id: string;
  inventory_item_id: string;
  location_id: string;
  movement_type: 'ENTRADA' | 'SALIDA' | 'AJUSTE' | 'MERMA' | 'CADUCIDAD' | 'ROBO' | 'TRANSFERENCIA';
  quantity: number;
  unit: string;
  cost_per_unit?: number;
  reference_id?: string;
  reference_type?: string;
  notes?: string;
  created_at: string;
  user_id?: string;
}

export const inventoryMovementsApi = {
  getAll: (params?: {
    inventory_item_id?: string;
    location_id?: string;
    movement_type?: string;
    start_date?: string;
    end_date?: string;
  }) => {
    const queryParams = new URLSearchParams();
    if (params?.inventory_item_id) queryParams.append('inventory_item_id', params.inventory_item_id);
    if (params?.location_id) queryParams.append('location_id', params.location_id);
    if (params?.movement_type) queryParams.append('movement_type', params.movement_type);
    if (params?.start_date) queryParams.append('start_date', params.start_date);
    if (params?.end_date) queryParams.append('end_date', params.end_date);
    const query = queryParams.toString();
    return apiClient.get<InventoryMovement[]>(`/inventory-movements/${query ? `?${query}` : ''}`);
  },
  getById: (id: string) => apiClient.get<InventoryMovement>(`/inventory-movements/${id}`),
  getItemHistory: (inventory_item_id: string, limit?: number) => {
    const params = limit ? `?limit=${limit}` : '';
    return apiClient.get<InventoryMovement[]>(`/inventory-movements/item/${inventory_item_id}/history${params}`);
  },
  create: (movement: Partial<InventoryMovement>) => apiClient.post<InventoryMovement>('/inventory-movements/', movement),
};

export interface MonthlyReport {
  month: string;
  ventas: number;
  costos: number;
  ganancia: number;
}

export interface CategoryPerformance {
  category: string;
  ventas: number;
  ingresos: number;
}

export interface ProfitMargin {
  name: string;
  margen: number;
}

export interface PaymentMethod {
  name: string;
  value: number;
  count: number;
  amount: number;
}

export interface ReportSummary {
  total_sales: number;
  total_cost: number;
  net_profit: number;
  average_margin: number;
  growth: number;
  period_days: number;
}

export const reportsApi = {
  getMonthly: (months: number = 6) => apiClient.get<MonthlyReport[]>(`/reports/monthly?months=${months}`),
  getCategoryPerformance: (days: number = 30) => apiClient.get<CategoryPerformance[]>(`/reports/category-performance?days=${days}`),
  getProfitMargins: () => apiClient.get<ProfitMargin[]>('/reports/profit-margins'),
  getPaymentMethods: (days: number = 30) => apiClient.get<PaymentMethod[]>(`/reports/payment-methods?days=${days}`),
  getSummary: (days: number = 30) => apiClient.get<ReportSummary>(`/reports/summary?days=${days}`),
  exportReport: (format: 'json' | 'csv' = 'json', days: number = 30) => {
    if (format === 'csv') {
      return fetch(`${API_BASE_URL}/reports/export?format=csv&days=${days}`)
        .then(response => {
          if (!response.ok) throw new Error('Error exporting report');
          return response.blob();
        })
        .then(blob => {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `reporte_gastrosmart_${new Date().toISOString().split('T')[0]}.csv`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
        });
    } else {
      return apiClient.get(`/reports/export?format=json&days=${days}`);
    }
  },
};

