# API Configuration Update - LocalPro Mobile App

## Overview

This document outlines the comprehensive update to the API configuration for the LocalPro mobile app, focusing on endpoints that are applicable for both client and provider roles.

## What Was Updated

### 1. Enhanced API Configuration (`config/api.ts`)

The API configuration has been significantly expanded to include all shared client/provider endpoints organized by service category:

#### **Marketplace Endpoints**
- Services: Browse, search nearby, view details, upload images
- Bookings: Create, view, update status, upload photos, add reviews
- PayPal integration: Approve bookings, get order details

#### **Supplies Endpoints**
- Browse supplies, categories, featured items, nearby locations
- Order management: Create orders, update status, view order history
- Reviews and ratings system
- Image management: Upload and delete images

#### **Academy Endpoints**
- Course management: Browse, view details, categories, featured courses
- Enrollment system: Enroll in courses, track progress
- Content management: Upload thumbnails, videos, delete content
- Reviews and ratings

#### **Finance Endpoints**
- Financial overview, transactions, earnings, expenses
- Reports and analytics
- Expense tracking and withdrawal requests
- Tax documents and wallet settings

#### **Rentals Endpoints**
- Browse rentals, categories, featured items, nearby locations
- Booking system: Book rentals, update status
- Reviews and image management

#### **Ads Endpoints**
- Browse ads, categories, featured ads
- Click tracking and analytics
- Image management and promotion features

#### **Facility Care Endpoints**
- Browse services, nearby locations
- Booking system and status updates
- Reviews and image management

#### **LocalPro Plus Endpoints**
- Subscription plans and management
- Payment confirmation, cancellation, renewal
- Usage tracking and settings

#### **Trust Verification Endpoints**
- Verification requests and document management
- Verified users directory

#### **Communication Endpoints**
- Conversations and messaging system
- Email and SMS notifications
- Search and unread count tracking

#### **Analytics Endpoints**
- User, marketplace, jobs, referrals, and agency analytics
- Event tracking

#### **Maps Endpoints**
- Geocoding and reverse geocoding
- Places search and details
- Distance calculation and nearby search
- Service area validation

#### **Jobs Endpoints**
- Job browsing, searching, and application system
- Company logo uploads and statistics

#### **Referrals Endpoints**
- Referral code validation and tracking
- Leaderboard, stats, rewards, and invitation system

#### **Settings Endpoints**
- User settings management
- App configuration and health checks

#### **Provider Endpoints**
- Profile management and onboarding
- Document uploads and dashboard
- Performance analytics

#### **Payment Endpoints**
- PayPal and PayMaya integration
- Checkout, payment, and invoice management

### 2. Utility Functions and Helpers

Added comprehensive utility functions to make API usage easier:

#### **ApiUtils Object**
- `buildUrlWithParams()`: Build URLs with query parameters
- `getEndpoint()`: Handle dynamic endpoint functions
- `buildFullUrl()`: Build complete API URLs
- `paginationParams()`: Generate pagination parameters
- `locationParams()`: Generate location-based query parameters
- `searchParams()`: Generate search parameters

#### **Type Definitions**
- `ApiResponse<T>`: Standardized API response interface
- `ApiError`: Error response interface
- `API_REQUEST_CONFIG`: Common request configurations

#### **Environment Configuration**
- Development vs production URL handling
- Configurable timeouts and retry settings

### 3. Usage Examples (`config/api-usage-examples.ts`)

Created comprehensive examples showing how to use the updated API configuration:

#### **Basic API Calls**
- Fetching marketplace services
- Location-based queries
- Pagination handling
- Search functionality

#### **Advanced Usage**
- React hooks integration
- Error handling utilities
- API client class for advanced usage patterns

## Key Benefits

### 1. **Type Safety**
- Full TypeScript support with proper type definitions
- IntelliSense support for all endpoints
- Compile-time error checking

### 2. **Developer Experience**
- Organized endpoint structure by service category
- Dynamic endpoint functions for parameterized URLs
- Utility functions for common operations
- Comprehensive usage examples

### 3. **Maintainability**
- Centralized API configuration
- Consistent naming conventions
- Easy to add new endpoints
- Backward compatibility with legacy endpoints

### 4. **Flexibility**
- Support for both client and provider roles
- Environment-specific configurations
- Configurable timeouts and retry logic
- Query parameter handling

## Usage Examples

### Basic Usage
```typescript
import { API_CONFIG, buildApiUrl, getApiHeaders } from './config/api';

// Get all marketplace services
const url = buildApiUrl(API_CONFIG.ENDPOINTS.MARKETPLACE.SERVICES.ALL);
const response = await fetch(url, { headers: getApiHeaders(token) });
```

### With Dynamic Parameters
```typescript
// Get specific service by ID
const serviceId = '123';
const url = buildApiUrl(API_CONFIG.ENDPOINTS.MARKETPLACE.SERVICES.BY_ID(serviceId));
```

### With Query Parameters
```typescript
import { ApiUtils } from './config/api';

// Get nearby services with location
const params = ApiUtils.locationParams(40.7128, -74.0060, 5);
const url = ApiUtils.buildUrlWithParams(
  API_CONFIG.ENDPOINTS.MARKETPLACE.SERVICES.NEARBY,
  params
);
```

### Using the API Client Class
```typescript
import { LocalProApiClient } from './config/api-usage-examples';

const apiClient = new LocalProApiClient(token);

// Get services
const services = await apiClient.get(API_CONFIG.ENDPOINTS.MARKETPLACE.SERVICES.ALL);

// Create booking
const booking = await apiClient.post(
  API_CONFIG.ENDPOINTS.MARKETPLACE.BOOKINGS.CREATE,
  bookingData
);
```

## Migration Guide

### For Existing Code
1. **Update imports**: Use the new endpoint structure
2. **Replace hardcoded URLs**: Use the centralized configuration
3. **Add type safety**: Use the provided TypeScript interfaces
4. **Utilize utilities**: Use ApiUtils for common operations

### Before (Old Way)
```typescript
const response = await fetch('https://api.example.com/marketplace/services');
```

### After (New Way)
```typescript
import { API_CONFIG, buildApiUrl, getApiHeaders } from './config/api';

const url = buildApiUrl(API_CONFIG.ENDPOINTS.MARKETPLACE.SERVICES.ALL);
const response = await fetch(url, { headers: getApiHeaders(token) });
```

## Next Steps

1. **Update existing API calls** throughout the app to use the new configuration
2. **Add error handling** using the provided utilities
3. **Implement the API client class** for complex operations
4. **Add unit tests** for the new utility functions
5. **Update documentation** as new endpoints are added

## Files Modified/Created

- ✅ `config/api.ts` - Enhanced with comprehensive endpoint mappings
- ✅ `config/api-usage-examples.ts` - Usage examples and API client class
- ✅ `docs/API_CONFIGURATION_UPDATE.md` - This documentation

## Conclusion

This update provides a solid foundation for API management in the LocalPro mobile app, supporting both client and provider roles with a comprehensive, type-safe, and maintainable configuration system. The new structure makes it easy to add new endpoints, maintain existing ones, and provides excellent developer experience with full TypeScript support.
