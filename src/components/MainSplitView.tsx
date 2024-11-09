"use client"

import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from "@/components/ui/button";
import { Settings, RotateCcw } from 'lucide-react';
import { useConfig } from './ConfigProvider';
import { EvaluationStateProvider, useEvaluationState } from './EvaluationStateProvider';
import Criterion from './Criterion';
import ConfigurationSidebar from './ConfigurationSidebar';
import EvaluationNavigation from './EvaluationNavigation';
import { ScrollArea } from "@/components/ui/scroll-area";
import { PenSquare } from 'lucide-react';
import { Textarea } from "@/components/ui/textarea";
import ResetConfirmDialog from './dialogs/ResetConfirmDialog';

const EvaluationContent = () => {
    const { config } = useConfig();
    const {
        state,
        updateCriterion,
        updatePreamble,
        setActiveSection,
        resetAll
    } = useEvaluationState();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [editingPreamble, setEditingPreamble] = useState<string | null>(null);
    const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);

    // Calculate validation state for each section
    const sectionValidation = useMemo(() => {
        const validation: Record<string, {
            complete: boolean,
            totalCriteria: number,
            completedCriteria: number,
            sectionScore: number
        }> = {};

        Object.entries(config.sections).forEach(([sectionKey, section]) => {
            const sectionState = state.sections[sectionKey];
            const criteriaCount = Object.keys(section.criteria).length;
            const completedCount = Object.values(sectionState?.criteria || {})
                .filter(criterion => criterion.score !== undefined).length;

            let sectionScore = 0;
            let totalWeight = 0;

            Object.entries(section.criteria).forEach(([criterionKey, criterion]) => {
                const score = sectionState?.criteria[criterionKey]?.score;
                if (score !== undefined) {
                    sectionScore += score * criterion.weight;
                    totalWeight += criterion.weight;
                }
            });

            validation[sectionKey] = {
                complete: criteriaCount === completedCount,
                totalCriteria: criteriaCount,
                completedCriteria: completedCount,
                sectionScore: totalWeight > 0 ? Number((sectionScore / totalWeight).toFixed(2)) : 0
            };
        });

        return validation;
    }, [state.sections, config]);

    const handleCriterionUpdate = (sectionKey: string, criterionKey: string, update: {
        score?: number;
        customText?: string;
    }) => {
        updateCriterion(sectionKey, criterionKey, update);
    };

    const handlePreambleUpdate = (sectionKey: string, preamble: string) => {
        updatePreamble(sectionKey, preamble);
        setEditingPreamble(null);
    };

    const generateSectionText = (sectionKey: string, section: any) => {
        const sectionState = state.sections[sectionKey];
        const preamble = sectionState?.preamble?.trim();

        const selectedTexts = Object.entries(section.criteria)
            .map(([criterionKey, criterion]: [string, any]) => {
                const criterionState = sectionState?.criteria[criterionKey];
                return criterionState?.score !== undefined ?
                    (criterionState.customText || criterion.options.find((opt: any) => opt.score === criterionState.score)?.text || "") :
                    null;
            })
            .filter(text => text !== null);

        const generatedText = selectedTexts.join(". ") + (selectedTexts.length > 0 ? "." : "");
        return preamble ? `${preamble}${generatedText ? ' ' + generatedText : ''}` : generatedText;
    };

    // Generate text for all sections
    const generatedTexts = useMemo(() => {
        const texts: Record<string, string> = {};
        Object.entries(config.sections).forEach(([sectionKey, section]) => {
            texts[sectionKey] = generateSectionText(sectionKey, section);
        });
        return texts;
    }, [state.sections, config]);

    const calculateGrade = () => {
        let totalScore = 0;
        let totalWeight = 0;

        Object.entries(config.sections).forEach(([sectionKey, section]) => {
            const sectionState = state.sections[sectionKey];

            Object.entries(section.criteria).forEach(([criterionKey, criterion]) => {
                const score = sectionState?.criteria[criterionKey]?.score;
                if (score !== undefined) {
                    totalScore += score * criterion.weight * section.weight;
                    totalWeight += criterion.weight * section.weight;
                }
            });
        });

        return totalWeight > 0 ? (totalScore / totalWeight).toFixed(1) : "N/A";
    };

    const renderSection = (sectionKey: string, section: any) => (
        <div key={sectionKey} className="border-t p-4">
            <div className="flex justify-between items-center mb-4">
                <div className="space-y-1">
                    <h3 className="text-lg font-semibold">{section.title}</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span>Progress: {sectionValidation[sectionKey].completedCriteria}/{sectionValidation[sectionKey].totalCriteria}</span>
                        <span>|</span>
                        <span>Section Score: {sectionValidation[sectionKey].sectionScore}</span>
                    </div>
                </div>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingPreamble(sectionKey)}
                >
                    <PenSquare className="h-4 w-4" />
                </Button>
            </div>

            {editingPreamble === sectionKey ? (
                <div className="mb-4">
                    <Textarea
                        value={state.sections[sectionKey]?.preamble || ''}
                        onChange={(e) => handlePreambleUpdate(sectionKey, e.target.value)}
                        placeholder="Enter a preamble for this section..."
                        className="min-h-[100px]"
                    />
                </div>
            ) : state.sections[sectionKey]?.preamble && (
                <div className="mb-4 p-3 bg-gray-50 rounded-md">
                    {state.sections[sectionKey].preamble}
                </div>
            )}

            {Object.entries(section.criteria).map(([criterionKey, criterion]: [string, any]) => (
                <Criterion
                    key={criterionKey}
                    title={criterion.title}
                    options={criterion.options}
                    value={state.sections[sectionKey]?.criteria[criterionKey]?.score}
                    customText={state.sections[sectionKey]?.criteria[criterionKey]?.customText}
                    onUpdate={(update) => handleCriterionUpdate(sectionKey, criterionKey, update)}
                />
            ))}

            <div className="mt-4 p-4 bg-gray-50 rounded-md">
                <h4 className="font-medium mb-2">Section Text</h4>
                <p className="text-sm">
                    {generateSectionText(sectionKey, section) || "No criteria selected yet."}
                </p>
            </div>
        </div>
    );

    return (
        <div className="relative min-h-screen bg-gray-50">
            <div className="max-w-[1400px] mx-auto p-4">
                <div className="flex gap-6">
                    <div className="w-72">
                        <EvaluationNavigation
                            sections={config.sections}
                            validation={sectionValidation}
                            activeSection={state.activeSection}
                            onSectionSelect={setActiveSection}
                            finalGrade={calculateGrade()}
                            generatedTexts={generatedTexts}
                        />
                    </div>

                    <div className="flex-1">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle>Select Criterions</CardTitle>
                                <div className="flex items-center space-x-2">
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => setIsResetDialogOpen(true)}
                                    >
                                        <RotateCcw className="h-4 w-4 mr-2" />
                                        Reset
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setIsSidebarOpen(true)}
                                    >
                                        <Settings className="h-4 w-4 mr-2" />
                                        Settings
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <ScrollArea className="h-[calc(100vh-150px)]">
                                    <div className="space-y-6 pr-4">
                                        {state.activeSection && config.sections[state.activeSection] &&
                                            renderSection(state.activeSection, config.sections[state.activeSection])}
                                    </div>
                                </ScrollArea>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            <ConfigurationSidebar
                isOpen={isSidebarOpen}
                onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
            />

            <ResetConfirmDialog 
              isOpen={isResetDialogOpen}
              onClose={() => setIsResetDialogOpen(false)}
              onConfirm={() => {
                resetAll();
                setIsResetDialogOpen(false);
              }}
            />
        </div>
    );
};

export const MainSplitView = () => {
    const { config } = useConfig();

    return (
        <EvaluationStateProvider sections={config.sections}>
            <EvaluationContent />
        </EvaluationStateProvider>
    );
};

export default MainSplitView;
