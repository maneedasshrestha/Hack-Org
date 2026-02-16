import { PdfDimensions } from "@/types";

/**
 * Calculates the scale factor between the rendered DOM element and the actual PDF page.
 */
export function calculateScaleFactor(
    domWidth: number,
    pdfWidth: number
): number {
    if (domWidth === 0) return 1;
    return pdfWidth / domWidth;
}

/**
 * Maps DOM coordinates (top-left origin) to PDF coordinates (bottom-left origin).
 * Note: pdf-lib uses a bottom-left coordinate system.
 * 
 * @param x - DOM x coordinate (left)
 * @param y - DOM y coordinate (top)
 * @param pdfHeight - Actual height of the PDF page in points
 * @param scaleFactor - Ratio of PDF points to DOM pixels
 */
export function domToPdfCoordinates(
    x: number,
    y: number,
    pdfHeight: number,
    scaleFactor: number
): { x: number; y: number } {
    const pdfX = x * scaleFactor;
    // Invert Y axis. 0 in DOM is top, 0 in PDF is bottom.
    // So a DOM y of 100 means 100px down from top.
    // In PDF, that is (Height - 100 scaled) from bottom.
    const pdfY = pdfHeight - (y * scaleFactor);
    return { x: pdfX, y: pdfY };
}
