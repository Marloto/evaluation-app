"use client"

import React from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { EMPTY_THESIS_INFO, useEvaluationState } from '../providers/EvaluationStateProvider';

interface ThesisInfoDialogProps {
    isOpen: boolean;
    onClose: () => void;
}

export const ThesisInfoDialog: React.FC<ThesisInfoDialogProps> = ({ isOpen, onClose }) => {
    const { state, updateThesisInfo } = useEvaluationState();
    const info = state.thesisInfo ?? EMPTY_THESIS_INFO;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>General Information</DialogTitle>
                    <DialogDescription>
                        Context about the thesis. Used to ground the AI proposals and saved with the
                        evaluation on export.
                    </DialogDescription>
                </DialogHeader>

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
                            className="min-h-[220px]"
                        />
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default ThesisInfoDialog;
