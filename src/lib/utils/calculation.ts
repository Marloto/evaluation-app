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
): { 
    score: number; 
    validCriteria: number; 
    totalCriteria: number;
    optionalCriteria: number;
} => {
    let weightedSum = 0;
    let totalWeight = 0;
    let validCriteria = 0;
    let optionalCriteria = 0;
    
    // Zähle nur nicht-optionale Kriterien für die Pflicht-Gesamtzahl
    const totalCriteria = Object.values(section.criteria)
        .filter(c => !c.excludeFromTotal).length;

    // Berechne gewichtete Summe für alle ausgewählten Kriterien
    Object.entries(section.criteria).forEach(([criterionKey, criterion]) => {
        const score = sectionState?.criteria[criterionKey]?.score;
        if (score === undefined) return;

        // Zähle ausgewählte Kriterien
        if (criterion.excludeFromTotal) {
            optionalCriteria++;
        } else {
            validCriteria++;
        }

        // Fließt in jedem Fall in die Gesamtberechnung ein
        weightedSum += score * criterion.weight;
        totalWeight += criterion.weight;
    });

    // Normalisiere das Ergebnis
    const normalizedScore = totalWeight > 0 ? weightedSum / totalWeight : 0;

    return {
        score: Number(normalizedScore.toFixed(2)),
        validCriteria,
        totalCriteria,
        optionalCriteria
    };
};

/**
 * Berechnet die normalisierte Gesamtbewertung über alle Sektionen
 */
export const calculateTotalScore = (
    sections: Record<string, Section>,
    evaluationState: EvaluationState
): { 
    score: number; 
    percentage: number;
    validCriteria: number;
    totalCriteria: number;
    optionalCriteria: number;
} => {
    let weightedSum = 0;
    let totalWeight = 0;
    let allValidCriteria = 0;
    let allTotalCriteria = 0;
    let allOptionalCriteria = 0;

    // Berechne gewichtete Summe und Gesamtgewicht über alle Sektionen
    Object.entries(sections).forEach(([sectionKey, section]) => {
        const sectionState = evaluationState.sections[sectionKey];
        const { 
            score, 
            validCriteria, 
            totalCriteria,
            optionalCriteria
        } = calculateSectionScore(section, sectionState);
        
        weightedSum += score * section.weight;
        totalWeight += section.weight;
        allValidCriteria += validCriteria;
        allTotalCriteria += totalCriteria;
        allOptionalCriteria += optionalCriteria;
    });

    // Normalisiere das Gesamtergebnis
    const normalizedScore = totalWeight > 0 ? weightedSum / totalWeight : 0;
    
    // Berechne den Prozentsatz (basierend auf Max-Score 5.0)
    const percentage = (normalizedScore / 5) * 100;

    return {
        score: Number(normalizedScore.toFixed(1)),
        percentage: Number(percentage.toFixed(1)),
        validCriteria: allValidCriteria,
        totalCriteria: allTotalCriteria,
        optionalCriteria: allOptionalCriteria
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
            // Prüfe die Gewichtssumme aller Kriterien in einer Sektion
            const criteriaWeightSum = Object.values(section.criteria)
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