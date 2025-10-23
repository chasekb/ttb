// OCR processing utilities using Tesseract.js

import Tesseract from 'tesseract.js';
import { OCRResult, ProcessingError } from '@/types';

export async function extractTextFromImage(imageFile: File): Promise<OCRResult | ProcessingError> {
  try {
    // Validate file type
    if (!imageFile.type.startsWith('image/')) {
      return {
        type: 'INVALID_IMAGE',
        message: 'Please upload a valid image file (JPEG, PNG, etc.)',
      };
    }

    // Validate file size (max 10MB)
    if (imageFile.size > 10 * 1024 * 1024) {
      return {
        type: 'INVALID_IMAGE',
        message: 'Image file is too large. Please upload an image smaller than 10MB.',
      };
    }

    // Process image with Tesseract
    const { data } = await Tesseract.recognize(imageFile, 'eng', {
      logger: (m) => {
        if (m.status === 'recognizing text') {
          console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
        }
      },
    });

    if (!data.text || data.text.trim().length === 0) {
      return {
        type: 'NO_TEXT_FOUND',
        message: 'No text could be extracted from the image. Please try a clearer image.',
      };
    }

    return {
      text: data.text,
      confidence: data.confidence,
    };
  } catch (error) {
    console.error('OCR processing error:', error);
    return {
      type: 'OCR_FAILED',
      message: 'Failed to process the image. Please try again.',
    };
  }
}

export function isOCRResult(result: OCRResult | ProcessingError): result is OCRResult {
  return 'text' in result && 'confidence' in result;
}
