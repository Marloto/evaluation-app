import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Plus, Edit2, GripVertical } from "lucide-react";
import { useConfigurationManager } from './ConfigurationManager';
import { OptionEditDialog } from './dialogs/OptionEditDialog';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent
} from '@dnd-kit/core';
import {
    SortableContext,
    arrayMove,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Option } from '@/lib/types/types';
import StarRating from './StarRating';

interface SortableOptionProps {
    option: Option;
    onEdit: () => void;
}

const SortableOption: React.FC<SortableOptionProps> = ({
    option,
    onEdit
}) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id: `${option.score}-${option.text}` });

    const style = {
        transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
        transition,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="flex items-center gap-2 p-2 bg-white border rounded-md mb-2 group hover:border-gray-400"
        >
            <button
                className="cursor-grab touch-none opacity-0 group-hover:opacity-100 transition-opacity"
                {...attributes}
                {...listeners}
            >
                <GripVertical className="h-4 w-4 text-gray-400" />
            </button>
            <div className="flex-1">
                <div className="font-medium">{option.text}</div>
                <div className="text-sm text-gray-500 flex items-center gap-1">
                    Score:
                    <StarRating
                        score={option.score}
                        size="sm"
                        showEmpty={true}
                    />
                    ({option.score})
                </div>
            </div>
            <Button
                variant="ghost"
                size="sm"
                onClick={onEdit}
            >
                <Edit2 className="h-4 w-4" />
            </Button>
        </div>
    );
};

interface OptionListProps {
    sectionKey: string;
    criterionKey: string;
    options: Option[];
}

export const OptionList: React.FC<OptionListProps> = ({
    sectionKey,
    criterionKey,
    options,
}) => {
    const configManager = useConfigurationManager();
    const [dialogState, setDialogState] = useState<{
        isOpen: boolean;
        mode: 'add' | 'edit';
        initialData?: Option;
        editIndex?: number;
    }>({
        isOpen: false,
        mode: 'add'
    });

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleAdd = () => {
        setDialogState({
            isOpen: true,
            mode: 'add'
        });
    };

    const handleEdit = (index: number) => {
        setDialogState({
            isOpen: true,
            mode: 'edit',
            initialData: options[index],
            editIndex: index
        });
    };

    const handleDialogClose = () => {
        setDialogState(prev => ({ ...prev, isOpen: false }));
    };

    const handleDialogSave = (data: { text: string; score: number }) => {
        if (dialogState.mode === 'add') {
            configManager.addOption(
                sectionKey,
                criterionKey,
                data.text,
                data.score
            );
        } else if (dialogState.mode === 'edit' && dialogState.editIndex !== undefined) {
            configManager.updateOption(
                sectionKey,
                criterionKey,
                dialogState.editIndex,
                data.text,
                data.score
            );
        }
        handleDialogClose();
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const oldIndex = options.findIndex(
                item => `${item.score}-${item.text}` === active.id
            );
            const newIndex = options.findIndex(
                item => `${item.score}-${item.text}` === over.id
            );

            if (oldIndex !== -1 && newIndex !== -1) {
                const newOptions = arrayMove(options, oldIndex, newIndex);
                configManager.reorderOptions(sectionKey, criterionKey, newOptions);
            }
        }
    };

    return (
        <div className="p-2 pt-0">
            <Button onClick={handleAdd} variant="outline" className="w-full mb-2">
                <Plus className="h-4 w-4" />
                Add Option
            </Button>

            <div className="mt-2">
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                >
                    <SortableContext
                        items={options.map(opt => `${opt.score}-${opt.text}`)}
                        strategy={verticalListSortingStrategy}
                    >
                        {options.map((option, index) => (
                            <SortableOption
                                key={`${option.score}-${option.text}`}
                                option={option}
                                onEdit={() => handleEdit(index)}
                            />
                        ))}
                    </SortableContext>
                </DndContext>
            </div>

            <OptionEditDialog
                isOpen={dialogState.isOpen}
                onClose={handleDialogClose}
                onSave={handleDialogSave}
                mode={dialogState.mode}
                initialData={dialogState.initialData}
            />
        </div>
    );
};

export default OptionList;