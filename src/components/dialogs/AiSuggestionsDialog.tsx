"use client"

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    AlertTriangle,
    Check,
    KeyRound,
    Loader2,
    RefreshCw,
    Sparkles,
} from 'lucide-react';
import { Section } from '@/lib/types/types';
import { buildNotesText, buildSectionContext, buildThesisContext } from '@/lib/ai/context';
import { Suggestion } from '@/lib/ai/schemas';
import {
    generateCriterionSuggestions,
    generatePreambleSuggestions,
    generateSectionSuggestions,
    SuggestionMeta,
} from '@/lib/ai/suggestions';
import { LlmError } from '@/lib/ai/types';
import { EvaluationState } from '../providers/EvaluationStateProvider';
import { useAi } from '../providers/AiProvider';

export type AiTarget =
    | { mode: 'preamble'; sectionKey: string }
    | { mode: 'criterion'; sectionKey: string; criterionKey: string }
    | { mode: 'section'; sectionKey: string };

export interface AiChanges {
    preamble?: string;
    criteria?: Record<string, string>;
}

interface SuggestionGroup {
    id: string;
    kind: 'preamble' | 'criterion';
    label: string;
    current: string;
    suggestions: Suggestion[];
    selected: number | null;
}

interface AiSuggestionsDialogProps {
    target: AiTarget | null;
    sections: Record<string, Section>;
    evaluationState: EvaluationState;
    onClose: () => void;
    onApply: (sectionKey: string, changes: AiChanges) => void;
    onOpenSettings: () => void;
}

type Status = 'idle' | 'loading' | 'done' | 'error';

const TITLES: Record<AiTarget['mode'], string> = {
    preamble: 'AI proposals for the section intro',
    criterion: 'AI proposals for this criterion',
    section: 'AI proposals for the whole section',
};

const errorMessage = (error: LlmError): string => {
    switch (error.code) {
        case 'no-api-key':
            return 'No API key configured.';
        case 'auth':
            return 'The API key was rejected. Check it in the AI settings.';
        case 'rate-limit':
            return 'Rate limit reached. Wait a moment and try again.';
        case 'network':
            return 'Could not reach the Anthropic API. Check your connection.';
        case 'invalid-response':
            return 'The model did not return usable proposals. Try again.';
        default:
            return error.message || 'Something went wrong.';
    }
};

