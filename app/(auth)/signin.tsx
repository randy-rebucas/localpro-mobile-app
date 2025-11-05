import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { getLocationBasedPhoneCountryCode } from '../../utils/locationService';
import { formatPhoneForDisplay, formatPhoneToInternational, isValidInternationalPhone } from '../../utils/phoneFormatter';

// Country list with phone codes
const COUNTRIES = [
    { code: 'US', name: 'United States', phoneCode: '+1', flag: '🇺🇸' },
    { code: 'CA', name: 'Canada', phoneCode: '+1', flag: '🇨🇦' },
    { code: 'PH', name: 'Philippines', phoneCode: '+63', flag: '🇵🇭' },
    { code: 'GB', name: 'United Kingdom', phoneCode: '+44', flag: '🇬🇧' },
    { code: 'AU', name: 'Australia', phoneCode: '+61', flag: '🇦🇺' },
    { code: 'DE', name: 'Germany', phoneCode: '+49', flag: '🇩🇪' },
    { code: 'FR', name: 'France', phoneCode: '+33', flag: '🇫🇷' },
    { code: 'IT', name: 'Italy', phoneCode: '+39', flag: '🇮🇹' },
    { code: 'ES', name: 'Spain', phoneCode: '+34', flag: '🇪🇸' },
    { code: 'NL', name: 'Netherlands', phoneCode: '+31', flag: '🇳🇱' },
    { code: 'SE', name: 'Sweden', phoneCode: '+46', flag: '🇸🇪' },
    { code: 'NO', name: 'Norway', phoneCode: '+47', flag: '🇳🇴' },
    { code: 'DK', name: 'Denmark', phoneCode: '+45', flag: '🇩🇰' },
    { code: 'CH', name: 'Switzerland', phoneCode: '+41', flag: '🇨🇭' },
    { code: 'AT', name: 'Austria', phoneCode: '+43', flag: '🇦🇹' },
    { code: 'CN', name: 'China', phoneCode: '+86', flag: '🇨🇳' },
    { code: 'JP', name: 'Japan', phoneCode: '+81', flag: '🇯🇵' },
    { code: 'KR', name: 'South Korea', phoneCode: '+82', flag: '🇰🇷' },
    { code: 'IN', name: 'India', phoneCode: '+91', flag: '🇮🇳' },
    { code: 'SG', name: 'Singapore', phoneCode: '+65', flag: '🇸🇬' },
    { code: 'MY', name: 'Malaysia', phoneCode: '+60', flag: '🇲🇾' },
    { code: 'TH', name: 'Thailand', phoneCode: '+66', flag: '🇹🇭' },
    { code: 'VN', name: 'Vietnam', phoneCode: '+84', flag: '🇻🇳' },
    { code: 'ID', name: 'Indonesia', phoneCode: '+62', flag: '🇮🇩' },
    { code: 'AE', name: 'UAE', phoneCode: '+971', flag: '🇦🇪' },
    { code: 'SA', name: 'Saudi Arabia', phoneCode: '+966', flag: '🇸🇦' },
    { code: 'EG', name: 'Egypt', phoneCode: '+20', flag: '🇪🇬' },
    { code: 'ZA', name: 'South Africa', phoneCode: '+27', flag: '🇿🇦' },
    { code: 'NG', name: 'Nigeria', phoneCode: '+234', flag: '🇳🇬' },
    { code: 'KE', name: 'Kenya', phoneCode: '+254', flag: '🇰🇪' },
    { code: 'BR', name: 'Brazil', phoneCode: '+55', flag: '🇧🇷' },
    { code: 'MX', name: 'Mexico', phoneCode: '+52', flag: '🇲🇽' },
    { code: 'AR', name: 'Argentina', phoneCode: '+54', flag: '🇦🇷' },
    { code: 'CL', name: 'Chile', phoneCode: '+56', flag: '🇨🇱' },
    { code: 'CO', name: 'Colombia', phoneCode: '+57', flag: '🇨🇴' },
  ];

