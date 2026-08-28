"use client"

import React, { useState } from 'react';
import { cn } from "@/lib/utils/misc";

interface PurposeNoteProps {
    text?: string;
    className?: string;
    /** Longer texts get collapsed behind a "show more" toggle. */
    collapseAfter?: number;
}

/**
 * Muted description of a section or criterion, shown below its heading.
 */
export const PurposeNote: React.FC<PurposeNoteProps> = ({
    text,
    className,
    collapseAfter = 140,
}) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const trimmed = text?.trim();

    if (!trimmed) return null;

    const isCollapsible = trimmed.length > collapseAfter;
    const showFull = isExpanded || !isCollapsible;

    return (
        <div className={cn('text-sm text-gray-500', className)}>
            <p className={showFull ? undefined : 'line-clamp-2'}>{trimmed}</p>
            {isCollapsible && (
                <button
                    type="button"
                    onClick={() => setIsExpanded(prev => !prev)}
                    className="mt-1 text-xs text-gray-400 hover:text-gray-600 transition-colors"
                >
                    {isExpanded ? 'show less' : 'show more'}
                </button>
            )}
        </div>
    );
};

export default PurposeNote;
