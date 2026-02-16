'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { PdfDimensions } from '@/types';

// Set up the worker
if (typeof window !== 'undefined') {
    pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
}

interface PdfCanvasProps {
    file: ArrayBuffer | null;
    onDimensionsLoad: (dims: PdfDimensions) => void;
    width: number;
}

export function PdfCanvas({ file, onDimensionsLoad, width }: PdfCanvasProps) {
    const [numPages, setNumPages] = useState<number>(0);

    function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
        setNumPages(numPages);
    }

    function onPageLoadSuccess(page: any) {
        // page.originalWidth and page.originalHeight are in PDF points
        onDimensionsLoad({ width: page.originalWidth, height: page.originalHeight });
    }

    if (!file) {
        return (
            <div className="flex items-center justify-center h-full border-2 border-dashed rounded-lg bg-gray-50 text-gray-400">
                <p>No PDF uploaded</p>
            </div>
        );
    }

    return (
        <div className="relative shadow-lg">
            <Document
                file={file}
                onLoadSuccess={onDocumentLoadSuccess}
                className="flex flex-col items-center"
            >
                <Page
                    pageNumber={1}
                    width={width}
                    onLoadSuccess={onPageLoadSuccess}
                    renderTextLayer={false} // Disable for now to keep overlay clean, enable if selection needed
                    renderAnnotationLayer={false}
                />
            </Document>
        </div>
    );
}
