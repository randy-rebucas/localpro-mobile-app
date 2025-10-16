# LocalPro Super App - API Setup

This document describes the API configuration and setup for the LocalPro Super App.

## API Endpoint

**Base URL**: `https://localpro-super-app.onrender.com`

## Configuration Files

### 1. API Configuration (`config/api.ts`)
- Contains all API endpoints and configuration
- Defines the base URL and timeout settings
- Provides helper functions for building URLs and headers

### 2. Environment Configuration (`config/environment.ts`)
- Centralized environment variables
- Development flags and feature toggles
- Storage keys and app configuration

### 3. API Service (`services/api.ts`)
- HTTP client for making API requests
- Authentication methods
- Service-specific API calls
- Error handling and response formatting

## API Endpoints

### Authentication
- `POST /api/auth/send-code` - Send verification code to phone
- `POST /api/auth/verify-code` - Verify phone code and create/login user
- `GET /api/auth/me` - Get current user profile
- `PUT /api/auth/profile` - Update user profile
- `POST /api/auth/upload-avatar` - Upload user avatar
- `POST /api/auth/upload-portfolio` - Upload portfolio images
- `POST /api/auth/logout` - Logout user

### Services
- `GET /api/services/marketplace` - Get marketplace services
- `GET /api/services/supplies` - Get supplies and materials
- `GET /api/services/academy` - Get academy courses
- `GET /api/services/finance` - Get finance data
- `GET /api/services/rentals` - Get rental items
- `GET /api/services/ads` - Get advertisements
- `GET /api/services/facility-care` - Get facility care services
- `GET /api/services/plus` - Get LocalPro Plus plans

## Authentication Flow

1. **Send Verification Code**
   ```typescript
   POST /api/auth/send-code
   Body: { phone: string }
   ```

2. **Verify Code**
   ```typescript
   POST /api/auth/verify-code
   Body: { phone: string, code: string, name: string, type: 'provider' | 'client' }
   Response: { user: User, token: string, refreshToken: string }
   ```

3. **Get Current User**
   ```typescript
   GET /api/auth/me
   Headers: { Authorization: 'Bearer <token>' }
   Response: { user: User }
   ```

4. **Use Token**
   ```typescript
   Headers: { Authorization: 'Bearer <token>' }
   ```

## Error Handling

The API service includes comprehensive error handling:

- Network errors
- HTTP status errors
- API response errors
- Token expiration and refresh

## Development vs Production

### Development
- Detailed logging enabled
- Error messages shown to user
- Debug information available

### Production
- Minimal logging
- User-friendly error messages
- Performance optimized

## Usage Example

```typescript
import { apiService } from '../services/api';

// Send verification code
try {
  await apiService.sendVerificationCode('+1234567890');
} catch (error) {
  console.error('Failed to send code:', error);
}

// Verify code
try {
  const response = await apiService.verifyCode('+1234567890', '123456', 'John Doe', 'provider');
  if (response.success) {
    // User authenticated successfully
    const { user, token } = response.data;
  }
} catch (error) {
  console.error('Verification failed:', error);
}
```

## Environment Variables

The app uses the following environment configuration:

- `API_BASE_URL`: Base URL for the API
- `API_TIMEOUT`: Request timeout in milliseconds
- `ENABLE_LOGGING`: Enable/disable debug logging
- `FEATURES`: Feature flags for enabling/disabling functionality

## Security

- All API requests use HTTPS
- JWT tokens for authentication
- Automatic token refresh
- Secure storage of sensitive data
- Input validation and sanitization

## Monitoring

The API service includes:
- Request/response logging
- Error tracking
- Performance monitoring
- Network status detection
