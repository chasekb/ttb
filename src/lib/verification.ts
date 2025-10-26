// Verification logic for comparing form data with OCR results

import { TTBFormData, VerificationResult, OCRResult } from '@/types';
import { 
  extractAlcoholPercentage, 
  extractVolume, 
  checkGovernmentWarning, 
  extractBrandName,
  extractProductClass
} from '@/utils/textProcessing';

export function verifyLabel(formData: TTBFormData, ocrResult: OCRResult): VerificationResult {
  const extractedText = ocrResult.text;
  
  // Extract brand name from OCR text
  const extractedBrandName = extractBrandName(extractedText, formData.brandName);
  const brandNameMatch = extractedBrandName !== null;
  
  // Extract product class from OCR text
  const extractedProductClass = extractProductClass(extractedText, formData.productClass);
  const productClassMatch = extractedProductClass !== null;
  
  // Extract alcohol content (if provided in form)
  const extractedAlcohol = extractAlcoholPercentage(extractedText, formData.alcoholContent);
  let alcoholContentMatch = true;
  if (formData.alcoholContent !== undefined) {
    alcoholContentMatch = extractedAlcohol !== null;
  }
  
  // Extract net contents (if provided)
  let netContentsMatch = true;
  let extractedNetContents: string | null = null;
  if (formData.netContents) {
    extractedNetContents = extractVolume(extractedText, formData.netContents);
    netContentsMatch = extractedNetContents !== null;
  }
  
  // Check for government warning
  const governmentWarning = checkGovernmentWarning(extractedText);
  
  // Determine overall match - government warning is optional
  const overallMatch = brandNameMatch && 
    productClassMatch && 
    alcoholContentMatch && 
    netContentsMatch;
  
  return {
    brandName: {
      match: brandNameMatch,
      extracted: extractedBrandName || '',
      expected: formData.brandName,
    },
    productClass: {
      match: productClassMatch,
      extracted: extractedProductClass || '',
      expected: formData.productClass,
    },
    alcoholContent: formData.alcoholContent !== undefined ? {
      match: alcoholContentMatch,
      extracted: extractedAlcohol,
      expected: formData.alcoholContent,
    } : undefined,
    netContents: formData.netContents ? {
      match: netContentsMatch,
      extracted: extractedNetContents || '',
      expected: formData.netContents,
    } : undefined,
    governmentWarning,
    overallMatch,
    extractedText: ocrResult.text,
    ocrConfidence: ocrResult.confidence,
  };
}
