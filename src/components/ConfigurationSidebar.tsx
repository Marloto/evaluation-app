import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X } from "lucide-react";
import { useConfig } from './ConfigProvider';
import { cn } from "@/lib/utils";
import { SectionList } from './SectionItem';

interface ConfigurationSidebarProps {
    isOpen: boolean;
    onToggle: () => void;
}

export const ConfigurationSidebar: React.FC<ConfigurationSidebarProps> = ({
    isOpen,
    onToggle
}) => {
    const { config } = useConfig();
    const [expandedSection, setExpandedSection] = useState<string | null>(null);
    const [expandedCriterion, setExpandedCriterion] = useState<string | null>(null);

    return (
        <>
            {/* Backdrop */}
            <div
                className={cn(
                    "fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300",
                    isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
                )}
                onClick={onToggle}
                aria-hidden="true"
            />

            {/* Sidebar Panel */}
            <div
                className={cn(
                    "fixed right-0 top-0 h-screen bg-white shadow-xl transition-transform duration-300 ease-in-out",
                    isOpen ? "translate-x-0" : "translate-x-full",
                    "w-[600px] z-50"
                )}
            >
                <div className="h-full flex flex-col">
                    {/* Header */}
                    <div className="p-6 border-b flex items-center justify-between bg-gray-50">
                        <h2 className="text-xl font-semibold">Configuration</h2>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onToggle}
                            className="hover:bg-gray-200"
                        >
                            <X className="h-5 w-5" />
                        </Button>
                    </div>

                    {/* Content */}
                    <ScrollArea className="flex-1 p-6">
                        <div className="space-y-6">
                            <SectionList 
                                sections={config.sections}
                                expandedSection={expandedSection}
                                expandedCriterion={expandedCriterion}
                                onExpandSection={setExpandedSection}
                                onExpandCriterion={setExpandedCriterion}
                            />
                        </div>
                    </ScrollArea>
                </div>
            </div>
        </>
    );
};

export default ConfigurationSidebar;