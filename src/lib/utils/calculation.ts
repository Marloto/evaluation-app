import { Section } from '@/lib/types/types';

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
 * Berechnet den Fortschritt für eine einzelne Sektion (nur für Progress-Anzeige)
 */
export const calculateSectionProgress = (
    section: Section,
    sectionState: SectionState | undefined
): { 
    completedCriteria: number;
    totalRequiredCriteria: number;
    completedBonusCriteria: number;
} => {
    // Safety check
    if (!sectionState || !sectionState.criteria) {
        return {
            completedCriteria: 0,
            totalRequiredCriteria: Object.values(section.criteria).filter(c => !c.excludeFromTotal).length,
            completedBonusCriteria: 0
        };
    }

    let completedCriteria = 0;
    let completedBonusCriteria = 0;
    
    // Zähle nur nicht-optionale Kriterien für die Pflicht-Gesamtzahl
    const totalRequiredCriteria = Object.values(section.criteria)
        .filter(c => !c.excludeFromTotal).length;

    // Zähle completed Kriterien
    Object.entries(section.criteria).forEach(([criterionKey, criterion]) => {
        const score = sectionState.criteria[criterionKey]?.score;
        if (score !== undefined) {
            if (criterion.excludeFromTotal) {
                completedBonusCriteria++;
            } else {
                completedCriteria++;
            }
        }
    });

    return {
        completedCriteria,
        totalRequiredCriteria,
        completedBonusCriteria
    };
};

/**
 * Berechnet den Gesamtfortschritt über alle Sektionen (nur für Progress-Anzeige)
 */
export const calculateTotalProgress = (
    sections: Record<string, Section>,
    evaluationState: EvaluationState
): { 
    completedCriteria: number;
    totalRequiredCriteria: number;
    completedBonusCriteria: number;
    percentage: number;
} => {
    let allCompletedCriteria = 0;
    let allTotalRequiredCriteria = 0;
    let allCompletedBonusCriteria = 0;

    // Summiere über alle Sektionen
    Object.entries(sections).forEach(([sectionKey, section]) => {
        const sectionState = evaluationState.sections[sectionKey];
        const { 
            completedCriteria, 
            totalRequiredCriteria,
            completedBonusCriteria
        } = calculateSectionProgress(section, sectionState);
        
        allCompletedCriteria += completedCriteria;
        allTotalRequiredCriteria += totalRequiredCriteria;
        allCompletedBonusCriteria += completedBonusCriteria;
    });

    // Berechne Prozentsatz
    const percentage = allTotalRequiredCriteria > 0 
        ? (allCompletedCriteria / allTotalRequiredCriteria) * 100 
        : 0;

    return {
        completedCriteria: allCompletedCriteria,
        totalRequiredCriteria: allTotalRequiredCriteria,
        completedBonusCriteria: allCompletedBonusCriteria,
        percentage: Number(percentage.toFixed(1))
    };
};


/**
 * Berechnet den normalisierten Anzeigewert für eine Sektion (0-5 basierend auf gewichteter Beitragsleistung begrenzt auf 100%)
 * Dies stellt dar, wie viel die Sektion zur Endnote beiträgt, wobei Bonus-Punkte die Anzeige auf 5.0 begrenzen können.
 */
export const calculateNormalizedSectionScore = (
    section: Section,
    sectionState: SectionState | undefined
): number => {
    if (!sectionState?.criteria) {
        return 0;
    }
    
    let regularWeightedSum = 0;
    let regularTotalWeight = 0;
    let bonusWeightedSum = 0;
    
    Object.entries(section.criteria).forEach(([criterionKey, criterion]) => {
        const score = sectionState.criteria[criterionKey]?.score;
        if (score === undefined) return;
        
        if (criterion.excludeFromTotal) {
            bonusWeightedSum += score * criterion.weight;
        } else {
            regularWeightedSum += score * criterion.weight;
            regularTotalWeight += criterion.weight;
        }
    });
    
    // Cap total weighted sum at 100% (regularTotalWeight * 5) and normalize to 5
    const cappedWeightedSum = Math.min(regularTotalWeight * 5, regularWeightedSum + bonusWeightedSum);
    return regularTotalWeight > 0 ? (cappedWeightedSum / regularTotalWeight) : 0;
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