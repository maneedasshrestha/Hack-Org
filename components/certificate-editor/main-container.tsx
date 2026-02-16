'use client';

import React, { useState, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Papa from 'papaparse';
// import { PdfCanvas } from './pdf-canvas'; // Removed direct import
const PdfCanvas = dynamic(() => import('./pdf-canvas').then(mod => mod.PdfCanvas), {
    ssr: false,
    loading: () => <div className="flex items-center justify-center h-96 bg-gray-100 text-gray-400">Loading PDF engine...</div>
});
import { OverlayLayer } from './overlay-layer';
import { ControlPanel } from './control-panel';
import { TextFieldConfig, PdfDimensions } from '@/types';
import { generateCertificates } from '@/lib/pdf-generation';

export function CertificateEditor() {
    // State
    const [pdfFile, setPdfFile] = useState<ArrayBuffer | null>(null);
    const [pdfName, setPdfName] = useState<string | null>(null); // Added state
    const [pdfDimensions, setPdfDimensions] = useState<PdfDimensions>({ width: 0, height: 0 });

    // Dimensions for the rendered area (canvas + overlay)
    const [viewerDimensions, setViewerDimensions] = useState<{ width: number; height: number }>({ width: 0, height: 0 });

    // Dimensions of the available space
    const [wrapperSize, setWrapperSize] = useState<{ width: number; height: number }>({ width: 0, height: 0 });

    const [names, setNames] = useState<string[]>([]);
    const [csvSummary, setCsvSummary] = useState<string | null>(null);

    const [config, setConfig] = useState<TextFieldConfig>({
        x: 50,
        y: 50,
        width: 200,
        height: 50,
        fontSize: 24,
        fontFamily: 'var(--font-great-vibes)',
        fontWeight: 'normal',
        color: '#111111',
        alignment: 'center',
        text: 'Participant Name',
    });

    const [isProcessing, setIsProcessing] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    // Create a stable clone for the viewer to prevent the main buffer from being detached by react-pdf's worker
    const pdfDataForViewer = React.useMemo(() => pdfFile ? pdfFile.slice(0) : null, [pdfFile]);

    // Resize Observer for Wrapper
    useEffect(() => {
        if (!wrapperRef.current) return;

        const observer = new ResizeObserver((entries) => {
            for (const entry of entries) {
                setWrapperSize({
                    width: entry.contentRect.width,
                    height: entry.contentRect.height
                });
            }
        });

        observer.observe(wrapperRef.current);
        return () => observer.disconnect();
    }, []);

    // Calculate Best Fit Viewer Dimensions
    useEffect(() => {
        if (pdfDimensions.width > 0 && pdfDimensions.height > 0 && wrapperSize.width > 0 && wrapperSize.height > 0) {
            const padding = 40; // Padding inside wrapper
            const availW = wrapperSize.width - padding;
            const availH = wrapperSize.height - padding;

            const pdfRatio = pdfDimensions.width / pdfDimensions.height;
            const availRatio = availW / availH;

            let w, h;
            if (availRatio > pdfRatio) {
                // Limited by Height
                h = availH;
                w = h * pdfRatio;
            } else {
                // Limited by Width
                w = availW;
                h = w / pdfRatio;
            }
            setViewerDimensions({ width: w, height: h });
        }
    }, [pdfDimensions, wrapperSize]);

    // Handlers
    const handlePdfUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (ev) => {
                if (ev.target?.result) {
                    setPdfFile(ev.target.result as ArrayBuffer);
                    setPdfName(file.name); // Set name
                    setPdfDimensions({ width: 0, height: 0 }); // Reset dims until loaded
                }
            };
            reader.readAsArrayBuffer(file);
        }
    };

    const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            Papa.parse(file, {
                complete: (results) => {
                    const data = results.data as any[];
                    const extractedNames: string[] = [];
                    if (data && data.length > 0) {
                        // Simple heuristic: First column of every row
                        for (const row of data) {
                            if (Array.isArray(row) && row[0]) {
                                const name = row[0].trim();
                                if (name && name.toLowerCase() !== 'name') { // skip header if simplistic
                                    extractedNames.push(name);
                                }
                            }
                        }
                    }
                    setNames(extractedNames);
                    setCsvSummary(`Found ${extractedNames.length} names`);
                },
                header: false
            });
        }
    };

    const handleGenerate = async () => {
        if (!pdfFile || names.length === 0) {
            alert("Please upload both a PDF template and a CSV with names.");
            return;
        }

        setIsProcessing(true);
        try {
            const pdfBytes = await generateCertificates(
                pdfFile.slice(0), // Pass a clone!
                names,
                config,
                pdfDimensions, // Original PDF points
                viewerDimensions // Current Rendered Pixels
            );

            // Download
            const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'certificates_bundle.pdf';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (err) {
            console.error(err);
            alert("Error generating certificates. See console.");
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="flex h-screen w-full bg-background overflow-hidden font-sans">
            {/* Sidebar */}
            <ControlPanel
                config={config}
                onUpdate={(updates) => setConfig(prev => ({ ...prev, ...updates }))}
                onPdfUpload={handlePdfUpload}
                onCsvUpload={handleCsvUpload}
                onGenerate={handleGenerate}
                isProcessing={isProcessing}
                csvSummary={csvSummary}
                pdfName={pdfName}
            />

            {/* Main Canvas Area Wrapper */}
            <div
                ref={wrapperRef}
                className="flex-1 bg-secondary/30 bg-grid-pattern flex items-center justify-center overflow-hidden relative"
            >
                {/* The Actual Canvas (Sized exactly to PDF aspect ratio) */}
                <div
                    className="relative shadow-2xl bg-white transition-all duration-300 ease-out"
                    style={{
                        width: viewerDimensions.width > 0 ? viewerDimensions.width : 'auto',
                        height: viewerDimensions.height > 0 ? viewerDimensions.height : 'auto',
                        opacity: pdfFile ? 1 : 0.5,
                        minWidth: pdfFile ? undefined : 400,
                        minHeight: pdfFile ? undefined : 600,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    {pdfFile ? (
                        <>
                            <PdfCanvas
                                file={pdfDataForViewer}
                                onDimensionsLoad={(dims) => {
                                    console.log("PDF Loaded Dims:", dims);
                                    setPdfDimensions(dims);
                                }}
                                width={viewerDimensions.width || 600}
                            // Note: We pass the target width. react-pdf renders closely.
                            // If calculated width is 0 (first render), we pass something default or wait.
                            />

                            {/* Overlay matches container size exactly because container is sized to viewerDimensions */}
                            <OverlayLayer
                                config={config}
                                onUpdate={(updates) => setConfig(prev => ({ ...prev, ...updates }))}
                                containerWidth={viewerDimensions.width}
                                containerHeight={viewerDimensions.height}
                            />
                        </>
                    ) : (
                        <div className="text-center p-10 border-4 border-dashed border-gray-300 rounded-xl">
                            <h3 className="text-xl font-bold text-gray-400">Upload a Certificate PDF</h3>
                            <p className="text-gray-400 mt-2">Use the controls on the left</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
