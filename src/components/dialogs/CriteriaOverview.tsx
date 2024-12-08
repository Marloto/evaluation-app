import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Section } from '@/lib/types/types';

interface CriteriaOverviewProps {
  sections: Record<string, Section>;
  isOpen: boolean;
  onClose: () => void;
}

const introduction = "Diese Übersicht zeigt die Bewertungskriterien für Abschlussarbeiten für die beste und niedrigste Bewertung je Kriterium.";

const CriteriaOverview: React.FC<CriteriaOverviewProps> = ({ sections, isOpen, onClose }) => {
  const handlePrint = () => {
    // Erstelle den Inhalt für das neue Fenster
    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Bewertungskriterien</title>
          <style>
            body { 
              font-family: system-ui, -apple-system, sans-serif;
              line-height: 1.5;
              max-width: 1000px;
              margin: 0 auto;
              padding: 2rem;
            }
            @page { 
              size: A4;
              margin: 2cm;
            }
            .section {
              margin-bottom: 2rem;
              break-inside: avoid;
            }
            .section-title {
              font-size: 1.5rem;
              font-weight: bold;
              margin-bottom: 1rem;
              color: #1a1a1a;
            }
            .criterion {
              margin-bottom: 1.5rem;
              break-inside: avoid;
            }
            .criterion-title {
              font-weight: 500;
              margin-bottom: 0.5rem;
            }
            .weight {
              color: #666;
              font-size: 0.9rem;
            }
            .requirements-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 1rem;
              margin-top: 0.5rem;
            }
            .requirement-box {
              padding: 1rem;
              border-radius: 4px;
            }
            .minimum {
              border: 1px solid #ef4444;
            }
            .maximum {
              border: 1px solid #22c55e;
            }
            .requirement-title {
              font-weight: 500;
              margin-bottom: 0.5rem;
              font-size: 0.9rem;
            }
            .minimum .requirement-title {
              color: #b91c1c;
            }
            .maximum .requirement-title {
              color: #15803d;
            }
            .intro-text {
              margin-bottom: 2rem;
              color: #666;
            }
          </style>
        </head>
        <body>
          <div class="intro-text">
            ${introduction}
          </div>
          ${Object.values(sections).map((section) => `
            <div class="section">
              <div class="section-title">
                ${section.title} (${(section.weight * 100).toFixed(0)}%)
              </div>
              ${Object.values(section.criteria).map((criterion) => {
                const bestOption = criterion.options.find(opt => opt.score === 5);
                const worstOption = criterion.options.find(opt => opt.score === 1);
                return `
                  <div class="criterion">
                    <div class="criterion-title">
                      ${criterion.title} 
                      ${criterion.excludeFromTotal ? ' (Bonus)' : ''}
                      <span class="weight">
                        (${(criterion.weight * 100).toFixed(0)}%)
                      </span>
                    </div>
                    <div class="requirements-grid">
                      <div class="requirement-box minimum">
                        <div class="requirement-title">
                          Minimale Anforderungen:
                        </div>
                        ${worstOption?.text || ''}
                      </div>
                      <div class="requirement-box maximum">
                        <div class="requirement-title">
                          Maximale Anforderungen:
                        </div>
                        ${bestOption?.text || ''}
                      </div>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          `).join('')}
        </body>
      </html>
    `;

    // Öffne neues Fenster und schreibe den Inhalt
    const printWindow = window.open('', 'Bewertungskriterien', 'height=600,width=800');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      // Automatisch den Druckdialog öffnen
      printWindow.onload = () => {
        printWindow.print();
        // Optional: Schließe das Fenster nach dem Drucken
        // printWindow.onafterprint = () => printWindow.close();
      };
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <DialogTitle>Bewertungskriterien Übersicht</DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="max-h-[80vh]">
          <div className="p-6 space-y-8">
            {/* Regular view content - same as before but without print styles */}
            <div className="prose max-w-none">
              <p className="text-gray-600 mb-6">
                {introduction}
              </p>
            </div>
            <div className="prose max-w-none">
                <Button onClick={handlePrint} className="w-full mb-2" variant="outline" size="sm">
                    <Printer className="h-4 w-4 mr-2" />
                    Drucken
                </Button>
            </div>

            {Object.entries(sections).map(([sectionKey, section]) => (
              <Card key={sectionKey}>
                <CardHeader>
                  <CardTitle className="text-xl font-semibold">
                    {section.title} ({(section.weight * 100).toFixed(0)}%)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {Object.entries(section.criteria).map(([criterionKey, criterion]) => {
                      const bestOption = criterion.options.find(opt => opt.score === 5);
                      const worstOption = criterion.options.find(opt => opt.score === 1);
                      
                      return (
                        <div key={criterionKey} className="space-y-2">
                          <h3 className="font-medium">
                            {criterion.title} 
                            {criterion.excludeFromTotal && ' (Bonus)'}
                            <span className="text-sm text-gray-500 ml-2">
                              ({(criterion.weight * 100).toFixed(0)}%)
                            </span>
                          </h3>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div className="p-3 bg-red-50 border border-red-200 rounded">
                              <div className="text-sm font-medium text-red-800 mb-1">
                                Minimale Anforderungen:
                              </div>
                              <div className="text-sm text-red-700">
                                {worstOption?.text}
                              </div>
                            </div>
                            
                            <div className="p-3 bg-green-50 border border-green-200 rounded">
                              <div className="text-sm font-medium text-green-800 mb-1">
                                Maximale Anforderungen:
                              </div>
                              <div className="text-sm text-green-700">
                                {bestOption?.text}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default CriteriaOverview;