export const AiSuggestionsDialog: React.FC<AiSuggestionsDialogProps> = ({
    target,
    sections,
    evaluationState,
    onClose,
    onApply,
    onOpenSettings,
}) => {
    const { isAvailable, settings } = useAi();
    const [status, setStatus] = useState<Status>('idle');
    const [groups, setGroups] = useState<SuggestionGroup[]>([]);
    const [error, setError] = useState<LlmError | null>(null);
    const [meta, setMeta] = useState<SuggestionMeta | null>(null);
    const abortRef = useRef<AbortController | null>(null);

    const cancelPending = useCallback(() => {
        abortRef.current?.abort();
        abortRef.current = null;
    }, []);

    const generate = useCallback(async () => {
        if (!target) return;

        const section = sections[target.sectionKey];
        if (!section) return;

        const context = buildSectionContext(
            target.sectionKey,
            section,
            evaluationState.sections[target.sectionKey]
        );
        const notes = buildNotesText(evaluationState.notes);
        const thesis = buildThesisContext(evaluationState);

        cancelPending();
        const controller = new AbortController();
        abortRef.current = controller;

        setStatus('loading');
        setError(null);
        setGroups([]);
        setMeta(null);

        try {
            if (target.mode === 'criterion') {
                const criterion = context.criteria.find(
                    entry => entry.criterionKey === target.criterionKey
                );
                if (!criterion) {
                    throw new LlmError('unknown', 'This criterion has no rating selected yet.');
                }
                const response = await generateCriterionSuggestions(context, criterion, notes, {
                    ...thesis,
                    signal: controller.signal,
                });
                if (controller.signal.aborted) return;
                setGroups([{
                    id: criterion.criterionKey,
                    kind: 'criterion',
                    label: criterion.title,
                    current: criterion.selectedText,
                    suggestions: response.suggestions,
                    selected: null,
                }]);
                setMeta(response.meta);
            } else if (target.mode === 'preamble') {
                const response = await generatePreambleSuggestions(context, notes, {
                    ...thesis,
                    signal: controller.signal,
                });
                if (controller.signal.aborted) return;
                setGroups([{
                    id: 'preamble',
                    kind: 'preamble',
                    label: 'Section intro',
                    current: context.preamble ?? '',
                    suggestions: response.suggestions,
                    selected: null,
                }]);
                setMeta(response.meta);
            } else {
                const response = await generateSectionSuggestions(context, notes, {
                    ...thesis,
                    signal: controller.signal,
                });
                if (controller.signal.aborted) return;

                const criterionGroups: SuggestionGroup[] = context.criteria
                    .map((criterion): SuggestionGroup | null => {
                        const match = response.criteria.find(
                            entry => entry.criterionKey === criterion.criterionKey
                        );
                        if (!match || match.suggestions.length === 0) return null;
                        return {
                            id: criterion.criterionKey,
                            kind: 'criterion',
                            label: criterion.title,
                            current: criterion.selectedText,
                            suggestions: match.suggestions,
                            selected: null,
                        };
                    })
                    .filter((group): group is SuggestionGroup => group !== null);

                setGroups([
                    {
                        id: 'preamble',
                        kind: 'preamble',
                        label: 'Section intro',
                        current: context.preamble ?? '',
                        suggestions: response.preamble,
                        selected: null,
                    },
                    ...criterionGroups,
                ]);
                setMeta(response.meta);
            }
            setStatus('done');
        } catch (caught) {
            if (controller.signal.aborted) return;
            const llmError = caught instanceof LlmError
                ? caught
                : new LlmError('unknown', caught instanceof Error ? caught.message : String(caught));
            if (llmError.code === 'aborted') return;
            setError(llmError);
            setStatus('error');
        } finally {
            if (abortRef.current === controller) {
                abortRef.current = null;
            }
        }
    }, [cancelPending, evaluationState, sections, target]);

    // Fire as soon as a target is set - and only when a key is actually present.
    useEffect(() => {
        if (!target) {
            setStatus('idle');
            setGroups([]);
            setError(null);
            setMeta(null);
            return;
        }
        if (!isAvailable) {
            setStatus('idle');
            return;
        }
        generate();
        return cancelPending;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [target, isAvailable]);

    const handleClose = () => {
        cancelPending();
        onClose();
    };

    const toggleSelection = (groupId: string, index: number) => {
        setGroups(prev => prev.map(group => (
            group.id === groupId
                ? { ...group, selected: group.selected === index ? null : index }
                : group
        )));
    };

    const selectedCount = groups.filter(group => group.selected !== null).length;

    const handleApply = () => {
        if (!target) return;
        const changes: AiChanges = {};
        const criteria: Record<string, string> = {};

        groups.forEach(group => {
            if (group.selected === null) return;
            const text = group.suggestions[group.selected]?.text;
            if (!text) return;
            if (group.kind === 'preamble') {
                changes.preamble = text;
            } else {
                criteria[group.id] = text;
            }
        });

        if (Object.keys(criteria).length > 0) {
            changes.criteria = criteria;
        }

        onApply(target.sectionKey, changes);
        handleClose();
    };

    const sectionTitle = target ? sections[target.sectionKey]?.title : undefined;

    return (
        <Dialog open={target !== null} onOpenChange={(open) => { if (!open) handleClose(); }}>
            <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-purple-600" />
                        {target ? TITLES[target.mode] : 'AI proposals'}
                    </DialogTitle>
                    <DialogDescription>
                        {sectionTitle
                            ? `${sectionTitle} - proposals combine the selected ratings with your notes.`
                            : 'Proposals combine the selected ratings with your notes.'}
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 min-h-0">
                    {!isAvailable && (
                        <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
                            <KeyRound className="h-8 w-8 text-gray-400" />
                            <div className="space-y-1">
                                <p className="font-medium">No API key configured</p>
                                <p className="text-sm text-gray-500 max-w-sm">
                                    Add an Anthropic API key to generate proposals. The key stays in
                                    memory only and has to be entered again after a reload.
                                </p>
                            </div>
                            <Button onClick={onOpenSettings}>Open AI settings</Button>
                        </div>
                    )}

                    {isAvailable && status === 'loading' && (
                        <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
                            <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
                            <div className="space-y-1">
                                <p className="font-medium">Generating proposals...</p>
                                <p className="text-sm text-gray-500">
                                    {target?.mode === 'section'
                                        ? 'The whole section is processed in one request - this usually takes a few seconds.'
                                        : 'This usually takes a few seconds.'}
                                </p>
                            </div>
                            <Button variant="outline" size="sm" onClick={handleClose}>Cancel</Button>
                        </div>
                    )}

                    {isAvailable && status === 'error' && error && (
                        <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
                            <AlertTriangle className="h-8 w-8 text-red-500" />
                            <div className="space-y-1">
                                <p className="font-medium">Generation failed</p>
                                <p className="text-sm text-gray-500 max-w-md">{errorMessage(error)}</p>
                            </div>
                            <div className="flex gap-2">
                                {error.code === 'auth' || error.code === 'no-api-key' ? (
                                    <Button onClick={onOpenSettings}>Open AI settings</Button>
                                ) : (
                                    <Button onClick={generate}>
                                        <RefreshCw className="h-4 w-4 mr-2" />
                                        Try again
                                    </Button>
                                )}
                            </div>
                        </div>
                    )}

                    {isAvailable && status === 'done' && (
                        <ScrollArea className="h-[55vh] pr-4">
                            <div className="space-y-5">
                                {groups.map(group => (
                                    <div key={group.id} className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium">{group.label}</span>
                                                {group.kind === 'preamble' && (
                                                    <Badge variant="secondary">Intro</Badge>
                                                )}
                                            </div>
                                            {group.selected !== null && (
                                                <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">
                                                    selected
                                                </Badge>
                                            )}
                                        </div>

                                        {group.current && (
                                            <div className="text-sm text-gray-500 bg-gray-50 rounded-md p-2">
                                                <span className="font-medium text-gray-600">Current: </span>
                                                {group.current}
                                            </div>
                                        )}

                                        <div className="space-y-2">
                                            {group.suggestions.map((suggestion, index) => (
                                                <button
                                                    key={index}
                                                    onClick={() => toggleSelection(group.id, index)}
                                                    className={`w-full p-3 rounded-md text-left transition-colors ${
                                                        group.selected === index
                                                            ? 'bg-purple-50 ring-1 ring-purple-500'
                                                            : 'bg-white border hover:bg-gray-50'
                                                    }`}
                                                >
                                                    <div className="flex justify-between gap-2">
                                                        <span className="text-sm">{suggestion.text}</span>
                                                        {group.selected === index && (
                                                            <Check className="h-4 w-4 shrink-0 text-purple-600" />
                                                        )}
                                                    </div>
                                                    {suggestion.basis && (
                                                        <p className="mt-2 text-xs text-gray-500 italic">
                                                            {suggestion.basis}
                                                        </p>
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    )}
                </div>

                <DialogFooter className="flex-row items-center justify-between sm:justify-between">
                    <div className="text-xs text-gray-500">
                        {status === 'done' && (
                            <span>
                                {selectedCount} of {groups.length} selected
                                {meta ? ` - ${settings.model}, ${(meta.durationMs / 1000).toFixed(1)}s` : ''}
                            </span>
                        )}
                    </div>
                    <div className="flex gap-2">
                        {status === 'done' && (
                            <Button variant="outline" onClick={generate}>
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Regenerate
                            </Button>
                        )}
                        <Button variant="outline" onClick={handleClose}>Cancel</Button>
                        <Button
                            onClick={handleApply}
                            disabled={status !== 'done' || selectedCount === 0}
                        >
                            Apply {selectedCount > 0 ? `(${selectedCount})` : ''}
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default AiSuggestionsDialog;
