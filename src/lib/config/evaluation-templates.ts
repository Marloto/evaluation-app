import { EvaluationConfig, DefaultTemplate, Template, SavedTemplate } from '../types/types';

export const evaluationConfig: EvaluationConfig = {
  sections: {
    preface: {
      title: "Vorwort",
      weight: 0.2,
      criteria: {
        independence: {
          title: "Selbstständigkeit",
          weight: 0.35,
          options: [
            { text: "Die Arbeit zeigt wenig eigenständige wissenschaftliche Leistung", score: 1 },
            { text: "Die Arbeit zeigt teilweise eigenständige wissenschaftliche Arbeit mit häufigem Unterstützungsbedarf", score: 2 },
            { text: "Die Arbeit demonstriert angemessene Fähigkeit zu eigenständiger wissenschaftlicher Arbeit", score: 3 },
            { text: "Die Arbeit demonstriert gute Fähigkeit zu eigenständiger wissenschaftlicher Arbeit", score: 4 },
            { text: "Die Arbeit demonstriert sehr gute Fähigkeit zu eigenständiger wissenschaftlicher Arbeit", score: 5 }
          ]
        },
        methodology: {
          title: "Methodisches Vorgehen",
          weight: 0.35,
          options: [
            { text: "Das methodische Vorgehen zeigt grundlegende Mängel und geringe Systematik", score: 1 },
            { text: "Das methodische Vorgehen ist teilweise systematisch, weist aber Mängel auf", score: 2 },
            { text: "Das methodische Vorgehen ist systematisch und angemessen", score: 3 },
            { text: "Das methodische Vorgehen ist gut strukturiert und zielführend", score: 4 },
            { text: "Das methodische Vorgehen ist sehr gut strukturiert und durchgehend zielführend", score: 5 }
          ]
        },
        implementation: {
          title: "Umsetzung der Aufgabenstellung",
          weight: 0.3,
          options: [
            { text: "Die Aufgabenstellung wurde unzureichend umgesetzt", score: 1 },
            { text: "Die Aufgabenstellung wurde teilweise umgesetzt", score: 2 },
            { text: "Die Aufgabenstellung wurde vollständig umgesetzt", score: 3 },
            { text: "Die Aufgabenstellung wurde gut und umfassend umgesetzt", score: 4 },
            { text: "Die Aufgabenstellung wurde sehr gut und mit sinnvollen Erweiterungen umgesetzt", score: 5 }
          ]
        }
      }
    },
    form: {
      title: "Form der Arbeit",
      weight: 0.3,
      criteria: {
        scientific_approach: {
          title: "Wissenschaftliches Vorgehen",
          weight: 0.2,
          options: [
            { text: "Das wissenschaftliche Vorgehen entspricht nicht den Standards", score: 1 },
            { text: "Das wissenschaftliche Vorgehen entspricht teilweise den Standards", score: 2 },
            { text: "Das wissenschaftliche Vorgehen entspricht den Standards", score: 3 },
            { text: "Das wissenschaftliche Vorgehen entspricht gut den Standards", score: 4 },
            { text: "Das wissenschaftliche Vorgehen entspricht sehr gut den Standards", score: 5 }
          ]
        },
        research_question: {
          title: "Fragestellung und Methodik",
          weight: 0.2,
          options: [
            { text: "Fragestellung und methodisches Vorgehen sind nicht nachvollziehbar", score: 1 },
            { text: "Fragestellung und methodisches Vorgehen sind teilweise nachvollziehbar", score: 2 },
            { text: "Fragestellung und methodisches Vorgehen sind nachvollziehbar", score: 3 },
            { text: "Fragestellung und methodisches Vorgehen sind gut ausgearbeitet", score: 4 },
            { text: "Fragestellung und methodisches Vorgehen sind sehr gut ausgearbeitet", score: 5 }
          ]
        },
        related_work: {
          title: "Related Work",
          weight: 0.2,
          options: [
            { text: "Die Einordnung in den Forschungskontext ist unzureichend", score: 1 },
            { text: "Die Einordnung in den Forschungskontext ist grundlegend", score: 2 },
            { text: "Die Einordnung in den Forschungskontext ist angemessen", score: 3 },
            { text: "Die Einordnung in den Forschungskontext ist gut ausgearbeitet", score: 4 },
            { text: "Die Einordnung in den Forschungskontext ist sehr gut ausgearbeitet", score: 5 }
          ]
        },
        citation: {
          title: "Quellenarbeit",
          weight: 0.2,
          options: [
            { text: "Die Quellenarbeit entspricht nicht wissenschaftlichen Standards", score: 1 },
            { text: "Die Quellenarbeit entspricht teilweise wissenschaftlichen Standards", score: 2 },
            { text: "Die Quellenarbeit entspricht wissenschaftlichen Standards", score: 3 },
            { text: "Die Quellenarbeit ist gut und zeigt breite Literaturkenntnis", score: 4 },
            { text: "Die Quellenarbeit ist sehr gut mit umfassender Literaturbasis", score: 5 }
          ]
        },
        documentation: {
          title: "Darstellung der Durchführung",
          weight: 0.2,
          options: [
            { text: "Die Darstellung der Durchführung ist nicht nachvollziehbar", score: 1 },
            { text: "Die Darstellung der Durchführung ist teilweise nachvollziehbar", score: 2 },
            { text: "Die Darstellung der Durchführung ist nachvollziehbar", score: 3 },
            { text: "Die Darstellung der Durchführung ist gut strukturiert", score: 4 },
            { text: "Die Darstellung der Durchführung ist sehr gut strukturiert", score: 5 }
          ]
        }
      }
    },
    structure: {
      title: "Gliederung",
      weight: 0.2,
      criteria: {
        logical_structure: {
          title: "Logischer Aufbau",
          weight: 0.4,
          options: [
            { text: "Der logische Aufbau weist deutliche Mängel auf", score: 1 },
            { text: "Der logische Aufbau ist teilweise schlüssig", score: 2 },
            { text: "Der logische Aufbau ist schlüssig", score: 3 },
            { text: "Der logische Aufbau ist gut durchdacht", score: 4 },
            { text: "Der logische Aufbau ist sehr gut auf die Fragestellung ausgerichtet", score: 5 }
          ]
        },
        structuring: {
          title: "Strukturierung",
          weight: 0.4,
          options: [
            { text: "Die Strukturierung ist nicht nachvollziehbar", score: 1 },
            { text: "Die Strukturierung weist Schwächen auf", score: 2 },
            { text: "Die Strukturierung ist angemessen", score: 3 },
            { text: "Die Strukturierung ist gut und unterstützt die Argumentation", score: 4 },
            { text: "Die Strukturierung ist sehr gut auf die Inhalte abgestimmt", score: 5 }
          ]
        },
        formal_quality: {
          title: "Formale Qualität",
          weight: 0.2,
          options: [
            { text: "Die formale Qualität entspricht nicht den Anforderungen", score: 1 },
            { text: "Die formale Qualität entspricht teilweise den Anforderungen", score: 2 },
            { text: "Die formale Qualität entspricht den Anforderungen", score: 3 },
            { text: "Die formale Qualität entspricht gut den Anforderungen", score: 4 },
            { text: "Die formale Qualität entspricht sehr gut den Anforderungen", score: 5 }
          ]
        }
      }
    },
    content: {
      title: "Inhalt",
      weight: 0.3,
      criteria: {
        argumentation: {
          title: "Argumentationsverlauf",
          weight: 0.25,
          options: [
            { text: "Der Argumentationsverlauf ist nicht nachvollziehbar", score: 1 },
            { text: "Der Argumentationsverlauf ist teilweise nachvollziehbar", score: 2 },
            { text: "Der Argumentationsverlauf ist nachvollziehbar", score: 3 },
            { text: "Der Argumentationsverlauf ist gut ausgearbeitet", score: 4 },
            { text: "Der Argumentationsverlauf ist sehr gut ausgearbeitet", score: 5 }
          ]
        },
        fundamentals: {
          title: "Grundlagenverständnis",
          weight: 0.25,
          options: [
            { text: "Das Grundlagenverständnis weist deutliche Lücken auf", score: 1 },
            { text: "Das Grundlagenverständnis weist teilweise Lücken auf", score: 2 },
            { text: "Das Grundlagenverständnis ist angemessen", score: 3 },
            { text: "Das Grundlagenverständnis ist gut", score: 4 },
            { text: "Das Grundlagenverständnis ist sehr gut", score: 5 }
          ]
        },
        implementation: {
          title: "Durchführung/Umsetzung",
          weight: 0.25,
          options: [
            { text: "Die Durchführung weist grundlegende methodische Mängel auf", score: 1 },
            { text: "Die Durchführung weist teilweise methodische Mängel auf", score: 2 },
            { text: "Die Durchführung ist methodisch angemessen", score: 3 },
            { text: "Die Durchführung ist methodisch gut", score: 4 },
            { text: "Die Durchführung ist methodisch sehr gut", score: 5 }
          ]
        },
        evaluation: {
          title: "Evaluation/Diskussion",
          weight: 0.25,
          options: [
            { text: "Die Evaluation und Diskussion der Ergebnisse ist unzureichend", score: 1 },
            { text: "Die Evaluation und Diskussion der Ergebnisse ist grundlegend", score: 2 },
            { text: "Die Evaluation und Diskussion der Ergebnisse ist angemessen", score: 3 },
            { text: "Die Evaluation und Diskussion der Ergebnisse ist gut", score: 4 },
            { text: "Die Evaluation und Diskussion der Ergebnisse ist sehr gut", score: 5 }
          ]
        },
        complexity: {
          title: "Komplexität/Verständnis",
          weight: 0.25,
          excludeFromTotal: true,
          options: [
            { text: "Die Arbeit zeigt grundlegendes Verständnis der Themen", score: 1 },
            { text: "Die Arbeit zeigt teilweise vertieftes Verständnis der Themen", score: 2 },
            { text: "Die Arbeit zeigt vertieftes Verständnis der Themen", score: 3 },
            { text: "Die Arbeit zeigt gutes vertieftes Verständnis der Themen", score: 4 },
            { text: "Die Arbeit zeigt sehr gutes vertieftes Verständnis der Themen", score: 5 }
          ]
        }
      }
    }
  }
} as const;


