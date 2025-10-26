import { verifyLabel } from '../verification'
import { TTBFormData, OCRResult } from '@/types'

describe('verification', () => {
  describe('verifyLabel', () => {
    const mockFormData: TTBFormData = {
      brandName: 'Budweiser',
      productClass: 'Beer',
      alcoholContent: 5.0,
      netContents: '12 FL OZ',
    }

    const mockOCRResult: OCRResult = {
      text: 'Budweiser Premium Beer 5.0% ABV 12 FL OZ Government Warning',
      confidence: 0.95,
    }

    it('should return successful verification for matching data', () => {
      const result = verifyLabel(mockFormData, mockOCRResult)

      expect(result.overallMatch).toBe(true)
      expect(result.brandName.match).toBe(true)
      expect(result.brandName.extracted).toBe('Budweiser')
      expect(result.brandName.expected).toBe('Budweiser')
      expect(result.productClass.match).toBe(true)
      expect(result.productClass.extracted).toBe('Beer')
      expect(result.productClass.expected).toBe('Beer')
      expect(result.alcoholContent?.match).toBe(true)
      expect(result.alcoholContent?.extracted).toBe(5.0)
      expect(result.alcoholContent?.expected).toBe(5.0)
      expect(result.netContents?.match).toBe(true)
      expect(result.netContents?.extracted).toBe('12 FL OZ')
      expect(result.netContents?.expected).toBe('12 FL OZ')
      expect(result.governmentWarning.found).toBe(true)
      expect(result.ocrConfidence).toBe(0.95)
    })

    it('should handle missing alcohol content in form data', () => {
      const formDataWithoutAlcohol: TTBFormData = {
        brandName: 'Budweiser',
        productClass: 'Beer',
        netContents: '12 FL OZ',
      }

      const result = verifyLabel(formDataWithoutAlcohol, mockOCRResult)

      expect(result.overallMatch).toBe(true)
      expect(result.alcoholContent).toBeUndefined()
    })

    it('should handle missing net contents in form data', () => {
      const formDataWithoutVolume: TTBFormData = {
        brandName: 'Budweiser',
        productClass: 'Beer',
        alcoholContent: 5.0,
      }

      const result = verifyLabel(formDataWithoutVolume, mockOCRResult)

      expect(result.overallMatch).toBe(true)
      expect(result.netContents).toBeUndefined()
    })

    it('should fail verification when brand name does not match', () => {
      const ocrResultWithWrongBrand: OCRResult = {
        text: 'Coors Light Beer 5.0% ABV 12 FL OZ',
        confidence: 0.95,
      }

      const result = verifyLabel(mockFormData, ocrResultWithWrongBrand)

      expect(result.overallMatch).toBe(false)
      expect(result.brandName.match).toBe(false)
      expect(result.brandName.extracted).toBe('')
      expect(result.brandName.expected).toBe('Budweiser')
    })

    it('should fail verification when product class does not match', () => {
      const ocrResultWithWrongClass: OCRResult = {
        text: 'Budweiser Wine 5.0% ABV 12 FL OZ',
        confidence: 0.95,
      }

      const result = verifyLabel(mockFormData, ocrResultWithWrongClass)

      expect(result.overallMatch).toBe(false)
      expect(result.productClass.match).toBe(false)
      expect(result.productClass.extracted).toBe('')
      expect(result.productClass.expected).toBe('Beer')
    })

    it('should fail verification when alcohol content does not match', () => {
      const ocrResultWithWrongAlcohol: OCRResult = {
        text: 'Budweiser Beer 4.5% ABV 12 FL OZ',
        confidence: 0.95,
      }

      const result = verifyLabel(mockFormData, ocrResultWithWrongAlcohol)

      expect(result.overallMatch).toBe(false)
      expect(result.alcoholContent?.match).toBe(false)
      expect(result.alcoholContent?.extracted).toBeNull()
      expect(result.alcoholContent?.expected).toBe(5.0)
    })

    it('should fail verification when net contents does not match', () => {
      const ocrResultWithWrongVolume: OCRResult = {
        text: 'Budweiser Beer 5.0% ABV 16 FL OZ',
        confidence: 0.95,
      }

      const result = verifyLabel(mockFormData, ocrResultWithWrongVolume)

      expect(result.overallMatch).toBe(false)
      expect(result.netContents?.match).toBe(false)
      expect(result.netContents?.extracted).toBe('')
      expect(result.netContents?.expected).toBe('12 FL OZ')
    })

    it('should handle government warning not found', () => {
      const ocrResultWithoutWarning: OCRResult = {
        text: 'Budweiser Beer 5.0% ABV 12 FL OZ',
        confidence: 0.95,
      }

      const result = verifyLabel(mockFormData, ocrResultWithoutWarning)

      expect(result.governmentWarning.found).toBe(false)
      expect(result.governmentWarning.text).toBeUndefined()
      // Government warning is optional, so overall match should still be true
      expect(result.overallMatch).toBe(true)
    })

    it('should handle low confidence OCR results', () => {
      const lowConfidenceOCR: OCRResult = {
        text: 'Budweiser Beer 5.0% ABV 12 FL OZ Government Warning',
        confidence: 0.1,
      }

      const result = verifyLabel(mockFormData, lowConfidenceOCR)

      expect(result.ocrConfidence).toBe(0.1)
      expect(result.overallMatch).toBe(true)
    })

    it('should handle empty OCR text', () => {
      const emptyOCR: OCRResult = {
        text: '',
        confidence: 0.0,
      }

      const result = verifyLabel(mockFormData, emptyOCR)

      expect(result.overallMatch).toBe(false)
      expect(result.brandName.match).toBe(false)
      expect(result.productClass.match).toBe(false)
      expect(result.alcoholContent?.match).toBe(false)
      expect(result.netContents?.match).toBe(false)
      expect(result.governmentWarning.found).toBe(false)
    })

    it('should handle case insensitive matching', () => {
      const mixedCaseOCR: OCRResult = {
        text: 'BUDWEISER beer 5.0% abv 12 fl oz government warning',
        confidence: 0.95,
      }

      const result = verifyLabel(mockFormData, mixedCaseOCR)

      expect(result.overallMatch).toBe(true)
      expect(result.brandName.match).toBe(true)
      expect(result.productClass.match).toBe(true)
      expect(result.alcoholContent?.match).toBe(true)
      expect(result.netContents?.match).toBe(true)
      expect(result.governmentWarning.found).toBe(true)
    })

    it('should handle alcohol content tolerance', () => {
      const slightlyOffAlcohol: OCRResult = {
        text: 'Budweiser Beer 5.1% ABV 12 FL OZ Government Warning',
        confidence: 0.95,
      }

      const result = verifyLabel(mockFormData, slightlyOffAlcohol)

      expect(result.overallMatch).toBe(true)
      expect(result.alcoholContent?.match).toBe(true)
      expect(result.alcoholContent?.extracted).toBe(5.1)
    })
  })
})
