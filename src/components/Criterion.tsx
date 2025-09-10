"use client"

import React, { useState } from 'react';
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ChevronDown, ChevronRight, PenSquare, RotateCcw, Check, Star } from 'lucide-react'
import { Option } from '@/lib/types/types'
import StarRating from './StarRating';
import { Badge } from "@/components/ui/badge";

interface CriterionProps {
  title: string;
  options: Option[];
  value?: number;
  customText?: string;
  excludeFromTotal?: boolean;
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
  excludeFromTotal = false,
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

  const handleUnselect = () => {
    onUpdate({
      score: undefined,
      customText: undefined
    });
    setTempCustomText('');
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
    <Card className={`mb-4 ${hasValue ? `ring-1 ${excludeFromTotal ? 'ring-blue-500' : 'ring-green-500'}` : ''}`}>
      <div className="p-4">
        {/* Header Section */}
        <button
          className={`w-full transition-colors ${excludeFromTotal ? 'hover:text-blue-600' : 'hover:text-green-600'}`}
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {/* Erste Zeile mit Titel und Rating */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
              <span className="font-medium">{title}</span>
              {excludeFromTotal && (
                <Badge variant="secondary" className="ml-2 bg-blue-100 text-blue-800 hover:bg-blue-100">
                  <Star className="h-3 w-3 mr-1 fill-blue-500 text-blue-500" />
                  Bonus
                </Badge>
              )}
            </div>
            {hasValue && (
              <div className="flex items-center gap-2">
                <StarRating score={value} size="sm" color={excludeFromTotal ? 'blue' : 'green'} />
                <span className="text-sm text-gray-500">
                  ({value})
                </span>
              </div>
            )}
          </div>

          {/* Zweite Zeile mit Text */}
          {!isExpanded && hasValue && (
            <div className="text-sm text-gray-600 mt-2 pl-6 text-left">
              {customText || selectedOption?.text}
            </div>
          )}
        </button>

        {/* Expanded Content */}
        {isExpanded && (
          <div className="mt-4 space-y-4">
            {/* Selected Option Preview */}
            {hasValue && !isEditing && (
              <div className="relative group">
                <div className="p-3 pe-10 bg-gray-50 rounded-md min-h-[60px]">
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
              {/* Add unselect option for bonus criteria */}
              {excludeFromTotal && (
                <button
                  onClick={handleUnselect}
                  className={`w-full p-4 rounded-md text-left transition-colors hover:bg-gray-50 ${!hasValue
                    ? 'bg-gray-100 text-gray-700 ring-1 ring-gray-300'
                    : 'bg-white border'
                    }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Not Selected</span>
                      <StarRating score={0} size="sm" showEmpty={true} color={excludeFromTotal ? 'blue' : 'green'} />
                    </div>
                    {!hasValue && (
                      <Check className="h-4 w-4 text-gray-600" />
                    )}
                  </div>
                  <p className="text-sm text-gray-600">This bonus criterion is not being evaluated</p>
                </button>
              )}
              
              {options.map((option) => (
                <button
                  key={option.score}
                  onClick={() => handleOptionSelect(option.score)}
                  className={`w-full p-4 rounded-md text-left transition-colors hover:bg-gray-50 ${option.score === value
                    ? `${excludeFromTotal 
                        ? 'bg-blue-50 text-blue-700 ring-1 ring-blue-500' 
                        : 'bg-green-50 text-green-700 ring-1 ring-green-500'}`
                    : 'bg-white border'
                    }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Score {option.score}</span>
                      <StarRating score={option.score} size="sm" color={excludeFromTotal ? 'blue' : 'green'} />
                    </div>
                    {option.score === value && (
                      <Check className={`h-4 w-4 ${excludeFromTotal ? 'text-blue-600' : 'text-green-600'}`} />
                    )}
                  </div>
                  <p className="text-sm text-gray-600">{option.text}</p>
                </button>
              ))}
            </div>
            
            {/* Bonus criteria hint */}
            {excludeFromTotal && (
              <div className="text-center py-2 mb-2 rounded-md">
                <p className="text-xs text-gray-600">
                  Bonus criterion: Additional points on top of regular score (optional evaluation)
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};

export default Criterion;