// Environment Configuration
export const ENV = {
  // API Configuration
  API_BASE_URL: 'https://localpro-super-app.onrender.com',
  API_TIMEOUT: 10000,
  
  // App Configuration
  APP_NAME: 'LocalPro Super App',
  APP_VERSION: '1.0.0',
  
  // Development flags
  IS_DEVELOPMENT: __DEV__,
  ENABLE_LOGGING: __DEV__,
  
  // Feature flags
  FEATURES: {
    ENABLE_ANALYTICS: true,
    ENABLE_CRASH_REPORTING: true,
    ENABLE_PUSH_NOTIFICATIONS: true,
  },
  
  // Storage keys
  STORAGE_KEYS: {
    USER: 'localpro_user',
    TOKENS: 'localpro_tokens',
    SETTINGS: 'localpro_settings',
    CACHE: 'localpro_cache',
  },
};

// Helper function to get API URL
export const getApiUrl = (endpoint: string): string => {
  return `${ENV.API_BASE_URL}${endpoint}`;
};

// Helper function to log in development
export const devLog = (message: string, data?: any) => {
  if (ENV.ENABLE_LOGGING) {
    console.log(`[LocalPro] ${message}`, data || '');
  }
};

// Helper function to log errors
export const devError = (message: string, error?: any) => {
  if (ENV.ENABLE_LOGGING) {
    console.error(`[LocalPro Error] ${message}`, error || '');
  }
};
