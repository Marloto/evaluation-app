"use client"

import React from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { getReportDefinition, reportDefinitions } from '@/lib/config/report-templates';
import { EMPTY_THESIS_INFO, useEvaluationState } from '../providers/EvaluationStateProvider';
import { useConfig } from '../providers/ConfigProvider';

/** Text fields that only appear in the header of the printed report. */
type ThesisInfoTextField = 'students' | 'program' | 'firstExaminer' | 'secondExaminer' | 'issueDate' | 'submissionDate';

const reportFields: Array<{ key: ThesisInfoTextField; label: string; placeholder: string }> = [
    { key: 'students', label: 'Studierende(r)', placeholder: 'Studierendenname(n)' },
    { key: 'program', label: 'Studiengang', placeholder: 'Studiengang' },
    { key: 'firstExaminer', label: 'Erstprüfer/in', placeholder: 'Erstprüfer/in' },
    { key: 'secondExaminer', label: 'Zweitprüfer/in', placeholder: 'Zweitprüfer/in' },
    { key: 'issueDate', label: 'Ausgegeben am', placeholder: 'z. B. 01.10.2025' },
    { key: 'submissionDate', label: 'Eingereicht am', placeholder: 'z. B. 15.01.2026' }
];

interface ThesisInfoDialogProps {
    isOpen: boolean;
    onClose: () => void;
}

export const ThesisInfoDialog: React.FC<ThesisInfoDialogProps> = ({ isOpen, onClose }) => {
    const { state, updateThesisInfo } = useEvaluationState();
    const { config, updateConfig } = useConfig();
    const info = state.thesisInfo ?? EMPTY_THESIS_INFO;

    // The checkbox lines belong to the report the current template prints as.
    const definition = getReportDefinition(config.reportType);

    const setCheck = (id: string, checked: boolean) =>
        updateThesisInfo({ reportChecks: { ...info.reportChecks, [id]: checked } });

    const setChoice = (id: string, value: string) =>
        updateThesisInfo({ reportChoices: { ...info.reportChoices, [id]: value } });

    return (
        <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
            {/* Capped height with the fields in their own scroll container, so the
                dialog grows with the viewport instead of overflowing it. */}
            <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
                <DialogHeader className="shrink-0">
                    <DialogTitle>General Information</DialogTitle>
                    <DialogDescription>
                        Context about the thesis. Used to ground the AI proposals and saved with the
                        evaluation on export.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 min-h-0 overflow-y-auto pr-2">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="thesis-title">Title</Label>
                            <Input
                                id="thesis-title"
                                value={info.title}
                                onChange={(e) => updateThesisInfo({ title: e.target.value })}
                                placeholder="Title of the thesis"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="thesis-abstract">Abstract</Label>
                            <Textarea
                                id="thesis-abstract"
                                value={info.abstract}
                                onChange={(e) => updateThesisInfo({ abstract: e.target.value })}
                                placeholder="Abstract of the thesis..."
                                className="min-h-[160px]"
                            />
                        </div>

                        {/* Header of the printed Gutachten - not used by the AI. */}
                        <div className="grid grid-cols-2 gap-4">
                            {reportFields.map(({ key, label, placeholder }) => (
                                <div className="space-y-2" key={key}>
                                    <Label htmlFor={`thesis-${key}`}>{label}</Label>
                                    <Input
                                        id={`thesis-${key}`}
                                        value={info[key] ?? ''}
                                        onChange={(e) => updateThesisInfo({ [key]: e.target.value })}
                                        placeholder={placeholder}
                                    />
                                </div>
                            ))}
                        </div>

                        {/* Report type and its statements, both printed on the Gutachten. */}
                        <div className="space-y-3 border-t pt-4">
                            <div className="space-y-2">
                                <Label htmlFor="report-type">Gutachten</Label>
                                <Select
                                    value={definition.id}
                                    onValueChange={(value) => updateConfig({ ...config, reportType: value })}
                                >
                                    <SelectTrigger id="report-type" className="w-[280px]">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {reportDefinitions.map(report => (
                                            <SelectItem key={report.id} value={report.id}>
                                                {report.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <p className="text-xs text-gray-500">
                                    Preset by the loaded template; change it to print this evaluation as
                                    another report.
                                </p>
                            </div>

                            {definition.checkboxes.map(checkbox => {
                                const [before, after] = checkbox.choices
                                    ? checkbox.text.split('{choice}')
                                    : [checkbox.text, ''];

                                return (
                                    <div className="flex items-start gap-2" key={checkbox.id}>
                                        <Checkbox
                                            id={`report-check-${checkbox.id}`}
                                            className="mt-1"
                                            checked={info.reportChecks?.[checkbox.id] === true}
                                            onCheckedChange={(checked) => setCheck(checkbox.id, checked === true)}
                                        />
                                        <div className="space-y-1">
                                            <Label
                                                htmlFor={`report-check-${checkbox.id}`}
                                                className="font-normal leading-relaxed flex flex-wrap items-center gap-2"
                                            >
                                                {before}
                                                {checkbox.choices && (
                                                    <Select
                                                        value={info.reportChoices?.[checkbox.id] ?? ''}
                                                        onValueChange={(value) => setChoice(checkbox.id, value)}
                                                    >
                                                        <SelectTrigger className="h-7 w-[140px]">
                                                            <SelectValue placeholder="Auswählen" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {checkbox.choices.map(choice => (
                                                                <SelectItem key={choice} value={choice}>
                                                                    {choice}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                )}
                                                {after}
                                            </Label>
                                            {checkbox.note && (
                                                <p className="text-xs text-gray-500">{checkbox.note}</p>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default ThesisInfoDialog;
