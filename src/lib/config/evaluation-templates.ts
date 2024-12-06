import { EvaluationConfig } from '../types/types';
import { evaluationConfig } from './evaluation-config';

// Bachelor-Konfiguration
export const bachelorConfig: EvaluationConfig = {
    sections: {
        ...evaluationConfig.sections,
        preface: {
            ...evaluationConfig.sections.preface,
            criteria: {
                ...evaluationConfig.sections.preface.criteria,
                implementation: {
                    ...evaluationConfig.sections.preface.criteria.implementation,
                    options: [
                        { text: "Die technische Umsetzung weist grundlegende Mängel auf", score: 1 },
                        { text: "Die technische Umsetzung erfüllt grundlegende Anforderungen", score: 2 },
                        { text: "Die technische Umsetzung ist angemessen und zeigt praktische Problemlösungskompetenz", score: 3 },
                        { text: "Die technische Umsetzung ist gut durchdacht und zeigt gute Problemlösungskompetenz", score: 4 },
                        { text: "Die technische Umsetzung ist sehr gut strukturiert und zeigt sehr gute Problemlösungskompetenz", score: 5 }
                    ]
                }
            }
        },
        form: {
            ...evaluationConfig.sections.form,
            criteria: {
                ...evaluationConfig.sections.form.criteria,
                scientific_approach: {
                    ...evaluationConfig.sections.form.criteria.scientific_approach,
                    options: [
                        { text: "Das systematische Vorgehen ist nicht erkennbar", score: 1 },
                        { text: "Das systematische Vorgehen ist teilweise erkennbar", score: 2 },
                        { text: "Das systematische Vorgehen ist nachvollziehbar", score: 3 },
                        { text: "Das systematische Vorgehen ist gut strukturiert", score: 4 },
                        { text: "Das systematische Vorgehen ist sehr gut strukturiert", score: 5 }
                    ]
                },
                citation: {
                    ...evaluationConfig.sections.form.criteria.citation,
                    options: [
                        { text: "Quellen werden kaum verwendet, die Zitierung ist fehlerhaft", score: 1 },
                        { text: "Grundlegende Quellen werden verwendet, die Zitierung weist Mängel auf", score: 2 },
                        { text: "Relevante Quellen werden angemessen verwendet und zitiert", score: 3 },
                        { text: "Verschiedene Quellen werden gut verwendet und korrekt zitiert", score: 4 },
                        { text: "Die Quellenauswahl ist umfassend und die Zitierung korrekt", score: 5 }
                    ]
                }
            }
        }
    }
};

// Master-Konfiguration
export const masterConfig: EvaluationConfig = {
    sections: {
        ...evaluationConfig.sections,
        preface: {
            ...evaluationConfig.sections.preface,
            criteria: {
                ...evaluationConfig.sections.preface.criteria,
                implementation: {
                    ...evaluationConfig.sections.preface.criteria.implementation,
                    options: [
                        { text: "Die methodische Umsetzung validiert die Forschungsfrage nicht", score: 1 },
                        { text: "Die methodische Umsetzung validiert die Forschungsfrage nur teilweise", score: 2 },
                        { text: "Die methodische Umsetzung validiert die Forschungsfrage angemessen", score: 3 },
                        { text: "Die methodische Umsetzung validiert die Forschungsfrage gut", score: 4 },
                        { text: "Die methodische Umsetzung validiert die Forschungsfrage sehr gut", score: 5 }
                    ]
                }
            }
        },
        form: {
            ...evaluationConfig.sections.form,
            criteria: {
                ...evaluationConfig.sections.form.criteria,
                scientific_approach: {
                    ...evaluationConfig.sections.form.criteria.scientific_approach,
                    options: [
                        { text: "Die wissenschaftliche Methodik ist nicht erkennbar", score: 1 },
                        { text: "Die wissenschaftliche Methodik ist grundlegend erkennbar", score: 2 },
                        { text: "Die wissenschaftliche Methodik ist angemessen", score: 3 },
                        { text: "Die wissenschaftliche Methodik ist gut und zeigt eigenständige Ansätze", score: 4 },
                        { text: "Die wissenschaftliche Methodik ist sehr gut mit eigenständigen Ansätzen", score: 5 }
                    ]
                },
                citation: {
                    ...evaluationConfig.sections.form.criteria.citation,
                    options: [
                        { text: "Der Forschungsstand wird unzureichend erfasst", score: 1 },
                        { text: "Der Forschungsstand wird grundlegend erfasst", score: 2 },
                        { text: "Der Forschungsstand wird angemessen erfasst und wissenschaftlich zitiert", score: 3 },
                        { text: "Der Forschungsstand wird gut erfasst und wissenschaftlich präzise zitiert", score: 4 },
                        { text: "Der Forschungsstand wird sehr gut erfasst und durchgängig präzise zitiert", score: 5 }
                    ]
                }
            }
        }
    }
};