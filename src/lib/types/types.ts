export interface Weightable {
    title: string;
    weight: number;
    /**
     * Short description of what this section or criterion is about. Shown in the
     * evaluation view and passed to the AI as context for the generated texts.
     */
    purpose?: string;
}

export interface Section extends Weightable {
    criteria: Record<string, Criterion>;
}

export interface Criterion extends Weightable {
    excludeFromTotal?: boolean;
    options: Option[];
}

export interface Option {
    text: string;
    score: number;
}

export interface EvaluationConfig {
    sections: { [key: string]: Section };
    /**
     * Which report ("Gutachten") this configuration is printed as. Copied from the
     * template the config was loaded from, so it survives export/import and reloads.
     * Unknown or missing ids fall back to the first report definition.
     */
    reportType?: string;
}

export interface GradeThreshold {
    grade: string;      // Note als Zahl (1,0)
    text: string;       // Textuelle Beschreibung
    minPercentage: number;
    color: string;
    bgColor: string;    // Hellerer Hintergrund
}

export interface GradeConfig {
    thresholds: GradeThreshold[];
}

export interface BaseTemplate {
    id: string;
    name: string;
    description: string;
    /** Report definition this template is evaluated for, see report-templates.ts. */
    reportType?: string;
    config: EvaluationConfig;
}

export interface DefaultTemplate extends BaseTemplate {
    type: 'default';
    version: string;
    lastUpdated: string;
}

export interface SavedTemplate extends BaseTemplate {
    type: 'saved';
    createdAt: string;
    modifiedAt: string;
}

export type Template = DefaultTemplate | SavedTemplate;