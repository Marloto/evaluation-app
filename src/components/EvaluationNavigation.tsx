"use client"

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Loader2,
  FileText,
  BarChart2
} from 'lucide-react';
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Section } from '@/types';
import AnalyticsDialog from './dialogs/AnalyticsDialog';
import StarRating from './StarRating';

interface NavigationProps {
  sections: { [key: string]: Section };
  validation: {
    [key: string]: {
      complete: boolean;
      totalCriteria: number;
      completedCriteria: number;
      sectionScore: number;
    };
  };
  activeSection: string | null;
  onSectionSelect: (sectionKey: string) => void;
  finalGrade: string;
  generatedTexts: { [key: string]: string };
  evaluationState: {
    sections: {
      [key: string]: {
        preamble?: string;
        criteria: {
          [key: string]: {
            score?: number;
            customText?: string;
          };
        };
      };
    };
    activeSection: string | null;
  };
}

const EvaluationNavigation = ({
  sections,
  validation,
  activeSection,
  onSectionSelect,
  finalGrade,
  generatedTexts,
  evaluationState
}: NavigationProps) => {
  const [showFullText, setShowFullText] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);

  // Calculate total progress
  const totalProgress = Object.values(validation).reduce(
    (acc, curr) => {
      acc.completed += curr.completedCriteria;
      acc.total += curr.totalCriteria;
      return acc;
    },
    { completed: 0, total: 0 }
  );

  const progressPercentage = Math.round((totalProgress.completed / totalProgress.total) * 100);

  // Nur Analytics Dialog rendern wenn evaluationState existiert
  const canShowAnalytics = Boolean(evaluationState?.sections);

  return (
    <div className="space-y-4">
      {/* Final Grade Card */}
      <Card className="p-4 bg-green-50">
        <div className="text-center">
          <h3 className="font-medium text-green-800">Current Rating</h3>
          <div className="text-3xl font-bold text-green-700 mt-1 flex justify-center">
            <StarRating
              score={parseFloat(finalGrade)}
              size="lg"
              showEmpty={true}
            />
          </div>
        </div>
      </Card>

      {/* Progress and Sections */}
      <Card className="p-4">
        {/* Overall Progress */}
        <div className="mb-4">
          <h3 className="font-medium mb-2">Overall Progress</h3>
          <div className="relative w-full h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={cn(
                "absolute left-0 top-0 h-full transition-all duration-300 rounded-full",
                progressPercentage === 100 ? "bg-green-500" : "bg-blue-500"
              )}
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <div className="mt-1 text-sm text-gray-500 flex justify-between">
            <span>{progressPercentage}% Complete</span>
            <span>{totalProgress.completed}/{totalProgress.total} Criteria</span>
          </div>
        </div>

        {/* Sections Navigation */}
        <ScrollArea className="h-[calc(100vh-400px)]">
          <div className="space-y-2">
            {Object.entries(sections).map(([sectionKey, section]) => {
              const sectionValidation = validation[sectionKey];
              const isComplete = sectionValidation.complete;
              const isActive = activeSection === sectionKey;

              return (
                <Button
                  key={sectionKey}
                  variant={isActive ? "default" : "ghost"}
                  className={cn(
                    "w-full justify-between group relative",
                    isActive && "bg-green-50 hover:bg-green-100 text-green-900",
                    !isActive && isComplete && "bg-gray-50"
                  )}
                  onClick={() => onSectionSelect(sectionKey)}
                >
                  <div className="flex items-center gap-2">
                    {isComplete ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    ) : sectionValidation.completedCriteria > 0 ? (
                      <Loader2 className="h-4 w-4 text-blue-500" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-gray-400" />
                    )}
                    <span className={cn(
                      "text-sm",
                      isActive && "font-medium",
                      isComplete && !isActive && "text-green-600"
                    )}>
                      {section.title}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">
                      {sectionValidation.sectionScore > 0 &&
                        `${sectionValidation.sectionScore}`
                      }
                    </span>
                    <span className="text-xs text-gray-400">
                      {sectionValidation.completedCriteria}/{sectionValidation.totalCriteria}
                    </span>
                    <ChevronRight className={cn(
                      "h-4 w-4 transition-transform",
                      isActive && "transform rotate-90"
                    )} />
                  </div>

                  {/* Progress bar */}
                  <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gray-100">
                    <div
                      className={cn(
                        "h-full transition-all duration-300",
                        isComplete ? "bg-green-500" : "bg-blue-500"
                      )}
                      style={{
                        width: `${(sectionValidation.completedCriteria / sectionValidation.totalCriteria) * 100}%`
                      }}
                    />
                  </div>
                </Button>
              );
            })}
          </div>
        </ScrollArea>
      </Card>

      {/* Action Buttons */}
      <div className="space-y-2">
        <Button
          className="w-full"
          variant="outline"
          onClick={() => setShowFullText(true)}
        >
          <FileText className="h-4 w-4 mr-2" />
          View Complete Text
        </Button>

        <Button
          className="w-full"
          variant="outline"
          onClick={() => setShowAnalytics(true)}
          disabled={!canShowAnalytics}
        >
          <BarChart2 className="h-4 w-4 mr-2" />
          View Analytics
        </Button>
      </div>

      {/* Complete Text Dialog */}
      <Dialog open={showFullText} onOpenChange={setShowFullText}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-auto" onOpenAutoFocus={(e) => { e.preventDefault(); }}>
          <DialogHeader>
            <DialogTitle className="items-center">
              Complete Evaluation Text
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {Object.entries(sections).map(([sectionKey, section]) => (
              <div key={sectionKey} className="space-y-2">
                <h3>{section.title}</h3>
                <p className="text-gray-700">
                  {generatedTexts[sectionKey] || "No criteria selected yet."}
                </p>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Analytics Dialog nur rendern wenn Daten vorhanden */}
      {canShowAnalytics && (
        <AnalyticsDialog
          isOpen={showAnalytics}
          onClose={() => setShowAnalytics(false)}
          sections={sections}
          sectionScores={evaluationState.sections}
        />
      )}
    </div>
  );
};

export default EvaluationNavigation;