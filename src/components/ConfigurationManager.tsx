"use client"

import { createContext, useContext, useCallback } from 'react';
import { Option } from '@/lib/types/types';
import { useConfig } from './providers/ConfigProvider';

interface ConfigurationContextValue {
  addSection: (title: string, weight: number) => void;
  updateSection: (sectionKey: string, title: string, weight: number) => void;
  deleteSection: (sectionKey: string) => void;
  
  addCriterion: (sectionKey: string, title: string, weight: number, isBonus?: boolean) => void;
  updateCriterion: (sectionKey: string, criterionKey: string, title: string, weight: number, isBonus?: boolean) => void;
  deleteCriterion: (sectionKey: string, criterionKey: string) => void;
  
  addOption: (sectionKey: string, criterionKey: string, text: string, score: number) => void;
  updateOption: (sectionKey: string, criterionKey: string, index: number, text: string, score: number) => void;
  deleteOption: (sectionKey: string, criterionKey: string, index: number) => void;
  reorderOptions: (sectionKey: string, criterionKey: string, newOptions: Option[]) => void;
}

const ConfigurationContext = createContext<ConfigurationContextValue | null>(null);

export const ConfigurationManager = ({ children }: { children: React.ReactNode }) => {
  const { config, updateConfig } = useConfig();

  const addSection = useCallback((title: string, weight: number) => {
    const newConfig = { ...config };
    const sectionKey = title.toLowerCase().replace(/\s+/g, '_');
    
    newConfig.sections[sectionKey] = {
      title,
      weight,
      criteria: {}
    };
    
    updateConfig(newConfig);
  }, [config, updateConfig]);

  const updateSection = useCallback((sectionKey: string, title: string, weight: number) => {
    const newConfig = { ...config };
    if (!newConfig.sections[sectionKey]) return;
    
    newConfig.sections[sectionKey] = {
      ...newConfig.sections[sectionKey],
      title,
      weight
    };
    
    updateConfig(newConfig);
  }, [config, updateConfig]);

  const deleteSection = useCallback((sectionKey: string) => {
    const newConfig = { ...config };
    delete newConfig.sections[sectionKey];
    updateConfig(newConfig);
  }, [config, updateConfig]);

  const addCriterion = useCallback((
    sectionKey: string, 
    title: string, 
    weight: number,
    isBonus?: boolean
  ) => {
    const newConfig = { ...config };
    if (!newConfig.sections[sectionKey]) return;
    
    const criterionKey = title.toLowerCase().replace(/\s+/g, '_');
    newConfig.sections[sectionKey].criteria[criterionKey] = {
      title,
      weight,
      excludeFromTotal: isBonus,
      options: []
    };
    
    updateConfig(newConfig);
  }, [config, updateConfig]);

  const updateCriterion = useCallback((
    sectionKey: string,
    criterionKey: string,
    title: string,
    weight: number,
    isBonus?: boolean
  ) => {
    const newConfig = { ...config };
    if (!newConfig.sections[sectionKey]?.criteria[criterionKey]) return;
    
    newConfig.sections[sectionKey].criteria[criterionKey] = {
      ...newConfig.sections[sectionKey].criteria[criterionKey],
      title,
      weight,
      excludeFromTotal: isBonus
    };
    
    updateConfig(newConfig);
  }, [config, updateConfig]);

  const deleteCriterion = useCallback((sectionKey: string, criterionKey: string) => {
    const newConfig = { ...config };
    if (!newConfig.sections[sectionKey]) return;
    
    delete newConfig.sections[sectionKey].criteria[criterionKey];
    updateConfig(newConfig);
  }, [config, updateConfig]);

  const addOption = useCallback((
    sectionKey: string,
    criterionKey: string,
    text: string,
    score: number
  ) => {
    const newConfig = { ...config };
    if (!newConfig.sections[sectionKey]?.criteria[criterionKey]) return;
    
    const criterion = newConfig.sections[sectionKey].criteria[criterionKey];
    criterion.options = [...criterion.options, { text, score }]
      .sort((a, b) => a.score - b.score);
    
    updateConfig(newConfig);
  }, [config, updateConfig]);

  const updateOption = useCallback((
    sectionKey: string,
    criterionKey: string,
    index: number,
    text: string,
    score: number
  ) => {
    const newConfig = { ...config };
    if (!newConfig.sections[sectionKey]?.criteria[criterionKey]) return;
    
    const criterion = newConfig.sections[sectionKey].criteria[criterionKey];
    criterion.options = [
      ...criterion.options.slice(0, index),
      { text, score },
      ...criterion.options.slice(index + 1)
    ].sort((a, b) => a.score - b.score);
    
    updateConfig(newConfig);
  }, [config, updateConfig]);

  const deleteOption = useCallback((
    sectionKey: string,
    criterionKey: string,
    index: number
  ) => {
    const newConfig = { ...config };
    if (!newConfig.sections[sectionKey]?.criteria[criterionKey]) return;
    
    const criterion = newConfig.sections[sectionKey].criteria[criterionKey];
    criterion.options = criterion.options.filter((_, i) => i !== index);
    
    updateConfig(newConfig);
  }, [config, updateConfig]);

  const reorderOptions = useCallback((
    sectionKey: string,
    criterionKey: string,
    newOptions: Option[]
  ) => {
    const newConfig = { ...config };
    if (!newConfig.sections[sectionKey]?.criteria[criterionKey]) return;
    
    newConfig.sections[sectionKey].criteria[criterionKey].options = newOptions;
    updateConfig(newConfig);
  }, [config, updateConfig]);

  const value = {
    addSection,
    updateSection,
    deleteSection,
    addCriterion,
    updateCriterion,
    deleteCriterion,
    addOption,
    updateOption,
    deleteOption,
    reorderOptions
  };

  return (
    <ConfigurationContext.Provider value={value}>
      {children}
    </ConfigurationContext.Provider>
  );
};

export const useConfigurationManager = () => {
  const context = useContext(ConfigurationContext);
  if (!context) {
    throw new Error('useConfigurationManager must be used within ConfigurationManager');
  }
  return context;
};