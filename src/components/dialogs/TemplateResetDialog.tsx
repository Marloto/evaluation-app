"use client"


import React from 'react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { isDefaultTemplate } from '@/lib/config/evaluation-templates';
import { Template } from '@/lib/types/types';
import { format } from 'date-fns';

interface TemplateResetDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (templateId: string) => void;
    templates: Template[];
}

const TemplateResetDialog = ({
    isOpen,
    onClose,
    onConfirm,
    templates
}: TemplateResetDialogProps) => {
    const [selectedTemplate, setSelectedTemplate] = React.useState<string>(templates[0]?.id || '');

    // Get the selected template for description
    const selectedTemplateInfo = templates.find(t => t.id === selectedTemplate);

    return (
        <AlertDialog open={isOpen} onOpenChange={onClose}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Load Configuration Template</AlertDialogTitle>
                    <AlertDialogDescription>
                        Select a configuration template to load. This will reset your current evaluation state.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                
                <div className="py-4 space-y-4">
                    <Select
                        value={selectedTemplate}
                        onValueChange={setSelectedTemplate}
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select template" />
                        </SelectTrigger>
                        <SelectContent>
                            <div className="space-y-1">
                                {/* Default templates */}
                                {templates
                                    .filter(isDefaultTemplate)
                                    .map(template => (
                                        <SelectItem 
                                            key={template.id} 
                                            value={template.id}
                                            className="cursor-pointer"
                                        >
                                            {template.name} (v{template.version})
                                        </SelectItem>
                                    ))}
                                
                                {/* Separator if we have both types */}
                                {templates.some(isDefaultTemplate) && 
                                 templates.some(t => !isDefaultTemplate(t)) && (
                                    <div className="h-px bg-gray-200 my-2" />
                                )}
                                
                                {/* Custom templates */}
                                {templates
                                    .filter(t => !isDefaultTemplate(t))
                                    .map(template => (
                                        <SelectItem 
                                            key={template.id} 
                                            value={template.id}
                                            className="cursor-pointer"
                                        >
                                            {template.name}
                                        </SelectItem>
                                    ))}
                            </div>
                        </SelectContent>
                    </Select>

                    {selectedTemplateInfo && (
                        <div className="space-y-2">
                            <p className="text-sm text-gray-600">
                                {selectedTemplateInfo.description}
                            </p>
                            <p className="text-xs text-gray-500">
                                {isDefaultTemplate(selectedTemplateInfo) ? (
                                    `Last updated: ${format(new Date(selectedTemplateInfo.lastUpdated), 'PP')}`
                                ) : (
                                    `Created: ${format(new Date(selectedTemplateInfo.createdAt), 'PP')}`
                                )}
                            </p>
                        </div>
                    )}
                </div>

                <AlertDialogFooter>
                    <AlertDialogCancel onClick={onClose}>Cancel</AlertDialogCancel>
                    <AlertDialogAction 
                        onClick={() => onConfirm(selectedTemplate)}
                        className="bg-blue-600 hover:bg-blue-700"
                    >
                        Load Template
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};

export default TemplateResetDialog;