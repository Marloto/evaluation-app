import { GradeThreshold, Section } from '@/lib/types/types';
import { ReportDefinition } from '@/lib/types/report';
import { generateSectionText } from './text-generation';
import { calculateNormalizedSectionScore } from './calculation';

interface CriterionState {
    score?: number;
    customText?: string;
}

interface SectionState {
    preamble?: string;
    criteria: Record<string, CriterionState>;
}

interface EvaluationStateLike {
    sections: Record<string, SectionState>;
    activeSection: string | null;
    thesisInfo?: {
        title: string;
        students?: string;
        program?: string;
        firstExaminer?: string;
        secondExaminer?: string;
        issueDate?: string;
        submissionDate?: string;
        reportChecks?: Record<string, boolean>;
        reportChoices?: Record<string, string>;
    };
}

export interface ReportFieldData {
    label: string;
    /** Empty when nothing has been entered yet; the placeholder is printed instead. */
    text: string;
    placeholder?: string;
}

export interface ReportHeaderData {
    students: string;
    program: string;
    firstExaminer: string;
    secondExaminer: string;
    issueDate: string;
    submissionDate: string;
}

export interface ReportCheckboxData {
    /** Text with the {choice} placeholder already filled in. */
    text: string;
    note?: string;
    checked: boolean;
}

export interface ReportGradeData {
    /** Weighted result over all sections, 0-100. */
    percentage: number;
    /** Grade string of the matching threshold, e.g. "2,3". */
    grade: string;
    /** Textual grade, e.g. "Gut". */
    text: string;
}

export interface ReportData {
    header: ReportHeaderData;
    fields: ReportFieldData[];
    checkboxes: ReportCheckboxData[];
    grade?: ReportGradeData;
}

/** Printed while nothing is picked, matching the blanks of the paper form. */
const EMPTY_CHOICE = '_______________';

/**
 * Weighted overall result over all sections, mirroring the calculation in
 * EvaluationNavigation: normalized section scores (0-5) weighted by section weight.
 */
export const calculateOverallPercentage = (
    sections: Record<string, Section>,
    evaluationState: EvaluationStateLike
): number => {
    const weightedScore = Object.entries(sections).reduce((sum, [sectionKey, section]) => {
        const normalizedScore = calculateNormalizedSectionScore(section, evaluationState.sections[sectionKey]);
        return sum + normalizedScore * section.weight;
    }, 0);

    return (weightedScore / 5) * 100;
};

/** True as soon as a single criterion has been rated. */
const hasAnyRating = (evaluationState: EvaluationStateLike): boolean =>
    Object.values(evaluationState.sections ?? {}).some(section =>
        Object.values(section?.criteria ?? {}).some(criterion => criterion?.score !== undefined)
    );

/**
 * Collects everything the printed report needs. Sections of the current config that
 * the report definition does not map are appended, so custom templates still print
 * all of their texts.
 */
export const buildReportData = (
    definition: ReportDefinition,
    sections: Record<string, Section>,
    evaluationState: EvaluationStateLike,
    calculateGrade: (percentage: number) => GradeThreshold
): ReportData => {
    const info = evaluationState.thesisInfo;
    const mappedSectionKeys = new Set(
        definition.fields
            .map(field => (field.source.kind === 'section' ? field.source.sectionKey : null))
            .filter((key): key is string => key !== null)
    );

    const fields: ReportFieldData[] = definition.fields.map(field => {
        if (field.source.kind === 'thesisTitle') {
            return { label: field.label, text: (info?.title ?? '').trim(), placeholder: field.placeholder };
        }

        // A report can map a section the current config does not define — print the placeholder.
        const sectionKey = field.source.sectionKey;
        const section = sections[sectionKey];
        const text = section
            ? generateSectionText(section, evaluationState.sections[sectionKey]).trim()
            : '';

        return { label: field.label, text, placeholder: field.placeholder };
    });

    Object.entries(sections)
        .filter(([sectionKey]) => !mappedSectionKeys.has(sectionKey))
        .forEach(([sectionKey, section]) => {
            const text = generateSectionText(section, evaluationState.sections[sectionKey]).trim();
            if (text) {
                fields.push({ label: section.title, text });
            }
        });

    const checkboxes: ReportCheckboxData[] = definition.checkboxes.map(checkbox => ({
        text: checkbox.text.replace(
            '{choice}',
            info?.reportChoices?.[checkbox.id]?.trim() || EMPTY_CHOICE
        ),
        note: checkbox.note,
        checked: info?.reportChecks?.[checkbox.id] === true
    }));

    const percentage = calculateOverallPercentage(sections, evaluationState);
    const threshold = calculateGrade(percentage);

    return {
        header: {
            students: (info?.students ?? '').trim(),
            program: (info?.program ?? '').trim(),
            firstExaminer: (info?.firstExaminer ?? '').trim(),
            secondExaminer: (info?.secondExaminer ?? '').trim(),
            issueDate: (info?.issueDate ?? '').trim(),
            submissionDate: (info?.submissionDate ?? '').trim()
        },
        fields,
        checkboxes,
        // Without any rating the grade would always read 5,0 — leave the field blank instead.
        grade: hasAnyRating(evaluationState)
            ? {
                percentage: Number(percentage.toFixed(1)),
                grade: threshold.grade,
                text: threshold.text
            }
            : undefined
    };
};