// Helper function to create templates
export const createDefaultTemplate = (
    id: string,
    name: string,
    description: string,
    configModifications: Partial<EvaluationConfig>
): DefaultTemplate => ({
    id,
    name,
    description,
    type: 'default',
    version: '1.0',
    lastUpdated: new Date().toISOString(),
    config: {
        sections: {
            ...evaluationConfig.sections,
            ...configModifications.sections
        }
    }
});



// Helper function to create saved templates
export const createSavedTemplate = (
    name: string,
    description: string,
    config: EvaluationConfig
): SavedTemplate => ({
    id: `template-${Date.now()}`,
    name,
    description,
    type: 'saved',
    createdAt: new Date().toISOString(),
    modifiedAt: new Date().toISOString(),
    config
});

// Default templates array
export const defaultTemplates: DefaultTemplate[] = [
    createDefaultTemplate(
        'bachelor',
        'Bachelor Thesis',
        'Standard template for Bachelor thesis evaluation with focus on technical implementation',
        {
            sections: {
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
        }
    ),
    createDefaultTemplate(
        'master',
        'Master Thesis',
        'Standard template for Master thesis evaluation with focus on research methodology',
        {
            sections: {
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
        }
    )
];

// Type Guard Functions
export const isDefaultTemplate = (template: Template): template is DefaultTemplate => {
    return template.type === 'default';
};

export const isSavedTemplate = (template: Template): template is SavedTemplate => {
    return template.type === 'saved';
};
