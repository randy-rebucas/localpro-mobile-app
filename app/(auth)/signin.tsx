import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
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

export default function SignIn() {
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [userType, setUserType] = useState<'provider' | 'client'>('provider');
  const [step, setStep] = useState<'phone' | 'verify'>('phone');
  const [isLoading, setIsLoading] = useState(false);
  const { sendVerificationCode, verifyCode } = useAuth();

  const handleSendCode = async () => {
    if (!phone) {
      Alert.alert('Error', 'Please enter your phone number');
      return;
    }

    setIsLoading(true);
    try {
      await sendVerificationCode(phone);
      setStep('verify');
    } catch (error) {
      Alert.alert('Error', 'Failed to send verification code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!code || !name) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setIsLoading(true);
    try {
      await verifyCode(phone, code, name, userType);
    } catch (error) {
      Alert.alert('Error', 'Invalid verification code');
    } finally {
      setIsLoading(false);
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
                      placeholder="Phone Number"
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
                    We'll send you a 6-digit verification code via SMS
                  </Text>
                </View>
              </>
            ) : (
              <>
                <View style={styles.titleContainer}>
                  <Text style={styles.title}>Verify Your Phone</Text>
                  <Text style={styles.description}>
                    Enter the 6-digit code sent to {phone}
                  </Text>
                </View>

                <View style={styles.inputContainer}>
                  <View style={styles.inputWrapper}>
                    <Ionicons name="keypad" size={20} color="#6b7280" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Verification Code"
                      placeholderTextColor="#9ca3af"
                      value={code}
                      onChangeText={setCode}
                      keyboardType="number-pad"
                      maxLength={6}
                    />
                  </View>

                  <View style={styles.inputWrapper}>
                    <Ionicons name="person" size={20} color="#6b7280" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Full Name"
                      placeholderTextColor="#9ca3af"
                      value={name}
                      onChangeText={setName}
                    />
                  </View>
                </View>

                <View style={styles.userTypeContainer}>
                  <Text style={styles.userTypeLabel}>I am a:</Text>
                  <View style={styles.userTypeButtons}>
                    <TouchableOpacity
                      style={[
                        styles.userTypeButton,
                        userType === 'provider' && styles.userTypeButtonActive
                      ]}
                      onPress={() => setUserType('provider')}
                    >
                      <Ionicons 
                        name="construct" 
                        size={20} 
                        color={userType === 'provider' ? '#22c55e' : '#6b7280'} 
                        style={styles.userTypeIcon}
                      />
                      <Text style={[
                        styles.userTypeButtonText,
                        userType === 'provider' && styles.userTypeButtonTextActive
                      ]}>
                        Service Provider
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.userTypeButton,
                        userType === 'client' && styles.userTypeButtonActive
                      ]}
                      onPress={() => setUserType('client')}
                    >
                      <Ionicons 
                        name="person-circle" 
                        size={20} 
                        color={userType === 'client' ? '#22c55e' : '#6b7280'} 
                        style={styles.userTypeIcon}
                      />
                      <Text style={[
                        styles.userTypeButtonText,
                        userType === 'client' && styles.userTypeButtonTextActive
                      ]}>
                        Client
                      </Text>
                    </TouchableOpacity>
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

                <TouchableOpacity
                  style={styles.linkButton}
                  onPress={() => setStep('phone')}
                >
                  <Ionicons name="arrow-back" size={16} color="#22c55e" />
                  <Text style={styles.linkText}>
                    Change phone number
                  </Text>
                </TouchableOpacity>
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
  linkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  linkText: {
    color: '#22c55e',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
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