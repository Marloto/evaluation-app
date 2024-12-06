// config/evaluation-templates.ts
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
                        { text: "Die technische Umsetzung weist grundlegende Mängel auf und erfüllt die Anforderungen nur unzureichend", score: 1 },
                        { text: "Die technische Umsetzung erfüllt die grundlegenden Anforderungen, zeigt aber Optimierungspotential", score: 2 },
                        { text: "Die technische Umsetzung ist solide und demonstriert praktische Problemlösungskompetenz", score: 3 },
                        { text: "Die technische Umsetzung überzeugt durch einen durchdachten Ansatz und effiziente Problemlösung", score: 4 },
                        { text: "Die technische Umsetzung ist sehr gut strukturiert und demonstriert umfassende praktische Problemlösungskompetenz", score: 5 }
                    ]
                }
            }
        },
        form: {
            ...evaluationConfig.sections.form,
            criteria: {
                ...evaluationConfig.sections.form.criteria,
                approach: {
                    ...evaluationConfig.sections.form.criteria.approach,
                    options: [
                        { text: "Die Bearbeitung folgt keinem erkennbaren systematischen Vorgehen", score: 1 },
                        { text: "Die Bearbeitung zeigt Ansätze eines systematischen Vorgehens", score: 2 },
                        { text: "Die Bearbeitung folgt einem nachvollziehbaren systematischen Vorgehen", score: 3 },
                        { text: "Die Bearbeitung demonstriert ein gut strukturiertes systematisches Vorgehen", score: 4 },
                        { text: "Die Bearbeitung zeigt ein sehr gut strukturiertes und zielgerichtetes Vorgehen", score: 5 }
                    ]
                },
                source_usage: {
                    ...evaluationConfig.sections.form.criteria.source_usage,
                    options: [
                        { text: "Quellen werden kaum verwendet, die Zitierung ist fehlerhaft", score: 1 },
                        { text: "Grundlegende Quellen werden verwendet, die Zitierung zeigt noch Mängel", score: 2 },
                        { text: "Relevante Quellen werden korrekt verwendet und zitiert", score: 3 },
                        { text: "Verschiedene Quellen werden gut eingebunden und sauber zitiert", score: 4 },
                        { text: "Die Quellenauswahl ist umfassend und zielführend, die Zitierung durchgehend korrekt", score: 5 }
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
                        { text: "Die methodische Umsetzung weist grundlegende Mängel auf und validiert die Forschungsfrage nicht", score: 1 },
                        { text: "Die methodische Umsetzung erfüllt grundlegende Anforderungen, die Validation ist oberflächlich", score: 2 },
                        { text: "Die methodische Umsetzung ist solide und validiert die Forschungsfrage angemessen", score: 3 },
                        { text: "Die methodische Umsetzung überzeugt durch fundierte Validation der Forschungsfrage", score: 4 },
                        { text: "Die methodische Umsetzung ist sehr gut strukturiert und validiert die Forschungsfrage umfassend", score: 5 }
                    ]
                }
            }
        },
        form: {
            ...evaluationConfig.sections.form,
            criteria: {
                ...evaluationConfig.sections.form.criteria,
                approach: {
                    ...evaluationConfig.sections.form.criteria.approach,
                    options: [
                        { text: "Die Bearbeitung folgt keinem wissenschaftlichen Forschungsansatz", score: 1 },
                        { text: "Die Bearbeitung zeigt grundlegende wissenschaftliche Methodik", score: 2 },
                        { text: "Die Bearbeitung folgt einer fundierten wissenschaftlichen Methodik", score: 3 },
                        { text: "Die Bearbeitung demonstriert eine sehr gute wissenschaftliche Methodik und Forschungsansatz", score: 4 },
                        { text: "Die Bearbeitung zeigt eine sehr fundierte wissenschaftliche Methodik mit innovativem Forschungsansatz", score: 5 }
                    ]
                },
                source_usage: {
                    ...evaluationConfig.sections.form.criteria.source_usage,
                    options: [
                        { text: "Forschungsstand wird kaum erfasst, Zitierung mangelhaft", score: 1 },
                        { text: "Forschungsstand oberflächlich erfasst, Zitierung mit Mängeln", score: 2 },
                        { text: "Forschungsstand gut erfasst, korrekte wissenschaftliche Zitierung", score: 3 },
                        { text: "Forschungsstand umfassend erfasst, präzise wissenschaftliche Zitierung", score: 4 },
                        { text: "Forschungsstand wird sehr gut aufgearbeitet, durchgehend präzise wissenschaftliche Zitierung", score: 5 }
                    ]
                }
            }
        }
    }
};