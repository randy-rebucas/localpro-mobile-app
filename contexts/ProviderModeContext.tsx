import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';

interface ProviderModeContextType {
  isProviderMode: boolean;
  toggleProviderMode: () => void;
  setProviderMode: (value: boolean) => void;
}

const ProviderModeContext = createContext<ProviderModeContextType | undefined>(undefined);

export function ProviderModeProvider({ children }: { children: React.ReactNode }) {
  const [isProviderMode, setIsProviderMode] = useState(false);

  useEffect(() => {
    loadProviderMode();
  }, []);

  const loadProviderMode = async () => {
    try {
      const savedMode = await AsyncStorage.getItem('providerMode');
      if (savedMode !== null) {
        setIsProviderMode(savedMode === 'true');
      }
    } catch (error) {
      console.error('Error loading provider mode:', error);
    }
  };

  const toggleProviderMode = async () => {
    const newMode = !isProviderMode;
    setIsProviderMode(newMode);
    try {
      await AsyncStorage.setItem('providerMode', newMode.toString());
    } catch (error) {
      console.error('Error saving provider mode:', error);
    }
  };

  const setProviderMode = async (value: boolean) => {
    setIsProviderMode(value);
    try {
      await AsyncStorage.setItem('providerMode', value.toString());
    } catch (error) {
      console.error('Error saving provider mode:', error);
    }
  };

  return (
    <ProviderModeContext.Provider value={{ isProviderMode, toggleProviderMode, setProviderMode }}>
      {children}
    </ProviderModeContext.Provider>
  );
}

export function useProviderMode() {
  const context = useContext(ProviderModeContext);
  if (context === undefined) {
    throw new Error('useProviderMode must be used within a ProviderModeProvider');
  }
  return context;
}

