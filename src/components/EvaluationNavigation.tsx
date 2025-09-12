"use client"

import React, { useMemo, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Loader2,
  FileText,
  BarChart2,
  ClipboardList,
  StickyNote
} from 'lucide-react';
import { cn } from "@/lib/utils/misc";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Section } from '@/lib/types/types';
import AnalyticsDialog from './dialogs/AnalyticsDialog';
import StarRating from './StarRating';
import { calculateSectionProgress, calculateTotalProgress, calculateNormalizedSectionScore } from '@/lib/utils/calculation';
import CriteriaOverview from './dialogs/CriteriaOverview';
import NotesDialog from './dialogs/NotesDialog';
import EditableTextDialog from './dialogs/EditableTextDialog';


interface NavigationProps {
  sections: Record<string, Section>;
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
  activeSection: string | null;
  onSectionSelect: (sectionKey: string) => void;
}

const EvaluationNavigation: React.FC<NavigationProps> = ({
  sections,
  evaluationState,
  activeSection,
  onSectionSelect,
}) => {
  const [showCompleteText, setShowCompleteText] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showCriteriaOverview, setShowCriteriaOverview] = useState(false);
  const [showNotes, setShowNotes] = useState(false);

  // Calculate total score using normalized section scores (properly handles bonus)
  const score = useMemo(() => {
    return Object.entries(sections).reduce((sum, [sectionKey, section]) => {
      const normalizedScore = calculateNormalizedSectionScore(section, evaluationState.sections[sectionKey]);
      return sum + (normalizedScore * section.weight);
    }, 0);
  }, [sections, evaluationState]);
  
  const { completedCriteria, totalRequiredCriteria, percentage } = useMemo(() =>
    calculateTotalProgress(sections, evaluationState),
    [sections, evaluationState]
  );


  return (
    <div className="space-y-4">
      {/* Final Grade Card */}
      <Card className="p-4 bg-green-50">
        <div className="text-center">
          <h3 className="font-medium text-green-800">Current Rating</h3>
          <div className="text-3xl font-bold text-green-700 mt-1 flex justify-center">
            <StarRating
              score={score}
              size="lg"
              showEmpty={true}
            />
          </div>
        </div>
      </Card>

      {/* Notes Section */}
      <div className="space-y-2">
        <Button
            className="w-full"
            variant="outline"
            onClick={() => setShowNotes(true)}
        >
            <StickyNote className="h-4 w-4 mr-2" />
            Notes
        </Button>
      </div>

      {/* Progress and Sections */}
      <Card className="p-4">
        {/* Overall Progress */}
        <div className="mb-4">
          <h3 className="font-medium mb-2">Overall Progress</h3>
          <div className="relative w-full h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={cn(
                "absolute left-0 top-0 h-full transition-all duration-300 rounded-full",
                percentage === 100 ? "bg-green-500" : "bg-blue-500"
              )}
              style={{ width: `${percentage}%` }}
            />
          </div>
          <div className="mt-1 text-sm text-gray-500 flex justify-between">
            <span>{percentage}% Complete</span>
            <span>{completedCriteria}/{totalRequiredCriteria} Criteria</span>
          </div>
        </div>

        {/* Sections Navigation */}
        <ScrollArea className="h-[calc(100vh-480px)]">
          <div className="space-y-2">
            {Object.entries(sections).map(([sectionKey, section]) => {
              const { completedCriteria: sectionCompletedCriteria, totalRequiredCriteria: sectionTotalCriteria } = 
                calculateSectionProgress(section, evaluationState.sections[sectionKey]);
              
              // Calculate normalized display score (0-5 based on weighted contribution capped at 100%)
              const normalizedScore = calculateNormalizedSectionScore(section, evaluationState.sections[sectionKey]);
              
              const isComplete = sectionCompletedCriteria === sectionTotalCriteria;
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
                    ) : sectionTotalCriteria > 0 ? (
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
                      {normalizedScore > 0 &&
                        `${normalizedScore.toFixed(1)}`
                      }
                    </span>
                    <span className="text-xs text-gray-400">
                      {sectionCompletedCriteria}/{sectionTotalCriteria}
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
                        width: `${(sectionCompletedCriteria / sectionTotalCriteria) * 100}%`
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
          onClick={() => setShowCompleteText(true)}
        >
          <FileText className="h-4 w-4 mr-2" />
          Complete Text
        </Button>

        <Button
          className="w-full"
          variant="outline"
          onClick={() => setShowAnalytics(true)}
        >
          <BarChart2 className="h-4 w-4 mr-2" />
          View Analytics
        </Button>

        <Button
          className="w-full"
          variant="outline"
          onClick={() => setShowCriteriaOverview(true)}
        >
          <ClipboardList className="h-4 w-4 mr-2" />
          Kriterienübersicht
        </Button>
      </div>


      {/* Analytics Dialog */}
      <AnalyticsDialog
        isOpen={showAnalytics}
        onClose={() => setShowAnalytics(false)}
        sections={sections}
        sectionScores={evaluationState.sections}
      />

      <CriteriaOverview 
        sections={sections}
        isOpen={showCriteriaOverview}
        onClose={() => setShowCriteriaOverview(false)}
      />

      <NotesDialog
          isOpen={showNotes}
          onClose={() => setShowNotes(false)}
      />

      {/* Complete Text Dialog with View/Edit modes */}
      <EditableTextDialog
        isOpen={showCompleteText}
        onClose={() => setShowCompleteText(false)}
        sections={sections}
        evaluationState={evaluationState}
      />
    </div>
  );
};

export default EvaluationNavigation;