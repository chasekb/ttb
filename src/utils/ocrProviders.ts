// OCR Provider abstraction layer

import Tesseract from 'tesseract.js';
import { OCRResult, ProcessingError, OCRProvider } from '@/types';

// Google Cloud Vision API interface
interface GoogleCloudVisionResult {
  text: string;
  confidence: number;
}

// OCR Provider interface
interface OCRProviderInterface {
  extractText(imageFile: File): Promise<OCRResult | ProcessingError>;
}

// Tesseract OCR Provider
class TesseractProvider implements OCRProviderInterface {
  async extractText(imageFile: File): Promise<OCRResult | ProcessingError> {
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
            console.log(`Tesseract OCR Progress: ${Math.round(m.progress * 100)}%`);
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
      console.error('Tesseract OCR processing error:', error);
      return {
        type: 'OCR_FAILED',
        message: 'Failed to process the image with Tesseract. Please try again.',
      };
    }
  }
}

// Google Cloud Vision API Provider
class GoogleCloudVisionProvider implements OCRProviderInterface {
  async extractText(imageFile: File): Promise<OCRResult | ProcessingError> {
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

      // Note: Credential validation is handled server-side in the API route

      // Convert file to base64
      const base64Image = await this.fileToBase64(imageFile);

      // Call Google Cloud Vision API
      const result = await this.callGoogleCloudVisionAPI(base64Image);

      if (!result.text || result.text.trim().length === 0) {
        return {
          type: 'NO_TEXT_FOUND',
          message: 'No text could be extracted from the image. Please try a clearer image.',
        };
      }

      return {
        text: result.text,
        confidence: result.confidence,
      };
    } catch (error) {
      console.error('Google Cloud Vision OCR processing error:', error);
      return {
        type: 'OCR_FAILED',
        message: 'Failed to process the image with Google Cloud Vision. Please try again.',
      };
    }
  }

  private async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // Remove data:image/...;base64, prefix
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  private async callGoogleCloudVisionAPI(base64Image: string): Promise<GoogleCloudVisionResult> {
    // This would typically be a server-side API call
    // For now, we'll simulate the Google Cloud Vision API response
    // In a real implementation, this would call your backend API endpoint
    
    const response = await fetch('/api/ocr/google-cloud-vision', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image: base64Image,
      }),
    });

    if (!response.ok) {
      throw new Error(`Google Cloud Vision API error: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      text: data.text || '',
      confidence: data.confidence || 0,
    };
  }
}

// OCR Provider factory
export class OCRProviderFactory {
  private static providers: Record<OCRProvider, OCRProviderInterface> = {
    'tesseract': new TesseractProvider(),
    'google-cloud-vision': new GoogleCloudVisionProvider(),
  };

  static getProvider(provider: OCRProvider): OCRProviderInterface {
    return this.providers[provider];
  }

  static async extractTextFromImage(
    imageFile: File, 
    provider: OCRProvider = 'google-cloud-vision'
  ): Promise<OCRResult | ProcessingError> {
    const ocrProvider = this.getProvider(provider);
    return await ocrProvider.extractText(imageFile);
  }
}

// Legacy function for backward compatibility
export async function extractTextFromImage(
  imageFile: File, 
  provider: OCRProvider = 'google-cloud-vision'
): Promise<OCRResult | ProcessingError> {
  return OCRProviderFactory.extractTextFromImage(imageFile, provider);
}

export function isOCRResult(result: OCRResult | ProcessingError): result is OCRResult {
  return 'text' in result && 'confidence' in result;
}
