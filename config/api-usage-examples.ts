// API Usage Examples for LocalPro Mobile App
// This file demonstrates how to use the updated API configuration

import { API_CONFIG, ApiResponse, ApiUtils, buildApiUrl, getApiHeaders } from './api';

// Example 1: Basic API calls
export const apiExamples = {
  // Get all marketplace services
  getMarketplaceServices: async (token?: string) => {
    const url = buildApiUrl(API_CONFIG.ENDPOINTS.MARKETPLACE.SERVICES.ALL);
    const response = await fetch(url, {
      headers: getApiHeaders(token),
    });
    return response.json() as Promise<ApiResponse>;
  },

  // Get nearby services with location
  getNearbyServices: async (latitude: number, longitude: number, token?: string) => {
    const params = ApiUtils.locationParams(latitude, longitude);
    const url = ApiUtils.buildUrlWithParams(
      API_CONFIG.ENDPOINTS.MARKETPLACE.SERVICES.NEARBY,
      params
    );
    const response = await fetch(url, {
      headers: getApiHeaders(token),
    });
    return response.json() as Promise<ApiResponse>;
  },

  // Get specific service by ID
  getServiceById: async (serviceId: string, token?: string) => {
    const url = buildApiUrl(API_CONFIG.ENDPOINTS.MARKETPLACE.SERVICES.BY_ID(serviceId));
    const response = await fetch(url, {
      headers: getApiHeaders(token),
    });
    return response.json() as Promise<ApiResponse>;
  },

  // Create a booking
  createBooking: async (bookingData: any, token: string) => {
    const url = buildApiUrl(API_CONFIG.ENDPOINTS.MARKETPLACE.BOOKINGS.CREATE);
    const response = await fetch(url, {
      method: 'POST',
      headers: getApiHeaders(token),
      body: JSON.stringify(bookingData),
    });
    return response.json() as Promise<ApiResponse>;
  },

  // Get supplies with pagination
  getSupplies: async (page: number = 1, limit: number = 10, token?: string) => {
    const params = ApiUtils.paginationParams(page, limit);
    const url = ApiUtils.buildUrlWithParams(
      API_CONFIG.ENDPOINTS.SUPPLIES.ALL,
      params
    );
    const response = await fetch(url, {
      headers: getApiHeaders(token),
    });
    return response.json() as Promise<ApiResponse>;
  },

  // Search jobs
  searchJobs: async (query: string, filters?: Record<string, any>, token?: string) => {
    const params = ApiUtils.searchParams(query, filters);
    const url = ApiUtils.buildUrlWithParams(
      API_CONFIG.ENDPOINTS.JOBS.SEARCH,
      params
    );
    const response = await fetch(url, {
      headers: getApiHeaders(token),
    });
    return response.json() as Promise<ApiResponse>;
  },

  // Get user's provider profile
  getMyProviderProfile: async (token: string) => {
    const url = buildApiUrl(API_CONFIG.ENDPOINTS.PROVIDERS.PROFILE.ME);
    const response = await fetch(url, {
      headers: getApiHeaders(token),
    });
    return response.json() as Promise<ApiResponse>;
  },

  // Update provider profile
  updateProviderProfile: async (profileData: any, token: string) => {
    const url = buildApiUrl(API_CONFIG.ENDPOINTS.PROVIDERS.PROFILE.UPDATE);
    const response = await fetch(url, {
      method: 'PUT',
      headers: getApiHeaders(token),
      body: JSON.stringify(profileData),
    });
    return response.json() as Promise<ApiResponse>;
  },

  // Get financial overview
  getFinancialOverview: async (token: string) => {
    const url = buildApiUrl(API_CONFIG.ENDPOINTS.FINANCE.OVERVIEW);
    const response = await fetch(url, {
      headers: getApiHeaders(token),
    });
    return response.json() as Promise<ApiResponse>;
  },

  // Get conversations
  getConversations: async (token: string) => {
    const url = buildApiUrl(API_CONFIG.ENDPOINTS.COMMUNICATION.CONVERSATIONS.ALL);
    const response = await fetch(url, {
      headers: getApiHeaders(token),
    });
    return response.json() as Promise<ApiResponse>;
  },

  // Send a message
  sendMessage: async (conversationId: string, messageData: any, token: string) => {
    const url = buildApiUrl(API_CONFIG.ENDPOINTS.COMMUNICATION.MESSAGES.SEND(conversationId));
    const response = await fetch(url, {
      method: 'POST',
      headers: getApiHeaders(token),
      body: JSON.stringify(messageData),
    });
    return response.json() as Promise<ApiResponse>;
  },

  // Get academy courses with categories
  getAcademyCourses: async (categoryId?: string, token?: string) => {
    const params = categoryId ? { category: categoryId } : {};
    const url = ApiUtils.buildUrlWithParams(
      API_CONFIG.ENDPOINTS.ACADEMY.COURSES.ALL,
      params
    );
    const response = await fetch(url, {
      headers: getApiHeaders(token),
    });
    return response.json() as Promise<ApiResponse>;
  },

  // Enroll in a course
  enrollInCourse: async (courseId: string, token: string) => {
    const url = buildApiUrl(API_CONFIG.ENDPOINTS.ACADEMY.COURSES.ENROLL(courseId));
    const response = await fetch(url, {
      method: 'POST',
      headers: getApiHeaders(token),
    });
    return response.json() as Promise<ApiResponse>;
  },

  // Get my supply orders
  getMySupplyOrders: async (token: string) => {
    const url = buildApiUrl(API_CONFIG.ENDPOINTS.SUPPLIES.MY_ORDERS);
    const response = await fetch(url, {
      headers: getApiHeaders(token),
    });
    return response.json() as Promise<ApiResponse>;
  },

  // Get referral stats
  getReferralStats: async (token: string) => {
    const url = buildApiUrl(API_CONFIG.ENDPOINTS.REFERRALS.STATS);
    const response = await fetch(url, {
      headers: getApiHeaders(token),
    });
    return response.json() as Promise<ApiResponse>;
  },

  // Get app settings
  getAppSettings: async () => {
    const url = buildApiUrl(API_CONFIG.ENDPOINTS.SETTINGS.APP.PUBLIC);
    const response = await fetch(url, {
      headers: getApiHeaders(),
    });
    return response.json() as Promise<ApiResponse>;
  },
};

