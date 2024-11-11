import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Plus, Trash2 } from "lucide-react";
import { GradeThreshold } from '@/types';
import { ScrollArea } from "@/components/ui/scroll-area";

interface GradeConfigDialogProps {
    isOpen: boolean;
    onClose: () => void;
    thresholds: GradeThreshold[];
    onSave: (thresholds: GradeThreshold[]) => void;
}

export const GradeConfigDialog: React.FC<GradeConfigDialogProps> = ({
    isOpen,
    onClose,
    thresholds: initialThresholds,
    onSave,
}) => {
    const [thresholds, setThresholds] = useState<GradeThreshold[]>(() =>
        // Kopiere die Thresholds und sortiere sie absteigend nach minPercentage
        [...initialThresholds].sort((a, b) => b.minPercentage - a.minPercentage)
    );

    // Hilfsfunktion zum Aktualisieren eines Threshold
    const updateThreshold = (index: number, field: keyof Omit<GradeThreshold, 'color' | 'bgColor'>, value: string) => {
        const newThresholds = [...thresholds];
        const threshold = { ...newThresholds[index] };

        if (field === 'minPercentage') {
            threshold[field] = Math.min(100, Math.max(0, parseFloat(value) || 0));
        } else {
            threshold[field] = value;
        }

        newThresholds[index] = threshold;
        setThresholds(newThresholds);
    };

    // Neue leere Schwelle hinzufügen
    const addThreshold = () => {
        const defaultColor = '#166534'; // Standardfarbe (grün)
        const defaultBgColor = '#dcfce7'; // Standardhintergrund (hellgrün)

        setThresholds([
            ...thresholds,
            {
                grade: '',
                text: '',
                minPercentage: 0,
                color: defaultColor,
                bgColor: defaultBgColor
            }
        ]);
    };

    // Schwelle löschen
    const removeThreshold = (index: number) => {
        setThresholds(thresholds.filter((_, i) => i !== index));
    };

    // Speichern mit Sortierung
    const handleSave = () => {
        // Sortiere Thresholds absteigend nach minPercentage
        const sortedThresholds = [...thresholds]
            .sort((a, b) => b.minPercentage - a.minPercentage)
            // Aktualisiere Farben basierend auf der Position
            .map((threshold, index) => {
                let color, bgColor;
                if (index <= 1) { // 1,0 - 1,3
                    color = '#166534';
                    bgColor = '#dcfce7';
                } else if (index <= 3) { // 1,7 - 2,0
                    color = '#15803d';
                    bgColor = '#dcfce7';
                } else if (index <= 5) { // 2,3 - 2,7
                    color = '#3f6212';
                    bgColor = '#ecfccb';
                } else if (index <= 7) { // 3,0 - 3,3
                    color = '#854d0e';
                    bgColor = '#fefce8';
                } else if (index <= 9) { // 3,7 - 4,0
                    color = '#9a3412';
                    bgColor = '#fff7ed';
                } else { // 5,0
                    color = '#991b1b';
                    bgColor = '#fef2f2';
                }
                return { ...threshold, color, bgColor };
            });

        onSave(sortedThresholds);
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl">
                <DialogHeader>
                    <DialogTitle>Configure Grade Thresholds</DialogTitle>
                </DialogHeader>
                <div className="relative max-h-[60vh]">
                    <ScrollArea className="h-full w-full rounded-md border">
                        <div className="p-4">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Grade</TableHead>
                                        <TableHead>Description</TableHead>
                                        <TableHead>Min. Percentage</TableHead>
                                        <TableHead className="w-[50px]"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {thresholds.map((threshold, index) => (
                                        <TableRow key={index}>
                                            <TableCell>
                                                <Input
                                                    value={threshold.grade}
                                                    onChange={(e) => updateThreshold(index, 'grade', e.target.value)}
                                                    placeholder="1,0"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Input
                                                    value={threshold.text}
                                                    onChange={(e) => updateThreshold(index, 'text', e.target.value)}
                                                    placeholder="Very Good"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    max="100"
                                                    value={threshold.minPercentage}
                                                    onChange={(e) => updateThreshold(index, 'minPercentage', e.target.value)}
                                                    placeholder="95"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => removeThreshold(index)}
                                                    disabled={thresholds.length <= 1}
                                                >
                                                    <Trash2 className="h-4 w-4 text-red-500" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>

                            <Button
                                onClick={addThreshold}
                                variant="outline"
                                className="w-full"
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Add Threshold
                            </Button>
                        </div>
                    </ScrollArea>
                </div>

                <DialogFooter>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onClose}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        onClick={handleSave}
                    >
                        Save Changes
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default GradeConfigDialog;