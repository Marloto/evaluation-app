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