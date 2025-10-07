export interface ApiConfig {
  baseUrl: string;
  timeout: number;
  headers?: Record<string, string>;
}

export interface ApiResponse<T> {
  data: T;
  status: number;
  message?: string;
  error?: string;
}

export class ApiClient {
  private config: ApiConfig;
  private baseHeaders: Record<string, string>;

  constructor(config: ApiConfig) {
    this.config = config;
    this.baseHeaders = {
      'Content-Type': 'application/json',
      ...config.headers,
    };
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.config.baseUrl}${endpoint}`;
    const controller = new AbortController();
    
    // Timeout setup
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...this.baseHeaders,
          ...options.headers,
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || `HTTP ${response.status}`);
      }

      return {
        data,
        status: response.status,
        message: data.message,
      };
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error('Request timeout');
        }
        throw error;
      }
      
      throw new Error('Unknown error occurred');
    }
  }

  async get<T>(endpoint: string, headers?: Record<string, string>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'GET',
      headers,
    });
  }

  async post<T>(endpoint: string, data?: any, headers?: Record<string, string>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
      headers,
    });
  }

  async put<T>(endpoint: string, data?: any, headers?: Record<string, string>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
      headers,
    });
  }

  async delete<T>(endpoint: string, headers?: Record<string, string>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
      headers,
    });
  }

  // Auth token management
  setAuthToken(token: string) {
    this.baseHeaders['Authorization'] = `Bearer ${token}`;
  }

  removeAuthToken() {
    delete this.baseHeaders['Authorization'];
  }

  // Update base URL
  updateConfig(config: Partial<ApiConfig>) {
    this.config = { ...this.config, ...config };
  }
}

// Default API client instance
export const apiClient = new ApiClient({
  baseUrl: process.env.EXPO_PUBLIC_API_URL || 'https://api.cyclemateapp.com',
  timeout: 10000,
});

// Environment configuration
export const API_ENDPOINTS = {
  // Auth
  AUTH_REGISTER: '/auth/register',
  AUTH_LOGIN: '/auth/login',
  AUTH_LOGOUT: '/auth/logout',
  AUTH_REFRESH: '/auth/refresh',
  
  // User
  USER_PROFILE: '/user/profile',
  USER_SETTINGS: '/user/settings',
  
  // Logs
  LOGS: '/logs',
  LOGS_BY_DATE: '/logs/date',
  LOGS_RANGE: '/logs/range',
  
  // Periods
  PERIODS: '/periods',
  PERIODS_CURRENT: '/periods/current',
  
  // Tips & Suggestions
  TIPS_SUGGEST: '/tips/suggest',
  TIPS_CATEGORIES: '/tips/categories',
  
  // Analytics
  ANALYTICS_STATS: '/analytics/stats',
  ANALYTICS_TRENDS: '/analytics/trends',
  
  // Notifications
  NOTIFICATIONS: '/notifications',
  NOTIFICATIONS_SETTINGS: '/notifications/settings',
  
  // Data Sync
  SYNC_PUSH: '/sync/push',
  SYNC_PULL: '/sync/pull',
  SYNC_STATUS: '/sync/status',
} as const;

// API Error types
export class ApiError extends Error {
  public status: number;
  public code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

// Helper function to handle API errors
export function handleApiError(error: any): ApiError {
  if (error instanceof ApiError) {
    return error;
  }

  if (error.message) {
    // Network or timeout errors
    if (error.message.includes('timeout')) {
      return new ApiError('Bağlantı zaman aşımı', 408, 'TIMEOUT');
    }
    
    if (error.message.includes('Network')) {
      return new ApiError('İnternet bağlantısı yok', 0, 'NETWORK_ERROR');
    }

    return new ApiError(error.message, 500, 'UNKNOWN_ERROR');
  }

  return new ApiError('Bilinmeyen hata', 500, 'UNKNOWN_ERROR');
}

// Mock mode flag
export const USE_API = process.env.EXPO_PUBLIC_USE_API === 'true';

// Mock data generators (for development)
export const generateMockResponse = <T>(data: T, delay?: number): Promise<ApiResponse<T>> => {
  // Random delay between 300-800ms for more realistic simulation
  const randomDelay = delay !== undefined ? delay : Math.floor(Math.random() * (800 - 300 + 1)) + 300;
  
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        data,
        status: 200,
        message: 'Success (Mock)',
      });
    }, randomDelay);
  });
};

// Mock error generator (for testing error handling)
export const generateMockError = (status: number, message: string, code?: string, delay = 500): Promise<never> => {
  return new Promise((_, reject) => {
    setTimeout(() => {
      reject(new ApiError(message, status, code));
    }, delay);
  });
};

// Simulate network error
export const simulateNetworkError = (): Promise<never> => {
  return generateMockError(0, 'İnternet bağlantısı yok', 'NETWORK_ERROR', 300);
};

// Simulate timeout
export const simulateTimeout = (): Promise<never> => {
  return generateMockError(408, 'Bağlantı zaman aşımı', 'TIMEOUT', 10000);
};

// Simulate 404
export const simulate404 = (): Promise<never> => {
  return generateMockError(404, 'Kayıt bulunamadı', 'NOT_FOUND', 400);
};

// Simulate 500
export const simulate500 = (): Promise<never> => {
  return generateMockError(500, 'Sunucu hatası', 'SERVER_ERROR', 500);
};
