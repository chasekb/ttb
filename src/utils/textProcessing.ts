// Utility functions for text processing and verification

export function normalizeText(text: string): string {
  return text.replace(/\n/g, ' ').toLowerCase().trim().replace(/[^\w\s]/g, '');
}

export function extractAlcoholPercentage(text: string, expectedAlcohol?: number): number | null {
  const alcoholPatterns = [
    /(\d+(?:\.\d+)?)\s*%/i,
    /(\d+(?:\.\d+)?)\s*abv/i,
    /(\d+(?:\.\d+)?)\s*alc\/vol/i,
    /alcohol\s*by\s*volume[:\s]*(\d+(?:\.\d+)?)/i,
    /alc\.?\s*(\d+(?:\.\d+)?)\s*%/i,
  ];

  for (const pattern of alcoholPatterns) {
    const match = text.match(pattern);
    if (match) {
      const percentage = parseFloat(match[1]);
      // Strict validation: must be between 0 and 100
      if (percentage > 0 && percentage <= 100) {
        // If we have an expected alcohol percentage, check if this matches (within 0.1% tolerance)
        if (expectedAlcohol !== undefined) {
          if (Math.abs(percentage - expectedAlcohol) <= 0.1) {
            return percentage;
          }
        } else {
          // If no expected value, return the first valid percentage found
          return percentage;
        }
      }
    }
  }

  // If we have an expected alcohol and no match found, return null (indicating mismatch)
  if (expectedAlcohol !== undefined) {
    return null;
  }

  return null;
}

export function extractVolume(text: string, expectedVolume?: string): string | null {
  if (!expectedVolume) return null;
  
  // Normalize text for comparison (remove spaces, newlines, punctuation)
  const normalizeForSearch = (str: string) => str.toLowerCase().replace(/[\s\n\.]/g, '');
  
  const normalizedText = normalizeForSearch(text);
  const normalizedExpected = normalizeForSearch(expectedVolume);
  
  // Direct match first
  if (normalizedText.includes(normalizedExpected)) {
    return expectedVolume;
  }
  
  // Extract number from expected volume
  const expectedNumber = expectedVolume.match(/(\d+(?:\.\d+)?)/)?.[1];
  if (!expectedNumber) return null;
  
  // Look for the number in the text, then check nearby text for volume units
  const lines = text.split(/\s+/); // Split by any whitespace
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes(expectedNumber)) {
      // Check current and nearby lines for volume units
      const searchRange = lines.slice(Math.max(0, i - 2), i + 3);
      const searchText = searchRange.join(' ').toLowerCase();
      
      // Common volume units
      const units = ['floz', 'oz', 'ml', 'cl', 'liter', 'l'];
      
      for (const unit of units) {
        if (searchText.includes(unit)) {
          // Found number + unit combination
          const foundVolume = `${expectedNumber} ${unit.replace('floz', 'fl oz')}`;
          return foundVolume;
        }
      }
    }
  }
  
  return null;
}

export function checkGovernmentWarning(text: string): { found: boolean; text?: string } {
  // Direct search for "government warning" only
  const match = text.match(/government\s*warning/gi);
  if (match) {
    return { found: true, text: match[0] };
  }

  return { found: false };
}

export function extractBrandName(text: string, expectedBrandName?: string): string | null {
  // If we have an expected brand name, search for it directly in the text
  if (expectedBrandName) {
    const normalizedText = normalizeText(text);
    const normalizedExpected = normalizeText(expectedBrandName);
    
    // Direct match
    if (normalizedText.includes(normalizedExpected)) {
      return expectedBrandName;
    }
  }
  
  return null;
}

export function extractProductClass(text: string, expectedProductClass?: string): string | null {
  // If we have an expected product class, search for it directly in the text
  if (expectedProductClass) {
    const normalizedText = normalizeText(text);
    const normalizedExpected = normalizeText(expectedProductClass);
    
    // Direct match
    if (normalizedText.includes(normalizedExpected)) {
      return expectedProductClass;
    }
  }
  
  return null;
}
