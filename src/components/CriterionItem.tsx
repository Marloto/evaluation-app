"use client"

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight, Plus, Edit2, Trash2, Star } from "lucide-react";
import { useConfigurationManager } from './ConfigurationManager';
import { CriterionEditDialog } from './dialogs/CriterionEditDialog';
import DeleteConfirmDialog from './dialogs/DeleteConfirmDialog';
import OptionList from './OptionList';
import { Criterion } from '@/lib/types/types';
import { Badge } from "@/components/ui/badge";

interface CriterionItemProps {
    sectionKey: string;
    criterionKey: string;
    criterion: Criterion;
    isExpanded: boolean;
    onToggle: () => void;
}

interface CriterionListProps {
    sectionKey: string;
    criteria: Record<string, Criterion>;
    expandedCriterion: string | null;
    onExpand: (criterionKey: string | null) => void;
}

export const CriterionItem: React.FC<CriterionItemProps> = ({
    sectionKey,
    criterionKey,
    criterion,
    isExpanded,
    onToggle
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

    const handleEditSave = (data: { title: string; weight: number; isBonus?: boolean }) => {
        configManager.updateCriterion(
            sectionKey,
            criterionKey,
            data.title,
            data.weight,
            data.isBonus
        );
        handleDialogClose();
    };

    const handleDeleteConfirm = () => {
        configManager.deleteCriterion(sectionKey, criterionKey);
        handleDialogClose();
    };

    return (
        <div className="border rounded-lg">
            {/* Criterion Header */}
            <div className="w-full flex items-center justify-between p-2 hover:bg-gray-50">
                <button
                    className="flex items-center gap-2"
                    onClick={onToggle}
                >
                    {isExpanded ? (
                        <ChevronDown className="h-4 w-4" />
                    ) : (
                        <ChevronRight className="h-4 w-4" />
                    )}
                    <span className="truncate max-w-[200px]">{criterion.title}</span>
                    {criterion.excludeFromTotal && (
                        <Badge variant="secondary" className="ml-2 bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
                            <Star className="h-3 w-3 mr-1 fill-yellow-500 text-yellow-500" />
                            Bonus
                        </Badge>
                    )}
                </button>
                <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">
                        Weight: {criterion.weight}
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

            {/* Criterion Content */}
            {isExpanded && (
                <OptionList
                    sectionKey={sectionKey}
                    criterionKey={criterionKey}
                    options={criterion.options}
                />
            )}

            {/* Dialogs */}
            <CriterionEditDialog
                isOpen={dialogState.type === 'edit' && dialogState.isOpen}
                onClose={handleDialogClose}
                onSave={handleEditSave}
                mode="edit"
                initialData={{
                    title: criterion.title,
                    weight: criterion.weight,
                    excludeFromTotal: criterion.excludeFromTotal
                }}
            />

            <DeleteConfirmDialog
                isOpen={dialogState.type === 'delete' && dialogState.isOpen}
                onClose={handleDialogClose}
                onConfirm={handleDeleteConfirm}
                title="Delete Criterion"
                description="Are you sure you want to delete this criterion? This action cannot be undone."
            />
        </div>
    );
};

// CriterionList component remains largely the same, just needs to pass the new isBonus parameter
export const CriterionList: React.FC<CriterionListProps> = ({
    sectionKey,
    criteria,
    expandedCriterion,
    onExpand,
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

    const handleDialogSave = (data: { title: string; weight: number; isBonus?: boolean }) => {
        configManager.addCriterion(
            sectionKey,
            data.title,
            data.weight,
            data.isBonus
        );
        handleDialogClose();
    };

    return (
        <div className="p-4 space-y-2">
            <Button
                onClick={handleAdd}
                size="sm"
                variant="outline"
                className="w-full mb-2"
            >
                <Plus className="h-4 w-4 mr-2" />
                Add Criterion
            </Button>

            {Object.entries(criteria).map(([criterionKey, criterion]) => (
                <CriterionItem
                    key={criterionKey}
                    sectionKey={sectionKey}
                    criterionKey={criterionKey}
                    criterion={criterion}
                    isExpanded={expandedCriterion === criterionKey}
                    onToggle={() => onExpand(expandedCriterion === criterionKey ? null : criterionKey)}
                />
            ))}

            <CriterionEditDialog
                isOpen={dialogState.isOpen}
                onClose={handleDialogClose}
                onSave={handleDialogSave}
                mode="add"
            />
        </div>
    );
};

export default CriterionList;