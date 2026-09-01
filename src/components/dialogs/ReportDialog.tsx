"use client"

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ImagePlus, Printer, Trash2 } from 'lucide-react';
import { toast } from "sonner";
import { getReportDefinition } from '@/lib/config/report-templates';
import { buildReportData } from '@/lib/utils/report-data';
import { useConfig } from '../providers/ConfigProvider';
import { useEvaluationState } from '../providers/EvaluationStateProvider';
import { useGrades } from '../providers/GradeProvider';
import ReportDocument from '../report/ReportDocument';
import {
    clearReportLogo,
    loadReportLogo,
    readLogoFile,
    saveReportLogo,
} from '../report/logo-storage';

interface ReportDialogProps {
    isOpen: boolean;
    onClose: () => void;
}

/**
 * Preview and print the Gutachten.
 *
 * Output only - which report is printed, and everything filled into its header
 * and statements, is edited in the general information.
 *
 * Printing goes through the browser's print dialog: the document is rendered a
 * second time into a portal on <body> that only the print stylesheet shows, so
 * whatever the app has open on screen does not end up on the page.
 */
export const ReportDialog: React.FC<ReportDialogProps> = ({ isOpen, onClose }) => {
    const { config } = useConfig();
    const { state } = useEvaluationState();
    const { calculateGrade } = useGrades();

    const definition = useMemo(() => getReportDefinition(config.reportType), [config.reportType]);
    const data = useMemo(
        () => buildReportData(definition, config.sections, state, calculateGrade),
        [definition, config.sections, state, calculateGrade]
    );

    // The logo is not part of the app; it is uploaded once and kept per browser.
    const [logo, setLogo] = useState<string | null>(null);
    const logoInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            setLogo(loadReportLogo());
        }
    }, [isOpen]);

    const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        // Reset right away, so picking the same file again still fires a change.
        event.target.value = '';
        if (!file) return;

        try {
            const dataUri = await readLogoFile(file);
            saveReportLogo(dataUri);
            setLogo(dataUri);
            toast.success('Logo saved');
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Logo could not be loaded');
        }
    };

    const handleLogoRemove = () => {
        clearReportLogo();
        setLogo(null);
    };

    return (
        <>
            <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
                <DialogContent className="max-w-5xl">
                    <DialogHeader>
                        <DialogTitle>Report</DialogTitle>
                        <DialogDescription>
                            {definition.name} — print to PDF from the browser dialog. Report type,
                            header fields and statements are edited in the general information.
                        </DialogDescription>
                    </DialogHeader>

                    <ScrollArea className="h-[60vh] rounded-md border">
                        <div className="report-preview">
                            <ReportDocument definition={definition} data={data} logo={logo} />
                        </div>
                    </ScrollArea>

                    <DialogFooter className="sm:justify-between">
                        <div className="flex items-center gap-2">
                            <input
                                type="file"
                                ref={logoInputRef}
                                onChange={handleLogoUpload}
                                accept="image/svg+xml,image/png,image/jpeg"
                                className="hidden"
                            />
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => logoInputRef.current?.click()}
                                title="Printed in the header of every page, stored in this browser"
                            >
                                <ImagePlus className="h-4 w-4 mr-2" />
                                {logo ? 'Replace logo' : 'Add logo'}
                            </Button>
                            {logo && (
                                <Button variant="ghost" size="sm" onClick={handleLogoRemove}>
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Remove
                                </Button>
                            )}
                        </div>

                        <div className="flex items-center gap-2">
                        <Button variant="outline" onClick={onClose}>Close</Button>
                        <Button onClick={() => window.print()}>
                            <Printer className="h-4 w-4 mr-2" />
                            Print / Save as PDF
                        </Button>
                        </div>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {isOpen && typeof document !== 'undefined' && createPortal(
                <div className="print-root">
                    <ReportDocument definition={definition} data={data} logo={logo} />
                </div>,
                document.body
            )}
        </>
    );
};

export default ReportDialog;