// Example 2: Using with React hooks (for reference)
export const useApiExamples = () => {
  // This would typically be used in a React component
  const fetchServices = async (token?: string) => {
    try {
      const response = await apiExamples.getMarketplaceServices(token);
      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.error || 'Failed to fetch services');
      }
    } catch (error) {
      console.error('Error fetching services:', error);
      throw error;
    }
  };

  return {
    fetchServices,
    // Add more hook functions as needed
  };
};

// Example 3: Error handling utility
export const handleApiError = (error: any): string => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  if (error.message) {
    return error.message;
  }
  return 'An unexpected error occurred';
};

// Example 4: API client class (optional advanced usage)
export class LocalProApiClient {
  private token?: string;

  constructor(token?: string) {
    this.token = token;
  }

  setToken(token: string) {
    this.token = token;
  }

  async request<T = any>(
    endpoint: string | ((...args: any[]) => string),
    options: RequestInit = {},
    ...args: any[]
  ): Promise<ApiResponse<T>> {
    const url = ApiUtils.buildFullUrl(endpoint, ...args);
    
    const response = await fetch(url, {
      ...options,
      headers: {
        ...getApiHeaders(this.token),
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // Convenience methods
  async get<T = any>(endpoint: string | ((...args: any[]) => string), ...args: any[]): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' }, ...args);
  }

  async post<T = any>(endpoint: string | ((...args: any[]) => string), data?: any, ...args: any[]): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    }, ...args);
  }

  async put<T = any>(endpoint: string | ((...args: any[]) => string), data?: any, ...args: any[]): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    }, ...args);
  }

  async delete<T = any>(endpoint: string | ((...args: any[]) => string), ...args: any[]): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' }, ...args);
  }
}
