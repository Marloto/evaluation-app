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

const emptyConfig: EvaluationConfig = {
  sections: {}
};

export const ConfigProvider = ({ children }: { children: React.ReactNode }) => {
  const [config, setConfig] = useState<EvaluationConfig>(emptyConfig);
  const [templates, setTemplates] = useState<Template[]>(defaultTemplates);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    try {
      if(isInitialized) {
          return;
      }
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      const storedTemplates = localStorage.getItem(TEMPLATES_STORAGE_KEY);
      
      if (stored) {
        setConfig(JSON.parse(stored));
      } else {
        setConfig(defaultTemplates[0].config);
      }

      if (storedTemplates) {
        const savedTemplates = JSON.parse(storedTemplates) as Template[];
        const validatedTemplates = savedTemplates.filter(isSavedTemplate);
        setTemplates([...defaultTemplates, ...validatedTemplates]);
      }

      setIsInitialized(true);
    } catch (error) {
      console.error('Error during hydration:', error);
      setConfig(defaultTemplates[0].config);
      setIsInitialized(true);
    }
  }, [isInitialized]);

  useEffect(() => {
    if (isInitialized && typeof window !== 'undefined') {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(config));
    }
  }, [config, isInitialized]);

  useEffect(() => {
    if (isInitialized && typeof window !== 'undefined') {
      localStorage.setItem(
        TEMPLATES_STORAGE_KEY,
        JSON.stringify(templates.filter(isSavedTemplate))
      );
    }
  }, [templates, isInitialized]);

  const updateConfig = (newConfig: EvaluationConfig) => {
    try {
      console.log("save config", config, typeof window !== 'undefined');
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
    console.log("Load template", templateId, template);
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