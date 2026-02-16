import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import { TextFieldConfig, CsvRow } from '@/types';
import { calculateScaleFactor, domToPdfCoordinates } from './coordinate-utils';
import { hexToMap } from '@/lib/utils';

async function loadCustomFont(url: string): Promise<ArrayBuffer> {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to load font: ${response.statusText}`);
        }
        const arrayBuffer = await response.arrayBuffer();
        // Return a copy to avoid potential detachment issues
        return arrayBuffer.slice(0);
    } catch (error) {
        console.error('Font loading failed:', error);
        throw error;
    }
}

export async function generateCertificates(
    templateBytes: ArrayBuffer,
    names: string[],
    config: TextFieldConfig,
    pdfDimensions: { width: number; height: number }, // Actual PDF dimensions
    domDimensions: { width: number; height: number } // DOM Page dimensions
): Promise<Uint8Array> {
    try {
        // Check if ArrayBuffer is detached
        if (templateBytes.byteLength === 0) {
            throw new Error('Template ArrayBuffer is detached or empty');
        }
        
        // Create a fresh copy of the template bytes to avoid detached ArrayBuffer issues
        const templateBytesCopy = templateBytes.slice(0);
        
        const pdfDoc = await PDFDocument.create();
        
        // Register fontkit
        pdfDoc.registerFontkit(fontkit);

        // Load the template
        const templateDoc = await PDFDocument.load(templateBytesCopy);
        const [templatePage] = templateDoc.getPages(); // Assuming single page template

    // Embed Font
    let font;
    
    if (config.fontFamily === 'var(--font-great-vibes)') {
        try {
            // Load custom Great Vibes font
            const greatVibesFontBytes = await loadCustomFont('/fonts/GreatVibes-Regular.ttf');
            font = await pdfDoc.embedFont(greatVibesFontBytes);
        } catch (error) {
            console.warn('Failed to load Great Vibes font, falling back to Helvetica:', error);
            font = await pdfDoc.embedFont(StandardFonts.Helvetica);
        }
    } else {
        // Handle standard fonts
        const fontMap: Record<string, string> = {
            'Helvetica': StandardFonts.Helvetica,
            'Times-Roman': StandardFonts.TimesRoman,
            'Courier': StandardFonts.Courier,
        };

        let fontStandard = fontMap[config.fontFamily] || StandardFonts.Helvetica;
        
        // Handle Bold for standard fonts only
        if (config.fontWeight === 'bold') {
            if (fontStandard === StandardFonts.Helvetica) fontStandard = StandardFonts.HelveticaBold;
            else if (fontStandard === StandardFonts.TimesRoman) fontStandard = StandardFonts.TimesRomanBold;
            else if (fontStandard === StandardFonts.Courier) fontStandard = StandardFonts.CourierBold;
        }
        
        font = await pdfDoc.embedFont(fontStandard);
    }

    const scaleFactor = calculateScaleFactor(domDimensions.width, pdfDimensions.width);
    const fontSize = config.fontSize * scaleFactor;

    // Parse Color
    const colorMap = hexToMap(config.color) || { r: 0, g: 0, b: 0 };
    const color = rgb(colorMap.r, colorMap.g, colorMap.b);

    // Calculate PDF Coordinates for the Box
    // Note: We use the top-left of the box from DOM
    const { x: boxX, y: boxYTop } = domToPdfCoordinates(
        config.x,
        config.y,
        pdfDimensions.height,
        scaleFactor
    );

    // Calculate Box Width/Height in PDF units
    const boxWidth = config.width * scaleFactor;
    const boxHeight = config.height * scaleFactor;

    for (const name of names) {
        // Copy the template page
        const [page] = await pdfDoc.copyPages(templateDoc, [0]);
        pdfDoc.addPage(page);

        // Calculate Text Width for Alignment
        const textWidth = font.widthOfTextAtSize(name, fontSize);

        let drawX = boxX;

        if (config.alignment === 'center') {
            drawX = boxX + (boxWidth / 2) - (textWidth / 2);
        } else if (config.alignment === 'right') {
            drawX = boxX + boxWidth - textWidth;
        }

        // For Y positioning, match the overlay behavior:
        // In overlay, text is vertically centered using alignItems: 'center'
        // We need to position the text baseline to visually center the text in the box
        // 
        // PDF coordinates: boxYTop is the top of the box in PDF coords (bottom-left origin)
        // We want to center the text vertically in the box
        // 
        // For proper centering, we need to:
        // 1. Start from the center of the box: boxYTop - (boxHeight / 2)
        // 2. Adjust for the font's baseline offset (approximately fontSize * 0.3 for most fonts)
        const boxCenterY = boxYTop - (boxHeight / 2);
        const baselineOffset = fontSize * 0.3; // Approximate baseline adjustment
        const drawY = boxCenterY + baselineOffset;

        page.drawText(name, {
            x: drawX,
            y: drawY,
            size: fontSize,
            font: font,
            color: color,
        });
    }

    const pdfBytes = await pdfDoc.save();
    return pdfBytes;
    } catch (error) {
        console.error('PDF generation error:', error);
        if (error instanceof Error && error.message.includes('detached')) {
            throw new Error('PDF template has been corrupted. Please re-upload the template.');
        }
        throw error;
    }
}
