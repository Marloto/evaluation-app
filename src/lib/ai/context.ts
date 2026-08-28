import { Criterion, Option, Section } from '@/lib/types/types';
import { htmlToPlainText } from './html';
import { CriterionContext, SectionContext } from './prompts';

interface CriterionState {
    score?: number;
    customText?: string;
}

interface SectionState {
    preamble?: string;
    criteria: Record<string, CriterionState>;
}

interface ThesisInfoState {
    title?: string;
    abstract?: string;
}

export interface EvaluationSnapshot {
    sections: Record<string, SectionState>;
    notes: string;
    thesisInfo?: ThesisInfoState;
}

/** Title and abstract entered in the "General Information" dialog. */
export const buildThesisContext = (
    state: Pick<EvaluationSnapshot, 'thesisInfo'>
): { thesisTitle: string; thesisAbstract: string } => ({
    thesisTitle: state.thesisInfo?.title?.trim() ?? '',
    thesisAbstract: state.thesisInfo?.abstract?.trim() ?? '',
});

const resolveText = (criterion: Criterion, state: CriterionState): string =>
    state.customText ||
    criterion.options.find((option: Option) => option.score === state.score)?.text ||
    '';

/** Builds the prompt context for one criterion of a section. */
export const buildCriterionContext = (
    criterionKey: string,
    criterion: Criterion,
    state: CriterionState
): CriterionContext => ({
    criterionKey,
    title: criterion.title,
    score: state.score as number,
    selectedText: resolveText(criterion, state),
    scale: criterion.options.map(option => ({ score: option.score, text: option.text })),
});

/**
 * Builds the prompt context for a section. Only criteria with a selected score
 * are included - unrated criteria have nothing to refine.
 */
export const buildSectionContext = (
    sectionKey: string,
    section: Section,
    sectionState: SectionState | undefined
): SectionContext => {
    const criteria = Object.entries(section.criteria)
        .map(([criterionKey, criterion]) => {
            const state = sectionState?.criteria?.[criterionKey];
            if (!state || state.score === undefined) return null;
            return buildCriterionContext(criterionKey, criterion, state);
        })
        .filter((entry): entry is CriterionContext => entry !== null);

    return {
        sectionKey,
        title: section.title,
        preamble: sectionState?.preamble?.trim() || undefined,
        criteria,
    };
};

/** Notes are stored as TipTap HTML - the LLM gets plain text without images. */
export const buildNotesText = (notes: string | undefined): string => htmlToPlainText(notes);
