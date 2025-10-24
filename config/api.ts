// API Configuration
export const API_CONFIG = {
  BASE_URL: 'https://localpro-super-app.onrender.com',
  TIMEOUT: 30000, // Increased timeout to 30 seconds
  ENDPOINTS: {
    // Health check
    HEALTH: '/health',
    
    AUTH: {
      SEND_CODE: '/api/auth/send-code',
      VERIFY_CODE: '/api/auth/verify-code',
      COMPLETE_ONBOARDING: '/api/auth/complete-onboarding',
      PROFILE_COMPLETENESS: '/api/auth/profile-completeness',
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
      MY_JOBS: '/api/jobs/my-jobs',
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

    // Agency Management endpoints
    AGENCIES: {
      ALL: '/api/agencies',
      BY_ID: (id: string) => `/api/agencies/${id}`,
      UPLOAD_LOGO: (id: string) => `/api/agencies/${id}/logo`,
      PROVIDERS: (id: string) => `/api/agencies/${id}/providers`,
      DELETE_PROVIDER: (id: string, providerId: string) => `/api/agencies/${id}/providers/${providerId}`,
      UPDATE_PROVIDER_STATUS: (id: string, providerId: string) => `/api/agencies/${id}/providers/${providerId}/status`,
      ADMINS: (id: string) => `/api/agencies/${id}/admins`,
      DELETE_ADMIN: (id: string, adminId: string) => `/api/agencies/${id}/admins/${adminId}`,
      ANALYTICS: (id: string) => `/api/agencies/${id}/analytics`,
      MY_AGENCIES: '/api/agencies/my/agencies',
      JOIN: (id: string) => `/api/agencies/${id}/join`,
      LEAVE: (id: string) => `/api/agencies/${id}/leave`,
    },

    // Global Search endpoints
    SEARCH: {
      ALL: '/api/search',
      SUGGESTIONS: '/api/search/suggestions',
      POPULAR: '/api/search/popular',
      ADVANCED: '/api/search/advanced',
      ENTITIES: '/api/search/entities',
      CATEGORIES: '/api/search/categories',
      LOCATIONS: '/api/search/locations',
      TRENDING: '/api/search/trending',
      ANALYTICS: '/api/search/analytics',
    },

    // Announcements endpoints
    ANNOUNCEMENTS: {
      ALL: '/api/announcements',
      BY_ID: (id: string) => `/api/announcements/${id}`,
    },

    // Activities & Discovery endpoints
    ACTIVITIES: {
      FEED: '/api/activities/feed',
      MY: '/api/activities/my',
      USER: (userId: string) => `/api/activities/user/${userId}`,
      BY_ID: (id: string) => `/api/activities/${id}`,
      ALL: '/api/activities',
      INTERACTIONS: (id: string) => `/api/activities/${id}/interactions`,
      STATS_MY: '/api/activities/stats/my',
      STATS_GLOBAL: '/api/activities/stats/global',
      METADATA: '/api/activities/metadata',
    },

    // Users endpoints
    USERS: {
      BY_ID: (id: string) => `/api/users/${id}`,
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

// Flat API endpoints collection for direct access
export const API_ENDPOINTS = {
  apiHealth: "/health",
  
  // Authentication & User Management
  authSendCode: "/api/auth/send-code",
  authVerifyCode: "/api/auth/verify-code",
  authCompleteOnboarding: "/api/auth/complete-onboarding",
  authProfileCompleteness: "/api/auth/profile-completeness",
  authMe: "/api/auth/me",
  authProfile: "/api/auth/profile",
  authUploadAvatar: "/api/auth/upload-avatar",
  authUploadPortfolio: "/api/auth/upload-portfolio",
  authLogout: "/api/auth/logout",
  
  // Marketplace Services
  marketplaceServices: "/api/marketplace/services",
  marketplaceServicesNearby: "/api/marketplace/services/nearby",
  marketplaceServiceById: "/api/marketplace/services",
  marketplaceMyServices: "/api/marketplace/my-services",
  marketplaceMyBookings: "/api/marketplace/my-bookings",
  marketplaceBookings: "/api/marketplace/bookings",
  marketplaceBookingStatus: "/api/marketplace/bookings",
  marketplaceBookingPhotos: "/api/marketplace/bookings",
  marketplaceBookingReview: "/api/marketplace/bookings",
  marketplacePayPalApprove: "/api/marketplace/bookings/paypal/approve",
  marketplacePayPalOrder: "/api/marketplace/bookings/paypal/order",
  
  // Job Board
  jobs: "/api/jobs",
  jobsSearch: "/api/jobs/search",
  jobsById: "/api/jobs",
  jobsMyApplications: "/api/jobs/my-applications",
  jobsMyJobs: "/api/jobs/my-jobs",
  jobsApply: "/api/jobs",
  jobsStats: "/api/jobs",
  jobsApplications: "/api/jobs",
  jobsApplicationStatus: "/api/jobs",
  
  // Academy & Learning
  academyCourses: "/api/academy/courses",
  academyCourseById: "/api/academy/courses",
  academyCategories: "/api/academy/categories",
  academyFeatured: "/api/academy/featured",
  academyMyCourses: "/api/academy/my-courses",
  academyMyCreatedCourses: "/api/academy/my-created-courses",
  academyCourseThumbnail: "/api/academy/courses",
  academyCourseVideos: "/api/academy/courses",
  academyCourseVideoDelete: "/api/academy/courses",
  academyEnroll: "/api/academy/courses",
  academyProgress: "/api/academy/courses",
  academyReviews: "/api/academy/courses",
  academyCoursesEnroll: "/api/academy/courses/[id]/enroll",
  academyCoursesProgress: "/api/academy/courses/[id]/progress",
  academyCoursesReviews: "/api/academy/courses/[id]/reviews",
  academyCoursesThumbnail: "/api/academy/courses/[id]/thumbnail",
  academyCoursesVideosById: "/api/academy/courses/[id]/videos/[videoId]",
  academyCoursesVideos: "/api/academy/courses/[id]/videos",
  academyCoursesById: "/api/academy/courses/[id]",
  academyStatistics: "/api/academy/statistics",
  
  // Supplies & Equipment
  supplies: "/api/supplies",
  suppliesCategories: "/api/supplies/categories",
  suppliesFeatured: "/api/supplies/featured",
  suppliesNearby: "/api/supplies/nearby",
  suppliesById: "/api/supplies",
  suppliesMySupplies: "/api/supplies/my-supplies",
  suppliesMyOrders: "/api/supplies/my-orders",
  suppliesImages: "/api/supplies",
  suppliesImageDelete: "/api/supplies",
  suppliesOrder: "/api/supplies",
  suppliesOrderStatus: "/api/supplies",
  suppliesReviews: "/api/supplies",
  
  // Equipment Rentals
  rentals: "/api/rentals",
  rentalsCategories: "/api/rentals/categories",
  rentalsFeatured: "/api/rentals/featured",
  rentalsNearby: "/api/rentals/nearby",
  rentalsById: "/api/rentals",
  rentalsMyRentals: "/api/rentals/my-rentals",
  rentalsMyBookings: "/api/rentals/my-bookings",
  rentalsImages: "/api/rentals",
  rentalsImageDelete: "/api/rentals",
  rentalsBook: "/api/rentals",
  rentalsBookingStatus: "/api/rentals",
  rentalsReviews: "/api/rentals",
  rentalsStatistics: "/api/rentals/statistics",
  
  // Facility Care Services
  facilityCare: "/api/facility-care",
  facilityCareNearby: "/api/facility-care/nearby",
  facilityCareById: "/api/facility-care",
  facilityCareMyServices: "/api/facility-care/my-services",
  facilityCareMyBookings: "/api/facility-care/my-bookings",
  facilityCareImages: "/api/facility-care",
  facilityCareImageDelete: "/api/facility-care",
  facilityCareBook: "/api/facility-care",
  facilityCareBookingStatus: "/api/facility-care",
  facilityCareReviews: "/api/facility-care",
  
  // Communication & Messaging
  communicationConversations: "/api/communication/conversations",
  communicationConversationById: "/api/communication/conversations",
  communicationConversationsMessagesById: "/api/communication/conversations/[id]/messages/[messageId]",
  communicationConversationsMessages: "/api/communication/conversations/[id]/messages",
  communicationConversationsRead: "/api/communication/conversations/[id]/read",
  communicationConversationsById: "/api/communication/conversations/[id]",
  communicationMessages: "/api/communication/conversations",
  communicationMessageUpdate: "/api/communication/conversations",
  communicationMessageDelete: "/api/communication/conversations",
  communicationRead: "/api/communication/conversations",
  communicationNotifications: "/api/communication/notifications",
  communicationNotificationCount: "/api/communication/notifications/count",
  communicationNotificationRead: "/api/communication/notifications",
  communicationNotificationReadAll: "/api/communication/notifications/read-all",
  communicationNotificationDelete: "/api/communication/notifications",
  communicationNotificationsReadAll: "/api/communication/notifications/read-all",
  communicationNotificationsRead: "/api/communication/notifications/[id]/read",
  communicationNotificationsById: "/api/communication/notifications/[id]",
  communicationEmailNotification: "/api/communication/notifications/email",
  communicationSmsNotification: "/api/communication/notifications/sms",
  communicationUnreadCount: "/api/communication/unread-count",
  communicationSearch: "/api/communication/search",
  communicationConversationWith: "/api/communication/conversation-with",
  communicationEvents: "/api/communication/events",
  communicationTyping: "/api/communication/typing",
  communicationTest: "/api/communication/test",
  
  // Advertising & Promotions
  ads: "/api/ads",
  adsCategories: "/api/ads/categories",
  adsFeatured: "/api/ads/featured",
  adsById: "/api/ads",
  adsClick: "/api/ads",
  adsMyAds: "/api/ads/my-ads",
  adsImages: "/api/ads",
  adsImageDelete: "/api/ads",
  adsPromote: "/api/ads",
  adsAnalytics: "/api/ads",
  adsStatistics: "/api/ads/statistics",
  analyticsCustom: "/api/analytics/custom",
  
  // Trust & Verification
  trustVerificationVerifiedUsers: "/api/trust-verification/verified-users",
  trustVerificationRequests: "/api/trust-verification/requests",
  trustVerificationRequestById: "/api/trust-verification/requests",
  trustVerificationRequestDocuments: "/api/trust-verification/requests",
  trustVerificationDocumentDelete: "/api/trust-verification/requests",
  trustVerificationMyRequests: "/api/trust-verification/my-requests",
  
  // Referral System
  referralsValidate: "/api/referrals/validate",
  referralsTrack: "/api/referrals/track",
  referralsLeaderboard: "/api/referrals/leaderboard",
  referralsMe: "/api/referrals/me",
  referralsStats: "/api/referrals/stats",
  referralsLinks: "/api/referrals/links",
  referralsRewards: "/api/referrals/rewards",
  referralsInvite: "/api/referrals/invite",
  referralsPreferences: "/api/referrals/preferences",
  
  // Financial Management
  financeOverview: "/api/finance/overview",
  financeTransactions: "/api/finance/transactions",
  financeEarnings: "/api/finance/earnings",
  financeExpenses: "/api/finance/expenses",
  financeReports: "/api/finance/reports",
  financeExpenseAdd: "/api/finance/expenses",
  financeWithdraw: "/api/finance/withdraw",
  financeTaxDocuments: "/api/finance/tax-documents",
  financeWalletSettings: "/api/finance/wallet/settings",
  
  // Google Maps Integration
  mapsGeocode: "/api/maps/geocode",
  mapsReverseGeocode: "/api/maps/reverse-geocode",
  mapsPlacesSearch: "/api/maps/places/search",
  mapsPlaceById: "/api/maps/places",
  mapsDistance: "/api/maps/distance",
  mapsNearby: "/api/maps/nearby",
  mapsValidateServiceArea: "/api/maps/validate-service-area",
  mapsAnalyzeCoverage: "/api/maps/analyze-coverage",
  
  // PayPal Integration
  paypalWebhook: "/api/paypal/webhook",
  
  // PayMaya Integration
  paymayaWebhook: "/api/paymaya/webhook",
  paymayaCheckout: "/api/paymaya/checkout",
  paymayaCheckoutById: "/api/paymaya/checkout",
  paymayaPayment: "/api/paymaya/payment",
  paymayaPaymentById: "/api/paymaya/payment",
  paymayaInvoice: "/api/paymaya/invoice",
  paymayaInvoiceById: "/api/paymaya/invoice",
  
  // Provider Management
  providers: "/api/providers",
  providersById: "/api/providers",
  providersProfileMe: "/api/providers/profile/me",
  providersProfile: "/api/providers/profile",
  providersOnboardingStep: "/api/providers/onboarding/step",
  providersDocumentsUpload: "/api/providers/documents/upload",
  providersDashboard: "/api/providers/dashboard/overview",
  providersAnalytics: "/api/providers/analytics/performance",
  providersDashboardOverview: "/api/providers/dashboard/overview",
  providersAnalyticsPerformance: "/api/providers/analytics/performance",
  
  // Agency Management
  agencies: "/api/agencies",
  agenciesById: "/api/agencies",
  agenciesLogo: "/api/agencies",
  agenciesProviders: "/api/agencies",
  agenciesProviderDelete: "/api/agencies",
  agenciesProviderStatus: "/api/agencies",
  agenciesAdmins: "/api/agencies",
  agenciesAdminDelete: "/api/agencies",
  agenciesAnalytics: "/api/agencies",
  agenciesMyAgencies: "/api/agencies/my/agencies",
  agenciesJoin: "/api/agencies/join",
  agenciesLeave: "/api/agencies/leave",
  
  // LocalPro Plus Subscriptions
  localProPlusPlans: "/api/localpro-plus/plans",
  localProPlusPlanById: "/api/localpro-plus/plans",
  localProPlusSubscribe: "/api/localpro-plus/subscribe",
  localProPlusConfirmPayment: "/api/localpro-plus/confirm-payment",
  localProPlusCancel: "/api/localpro-plus/cancel",
  localProPlusRenew: "/api/localpro-plus/renew",
  localProPlusMySubscription: "/api/localpro-plus/my-subscription",
  localProPlusSettings: "/api/localpro-plus/settings",
  localProPlusUsage: "/api/localpro-plus/usage",
  
  // Settings Management
  settingsUser: "/api/settings/user",
  settingsUserCategory: "/api/settings/user",
  settingsUserReset: "/api/settings/user/reset",
  settingsUserDelete: "/api/settings/user",
  settingsApp: "/api/settings/app",
  settingsAppCategory: "/api/settings/app",
  settingsAppFeaturesToggle: "/api/settings/app/features/toggle",
  settingsAppPublic: "/api/settings/app/public",
  settingsAppHealth: "/api/settings/app/health",
  
  // Analytics & Insights
  analyticsOverview: "/api/analytics/overview",
  analyticsUser: "/api/analytics/user",
  analyticsMarketplace: "/api/analytics/marketplace",
  analyticsJobs: "/api/analytics/jobs",
  analyticsReferrals: "/api/analytics/referrals",
  analyticsAgencies: "/api/analytics/agencies",
  analyticsTrack: "/api/analytics/track",
  
  // Global Search
  search: "/api/search",
  searchSuggestions: "/api/search/suggestions",
  searchPopular: "/api/search/popular",
  searchAdvanced: "/api/search/advanced",
  searchEntities: "/api/search/entities",
  searchCategories: "/api/search/categories",
  searchLocations: "/api/search/locations",
  searchTrending: "/api/search/trending",
  searchAnalytics: "/api/search/analytics",
  
  // Announcements
  announcements: "/api/announcements",
  announcementsById: "/api/announcements",
  
  // Activities & Discovery
  activitiesFeed: "/api/activities/feed",
  activitiesMy: "/api/activities/my",
  activitiesUser: "/api/activities/user",
  activitiesById: "/api/activities",
  activities: "/api/activities",
  activitiesInteractions: "/api/activities",
  activitiesStatsMy: "/api/activities/stats/my",
  activitiesStatsGlobal: "/api/activities/stats/global",
  activitiesMetadata: "/api/activities/metadata",
  activitiesUserById: "/api/activities/user/[userId]",

  usersById: "/api/users",
} as const;

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
