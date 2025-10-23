// Verification logic for comparing form data with OCR results

import { TTBFormData, VerificationResult, OCRResult } from '@/types';
import { 
  extractAlcoholPercentage, 
  extractVolume, 
  checkGovernmentWarning, 
  fuzzyMatch,
  extractBrandName,
  extractProductClass
} from '@/utils/textProcessing';

export function verifyLabel(formData: TTBFormData, ocrResult: OCRResult): VerificationResult {
  const extractedText = ocrResult.text;
  
  // Extract brand name from OCR text
  const extractedBrandName = extractBrandName(extractedText);
  const brandNameMatch = extractedBrandName !== null && 
    fuzzyMatch(formData.brandName, extractedBrandName);
  
  // Extract product class from OCR text
  const extractedProductClass = extractProductClass(extractedText);
  const productClassMatch = extractedProductClass !== null && 
    fuzzyMatch(formData.productClass, extractedProductClass);
  
  // Extract alcohol content
  const extractedAlcohol = extractAlcoholPercentage(extractedText);
  const alcoholContentMatch = extractedAlcohol !== null && 
    Math.abs(extractedAlcohol - formData.alcoholContent) <= 0.1;
  
  // Extract net contents (if provided)
  let netContentsMatch = true;
  let extractedNetContents: string | null = null;
  if (formData.netContents) {
    extractedNetContents = extractVolume(extractedText);
    netContentsMatch = extractedNetContents !== null && 
      fuzzyMatch(formData.netContents, extractedNetContents);
  }
  
  // Check for government warning
  const governmentWarning = checkGovernmentWarning(extractedText);
  
  // Determine overall match
  const overallMatch = brandNameMatch && 
    productClassMatch && 
    alcoholContentMatch && 
    netContentsMatch && 
    governmentWarning.found;
  
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
    alcoholContent: {
      match: alcoholContentMatch,
      extracted: extractedAlcohol || 0,
      expected: formData.alcoholContent,
    },
    netContents: formData.netContents ? {
      match: netContentsMatch,
      extracted: extractedNetContents || '',
      expected: formData.netContents,
    } : undefined,
    governmentWarning,
    overallMatch,
  };
}
