"use client"

import React from 'react';
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles } from 'lucide-react';
import { cn } from "@/lib/utils/misc";

interface AiButtonProps {
    onClick: () => void;
    label?: string;
    title?: string;
    isLoading?: boolean;
    disabled?: boolean;
    variant?: 'ghost' | 'outline';
    size?: 'sm' | 'default';
    className?: string;
}

/**
 * Shared entry point for every AI action. Stays enabled without an API key -
 * the dialog then explains what is missing instead of leaving a dead button.
 */
export const AiButton: React.FC<AiButtonProps> = ({
    onClick,
    label,
    title = 'Generate with AI',
    isLoading = false,
    disabled = false,
    variant = 'ghost',
    size = 'sm',
    className,
}) => (
    <Button
        variant={variant}
        size={size}
        onClick={onClick}
        disabled={disabled || isLoading}
        title={title}
        className={cn('text-purple-600 hover:text-purple-700 hover:bg-purple-50', className)}
    >
        {isLoading ? (
            <Loader2 className={cn('h-4 w-4 animate-spin', label && 'mr-2')} />
        ) : (
            <Sparkles className={cn('h-4 w-4', label && 'mr-2')} />
        )}
        {label}
    </Button>
);

export default AiButton;
