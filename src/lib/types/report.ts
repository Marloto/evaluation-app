/**
 * Types for the printable reports ("Gutachten").
 *
 * A report definition is pure data: it describes the wording and the field order
 * of one official form. Rendering is generic (see ReportDocument), so adding a
 * new report type means adding one entry in report-templates.ts, not new markup.
 */

/** Where the text of a report field comes from. */
export type ReportFieldSource =
    /** Title of the thesis, taken from the general information. */
    | { kind: 'thesisTitle' }
    /** Generated text of one evaluation section, matched by its config key. */
    | { kind: 'section'; sectionKey: string };

export interface ReportField {
    /** Label printed above the text, e.g. "Form der Arbeit". */
    label: string;
    source: ReportFieldSource;
    /** Greyed-out hint printed when the field has no content yet. */
    placeholder?: string;
}

/**
 * A checkbox line of the form.
 *
 * `text` may contain the placeholder {choice}; it is filled from `choices` with
 * what the evaluator picked in the general information. Both the tick and the
 * choice are stored per report under the checkbox id.
 */
export interface ReportCheckbox {
    id: string;
    text: string;
    /** Printed smaller below the line. */
    note?: string;
    /** Selectable values for the {choice} placeholder in `text`. */
    choices?: string[];
}

export interface ReportDefinition {
    /** Referenced by Template.reportType / EvaluationConfig.reportType. */
    id: string;
    /** Shown in the report picker. */
    name: string;
    /** Headline of the document, e.g. "Bachelorarbeitsgutachten". */
    documentTitle: string;
    /** Label of the author line, e.g. "Bachelorarbeit von". */
    authorLabel: string;
    /** Label in front of the final grade, e.g. "Note der Bachelorarbeit". */
    gradeLabel: string;
    /** Heading above the assessment texts. */
    assessmentHeading: string;
    fields: ReportField[];
    /** Checkbox lines above the grade. */
    checkboxes: ReportCheckbox[];
    /** Signature lines at the bottom of the form. */
    signatures: Array<{ label: string; note?: string }>;
    /** Closing block, e.g. "Die Note wird festgestellt." plus the signature line below it. */
    confirmation?: { text: string; signature: { label: string; note?: string } };
    /** Bold lead-in of the small print at the bottom of the form. */
    gradeScaleLabel: string;
    /** Small print listing the valid grades. */
    gradeScaleNote: string;
    /** Revision marker of the official form, printed bottom right. */
    revision: string;
}
