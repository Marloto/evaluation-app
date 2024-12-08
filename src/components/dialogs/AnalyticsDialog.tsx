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
    // Calculate total achieved percentage
    const calculateTotalPercentage = () => {
        let totalAchieved = 0;
        let totalPossible = 0;

        Object.entries(sections).forEach(([sectionKey, section]) => {
            Object.entries(section.criteria)
                .filter(([, criterion]) => !criterion.excludeFromTotal)
                .forEach(([criterionKey, criterion]) => {
                    const maxScore = 5 * criterion.weight * section.weight;
                    const score = sectionScores[sectionKey]?.criteria[criterionKey]?.score ?? 0;
                    const achieved = score * criterion.weight * section.weight;

                    totalAchieved += achieved;
                    totalPossible += maxScore;
                });
        });

        return (totalAchieved / totalPossible) * 100;
    };

    const prepareDonutData = () => {
        let totalAchieved = 0;
        const sectionData: { name: string; value: number; color: string }[] = [];

        Object.entries(sections).forEach(([sectionKey, section]) => {
            // Calculate actual achieved score for this section
            const achievedScore = Object.entries(section.criteria)
                .filter(([, criterion]) => !criterion.excludeFromTotal)
                .reduce((acc, [criterionKey, criterion]) => {
                    const score = sectionScores[sectionKey]?.criteria[criterionKey]?.score ?? 0;
                    return acc + (score * criterion.weight);
                }, 0) * section.weight;

            if (achievedScore > 0) {
                sectionData.push({
                    name: section.title,
                    value: achievedScore,
                    color: SECTION_COLORS[sectionKey] || '#64748b' // default color if not defined
                });
                totalAchieved += achievedScore;
            }
        });

        // Add remaining (not achieved) portion if any
        const totalPossible = Object.values(sections)
            .reduce((acc, section) => acc + (5 * section.weight), 0);

        const remaining = totalPossible - totalAchieved;
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
    const totalPercentage = calculateTotalPercentage();

    const renderSectionBar = (section: Section, sectionKey: string) => {
        // Filter out excluded criteria
        const relevantCriteria = Object.entries(section.criteria)
            .filter(([, criterion]) => !criterion.excludeFromTotal);

        // Calculate total weight for this section
        const totalWeight = relevantCriteria
            .reduce((sum, [, criterion]) => sum + criterion.weight, 0);

        // Calculate total achieved percentage
        const achievedPercentage = relevantCriteria.reduce((acc, [criterionKey, criterion]) => {
            const score = sectionScores[sectionKey]?.criteria[criterionKey]?.score ?? 0;
            return acc + ((score / 5) * (criterion.weight / totalWeight) * 100);
        }, 0);

        return (
            <div key={sectionKey} className="space-y-2">
                <div className="flex justify-between text-sm">
                    <span>{section.title}</span>
                    <div className="flex items-center gap-2">
                        <StarRating
                            score={achievedPercentage / 100 * (5)}
                            size="sm"
                            showEmpty={false}
                        />
                        <span className="text-gray-500">
                            {(achievedPercentage / 100 * (5)).toFixed(1)}
                        </span>
                    </div>
                </div>
                <div className="h-6 bg-gray-200 rounded-full overflow-hidden flex relative">
                    {/* Achieved scores */}
                    {relevantCriteria.map(([criterionKey, criterion]) => {
                        const score = sectionScores[sectionKey]?.criteria[criterionKey]?.score ?? 0;
                        if (score === 0) return null; // Don't render if no score

                        const width = (criterion.weight / totalWeight) * 100;
                        return (
                            <div
                                key={criterionKey}
                                className="h-full relative"
                                style={{
                                    width: `${width}%`,
                                    backgroundColor: SCORE_COLORS[score]
                                }}
                                title={`${criterion.title}: ${score} (Weight: ${criterion.weight})`}
                            >
                                {/* Subtle border between criteria */}
                                <div className="absolute right-0 top-0 w-px h-full bg-white opacity-50" />
                            </div>
                        );
                    })}

                    {/* Remaining (not achieved) portion */}
                    {achievedPercentage < 100 && (
                        <div
                            className="h-full absolute right-0 top-0"
                            style={{
                                width: `${100 - achievedPercentage}%`,
                                backgroundColor: SCORE_COLORS[0]
                            }}
                            title="Nicht erreichte Punkte"
                        />
                    )}
                </div>
                {/* Legend */}
                <div className="text-xs text-gray-500 mt-1">
                    {relevantCriteria
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
                                        <span className="text-gray-300">(max. {(criterion.weight / totalWeight * 100).toFixed(1)}% | Score: {score} / 5)</span>
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