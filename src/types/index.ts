// TTB Label Verification System Types

export type OCRProvider = 'tesseract' | 'google-cloud-vision' | 'google-ai-studio';

export interface TTBFormData {
  brandName: string;
  productClass: string;
  alcoholContent?: number;
  netContents?: string;
  ocrProvider?: OCRProvider;
}

export interface OCRResult {
  text: string;
  confidence: number;
}

export interface VerificationResult {
  brandName: {
    match: boolean;
    extracted: string;
    expected: string;
  };
  productClass: {
    match: boolean;
    extracted: string;
    expected: string;
  };
  alcoholContent?: {
    match: boolean;
    extracted: number | null;
    expected: number;
  };
  netContents?: {
    match: boolean;
    extracted: string;
    expected: string;
  };
  governmentWarning: {
    found: boolean;
    text?: string;
  };
  overallMatch: boolean;
  extractedText: string;
  ocrConfidence: number;
}

export interface ProcessingError {
  type: 'OCR_FAILED' | 'INVALID_IMAGE' | 'NO_TEXT_FOUND';
  message: string;
}
