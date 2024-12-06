"use client"

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from "@/components/ui/button";
import { Settings, RotateCcw, Download, Upload } from 'lucide-react';
import { useConfig } from './providers/ConfigProvider';
import { EvaluationState, EvaluationStateProvider, useEvaluationState } from './providers/EvaluationStateProvider';
import Criterion from './Criterion';
import ConfigurationSidebar from './ConfigurationSidebar';
import EvaluationNavigation from './EvaluationNavigation';
import { ScrollArea } from "@/components/ui/scroll-area";
import { PenSquare } from 'lucide-react';
import { Textarea } from "@/components/ui/textarea";
import ResetConfirmDialog from './dialogs/ResetConfirmDialog';
import { useGrades } from './GradeProvider';
import { calculateSectionScore } from '@/lib/utils/calculation';
import { generateSectionText } from '@/lib/utils/text-generation';

import { format } from 'date-fns';
import { toast } from "sonner";  // shadcn verwendet sonner für Toasts
import StarRating from './StarRating';
import { Criterion as CriterionType, EvaluationConfig, GradeConfig, Option, Section } from '@/lib/types/types';
import TemplateResetDialog from './dialogs/TemplateResetDialog';

// Typ für die gespeicherte Konfiguration
interface SavedConfiguration {
    version: string;
    timestamp: string;
    config: EvaluationConfig;
    evaluationState: EvaluationState;
    gradeConfig: GradeConfig;  // Neue Eigenschaft
}

// Helper Funktionen für den Download
const downloadJson = (data: SavedConfiguration, filename: string) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};

