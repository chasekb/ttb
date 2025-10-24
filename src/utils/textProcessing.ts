// Utility functions for text processing and verification

export function normalizeText(text: string): string {
  return text.toLowerCase().trim().replace(/[^\w\s]/g, '');
}

export function normalizeTextForWords(text: string): string {
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
    /may\s*cause\s*birth\s*defects/gi,
    /impair\s*ability/gi,
    /operate\s*machinery/gi,
    /may\s*cause\s*health\s*problems/gi,
    /alcohol\s*abuse\s*is\s*dangerous/gi,
    /drink\s*responsibly/gi,
    /not\s*for\s*sale\s*to\s*minors/gi,
    /under\s*21/gi,
    /age\s*21/gi,
    /warning.*pregnant/gi,
    /warning.*driving/gi,
    /warning.*health/gi,
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
  
  // Define patterns that indicate non-brand text
  const nonBrandPatterns = [
    // Regulatory and warning text
    /government|warning|alcohol|volume|ml|oz/i,
    // Descriptive marketing text
    /established|nature|choicest|products|provide|prized|flavor|finest|hops|grains|selected|americas|best/i,
    // Pure numbers and measurements
    /^\d+$/,
    /^\d+\s*(ml|oz|fl\.?oz)$/i,
  ];
  
  // Helper function to check if text matches non-brand patterns
  const isNonBrandText = (text: string): boolean => {
    const normalized = normalizeText(text);
    return nonBrandPatterns.some(pattern => pattern.test(normalized)) ||
           normalized.length < 3 ||
           normalized.length > 50;
  };
  
  // First, try to find multi-line brand names (like "Pabst Blue Ribbon")
  for (let i = 0; i < lines.length - 1; i++) {
    const currentLine = lines[i];
    const nextLine = lines[i + 1];
    
    // Skip if current line is clearly not a brand name
    if (isNonBrandText(currentLine)) {
      continue;
    }
    
    // Check if next line is also a brand name component
    if (!isNonBrandText(nextLine) && 
        normalizeText(nextLine).length > 2 && 
        normalizeText(nextLine).length < 30) {
      return `${currentLine} ${nextLine}`.trim();
    }
  }
  
  // Fallback to single-line brand names
  for (const line of lines) {
    if (!isNonBrandText(line)) {
      return line.trim();
    }
  }
  
  return null;
}

export function extractProductClass(text: string): string | null {
  // Look for product class patterns - use word boundaries to avoid partial matches
  const productClassPatterns = [
    /\b(kentucky\s+straight\s+bourbon\s+whiskey)\b/gi,
    /\b(bourbon\s+whiskey)\b/gi,
    /\b(straight\s+bourbon)\b/gi,
    /\b(bourbon)\b/gi,
    /\b(vodka)\b/gi,
    /\b(gin)\b/gi,
    /\b(rum)\b/gi,
    /\b(tequila)\b/gi,
    /\b(scotch\s+whisky)\b/gi,
    /\b(scotch)\b/gi,
    /\b(whiskey)\b/gi,
    /\b(whisky)\b/gi,
    /\b(ipa)\b/gi,
    /\b(lager)\b/gi,
    /\b(ale)\b/gi,
    /\b(beer)\b/gi,
    /\b(wine)\b/gi,
    /\b(champagne)\b/gi,
    /\b(brandy)\b/gi,
    /\b(cognac)\b/gi,
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
  
  // For product classes, check if key terms match
  // This handles cases like "Bourbon Whiskey" vs "Kentucky Straight Bourbon Whiskey"
  const expectedWords = normalizeTextForWords(expected).split(/\s+/).filter(word => word.length > 2);
  const extractedWords = normalizeTextForWords(extracted).split(/\s+/).filter(word => word.length > 2);
  
  // Check if all significant words from expected are present in extracted
  const allExpectedWordsFound = expectedWords.every(expectedWord => 
    extractedWords.some(extractedWord => extractedWord.includes(expectedWord))
  );
  
  if (allExpectedWordsFound) {
    return true;
  }
  
  // Additional check: reverse word matching for cases like "Beer" vs "BEER"
  const reverseMatch = extractedWords.every(extractedWord => 
    expectedWords.some(expectedWord => expectedWord.includes(extractedWord))
  );
  
  if (reverseMatch && expectedWords.length === extractedWords.length) {
    return true;
  }
  
  // Simple similarity check (for future enhancement)
  return false;
}
