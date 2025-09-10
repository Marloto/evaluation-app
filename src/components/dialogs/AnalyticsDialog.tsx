"use client"

import React from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Tooltip,
    Legend
} from 'recharts';
import { Section } from '@/lib/types/types';
import StarRating from '../StarRating';
import { useGrades } from '../providers/GradeProvider';
import { calculateNormalizedSectionScore } from '@/lib/utils/calculation';

const GradeDisplay = ({ percentage }: { percentage: number }) => {
    const { calculateGrade } = useGrades();
    const gradeInfo = calculateGrade(percentage);

    return (
        <div
            className="bg-white p-6 rounded-lg shadow transition-colors"
            style={{ backgroundColor: gradeInfo.bgColor }}
        >
            <h3 className="font-semibold mb-6">Grade</h3>
            <div className="space-y-4">
                {/* Main grade display */}
                <div className="text-center">
                    <div
                        className="text-5xl font-bold mb-2 transition-colors"
                        style={{ color: gradeInfo.color }}
                    >
                        {gradeInfo.grade}
                    </div>
                    <div
                        className="text-2xl font-medium transition-colors"
                        style={{ color: gradeInfo.color }}
                    >
                        {gradeInfo.text}
                    </div>
                </div>

                {/* Percentage and scale */}
                <div className="text-center text-gray-600">
                    <div className="text-lg">
                        {percentage.toFixed(1)}%
                    </div>
                    <div className="text-sm mt-1">
                        Rating Achieved
                    </div>
                </div>

                {/* Grade scale legend */}
                <div className="pt-4 border-t border-gray-200">
                    <div className="text-sm text-gray-500 mb-2">Grading Scale:</div>
                    <GradeScaleLegend />
                </div>
            </div>
        </div>
    );
};

// Neue Komponente für die Notenlegend
const GradeScaleLegend = () => {
    const { config } = useGrades();

    // Filtere unique Textbeschreibungen
    const uniqueGrades = config.thresholds.filter((threshold, index, self) =>
        index === self.findIndex((t) => t.text === threshold.text)
    );

    return (
        <div className="flex flex-col space-y-2 text-sm">
            {uniqueGrades.map(grade => {
                // Finde die minimale Prozentzahl für diese Notenbeschreibung
                const minPercentage = config.thresholds
                    .filter(t => t.text === grade.text)
                    .reduce((min, current) => Math.min(min, current.minPercentage), Infinity);

                return (
                    <div
                        key={grade.text}
                        className="flex items-center gap-2"
                    >
                        <div
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: grade.color }}
                        />
                        <span>{grade.text}</span>
                        <span className="text-gray-400">(min. {minPercentage}%)</span>
                    </div>
                );
            })}
        </div>
    );
};

const SCORE_COLORS: Record<number, string> = {
    5: '#22c55e', // green-500
    4: '#84cc16', // lime-500
    3: '#facc15', // yellow-500
    2: '#f97316', // orange-500
    1: '#ef4444', // red-500
    0: '#e5e7eb'  // gray-200
};

// Single blue color for all bonus criteria (since all bonus is good)
const BONUS_COLOR = '#3b82f6'; // blue-500

// Define section colors
const SECTION_COLORS: Record<string, string> = {
    preface: '#0ea5e9',    // sky-500
    form: '#8b5cf6',       // violet-500
    structure: '#ec4899',  // pink-500
    content: '#f59e0b'     // amber-500
};

// Repräsentiert den Score-Zustand eines einzelnen Kriteriums
interface CriterionScore {
    score?: number;
    customText?: string;
}

// Repräsentiert die Scores einer kompletten Sektion
interface SectionScore {
    criteria: Record<string, CriterionScore>;
    preamble?: string;
}

interface AnalyticsDialogProps {
    isOpen: boolean;
    onClose: () => void;
    sections: Record<string, Section>;
    sectionScores: Record<string, SectionScore>;
}

