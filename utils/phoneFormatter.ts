/**
 * Phone number formatting utilities
 */

import { getLocationBasedPhoneCountryCode } from './locationService';

/**
 * Country code mappings for common countries
 */
const COUNTRY_CODE_MAP: Record<string, string> = {
  // North America
  '1': '+1',    // US, Canada
  
  // Asia Pacific
  '63': '+63',  // Philippines
  '86': '+86',  // China
  '81': '+81',  // Japan
  '82': '+82',  // South Korea
  '91': '+91',  // India
  '61': '+61',  // Australia
  '65': '+65',  // Singapore
  '60': '+60',  // Malaysia
  '66': '+66',  // Thailand
  '84': '+84',  // Vietnam
  '62': '+62',  // Indonesia
  
  // Europe
  '44': '+44',  // UK
  '49': '+49',  // Germany
  '33': '+33',  // France
  '39': '+39',  // Italy
  '34': '+34',  // Spain
  '31': '+31',  // Netherlands
  '46': '+46',  // Sweden
  '47': '+47',  // Norway
  '45': '+45',  // Denmark
  '41': '+41',  // Switzerland
  '43': '+43',  // Austria
  
  // Middle East & Africa
  '971': '+971', // UAE
  '966': '+966', // Saudi Arabia
  '20': '+20',   // Egypt
  '27': '+27',   // South Africa
  '234': '+234', // Nigeria
  '254': '+254', // Kenya
  
  // South America
  '55': '+55',   // Brazil
  '52': '+52',   // Mexico
  '54': '+54',   // Argentina
  '56': '+56',   // Chile
  '57': '+57',   // Colombia
};

/**
 * Detects country code from phone number digits
 * @param digitsOnly - Phone number with only digits
 * @returns Detected country code or null if not found
 */
function detectCountryCode(digitsOnly: string): string | null {
  // Define country codes with their expected phone number lengths
  const countryCodeRules = [
    // 3-digit country codes
    { code: '971', length: 9, name: 'UAE' },
    { code: '966', length: 9, name: 'Saudi Arabia' },
    { code: '234', length: 10, name: 'Nigeria' },
    { code: '254', length: 9, name: 'Kenya' },
    
    // 2-digit country codes
    { code: '63', length: 10, name: 'Philippines' },
    { code: '86', length: 11, name: 'China' },
    { code: '81', length: 10, name: 'Japan' },
    { code: '82', length: 10, name: 'South Korea' },
    { code: '91', length: 10, name: 'India' },
    { code: '61', length: 9, name: 'Australia' },
    { code: '65', length: 8, name: 'Singapore' },
    { code: '60', length: 9, name: 'Malaysia' },
    { code: '66', length: 9, name: 'Thailand' },
    { code: '84', length: 9, name: 'Vietnam' },
    { code: '62', length: 10, name: 'Indonesia' },
    { code: '44', length: 10, name: 'UK' },
    { code: '49', length: 10, name: 'Germany' },
    { code: '33', length: 9, name: 'France' },
    { code: '39', length: 10, name: 'Italy' },
    { code: '34', length: 9, name: 'Spain' },
    { code: '31', length: 9, name: 'Netherlands' },
    { code: '46', length: 9, name: 'Sweden' },
    { code: '47', length: 8, name: 'Norway' },
    { code: '45', length: 8, name: 'Denmark' },
    { code: '41', length: 9, name: 'Switzerland' },
    { code: '43', length: 10, name: 'Austria' },
    { code: '20', length: 10, name: 'Egypt' },
    { code: '27', length: 9, name: 'South Africa' },
    { code: '55', length: 11, name: 'Brazil' },
    { code: '52', length: 10, name: 'Mexico' },
    { code: '54', length: 10, name: 'Argentina' },
    { code: '56', length: 9, name: 'Chile' },
    { code: '57', length: 10, name: 'Colombia' },
    
    // 1-digit country codes
    { code: '1', length: 10, name: 'US/Canada' },
  ];
  
  // Try to match country codes, prioritizing longer ones
  for (const rule of countryCodeRules) {
    if (digitsOnly.startsWith(rule.code)) {
      const remainingDigits = digitsOnly.substring(rule.code.length);
      // Check if the remaining digits match the expected length (with some flexibility)
      if (remainingDigits.length >= rule.length - 1 && remainingDigits.length <= rule.length + 1) {
        return `+${rule.code}`;
      }
    }
  }
  
  return null;
}

/**
 * Formats a phone number to international format (E.164) using location-based country detection
 * @param phone - The phone number to format
 * @param fallbackCountryCode - Fallback country code if detection fails (default: '+1' for US)
 * @returns Promise<string> - Formatted phone number in E.164 format
 */
