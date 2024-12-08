export interface Weightable {
    title: string;
    weight: number;
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