const AnalyticsDialog: React.FC<AnalyticsDialogProps> = ({
    isOpen,
    onClose,
    sections,
    sectionScores
}) => {
    // Calculate total score using normalized section scores (properly handles bonus)
    const totalNormalizedScore = Object.entries(sections).reduce((sum, [sectionKey, section]) => {
        const normalizedScore = calculateNormalizedSectionScore(section, sectionScores[sectionKey]);
        return sum + (normalizedScore * section.weight);
    }, 0);
    
    // Calculate percentage based on normalized total score
    const totalPercentage = (totalNormalizedScore / 5) * 100;

    const prepareDonutData = () => {
        const sectionData: { name: string; value: number; color: string }[] = [];

        Object.entries(sections).forEach(([sectionKey, section]) => {
            // Use normalized calculation that properly handles bonus
            const normalizedScore = calculateNormalizedSectionScore(section, sectionScores[sectionKey]);
            const weightedScore = normalizedScore * section.weight;

            if (weightedScore > 0) {
                sectionData.push({
                    name: section.title,
                    value: weightedScore,
                    color: SECTION_COLORS[sectionKey] || '#64748b'
                });
            }
        });

        // Add remaining (not achieved) portion if any
        const maxPossible = 5; // Maximum score is 5
        const remaining = maxPossible - totalNormalizedScore;
        if (remaining > 0) {
            sectionData.push({
                name: 'Missed',
                value: remaining,
                color: SCORE_COLORS[0] // gray for not achieved
            });
        }

        return sectionData;
    };

    // Prepare donut chart data
    const donutData = prepareDonutData();

    const renderSectionBar = (section: Section, sectionKey: string) => {
        // Calculate normalized display score (0-5 based on weighted contribution capped at 100%)
        const normalizedScore = calculateNormalizedSectionScore(section, sectionScores[sectionKey]);
        
        // Separate regular and bonus criteria
        const regularCriteria = Object.entries(section.criteria).filter(([, c]) => !c.excludeFromTotal);
        const bonusCriteria = Object.entries(section.criteria).filter(([, c]) => c.excludeFromTotal);

        // Calculate weights for regular criteria only (base 100%)
        const regularTotalWeight = regularCriteria.reduce((sum, [, criterion]) => sum + criterion.weight, 0);

        return (
            <div key={sectionKey} className="space-y-2">
                <div className="flex justify-between text-sm">
                    <span>{section.title}</span>
                    <div className="flex items-center gap-2">
                        <StarRating
                            score={normalizedScore}
                            size="sm"
                            showEmpty={false}
                        />
                        <span className="text-gray-500">
                            {normalizedScore.toFixed(1)}
                        </span>
                    </div>
                </div>
                <div className="h-6 bg-gray-200 rounded-full overflow-hidden flex relative">
                    {/* Step 1: Regular criteria - width based on actual score achieved */}
                    {regularCriteria.map(([criterionKey, criterion]) => {
                        const score = sectionScores[sectionKey]?.criteria[criterionKey]?.score ?? 0;
                        if (score === 0) return null;

                        // Width = (score/5) * weight_percentage  
                        const maxWidth = regularTotalWeight > 0 ? (criterion.weight / regularTotalWeight) * 100 : 0;
                        const actualWidth = (score / 5) * maxWidth;
                        
                        return (
                            <div
                                key={`regular-${criterionKey}`}
                                className="h-full relative"
                                style={{
                                    width: `${actualWidth}%`,
                                    backgroundColor: SCORE_COLORS[score]
                                }}
                                title={`${criterion.title}: ${score}/5 (Achieved: ${actualWidth.toFixed(1)}% of ${maxWidth.toFixed(1)}% max)`}
                            >
                                <div className="absolute right-0 top-0 w-px h-full bg-white opacity-50" />
                            </div>
                        );
                    })}

                    {/* Step 2: Draw bonus criteria sequentially in remaining space */}
                    {(() => {
                        // Calculate how much space regular criteria actually used
                        const regularUsedPercentage = regularCriteria.reduce((acc, [criterionKey, criterion]) => {
                            const score = sectionScores[sectionKey]?.criteria[criterionKey]?.score ?? 0;
                            const maxWidth = regularTotalWeight > 0 ? (criterion.weight / regularTotalWeight) * 100 : 0;
                            const actualWidth = (score / 5) * maxWidth;
                            return acc + actualWidth;
                        }, 0);

                        let availableSpace = Math.max(0, 100 - regularUsedPercentage);
                        
                        if (availableSpace <= 0 || bonusCriteria.length === 0) {
                            return null; // No space for bonus or no bonus criteria
                        }

                        // Process each bonus criterion sequentially
                        const bonusElements = [];
                        
                        for (const [criterionKey, criterion] of bonusCriteria) {
                            const score = sectionScores[sectionKey]?.criteria[criterionKey]?.score ?? 0;
                            if (score === 0 || availableSpace <= 0) continue;

                            // Calculate max width this bonus criterion could take (bonus weight relative to regular criteria base)
                            const maxBonusWidth = regularTotalWeight > 0 ? (criterion.weight / regularTotalWeight) * 100 : 0;
                            // Actual width based on score: (score/5) * maxWidth
                            const desiredWidth = (score / 5) * maxBonusWidth;
                            
                            // Take the minimum of desired width or remaining available space
                            const actualBonusWidth = Math.min(desiredWidth, availableSpace);
                            
                            if (actualBonusWidth > 0) {
                                bonusElements.push(
                                    <div
                                        key={`bonus-${criterionKey}`}
                                        className="h-full relative"
                                        style={{
                                            width: `${actualBonusWidth}%`,
                                            backgroundColor: BONUS_COLOR
                                        }}
                                        title={`${criterion.title} (Bonus): ${score}/5 (${actualBonusWidth.toFixed(1)}% of ${maxBonusWidth.toFixed(1)}% max)`}
                                    >
                                        <div className="absolute right-0 top-0 w-px h-full bg-blue-700 opacity-30" />
                                    </div>
                                );
                                
                                // Reduce available space for next bonus
                                availableSpace -= actualBonusWidth;
                            }
                        }

                        return bonusElements.length > 0 ? bonusElements : null;
                    })()}
                </div>
                {/* Legend */}
                <div className="text-xs text-gray-500 mt-1">
                    {/* Regular criteria legend */}
                    {regularCriteria
                        .filter(([criterionKey]) =>
                            (sectionScores[sectionKey]?.criteria[criterionKey]?.score ?? 0) > 0
                        )
                        .map(([criterionKey, criterion]) => {
                            const score = sectionScores[sectionKey]?.criteria[criterionKey]?.score ?? 0;
                            return (
                                <div key={criterionKey} className="flex items-center gap-1">
                                    <div
                                        className="w-2 h-2 rounded-full"
                                        style={{ backgroundColor: SCORE_COLORS[score] }}
                                    />
                                    <span>
                                        {criterion.title + " "}
                                        <span className="text-gray-300">(Weight: {(criterion.weight / regularTotalWeight * 100).toFixed(1)}% | Score: {score}/5)</span>
                                    </span>
                                </div>
                            );
                        })}
                    
                    {/* Bonus criteria legend */}
                    {bonusCriteria
                        .filter(([criterionKey]) =>
                            (sectionScores[sectionKey]?.criteria[criterionKey]?.score ?? 0) > 0
                        )
                        .map(([criterionKey, criterion]) => {
                            const score = sectionScores[sectionKey]?.criteria[criterionKey]?.score ?? 0;
                            return (
                                <div key={criterionKey} className="flex items-center gap-1">
                                    <div
                                        className="w-2 h-2 rounded-full"
                                        style={{ backgroundColor: BONUS_COLOR }}
                                    />
                                    <span>
                                        {criterion.title + " "}
                                        <span className="text-blue-600 font-medium">(Bonus) </span>
                                        <span className="text-gray-300">(Weight: {(criterion.weight / regularTotalWeight * 100).toFixed(1)}% | Score: {score}/5)</span>
                                    </span>
                                </div>
                            );
                        })}
                </div>
            </div>
        );
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl" onOpenAutoFocus={(e) => { e.preventDefault(); }}>
                <DialogHeader>
                    <DialogTitle>Evaluation Results</DialogTitle>
                </DialogHeader>
                <ScrollArea className="max-h-[80vh]">
                    {/* Nicht-interaktiver Container als erstes Element */}
                    <div tabIndex={-1} aria-hidden="true" />

                    <div className="space-y-8 p-4">
                        {/* Top row with Gauge and Donut */}
                        <div className="grid grid-cols-2 gap-4">
                            {/* Updated Gauge Chart */}
                            <GradeDisplay percentage={totalPercentage} />

                            {/* Updated Donut Chart */}
                            <div className="bg-white p-4 rounded-lg shadow">
                                <h3 className="font-semibold mb-4">Section-wise Distribution</h3>
                                <div className="h-[350px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={donutData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={70}
                                                outerRadius={100}
                                                paddingAngle={2}
                                                dataKey="value"
                                            >
                                                {donutData.map((entry, index) => (
                                                    <Cell
                                                        key={`cell-${index}`}
                                                        fill={entry.color}
                                                    />
                                                ))}
                                            </Pie>
                                            <Tooltip
                                                formatter={(value: number) => [
                                                    `${(value / 5 * 100).toFixed(1)}%`
                                                ]}
                                            />
                                            <Legend
                                                formatter={(value) => {
                                                    const dataEntry = donutData.find(d => d.name === value);
                                                    return `${value} (${(dataEntry!.value / 5 * 100).toFixed(1)}%)`;
                                                }}
                                                layout="vertical"
                                                verticalAlign="bottom"
                                                wrapperStyle={{
                                                    paddingTop: "20px"
                                                }}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>

                        {/* Updated Section Bars */}
                        <div className="bg-white p-4 rounded-lg shadow">
                            <h3 className="font-semibold mb-4">Detailed Analysis by Section</h3>
                            <div className="space-y-6">
                                {Object.entries(sections).map(([sectionKey, section]) =>
                                    renderSectionBar(section, sectionKey)
                                )}
                            </div>
                        </div>
                    </div>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
};

export default AnalyticsDialog;