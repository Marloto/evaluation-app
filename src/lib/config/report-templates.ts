import { ReportCheckbox, ReportDefinition } from '@/lib/types/report';

/** What the two official forms do not share. */
interface ThesisReportVariant {
    /** Middle statement: the seminar on the Bachelor form, the colloquium on the Master one. */
    statement: ReportCheckbox;
    /** When the second examiner has to sign. */
    secondExaminerNote: string;
}

/**
 * Report definitions for the printable Gutachten.
 *
 * Both forms are identical apart from wording, so they are built from one factory.
 * A report that deviates structurally can simply be written out as a literal.
 */
const createThesisReport = (
    id: string,
    /** "Bachelorarbeit" / "Masterarbeit" — used in all derived labels. */
    thesisNoun: string,
    revision: string,
    variant: ThesisReportVariant
): ReportDefinition => ({
    id,
    name: `${thesisNoun}sgutachten`,
    documentTitle: `${thesisNoun}sgutachten`,
    authorLabel: `${thesisNoun} von`,
    gradeLabel: `Note der ${thesisNoun}`,
    assessmentHeading: 'Bewertung',
    fields: [
        {
            label: 'Thema',
            source: { kind: 'thesisTitle' },
            placeholder: 'Titel der Arbeit hier ergänzen.'
        },
        {
            label: 'Vorbemerkung',
            source: { kind: 'section', sectionKey: 'preface' },
            placeholder: 'Vorbemerkung ergänzen.'
        },
        {
            label: 'Form der Arbeit',
            source: { kind: 'section', sectionKey: 'form' },
            placeholder: 'Bewertung zur Form der Arbeit hier ergänzen.'
        },
        {
            label: 'Gliederung',
            source: { kind: 'section', sectionKey: 'structure' },
            placeholder: 'Bewertung zur Gliederung hier ergänzen.'
        },
        {
            label: 'Inhalt',
            source: { kind: 'section', sectionKey: 'content' },
            placeholder: 'Bewertung zum Inhalt hier ergänzen.'
        }
    ],
    checkboxes: [
        {
            id: 'language',
            text: 'Die Leistung wurde in {choice} erbracht.',
            choices: ['Deutsch', 'Englisch']
        },
        variant.statement,
        {
            id: 'presentation',
            text: 'Die wesentlichen Ergebnisse der Arbeit wurden vor dem Praxispartner und dem Erstprüfer präsentiert.',
            note: '(Bei Dual-Studierenden verpflichtend!)'
        }
    ],
    signatures: [
        { label: 'Datum, Unterschrift Erstprüfer/in' },
        {
            label: 'Datum, Unterschrift Zweitprüfer/in',
            note: variant.secondExaminerNote
        }
    ],
    confirmation: {
        text: 'Die Note wird festgestellt.',
        signature: { label: 'Datum, Unterschrift PK-Vorsitzende/r' }
    },
    gradeScaleLabel: 'Die Bewertung erfolgt gemäß folgender Notenstufen:',
    gradeScaleNote:
        '1,0 bzw. 1,3 = sehr gut / 1,7 bzw. 2,0 bzw. 2,3 = gut / 2,7 bzw. 3,0 bzw. 3,3 = befriedigend / '
        + '3,7 bzw. 4,0 = ausreichend / 5,0 = nicht ausreichend / '
        + '(Die Noten 0,7; 4,3; 4,7 und 5,3 sind ausgeschlossen!)',
    revision
});

export const reportDefinitions: ReportDefinition[] = [
    createThesisReport('bachelor', 'Bachelorarbeit', 'Stand 01.10.2021', {
        statement: {
            id: 'seminar',
            text: 'Am Seminar zur Bachelorarbeit wurde mit Erfolg teilgenommen.'
        },
        secondExaminerNote: '(nur erforderlich, wenn Bewertung durch Erstprüfer/in schlechter als 4,0)'
    }),
    createThesisReport('master', 'Masterarbeit', 'Stand 01.10.2021', {
        statement: {
            id: 'colloquium',
            text: 'Das Kolloquium hat stattgefunden und wurde gemäß den Vorgaben der Studien- und Prüfungsordnung bewertet.'
        },
        secondExaminerNote: '(nur erforderlich, wenn Bewertung durch Erstprüfer/in > 4,0)'
    })
];

/** Falls back to the first definition for unknown or missing ids. */
export const getReportDefinition = (reportType?: string): ReportDefinition =>
    reportDefinitions.find(report => report.id === reportType) ?? reportDefinitions[0];
