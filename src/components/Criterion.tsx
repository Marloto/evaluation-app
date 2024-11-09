"use client"

import React, { useState } from 'react';
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ChevronDown, ChevronRight, PenSquare, RotateCcw, Check } from 'lucide-react'
import { Option } from '@/types'

interface CriterionProps {
  title: string;
  options: Option[];
  value?: number;
  customText?: string;
  onUpdate: (update: {
    score?: number;
    customText?: string;
  }) => void;
}

const Criterion = ({
  title,
  options,
  value,
  customText,
  onUpdate
}: CriterionProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [tempCustomText, setTempCustomText] = useState(customText || '');
  
  const hasValue = value !== undefined;
  const selectedOption = options.find(opt => opt.score === value);

  const handleOptionSelect = (score: number) => {
    const option = options.find(opt => opt.score === score);
    onUpdate({ 
      score,
      customText: option?.text || ''
    });
    setTempCustomText(option?.text || '');
  };

  const handleSaveCustomText = () => {
    onUpdate({ customText: tempCustomText });
    setIsEditing(false);
  };

  const handleResetText = () => {
    const defaultText = selectedOption?.text || '';
    setTempCustomText(defaultText);
    onUpdate({ customText: defaultText });
    setIsEditing(false);
  };

  return (
    <Card className={`mb-4 ${hasValue ? 'ring-1 ring-green-500' : ''}`}>
      <div className="p-4">
        {/* Header Section */}
        <button 
          className="w-full flex items-center justify-between hover:text-green-600 transition-colors"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center gap-2">
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
            <span className="font-medium">{title}</span>
          </div>
          {hasValue && (
            <span className="text-sm text-gray-500">
              Score: {value}
            </span>
          )}
        </button>

        {/* Expanded Content */}
        {isExpanded && (
          <div className="mt-4 space-y-4">
            {/* Selected Option Preview */}
            {hasValue && !isEditing && (
              <div className="relative group">
                <div className="p-3 bg-gray-50 rounded-md min-h-[60px]">
                  {customText || selectedOption?.text}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => {
                    setIsEditing(true);
                    setTempCustomText(customText || selectedOption?.text || '');
                  }}
                >
                  <PenSquare className="h-4 w-4" />
                </Button>
              </div>
            )}

            {/* Edit Mode */}
            {isEditing && (
              <div className="space-y-2">
                <Textarea
                  value={tempCustomText}
                  onChange={(e) => setTempCustomText(e.target.value)}
                  className="min-h-[100px]"
                />
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleResetText}
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Reset
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSaveCustomText}
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                </div>
              </div>
            )}

            {/* Available Options */}
            <div className="space-y-2">
              {options.map((option) => (
                <button
                  key={option.score}
                  onClick={() => handleOptionSelect(option.score)}
                  className={`w-full p-4 rounded-md text-left transition-colors hover:bg-gray-50 ${
                    option.score === value
                      ? 'bg-green-50 text-green-700 ring-1 ring-green-500'
                      : 'bg-white border'
                  }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-medium">Score {option.score}</span>
                    {option.score === value && (
                      <Check className="h-4 w-4 text-green-600" />
                    )}
                  </div>
                  <p className="text-sm text-gray-600">{option.text}</p>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default Criterion;