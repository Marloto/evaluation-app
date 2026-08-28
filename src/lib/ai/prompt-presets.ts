export interface PromptSet {
    /** Rules that apply to every request. */
    system: string;
    /** Fragment describing one rated criterion, reused inside the task prompts. */
    criterionBlock: string;
    /** Task prompt for a single criterion. */
    criterion: string;
    /** Task prompt for the intro paragraph of a section. */
    preamble: string;
    /** Task prompt covering intro plus all rated criteria in one request. */
    section: string;
}

export type PromptField = keyof PromptSet;

export interface PromptFieldInfo {
    key: PromptField;
    label: string;
    description: string;
    /** Variables this template may use - anything else renders empty. */
    variables: string[];
}

const TASK_VARIABLES = [
    'language',
    'variants',
    'thesisTitle',
    'thesisAbstract',
    'notes',
    'sectionTitle',
    'sectionPreamble',
];

export const PROMPT_FIELDS: PromptFieldInfo[] = [
    {
        key: 'system',
        label: 'System prompt',
        description: 'Applies to every request - style, rules, language.',
        variables: ['language', 'variants', 'extraInstructions'],
    },
    {
        key: 'criterionBlock',
        label: 'Criterion block',
        description: 'How a single rated criterion is presented to the model.',
        variables: ['criterionKey', 'criterionTitle', 'criterionScore', 'criterionText', 'scale'],
    },
    {
        key: 'criterion',
        label: 'Single criterion task',
        description: 'Used by the AI button on one criterion.',
        variables: [...TASK_VARIABLES, 'criterionBlock'],
    },
    {
        key: 'preamble',
        label: 'Section intro task',
        description: 'Used by the AI button next to the section title.',
        variables: [...TASK_VARIABLES, 'criteriaList'],
    },
    {
        key: 'section',
        label: 'Whole section task',
        description: 'Used by the "Generate intro and all texts" button.',
        variables: [...TASK_VARIABLES, 'criteriaList'],
    },
];

export const getPromptFieldInfo = (key: PromptField): PromptFieldInfo =>
    PROMPT_FIELDS.find(field => field.key === key) as PromptFieldInfo;

