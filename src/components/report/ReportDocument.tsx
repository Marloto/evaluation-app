"use client"

import React from 'react';
import { ReportDefinition } from '@/lib/types/report';
import { ReportData } from '@/lib/utils/report-data';
import './report.css';

interface ReportDocumentProps {
    definition: ReportDefinition;
    data: ReportData;
    /** Print-ready logo data URI, see logo-storage; omitted when none is set up. */
    logo?: string | null;
}

/** Label/value pair; empty values are printed as a grey placeholder. */
const Value: React.FC<{ label: string; value: string; placeholder: string }> = ({
    label,
    value,
    placeholder
}) => (
    <div>
        <span className="report__label">{label}:</span>
        <span className={`report__value ${value ? '' : 'report__value--empty'}`}>
            {value || placeholder}
        </span>
    </div>
);

/** CSS strings are quoted; a stray quote would break the whole rule. */
const cssString = (value: string) => `"${value.replace(/["\\]/g, '')}"`;

/**
 * Colour of the small print in the page margins.
 *
 * A literal, not a Tailwind token: the app tokens hold bare HSL components
 * (`--muted: 210 40% 96.1%`), which are not valid as a colour on their own, and
 * the printed form should not follow the app theme anyway.
 */
const FOOTER_COLOR = '#555';

/**
 * Running header and footer of the printed report.
 *
 * @page margin boxes are the only place Chromium repeats content on every page,
 * and the only place the page counters exist. Since the content comes from the
 * report definition, the rule is emitted here instead of in report.css. The page
 * margins that reserve the space for these boxes live in report.css.
 */
const PageMarginBoxes: React.FC<{ definition: ReportDefinition; logo?: string | null }> = ({
    definition,
    logo
}) => (
    <style>{`
        @media print {
            @page {
                ${logo ? `@top-right {
                    /* A margin box paints the image at its intrinsic size, which
                       logo-storage normalised on upload. */
                    content: url("${logo}");
                    vertical-align: middle;
                }` : ''}
                @bottom-left {
                    content: "Seite " counter(page) " von " counter(pages);
                    font: 8pt Arial, Helvetica, sans-serif;
                    /* Explicit width and no wrapping, so the wide centre box below
                       cannot squeeze this into a column of single words. */
                    width: 45mm;
                    white-space: pre;
                    color: ${FOOTER_COLOR};
                    text-align: left;
                    vertical-align: top;
                    margin-top: 30px;
                }
                @bottom-center {
                    content: ${cssString(`${definition.gradeScaleLabel} ${definition.gradeScaleNote}`)};
                    font: 7pt Arial, Helvetica, sans-serif;
                    /* Full content width, so the grade scale starts at the margin. */
                    width: 170mm;
                    color: ${FOOTER_COLOR};
                    text-align: left;
                    vertical-align: top;
                }
                @bottom-right {
                    content: ${cssString(definition.revision)};
                    font: 8pt Arial, Helvetica, sans-serif;
                    width: 45mm;
                    white-space: pre;
                    color: ${FOOTER_COLOR};
                    text-align: right;
                    vertical-align: top;
                    margin-top: 30px;
                }
            }
        }
    `}</style>
);

/**
 * The printable Gutachten. Rendered generically from a ReportDefinition, so the
 * same component serves every report type — and the same markup is used for the
 * preview and for the printed page.
 */
export const ReportDocument: React.FC<ReportDocumentProps> = ({ definition, data, logo }) => (
    <div className="report">
        <PageMarginBoxes definition={definition} logo={logo} />

        {/* Preview only - on paper the logo is drawn by the margin box above.
            Rendered as an image, never as markup, so an uploaded SVG stays inert. */}
        <div className="report__logo">
            {/* eslint-disable-next-line @next/next/no-img-element -- a data URI from
                localStorage, nothing for next/image to optimise */}
            {logo && <img src={logo} alt="" />}
        </div>

        <h1 className="report__title">{definition.documentTitle}</h1>

        <div className="report__header">
            <div className="report__row">
                <Value
                    label={definition.authorLabel}
                    value={data.header.students}
                    placeholder="Studierendenname(n) ergänzen."
                />
            </div>
            <div className="report__row">
                <Value label="Studiengang" value={data.header.program} placeholder="Studiengang ergänzen." />
            </div>
            <div className="report__row">
                <Value
                    label="Erstprüfer/in"
                    value={data.header.firstExaminer}
                    placeholder="Erstprüfer/in ergänzen."
                />
                <Value
                    label="Zweitprüfer/in"
                    value={data.header.secondExaminer}
                    placeholder="Zweitprüfer/in ergänzen."
                />
            </div>
            <div className="report__row">
                <Value
                    label="Ausgegeben am"
                    value={data.header.issueDate}
                    placeholder="Ausgabedatum ergänzen."
                />
                <Value
                    label="Eingereicht am"
                    value={data.header.submissionDate}
                    placeholder="Abgabedatum ergänzen."
                />
            </div>
        </div>

        <div className="report__heading">{definition.assessmentHeading}</div>

        {data.fields.map(field => (
            <div className="report__field" key={field.label}>
                <div className="report__field-label">{field.label}:</div>
                <div className={`report__field-text ${field.text ? '' : 'report__value--empty'}`}>
                    {field.text || field.placeholder || ''}
                </div>
            </div>
        ))}

        <div className="report__checkboxes">
            {data.checkboxes.map(checkbox => (
                <div key={checkbox.text}>
                    <div className="report__checkbox">
                        {/* Drawn instead of using ☐/☑, which not every print font carries. */}
                        <span className="report__checkbox-box">{checkbox.checked ? 'X' : ''}</span>
                        {checkbox.text}
                    </div>
                    {checkbox.note && <div className="report__checkbox-note">{checkbox.note}</div>}
                </div>
            ))}
        </div>

        <div className="report__grade">
            <div className="report__grade-label">{definition.gradeLabel}:</div>
            <div className="report__grade-line">{data.grade?.text ?? ''}</div>
            <div className="report__grade-box">{data.grade?.grade ?? ''}</div>
        </div>

        <div className="report__signatures">
            {definition.signatures.map(signature => (
                <div className="report__signature" key={signature.label}>
                    <div className="report__signature-line">{signature.label}</div>
                    {signature.note && <div className="report__signature-note">{signature.note}</div>}
                </div>
            ))}
        </div>

        {definition.confirmation && (
            <>
                <div className="report__confirmation">{definition.confirmation.text}</div>
                <div className="report__signatures">
                    <div className="report__signature">
                        <div className="report__signature-line">{definition.confirmation.signature.label}</div>
                        {definition.confirmation.signature.note && (
                            <div className="report__signature-note">{definition.confirmation.signature.note}</div>
                        )}
                    </div>
                    {/* Empty half so the line keeps the width of the signature lines above. */}
                    <div className="report__signature" />
                </div>
            </>
        )}

        <div className="report__footer">
            <div className="report__footer-scale">
                {definition.gradeScaleLabel} <span>{definition.gradeScaleNote}</span>
            </div>
            <div className="report__footer-meta">
                <span />
                <span>{definition.revision}</span>
            </div>
        </div>
    </div>
);

export default ReportDocument;
