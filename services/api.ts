import { API_CONFIG, buildApiUrl, getApiHeaders } from '../config/api';

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
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
      
      // Check if response is ok before trying to parse JSON
      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (parseError) {
          console.log('Could not parse error response as JSON');
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();

      console.log('API Response:', {
        status: response.status,
        data
      });

      return data;
    } catch (error) {
      clearTimeout(timeoutId);
      console.error('API Request failed:', error);
      
      // Handle specific error types
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          return {
            success: false,
            error: 'Request timeout - please check your internet connection',
          };
        }
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
  async getMarketplaceServices(token?: string): Promise<ApiResponse> {
    return this.request(API_CONFIG.ENDPOINTS.SERVICES.MARKETPLACE, {
      method: 'GET',
    }, token);
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
}

// Export singleton instance
export const apiService = new ApiService();
export default apiService;
