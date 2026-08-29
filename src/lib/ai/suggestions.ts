import type { ZodType } from 'zod';

import { getProvider } from './registry';
import {
    CriterionSuggestions,
    SectionSuggestionsSchema,
    Suggestion,
    SuggestionListSchema,
} from './schemas';
import { getAiSettings } from './settings';
import {
    buildCriterionPrompt,
    buildPreamblePrompt,
    buildSectionPrompt,
    buildSystemPrompt,
    CriterionContext,
    GenerationContext,
    SectionContext,
} from './prompts';
import { LlmError, LlmUsage } from './types';

export interface SuggestionMeta {
    model: string;
    usage?: LlmUsage;
    /** Wall clock duration of the request in milliseconds. */
    durationMs: number;
}

export interface SuggestionsResponse {
    suggestions: Suggestion[];
    meta: SuggestionMeta;
}

export interface SectionSuggestionsResponse {
    preamble: Suggestion[];
    criteria: CriterionSuggestions[];
    meta: SuggestionMeta;
}

export interface GenerateOptions {
    signal?: AbortSignal;
    /** Overrides for the ambient AI settings. */
    language?: string;
    thesisTitle?: string;
    thesisAbstract?: string;
    extraInstructions?: string;
}

const buildContext = (notes: string, options?: GenerateOptions): GenerationContext => {
    const settings = getAiSettings();
    return {
        notes,
        language: options?.language ?? settings.language,
        thesisTitle: options?.thesisTitle,
        thesisAbstract: options?.thesisAbstract,
        extraInstructions: options?.extraInstructions ?? settings.extraInstructions,
    };
};

const run = async <T>(
    context: GenerationContext,
    prompt: string,
    schema: ZodType<T>,
    signal?: AbortSignal,
    maxTokens?: number
) => {
    const provider = getProvider();
    const startedAt = Date.now();
    const result = await provider.generate<T>({
        system: buildSystemPrompt(context),
        messages: [{ role: 'user', content: prompt }],
        schema,
        signal,
        maxTokens,
    });
    if (result.data == null) {
        throw new LlmError('invalid-response', 'Model returned no structured suggestions.');
    }
    return {
        data: result.data,
        meta: {
            model: result.model,
            usage: result.usage,
            durationMs: Date.now() - startedAt,
        } satisfies SuggestionMeta,
    };
};

/** Variants for the text of one rated criterion. */
export const generateCriterionSuggestions = async (
    section: SectionContext,
    criterion: CriterionContext,
    notes: string,
    options?: GenerateOptions
): Promise<SuggestionsResponse> => {
    const context = buildContext(notes, options);
    const { data, meta } = await run<{ suggestions: Suggestion[] }>(
        context,
        buildCriterionPrompt(section, criterion, context),
        SuggestionListSchema,
        options?.signal,
        4000
    );
    return { suggestions: data.suggestions, meta };
};

/** Variants for the intro paragraph of a section. */
export const generatePreambleSuggestions = async (
    section: SectionContext,
    notes: string,
    options?: GenerateOptions
): Promise<SuggestionsResponse> => {
    const context = buildContext(notes, options);
    const { data, meta } = await run<{ suggestions: Suggestion[] }>(
        context,
        buildPreamblePrompt(section, context),
        SuggestionListSchema,
        options?.signal,
        4000
    );
    return { suggestions: data.suggestions, meta };
};

/** Intro plus every rated criterion of a section in a single request. */
export const generateSectionSuggestions = async (
    section: SectionContext,
    notes: string,
    options?: GenerateOptions
): Promise<SectionSuggestionsResponse> => {
    const context = buildContext(notes, options);
    const { data, meta } = await run<{
        preamble: Suggestion[];
        criteria: CriterionSuggestions[];
    }>(
        context,
        buildSectionPrompt(section, context),
        SectionSuggestionsSchema,
        options?.signal,
        16000
    );
    return { preamble: data.preamble, criteria: data.criteria, meta };
};