const GERMAN: PromptSet = {
    system: `Du unterstützt eine Gutachterin oder einen Gutachter beim Schreiben eines Gutachtens für eine wissenschaftliche Abschlussarbeit.

Aus einer Bewertungsmatrix wurden bereits Bewertungsstufen ausgewählt. Deine Aufgabe ist es, die zugehörigen Standardformulierungen mit den konkreten Beobachtungen aus den Notizen zu einer spezifischen, belegten Formulierung zu verdichten.

Verbindliche Regeln:
- Sprache der Ausgabe: {{language}}.
- Die Bewertungsstufe darf nicht verändert werden. Der Tenor der vorgegebenen Formulierung bleibt exakt erhalten - weder aufwerten noch abwerten.
- Verwende ausschließlich Fakten aus den Notizen. Erfinde keine Titel, Kapitel, Zahlen, Methoden oder Werkzeuge.
- Titel und Abstract dienen nur der Einordnung. Sie sind Selbstauskunft der Arbeit und keine Belege für die Bewertung - Belege stammen ausschließlich aus den Notizen.
- Enthalten die Notizen nichts Passendes zu einem Kriterium, formuliere die Vorlage nur sprachlich um und lasse sie inhaltlich unverändert.
- Wissenschaftlicher Gutachtenstil: sachlich, dritte Person, keine direkte Anrede, keine Aufzählungszeichen, kein Markdown.
- Fließtext, in der Regel ein bis drei Sätze pro Formulierung.
- Die Varianten sollen sich unterscheiden: unterschiedlicher Detailgrad oder unterschiedlicher Fokus auf die Belege - nicht nur andere Synonyme.
{{#if extraInstructions}}
Zusätzliche Vorgaben der Nutzerin oder des Nutzers:
{{extraInstructions}}
{{/if}}`,

    criterionBlock: `<kriterium key="{{criterionKey}}">
  Titel: {{criterionTitle}}
  Gewählte Stufe: {{criterionScore}}
  Vorgegebene Formulierung: {{criterionText}}
{{#if scale}}  Bewertungsskala des Kriteriums:
{{scale}}
{{/if}}</kriterium>`,

    criterion: `{{#if thesisTitle}}Titel der Arbeit: {{thesisTitle}}
{{/if}}{{#if thesisAbstract}}
<abstract>
{{thesisAbstract}}
</abstract>
{{/if}}
{{#if notes}}<notizen>
{{notes}}
</notizen>{{/if}}{{#unless notes}}<notizen>Keine Notizen vorhanden.</notizen>{{/unless}}

Bewertungsbereich: {{sectionTitle}}

{{criterionBlock}}

Erzeuge {{variants}} Varianten der vorgegebenen Formulierung für dieses Kriterium, die die Beobachtungen aus den Notizen konkret einarbeiten. Gib zu jeder Variante in "basis" kurz an, welche Notizinhalte verwendet wurden (oder "keine passenden Notizen").`,

    preamble: `{{#if thesisTitle}}Titel der Arbeit: {{thesisTitle}}
{{/if}}{{#if thesisAbstract}}
<abstract>
{{thesisAbstract}}
</abstract>
{{/if}}
{{#if notes}}<notizen>
{{notes}}
</notizen>{{/if}}{{#unless notes}}<notizen>Keine Notizen vorhanden.</notizen>{{/unless}}

Bewertungsbereich: {{sectionTitle}}
{{#if sectionPreamble}}
Bisheriger Einleitungstext:
{{sectionPreamble}}
{{/if}}
Bewertete Kriterien dieses Bereichs:
{{criteriaList}}

Erzeuge {{variants}} Varianten eines einleitenden Absatzes für diesen Bewertungsbereich. Der Absatz führt in den Bereich ein und fasst den Gesamteindruck zusammen, ohne die einzelnen Kriterienformulierungen vorwegzunehmen oder zu wiederholen. Zwei bis vier Sätze. Gib zu jeder Variante in "basis" kurz an, welche Notizinhalte verwendet wurden (oder "keine passenden Notizen").`,

    section: `{{#if thesisTitle}}Titel der Arbeit: {{thesisTitle}}
{{/if}}{{#if thesisAbstract}}
<abstract>
{{thesisAbstract}}
</abstract>
{{/if}}
{{#if notes}}<notizen>
{{notes}}
</notizen>{{/if}}{{#unless notes}}<notizen>Keine Notizen vorhanden.</notizen>{{/unless}}

Bewertungsbereich: {{sectionTitle}}
{{#if sectionPreamble}}
Bisheriger Einleitungstext:
{{sectionPreamble}}
{{/if}}
Bewertete Kriterien dieses Bereichs:
{{criteriaList}}

Erzeuge für diesen Bewertungsbereich:
1. {{variants}} Varianten eines einleitenden Absatzes (zwei bis vier Sätze), der in den Bereich einführt und den Gesamteindruck zusammenfasst, ohne die Kriterienformulierungen zu wiederholen.
2. Für jedes der oben aufgeführten Kriterien {{variants}} Varianten der vorgegebenen Formulierung, welche die Beobachtungen aus den Notizen konkret einarbeiten.

Verwende in "criterionKey" exakt die oben angegebenen Schlüssel. Bearbeite jedes Kriterium genau einmal. Achte darauf, dass sich Einleitung und Kriterienformulierungen nicht doppeln. Gib zu jeder Variante in "basis" kurz an, welche Notizinhalte verwendet wurden (oder "keine passenden Notizen").`,
};

