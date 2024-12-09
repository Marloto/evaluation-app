"use client"

import React, { createContext, useContext, useState, useEffect } from 'react';
import { EvaluationConfig, Template } from '@/lib/types/types';
import { 
  defaultTemplates, 
  createSavedTemplate,
  isDefaultTemplate,
  isSavedTemplate
} from '@/lib/config/evaluation-templates';

interface ConfigContextType {
  config: EvaluationConfig;
  templates: Template[];
  updateConfig: (newConfig: EvaluationConfig) => void;
  loadTemplate: (templateId: string) => void;
  saveTemplate: (name: string, description: string) => void;
  deleteTemplate: (templateId: string) => void;
}

const ConfigContext = createContext<ConfigContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'thesis-evaluation-config';
const TEMPLATES_STORAGE_KEY = 'thesis-evaluation-templates';

export const ConfigProvider = ({ children }: { children: React.ReactNode }) => {
  const [config, setConfig] = useState<EvaluationConfig>(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading initial config:', error);
    }
    return defaultTemplates[0].config;
  });
  const [templates, setTemplates] = useState<Template[]>(() => {
    try {
      const storedTemplates = localStorage.getItem(TEMPLATES_STORAGE_KEY);
      if (storedTemplates) {
        const savedTemplates = JSON.parse(storedTemplates) as Template[];
        const validatedTemplates = savedTemplates.filter(isSavedTemplate);
        return [...defaultTemplates, ...validatedTemplates];
      }
    } catch (error) {
      console.error('Error loading templates:', error);
    }

    return defaultTemplates;
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(config));
    }
  }, [config]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(
        TEMPLATES_STORAGE_KEY,
        JSON.stringify(templates.filter(isSavedTemplate))
      );
    }
  }, [templates]);

  const updateConfig = (newConfig: EvaluationConfig) => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newConfig));
      }
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

  const saveTemplate = (name: string, description: string) => {
    try {
      const newTemplate = createSavedTemplate(name, description, config);
      
      const updatedTemplates = [
        ...defaultTemplates,
        ...templates.filter(isSavedTemplate),
        newTemplate
      ];
      
      if (typeof window !== 'undefined') {
        localStorage.setItem(
          TEMPLATES_STORAGE_KEY, 
          JSON.stringify(updatedTemplates.filter(isSavedTemplate))
        );
      }
      
      setTemplates(updatedTemplates);
    } catch (error) {
      console.error('Error saving template:', error);
    }
  };

  const deleteTemplate = (templateId: string) => {
    try {
      const templateToDelete = templates.find(t => t.id === templateId);
      if (!templateToDelete || isDefaultTemplate(templateToDelete)) {
        console.warn('Cannot delete default template');
        return;
      }

      const updatedTemplates = templates.filter(t => t.id !== templateId);
      
      if (typeof window !== 'undefined') {
        localStorage.setItem(
          TEMPLATES_STORAGE_KEY,
          JSON.stringify(updatedTemplates.filter(isSavedTemplate))
        );
      }
      
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