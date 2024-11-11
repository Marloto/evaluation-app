import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X, Settings2, RotateCcw } from "lucide-react";
import { useConfig } from './ConfigProvider';
import { useGrades } from './GradeProvider';
import { cn } from "@/lib/utils";
import { SectionList } from './SectionItem';
import GradeConfigDialog from './dialogs/GradeConfigDialog';
import { GradeThreshold } from '@/types';
import DeleteConfirmDialog from './dialogs/DeleteConfirmDialog';

interface ConfigurationSidebarProps {
    isOpen: boolean;
    onToggle: () => void;
}

export const ConfigurationSidebar: React.FC<ConfigurationSidebarProps> = ({
    isOpen,
    onToggle
}) => {
    const { config, resetToDefault } = useConfig();
    const { config: gradeConfig, updateConfig: updateGradeConfig } = useGrades();
    const [expandedSection, setExpandedSection] = useState<string | null>(null);
    const [expandedCriterion, setExpandedCriterion] = useState<string | null>(null);
    const [isGradeDialogOpen, setIsGradeDialogOpen] = useState(false);
    const [showResetConfirm, setShowResetConfirm] = useState(false);

    const handleGradeConfigSave = (thresholds: GradeThreshold[]) => {
        updateGradeConfig({ thresholds });
    };

    const handleResetConfig = () => {
        setShowResetConfirm(true);
    };

    const handleResetConfirm = () => {
        resetToDefault();
        setShowResetConfirm(false);
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
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleResetConfig}
                                className="gap-2"
                            >
                                <RotateCcw className="h-4 w-4" />
                                Reset to Default
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={onToggle}
                                className="hover:bg-gray-200"
                            >
                                <X className="h-5 w-5" />
                            </Button>
                        </div>
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

                    {/* Grade Configuration Button */}
                    <div className="p-6 border-t">
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

            {/* Grade Configuration Dialog */}
            <GradeConfigDialog
                isOpen={isGradeDialogOpen}
                onClose={() => setIsGradeDialogOpen(false)}
                thresholds={gradeConfig.thresholds}
                onSave={handleGradeConfigSave}
            />
            
            {/* Reset Configuration Confirmation Dialog */}
            <DeleteConfirmDialog
                isOpen={showResetConfirm}
                onClose={() => setShowResetConfirm(false)}
                onConfirm={handleResetConfirm}
                title="Reset Configuration"
                description="Are you sure you want to reset the configuration to its default state? This will remove all custom sections, criteria, and options. This action cannot be undone."
            />
        </>
    );
};

export default ConfigurationSidebar;