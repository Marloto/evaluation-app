"use client"

import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { AlertTriangle, Download, Eye, RotateCcw, Trash2, Upload } from 'lucide-react';
import { toast } from "sonner";
import { useAi } from '../providers/AiProvider';
import {
    PROMPT_FIELDS,
    PromptField,
    PromptSet,
} from '@/lib/ai/prompt-presets';
import {
    exportPromptTemplates,
    isPresetId,
    PromptImportError,
} from '@/lib/ai/prompt-store';
import { findTemplateSyntaxErrors, findUnknownVariables } from '@/lib/ai/template';
import {
    buildCriterionPrompt,
    buildPreamblePrompt,
    buildSectionPrompt,
    buildSystemPrompt,
    renderCriterionBlock,
    SAMPLE_CONTEXT,
    SAMPLE_SECTION,
} from '@/lib/ai/prompts';

interface AiPromptsDialogProps {
    isOpen: boolean;
    onClose: () => void;
}

const downloadJson = (data: unknown, filename: string) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};

const slugify = (value: string): string =>
    value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'prompts';

/** Renders one template against sample data so it can be checked without a request. */
const renderPreview = (field: PromptField, prompts: PromptSet): string => {
    const context = { ...SAMPLE_CONTEXT, extraInstructions: 'Bitte Kapitelnummern nennen.' };
    switch (field) {
        case 'system':
            return buildSystemPrompt(context, prompts);
        case 'criterionBlock':
            return renderCriterionBlock(SAMPLE_SECTION.criteria[0], prompts);
        case 'criterion':
            return buildCriterionPrompt(SAMPLE_SECTION, SAMPLE_SECTION.criteria[0], context, prompts);
        case 'preamble':
            return buildPreamblePrompt(SAMPLE_SECTION, context, prompts);
        case 'section':
            return buildSectionPrompt(SAMPLE_SECTION, context, prompts);
    }
};

