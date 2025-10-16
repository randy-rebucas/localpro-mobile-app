import * as Location from 'expo-location';

/**
 * Location-based country detection service
 */

/**
 * Country code mappings based on ISO country codes
 */
const COUNTRY_CODE_MAP: Record<string, string> = {
  // North America
  'US': '+1',    // United States
  'CA': '+1',    // Canada
  
  // Asia Pacific
  'PH': '+63',   // Philippines
  'CN': '+86',   // China
  'JP': '+81',   // Japan
  'KR': '+82',   // South Korea
  'IN': '+91',   // India
  'AU': '+61',   // Australia
  'SG': '+65',   // Singapore
  'MY': '+60',   // Malaysia
  'TH': '+66',   // Thailand
  'VN': '+84',   // Vietnam
  'ID': '+62',   // Indonesia
  
  // Europe
  'GB': '+44',   // United Kingdom
  'DE': '+49',   // Germany
  'FR': '+33',   // France
  'IT': '+39',   // Italy
  'ES': '+34',   // Spain
  'NL': '+31',   // Netherlands
  'SE': '+46',   // Sweden
  'NO': '+47',   // Norway
  'DK': '+45',   // Denmark
  'CH': '+41',   // Switzerland
  'AT': '+43',   // Austria
  
  // Middle East & Africa
  'AE': '+971',  // UAE
  'SA': '+966',  // Saudi Arabia
  'EG': '+20',   // Egypt
  'ZA': '+27',   // South Africa
  'NG': '+234',  // Nigeria
  'KE': '+254',  // Kenya
  
  // South America
  'BR': '+55',   // Brazil
  'MX': '+52',   // Mexico
  'AR': '+54',   // Argentina
  'CL': '+56',   // Chile
  'CO': '+57',   // Colombia
};

/**
 * Get the user's current location and return country code
 * @returns Promise<string | null> - Country code (e.g., 'PH', 'US') or null if not available
 */
export async function getCurrentCountryCode(): Promise<string | null> {
  try {
    // Request location permissions
    const { status } = await Location.requestForegroundPermissionsAsync();
    
    if (status !== 'granted') {
      console.log('Location permission denied');
      return null;
    }

    // Get current position
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
      timeout: 10000,
    });

    // Reverse geocode to get country
    const reverseGeocode = await Location.reverseGeocodeAsync({
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    });

    if (reverseGeocode.length > 0) {
      const countryCode = reverseGeocode[0].isoCountryCode;
      console.log('Detected country code:', countryCode);
      return countryCode;
    }

    return null;
  } catch (error) {
    console.error('Error getting location:', error);
    return null;
  }
}

/**
 * Get phone country code from location-based country code
 * @param countryCode - ISO country code (e.g., 'PH', 'US')
 * @returns Phone country code (e.g., '+63', '+1') or null if not found
 */
export function getPhoneCountryCodeFromLocation(countryCode: string | null): string | null {
  if (!countryCode) return null;
  return COUNTRY_CODE_MAP[countryCode.toUpperCase()] || null;
}

/**
 * Get user's location-based phone country code
 * @returns Promise<string | null> - Phone country code (e.g., '+63', '+1') or null if not available
 */
export async function getLocationBasedPhoneCountryCode(): Promise<string | null> {
  const countryCode = await getCurrentCountryCode();
  return getPhoneCountryCodeFromLocation(countryCode);
}

/**
 * Check if location services are available and permission is granted
 * @returns Promise<boolean> - True if location services are available
 */
export async function isLocationAvailable(): Promise<boolean> {
  try {
    const { status } = await Location.getForegroundPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.error('Error checking location availability:', error);
    return false;
  }
}

/**
 * Request location permissions
 * @returns Promise<boolean> - True if permission granted
 */
export async function requestLocationPermission(): Promise<boolean> {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.error('Error requesting location permission:', error);
    return false;
  }
}
