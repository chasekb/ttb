// TTB Label Verification System Types

export interface TTBFormData {
  brandName: string;
  productClass: string;
  alcoholContent: number;
  netContents?: string;
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
  alcoholContent: {
    match: boolean;
    extracted: number;
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
}

export interface ProcessingError {
  type: 'OCR_FAILED' | 'INVALID_IMAGE' | 'NO_TEXT_FOUND';
  message: string;
}
