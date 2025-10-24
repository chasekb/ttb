// Utility functions for text processing and verification

export function normalizeText(text: string): string {
  return text.toLowerCase().trim().replace(/[^\w\s]/g, '');
}

export function normalizeTextForWords(text: string): string {
  return text.toLowerCase().trim().replace(/[^\w\s]/g, '');
}

export function extractAlcoholPercentage(text: string, expectedAlcohol?: number): number | null {
  // If we have an expected alcohol percentage, search for it directly in the text
  if (expectedAlcohol !== undefined) {
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
        if (percentage >= 0 && percentage <= 100) {
          // Check if this matches the expected value (within 0.1% tolerance)
          if (Math.abs(percentage - expectedAlcohol) <= 0.1) {
            return percentage;
          }
        }
      }
    }
    
    // If no exact match found, return null (indicating mismatch)
    return null;
  }
}

export function extractVolume(text: string, expectedVolume?: string): string | null {
  // If we have an expected volume, search for it directly in the text
  if (expectedVolume) {
    const normalizedText = normalizeText(text);
    const normalizedExpected = normalizeText(expectedVolume);
    
    // Direct match
    if (normalizedText.includes(normalizedExpected)) {
      return expectedVolume;
    }
    
    // Try fuzzy matching for OCR errors
    const words = normalizedText.split(/\s+/);
    const expectedWords = normalizedExpected.split(/\s+/);
    
    // Check if all expected words are present (with fuzzy matching)
    const allWordsFound = expectedWords.every(expectedWord => 
      words.some(word => isBrandNameMatch(expectedWord, word))
    );
    
    if (allWordsFound) {
      return expectedVolume;
    }
  }

  return null;
}

export function checkGovernmentWarning(text: string): { found: boolean; text?: string } {
  const warningPatterns = [
    // US Government warnings
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
    // French/European warnings
    /abus\s*dangereux/gi,
    /consommer\s*avec\s*modération/gi,
    /interdit\s*aux\s*moins\s*de\s*18\s*ans/gi,
    /déconseillé\s*aux\s*femmes\s*enceintes/gi,
    /l'abus\s*d'alcool\s*est\s*dangereux/gi,
    /à\s*consommer\s*avec\s*modération/gi,
    /interdit\s*aux\s*moins\s*de\s*dix-huit\s*ans/gi,
    /déconseillé\s*aux\s*femmes\s*enceintes/gi,
    // Additional European patterns
    /excessive\s*consumption/gi,
    /harmful\s*to\s*health/gi,
    /drink\s*in\s*moderation/gi,
    /not\s*for\s*children/gi,
    /18\+/gi,
    /21\+/gi,
  ];

  for (const pattern of warningPatterns) {
    const match = text.match(pattern);
    if (match) {
      return { found: true, text: match[0] };
    }
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
    
    // Try fuzzy matching for OCR errors
    const words = normalizedText.split(/\s+/);
    const expectedWords = normalizedExpected.split(/\s+/);
    
    // Check if all expected words are present (with fuzzy matching)
    const allWordsFound = expectedWords.every(expectedWord => 
      words.some(word => isBrandNameMatch(expectedWord, word))
    );
    
    if (allWordsFound) {
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
    
    // Try fuzzy matching for OCR errors
    const words = normalizedText.split(/\s+/);
    const expectedWords = normalizedExpected.split(/\s+/);
    
    // Check if all expected words are present (with fuzzy matching)
    const allWordsFound = expectedWords.every(expectedWord => 
      words.some(word => isBrandNameMatch(expectedWord, word))
    );
    
    if (allWordsFound) {
      return expectedProductClass;
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
  
  // For brand names, handle OCR errors by checking character similarity
  if (isBrandNameMatch(normalizedExpected, normalizedExtracted)) {
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
  
  return false;
}

// Helper function to handle OCR errors in brand names
function isBrandNameMatch(expected: string, extracted: string): boolean {
  // Handle common OCR character substitutions
  const ocrSubstitutions: { [key: string]: string[] } = {
    'c': ['e', 'o', 'g'],
    'e': ['c', 'o'],
    'o': ['c', 'e', '0'],
    'i': ['l', '1'],
    'l': ['i', '1'],
    'u': ['n', 'v'],
    'n': ['u', 'v'],
    'v': ['u', 'n'],
    'q': ['g', 'o'],
    'g': ['q', 'o'],
    't': ['f', 'l'],
    'f': ['t', 'l'],
  };
  
  // If lengths are very different, likely not a match
  if (Math.abs(expected.length - extracted.length) > 2) {
    return false;
  }
  
  // Check if extracted text could be expected text with OCR errors
  let matchCount = 0;
  const minLength = Math.min(expected.length, extracted.length);
  
  for (let i = 0; i < minLength; i++) {
    const expectedChar = expected[i];
    const extractedChar = extracted[i];
    
    if (expectedChar === extractedChar) {
      matchCount++;
    } else if (ocrSubstitutions[expectedChar]?.includes(extractedChar)) {
      matchCount++;
    }
  }
  
  // If at least 70% of characters match (accounting for OCR errors), consider it a match
  return matchCount / minLength >= 0.7;
}
