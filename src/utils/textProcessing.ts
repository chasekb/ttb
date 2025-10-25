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
    
    // Try to find volume patterns in the text - handle multi-line text
    const volumePatterns = [
      // Standard patterns with spaces
      /(\d+(?:\.\d+)?)\s*cl/i,
      /(\d+(?:\.\d+)?)\s*ml/i,
      /(\d+(?:\.\d+)?)\s*liter/i,
      /(\d+(?:\.\d+)?)\s*l/i,
      /(\d+(?:\.\d+)?)\s*ounce/i,
      /(\d+(?:\.\d+)?)\s*oz/i,
      /(\d+(?:\.\d+)?)\s*fl\s*oz/i,
      // Patterns with dots and special characters
      /(\d+(?:\.\d+)?)\s*fl\.?\s*oz/i,
      /(\d+(?:\.\d+)?)\s*fl\.oz/i,
      // Multi-line patterns (number on one line, unit on another)
      /(\d+(?:\.\d+)?)\s*\n\s*fl\.?\s*oz/i,
      /(\d+(?:\.\d+)?)\s*\n\s*oz/i,
      /(\d+(?:\.\d+)?)\s*\n\s*ml/i,
      /(\d+(?:\.\d+)?)\s*\n\s*cl/i,
    ];
    
    for (const pattern of volumePatterns) {
      const match = text.match(pattern);
      if (match) {
        const foundVolume = match[0].replace(/\n/g, ' ').trim();
        const normalizedFound = normalizeText(foundVolume);
        const normalizedExpected = normalizeText(expectedVolume);
        
        // Check if the found volume matches the expected volume
        if (normalizedFound.includes(normalizedExpected) || normalizedExpected.includes(normalizedFound)) {
          return foundVolume;
        }
        
        // Also check if the numeric part matches (e.g., "70cl" matches "70 cl")
        const numericMatch = foundVolume.match(/(\d+(?:\.\d+)?)/);
        const expectedNumericMatch = expectedVolume.match(/(\d+(?:\.\d+)?)/);
        
        if (numericMatch && expectedNumericMatch) {
          const foundNumber = numericMatch[1];
          const expectedNumber = expectedNumericMatch[1];
          
          if (foundNumber === expectedNumber) {
            return foundVolume;
          }
        }
      }
    }
    
    // Additional fallback: look for number and unit separately in nearby lines
    const lines = text.split('\n');
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      const numberMatch = line.match(/(\d+(?:\.\d+)?)/);
      
      if (numberMatch) {
        const number = numberMatch[1];
        const expectedNumberMatch = expectedVolume.match(/(\d+(?:\.\d+)?)/);
        
        if (expectedNumberMatch && number === expectedNumberMatch[1]) {
          // Check current line and nearby lines for volume units
          const searchLines = [
            lines[i], // current line
            lines[i - 1], // previous line
            lines[i + 1], // next line
          ].filter(Boolean);
          
          const searchText = searchLines.join(' ');
          const unitPatterns = [
            /fl\.?\s*oz/i,
            /oz/i,
            /ml/i,
            /cl/i,
            /liter/i,
            /l\b/i,
          ];
          
          for (const unitPattern of unitPatterns) {
            if (unitPattern.test(searchText)) {
              const unitMatch = searchText.match(unitPattern);
              if (unitMatch) {
                const foundVolume = `${number} ${unitMatch[0]}`;
                const normalizedFound = normalizeText(foundVolume);
                const normalizedExpected = normalizeText(expectedVolume);
                
                if (normalizedFound.includes(normalizedExpected) || normalizedExpected.includes(normalizedFound)) {
                  return foundVolume;
                }
              }
            }
          }
        }
      }
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
    // Partial/truncated warnings that might appear in OCR
    /pregnant/gi,
    /driving/gi,
    /health/gi,
    /warning/gi,
    /minors/gi,
    /responsibly/gi,
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
    // Malay/Indonesian warnings (for Jack Daniels and other international products)
    /meminum\s*arak\s*boleh\s*membahayakan\s*kesihatan/gi,
    /meminum\s*arak/gi,
    /membahayakan\s*kesihatan/gi,
    /bahaya\s*untuk\s*kesehatan/gi,
    /minuman\s*beralkohol/gi,
    // Spanish warnings
    /consumir\s*con\s*moderación/gi,
    /abuso\s*peligroso/gi,
    /prohibido\s*menores/gi,
    /embarazadas/gi,
    // German warnings
    /alkoholmissbrauch\s*gefährlich/gi,
    /mit\s*maß\s*genießen/gi,
    /schwangeren\s*frauen/gi,
    // Italian warnings
    /abuso\s*pericoloso/gi,
    /consumare\s*con\s*moderazione/gi,
    /donne\s*incinte/gi,
    // Portuguese warnings
    /abuso\s*perigoso/gi,
    /consumir\s*com\s*moderação/gi,
    /mulheres\s*grávidas/gi,
    // Generic international patterns
    /health\s*warning/gi,
    /alcohol\s*warning/gi,
    /drinking\s*warning/gi,
    /consumption\s*warning/gi,
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

