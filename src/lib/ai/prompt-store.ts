import {
    DEFAULT_PRESET_ID,
    PROMPT_FIELDS,
    PROMPT_PRESETS,
    PromptField,
    PromptSet,
} from './prompt-presets';

export interface PromptTemplate {
    id: string;
    name: string;
    description: string;
    type: 'preset' | 'custom';
    prompts: PromptSet;
    modifiedAt?: string;
}

interface PromptStoreState {
    version: number;
    activeId: string;
    custom: PromptTemplate[];
}

export const PROMPT_STORAGE_KEY = 'thesis-ai-prompts';
export const PROMPT_EXPORT_KIND = 'thesis-evaluation-prompts';
const STORE_VERSION = 1;

const presetTemplates = (): PromptTemplate[] =>
    PROMPT_PRESETS.map(preset => ({
        id: preset.id,
        name: preset.name,
        description: preset.description,
        type: 'preset' as const,
        prompts: preset.prompts,
    }));

const createInitialState = (): PromptStoreState => ({
    version: STORE_VERSION,
    activeId: DEFAULT_PRESET_ID,
    custom: [],
});

let state: PromptStoreState = createInitialState();
let hydrated = false;

type Listener = (state: PromptStoreState) => void;
const listeners = new Set<Listener>();

const notify = () => listeners.forEach(listener => listener(state));

