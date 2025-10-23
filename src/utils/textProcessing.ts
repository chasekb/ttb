// Utility functions for text processing and verification

export function normalizeText(text: string): string {
  return text.toLowerCase().trim().replace(/[^\w\s]/g, '');
}

export function extractAlcoholPercentage(text: string): number | null {
  // Look for patterns like "45%", "45% ABV", "45% alc/vol", etc.
  const patterns = [
    /(\d+(?:\.\d+)?)\s*%/,
    /(\d+(?:\.\d+)?)\s*abv/i,
    /(\d+(?:\.\d+)?)\s*alc\/vol/i,
    /alcohol\s*by\s*volume[:\s]*(\d+(?:\.\d+)?)/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      const percentage = parseFloat(match[1]);
      if (percentage >= 0 && percentage <= 100) {
        return percentage;
      }
    }
  }

  return null;
}

export function extractVolume(text: string): string | null {
  // Look for volume patterns like "750 mL", "12 fl oz", "1.75 L", etc.
  const patterns = [
    /(\d+(?:\.\d+)?)\s*(ml|milliliter|milliliters)/gi,
    /(\d+(?:\.\d+)?)\s*(fl\s*oz|fluid\s*ounce|fluid\s*ounces)/gi,
    /(\d+(?:\.\d+)?)\s*(l|liter|liters)/gi,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      return match[0].trim();
    }
  }

  return null;
}

export function checkGovernmentWarning(text: string): { found: boolean; text?: string } {
  const warningPatterns = [
    /government\s*warning/gi,
    /pregnant\s*women/gi,
    /driving\s*under\s*the\s*influence/gi,
    /health\s*risks/gi,
  ];

  for (const pattern of warningPatterns) {
    const match = text.match(pattern);
    if (match) {
      return { found: true, text: match[0] };
    }
  }

  return { found: false };
}

export function extractBrandName(text: string): string | null {
  // Look for brand name patterns - typically appears prominently
  // Common patterns: "Brand Name", "BRAND NAME", "Brand Name Distillery", etc.
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  
  // Look for lines that might be brand names (typically shorter, prominent text)
  for (const line of lines) {
    const normalizedLine = normalizeText(line);
    
    // Skip lines that are clearly not brand names
    if (normalizedLine.includes('government') || 
        normalizedLine.includes('warning') ||
        normalizedLine.includes('alcohol') ||
        normalizedLine.includes('volume') ||
        normalizedLine.includes('ml') ||
        normalizedLine.includes('oz') ||
        normalizedLine.match(/\d+%/) ||
        normalizedLine.length < 3 ||
        normalizedLine.length > 50) {
      continue;
    }
    
    // Return the first line that looks like a brand name
    return line.trim();
  }
  
  return null;
}

export function extractProductClass(text: string): string | null {
  // Look for product class patterns
  const productClassPatterns = [
    /(kentucky\s+straight\s+bourbon\s+whiskey)/gi,
    /(bourbon\s+whiskey)/gi,
    /(straight\s+bourbon)/gi,
    /(bourbon)/gi,
    /(vodka)/gi,
    /(gin)/gi,
    /(rum)/gi,
    /(tequila)/gi,
    /(scotch\s+whisky)/gi,
    /(scotch)/gi,
    /(whiskey)/gi,
    /(whisky)/gi,
    /(ipa)/gi,
    /(lager)/gi,
    /(ale)/gi,
    /(beer)/gi,
    /(wine)/gi,
    /(champagne)/gi,
    /(brandy)/gi,
    /(cognac)/gi,
  ];

  for (const pattern of productClassPatterns) {
    const match = text.match(pattern);
    if (match) {
      return match[1] || match[0];
    }
  }

  return null;
}

export function fuzzyMatch(expected: string, extracted: string): boolean {
  const normalizedExpected = normalizeText(expected);
  const normalizedExtracted = normalizeText(extracted);
  
  // Exact match
  if (normalizedExpected === normalizedExtracted) {
    return true;
  }
  
  // Check if extracted text contains expected text
  if (normalizedExtracted.includes(normalizedExpected)) {
    return true;
  }
  
  // Check if expected text contains extracted text
  if (normalizedExpected.includes(normalizedExtracted)) {
    return true;
  }
  
  // Simple similarity check (for future enhancement)
  return false;
}
