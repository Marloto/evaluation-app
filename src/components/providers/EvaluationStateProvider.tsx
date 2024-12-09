"use client"

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Section } from '@/lib/types/types';

// Types für die Bewertungsdaten
interface CriterionState {
    score?: number;
    customText?: string;
}

interface SectionState {
    preamble?: string;
    criteria: Record<string, CriterionState>;
}

export interface EvaluationState {
    sections: Record<string, SectionState>;
    activeSection: string | null;
    notes: string;
}

interface EvaluationContextType {
    state: EvaluationState;
    updateCriterion: (sectionKey: string, criterionKey: string, update: Partial<CriterionState>) => void;
    updatePreamble: (sectionKey: string, preamble: string) => void;
    setActiveSection: (sectionKey: string | null) => void;
    resetSection: (sectionKey: string) => void;
    resetAll: () => void;
    loadState: (newState: EvaluationState) => void; // Neue Funktion
    updateNotes: (notes: string) => void; // Add this new function
}

const EvaluationContext = createContext<EvaluationContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'thesis-evaluation-state';

const createInitialState = (sections: Record<string, Section>): EvaluationState => {
    console.log("create initial state");
    const initial: Record<string, SectionState> = {};
    Object.keys(sections).forEach(sectionKey => {
        initial[sectionKey] = {
            criteria: {}
        };
    });
    return {
        sections: initial,
        activeSection: Object.keys(sections)[0] || null,
        notes: ''
    };
};

const createEmptyState = (): EvaluationState => ({
    sections: {},
    activeSection: null,
    notes: ''
});

interface EvaluationStateProviderProps {
    children: React.ReactNode;
    sections: Record<string, Section>;
}

export const EvaluationStateProvider: React.FC<EvaluationStateProviderProps> = ({
    children,
    sections
}) => {
    // Initialer State ist immer der leere Zustand
    const [state, setState] = useState<EvaluationState>(createEmptyState());
    const [isInitialized, setIsInitialized] = useState(false);

    useEffect(() => {
        try {
            if(isInitialized) {
                return;
            }
            console.log("Load sections");
            const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
            if (stored) {
                setState(JSON.parse(stored));
            } else {
                setState(createInitialState(sections));
            }
            setIsInitialized(true);
        } catch (error) {
            console.error('Error during hydration:', error);
            setState(createInitialState(sections));
            setIsInitialized(true);
        }
    }, [isInitialized, sections]);

    const updateNotes = (notes: string) => {
        setState(prev => ({
            ...prev,
            notes
        }));
    };

    // Save state to localStorage whenever it changes
    useEffect(() => {
        if (isInitialized && typeof window !== 'undefined') {
            console.log("save state", state);
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state));
        }
    }, [state, isInitialized]);

    const updateCriterion = (
        sectionKey: string,
        criterionKey: string,
        update: Partial<CriterionState>
    ) => {
        setState(prev => ({
            ...prev,
            sections: {
                ...prev.sections,
                [sectionKey]: {
                    ...prev.sections[sectionKey],
                    criteria: {
                        ...prev.sections[sectionKey]?.criteria,
                        [criterionKey]: {
                            ...prev.sections[sectionKey]?.criteria[criterionKey],
                            ...update
                        }
                    }
                }
            }
        }));
    };

    const updatePreamble = (sectionKey: string, preamble: string) => {
        setState(prev => ({
            ...prev,
            sections: {
                ...prev.sections,
                [sectionKey]: {
                    ...prev.sections[sectionKey],
                    preamble
                }
            }
        }));
    };

    const setActiveSection = (sectionKey: string | null) => {
        setState(prev => ({
            ...prev,
            activeSection: sectionKey
        }));
    };

    const resetSection = (sectionKey: string) => {
        setState(prev => ({
            ...prev,
            sections: {
                ...prev.sections,
                [sectionKey]: {
                    criteria: {}
                }
            }
        }));
    };

    const resetAll = () => {
        const newState = createInitialState(sections);
        console.log("Reset all", newState);
        setState(newState);
    };

    const loadState = (newState: EvaluationState) => {
        setState(newState);
    };

    return (
        <EvaluationContext.Provider
            value={{
                state,
                updateCriterion,
                updatePreamble,
                setActiveSection,
                resetSection,
                resetAll,
                loadState,
                updateNotes
            }}
        >
            {children}
        </EvaluationContext.Provider>
    );
};

export const useEvaluationState = () => {
    const context = useContext(EvaluationContext);
    if (context === undefined) {
        throw new Error('useEvaluationState must be used within an EvaluationStateProvider');
    }
    return context;
};