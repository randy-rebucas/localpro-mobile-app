import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { apiService, AuthResponse } from '../services/api';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  isVerified: boolean;
  role: string;
  subscription: {
    isActive: boolean;
    type: string;
  }
}

interface AuthTokens {
  token: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  sendVerificationCode: (phone: string) => Promise<void>;
  verifyCode: (phone: string, code: string, firstName: string, lastName: string, email?: string) => Promise<void>;
  updateUserProfile: (userData: any) => Promise<void>;
  uploadAvatar: (avatarData: FormData) => Promise<void>;
  uploadPortfolio: (portfolioData: FormData) => Promise<void>;
  signOut: () => Promise<void>;
} 

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      const [userData, tokenData] = await Promise.all([
        AsyncStorage.getItem('user'),
        AsyncStorage.getItem('token'),
      ]);
      
      if (userData && tokenData) {
        const user = JSON.parse(userData);
        const token = tokenData as string;
        
        // Verify token is still valid
        try {
          await apiService.getCurrentUser(token);
          setUser(user);
          setToken(token);
        } catch (error) {
          // Token expired or invalid, clear storage
          await AsyncStorage.multiRemove(['user', 'tokens']);
        }
      }
    } catch (error) {
      console.error('Error checking auth state:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const sendVerificationCode = async (phone: string) => {
    const response = await apiService.sendVerificationCode(phone);
    if (!response.success) {
      throw new Error(response.error || 'Failed to send verification code');
    }
  };

  const verifyCode = async (phone: string, code: string, firstName: string, lastName: string, email?: string) => {
    const response = await apiService.verifyCode(phone, code, firstName, lastName, email);
    
    console.log('Verify code response:', response);

    if (!response || !response.success) {
      throw new Error(response?.message || 'Invalid verification code');
    }

    const { user: userData, token } = response as AuthResponse;
    console.log('Verify code response data:', userData, token);
    // Store user data and token
    await Promise.all([
      AsyncStorage.setItem('user', JSON.stringify(userData)),
      AsyncStorage.setItem('token', token as string),
    ]);

    setUser({
      id: userData.id,
      firstName: userData.firstName,
      lastName: userData.lastName,
      phoneNumber: userData.phoneNumber,
      email: userData.email,
      isVerified: userData.isVerified,
      role: userData.role,
      subscription: userData.subscription,
    });
    setToken(token);
  };

  const updateUserProfile = async (userData: any) => {
    if (!token) {
      throw new Error('No authentication token available');
    }

    const response = await apiService.updateUserProfile(token, userData);
    
    if (!response.success) {
      throw new Error(response.error || 'Failed to update profile');
    }

    // Update local user data
    if (response.data) {
      setUser(response.data);
      await AsyncStorage.setItem('user', JSON.stringify(response.data));
    }
  };

  const uploadAvatar = async (avatarData: FormData) => {
    if (!token) {
      throw new Error('No authentication token available');
    }

    const response = await apiService.uploadAvatar(token, avatarData);
    
    if (!response.success) {
      throw new Error(response.error || 'Failed to upload avatar');
    }

    // Update local user data with new avatar
    if (response.data) {
      setUser(response.data);
      await AsyncStorage.setItem('user', JSON.stringify(response.data));
    }
  };

  const uploadPortfolio = async (portfolioData: FormData) => {
    if (!token) {
      throw new Error('No authentication token available');
    }

    const response = await apiService.uploadPortfolio(token, portfolioData);
    
    if (!response.success) {
      throw new Error(response.error || 'Failed to upload portfolio');
    }

    // Update local user data with new portfolio
    if (response.data) {
      setUser(response.data);
      await AsyncStorage.setItem('user', JSON.stringify(response.data));
    }
  };

  const signOut = async () => {
    try {
      // Call logout API if we have a token
      if (token) {
        await apiService.logout(token);
      }
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      // Clear local storage regardless of API call result
      await AsyncStorage.multiRemove(['user', 'token']);
      setUser(null);
      setToken(null);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isLoading, 
      sendVerificationCode, 
      verifyCode, 
      updateUserProfile,
      uploadAvatar,
      uploadPortfolio,
      signOut 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
