import {
  normalizeText,
  extractAlcoholPercentage,
  extractVolume,
  checkGovernmentWarning,
  extractBrandName,
  extractProductClass,
} from '../textProcessing'

describe('textProcessing', () => {
  describe('normalizeText', () => {
    it('should convert text to lowercase and trim whitespace', () => {
      expect(normalizeText('  HELLO WORLD  ')).toBe('hello world')
    })

    it('should remove punctuation and special characters', () => {
      expect(normalizeText('Hello, World! How are you?')).toBe('hello world how are you')
    })

    it('should preserve spaces between words', () => {
      expect(normalizeText('Hello   World')).toBe('hello   world')
    })

    it('should handle empty strings', () => {
      expect(normalizeText('')).toBe('')
    })
  })

  describe('extractAlcoholPercentage', () => {
    it('should extract percentage from text', () => {
      expect(extractAlcoholPercentage('12.5% ABV')).toBe(12.5)
    })

    it('should extract alcohol by volume', () => {
      expect(extractAlcoholPercentage('5.0% alcohol by volume')).toBe(5.0)
    })

    it('should extract from alc/vol format', () => {
      expect(extractAlcoholPercentage('14% alc/vol')).toBe(14)
    })

    it('should extract from alc format', () => {
      expect(extractAlcoholPercentage('8.5 alc 8.5%')).toBe(8.5)
    })

    it('should return null for invalid percentages', () => {
      expect(extractAlcoholPercentage('150% ABV')).toBeNull()
      expect(extractAlcoholPercentage('-5% ABV')).toBeNull()
    })

    it('should handle expected alcohol parameter', () => {
      expect(extractAlcoholPercentage('12.5% ABV', 12.5)).toBe(12.5)
      expect(extractAlcoholPercentage('12.5% ABV', 13.0)).toBeNull()
    })

    it('should handle tolerance for expected alcohol', () => {
      expect(extractAlcoholPercentage('12.5% ABV', 12.4)).toBe(12.5)
      expect(extractAlcoholPercentage('12.5% ABV', 12.6)).toBeNull()
    })
  })

  describe('extractVolume', () => {
    it('should extract exact volume match', () => {
      expect(extractVolume('12 FL OZ premium beer', '12 FL OZ')).toBe('12 FL OZ')
    })

    it('should extract volume with different formatting', () => {
      expect(extractVolume('12 floz beer', '12 FL OZ')).toBe('12 FL OZ')
    })

    it('should extract volume with number and unit', () => {
      expect(extractVolume('750 ml wine bottle', '750 ML')).toBe('750 ML')
    })

    it('should return null when no match found', () => {
      expect(extractVolume('No volume here', '12 FL OZ')).toBeNull()
    })

    it('should return null when expected volume is not provided', () => {
      expect(extractVolume('12 FL OZ beer')).toBeNull()
    })

    it('should handle various volume units', () => {
      expect(extractVolume('16 oz beer', '16 OZ')).toBe('16 OZ')
      expect(extractVolume('500 ml vodka', '500 ML')).toBe('500 ML')
      expect(extractVolume('1 liter bottle', '1 LITER')).toBe('1 LITER')
    })
  })

  describe('checkGovernmentWarning', () => {
    it('should find government warning in text', () => {
      const result = checkGovernmentWarning('This product contains GOVERNMENT WARNING alcohol')
      expect(result.found).toBe(true)
      expect(result.text).toBe('GOVERNMENT WARNING')
    })

    it('should find government warning with different casing', () => {
      const result = checkGovernmentWarning('government warning text here')
      expect(result.found).toBe(true)
      expect(result.text).toBe('government warning')
    })

    it('should return false when no government warning found', () => {
      const result = checkGovernmentWarning('No warning here')
      expect(result.found).toBe(false)
      expect(result.text).toBeUndefined()
    })

    it('should handle empty text', () => {
      const result = checkGovernmentWarning('')
      expect(result.found).toBe(false)
    })
  })

  describe('extractBrandName', () => {
    it('should extract exact brand name match', () => {
      expect(extractBrandName('Budweiser Beer', 'Budweiser')).toBe('Budweiser')
    })

    it('should extract brand name with different casing', () => {
      expect(extractBrandName('budweiser premium beer', 'Budweiser')).toBe('Budweiser')
    })

    it('should return null when no match found', () => {
      expect(extractBrandName('Coors Light', 'Budweiser')).toBeNull()
    })

    it('should return null when expected brand name is not provided', () => {
      expect(extractBrandName('Budweiser Beer')).toBeNull()
    })

    it('should handle partial matches', () => {
      expect(extractBrandName('Budweiser Select', 'Budweiser')).toBe('Budweiser')
    })
  })

  describe('extractProductClass', () => {
    it('should extract exact product class match', () => {
      expect(extractProductClass('Premium Beer product', 'Beer')).toBe('Beer')
    })

    it('should extract product class with different casing', () => {
      expect(extractProductClass('premium beer here', 'Beer')).toBe('Beer')
    })

    it('should return null when no match found', () => {
      expect(extractProductClass('Wine product', 'Beer')).toBeNull()
    })

    it('should return null when expected product class is not provided', () => {
      expect(extractProductClass('Beer product')).toBeNull()
    })

    it('should handle various product classes', () => {
      expect(extractProductClass('Malt Beverage here', 'Malt Beverage')).toBe('Malt Beverage')
      expect(extractProductClass('Wine product', 'Wine')).toBe('Wine')
      expect(extractProductClass('Distilled spirits', 'Distilled Spirits')).toBe('Distilled Spirits')
    })
  })
})