const persist = () => {
    if (typeof window === 'undefined') return;
    try {
        localStorage.setItem(PROMPT_STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
        console.error('Could not persist prompt templates:', error);
    }
};

/** Reads from localStorage once, on first access in the browser. */
const ensureHydrated = () => {
    if (hydrated || typeof window === 'undefined') return;
    hydrated = true;
    try {
        const stored = localStorage.getItem(PROMPT_STORAGE_KEY);
        if (!stored) return;
        const parsed = JSON.parse(stored) as PromptStoreState;
        state = {
            version: STORE_VERSION,
            activeId: parsed.activeId || DEFAULT_PRESET_ID,
            custom: Array.isArray(parsed.custom) ? parsed.custom.filter(isPromptTemplate) : [],
        };
    } catch (error) {
        console.error('Could not read stored prompt templates:', error);
        state = createInitialState();
    }
};

const isPromptSet = (value: unknown): value is PromptSet => {
    if (!value || typeof value !== 'object') return false;
    const candidate = value as Record<string, unknown>;
    return PROMPT_FIELDS.every(field => typeof candidate[field.key] === 'string');
};

const isPromptTemplate = (value: unknown): value is PromptTemplate => {
    if (!value || typeof value !== 'object') return false;
    const candidate = value as Record<string, unknown>;
    return typeof candidate.id === 'string'
        && typeof candidate.name === 'string'
        && isPromptSet(candidate.prompts);
};

const createId = (): string =>
    `custom-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;

export const listPromptTemplates = (): PromptTemplate[] => {
    ensureHydrated();
    return [...presetTemplates(), ...state.custom];
};

export const getActiveTemplateId = (): string => {
    ensureHydrated();
    return state.activeId;
};

export const getActivePromptTemplate = (): PromptTemplate => {
    const templates = listPromptTemplates();
    return templates.find(template => template.id === state.activeId)
        ?? templates[0];
};

/** The prompt set every generation call renders from. */
export const getActivePrompts = (): PromptSet => getActivePromptTemplate().prompts;

export const setActiveTemplate = (id: string): void => {
    ensureHydrated();
    if (!listPromptTemplates().some(template => template.id === id)) return;
    state = { ...state, activeId: id };
    persist();
    notify();
};

export const isPresetId = (id: string): boolean =>
    PROMPT_PRESETS.some(preset => preset.id === id);

/**
 * Creates a custom template, or overwrites one when `id` names an existing
 * custom template. Presets are read-only - saving over one creates a copy.
 */
export const saveCustomTemplate = (input: {
    id?: string;
    name: string;
    description?: string;
    prompts: PromptSet;
}): string => {
    ensureHydrated();
    const targetId = input.id && !isPresetId(input.id) ? input.id : createId();
    const template: PromptTemplate = {
        id: targetId,
        name: input.name.trim() || 'Unnamed prompts',
        description: input.description?.trim() ?? '',
        type: 'custom',
        prompts: input.prompts,
        modifiedAt: new Date().toISOString(),
    };

    const existingIndex = state.custom.findIndex(entry => entry.id === targetId);
    const custom = existingIndex >= 0
        ? state.custom.map((entry, index) => (index === existingIndex ? template : entry))
        : [...state.custom, template];

    state = { ...state, custom, activeId: targetId };
    persist();
    notify();
    return targetId;
};

export const deleteCustomTemplate = (id: string): void => {
    ensureHydrated();
    if (isPresetId(id)) return;
    const custom = state.custom.filter(entry => entry.id !== id);
    const activeId = state.activeId === id ? DEFAULT_PRESET_ID : state.activeId;
    state = { ...state, custom, activeId };
    persist();
    notify();
};

export const resetPromptStore = (): void => {
    state = createInitialState();
    persist();
    notify();
};

export const subscribePrompts = (listener: Listener): (() => void) => {
    listeners.add(listener);
    return () => {
        listeners.delete(listener);
    };
};

export interface PromptExport {
    kind: typeof PROMPT_EXPORT_KIND;
    version: number;
    exportedAt: string;
    templates: Array<Pick<PromptTemplate, 'name' | 'description' | 'prompts'>>;
}

export const exportPromptTemplates = (ids: string[]): PromptExport => {
    const all = listPromptTemplates();
    return {
        kind: PROMPT_EXPORT_KIND,
        version: STORE_VERSION,
        exportedAt: new Date().toISOString(),
        templates: all
            .filter(template => ids.includes(template.id))
            .map(({ name, description, prompts }) => ({ name, description, prompts })),
    };
};

export class PromptImportError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'PromptImportError';
    }
}

/**
 * Accepts an export file, a bare template, or a bare prompt set. Everything is
 * imported as a custom template - presets stay untouched.
 */
export const importPromptTemplates = (raw: unknown): PromptTemplate[] => {
    ensureHydrated();

    let candidates: Array<{ name?: string; description?: string; prompts: PromptSet }> = [];

    if (isPromptSet(raw)) {
        candidates = [{ prompts: raw }];
    } else if (isPromptTemplate(raw)) {
        candidates = [{ name: raw.name, description: raw.description, prompts: raw.prompts }];
    } else if (raw && typeof raw === 'object' && Array.isArray((raw as PromptExport).templates)) {
        const templates = (raw as PromptExport).templates;
        const invalid = templates.filter(entry => !isPromptSet(entry?.prompts));
        if (invalid.length > 0) {
            throw new PromptImportError(
                `${invalid.length} of ${templates.length} templates are missing prompt fields.`
            );
        }
        candidates = templates.map(entry => ({
            name: entry.name,
            description: entry.description,
            prompts: entry.prompts,
        }));
    }

    if (candidates.length === 0) {
        const missing = isPromptSetShapeHint(raw);
        throw new PromptImportError(
            missing
                ? `Not a prompt file - missing fields: ${missing.join(', ')}.`
                : 'Not a prompt file.'
        );
    }

    const imported: PromptTemplate[] = candidates.map(candidate => ({
        id: createId(),
        name: candidate.name?.trim() || 'Imported prompts',
        description: candidate.description?.trim() ?? '',
        type: 'custom' as const,
        prompts: candidate.prompts,
        modifiedAt: new Date().toISOString(),
    }));

    state = {
        ...state,
        custom: [...state.custom, ...imported],
        activeId: imported[imported.length - 1].id,
    };
    persist();
    notify();
    return imported;
};

/** Which prompt fields a near-miss object is lacking, for a useful error. */
const isPromptSetShapeHint = (raw: unknown): PromptField[] | null => {
    if (!raw || typeof raw !== 'object') return null;
    const source = ('prompts' in (raw as Record<string, unknown>)
        ? (raw as Record<string, unknown>).prompts
        : raw) as Record<string, unknown> | undefined;
    if (!source || typeof source !== 'object') return null;
    const missing = PROMPT_FIELDS
        .filter(field => typeof source[field.key] !== 'string')
        .map(field => field.key);
    return missing.length > 0 && missing.length < PROMPT_FIELDS.length ? missing : null;
};