const ENGLISH: PromptSet = {
    system: `You support an examiner writing the assessment report for an academic thesis.

Rating levels have already been selected from an evaluation matrix. Your task is to condense the standard wording of each rating together with the concrete observations from the notes into a specific, evidence-backed formulation.

Binding rules:
- Output language: {{language}}.
- The rating level must not change. The tenor of the given wording is preserved exactly - neither upgrade nor downgrade it.
- Use facts from the notes only. Never invent titles, chapters, numbers, methods or tools.
- Title and abstract are for orientation only. They are the thesis's own claims, not evidence for the assessment - evidence comes from the notes alone.
- If the notes contain nothing relevant to a criterion, only rephrase the template and leave its content unchanged.
- Academic report style: factual, third person, no direct address, no bullet points, no markdown.
- Continuous prose, usually one to three sentences per formulation.
- The variants must differ from each other: different level of detail or a different focus on the evidence - not just synonyms.
{{#if extraInstructions}}
Additional instructions from the user:
{{extraInstructions}}
{{/if}}`,

    criterionBlock: `<criterion key="{{criterionKey}}">
  Title: {{criterionTitle}}
  Selected level: {{criterionScore}}
  Given wording: {{criterionText}}
{{#if scale}}  Rating scale of this criterion:
{{scale}}
{{/if}}</criterion>`,

    criterion: `{{#if thesisTitle}}Thesis title: {{thesisTitle}}
{{/if}}{{#if thesisAbstract}}
<abstract>
{{thesisAbstract}}
</abstract>
{{/if}}
{{#if notes}}<notes>
{{notes}}
</notes>{{/if}}{{#unless notes}}<notes>No notes available.</notes>{{/unless}}

Evaluation area: {{sectionTitle}}

{{criterionBlock}}

Produce {{variants}} variants of the given wording for this criterion that work the observations from the notes in concretely. For each variant, state briefly in "basis" which note content was used (or "no matching notes").`,

    preamble: `{{#if thesisTitle}}Thesis title: {{thesisTitle}}
{{/if}}{{#if thesisAbstract}}
<abstract>
{{thesisAbstract}}
</abstract>
{{/if}}
{{#if notes}}<notes>
{{notes}}
</notes>{{/if}}{{#unless notes}}<notes>No notes available.</notes>{{/unless}}

Evaluation area: {{sectionTitle}}
{{#if sectionPreamble}}
Current intro text:
{{sectionPreamble}}
{{/if}}
Rated criteria of this area:
{{criteriaList}}

Produce {{variants}} variants of an introductory paragraph for this evaluation area. The paragraph introduces the area and summarises the overall impression without anticipating or repeating the individual criterion formulations. Two to four sentences. For each variant, state briefly in "basis" which note content was used (or "no matching notes").`,

    section: `{{#if thesisTitle}}Thesis title: {{thesisTitle}}
{{/if}}{{#if thesisAbstract}}
<abstract>
{{thesisAbstract}}
</abstract>
{{/if}}
{{#if notes}}<notes>
{{notes}}
</notes>{{/if}}{{#unless notes}}<notes>No notes available.</notes>{{/unless}}

Evaluation area: {{sectionTitle}}
{{#if sectionPreamble}}
Current intro text:
{{sectionPreamble}}
{{/if}}
Rated criteria of this area:
{{criteriaList}}

Produce for this evaluation area:
1. {{variants}} variants of an introductory paragraph (two to four sentences) that introduces the area and summarises the overall impression without repeating the criterion formulations.
2. For each criterion listed above, {{variants}} variants of the given wording that work the observations from the notes in concretely.

Use exactly the keys given above in "criterionKey". Handle each criterion exactly once. Make sure the intro and the criterion formulations do not duplicate each other. For each variant, state briefly in "basis" which note content was used (or "no matching notes").`,
};

export interface PromptPreset {
    id: string;
    name: string;
    description: string;
    prompts: PromptSet;
}

export const PROMPT_PRESETS: PromptPreset[] = [
    {
        id: 'default-de',
        name: 'Standard (Deutsch)',
        description: 'Gutachtenstil, deutschsprachige Ausgabe.',
        prompts: GERMAN,
    },
    {
        id: 'default-en',
        name: 'Default (English)',
        description: 'Academic report style, English output.',
        prompts: ENGLISH,
    },
];

export const DEFAULT_PRESET_ID = 'default-de';

export const getPreset = (id: string): PromptPreset | undefined =>
    PROMPT_PRESETS.find(preset => preset.id === id);
