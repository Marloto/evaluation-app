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
}

interface EvaluationContextType {
    state: EvaluationState;
    updateCriterion: (sectionKey: string, criterionKey: string, update: Partial<CriterionState>) => void;
    updatePreamble: (sectionKey: string, preamble: string) => void;
    setActiveSection: (sectionKey: string | null) => void;
    resetSection: (sectionKey: string) => void;
    resetAll: () => void;
    loadState: (newState: EvaluationState) => void; // Neue Funktion
}

const EvaluationContext = createContext<EvaluationContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'thesis-evaluation-state';

const createInitialState = (sections: Record<string, Section>): EvaluationState => {
    const initial: Record<string, SectionState> = {};
    Object.keys(sections).forEach(sectionKey => {
        initial[sectionKey] = {
            criteria: {}
        };
    });
    return {
        sections: initial,
        activeSection: Object.keys(sections)[0] || null
    };
};

interface EvaluationStateProviderProps {
    children: React.ReactNode;
    sections: Record<string, Section>;
}

export const EvaluationStateProvider: React.FC<EvaluationStateProviderProps> = ({
    children,
    sections
}) => {
    // Initialer State ist immer der leere Zustand
    const [state, setState] = useState<EvaluationState>(() =>
        createInitialState(sections)
    );

    // Lade den State aus dem localStorage erst nach dem ersten Render
    useEffect(() => {
        try {
            const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
            if (stored) {
                const parsedState = JSON.parse(stored);
                // Validiere und aktualisiere den gespeicherten Zustand
                const validSections = Object.keys(sections);
                const validatedSections: Record<string, SectionState> = {};

                validSections.forEach(sectionKey => {
                    validatedSections[sectionKey] = parsedState.sections[sectionKey] || {
                        criteria: {}
                    };
                });

                setState({
                    sections: validatedSections,
                    activeSection: parsedState.activeSection || validSections[0] || null
                });
            }
        } catch (error) {
            console.error('Error loading evaluation state:', error);
        }
    }, []);

    // Save state to localStorage whenever it changes
    useEffect(() => {
        try {
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state));
        } catch (error) {
            console.error('Error saving evaluation state:', error);
        }
    }, [state]);

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
        setState(createInitialState(sections));
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
                loadState // Neue Funktion
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