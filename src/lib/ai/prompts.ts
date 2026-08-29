import { PromptSet } from './prompt-presets';
import { getActivePrompts } from './prompt-store';
import { renderTemplate, TemplateVars } from './template';

export interface ScaleOption {
    score: number;
    text: string;
}

export interface CriterionContext {
    criterionKey: string;
    title: string;
    /** What this criterion looks at, from the configuration. */
    purpose?: string;
    score: number;
    /** Text that is currently in use (custom text or the selected option text). */
    selectedText: string;
    /** Full option scale of the criterion, used to keep the level calibrated. */
    scale?: ScaleOption[];
}

export interface SectionContext {
    sectionKey: string;
    title: string;
    /** What this section covers, from the configuration. */
    purpose?: string;
    /** Current intro text of the section, if any. */
    preamble?: string;
    criteria: CriterionContext[];
}

export interface GenerationContext {
    /** Plain text notes taken while reading the thesis. */
    notes: string;
    language: string;
    thesisTitle?: string;
    thesisAbstract?: string;
    /** Free form extra steering from the user. */
    extraInstructions?: string;
}

const resolvePrompts = (prompts?: PromptSet): PromptSet => prompts ?? getActivePrompts();

const renderScale = (scale?: ScaleOption[]): string =>
    scale && scale.length > 0
        ? scale.map(option => `  ${option.score}: ${option.text}`).join('\n')
        : '';

/** Variables available to the criterion block template. */
const criterionVars = (criterion: CriterionContext): TemplateVars => ({
    criterionKey: criterion.criterionKey,
    criterionTitle: criterion.title,
    criterionScore: criterion.score,
    criterionText: criterion.selectedText,
    criterionPurpose: criterion.purpose?.trim() ?? '',
    scale: renderScale(criterion.scale),
});

export const renderCriterionBlock = (
    criterion: CriterionContext,
    prompts?: PromptSet
): string => renderTemplate(resolvePrompts(prompts).criterionBlock, criterionVars(criterion));

/** Variables shared by all three task templates. */
const taskVars = (
    section: SectionContext,
    context: GenerationContext,
    prompts: PromptSet
): TemplateVars => ({
    language: context.language,
    thesisTitle: context.thesisTitle ?? '',
    thesisAbstract: context.thesisAbstract ?? '',
    notes: context.notes.trim(),
    sectionTitle: section.title,
    sectionPurpose: section.purpose?.trim() ?? '',
    sectionPreamble: section.preamble ?? '',
    criteriaList: section.criteria
        .map(criterion => renderCriterionBlock(criterion, prompts))
        .join('\n'),
});

export const buildSystemPrompt = (context: GenerationContext, prompts?: PromptSet): string =>
    renderTemplate(resolvePrompts(prompts).system, {
        language: context.language,
        extraInstructions: context.extraInstructions ?? '',
    });

/** Prompt for a single criterion text. */
export const buildCriterionPrompt = (
    section: SectionContext,
    criterion: CriterionContext,
    context: GenerationContext,
    prompts?: PromptSet
): string => {
    const active = resolvePrompts(prompts);
    return renderTemplate(active.criterion, {
        ...taskVars(section, context, active),
        criterionBlock: renderCriterionBlock(criterion, active),
    });
};

/** Prompt for the intro paragraph of a section. */
export const buildPreamblePrompt = (
    section: SectionContext,
    context: GenerationContext,
    prompts?: PromptSet
): string => {
    const active = resolvePrompts(prompts);
    return renderTemplate(active.preamble, taskVars(section, context, active));
};

/** Prompt covering the intro plus every rated criterion of a section in one call. */
export const buildSectionPrompt = (
    section: SectionContext,
    context: GenerationContext,
    prompts?: PromptSet
): string => {
    const active = resolvePrompts(prompts);
    return renderTemplate(active.section, taskVars(section, context, active));
};

/** Sample context used to preview a template without calling the model. */
export const SAMPLE_SECTION: SectionContext = {
    sectionKey: 'form',
    title: 'Form der Arbeit',
    purpose: 'Wie die Arbeit in ihrer Form umgesetzt wurde. Eine Preample könnte herausstellen, wo die Form abweicht bzw. wo sie sich auszeichnet.',
    preamble: 'Die Arbeit folgt insgesamt den formalen Vorgaben.',
    criteria: [
        {
            criterionKey: 'scientific_approach',
            title: 'Wissenschaftliches Vorgehen',
            purpose: 'Einhaltung wissenschaftlicher Standards bei Vorgehen und Darstellung.',
            score: 4,
            selectedText: 'Das wissenschaftliche Vorgehen entspricht gut den Standards',
            scale: [
                { score: 3, text: 'Das wissenschaftliche Vorgehen entspricht den Standards' },
                { score: 4, text: 'Das wissenschaftliche Vorgehen entspricht gut den Standards' },
            ],
        },
        {
            criterionKey: 'citation',
            title: 'Zitierweise',
            score: 3,
            selectedText: 'Die Zitierweise ist korrekt',
        },
    ],
};

export const SAMPLE_CONTEXT: GenerationContext = {
    notes: 'Kapitel 3 sauber hergeleitet.\nQuellenlage breit, aber wenig aktuelle Literatur.',
    language: 'Deutsch',
    thesisTitle: 'Beispielarbeit',
    thesisAbstract: 'Die Arbeit untersucht ein Verfahren zur automatisierten Auswertung.',
    extraInstructions: '',
};
