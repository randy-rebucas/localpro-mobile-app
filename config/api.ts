// API Configuration
export const API_CONFIG = {
  BASE_URL: 'https://localpro-super-app.onrender.com',
  TIMEOUT: 10000,
  ENDPOINTS: {
    AUTH: {
      SEND_CODE: '/api/auth/send-code',
      VERIFY_CODE: '/api/auth/verify-code',
      ME: '/api/auth/me',
      UPDATE_PROFILE: '/api/auth/profile',
      UPLOAD_AVATAR: '/api/auth/upload-avatar',
      UPLOAD_PORTFOLIO: '/api/auth/upload-portfolio',
      LOGOUT: '/api/auth/logout',
    },
    
    // Marketplace endpoints (shared for client & provider)
    MARKETPLACE: {
      SERVICES: {
        ALL: '/api/marketplace/services',
        NEARBY: '/api/marketplace/services/nearby',
        BY_ID: (id: string) => `/api/marketplace/services/${id}`,
        UPLOAD_IMAGES: (id: string) => `/api/marketplace/services/${id}/images`,
      },
      BOOKINGS: {
        CREATE: '/api/marketplace/bookings',
        GET_ALL: '/api/marketplace/bookings',
        UPDATE_STATUS: (id: string) => `/api/marketplace/bookings/${id}/status`,
        UPLOAD_PHOTOS: (id: string) => `/api/marketplace/bookings/${id}/photos`,
        ADD_REVIEW: (id: string) => `/api/marketplace/bookings/${id}/review`,
        PAYPAL_APPROVE: '/api/marketplace/bookings/paypal/approve',
        PAYPAL_ORDER: (orderId: string) => `/api/marketplace/bookings/paypal/order/${orderId}`,
      },
    },

    // Supplies endpoints (shared for client & provider)
    SUPPLIES: {
      ALL: '/api/supplies',
      CATEGORIES: '/api/supplies/categories',
      FEATURED: '/api/supplies/featured',
      NEARBY: '/api/supplies/nearby',
      BY_ID: (id: string) => `/api/supplies/${id}`,
      UPLOAD_IMAGES: (id: string) => `/api/supplies/${id}/images`,
      DELETE_IMAGE: (id: string, imageId: string) => `/api/supplies/${id}/images/${imageId}`,
      ORDER: (id: string) => `/api/supplies/${id}/order`,
      UPDATE_ORDER_STATUS: (id: string, orderId: string) => `/api/supplies/${id}/orders/${orderId}/status`,
      ADD_REVIEW: (id: string) => `/api/supplies/${id}/reviews`,
      MY_SUPPLIES: '/api/supplies/my-supplies',
      MY_ORDERS: '/api/supplies/my-orders',
    },

    // Academy endpoints (shared for client & provider)
    ACADEMY: {
      COURSES: {
        ALL: '/api/academy/courses',
        BY_ID: (id: string) => `/api/academy/courses/${id}`,
        CATEGORIES: '/api/academy/categories',
        FEATURED: '/api/academy/featured',
        UPLOAD_THUMBNAIL: (id: string) => `/api/academy/courses/${id}/thumbnail`,
        UPLOAD_VIDEO: (id: string) => `/api/academy/courses/${id}/videos`,
        DELETE_VIDEO: (id: string, videoId: string) => `/api/academy/courses/${id}/videos/${videoId}`,
        ENROLL: (id: string) => `/api/academy/courses/${id}/enroll`,
        UPDATE_PROGRESS: (id: string) => `/api/academy/courses/${id}/progress`,
        ADD_REVIEW: (id: string) => `/api/academy/courses/${id}/reviews`,
        MY_COURSES: '/api/academy/my-courses',
        MY_CREATED: '/api/academy/my-created-courses',
      },
    },

    // Finance endpoints (shared for client & provider)
    FINANCE: {
      OVERVIEW: '/api/finance/overview',
      TRANSACTIONS: '/api/finance/transactions',
      EARNINGS: '/api/finance/earnings',
      EXPENSES: '/api/finance/expenses',
      REPORTS: '/api/finance/reports',
      ADD_EXPENSE: '/api/finance/expenses',
      WITHDRAW: '/api/finance/withdraw',
      TAX_DOCUMENTS: '/api/finance/tax-documents',
      WALLET_SETTINGS: '/api/finance/wallet/settings',
    },

    // Rentals endpoints (shared for client & provider)
    RENTALS: {
      ALL: '/api/rentals',
      CATEGORIES: '/api/rentals/categories',
      FEATURED: '/api/rentals/featured',
      NEARBY: '/api/rentals/nearby',
      BY_ID: (id: string) => `/api/rentals/${id}`,
      UPLOAD_IMAGES: (id: string) => `/api/rentals/${id}/images`,
      DELETE_IMAGE: (id: string, imageId: string) => `/api/rentals/${id}/images/${imageId}`,
      BOOK: (id: string) => `/api/rentals/${id}/book`,
      UPDATE_BOOKING_STATUS: (id: string, bookingId: string) => `/api/rentals/${id}/bookings/${bookingId}/status`,
      ADD_REVIEW: (id: string) => `/api/rentals/${id}/reviews`,
      MY_RENTALS: '/api/rentals/my-rentals',
      MY_BOOKINGS: '/api/rentals/my-bookings',
    },

    // Ads endpoints (shared for client & provider)
    ADS: {
      ALL: '/api/ads',
      CATEGORIES: '/api/ads/categories',
      FEATURED: '/api/ads/featured',
      BY_ID: (id: string) => `/api/ads/${id}`,
      CLICK: (id: string) => `/api/ads/${id}/click`,
      UPLOAD_IMAGES: (id: string) => `/api/ads/${id}/images`,
      DELETE_IMAGE: (id: string, imageId: string) => `/api/ads/${id}/images/${imageId}`,
      PROMOTE: (id: string) => `/api/ads/${id}/promote`,
      ANALYTICS: (id: string) => `/api/ads/${id}/analytics`,
      MY_ADS: '/api/ads/my-ads',
    },

    // Facility Care endpoints (shared for client & provider)
    FACILITY_CARE: {
      ALL: '/api/facility-care',
      NEARBY: '/api/facility-care/nearby',
      BY_ID: (id: string) => `/api/facility-care/${id}`,
      UPLOAD_IMAGES: (id: string) => `/api/facility-care/${id}/images`,
      DELETE_IMAGE: (id: string, imageId: string) => `/api/facility-care/${id}/images/${imageId}`,
      BOOK: (id: string) => `/api/facility-care/${id}/book`,
      UPDATE_BOOKING_STATUS: (id: string, bookingId: string) => `/api/facility-care/${id}/bookings/${bookingId}/status`,
      ADD_REVIEW: (id: string) => `/api/facility-care/${id}/reviews`,
      MY_SERVICES: '/api/facility-care/my-services',
      MY_BOOKINGS: '/api/facility-care/my-bookings',
    },

    // LocalPro Plus endpoints (shared for client & provider)
    LOCALPRO_PLUS: {
      PLANS: {
        ALL: '/api/localpro-plus/plans',
        BY_ID: (id: string) => `/api/localpro-plus/plans/${id}`,
      },
      SUBSCRIBE: (planId: string) => `/api/localpro-plus/subscribe/${planId}`,
      CONFIRM_PAYMENT: '/api/localpro-plus/confirm-payment',
      CANCEL: '/api/localpro-plus/cancel',
      RENEW: '/api/localpro-plus/renew',
      MY_SUBSCRIPTION: '/api/localpro-plus/my-subscription',
      SETTINGS: '/api/localpro-plus/settings',
      USAGE: '/api/localpro-plus/usage',
    },

    // Trust Verification endpoints (shared for client & provider)
    TRUST_VERIFICATION: {
      VERIFIED_USERS: '/api/trust-verification/verified-users',
      REQUESTS: {
        ALL: '/api/trust-verification/requests',
        BY_ID: (id: string) => `/api/trust-verification/requests/${id}`,
        CREATE: '/api/trust-verification/requests',
        UPDATE: (id: string) => `/api/trust-verification/requests/${id}`,
        DELETE: (id: string) => `/api/trust-verification/requests/${id}`,
        UPLOAD_DOCUMENTS: (id: string) => `/api/trust-verification/requests/${id}/documents`,
        DELETE_DOCUMENT: (id: string, documentId: string) => `/api/trust-verification/requests/${id}/documents/${documentId}`,
        MY_REQUESTS: '/api/trust-verification/my-requests',
      },
    },

    // Communication endpoints (shared for client & provider)
    COMMUNICATION: {
      CONVERSATIONS: {
        ALL: '/api/communication/conversations',
        BY_ID: (id: string) => `/api/communication/conversations/${id}`,
        CREATE: '/api/communication/conversations',
        DELETE: (id: string) => `/api/communication/conversations/${id}`,
        WITH_USER: (userId: string) => `/api/communication/conversation-with/${userId}`,
      },
      MESSAGES: {
        SEND: (id: string) => `/api/communication/conversations/${id}/messages`,
        UPDATE: (id: string, messageId: string) => `/api/communication/conversations/${id}/messages/${messageId}`,
        DELETE: (id: string, messageId: string) => `/api/communication/conversations/${id}/messages/${messageId}`,
      },
      NOTIFICATIONS: {
        EMAIL: '/api/communication/notifications/email',
        SMS: '/api/communication/notifications/sms',
      },
      UNREAD_COUNT: '/api/communication/unread-count',
      SEARCH: '/api/communication/search',
      MARK_READ: (id: string) => `/api/communication/conversations/${id}/read`,
    },

    // Analytics endpoints (shared for client & provider)
    ANALYTICS: {
      OVERVIEW: '/api/analytics/overview',
      USER: '/api/analytics/user',
      MARKETPLACE: '/api/analytics/marketplace',
      JOBS: '/api/analytics/jobs',
      REFERRALS: '/api/analytics/referrals',
      AGENCIES: '/api/analytics/agencies',
      TRACK: '/api/analytics/track',
    },

    // Maps endpoints (shared for client & provider)
    MAPS: {
      GEOCODE: '/api/maps/geocode',
      REVERSE_GEOCODE: '/api/maps/reverse-geocode',
      PLACES: {
        SEARCH: '/api/maps/places/search',
        BY_ID: (placeId: string) => `/api/maps/places/${placeId}`,
      },
      DISTANCE: '/api/maps/distance',
      NEARBY: '/api/maps/nearby',
      VALIDATE_SERVICE_AREA: '/api/maps/validate-service-area',
      ANALYZE_COVERAGE: '/api/maps/analyze-coverage',
    },

    // Jobs endpoints (shared for client & provider)
    JOBS: {
      ALL: '/api/jobs',
      SEARCH: '/api/jobs/search',
      BY_ID: (id: string) => `/api/jobs/${id}`,
      UPLOAD_LOGO: (id: string) => `/api/jobs/${id}/logo`,
      STATS: (id: string) => `/api/jobs/${id}/stats`,
      APPLY: (id: string) => `/api/jobs/${id}/apply`,
      MY_APPLICATIONS: '/api/jobs/my-applications',
      UPDATE_APPLICATION_STATUS: (id: string, applicationId: string) => `/api/jobs/${id}/applications/${applicationId}/status`,
    },

    // Referrals endpoints (shared for client & provider)
    REFERRALS: {
      VALIDATE: '/api/referrals/validate',
      TRACK: '/api/referrals/track',
      LEADERBOARD: '/api/referrals/leaderboard',
      ME: '/api/referrals/me',
      STATS: '/api/referrals/stats',
      LINKS: '/api/referrals/links',
      REWARDS: '/api/referrals/rewards',
      INVITE: '/api/referrals/invite',
      PREFERENCES: '/api/referrals/preferences',
    },

    // Settings endpoints (shared for client & provider)
    SETTINGS: {
      USER: {
        GET: '/api/settings/user',
        UPDATE: '/api/settings/user',
        UPDATE_CATEGORY: (category: string) => `/api/settings/user/${category}`,
        RESET: '/api/settings/user/reset',
        DELETE: '/api/settings/user',
      },
      APP: {
        PUBLIC: '/api/settings/app/public',
        HEALTH: '/api/settings/app/health',
      },
    },

    // Provider endpoints (shared for client & provider)
    PROVIDERS: {
      ALL: '/api/providers',
      BY_ID: (id: string) => `/api/providers/${id}`,
      PROFILE: {
        ME: '/api/providers/profile/me',
        CREATE: '/api/providers/profile',
        UPDATE: '/api/providers/profile',
      },
      ONBOARDING: {
        UPDATE_STEP: '/api/providers/onboarding/step',
      },
      DOCUMENTS: {
        UPLOAD: '/api/providers/documents/upload',
      },
      DASHBOARD: {
        OVERVIEW: '/api/providers/dashboard/overview',
      },
      ANALYTICS: {
        PERFORMANCE: '/api/providers/analytics/performance',
      },
    },

    // Payment endpoints (shared for client & provider)
    PAYPAL: {
      WEBHOOK: '/api/paypal/webhook',
    },

    PAYMAYA: {
      WEBHOOK: '/api/paymaya/webhook',
      CHECKOUT: {
        CREATE: '/api/paymaya/checkout',
        GET: (checkoutId: string) => `/api/paymaya/checkout/${checkoutId}`,
      },
      PAYMENT: {
        CREATE: '/api/paymaya/payment',
        GET: (paymentId: string) => `/api/paymaya/payment/${paymentId}`,
      },
      INVOICE: {
        CREATE: '/api/paymaya/invoice',
        GET: (invoiceId: string) => `/api/paymaya/invoice/${invoiceId}`,
      },
    },

    // Legacy service endpoints (keeping for backward compatibility)
    SERVICES: {
      MARKETPLACE: '/api/services/marketplace',
      SUPPLIES: '/api/services/supplies',
      ACADEMY: '/api/services/academy',
      FINANCE: '/api/services/finance',
      RENTALS: '/api/services/rentals',
      ADS: '/api/services/ads',
      FACILITY_CARE: '/api/services/facility-care',
      PLUS: '/api/services/plus',
    },
  },
};

