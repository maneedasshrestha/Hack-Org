export type FontFn = 'Helvetica' | 'Times-Roman' | 'Courier' | 'StandardFonts'; // simplified for pdf-lib

export interface TextFieldConfig {
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize: number;
  fontFamily: string;
  fontWeight: 'normal' | 'bold';
  color: string; // Hex
  alignment: 'left' | 'center' | 'right';
  text: string; // Sample text
}

export interface PdfDimensions {
  width: number;
  height: number;
}

export interface ProcessingState {
  status: 'idle' | 'processing' | 'completed' | 'error';
  message?: string;
}

export interface CsvRow {
  [key: string]: string;
}