export async function formatPhoneToInternational(phone: string, fallbackCountryCode: string = '+1'): Promise<string> {
  if (!phone || phone.trim() === '') {
    return '';
  }
  
  // Remove all non-digit characters
  const digitsOnly = phone.replace(/\D/g, '');
  
  if (digitsOnly === '') {
    return '';
  }
  
  // If phone already starts with +, return as is
  if (phone.startsWith('+')) {
    return phone;
  }
  
  // Try to detect country code from the number first
  const detectedCountryCode = detectCountryCode(digitsOnly);
  
  if (detectedCountryCode) {
    // Remove the country code digits from the number
    const countryCodeDigits = detectedCountryCode.replace('+', '');
    const phoneWithoutCountryCode = digitsOnly.substring(countryCodeDigits.length);
    
    // Return formatted number with detected country code
    return `${detectedCountryCode}${phoneWithoutCountryCode}`;
  }
  
  // If no country code detected in the number, try location-based detection
  try {
    const locationBasedCountryCode = await getLocationBasedPhoneCountryCode();
    if (locationBasedCountryCode) {
      console.log('Using location-based country code:', locationBasedCountryCode);
      return `${locationBasedCountryCode}${digitsOnly}`;
    }
  } catch (error) {
    console.log('Location-based detection failed, using fallback:', error);
  }
  
  // Special case: If no country code detected, try to infer from number patterns
  // Philippine mobile numbers typically start with 9 and are 10 digits total
  if (digitsOnly.length === 10 && digitsOnly.startsWith('9')) {
    return `+63${digitsOnly}`;
  }
  
  // US/Canada numbers are typically 10 digits
  if (digitsOnly.length === 10 && !digitsOnly.startsWith('0')) {
    return `+1${digitsOnly}`;
  }
  
  // If no country code detected, use fallback
  const fallbackDigits = fallbackCountryCode.replace('+', '');
  if (digitsOnly.startsWith(fallbackDigits)) {
    return `+${digitsOnly}`;
  }
  
  // Add fallback country code if not present
  return `${fallbackCountryCode}${digitsOnly}`;
}

/**
 * Synchronous version of formatPhoneToInternational for backward compatibility
 * @param phone - The phone number to format
 * @param fallbackCountryCode - Fallback country code if detection fails (default: '+1' for US)
 * @returns Formatted phone number in E.164 format
 */
export function formatPhoneToInternationalSync(phone: string, fallbackCountryCode: string = '+1'): string {
  if (!phone || phone.trim() === '') {
    return '';
  }
  
  // Remove all non-digit characters
  const digitsOnly = phone.replace(/\D/g, '');
  
  if (digitsOnly === '') {
    return '';
  }
  
  // If phone already starts with +, return as is
  if (phone.startsWith('+')) {
    return phone;
  }
  
  // Try to detect country code from the number
  const detectedCountryCode = detectCountryCode(digitsOnly);
  
  if (detectedCountryCode) {
    // Remove the country code digits from the number
    const countryCodeDigits = detectedCountryCode.replace('+', '');
    const phoneWithoutCountryCode = digitsOnly.substring(countryCodeDigits.length);
    
    // Return formatted number with detected country code
    return `${detectedCountryCode}${phoneWithoutCountryCode}`;
  }
  
  // Special case: If no country code detected, try to infer from number patterns
  // Philippine mobile numbers typically start with 9 and are 10 digits total
  if (digitsOnly.length === 10 && digitsOnly.startsWith('9')) {
    return `+63${digitsOnly}`;
  }
  
  // US/Canada numbers are typically 10 digits
  if (digitsOnly.length === 10 && !digitsOnly.startsWith('0')) {
    return `+1${digitsOnly}`;
  }
  
  // If no country code detected, use fallback
  const fallbackDigits = fallbackCountryCode.replace('+', '');
  if (digitsOnly.startsWith(fallbackDigits)) {
    return `+${digitsOnly}`;
  }
  
  // Add fallback country code if not present
  return `${fallbackCountryCode}${digitsOnly}`;
}

/**
 * Validates if a phone number is in valid international format
 * @param phone - The phone number to validate
 * @returns true if valid, false otherwise
 */
export function isValidInternationalPhone(phone: string): boolean {
  // E.164 format: + followed by 1-15 digits
  const e164Regex = /^\+[1-9]\d{1,14}$/;
  return e164Regex.test(phone);
}

/**
 * Formats phone number for display (adds spaces for readability)
 * @param phone - The phone number to format
 * @returns Formatted phone number for display
 */
export function formatPhoneForDisplay(phone: string): string {
  if (!phone) return '';
  
  // If it's already formatted for display, return as is
  if (phone.includes(' ')) return phone;
  
  // Format E.164 number for display
  if (phone.startsWith('+')) {
    const countryCode = phone.substring(0, 2); // +1, +44, etc.
    const number = phone.substring(2);
    
    // Format based on length (US format: +1 (XXX) XXX-XXXX)
    if (countryCode === '+1' && number.length === 10) {
      return `+1 (${number.substring(0, 3)}) ${number.substring(3, 6)}-${number.substring(6)}`;
    }
    
    // Generic international format
    return `${countryCode} ${number}`;
  }
  
  return phone;
}

/**
 * Gets the country code from a phone number
 * @param phone - The phone number to analyze
 * @returns The detected country code or null if not found
 */
export function getCountryCodeFromPhone(phone: string): string | null {
  if (!phone || phone.trim() === '') {
    return null;
  }
  
  const digitsOnly = phone.replace(/\D/g, '');
  return detectCountryCode(digitsOnly);
}

/**
 * Common country codes for phone numbers
 */
export const COUNTRY_CODES = {
  US: '+1',
  CA: '+1',
  UK: '+44',
  AU: '+61',
  DE: '+49',
  FR: '+33',
  IT: '+39',
  ES: '+34',
  BR: '+55',
  IN: '+91',
  CN: '+86',
  JP: '+81',
  KR: '+82',
  MX: '+52',
  PH: '+63',  // Philippines
} as const;

export type CountryCode = keyof typeof COUNTRY_CODES;
