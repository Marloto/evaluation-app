import React from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Template {
    id: string;
    name: string;
    type: 'default' | 'saved';
    createdAt?: string;
}

interface ManageTemplatesDialogProps {
    isOpen: boolean;
    onClose: () => void;
    templates: Template[];
    onDelete: (templateId: string) => void;
}

const ManageTemplatesDialog = ({
    isOpen,
    onClose,
    templates,
    onDelete
}: ManageTemplatesDialogProps) => {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Manage Saved Configurations</DialogTitle>
                </DialogHeader>
                <ScrollArea className="max-h-[60vh]">
                    <div className="space-y-2">
                        {templates.map(template => (
                            <div
                                key={template.id}
                                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                            >
                                <div>
                                    <h3 className="font-medium">{template.name}</h3>
                                    {template.createdAt && (
                                        <p className="text-sm text-gray-500">
                                            Created: {new Date(template.createdAt).toLocaleDateString()}
                                        </p>
                                    )}
                                </div>
                                {template.type === 'saved' && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => onDelete(template.id)}
                                    >
                                        <Trash2 className="h-4 w-4 text-red-500" />
                                    </Button>
                                )}
                            </div>
                        ))}
                    </div>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
};

export default ManageTemplatesDialog;