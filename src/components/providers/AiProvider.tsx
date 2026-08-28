"use client"

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
    AiSettings,
    DEFAULT_AI_SETTINGS,
    getAiSettings,
    subscribeAiSettings,
    updateAiSettings,
} from '@/lib/ai/settings';
import { listProviders } from '@/lib/ai/registry';
import { LlmModelInfo } from '@/lib/ai/types';
import { PromptSet } from '@/lib/ai/prompt-presets';
import {
    deleteCustomTemplate,
    getActivePromptTemplate,
    importPromptTemplates,
    listPromptTemplates,
    PromptTemplate,
    saveCustomTemplate,
    setActiveTemplate,
    subscribePrompts,
} from '@/lib/ai/prompt-store';

interface AiContextType {
    settings: AiSettings;
    updateSettings: (patch: Partial<AiSettings>) => void;
    /** False while no API key is configured - all AI entry points stay disabled. */
    isAvailable: boolean;
    models: LlmModelInfo[];
    providers: { id: string; label: string }[];

    promptTemplates: PromptTemplate[];
    activeTemplate: PromptTemplate;
    selectTemplate: (id: string) => void;
    saveTemplate: (input: { id?: string; name: string; description?: string; prompts: PromptSet }) => string;
    deleteTemplate: (id: string) => void;
    importTemplates: (raw: unknown) => PromptTemplate[];
}

const AiContext = createContext<AiContextType | undefined>(undefined);

export const AiProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // Starts from the defaults so the prerendered markup and the first client
    // render match - localStorage is only read in the effect below.
    const [settings, setSettings] = useState<AiSettings>(DEFAULT_AI_SETTINGS);
    const [promptRevision, setPromptRevision] = useState(0);

    // The settings and prompt modules are the single source of truth so the
    // non-React console API and the UI never drift apart.
    useEffect(() => {
        setSettings(getAiSettings());
        setPromptRevision(revision => revision + 1);
        const unsubscribeSettings = subscribeAiSettings(setSettings);
        const unsubscribePrompts = subscribePrompts(() =>
            setPromptRevision(revision => revision + 1)
        );
        return () => {
            unsubscribeSettings();
            unsubscribePrompts();
        };
    }, []);

    const updateSettings = useCallback((patch: Partial<AiSettings>) => {
        updateAiSettings(patch);
    }, []);

    const value = useMemo<AiContextType>(() => {
        void promptRevision; // recompute prompt data whenever the store changes
        const providers = listProviders();
        const active = providers.find(provider => provider.id === settings.providerId);
        return {
            settings,
            updateSettings,
            isAvailable: Boolean(settings.apiKey && settings.apiKey.trim().length > 0),
            models: active?.models ?? [],
            providers: providers.map(provider => ({ id: provider.id, label: provider.label })),
            promptTemplates: listPromptTemplates(),
            activeTemplate: getActivePromptTemplate(),
            selectTemplate: setActiveTemplate,
            saveTemplate: saveCustomTemplate,
            deleteTemplate: deleteCustomTemplate,
            importTemplates: importPromptTemplates,
        };
    }, [settings, updateSettings, promptRevision]);

    return <AiContext.Provider value={value}>{children}</AiContext.Provider>;
};

export const useAi = (): AiContextType => {
    const context = useContext(AiContext);
    if (context === undefined) {
        throw new Error('useAi must be used within an AiProvider');
    }
    return context;
};
