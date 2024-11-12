"use client"

import React, { createContext, useContext, useEffect, useState } from 'react';
import { EvaluationConfig } from '@/lib/types/types';
import { evaluationConfig as defaultConfig } from '@/lib/config/evaluation-config';

interface ConfigContextType {
  config: EvaluationConfig;
  updateConfig: (newConfig: EvaluationConfig) => void;
  resetToDefault: () => void;  // Neue Funktion
}

const ConfigContext = createContext<ConfigContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'thesis-evaluation-config';

export const ConfigProvider = ({ children }: { children: React.ReactNode }) => {
  const [config, setConfig] = useState<EvaluationConfig>(defaultConfig);

  useEffect(() => {
    // Load config from localStorage on mount
    const loadConfig = () => {
      try {
        const storedConfig = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (storedConfig) {
          setConfig(JSON.parse(storedConfig));
        } else {
          // Initialize localStorage with default config if none exists
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(defaultConfig));
        }
      } catch (error) {
        console.error('Error loading config from localStorage:', error);
        // Fallback to default config if there's an error
        setConfig(defaultConfig);
      }
    };

    loadConfig();
  }, []);

  const updateConfig = (newConfig: EvaluationConfig) => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newConfig));
      setConfig(newConfig);
    } catch (error) {
      console.error('Error saving config to localStorage:', error);
    }
  };

  const resetToDefault = () => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(defaultConfig));
      setConfig(defaultConfig);
    } catch (error) {
      console.error('Error resetting config to default:', error);
    }
  };

  return (
    <ConfigContext.Provider value={{ config, updateConfig, resetToDefault }}>
      {children}
    </ConfigContext.Provider>
  );
};

export const useConfig = () => {
  const context = useContext(ConfigContext);
  if (context === undefined) {
    throw new Error('useConfig must be used within a ConfigProvider');
  }
  return context;
};

export default ConfigProvider;