// Helper function to build full API URL
export const buildApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

// API Headers
export const getApiHeaders = (token?: string) => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};

// Utility functions for common API operations
export const ApiUtils = {
  // Build URL with query parameters
  buildUrlWithParams: (baseUrl: string, params: Record<string, any>): string => {
    const url = new URL(baseUrl, API_CONFIG.BASE_URL);
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, String(value));
      }
    });
    return url.toString();
  },

  // Get endpoint with dynamic parameters
  getEndpoint: (endpoint: string | ((...args: any[]) => string), ...args: any[]): string => {
    if (typeof endpoint === 'function') {
      return endpoint(...args);
    }
    return endpoint;
  },

  // Build full API URL with endpoint function
  buildFullUrl: (endpoint: string | ((...args: any[]) => string), ...args: any[]): string => {
    const endpointUrl = ApiUtils.getEndpoint(endpoint, ...args);
    return buildApiUrl(endpointUrl);
  },

  // Common query parameters for pagination
  paginationParams: (page: number = 1, limit: number = 10) => ({
    page,
    limit,
    offset: (page - 1) * limit,
  }),

  // Common query parameters for location-based queries
  locationParams: (latitude: number, longitude: number, radius: number = 10) => ({
    lat: latitude,
    lng: longitude,
    radius,
  }),

  // Common query parameters for search
  searchParams: (query: string, filters?: Record<string, any>) => ({
    q: query,
    ...filters,
  }),
};

// Type definitions for better TypeScript support
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiError {
  success: false;
  error: string;
  message?: string;
  code?: number;
}

// Common API request configurations
export const API_REQUEST_CONFIG = {
  timeout: API_CONFIG.TIMEOUT,
  retries: 3,
  retryDelay: 1000,
};

// Environment-specific configurations
export const getApiConfig = () => {
  const isDevelopment = __DEV__;
  
  return {
    ...API_CONFIG,
    BASE_URL: isDevelopment 
      ? 'http://localhost:3000' // Development URL
      : API_CONFIG.BASE_URL, // Production URL
    TIMEOUT: isDevelopment ? 30000 : API_CONFIG.TIMEOUT, // Longer timeout for development
  };
};