const EvaluationContent = () => {
    const { config, updateConfig, templates, loadTemplate } = useConfig();
    const {
        state,
        updateCriterion,
        updatePreamble,
        setActiveSection,
        resetAll,
        loadState  // Neue Funktion hinzugefügt
    } = useEvaluationState();
    const { config: gradeConfig, updateConfig: updateGradeConfig } = useGrades();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [editingPreamble, setEditingPreamble] = useState<string | null>(null);
    const [preambleTexts, setPreambleTexts] = useState<Record<string, string>>({});
    const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    // Effekt zum Initialisieren der Preamble-Texte aus dem State
    useEffect(() => {
        const initialPreambles: Record<string, string> = {};
        Object.entries(state.sections).forEach(([sectionKey, sectionState]) => {
            initialPreambles[sectionKey] = sectionState.preamble || '';
        });
        setPreambleTexts(initialPreambles);
    }, []);

    // Funktion zum Herunterladen der aktuellen Konfiguration
    const handleDownload = () => {
        const savedConfig: SavedConfiguration = {
            version: "1.0",
            timestamp: new Date().toISOString(),
            config,
            evaluationState: state,
            gradeConfig
        };

        const filename = `thesis-evaluation-${format(new Date(), 'yyyy-MM-dd-HH-mm')}.json`;
        downloadJson(savedConfig, filename);
    };

    // Funktion zum Hochladen einer Konfiguration
    const handleUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const content = e.target?.result as string;
                const savedConfig = JSON.parse(content) as SavedConfiguration;

                // Validiere die Struktur der geladenen Konfiguration
                if (!savedConfig.version || 
                    !savedConfig.config || 
                    !savedConfig.evaluationState || 
                    !savedConfig.gradeConfig) {
                    throw new Error('Invalid configuration file format');
                }

                // Typsichere Updates
                updateConfig(savedConfig.config as EvaluationConfig);
                loadState(savedConfig.evaluationState);
                updateGradeConfig(savedConfig.gradeConfig as GradeConfig);

                toast.success('Configuration loaded successfully');
            } catch (error) {
                console.error('Error loading configuration:', error);
                toast.error('Error loading configuration file');
            }
        };
        reader.readAsText(file);
    };

    // Aktualisieren Sie die handlePreambleChange-Funktion
    const handlePreambleChange = (text: string) => {
        if (editingPreamble) {
            setPreambleTexts(prev => ({
                ...prev,
                [editingPreamble]: text
            }));
        }
    };

    // Aktualisieren Sie die handlePreambleSave-Funktion
    const handlePreambleSave = (sectionKey: string) => {
        updatePreamble(sectionKey, preambleTexts[sectionKey] || '');
        setEditingPreamble(null);
    };

    // Neue Funktion zum Starten der Bearbeitung
    const startEditing = (sectionKey: string) => {
        // Initialisiere den Text mit dem bestehenden Preamble oder leerem String
        setPreambleTexts(prev => ({
            ...prev,
            [sectionKey]: state.sections[sectionKey]?.preamble || prev[sectionKey] || ''
        }));
        setEditingPreamble(sectionKey);
    };

    const handleCriterionUpdate = (sectionKey: string, criterionKey: string, update: {
        score?: number;
        customText?: string;
    }) => {
        updateCriterion(sectionKey, criterionKey, update);
    };

    const handleTemplateLoad = (templateId: string) => {
        loadTemplate(templateId);
        resetAll();
        setIsResetDialogOpen(false);
    };

    const renderSection = (sectionKey: string, section: Section) => {
        // Calculate section statistics once
        const { score: sectionScore, validCriteria, totalCriteria } = 
            calculateSectionScore(section, state.sections[sectionKey]);
        
        return (
            <div key={sectionKey} className="border-t p-4">
                <div className="flex justify-between items-center mb-4">
                    <div className="space-y-1">
                        <h3 className="text-lg font-semibold">{section.title}</h3>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            <span>Progress: {validCriteria}/{totalCriteria}</span>
                            <span>|</span>
                            <span>
                                <StarRating
                                    score={sectionScore}
                                    size="sm"
                                    showEmpty={true}
                                />
                            </span>
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => startEditing(sectionKey)}
                    >
                        <PenSquare className="h-4 w-4" />
                    </Button>
                </div>

                {editingPreamble === sectionKey ? (
                    <div className="mb-4">
                        <Textarea
                            value={preambleTexts[sectionKey] || ''}
                            onChange={(e) => handlePreambleChange(e.target.value)}
                            placeholder="Enter a preamble for this section..."
                            className="min-h-[100px]"
                        />
                        <div className="flex justify-end gap-2 mt-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setEditingPreamble(null)}
                            >
                                Cancel
                            </Button>
                            <Button
                                size="sm"
                                onClick={() => handlePreambleSave(sectionKey)}
                            >
                                Save
                            </Button>
                        </div>
                    </div>
                ) : state.sections[sectionKey]?.preamble && (
                    <div className="mb-4 p-3 bg-gray-50 rounded-md">
                        {state.sections[sectionKey].preamble}
                    </div>
                )}

                {Object.entries(section.criteria).map(([criterionKey, criterion]) => (
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
                        {generateSectionText(section, state.sections[sectionKey]) || "No criteria selected yet."}
                    </p>
                </div>
            </div>
        );
    };

    return (
        <div className="relative min-h-screen bg-gray-50">
            <div className="max-w-[1400px] mx-auto p-4">
                <div className="flex gap-6">
                    <div className="w-72">
                        <EvaluationNavigation
                            sections={config.sections}
                            activeSection={state.activeSection}
                            onSectionSelect={setActiveSection}
                            evaluationState={state}
                        />
                    </div>

                    <div className="flex-1">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle>Select Criterions</CardTitle>
                                <div className="flex items-center space-x-2">
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleUpload}
                                        accept=".json"
                                        className="hidden"
                                    />
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        <Upload className="h-4 w-4 mr-2" />
                                        Import
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleDownload}
                                    >
                                        <Download className="h-4 w-4 mr-2" />
                                        Export
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setIsSidebarOpen(true)}
                                    >
                                        <Settings className="h-4 w-4 mr-2" />
                                        Settings
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => setIsResetDialogOpen(true)}
                                    >
                                        <RotateCcw className="h-4 w-4 mr-2" />
                                        Reset
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

            <TemplateResetDialog
                isOpen={isResetDialogOpen}
                onClose={() => setIsResetDialogOpen(false)}
                onConfirm={handleTemplateLoad}
                templates={templates}
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
