// OCR processing utilities - Legacy wrapper for backward compatibility

import { OCRResult, ProcessingError, OCRProvider } from '@/types';
import { OCRProviderFactory } from './ocrProviders';

export async function extractTextFromImage(
  imageFile: File, 
  provider: OCRProvider = 'tesseract'
): Promise<OCRResult | ProcessingError> {
  return OCRProviderFactory.extractTextFromImage(imageFile, provider);
}

export function isOCRResult(result: OCRResult | ProcessingError): result is OCRResult {
  return 'text' in result && 'confidence' in result;
}
