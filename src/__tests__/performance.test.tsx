import { performance } from 'perf_hooks'
import { extractAlcoholPercentage, normalizeText } from '../utils/textProcessing'
import { verifyLabel } from '../lib/verification'
import { createMockImageFile } from '../utils/test-utils'

// Mock OCR provider for performance testing
jest.mock('../utils/ocrProviders', () => ({
  OCRProviderFactory: {
    extractTextFromImage: jest.fn().mockResolvedValue({
      text: 'Budweiser Premium Beer 5.0% ABV 12 FL OZ Government Warning',
      confidence: 0.95,
    }),
  },
}))

describe('Performance Tests', () => {
  describe('Text Processing Performance', () => {
    it('should process text extraction within acceptable time', async () => {
      const startTime = performance.now()

      // Test multiple text processing operations
      const testTexts = [
        'Budweiser Premium Beer 5.0% ABV 12 FL OZ Government Warning',
        'Coors Light 4.2% Alcohol by Volume 16 FL OZ',
        'Jack Daniels Whiskey 40% ABV 750 ML',
        'Wine 12.5% Alcohol 5 Liter Box',
        'Craft IPA 6.8% ABV 22 FL OZ Government Warning Text Here',
      ]

      for (const text of testTexts) {
        normalizeText(text)
        extractAlcoholPercentage(text)
      }

      const endTime = performance.now()
      const duration = endTime - startTime

      expect(duration).toBeLessThan(100) // Should complete within 100ms
    })

    it('should handle large text inputs efficiently', () => {
      const startTime = performance.now()

      // Create large text (10KB)
      const largeText = 'Government Warning Text '.repeat(1000) +
        'Budweiser Premium Beer 5.0% ABV 12 FL OZ ' +
        'Additional text content '.repeat(500)

      normalizeText(largeText)
      extractAlcoholPercentage(largeText)

      const endTime = performance.now()
      const duration = endTime - startTime

      expect(duration).toBeLessThan(50) // Should handle large text within 50ms
    })
  })

  describe('Verification Performance', () => {
    it('should complete label verification within acceptable time', async () => {
      const startTime = performance.now()

      const mockFormData = {
        brandName: 'Budweiser',
        productClass: 'Beer',
        alcoholContent: 5.0,
        netContents: '12 FL OZ',
      }

      const mockOCRResult = {
        text: 'Budweiser Premium Beer 5.0% ABV 12 FL OZ Government Warning',
        confidence: 0.95,
      }

      // Run verification multiple times
      for (let i = 0; i < 10; i++) {
        verifyLabel(mockFormData, mockOCRResult)
      }

      const endTime = performance.now()
      const duration = endTime - startTime

      expect(duration).toBeLessThan(200) // Should complete 10 verifications within 200ms
    })
  })

  describe('OCR Processing Performance', () => {
    it('should simulate OCR processing time', async () => {
      const startTime = performance.now()

      const file = createMockImageFile('test.jpg')

      // Mock OCR provider call
      const { OCRProviderFactory } = require('../utils/ocrProviders')
      await OCRProviderFactory.extractTextFromImage(file, 'google-cloud-vision')

      const endTime = performance.now()
      const duration = endTime - startTime

      // In real implementation, this would be much longer due to API calls
      // For testing, we just verify the mock completes quickly
      expect(duration).toBeLessThan(10)
    })
  })

  describe('Memory Usage', () => {
    it('should not leak memory during repeated operations', () => {
      const initialMemory = process.memoryUsage().heapUsed

      // Perform many operations
      for (let i = 0; i < 1000; i++) {
        const text = `Test Beer ${i} 5.0% ABV 12 FL OZ`
        normalizeText(text)
        extractAlcoholPercentage(text)
      }

      // Force garbage collection if available
      if (global.gc) {
        global.gc()
      }

      const finalMemory = process.memoryUsage().heapUsed
      const memoryIncrease = finalMemory - initialMemory

      // Memory increase should be reasonable (less than 50MB)
      expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024)
    })
  })
})
