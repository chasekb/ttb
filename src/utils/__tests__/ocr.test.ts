import { extractTextFromImage, isOCRResult } from '../ocr'
import { OCRProviderFactory } from '../ocrProviders'
import { OCRResult, ProcessingError } from '@/types'

// Mock the OCRProviderFactory
jest.mock('../ocrProviders', () => ({
  OCRProviderFactory: {
    extractTextFromImage: jest.fn(),
  },
}))

describe('ocr', () => {
  const mockFile = new File(['test content'], 'test.jpg', { type: 'image/jpeg' })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('extractTextFromImage', () => {
    it('should call OCRProviderFactory with correct parameters', async () => {
      const mockResult: OCRResult = {
        text: 'Test OCR text',
        confidence: 0.95,
      }

      ;(OCRProviderFactory.extractTextFromImage as jest.Mock).mockResolvedValue(mockResult)

      const result = await extractTextFromImage(mockFile, 'google-cloud-vision')

      expect(OCRProviderFactory.extractTextFromImage).toHaveBeenCalledWith(
        mockFile,
        'google-cloud-vision'
      )
      expect(result).toEqual(mockResult)
    })

    it('should use default provider when none specified', async () => {
      const mockResult: OCRResult = {
        text: 'Default provider text',
        confidence: 0.90,
      }

      ;(OCRProviderFactory.extractTextFromImage as jest.Mock).mockResolvedValue(mockResult)

      await extractTextFromImage(mockFile)

      expect(OCRProviderFactory.extractTextFromImage).toHaveBeenCalledWith(
        mockFile,
        'google-cloud-vision'
      )
    })

    it('should handle OCR provider errors', async () => {
      const mockError: ProcessingError = {
        type: 'OCR_FAILED',
        message: 'OCR processing failed',
      }

      ;(OCRProviderFactory.extractTextFromImage as jest.Mock).mockResolvedValue(mockError)

      const result = await extractTextFromImage(mockFile)

      expect(result).toEqual(mockError)
    })

    it('should handle different OCR providers', async () => {
      const mockResult: OCRResult = {
        text: 'Tesseract text',
        confidence: 0.85,
      }

      ;(OCRProviderFactory.extractTextFromImage as jest.Mock).mockResolvedValue(mockResult)

      await extractTextFromImage(mockFile, 'tesseract')

      expect(OCRProviderFactory.extractTextFromImage).toHaveBeenCalledWith(
        mockFile,
        'tesseract'
      )
    })
  })

  describe('isOCRResult', () => {
    it('should return true for valid OCRResult', () => {
      const ocrResult: OCRResult = {
        text: 'Sample text',
        confidence: 0.95,
      }

      expect(isOCRResult(ocrResult)).toBe(true)
    })

    it('should return false for ProcessingError', () => {
      const processingError: ProcessingError = {
        type: 'OCR_FAILED',
        message: 'Processing failed',
      }

      expect(isOCRResult(processingError)).toBe(false)
    })

    it('should return false for objects without required properties', () => {
      const invalidObject = {
        text: 'Some text',
        // missing confidence
      }

      expect(isOCRResult(invalidObject as any)).toBe(false)
    })

    it('should return false for objects with wrong property types', () => {
      const invalidObject = {
        text: 123, // should be string
        confidence: '0.95', // should be number
      }

      expect(isOCRResult(invalidObject as any)).toBe(false)
    })
  })
})
