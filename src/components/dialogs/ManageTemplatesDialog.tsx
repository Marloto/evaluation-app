"use client"

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
import { isDefaultTemplate } from '@/lib/config/evaluation-templates';
import { Template } from '@/lib/types/types';
import { format } from 'date-fns';
import { Badge } from "@/components/ui/badge";

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
                    <DialogTitle>Manage Saved Templates</DialogTitle>
                </DialogHeader>
                <ScrollArea className="max-h-[60vh]">
                    <div className="space-y-2">
                        {templates.map(template => (
                            <div
                                key={template.id}
                                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                            >
                                <div className="space-y-1">
                                    <h3 className="font-medium">
                                        {template.name}
                                        {isDefaultTemplate(template) && (
                                            <span className="ml-2 text-sm text-gray-500">
                                                (v{template.version})
                                                <Badge variant="secondary" className="ml-2 bg-gray-100 text-gray-800 hover:bg-gray-100">
                                                    Default Template
                                                </Badge>
                                            </span>
                                        )}
                                    </h3>
                                    <p className="text-sm text-gray-600">{template.description}</p>
                                    <p className="text-xs text-gray-500">
                                        {isDefaultTemplate(template) ? (
                                            `Last updated: ${format(new Date(template.lastUpdated), 'PP')}`
                                        ) : (
                                            `Created: ${format(new Date(template.createdAt), 'PP')}`
                                        )}
                                    </p>
                                </div>
                                {!isDefaultTemplate(template) && (
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