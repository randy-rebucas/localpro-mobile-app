import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG, buildApiUrl, getApiHeaders } from '../config/api';

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Custom error class for token expiration
export class TokenExpiredError extends Error {
  constructor(message: string = 'Token has expired') {
    super(message);
    this.name = 'TokenExpiredError';
  }
}

export interface AuthResponse {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    email: string;
    isVerified: boolean;
    role: string;
    avatar?: {
      url: string;
      publicId: string;
      thumbnail: string;
    };
    bio?: string;
    createdAt?: string;
    subscription?: {
      isActive: boolean;
      type: string;
    }
  };
  token: string;
  success: boolean;
  message: string;
}

// API Service Class
class ApiService {
  private baseUrl: string;
  private timeout: number;

  constructor() {
    this.baseUrl = API_CONFIG.BASE_URL;
    this.timeout = API_CONFIG.TIMEOUT;
  }

  // Helper method to check if error indicates token expiration
  private isTokenExpired(status: number, message?: string): boolean {
    // Check for 401 Unauthorized status
    if (status === 401) {
      return true;
    }
    
    // Check for token-related error messages
    if (message) {
      const lowerMessage = message.toLowerCase();
      return (
        lowerMessage.includes('token is not valid') ||
        lowerMessage.includes('token expired') ||
        lowerMessage.includes('invalid token') ||
        lowerMessage.includes('token has expired') ||
        lowerMessage.includes('unauthorized') ||
        lowerMessage.includes('authentication failed')
      );
    }
    
    return false;
  }

  // Helper method to clear auth data on token expiration
  private async clearAuthData(): Promise<void> {
    try {
      await AsyncStorage.multiRemove(['user', 'token']);
      console.log('Auth data cleared due to token expiration');
    } catch (error) {
      console.error('Error clearing auth data:', error);
    }
  }

