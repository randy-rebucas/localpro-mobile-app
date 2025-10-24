import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
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
import { formatPhoneForDisplay, formatPhoneToInternational, getCountryCodeFromPhone, isValidInternationalPhone } from '../../utils/phoneFormatter';

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
  const { sendVerificationCode, verifyCode } = useAuth();
  const codeInputRefs = useRef<(TextInput | null)[]>([]);

  // Detect user's location on component mount
  useEffect(() => {
    const detectLocation = async () => {
      try {
        const countryCode = await getLocationBasedPhoneCountryCode();
        if (countryCode) {
          setDetectedCountry(countryCode);
          console.log('Detected country from location:', countryCode);
        }
      } catch (error) {
        console.log('Location detection failed:', error);
      }
    };

    detectLocation();
  }, []);

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
    if (!phone) {
      Alert.alert('Error', 'Please enter your phone number');
      return;
    }

    setIsLoading(true);
    try {
      // Format phone number to international format using location-based detection
      const formattedPhone = await formatPhoneToInternational(phone);
      const detectedCountryCode = getCountryCodeFromPhone(phone);
      
      console.log('Original phone:', phone);
      console.log('Detected country code:', detectedCountryCode);
      console.log('Formatted phone:', formattedPhone);
      
      // Check if formatting resulted in empty string
      if (!formattedPhone) {
        Alert.alert('Error', 'Please enter a valid phone number');
        return;
      }
      
      // Validate the formatted phone number
      if (!isValidInternationalPhone(formattedPhone)) {
        Alert.alert('Error', 'Please enter a valid phone number');
        return;
      }

      await sendVerificationCode(formattedPhone);
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
      // Format phone number to international format for verification
      const formattedPhone = await formatPhoneToInternational(phone);
      
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
      const formattedPhone = await formatPhoneToInternational(phone);
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
                  <View style={styles.inputWrapper}>
                    <Ionicons name="call" size={20} color="#6b7280" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder={detectedCountry ? `Phone Number (e.g., ${detectedCountry} 234 567 8900)` : "Phone Number (e.g., +1 234 567 8900)"}
                      placeholderTextColor="#9ca3af"
                      value={phone}
                      onChangeText={setPhone}
                      keyboardType="phone-pad"
                      autoCapitalize="none"
                    />
                  </View>
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
                    Enter the 6-digit code sent to {formatPhoneForDisplay(phone)}
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
});