export const AiPromptsDialog: React.FC<AiPromptsDialogProps> = ({ isOpen, onClose }) => {
    const {
        promptTemplates,
        activeTemplate,
        selectTemplate,
        saveTemplate,
        deleteTemplate,
        importTemplates,
    } = useAi();

    const [draft, setDraft] = useState<PromptSet>(activeTemplate.prompts);
    const [name, setName] = useState(activeTemplate.name);
    const [description, setDescription] = useState(activeTemplate.description);
    const [field, setField] = useState<PromptField>('system');
    const [showPreview, setShowPreview] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Reload the draft whenever the dialog opens or another template is picked.
    useEffect(() => {
        setDraft(activeTemplate.prompts);
        setName(activeTemplate.name);
        setDescription(activeTemplate.description);
        setShowPreview(false);
    }, [activeTemplate, isOpen]);

    const fieldInfo = PROMPT_FIELDS.find(entry => entry.key === field) as typeof PROMPT_FIELDS[number];
    const value = draft[field];

    const isPreset = isPresetId(activeTemplate.id);
    const isDirty = useMemo(
        () => PROMPT_FIELDS.some(entry => draft[entry.key] !== activeTemplate.prompts[entry.key])
            || name !== activeTemplate.name
            || description !== activeTemplate.description,
        [draft, name, description, activeTemplate]
    );

    const unknownVariables = findUnknownVariables(value, fieldInfo.variables);
    const syntaxErrors = findTemplateSyntaxErrors(value);

    const insertVariable = (variable: string) => {
        const textarea = textareaRef.current;
        const token = `{{${variable}}}`;
        if (!textarea) {
            setDraft(prev => ({ ...prev, [field]: prev[field] + token }));
            return;
        }
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const next = value.slice(0, start) + token + value.slice(end);
        setDraft(prev => ({ ...prev, [field]: next }));
        requestAnimationFrame(() => {
            textarea.focus();
            textarea.setSelectionRange(start + token.length, start + token.length);
        });
    };

    const handleSave = () => {
        const id = saveTemplate({
            id: activeTemplate.id,
            name,
            description,
            prompts: draft,
        });
        toast.success(
            isPreset
                ? 'Saved as a new custom prompt set'
                : 'Prompt set saved'
        );
        selectTemplate(id);
    };

    const handleRevert = () => {
        setDraft(activeTemplate.prompts);
        setName(activeTemplate.name);
        setDescription(activeTemplate.description);
    };

    const handleDelete = () => {
        deleteTemplate(activeTemplate.id);
        toast.success('Prompt set deleted');
    };

    const handleExport = () => {
        const data = exportPromptTemplates([activeTemplate.id]);
        downloadJson(data, `prompts-${slugify(activeTemplate.name)}.json`);
    };

    const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (loaded) => {
            try {
                const parsed = JSON.parse(loaded.target?.result as string);
                const imported = importTemplates(parsed);
                toast.success(`${imported.length} prompt set${imported.length === 1 ? '' : 's'} imported`);
            } catch (error) {
                toast.error(
                    error instanceof PromptImportError || error instanceof SyntaxError
                        ? error.message
                        : 'Could not import the file'
                );
            } finally {
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
            }
        };
        reader.readAsText(file);
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
            <DialogContent className="max-w-5xl max-h-[92vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>Prompts</DialogTitle>
                    <DialogDescription>
                        Templates use <code className="text-xs">{'{{variable}}'}</code> placeholders and{' '}
                        <code className="text-xs">{'{{#if variable}}...{{/if}}'}</code> blocks. Stored in this
                        browser&apos;s localStorage.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex items-end gap-2">
                    <div className="flex-1 space-y-2">
                        <Label htmlFor="prompt-template">Prompt set</Label>
                        <Select value={activeTemplate.id} onValueChange={selectTemplate}>
                            <SelectTrigger id="prompt-template">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {promptTemplates.map(template => (
                                    <SelectItem key={template.id} value={template.id}>
                                        {template.name}{template.type === 'preset' ? ' (preset)' : ''}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleImport}
                        accept=".json"
                        className="hidden"
                    />
                    <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                        <Upload className="h-4 w-4 mr-2" />
                        Import
                    </Button>
                    <Button variant="outline" onClick={handleExport}>
                        <Download className="h-4 w-4 mr-2" />
                        Export
                    </Button>
                    <Button
                        variant="outline"
                        onClick={handleDelete}
                        disabled={isPreset}
                        title={isPreset ? 'Presets cannot be deleted' : 'Delete this prompt set'}
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="prompt-name">Name</Label>
                        <Input
                            id="prompt-name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="prompt-description">Description</Label>
                        <Input
                            id="prompt-description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex gap-4 flex-1 min-h-0">
                    <div className="w-56 shrink-0 space-y-1">
                        {PROMPT_FIELDS.map(entry => (
                            <button
                                key={entry.key}
                                onClick={() => setField(entry.key)}
                                className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                                    field === entry.key
                                        ? 'bg-purple-50 text-purple-800 ring-1 ring-purple-500'
                                        : 'hover:bg-gray-50'
                                }`}
                            >
                                <div className="font-medium">{entry.label}</div>
                                <div className="text-xs text-gray-500">{entry.description}</div>
                            </button>
                        ))}
                    </div>

                    <div className="flex-1 min-w-0 flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                            <div className="flex flex-wrap gap-1">
                                {fieldInfo.variables.map(variable => (
                                    <button
                                        key={variable}
                                        onClick={() => insertVariable(variable)}
                                        title="Insert at cursor"
                                        className="text-xs font-mono px-2 py-1 rounded border bg-gray-50 hover:bg-purple-50 hover:border-purple-300 transition-colors"
                                    >
                                        {`{{${variable}}}`}
                                    </button>
                                ))}
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setShowPreview(prev => !prev)}
                            >
                                <Eye className="h-4 w-4 mr-2" />
                                {showPreview ? 'Edit' : 'Preview'}
                            </Button>
                        </div>

                        {showPreview ? (
                            <ScrollArea className="h-[40vh] border rounded-md">
                                <pre className="p-3 text-xs whitespace-pre-wrap font-mono">
                                    {renderPreview(field, draft)}
                                </pre>
                            </ScrollArea>
                        ) : (
                            <Textarea
                                ref={textareaRef}
                                value={value}
                                onChange={(e) => setDraft(prev => ({ ...prev, [field]: e.target.value }))}
                                className="h-[40vh] font-mono text-xs resize-none"
                                spellCheck={false}
                            />
                        )}

                        {(unknownVariables.length > 0 || syntaxErrors.length > 0) && (
                            <div className="flex gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-md p-2">
                                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                                <div className="space-y-1">
                                    {syntaxErrors.map(error => (
                                        <div key={error}>Block syntax: {error}.</div>
                                    ))}
                                    {unknownVariables.length > 0 && (
                                        <div>
                                            Unknown here, renders empty:{' '}
                                            {unknownVariables.map(variable => (
                                                <Badge key={variable} variant="secondary" className="mr-1 font-mono">
                                                    {`{{${variable}}}`}
                                                </Badge>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <DialogFooter className="flex-row items-center justify-between sm:justify-between">
                    <div className="text-xs text-gray-500">
                        {isPreset
                            ? 'Presets are read-only - saving creates a custom copy.'
                            : isDirty ? 'Unsaved changes' : 'Saved'}
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={handleRevert} disabled={!isDirty}>
                            <RotateCcw className="h-4 w-4 mr-2" />
                            Revert
                        </Button>
                        <Button variant="outline" onClick={onClose}>Close</Button>
                        <Button onClick={handleSave} disabled={!isDirty && !isPreset}>
                            {isPreset ? 'Save as copy' : 'Save'}
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default AiPromptsDialog;
