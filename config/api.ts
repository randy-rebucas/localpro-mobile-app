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
