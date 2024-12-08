"use client"

import React from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { useEvaluationState } from '../providers/EvaluationStateProvider';
import RichTextEditor from '../RichTextEditor';

interface NotesDialogProps {
    isOpen: boolean;
    onClose: () => void;
}

const NotesDialog: React.FC<NotesDialogProps> = ({
    isOpen,
    onClose
}) => {
    const { state, updateNotes } = useEvaluationState();

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl h-[90vh] max-h-[90vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>Notes</DialogTitle>
                </DialogHeader>
                <div className="flex-1 min-h-0 -mx-6 -mb-6"> {/* Negative margin to counteract dialog padding */}
                    <RichTextEditor
                        value={state.notes}
                        onChange={updateNotes}
                        className="h-full border-0 rounded-none"
                    />
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default NotesDialog;