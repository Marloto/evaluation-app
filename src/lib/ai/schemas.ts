import { z } from 'zod';

export const SuggestionSchema = z.object({
    text: z.string().describe('Die vorgeschlagene Formulierung als Fließtext.'),
    basis: z.string().describe('Kurzer Hinweis, welche Notizinhalte eingearbeitet wurden.'),
});

export const SuggestionListSchema = z.object({
    suggestions: z.array(SuggestionSchema),
});

export const CriterionSuggestionsSchema = z.object({
    criterionKey: z.string().describe('Schlüssel des Kriteriums, exakt wie vorgegeben.'),
    suggestions: z.array(SuggestionSchema),
});

export const SectionSuggestionsSchema = z.object({
    preamble: z.array(SuggestionSchema).describe('Varianten des einleitenden Absatzes.'),
    criteria: z.array(CriterionSuggestionsSchema),
});

export type Suggestion = z.infer<typeof SuggestionSchema>;
export type SuggestionList = z.infer<typeof SuggestionListSchema>;
export type CriterionSuggestions = z.infer<typeof CriterionSuggestionsSchema>;
export type SectionSuggestions = z.infer<typeof SectionSuggestionsSchema>;
