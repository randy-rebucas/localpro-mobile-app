import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';

interface User {
  id: string;
  name: string;
  phone: string;
  type: 'provider' | 'client';
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  sendVerificationCode: (phone: string) => Promise<void>;
  verifyCode: (phone: string, code: string, name: string, type: 'provider' | 'client') => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        setUser(JSON.parse(userData));
      }
    } catch (error) {
      console.error('Error checking auth state:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const sendVerificationCode = async (phone: string) => {
    // Simulate SMS API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log(`SMS sent to ${phone} with verification code: 123456`);
  };

  const verifyCode = async (phone: string, code: string, name: string, type: 'provider' | 'client') => {
    // Simulate verification API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // For demo purposes, accept any 6-digit code
    if (code.length === 6) {
      const userData: User = {
        id: '1',
        name,
        phone,
        type
      };
      
      await AsyncStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
    } else {
      throw new Error('Invalid verification code');
    }
  };

  const signOut = async () => {
    await AsyncStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, sendVerificationCode, verifyCode, signOut }}>
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
