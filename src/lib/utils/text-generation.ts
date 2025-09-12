import { Section, Criterion, Option } from '@/lib/types/types';

interface CriterionState {
    score?: number;
    customText?: string;
}

interface SectionState {
    preamble?: string;
    criteria: Record<string, CriterionState>;
}

interface EvaluationState {
    sections: Record<string, SectionState>;
    activeSection: string | null;
}

/**
 * Generiert den Text für eine einzelne Sektion
 */
export const generateSectionText = (
    section: Section,
    sectionState: SectionState | undefined
): string => {
    if (!sectionState) return '';

    // Get preamble if it exists and trim whitespace
    const preamble = sectionState.preamble?.trim();

    // Generate text from selected criteria
    const selectedTexts = Object.entries(section.criteria)
        .map(([criterionKey, criterion]: [string, Criterion]) => {
            const criterionState = sectionState.criteria[criterionKey];
            if (criterionState?.score === undefined) return null;

            // Use custom text if available, otherwise find matching option text
            return criterionState.customText || 
                   criterion.options.find((opt: Option) => opt.score === criterionState.score)?.text || "";
        })
        .filter((text): text is string => text !== null);

    // Join texts with proper punctuation
    const generatedText = selectedTexts
        .map(text => text.trim().endsWith('.') ? text.trim() : `${text.trim()}.`)
        .join(' ');

    // Combine preamble and generated text
    return preamble ? `${preamble}${generatedText ? ' ' + generatedText : ''}` : generatedText;
};

/**
 * Generates structured data for editable text components
 */
export interface EditableCriterionText {
    sectionKey: string;
    criterionKey: string;
    text: string;
    title: string;
}

export interface EditableSectionData {
    sectionKey: string;
    title: string;
    preamble?: string;
    criteria: EditableCriterionText[];
}

/**
 * Helper function to format text with proper punctuation
 */
export const formatTextWithPunctuation = (text: string): string => {
    const trimmed = text.trim();
    return trimmed.endsWith('.') ? trimmed : `${trimmed}.`;
};

/**
 * Generates structured data for editable text display
 */
export const generateEditableTextData = (
    sections: Record<string, Section>,
    evaluationState: EvaluationState
): EditableSectionData[] => {
    return Object.entries(sections).map(([sectionKey, section]) => {
        const sectionState = evaluationState.sections[sectionKey];
        
        const criteria: EditableCriterionText[] = Object.entries(section.criteria)
            .map(([criterionKey, criterion]: [string, Criterion]) => {
                const criterionState = sectionState?.criteria[criterionKey];
                if (criterionState?.score === undefined) return null;

                // Use custom text if available, otherwise find matching option text
                const text = criterionState.customText || 
                           criterion.options.find((opt: Option) => opt.score === criterionState.score)?.text || "";

                return {
                    sectionKey,
                    criterionKey,
                    text,
                    title: criterion.title
                };
            })
            .filter((criterion): criterion is EditableCriterionText => criterion !== null);

        return {
            sectionKey,
            title: section.title,
            preamble: sectionState?.preamble?.trim(),
            criteria
        };
    });
};

/**
 * Generiert den kompletten Text für alle Sektionen
 */
export const generateFullText = (
    sections: Record<string, Section>,
    evaluationState: EvaluationState
): Record<string, string> => {
    const texts: Record<string, string> = {};
    
    Object.entries(sections).forEach(([sectionKey, section]) => {
        texts[sectionKey] = generateSectionText(
            section,
            evaluationState.sections[sectionKey]
        );
    });
    
    return texts;
};
