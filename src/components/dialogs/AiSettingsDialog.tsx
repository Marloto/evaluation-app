"use client"

import React, { useEffect, useState } from 'react';
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { AlertTriangle, Eye, EyeOff, FileText } from 'lucide-react';
import { useAi } from '../providers/AiProvider';
import { LlmEffort } from '@/lib/ai/types';

interface AiSettingsDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onOpenPrompts: () => void;
}

const EFFORT_LEVELS: LlmEffort[] = ['low', 'medium', 'high'];

export const AiSettingsDialog: React.FC<AiSettingsDialogProps> = ({ isOpen, onClose, onOpenPrompts }) => {
    const { settings, updateSettings, models, activeTemplate } = useAi();
    const [apiKey, setApiKey] = useState(settings.apiKey ?? '');
    const [showKey, setShowKey] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setApiKey(settings.apiKey ?? '');
            setShowKey(false);
        }
    }, [isOpen, settings.apiKey]);

    const handleSave = () => {
        updateSettings({ apiKey: apiKey.trim() || undefined });
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>AI Settings</DialogTitle>
                    <DialogDescription>
                        Configure the model used to turn ratings and notes into specific text.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="ai-api-key">Anthropic API Key</Label>
                        <div className="flex gap-2">
                            <Input
                                id="ai-api-key"
                                type={showKey ? 'text' : 'password'}
                                value={apiKey}
                                onChange={(e) => setApiKey(e.target.value)}
                                placeholder="sk-ant-..."
                                autoComplete="off"
                            />
                            <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                onClick={() => setShowKey(prev => !prev)}
                                aria-label={showKey ? 'Hide key' : 'Show key'}
                            >
                                {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                        </div>
                        <div className="flex gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-md p-2">
                            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                            <span>
                                The key is kept in memory only and is never written to disk or
                                localStorage - it is gone after a page reload. Requests go directly
                                from this browser to the Anthropic API.
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="ai-model">Model</Label>
                            <Select
                                value={settings.model}
                                onValueChange={(value) => updateSettings({ model: value })}
                            >
                                <SelectTrigger id="ai-model">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {models.map(model => (
                                        <SelectItem key={model.id} value={model.id}>
                                            {model.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="ai-effort">Effort</Label>
                            <Select
                                value={settings.effort}
                                onValueChange={(value) => updateSettings({ effort: value as LlmEffort })}
                            >
                                <SelectTrigger id="ai-effort">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {EFFORT_LEVELS.map(level => (
                                        <SelectItem key={level} value={level}>
                                            {level}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="ai-language">Language</Label>
                            <Input
                                id="ai-language"
                                value={settings.language}
                                onChange={(e) => updateSettings({ language: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="ai-instructions">Additional instructions (optional)</Label>
                        <Textarea
                            id="ai-instructions"
                            value={settings.extraInstructions ?? ''}
                            onChange={(e) => updateSettings({ extraInstructions: e.target.value })}
                            placeholder="e.g. keep sentences short, always mention the chapter number..."
                            className="min-h-[70px]"
                        />
                        <p className="text-xs text-gray-500">
                            Appended to the system prompt via <code>{'{{extraInstructions}}'}</code>.
                        </p>
                    </div>

                    <div className="flex items-center justify-between rounded-md border p-3">
                        <div className="min-w-0">
                            <p className="text-sm font-medium">Prompt set</p>
                            <p className="text-xs text-gray-500 truncate">{activeTemplate.name}</p>
                        </div>
                        <Button variant="outline" size="sm" onClick={onOpenPrompts}>
                            <FileText className="h-4 w-4 mr-2" />
                            Edit prompts
                        </Button>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleSave}>Save</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default AiSettingsDialog;
