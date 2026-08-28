import { EvaluationConfig } from '@/lib/types/types';
import { buildNotesText, buildSectionContext, buildThesisContext, EvaluationSnapshot } from './context';
import { getProvider, isAiAvailable, listProviders } from './registry';
import { AiSettings, getAiSettings, updateAiSettings } from './settings';
import {
    generateCriterionSuggestions,
    generatePreambleSuggestions,
    generateSectionSuggestions,
    GenerateOptions,
} from './suggestions';
import { LlmError } from './types';
import {
    buildCriterionPrompt,
    buildPreamblePrompt,
    buildSectionPrompt,
    buildSystemPrompt,
} from './prompts';
import {
    getActivePromptTemplate,
    listPromptTemplates,
    setActiveTemplate,
} from './prompt-store';

const CONFIG_STORAGE_KEY = 'thesis-evaluation-config';
const STATE_STORAGE_KEY = 'thesis-evaluation-state';

const readJson = <T>(key: string): T | null => {
    try {
        const raw = localStorage.getItem(key);
        return raw ? (JSON.parse(raw) as T) : null;
    } catch {
        return null;
    }
};

const loadConfig = (): EvaluationConfig => {
    const config = readJson<EvaluationConfig>(CONFIG_STORAGE_KEY);
    if (!config?.sections) {
        throw new LlmError('unknown', `No evaluation config found in localStorage ("${CONFIG_STORAGE_KEY}").`);
    }
    return config;
};

const loadState = (): EvaluationSnapshot => {
    const state = readJson<EvaluationSnapshot>(STATE_STORAGE_KEY);
    if (!state?.sections) {
        throw new LlmError('unknown', `No evaluation state found in localStorage ("${STATE_STORAGE_KEY}").`);
    }
    return state;
};

const resolveSection = (sectionKey: string) => {
    const config = loadConfig();
    const state = loadState();
    const section = config.sections[sectionKey];
    if (!section) {
        throw new LlmError(
            'unknown',
            `Unknown section "${sectionKey}". Available: ${Object.keys(config.sections).join(', ')}`
        );
    }
    return {
        context: buildSectionContext(sectionKey, section, state.sections[sectionKey]),
        notes: buildNotesText(state.notes),
        thesis: buildThesisContext(state),
    };
};

/**
 * Console playground for the AI layer - lets the whole pipeline be exercised
 * against real evaluation data before any UI exists.
 *
 *   thesisAi.setKey('sk-ant-...')
 *   await thesisAi.sections()
 *   await thesisAi.section('preface')
 */
export const aiConsole = {
    providers: () => listProviders().map(provider => ({ id: provider.id, label: provider.label, models: provider.models })),

    settings: (): AiSettings => getAiSettings(),

    configure: (patch: Partial<AiSettings>): AiSettings => updateAiSettings(patch),

    setKey: (apiKey: string): string => {
        updateAiSettings({ apiKey });
        return isAiAvailable() ? 'API key set (in memory only, gone after reload).' : 'API key rejected by provider check.';
    },

    available: (): boolean => isAiAvailable(),

    /** Overview of what is currently rated - useful to pick a section key. */
    sections: () => {
        const config = loadConfig();
        const state = loadState();
        return Object.entries(config.sections).map(([sectionKey, section]) => {
            const context = buildSectionContext(sectionKey, section, state.sections[sectionKey]);
            return {
                key: sectionKey,
                title: section.title,
                ratedCriteria: context.criteria.length,
                totalCriteria: Object.keys(section.criteria).length,
                hasPreamble: Boolean(context.preamble),
            };
        });
    },

    /** Plain text version of the notes as it would be sent to the model. */
    notes: (): string => buildNotesText(loadState().notes),

    /** Minimal round trip to verify key, model and CORS setup. */
    ping: async () => {
        const result = await getProvider().generate({
            messages: [{ role: 'user', content: 'Antworte ausschließlich mit dem Wort: pong' }],
            maxTokens: 64,
            effort: 'low',
        });
        return { text: result.text, model: result.model, usage: result.usage };
    },

    /** Prompt sets: list them, switch the active one, inspect the active one. */
    promptSets: () => listPromptTemplates().map(template => ({
        id: template.id,
        name: template.name,
        type: template.type,
        active: template.id === getActivePromptTemplate().id,
    })),

    usePromptSet: (id: string) => {
        setActiveTemplate(id);
        return getActivePromptTemplate().name;
    },

    /** Renders what would actually be sent, without calling the model. */
    preview: (
        mode: 'criterion' | 'preamble' | 'section',
        sectionKey: string,
        criterionKey?: string
    ) => {
        const settings = getAiSettings();
        const { context, notes, thesis } = resolveSection(sectionKey);
        const generation = {
            ...thesis,
            notes,
            language: settings.language,
            variants: settings.variants,
            extraInstructions: settings.extraInstructions,
        };

        let user: string;
        if (mode === 'criterion') {
            const criterion = context.criteria.find(entry => entry.criterionKey === criterionKey);
            if (!criterion) {
                throw new LlmError('unknown', `Criterion "${criterionKey}" is not rated in "${sectionKey}".`);
            }
            user = buildCriterionPrompt(context, criterion, generation);
        } else if (mode === 'preamble') {
            user = buildPreamblePrompt(context, generation);
        } else {
            user = buildSectionPrompt(context, generation);
        }

        return { system: buildSystemPrompt(generation), user };
    },

    criterion: async (sectionKey: string, criterionKey: string, options?: GenerateOptions) => {
        const { context, notes, thesis } = resolveSection(sectionKey);
        const criterion = context.criteria.find(entry => entry.criterionKey === criterionKey);
        if (!criterion) {
            throw new LlmError(
                'unknown',
                `Criterion "${criterionKey}" is not rated in section "${sectionKey}". Rated: ${context.criteria
                    .map(entry => entry.criterionKey)
                    .join(', ')}`
            );
        }
        return generateCriterionSuggestions(context, criterion, notes, { ...thesis, ...options });
    },

    preamble: async (sectionKey: string, options?: GenerateOptions) => {
        const { context, notes, thesis } = resolveSection(sectionKey);
        return generatePreambleSuggestions(context, notes, { ...thesis, ...options });
    },

    section: async (sectionKey: string, options?: GenerateOptions) => {
        const { context, notes, thesis } = resolveSection(sectionKey);
        if (context.criteria.length === 0) {
            throw new LlmError('unknown', `Section "${sectionKey}" has no rated criteria yet.`);
        }
        return generateSectionSuggestions(context, notes, { ...thesis, ...options });
    },
};

export type AiConsole = typeof aiConsole;

export const installAiConsole = (): void => {
    if (typeof window === 'undefined') return;
    (window as unknown as { thesisAi: AiConsole }).thesisAi = aiConsole;
};
