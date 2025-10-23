// Verification logic for comparing form data with OCR results

import { TTBFormData, VerificationResult, OCRResult } from '@/types';
import { 
  extractAlcoholPercentage, 
  extractVolume, 
  checkGovernmentWarning, 
  fuzzyMatch 
} from '@/utils/textProcessing';

export function verifyLabel(formData: TTBFormData, ocrResult: OCRResult): VerificationResult {
  const extractedText = ocrResult.text;
  
  // Extract brand name (look for exact or fuzzy match)
  const brandNameMatch = fuzzyMatch(formData.brandName, extractedText);
  
  // Extract product class (look for fuzzy match)
  const productClassMatch = fuzzyMatch(formData.productClass, extractedText);
  
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
      extracted: formData.brandName, // In a real implementation, we'd extract this from OCR
      expected: formData.brandName,
    },
    productClass: {
      match: productClassMatch,
      extracted: formData.productClass, // In a real implementation, we'd extract this from OCR
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
