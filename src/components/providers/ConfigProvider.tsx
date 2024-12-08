"use client"

import React, { createContext, useContext, useEffect, useState } from 'react';
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
  // Initialisiere mit dem ersten Default-Template
  const [config, setConfig] = useState<EvaluationConfig>(defaultTemplates[0].config);
  const [templates, setTemplates] = useState<Template[]>(defaultTemplates);

  // Load saved templates on mount
  useEffect(() => {
    try {
      // Load last used config if exists
      const storedConfig = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (storedConfig) {
        setConfig(JSON.parse(storedConfig));
      }

      // Load saved templates
      const storedTemplates = localStorage.getItem(TEMPLATES_STORAGE_KEY);
      if (storedTemplates) {
        const savedTemplates = JSON.parse(storedTemplates) as Template[];
        // Ensure stored templates have correct type information
        const validatedTemplates = savedTemplates.filter(isSavedTemplate);
        setTemplates([...defaultTemplates, ...validatedTemplates]);
      }
    } catch (error) {
      console.error('Error loading configuration:', error);
      // Fallback to default template if loading fails
      setConfig(defaultTemplates[0].config);
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

  const saveTemplate = (name: string, description: string) => {
    try {
      const newTemplate = createSavedTemplate(name, description, config);
      
      const updatedTemplates = [
        ...defaultTemplates,
        ...templates.filter(isSavedTemplate),
        newTemplate
      ];
      
      // Only save custom templates to localStorage
      localStorage.setItem(
        TEMPLATES_STORAGE_KEY, 
        JSON.stringify(updatedTemplates.filter(isSavedTemplate))
      );
      
      setTemplates(updatedTemplates);
    } catch (error) {
      console.error('Error saving template:', error);
    }
  };

  const deleteTemplate = (templateId: string) => {
    try {
      // Prevent deletion of default templates
      const templateToDelete = templates.find(t => t.id === templateId);
      if (!templateToDelete || isDefaultTemplate(templateToDelete)) {
        console.warn('Cannot delete default template');
        return;
      }

      const updatedTemplates = templates.filter(t => t.id !== templateId);
      
      // Only save custom templates to localStorage
      localStorage.setItem(
        TEMPLATES_STORAGE_KEY,
        JSON.stringify(updatedTemplates.filter(isSavedTemplate))
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