export default function SignIn() {
  const [phone, setPhone] = useState('');
  const [codeDigits, setCodeDigits] = useState(['', '', '', '', '', '']);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [step, setStep] = useState<'phone' | 'verify'>('phone');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [detectedCountry, setDetectedCountry] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [countrySearchQuery, setCountrySearchQuery] = useState('');
  const [selectedCountryName, setSelectedCountryName] = useState<string | null>(null);
  const { sendVerificationCode, verifyCode } = useAuth();
  const codeInputRef = useRef<TextInput>(null);
  const codeInputRefs = useRef<(TextInput | null)[]>([]);
  const phoneInputRef = useRef<TextInput>(null);

  // Filter countries based on search query
  const filteredCountries = COUNTRIES.filter(country =>
    country.name.toLowerCase().includes(countrySearchQuery.toLowerCase()) ||
    country.phoneCode.includes(countrySearchQuery) ||
    country.code.toLowerCase().includes(countrySearchQuery.toLowerCase())
  );

  // Detect user's location on component mount
  useEffect(() => {
    const detectLocation = async () => {
      try {
        const countryCode = await getLocationBasedPhoneCountryCode();
        if (countryCode) {
          setDetectedCountry(countryCode);
          // Find and set country name
          const country = COUNTRIES.find(c => c.phoneCode === countryCode);
          if (country) {
            setSelectedCountryName(country.name);
          }
          console.log('Detected country from location:', countryCode);
        }
      } catch (error) {
        console.log('Location detection failed:', error);
      }
    };

    detectLocation();
  }, []);

  // Handle country selection
  const handleCountrySelect = (country: typeof COUNTRIES[0]) => {
    // Set the selected country code (this will be used for automatic prefix)
    setDetectedCountry(country.phoneCode);
    setSelectedCountryName(country.name);
    setShowCountryPicker(false);
    setCountrySearchQuery('');
    
    // If phone number already exists, reformat it with new country code
    if (phone) {
      const digitsOnly = phone.replace(/\D/g, '').replace(/^\+?/, '');
      let phoneNumber = digitsOnly;
      
      // Check if number starts with any country code from our list and remove it
      for (const c of COUNTRIES) {
        const codeDigits = c.phoneCode.replace('+', '');
        if (digitsOnly.startsWith(codeDigits)) {
          phoneNumber = digitsOnly.substring(codeDigits.length);
          break;
        }
      }
      
      // Apply new country code prefix
      setPhone(country.phoneCode + phoneNumber);
    } else {
      // Clear phone input when country changes if no number entered yet
      // This ensures the new country code will be auto-added when user starts typing
      setPhone('');
    }
  };

  // Handle phone number input with automatic formatting
  const handlePhoneChange = (text: string) => {
    // Remove all spaces and non-digit characters except the leading +
    let cleaned = text.replace(/\s/g, '').replace(/[^\d+]/g, '');
    
    // If empty or just +, reset to empty string
    if (cleaned === '' || cleaned === '+') {
      setPhone('');
      return;
    }

    // If user manually types +, respect it and let them type the full number
    if (cleaned.startsWith('+')) {
      // Remove any duplicate + signs, keep only one at the start
      cleaned = '+' + cleaned.substring(1).replace(/\+/g, '');
      setPhone(cleaned);
      return;
    }

    // If user types without +, and we have detected country, auto-add country code prefix
    if (detectedCountry) {
      const countryDigits = detectedCountry.replace('+', '');
      // Check if user already typed the country code digits at the start
      if (cleaned.startsWith(countryDigits)) {
        // User is typing with country code, just add + prefix
        setPhone('+' + cleaned);
      } else {
        // User is typing local number, prepend detected country code
        setPhone(detectedCountry + cleaned);
      }
    } else {
      // No detected country, let user type and we'll format on submit
      // But still add + prefix to indicate international format
      setPhone('+' + cleaned);
    }
  };

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(resendCooldown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleSendCode = async () => {
    if (!phone || phone.trim() === '') {
      Alert.alert('Error', 'Please enter your phone number');
      return;
    }

    setIsLoading(true);
    try {
      // Remove all spaces and ensure proper formatting
      let cleanedPhone = phone.replace(/\s/g, '').trim();
      
      // If phone doesn't start with +, add detected country code or format
      if (!cleanedPhone.startsWith('+')) {
        if (detectedCountry) {
          // Prepend detected country code
          cleanedPhone = detectedCountry + cleanedPhone.replace(/^\+?/, '');
        } else {
          // Use formatter to detect and add country code
          cleanedPhone = await formatPhoneToInternational(cleanedPhone);
        }
      } else {
        // Already has +, but ensure no spaces and validate
        cleanedPhone = cleanedPhone.replace(/\s/g, '');
      }
      
      console.log('Original phone:', phone);
      console.log('Cleaned phone:', cleanedPhone);
      
      // Check if formatting resulted in empty string
      if (!cleanedPhone || cleanedPhone === '+') {
        Alert.alert('Error', 'Please enter a valid phone number');
        return;
      }
      
      // Validate the formatted phone number
      if (!isValidInternationalPhone(cleanedPhone)) {
        Alert.alert('Error', 'Please enter a valid phone number with country code');
        return;
      }

      // Update phone state with formatted version (no spaces)
      setPhone(cleanedPhone);
      
      await sendVerificationCode(cleanedPhone);
      setStep('verify');
      // Auto-focus on first code input after a short delay
      setTimeout(() => {
        codeInputRefs.current[0]?.focus();
      }, 100);
    } catch (error) {
      console.error('Send code error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to send verification code';
      Alert.alert('Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    // Combine the 6 digits into a single code
    const combinedCode = codeDigits.join('');
    
    if (!combinedCode) {
      Alert.alert('Error', 'Please enter the verification code');
      return;
    }

    // Validate verification code format (should be 6 digits)
    if (!/^\d{6}$/.test(combinedCode)) {
      Alert.alert('Error', 'Please enter a valid 6-digit verification code');
      return;
    }

    setIsLoading(true);
    try {
      // Ensure phone is properly formatted (no spaces, with country code)
      let formattedPhone = phone.replace(/\s/g, '').trim();
      
      // If phone doesn't start with +, add detected country code
      if (!formattedPhone.startsWith('+')) {
        if (detectedCountry) {
          formattedPhone = detectedCountry + formattedPhone.replace(/^\+?/, '');
        } else {
          formattedPhone = await formatPhoneToInternational(formattedPhone);
        }
      }
      
      // Validate the formatted phone number
      if (!formattedPhone || !isValidInternationalPhone(formattedPhone)) {
        Alert.alert('Error', 'Invalid phone number format');
        return;
      }

      // Pass optional user data if provided
      await verifyCode(
        formattedPhone, 
        combinedCode, 
        firstName.trim() || undefined, 
        lastName.trim() || undefined, 
        email.trim() || undefined
      );
      
      // Redirect to dashboard after successful verification
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Verify code error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Invalid verification code';
      Alert.alert('Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (resendCooldown > 0) {
      return;
    }

    setIsResending(true);
    try {
      // Ensure phone is properly formatted (no spaces, with country code)
      let formattedPhone = phone.replace(/\s/g, '').trim();
      
      if (!formattedPhone.startsWith('+')) {
        if (detectedCountry) {
          formattedPhone = detectedCountry + formattedPhone.replace(/^\+?/, '');
        } else {
          formattedPhone = await formatPhoneToInternational(formattedPhone);
        }
      }
      
      await sendVerificationCode(formattedPhone);
      setResendCooldown(60); // 60 second cooldown
      Alert.alert('Success', 'Verification code sent successfully');
    } catch (error) {
      console.error('Resend code error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to resend verification code';
      Alert.alert('Error', errorMessage);
    } finally {
      setIsResending(false);
    }
  };

  const handleDigitChange = (index: number, value: string) => {
    // Only allow single digit
    if (value.length > 1) return;
    
    const newDigits = [...codeDigits];
    newDigits[index] = value;
    setCodeDigits(newDigits);
    
    // Auto-focus next input if digit is entered
    if (value && index < 5) {
      codeInputRefs.current[index + 1]?.focus();
    }
    
    // Auto-submit when all 6 digits are entered
    if (newDigits.every(digit => digit !== '') && !isLoading) {
      setTimeout(() => {
        handleVerifyCode();
      }, 100);
    }
  };

  const handleDigitKeyPress = (index: number, key: string) => {
    // Handle backspace - move to previous input if current is empty
    if (key === 'Backspace' && !codeDigits[index] && index > 0) {
      codeInputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header with Gradient Background */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <View style={styles.logo}>
              <Ionicons name="business" size={32} color="white" />
            </View>
            <View style={styles.logoTextContainer}>
              <Text style={styles.appName}>LocalPro</Text>
              <Text style={styles.subtitle}>Super App</Text>
            </View>
          </View>
        </View>

        {/* Main Content */}
        <View style={styles.content}>
          <View style={styles.form}>
            {step === 'phone' ? (
              <>
                <View style={styles.titleContainer}>
                  <Text style={styles.title}>Welcome to LocalPro</Text>
                  <Text style={styles.description}>
                    Enter your phone number to get started with our comprehensive service platform
                  </Text>
                </View>

                <View style={styles.inputContainer}>
                  <TouchableOpacity
                    style={styles.countrySelector}
                    onPress={() => setShowCountryPicker(true)}
                  >
                    <Ionicons name="globe" size={20} color="#6b7280" />
                    <Text style={styles.countryCodeText}>
                      {detectedCountry || '+1'}
                    </Text>
                    <Ionicons name="chevron-down" size={16} color="#6b7280" />
                  </TouchableOpacity>
                  
                  <View style={styles.inputWrapper}>
                    <Ionicons name="call" size={20} color="#6b7280" style={styles.inputIcon} />
                    <TextInput
                      ref={phoneInputRef}
                      style={styles.input}
                      placeholder={detectedCountry ? `Phone Number (e.g., ${detectedCountry.replace('+', '')}9123456789)` : "Phone Number (e.g., +19123456789)"}
                      placeholderTextColor="#9ca3af"
                      value={phone}
                      onChangeText={handlePhoneChange}
                      keyboardType="phone-pad"
                      autoCapitalize="none"
                      autoComplete="tel"
                    />
                  </View>
                  {detectedCountry && phone.length === 0 && (
                    <Text style={styles.hintText}>
                      Country code {detectedCountry} will be automatically added when you start typing
                    </Text>
                  )}
                </View>

                <TouchableOpacity
                  style={[styles.button, isLoading && styles.buttonDisabled]}
                  onPress={handleSendCode}
                  disabled={isLoading}
                >
                  <Text style={styles.buttonText}>
                    {isLoading ? 'Sending Code...' : 'Send Verification Code'}
                  </Text>
                  <Ionicons name="arrow-forward" size={20} color="white" style={styles.buttonIcon} />
                </TouchableOpacity>

                <View style={styles.infoContainer}>
                  <Ionicons name="information-circle" size={16} color="#6b7280" />
                  <Text style={styles.infoText}>
                    {detectedCountry 
                      ? `We'll send you a 6-digit verification code via SMS. We detected you're in ${detectedCountry.replace('+', '')} region.`
                      : "We'll send you a 6-digit verification code via SMS. Include country code (e.g., +1 for US)"
                    }
                  </Text>
                </View>
              </>
            ) : (
              <>
                <View style={styles.titleContainer}>
                  <Text style={styles.title}>Verify Your Phone</Text>
                  <Text style={styles.description}>
                    Enter the 6-digit code sent to {phone || formatPhoneForDisplay(phone)}
                  </Text>
                </View>

                <View style={styles.inputContainer}>
                  <View style={styles.codeInputContainer}>
                    {codeDigits.map((digit, index) => (
                      <TextInput
                        key={index}
                        ref={(ref) => {
                          codeInputRefs.current[index] = ref;
                        }}
                        style={styles.codeInput}
                        placeholder="0"
                        placeholderTextColor="#9ca3af"
                        value={digit}
                        onChangeText={(value) => handleDigitChange(index, value)}
                        onKeyPress={({ nativeEvent }) => handleDigitKeyPress(index, nativeEvent.key)}
                        keyboardType="number-pad"
                        maxLength={1}
                        textAlign="center"
                        autoFocus={index === 0}
                      />
                    ))}
                  </View>

                  <View style={styles.inputWrapper}>
                    <Ionicons name="person" size={20} color="#6b7280" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="First Name (Optional)"
                      placeholderTextColor="#9ca3af"
                      value={firstName}
                      onChangeText={setFirstName}
                      autoCapitalize="words"
                    />
                  </View>

                  <View style={styles.inputWrapper}>
                    <Ionicons name="person" size={20} color="#6b7280" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Last Name (Optional)"
                      placeholderTextColor="#9ca3af"
                      value={lastName}
                      onChangeText={setLastName}
                      autoCapitalize="words"
                    />
                  </View>

                  <View style={styles.inputWrapper}>
                    <Ionicons name="mail" size={20} color="#6b7280" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Email Address (Optional)"
                      placeholderTextColor="#9ca3af"
                      value={email}
                      onChangeText={setEmail}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                  </View>
                </View>

                <TouchableOpacity
                  style={[styles.button, isLoading && styles.buttonDisabled]}
                  onPress={handleVerifyCode}
                  disabled={isLoading}
                >
                  <Text style={styles.buttonText}>
                    {isLoading ? 'Verifying...' : 'Verify & Continue'}
                  </Text>
                  <Ionicons name="checkmark" size={20} color="white" style={styles.buttonIcon} />
                </TouchableOpacity>

                <View style={styles.linkButtonsContainer}>
                  <TouchableOpacity
                    style={styles.linkButton}
                    onPress={() => setStep('phone')}
                  >
                    <Ionicons name="arrow-back" size={16} color="#22c55e" />
                    <Text style={styles.linkText}>
                      Change phone number
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.linkButton, resendCooldown > 0 && styles.linkButtonDisabled]}
                    onPress={handleResendCode}
                    disabled={resendCooldown > 0 || isResending}
                  >
                    <Ionicons name="refresh" size={16} color={resendCooldown > 0 ? "#9ca3af" : "#22c55e"} />
                    <Text style={[styles.linkText, resendCooldown > 0 && styles.linkTextDisabled]}>
                      {isResending 
                        ? 'Sending...' 
                        : resendCooldown > 0 
                          ? `Resend code (${resendCooldown}s)` 
                          : 'Resend code'
                      }
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            By continuing, you agree to our Terms of Service and Privacy Policy
          </Text>
        </View>
      </ScrollView>

      {/* Country Picker Modal */}
      <Modal
        visible={showCountryPicker}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          setShowCountryPicker(false);
          setCountrySearchQuery('');
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Country</Text>
              <TouchableOpacity
                onPress={() => {
                  setShowCountryPicker(false);
                  setCountrySearchQuery('');
                }}
                style={styles.modalCloseButton}
              >
                <Ionicons name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>

            <View style={styles.searchContainer}>
              <Ionicons name="search" size={20} color="#6b7280" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search country..."
                placeholderTextColor="#9ca3af"
                value={countrySearchQuery}
                onChangeText={setCountrySearchQuery}
                autoCapitalize="none"
                autoCorrect={false}
              />
              {countrySearchQuery.length > 0 && (
                <TouchableOpacity
                  onPress={() => setCountrySearchQuery('')}
                  style={styles.searchClearButton}
                >
                  <Ionicons name="close-circle" size={20} color="#9ca3af" />
                </TouchableOpacity>
              )}
            </View>

            <ScrollView style={styles.countryList} keyboardShouldPersistTaps="handled">
              {filteredCountries.map((country) => (
                <TouchableOpacity
                  key={country.code}
                  style={[
                    styles.countryItem,
                    detectedCountry === country.phoneCode && styles.countryItemSelected
                  ]}
                  onPress={() => handleCountrySelect(country)}
                >
                  <View style={styles.countryItemContent}>
                    <Text style={styles.countryFlag}>{country.flag}</Text>
                    <View style={styles.countryItemText}>
                      <Text style={styles.countryItemName}>{country.name}</Text>
                      <Text style={styles.countryItemCode}>{country.phoneCode}</Text>
                    </View>
                  </View>
                  {detectedCountry === country.phoneCode && (
                    <Ionicons name="checkmark-circle" size={24} color="#22c55e" />
                  )}
                </TouchableOpacity>
              ))}
              {filteredCountries.length === 0 && (
                <View style={styles.noResultsContainer}>
                  <Text style={styles.noResultsText}>No countries found</Text>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    backgroundColor: '#22c55e',
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 60,
    height: 60,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  logoTextContainer: {
    alignItems: 'flex-start',
  },
  appName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
  },
  form: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 12,
  },
  titleContainer: {
    marginBottom: 32,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  inputContainer: {
    marginBottom: 24,
  },
  codeInputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 12,
  },
  codeInput: {
    width: 48,
    height: 56,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    fontSize: 24,
    fontWeight: '600',
    color: '#1f2937',
    textAlign: 'center',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1f2937',
    paddingVertical: 16,
  },
  button: {
    backgroundColor: '#22c55e',
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    shadowColor: '#22c55e',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonDisabled: {
    backgroundColor: '#9ca3af',
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  buttonIcon: {
    marginLeft: 4,
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f9ff',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#22c55e',
  },
  infoText: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 8,
    flex: 1,
  },
  hintText: {
    fontSize: 12,
    color: '#22c55e',
    marginTop: 4,
    marginLeft: 16,
    fontStyle: 'italic',
  },
  userTypeContainer: {
    marginBottom: 24,
  },
  userTypeLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  userTypeButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  userTypeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 16,
    padding: 16,
    backgroundColor: '#f9fafb',
  },
  userTypeButtonActive: {
    borderColor: '#22c55e',
    backgroundColor: '#dcfce7',
  },
  userTypeIcon: {
    marginRight: 8,
  },
  userTypeButtonText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  userTypeButtonTextActive: {
    color: '#22c55e',
    fontWeight: '600',
  },
  linkButtonsContainer: {
    gap: 12,
  },
  linkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  linkButtonDisabled: {
    opacity: 0.5,
  },
  linkText: {
    color: '#22c55e',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
  },
  linkTextDisabled: {
    color: '#9ca3af',
  },
  footer: {
    paddingHorizontal: 24,
    paddingVertical: 24,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
    lineHeight: 18,
  },
  countrySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 12,
    minWidth: 100,
  },
  countryCodeText: {
    fontSize: 16,
    color: '#1f2937',
    fontWeight: '600',
    marginHorizontal: 8,
    minWidth: 50,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  modalCloseButton: {
    padding: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    marginHorizontal: 24,
    marginTop: 16,
    marginBottom: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1f2937',
    paddingVertical: 12,
  },
  searchClearButton: {
    padding: 4,
  },
  countryList: {
    maxHeight: 400,
  },
  countryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  countryItemSelected: {
    backgroundColor: '#f0fdf4',
  },
  countryItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  countryFlag: {
    fontSize: 28,
    marginRight: 12,
  },
  countryItemText: {
    flex: 1,
  },
  countryItemName: {
    fontSize: 16,
    color: '#1f2937',
    fontWeight: '500',
    marginBottom: 2,
  },
  countryItemCode: {
    fontSize: 14,
    color: '#6b7280',
  },
  noResultsContainer: {
    padding: 32,
    alignItems: 'center',
  },
  noResultsText: {
    fontSize: 16,
    color: '#6b7280',
  },
});