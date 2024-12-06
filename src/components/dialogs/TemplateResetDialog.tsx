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

interface TemplateResetDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (templateId: string) => void;
    templates: Array<{
        id: string;
        name: string;
        type: 'default' | 'saved';
    }>;
}

const TemplateResetDialog = ({
    isOpen,
    onClose,
    onConfirm,
    templates
}: TemplateResetDialogProps) => {
    const [selectedTemplate, setSelectedTemplate] = React.useState<string>('bachelor');

    return (
        <AlertDialog open={isOpen} onOpenChange={onClose}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Load Configuration Template</AlertDialogTitle>
                    <AlertDialogDescription>
                        Select a configuration template to load. This will reset your current evaluation state.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                
                {/* Select außerhalb der Description */}
                <div className="py-4">
                    <Select
                        value={selectedTemplate}
                        onValueChange={setSelectedTemplate}
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select template" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="bachelor">Bachelor Thesis (Default)</SelectItem>
                            <SelectItem value="master">Master Thesis (Default)</SelectItem>
                            {templates
                                .filter(t => t.type === 'saved')
                                .map(template => (
                                    <SelectItem key={template.id} value={template.id}>
                                        {template.name}
                                    </SelectItem>
                                ))}
                        </SelectContent>
                    </Select>
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