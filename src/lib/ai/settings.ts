import { LlmEffort } from './types';

export interface AiSettings {
    providerId: string;
    model: string;
    apiKey?: string;
    /** Output language of the generated texts. */
    language: string;
    effort: LlmEffort;
    /** Free form steering appended to the system prompt. */
    extraInstructions?: string;
}

export const DEFAULT_AI_SETTINGS: AiSettings = {
    providerId: 'anthropic',
    model: 'claude-opus-5',
    apiKey: undefined,
    language: 'Deutsch',
    effort: 'medium',
    extraInstructions: undefined,
};

export const AI_SETTINGS_STORAGE_KEY = 'thesis-ai-settings';

/** Everything except the API key is persisted - the key stays in memory only. */
type PersistedSettings = Omit<AiSettings, 'apiKey'>;

let current: AiSettings = { ...DEFAULT_AI_SETTINGS };
let hydrated = false;

type Listener = (settings: AiSettings) => void;
const listeners = new Set<Listener>();

const persist = () => {
    if (typeof window === 'undefined') return;
    try {
        const persistable: PersistedSettings = {
            providerId: current.providerId,
            model: current.model,
            language: current.language,
            effort: current.effort,
            extraInstructions: current.extraInstructions,
        };
        localStorage.setItem(AI_SETTINGS_STORAGE_KEY, JSON.stringify(persistable));
    } catch (error) {
        console.error('Could not persist AI settings:', error);
    }
};

const ensureHydrated = () => {
    if (hydrated || typeof window === 'undefined') return;
    hydrated = true;
    try {
        const stored = localStorage.getItem(AI_SETTINGS_STORAGE_KEY);
        if (!stored) return;
        const parsed = JSON.parse(stored) as Partial<PersistedSettings>;
        current = { ...DEFAULT_AI_SETTINGS, ...parsed, apiKey: current.apiKey };
    } catch (error) {
        console.error('Could not read stored AI settings:', error);
    }
};

export const getAiSettings = (): AiSettings => {
    ensureHydrated();
    return current;
};

export const updateAiSettings = (patch: Partial<AiSettings>): AiSettings => {
    ensureHydrated();
    current = { ...current, ...patch };
    persist();
    listeners.forEach(listener => listener(current));
    return current;
};

export const resetAiSettings = (): AiSettings =>
    updateAiSettings({ ...DEFAULT_AI_SETTINGS, apiKey: current.apiKey });

export const subscribeAiSettings = (listener: Listener): (() => void) => {
    listeners.add(listener);
    return () => {
        listeners.delete(listener);
    };
};

export const hasApiKey = (): boolean => {
    ensureHydrated();
    return Boolean(current.apiKey && current.apiKey.trim().length > 0);
};
