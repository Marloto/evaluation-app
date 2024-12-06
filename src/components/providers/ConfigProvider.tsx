// ConfigProvider.tsx
"use client"

import React, { createContext, useContext, useEffect, useState } from 'react';
import { EvaluationConfig } from '@/lib/types/types';
import { bachelorConfig, masterConfig } from '@/lib/config/evaluation-templates';

interface Template {
  id: string;
  name: string;
  type: 'default' | 'saved';
  config: EvaluationConfig;
  createdAt?: string;
}

interface ConfigContextType {
  config: EvaluationConfig;
  templates: Template[];
  updateConfig: (newConfig: EvaluationConfig) => void;
  loadTemplate: (templateId: string) => void;
  saveTemplate: (name: string) => void;
  deleteTemplate: (templateId: string) => void;
}

const ConfigContext = createContext<ConfigContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'thesis-evaluation-config';
const TEMPLATES_STORAGE_KEY = 'thesis-evaluation-templates';

// Default templates
const defaultTemplates: Template[] = [
  {
    id: 'bachelor',
    name: 'Bachelor Thesis (Default)',
    type: 'default',
    config: bachelorConfig
  },
  {
    id: 'master',
    name: 'Master Thesis (Default)',
    type: 'default',
    config: masterConfig
  }
];

export const ConfigProvider = ({ children }: { children: React.ReactNode }) => {
  const [config, setConfig] = useState<EvaluationConfig>(bachelorConfig);
  const [templates, setTemplates] = useState<Template[]>(defaultTemplates);

  // Load saved templates on mount
  useEffect(() => {
    try {
      const storedTemplates = localStorage.getItem(TEMPLATES_STORAGE_KEY);
      if (storedTemplates) {
        const savedTemplates = JSON.parse(storedTemplates);
        setTemplates([...defaultTemplates, ...savedTemplates]);
      }

      // Load last used config if exists
      const storedConfig = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (storedConfig) {
        setConfig(JSON.parse(storedConfig));
      }
    } catch (error) {
      console.error('Error loading configuration:', error);
    }
  }, []);

  const updateConfig = (newConfig: EvaluationConfig) => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newConfig));
      setConfig(newConfig);
    } catch (error) {
      console.error('Error saving config:', error);
    }
  };

  const loadTemplate = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      updateConfig(template.config);
    }
  };

  const saveTemplate = (name: string) => {
    try {
      const newTemplate: Template = {
        id: `template-${Date.now()}`,
        name,
        type: 'saved',
        config: config,
        createdAt: new Date().toISOString()
      };

      const savedTemplates = templates.filter(t => t.type === 'saved');
      const updatedTemplates = [...defaultTemplates, ...savedTemplates, newTemplate];
      
      localStorage.setItem(TEMPLATES_STORAGE_KEY, 
        JSON.stringify(updatedTemplates.filter(t => t.type === 'saved'))
      );
      setTemplates(updatedTemplates);
    } catch (error) {
      console.error('Error saving template:', error);
    }
  };

  const deleteTemplate = (templateId: string) => {
    try {
      const updatedTemplates = templates.filter(t => t.id !== templateId);
      localStorage.setItem(TEMPLATES_STORAGE_KEY,
        JSON.stringify(updatedTemplates.filter(t => t.type === 'saved'))
      );
      setTemplates(updatedTemplates);
    } catch (error) {
      console.error('Error deleting template:', error);
    }
  };

  return (
    <ConfigContext.Provider value={{
      config,
      templates,
      updateConfig,
      loadTemplate,
      saveTemplate,
      deleteTemplate
    }}>
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