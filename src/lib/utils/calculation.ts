import { Section, Criterion } from '@/lib/types/types';

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

/**
 * Berechnet die normalisierte Bewertung für eine einzelne Sektion
 */
export const calculateSectionScore = (
    section: Section,
    sectionState: SectionState | undefined
): { score: number; validCriteria: number; totalCriteria: number } => {
    let weightedSum = 0;
    let totalWeight = 0;
    let validCriteria = 0;
    const totalCriteria = Object.values(section.criteria)
        .filter(c => !c.excludeFromTotal).length;

    // Berechne gewichtete Summe und Gesamtgewicht
    Object.entries(section.criteria).forEach(([criterionKey, criterion]) => {
        if (criterion.excludeFromTotal) {
            return;
        }

        const score = sectionState?.criteria[criterionKey]?.score;
        if (score !== undefined) {
            weightedSum += score * criterion.weight;
            totalWeight += criterion.weight;
            validCriteria++;
        }
    });

    // Normalisiere das Ergebnis
    const normalizedScore = totalWeight > 0 ? weightedSum / totalWeight : 0;

    return {
        score: Number(normalizedScore.toFixed(2)),
        validCriteria,
        totalCriteria
    };
};

/**
 * Berechnet die normalisierte Gesamtbewertung über alle Sektionen
 */
export const calculateTotalScore = (
    sections: Record<string, Section>,
    evaluationState: EvaluationState
): { score: number; percentage: number, validCriteria: number, totalCriteria: number } => {
    let weightedSum = 0;
    let totalWeight = 0;
    let allValidCriteria = 0;
    let allTotalCriteria = 0;

    // Berechne gewichtete Summe und Gesamtgewicht über alle Sektionen
    Object.entries(sections).forEach(([sectionKey, section]) => {
        const sectionState = evaluationState.sections[sectionKey];
        const { score, validCriteria, totalCriteria } = calculateSectionScore(section, sectionState);
        
        weightedSum += score * section.weight;
        totalWeight += section.weight;
        allValidCriteria += validCriteria;
        allTotalCriteria += totalCriteria;
    });

    // Normalisiere das Gesamtergebnis
    const normalizedScore = totalWeight > 0 ? weightedSum / totalWeight : 0;
    
    // Berechne den Prozentsatz (basierend auf Max-Score 5.0)
    const percentage = (normalizedScore / 5) * 100;

    return {
        score: Number(normalizedScore.toFixed(1)),
        percentage: Number(percentage.toFixed(1)),
        validCriteria: allValidCriteria,
        totalCriteria: allTotalCriteria
    };
};

/**
 * Validiert die Gewichtungen (für UI-Feedback)
 */
export const validateWeights = (
    sections: Record<string, Section>
): { 
    isValid: boolean;
    sectionWeightSum: number;
    invalidSections: Array<{ key: string; weightSum: number }> 
} => {
    const sectionWeightSum = Object.values(sections)
        .reduce((sum, section) => sum + section.weight, 0);

    const invalidSections = Object.entries(sections)
        .map(([key, section]) => {
            const criteriaWeightSum = Object.values(section.criteria)
                .filter(c => !c.excludeFromTotal)
                .reduce((sum, criterion) => sum + criterion.weight, 0);
            
            return {
                key,
                weightSum: criteriaWeightSum
            };
        })
        .filter(section => Math.abs(section.weightSum - 1) > 0.001);

    return {
        isValid: Math.abs(sectionWeightSum - 1) <= 0.001 && invalidSections.length === 0,
        sectionWeightSum,
        invalidSections
    };
};