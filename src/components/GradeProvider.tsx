"use client"

import React, { createContext, useContext, useEffect, useState } from 'react';
import { GradeConfig, GradeThreshold } from '@/lib/types/types';
import { defaultGradeConfig } from '../lib/config/grade-config';

interface GradeContextType {
    config: GradeConfig;
    updateConfig: (newConfig: GradeConfig) => void;
    resetToDefault: () => void;
    calculateGrade: (percentage: number) => GradeThreshold;
}

const GradeContext = createContext<GradeContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'thesis-grade-config';

export const GradeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [config, setConfig] = useState<GradeConfig>(defaultGradeConfig);

    useEffect(() => {
        try {
            const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
            if (stored) {
                setConfig(JSON.parse(stored));
            } else {
                localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(defaultGradeConfig));
            }
        } catch (error) {
            console.error('Error loading grade config:', error);
            setConfig(defaultGradeConfig);
        }
    }, []);

    useEffect(() => {
        try {
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(config));
        } catch (error) {
            console.error('Error saving grade config:', error);
        }
    }, [config]);

    const updateConfig = (newConfig: GradeConfig) => {
        setConfig(newConfig);
    };

    const resetToDefault = () => {
        setConfig(defaultGradeConfig);
    };

    const calculateGrade = (percentage: number): GradeThreshold => {
        return (
            config.thresholds.find(t => percentage >= t.minPercentage) || 
            config.thresholds[config.thresholds.length - 1]
        );
    };

    return (
        <GradeContext.Provider value={{
            config,
            updateConfig,
            resetToDefault,
            calculateGrade
        }}>
            {children}
        </GradeContext.Provider>
    );
};

export const useGrades = () => {
    const context = useContext(GradeContext);
    if (context === undefined) {
        throw new Error('useGrades must be used within a GradeProvider');
    }
    return context;
};