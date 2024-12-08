"use client"

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight, Edit2, Plus, Trash2 } from "lucide-react";
import { CriterionList } from './CriterionItem';
import { useConfigurationManager } from './ConfigurationManager';
import { SectionEditDialog } from './dialogs/SectionEditDialog';
import DeleteConfirmDialog from './dialogs/DeleteConfirmDialog';
import { Section } from '@/lib/types/types';

interface SectionItemProps {
    sectionKey: string;
    section: Section;
    isExpanded: boolean;
    expandedCriterion: string | null;
    onToggleExpand: () => void;
    onExpandCriterion: (criterionKey: string | null) => void;
}

export const SectionItem: React.FC<SectionItemProps> = ({
    sectionKey,
    section,
    isExpanded,
    expandedCriterion,
    onToggleExpand,
    onExpandCriterion,
}) => {
    const configManager = useConfigurationManager();
    const [dialogState, setDialogState] = useState<{
        type: 'edit' | 'delete' | null;
        isOpen: boolean;
    }>({
        type: null,
        isOpen: false
    });

    const handleEdit = () => {
        setDialogState({
            type: 'edit',
            isOpen: true
        });
    };

    const handleDelete = () => {
        setDialogState({
            type: 'delete',
            isOpen: true
        });
    };

    const handleDialogClose = () => {
        setDialogState({
            type: null,
            isOpen: false
        });
    };

    const handleEditSave = (data: { title: string; weight: number }) => {
        configManager.updateSection(
            sectionKey,
            data.title,
            data.weight
        );
        handleDialogClose();
    };

    const handleDeleteConfirm = () => {
        configManager.deleteSection(sectionKey);
        handleDialogClose();
    };

    return (
        <div className="border rounded-lg bg-white">
            {/* Section Header */}
            <div className="w-full flex items-center justify-between p-3 hover:bg-gray-50">
                <button
                    className="flex items-center gap-2"
                    onClick={onToggleExpand}
                >
                    {isExpanded ? (
                        <ChevronDown className="h-4 w-4" />
                    ) : (
                        <ChevronRight className="h-4 w-4" />
                    )}
                    <span>{section.title}</span>
                </button>
                <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">
                        Weight: {section.weight}
                    </span>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleEdit}
                    >
                        <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleDelete}
                    >
                        <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                </div>
            </div>

            {/* Section Content */}
            {isExpanded && (
                <CriterionList
                    sectionKey={sectionKey}
                    criteria={section.criteria}
                    expandedCriterion={expandedCriterion}
                    onExpand={onExpandCriterion}
                />
            )}

            {/* Dialogs */}
            <SectionEditDialog
                isOpen={dialogState.type === 'edit' && dialogState.isOpen}
                onClose={handleDialogClose}
                onSave={handleEditSave}
                mode="edit"
                initialData={{
                    title: section.title,
                    weight: section.weight
                }}
            />

            <DeleteConfirmDialog
                isOpen={dialogState.type === 'delete' && dialogState.isOpen}
                onClose={handleDialogClose}
                onConfirm={handleDeleteConfirm}
                title="Delete Section"
                description="Are you sure you want to delete this section? This action cannot be undone and will remove all criteria and options within it."
            />
        </div>
    );
};

interface SectionListProps {
    sections: Record<string, Section>;
    expandedSection: string | null;
    expandedCriterion: string | null;
    onExpandSection: (sectionKey: string | null) => void;
    onExpandCriterion: (criterionKey: string | null) => void;
}

export const SectionList: React.FC<SectionListProps> = ({
    sections,
    expandedSection,
    expandedCriterion,
    onExpandSection,
    onExpandCriterion,
}) => {
    const configManager = useConfigurationManager();
    const [dialogState, setDialogState] = useState<{
        isOpen: boolean;
    }>({
        isOpen: false
    });

    const handleAdd = () => {
        setDialogState({ isOpen: true });
    };

    const handleDialogClose = () => {
        setDialogState({ isOpen: false });
    };

    const handleDialogSave = (data: { title: string; weight: number }) => {
        configManager.addSection(data.title, data.weight);
        handleDialogClose();
    };

    return (
        <div className="space-y-4">
            <Button
                onClick={handleAdd}
                variant="outline"
                className="w-full"
            >
                <Plus className="h-4 w-4 mr-2" />
                Add Section
            </Button>

            {Object.entries(sections).map(([sectionKey, section]) => (
                <SectionItem
                    key={sectionKey}
                    sectionKey={sectionKey}
                    section={section}
                    isExpanded={expandedSection === sectionKey}
                    expandedCriterion={expandedCriterion}
                    onToggleExpand={() => onExpandSection(expandedSection === sectionKey ? null : sectionKey)}
                    onExpandCriterion={onExpandCriterion}
                />
            ))}

            <SectionEditDialog
                isOpen={dialogState.isOpen}
                onClose={handleDialogClose}
                onSave={handleDialogSave}
                mode="add"
            />
        </div>
    );
};

export default SectionList;