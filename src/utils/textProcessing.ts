// Utility functions for text processing and verification

export function normalizeText(text: string): string {
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
  
  return null;
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