  // Generic HTTP request method
  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    token?: string
  ): Promise<ApiResponse<T>> {
    const url = buildApiUrl(endpoint);
    const headers = getApiHeaders(token);

    // Create AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      console.log('Request timeout after', this.timeout, 'ms');
      controller.abort();
    }, this.timeout);

    const config: RequestInit = {
      ...options,
      headers: {
        ...headers,
        ...options.headers,
      },
      signal: controller.signal,
    };

    console.log('API Request:', {
      url,
      method: config.method || 'GET',
      headers: config.headers,
      body: config.body
    });

    try {
      const response = await fetch(url, config);
      clearTimeout(timeoutId);
      
      // Parse response data (whether success or error)
      let data: any;
      let errorMessage: string | undefined;
      
      try {
        const responseText = await response.text();
        if (responseText) {
          data = JSON.parse(responseText);
        }
      } catch (parseError) {
        // If response is not JSON, use status text
        console.log('Could not parse response as JSON');
      }

      console.log('API Response:', {
        status: response.status,
        data
      });

      // Check if response is ok
      if (!response.ok) {
        // Extract error message from response
        errorMessage = data?.message || data?.error || `HTTP error! status: ${response.status}`;
        
        // Check if token has expired BEFORE throwing error
        if (this.isTokenExpired(response.status, errorMessage)) {
          // Clear auth data
          await this.clearAuthData();
          // Throw a TokenExpiredError that can be caught by calling code
          throw new TokenExpiredError(errorMessage);
        }
        
        // For non-token errors, throw regular error
        throw new Error(errorMessage);
      }

      return data;
    } catch (error) {
      clearTimeout(timeoutId);
      
      // Re-throw TokenExpiredError so it can be handled by calling code
      if (error instanceof TokenExpiredError) {
        console.error('Token expired error:', error.message);
        throw error;
      }
      
      // Handle AbortError (timeout) gracefully without logging as error
      if (error instanceof Error && error.name === 'AbortError') {
        console.warn('Request timeout after', this.timeout, 'ms');
        return {
          success: false,
          error: 'Request timeout - please check your internet connection',
        };
      }
      
      // Log other errors
      console.error('API Request failed:', error);
      
      // Handle other error types
      if (error instanceof Error) {
        return {
          success: false,
          error: error.message,
        };
      }
      
      return {
        success: false,
        error: 'Network error - please check your internet connection',
      };
    }
  }

  // Authentication Methods
  async sendVerificationCode(phone: string): Promise<ApiResponse> {
    console.log('Sending verification code to phone:', phone);
    
    // Send the phone number as-is (should be in international format)
    return this.request(API_CONFIG.ENDPOINTS.AUTH.SEND_CODE, {
      method: 'POST',
      body: JSON.stringify({ phoneNumber: phone }),
    });
  }

  async verifyCode(
    phone: string,
    code: string,
    firstName?: string,
    lastName?: string,
    email?: string
  ): Promise<ApiResponse<AuthResponse>> {
    // Send the phone number as-is (should be in international format)
    const requestBody: any = { phoneNumber: phone, code };
    
    // Only include optional fields if they are provided
    if (firstName) requestBody.firstName = firstName;
    if (lastName) requestBody.lastName = lastName;
    if (email) requestBody.email = email;
    
    return this.request(API_CONFIG.ENDPOINTS.AUTH.VERIFY_CODE, {
      method: 'POST',
      body: JSON.stringify(requestBody),
    });
  }

  async getCurrentUser(token: string): Promise<ApiResponse> {
    return this.request(API_CONFIG.ENDPOINTS.AUTH.ME, {
      method: 'GET',
    }, token);
  }

  async updateUserProfile(token: string, userData: any): Promise<ApiResponse> {
    return this.request(API_CONFIG.ENDPOINTS.AUTH.UPDATE_PROFILE, {
      method: 'PUT',
      body: JSON.stringify(userData),
    }, token);
  }

  async uploadAvatar(token: string, avatarData: FormData): Promise<ApiResponse> {
    return this.request(API_CONFIG.ENDPOINTS.AUTH.UPLOAD_AVATAR, {
      method: 'POST',
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      body: avatarData,
    }, token);
  }

  async uploadPortfolio(token: string, portfolioData: FormData): Promise<ApiResponse> {
    return this.request(API_CONFIG.ENDPOINTS.AUTH.UPLOAD_PORTFOLIO, {
      method: 'POST',
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      body: portfolioData,
    }, token);
  }

  async logout(token: string): Promise<ApiResponse> {
    return this.request(API_CONFIG.ENDPOINTS.AUTH.LOGOUT, {
      method: 'POST',
    }, token);
  }

  // Service Methods

  async getMarketplaceServiceCategories(token?: string): Promise<ApiResponse> {
    return this.request(API_CONFIG.ENDPOINTS.MARKETPLACE.SERVICES.CATEGORIES, {
      method: 'GET',
      headers: token ? getApiHeaders(token) : getApiHeaders(),
    });
  }

  async getMarketplaceServices(
    filters?: {
      category?: string;
      subcategory?: string;
      location?: string;
      minPrice?: number;
      maxPrice?: number;
      rating?: number;
      page?: number;
      limit?: number;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
      groupByCategory?: boolean;
    },
    token?: string
  ): Promise<ApiResponse> {
    const params = new URLSearchParams();
    
    if (filters?.category) params.append('category', filters.category);
    if (filters?.subcategory) params.append('subcategory', filters.subcategory);
    if (filters?.location) params.append('location', filters.location);
    if (filters?.minPrice !== undefined) params.append('minPrice', filters.minPrice.toString());
    if (filters?.maxPrice !== undefined) params.append('maxPrice', filters.maxPrice.toString());
    if (filters?.rating !== undefined) params.append('rating', filters.rating.toString());
    if (filters?.page !== undefined) params.append('page', filters.page.toString());
    if (filters?.limit !== undefined) params.append('limit', filters.limit.toString());
    if (filters?.sortBy) params.append('sortBy', filters.sortBy);
    if (filters?.sortOrder) params.append('sortOrder', filters.sortOrder);
    if (filters?.groupByCategory !== undefined) params.append('groupByCategory', filters.groupByCategory.toString());

    const endpoint = `${API_CONFIG.ENDPOINTS.MARKETPLACE.SERVICES.ALL}${params.toString() ? `?${params.toString()}` : ''}`;
    return this.request(endpoint, {
      method: 'GET',
      headers: token ? getApiHeaders(token) : getApiHeaders(),
    });
  }

  // Legacy method for backward compatibility
  async getMarketplaceServicesByCategory(categoryKey: string, token?: string): Promise<ApiResponse> {
    return this.getMarketplaceServices({ category: categoryKey }, token);
  }

  async getSupplies(token?: string): Promise<ApiResponse> {
    return this.request(API_CONFIG.ENDPOINTS.SERVICES.SUPPLIES, {
      method: 'GET',
    }, token);
  }

  async getAcademyCourses(token?: string): Promise<ApiResponse> {
    return this.request(API_CONFIG.ENDPOINTS.SERVICES.ACADEMY, {
      method: 'GET',
    }, token);
  }

  async getFinanceData(token: string): Promise<ApiResponse> {
    return this.request(API_CONFIG.ENDPOINTS.SERVICES.FINANCE, {
      method: 'GET',
    }, token);
  }

  async getRentals(token?: string): Promise<ApiResponse> {
    return this.request(API_CONFIG.ENDPOINTS.SERVICES.RENTALS, {
      method: 'GET',
    }, token);
  }

  async getAds(token?: string): Promise<ApiResponse> {
    return this.request(API_CONFIG.ENDPOINTS.SERVICES.ADS, {
      method: 'GET',
    }, token);
  }

  async getFacilityCareServices(token?: string): Promise<ApiResponse> {
    return this.request(API_CONFIG.ENDPOINTS.SERVICES.FACILITY_CARE, {
      method: 'GET',
    }, token);
  }

  async getPlusPlans(token?: string): Promise<ApiResponse> {
    return this.request(API_CONFIG.ENDPOINTS.SERVICES.PLUS, {
      method: 'GET',
    }, token);
  }

  // User Statistics Methods
  async getUserStats(token: string): Promise<ApiResponse> {
    return this.request('/api/user/stats', {
      method: 'GET',
    }, token);
  }

  async getUserPortfolio(token: string): Promise<ApiResponse> {
    return this.request('/api/user/portfolio', {
      method: 'GET',
    }, token);
  }

  async getUserBookings(token: string): Promise<ApiResponse> {
    return this.request('/api/user/bookings', {
      method: 'GET',
    }, token);
  }

  // Booking Methods
  async createBooking(token: string, bookingData: {
    serviceId: string;
    date: string;
    time: string;
    address: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
    };
    specialInstructions?: string;
    package?: string;
    addOns?: string[];
    quantity?: number;
    area?: number;
    totalPrice: number;
    paymentMethod?: 'paypal' | 'paymaya';
  }): Promise<ApiResponse> {
    return this.request(API_CONFIG.ENDPOINTS.MARKETPLACE.BOOKINGS.CREATE, {
      method: 'POST',
      body: JSON.stringify(bookingData),
    }, token);
  }

  async approvePayPalPayment(token: string, bookingId: string, orderId: string): Promise<ApiResponse> {
    return this.request(API_CONFIG.ENDPOINTS.MARKETPLACE.BOOKINGS.PAYPAL_APPROVE, {
      method: 'POST',
      body: JSON.stringify({ bookingId, orderId }),
    }, token);
  }

  async createPayMayaCheckout(token: string, bookingId: string, amount: number, currency: string = 'PHP'): Promise<ApiResponse> {
    return this.request('/api/paymaya/create-checkout', {
      method: 'POST',
      body: JSON.stringify({ bookingId, amount, currency }),
    }, token);
  }

  async validateServiceArea(serviceId: string, address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  }, token?: string): Promise<ApiResponse> {
    return this.request('/api/maps/validate-service-area', {
      method: 'POST',
      body: JSON.stringify({ serviceId, address }),
    }, token);
  }

  async checkServiceAvailability(serviceId: string, date: string, time: string, token?: string): Promise<ApiResponse> {
    return this.request(`${API_CONFIG.ENDPOINTS.MARKETPLACE.SERVICES.BY_ID(serviceId)}/availability`, {
      method: 'POST',
      body: JSON.stringify({ date, time }),
    }, token);
  }

  async getAvailableTimeSlots(serviceId: string, date: string, token?: string): Promise<ApiResponse> {
    return this.request(`${API_CONFIG.ENDPOINTS.MARKETPLACE.SERVICES.BY_ID(serviceId)}/availability/slots`, {
      method: 'POST',
      body: JSON.stringify({ date }),
    }, token);
  }

}

// Export singleton instance
export const apiService = new ApiService();
export default apiService;
