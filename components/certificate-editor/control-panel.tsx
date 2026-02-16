'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { TextFieldConfig } from '@/types';
import { AlignLeft, AlignCenter, AlignRight, Bold, Download, Upload, FileText, FileSpreadsheet } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ControlPanelProps {
    config: TextFieldConfig;
    onUpdate: (updates: Partial<TextFieldConfig>) => void;
    onPdfUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onCsvUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onGenerate: () => void;
    isProcessing: boolean;
    csvSummary: string | null;
    pdfName: string | null;
}

export function ControlPanel({
    config,
    onUpdate,
    onPdfUpload,
    onCsvUpload,
    onGenerate,
    isProcessing,
    csvSummary,
    pdfName,
}: ControlPanelProps) {
    return (
        <div className="w-80 h-full bg-card border-r border-border p-6 flex flex-col gap-6 overflow-y-auto shadow-sm z-10">
            <div>
                <h2 className="text-xl font-bold mb-4 tracking-tight">Setup</h2>
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label>1. Template PDF</Label>
                        <div className="flex flex-col gap-2">
                            <Input type="file" accept=".pdf" onChange={onPdfUpload} className="hidden" id="pdf-upload" />
                            <Button
                                variant={pdfName ? "secondary" : "outline"}
                                className={cn("w-full justify-start", pdfName && "bg-secondary/50 text-foreground border-secondary-foreground/20")}
                                asChild
                            >
                                <label htmlFor="pdf-upload" className="cursor-pointer flex items-center gap-2 truncate">
                                    <FileText className="w-4 h-4 shrink-0" />
                                    <span className="truncate">{pdfName ? pdfName : "Choose PDF Template"}</span>
                                </label>
                            </Button>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>2. Names CSV</Label>
                        <div className="flex flex-col gap-2">
                            <Input type="file" accept=".csv" onChange={onCsvUpload} className="hidden" id="csv-upload" />
                            <Button
                                variant={csvSummary ? "secondary" : "outline"}
                                className={cn("w-full justify-start", csvSummary && "bg-secondary/50 text-foreground border-secondary-foreground/20")}
                                asChild
                            >
                                <label htmlFor="csv-upload" className="cursor-pointer flex items-center gap-2">
                                    <FileSpreadsheet className="w-4 h-4 shrink-0" />
                                    <span>{csvSummary ? "Change CSV File" : "Choose CSV File"}</span>
                                </label>
                            </Button>
                            {csvSummary && (
                                <p className="text-xs text-muted-foreground font-medium px-1 flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                                    {csvSummary}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="border-t border-border pt-6">
                <h2 className="text-xl font-bold mb-4 tracking-tight">Design</h2>
                <div className="space-y-6">

                    <div className="space-y-2">
                        <Label>Text Content</Label>
                        <Input
                            value={config.text}
                            onChange={(e) => onUpdate({ text: e.target.value })}
                            className="bg-background text-white border-input"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Font Family</Label>
                        <select
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                            value={config.fontFamily}
                            onChange={(e) => onUpdate({ fontFamily: e.target.value })}
                        >
                            <option value="Helvetica">Helvetica</option>
                            <option value="Times-Roman">Times New Roman</option>
                            <option value="Courier">Courier</option>
                            <option value="var(--font-great-vibes)">Great Vibes</option>
                        </select>
                    </div>

                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <Label>Size</Label>
                            <span className="text-xs text-muted-foreground font-mono">{config.fontSize}px</span>
                        </div>
                        <input
                            type="range"
                            min="8"
                            max="120"
                            value={config.fontSize}
                            onChange={(e) => onUpdate({ fontSize: Number(e.target.value) })}
                            className="w-full h-1.5 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Color</Label>
                            <div className="flex items-center gap-2 h-10">
                                <div className="relative w-full h-full">
                                    <Input
                                        type="color"
                                        value={config.color}
                                        onChange={(e) => onUpdate({ color: e.target.value })}
                                        className="w-full h-full p-0 cursor-pointer border-0 opacity-0 absolute inset-0 z-10"
                                    />
                                    <div
                                        className="w-full h-full rounded-md border border-input shadow-sm flex items-center justify-center"
                                        style={{ backgroundColor: config.color }}
                                    >
                                        <span className="text-[10px] font-mono mix-blend-difference text-white uppercase opacity-0 hover:opacity-100 transition-opacity">
                                            {config.color}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Weight</Label>
                            <Button
                                variant={config.fontWeight === 'bold' ? 'default' : 'outline'}
                                className="w-full justify-between px-3"
                                onClick={() => onUpdate({ fontWeight: config.fontWeight === 'bold' ? 'normal' : 'bold' })}
                            >
                                <span>Bold</span>
                                <Bold className={cn("w-4 h-4", config.fontWeight === 'bold' ? "fill-current" : "opacity-50")} />
                            </Button>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Alignment</Label>
                        <div className="flex rounded-md shadow-sm" role="group">
                            <Button
                                variant={config.alignment === 'left' ? 'default' : 'outline'}
                                className="flex-1 rounded-r-none border-r-0"
                                size="sm"
                                onClick={() => onUpdate({ alignment: 'left' })}
                            >
                                <AlignLeft className="w-4 h-4" />
                            </Button>
                            <Button
                                variant={config.alignment === 'center' ? 'default' : 'outline'}
                                className="flex-1 rounded-none"
                                size="sm"
                                onClick={() => onUpdate({ alignment: 'center' })}
                            >
                                <AlignCenter className="w-4 h-4" />
                            </Button>
                            <Button
                                variant={config.alignment === 'right' ? 'default' : 'outline'}
                                className="flex-1 rounded-l-none border-l-0"
                                size="sm"
                                onClick={() => onUpdate({ alignment: 'right' })}
                            >
                                <AlignRight className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>

                </div>
            </div>

            <div className="mt-auto border-t border-border pt-6">
                <Button
                    className="w-full h-12 text-base font-semibold tracking-wide gap-2 shadow-lg hover:shadow-xl transition-all"
                    onClick={onGenerate}
                    disabled={isProcessing}
                >
                    {isProcessing ? (
                        'Processing...'
                    ) : (
                        <>
                            <Download className="w-5 h-5" /> Generate PDF
                        </>
                    )}
                </Button>
            </div>
        </div>
    );
}
