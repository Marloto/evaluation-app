// ConfigurationSidebar.tsx
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X, Settings2, Save, FolderOpen } from "lucide-react";
import { useConfig } from './providers/ConfigProvider';
import { useGrades } from './GradeProvider';
import { cn } from "@/lib/utils/misc";
import { SectionList } from './SectionItem';
import GradeConfigDialog from './dialogs/GradeConfigDialog';
import SaveConfigDialog from './dialogs/SaveConfigDialog';
import ManageTemplatesDialog from './dialogs/ManageTemplatesDialog';
import { GradeThreshold } from '@/lib/types/types';

interface ConfigurationSidebarProps {
    isOpen: boolean;
    onToggle: () => void;
}

export const ConfigurationSidebar: React.FC<ConfigurationSidebarProps> = ({
    isOpen,
    onToggle
}) => {
    const { config, templates, saveTemplate, deleteTemplate } = useConfig();
    const { config: gradeConfig, updateConfig: updateGradeConfig } = useGrades();
    const [expandedSection, setExpandedSection] = useState<string | null>(null);
    const [expandedCriterion, setExpandedCriterion] = useState<string | null>(null);
    const [isGradeDialogOpen, setIsGradeDialogOpen] = useState(false);
    const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
    const [isManageDialogOpen, setIsManageDialogOpen] = useState(false);

    const handleGradeConfigSave = (thresholds: GradeThreshold[]) => {
        updateGradeConfig({ thresholds });
    };

    return (
        <>
            {/* Backdrop */}
            <div
                className={cn(
                    "fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300",
                    isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
                )}
                onClick={onToggle}
                aria-hidden="true"
            />

            {/* Sidebar Panel */}
            <div
                className={cn(
                    "fixed right-0 top-0 h-screen bg-white shadow-xl transition-transform duration-300 ease-in-out",
                    isOpen ? "translate-x-0" : "translate-x-full",
                    "w-[600px] z-50"
                )}
            >
                <div className="h-full flex flex-col">
                    {/* Header */}
                    <div className="p-6 border-b flex items-center justify-between bg-gray-50">
                        <div>
                            <h2 className="text-xl font-semibold">Configuration</h2>
                            <p className="text-sm text-gray-500">Manage evaluation structure and criteria</p>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onToggle}
                            className="hover:bg-gray-200"
                        >
                            <X className="h-5 w-5" />
                        </Button>
                    </div>

                    {/* Content */}
                    <ScrollArea className="flex-1 p-6">
                        <div className="space-y-6">
                            <SectionList
                                sections={config.sections}
                                expandedSection={expandedSection}
                                expandedCriterion={expandedCriterion}
                                onExpandSection={setExpandedSection}
                                onExpandCriterion={setExpandedCriterion}
                            />
                        </div>
                    </ScrollArea>

                    {/* Footer Actions */}
                    <div className="p-6 border-t space-y-2">
                        <div className="flex gap-2">
                            <Button
                                onClick={() => setIsSaveDialogOpen(true)}
                                variant="outline"
                                className="flex-1"
                            >
                                <Save className="h-4 w-4 mr-2" />
                                Save Configuration
                            </Button>
                            <Button
                                onClick={() => setIsManageDialogOpen(true)}
                                variant="outline"
                                className="flex-1"
                            >
                                <FolderOpen className="h-4 w-4 mr-2" />
                                Manage Templates
                            </Button>
                        </div>
                        <Button
                            onClick={() => setIsGradeDialogOpen(true)}
                            variant="outline"
                            className="w-full"
                        >
                            <Settings2 className="h-4 w-4 mr-2" />
                            Configure Grade Thresholds
                        </Button>
                    </div>
                </div>
            </div>

            {/* Dialogs */}
            <GradeConfigDialog
                isOpen={isGradeDialogOpen}
                onClose={() => setIsGradeDialogOpen(false)}
                thresholds={gradeConfig.thresholds}
                onSave={handleGradeConfigSave}
            />
            
            <SaveConfigDialog
                isOpen={isSaveDialogOpen}
                onClose={() => setIsSaveDialogOpen(false)}
                onSave={saveTemplate}
            />

            <ManageTemplatesDialog
                isOpen={isManageDialogOpen}
                onClose={() => setIsManageDialogOpen(false)}
                templates={templates}
                onDelete={deleteTemplate}
            />
        </>
    );
};

export default ConfigurationSidebar;