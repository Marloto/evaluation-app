"use client"

import React, { useState, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Edit3, Eye } from 'lucide-react';
import { Section } from '@/lib/types/types';
import { generateEditableTextData, formatTextWithPunctuation, EditableSectionData } from '@/lib/utils/text-generation';
import { useEvaluationState } from '../providers/EvaluationStateProvider';
import { cn } from '@/lib/utils/misc';

interface EditableTextDialogProps {
  isOpen: boolean;
  onClose: () => void;
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
}

const EditableTextDialog: React.FC<EditableTextDialogProps> = ({
  isOpen,
  onClose,
  sections,
  evaluationState,
}) => {
  const { updateCriterion, updatePreamble } = useEvaluationState();
  const [focusedElement, setFocusedElement] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);

  // Generate structured data when dialog opens
  const editableData = React.useMemo(() => 
    isOpen ? generateEditableTextData(sections, evaluationState) : [],
    [sections, evaluationState, isOpen]
  );

  const handlePreambleChange = useCallback((sectionKey: string, newText: string) => {
    updatePreamble(sectionKey, newText);
  }, [updatePreamble]);

  const handleCriterionChange = useCallback((sectionKey: string, criterionKey: string, newText: string) => {
    updateCriterion(sectionKey, criterionKey, { customText: newText });
  }, [updateCriterion]);

  const handleFocus = useCallback((elementId: string) => {
    setFocusedElement(elementId);
  }, []);

  const handleBlur = useCallback(() => {
    setFocusedElement(null);
  }, []);

  const toggleEditMode = useCallback(() => {
    setIsEditMode(prev => !prev);
    setFocusedElement(null); // Clear focus when switching modes
  }, []);

  // Reset to view mode when modal closes
  const handleClose = useCallback(() => {
    setIsEditMode(false);
    setFocusedElement(null);
    onClose();
  }, [onClose]);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Edit Complete Text" : "Complete Evaluation Text"}
          </DialogTitle>
        </DialogHeader>

        <div className="px-6 pb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={toggleEditMode}
            className="w-full"
          >
            {isEditMode ? (
              <>
                <Eye className="h-4 w-4 mr-2" />
                View Mode
              </>
            ) : (
              <>
                <Edit3 className="h-4 w-4 mr-2" />
                Edit Mode
              </>
            )}
          </Button>
        </div>

        {isEditMode && (
          <div className="px-6">
            <div className="p-3 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-sm mb-2">Edit Mode - Usage Tips:</h4>
              <ul className="text-xs text-gray-600 space-y-1">
                <li>• <span className="text-blue-600">Blue dashed borders</span> = Section preambles</li>
                <li>• <span className="text-green-600">Green dashed borders</span> = Individual criterion texts</li>
                <li>• Click any text to edit directly with spell check</li>
                <li>• Changes save automatically when you click away</li>
              </ul>
            </div>
          </div>
        )}
        
        <div className="space-y-6 p-4">
          {editableData.map((sectionData: EditableSectionData) => (
            <div key={sectionData.sectionKey} className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
                {sectionData.title}
              </h3>
              
              <div className="text-gray-700 leading-relaxed">
                {/* Continuous paragraph with editable spans */}
                <p className="text-base">
                  {/* Preamble - conditionally editable */}
                  {sectionData.preamble !== undefined && (
                    <>
                      <span
                        contentEditable={isEditMode}
                        suppressContentEditableWarning
                        data-section-key={sectionData.sectionKey}
                        className={cn(
                          "rounded transition-all duration-200",
                          isEditMode && [
                            "underline decoration-dashed decoration-2 decoration-blue-400 cursor-text",
                            "hover:bg-blue-50 focus:bg-blue-50 focus:decoration-blue-600 focus:outline-none",
                            focusedElement && focusedElement !== `preamble-${sectionData.sectionKey}` && "opacity-50"
                          ],
                          !isEditMode && "border-none"
                        )}
                        title={isEditMode ? "Section Preamble (click to edit)" : "Section Preamble"}
                        onFocus={isEditMode ? () => handleFocus(`preamble-${sectionData.sectionKey}`) : undefined}
                        onBlur={isEditMode ? (e) => {
                          handleBlur();
                          handlePreambleChange(sectionData.sectionKey, e.currentTarget.textContent || '');
                        } : undefined}
                      >
                        {sectionData.preamble}
                      </span>
                      {sectionData.criteria.length > 0 && " "}
                    </>
                  )}

                  {/* Criteria - conditionally editable */}
                  {sectionData.criteria.map((criterion, index) => (
                    <React.Fragment key={`${criterion.sectionKey}-${criterion.criterionKey}`}>
                      <span
                        contentEditable={isEditMode}
                        suppressContentEditableWarning
                        data-section-key={criterion.sectionKey}
                        data-criterion-key={criterion.criterionKey}
                        className={cn(
                          "rounded transition-all duration-200",
                          isEditMode && [
                            "underline decoration-dashed decoration-2 decoration-green-300 cursor-text",
                            "hover:bg-green-50 focus:bg-green-50 focus:decoration-green-500 focus:outline-none",
                            focusedElement && focusedElement !== `criterion-${criterion.sectionKey}-${criterion.criterionKey}` && "opacity-50"
                          ],
                          !isEditMode && "border-none"
                        )}
                        title={isEditMode ? `${criterion.title} (click to edit)` : criterion.title}
                        onFocus={isEditMode ? () => handleFocus(`criterion-${criterion.sectionKey}-${criterion.criterionKey}`) : undefined}
                        onBlur={isEditMode ? (e) => {
                          handleBlur();
                          const newText = e.currentTarget.textContent || '';
                          handleCriterionChange(criterion.sectionKey, criterion.criterionKey, formatTextWithPunctuation(newText));
                        } : undefined}
                      >
                        {formatTextWithPunctuation(criterion.text)}
                      </span>
                      {index < sectionData.criteria.length - 1 && " "}
                    </React.Fragment>
                  ))}
                </p>
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditableTextDialog;