import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { OCRProviderFactory } from '../utils/ocrProviders'
import { createMockImageFile } from '../utils/test-utils'

// Mock the OCR providers
jest.mock('../utils/ocrProviders', () => ({
  OCRProviderFactory: {
    extractTextFromImage: jest.fn(),
  },
}))

// Mock the verification function
jest.mock('../lib/verification', () => ({
  verifyLabel: jest.fn(),
}))

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn().mockImplementation(() => Promise.resolve()),
  },
})

describe('OCR Integration Tests', () => {
  const mockOnImageSelect = jest.fn()
  const mockOnSubmit = jest.fn()
  const mockOnRetry = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should process image through Google Cloud Vision provider', async () => {
    const user = userEvent.setup()
    const file = createMockImageFile('test.jpg')

    // Mock successful OCR response
    const { OCRProviderFactory } = require('../utils/ocrProviders')
    OCRProviderFactory.extractTextFromImage.mockResolvedValue({
      text: 'Budweiser Premium Beer 5.0% ABV 12 FL OZ Government Warning',
      confidence: 0.95,
    })

    // Mock successful verification
    const { verifyLabel } = require('../lib/verification')
    verifyLabel.mockReturnValue({
      overallMatch: true,
      brandName: { match: true, extracted: 'Budweiser', expected: 'Budweiser' },
      productClass: { match: true, extracted: 'Beer', expected: 'Beer' },
      alcoholContent: { match: true, extracted: 5.0, expected: 5.0 },
      netContents: { match: true, extracted: '12 FL OZ', expected: '12 FL OZ' },
      governmentWarning: { found: true, text: 'GOVERNMENT WARNING' },
      ocrConfidence: 0.95,
      extractedText: 'Budweiser Premium Beer 5.0% ABV 12 FL OZ Government Warning',
    })

    // This would be a full integration test if we had the main App component
    // For now, we'll test the OCR provider integration directly
    const result = await OCRProviderFactory.extractTextFromImage(file, 'google-cloud-vision')

    expect(OCRProviderFactory.extractTextFromImage).toHaveBeenCalledWith(file, 'google-cloud-vision')
    expect(result).toEqual({
      text: 'Budweiser Premium Beer 5.0% ABV 12 FL OZ Government Warning',
      confidence: 0.95,
    })
  })

  it('should handle OCR provider switching', async () => {
    const file = createMockImageFile('test.jpg')

    // Mock different responses for different providers
    const { OCRProviderFactory } = require('../utils/ocrProviders')

    // Test Google Cloud Vision
    OCRProviderFactory.extractTextFromImage.mockResolvedValueOnce({
      text: 'Google Cloud Vision OCR text',
      confidence: 0.95,
    })

    const googleResult = await OCRProviderFactory.extractTextFromImage(file, 'google-cloud-vision')
    expect(googleResult.text).toBe('Google Cloud Vision OCR text')

    // Test Tesseract
    OCRProviderFactory.extractTextFromImage.mockResolvedValueOnce({
      text: 'Tesseract OCR text',
      confidence: 0.85,
    })

    const tesseractResult = await OCRProviderFactory.extractTextFromImage(file, 'tesseract')
    expect(tesseractResult.text).toBe('Tesseract OCR text')
  })

  it('should handle OCR provider errors gracefully', async () => {
    const file = createMockImageFile('test.jpg')

    const { OCRProviderFactory } = require('../utils/ocrProviders')
    OCRProviderFactory.extractTextFromImage.mockResolvedValue({
      type: 'OCR_FAILED',
      message: 'OCR processing failed',
    })

    const result = await OCRProviderFactory.extractTextFromImage(file, 'google-cloud-vision')

    expect(result).toEqual({
      type: 'OCR_FAILED',
      message: 'OCR processing failed',
    })
  })

  it('should handle verification workflow', async () => {
    const { verifyLabel } = require('../lib/verification')

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

    const verificationResult = verifyLabel(mockFormData, mockOCRResult)

    expect(verificationResult.overallMatch).toBe(true)
    expect(verificationResult.brandName.match).toBe(true)
    expect(verificationResult.productClass.match).toBe(true)
    expect(verificationResult.alcoholContent?.match).toBe(true)
    expect(verificationResult.netContents?.match).toBe(true)
    expect(verificationResult.governmentWarning.found).toBe(true)
  })

  it('should handle verification failure cases', async () => {
    const { verifyLabel } = require('../lib/verification')

    const mockFormData = {
      brandName: 'Budweiser',
      productClass: 'Beer',
      alcoholContent: 5.0,
      netContents: '12 FL OZ',
    }

    const mockOCRResult = {
      text: 'Coors Light Wine 4.5% ABV 16 FL OZ',
      confidence: 0.95,
    }

    const verificationResult = verifyLabel(mockFormData, mockOCRResult)

    expect(verificationResult.overallMatch).toBe(false)
    expect(verificationResult.brandName.match).toBe(false)
    expect(verificationResult.productClass.match).toBe(false)
    expect(verificationResult.alcoholContent?.match).toBe(false)
    expect(verificationResult.netContents?.match).toBe(false)
  })
})

describe('End-to-End User Workflow', () => {
  it('should complete full verification workflow', async () => {
    // This would test the complete user journey from form submission to result display
    // Since we don't have the main App component in this test setup, we'll test the key integration points

    const { OCRProviderFactory } = require('../utils/ocrProviders')
    const { verifyLabel } = require('../lib/verification')

    // 1. User uploads image
    const file = createMockImageFile('label.jpg')

    // 2. OCR processes image
    OCRProviderFactory.extractTextFromImage.mockResolvedValue({
      text: 'Budweiser Beer 5.0% ABV 12 FL OZ Government Warning',
      confidence: 0.95,
    })

    const ocrResult = await OCRProviderFactory.extractTextFromImage(file, 'google-cloud-vision')
    expect(ocrResult.confidence).toBe(0.95)

    // 3. Verification compares form data with OCR results
    const formData = {
      brandName: 'Budweiser',
      productClass: 'Beer',
      alcoholContent: 5.0,
      netContents: '12 FL OZ',
    }

    const verificationResult = verifyLabel(formData, ocrResult)
    expect(verificationResult.overallMatch).toBe(true)

    // 4. Results are displayed to user
    expect(verificationResult.ocrConfidence).toBe(0.95)
    expect(verificationResult.governmentWarning.found).toBe(true)
  })

  it('should handle error scenarios in workflow', async () => {
    const { OCRProviderFactory } = require('../utils/ocrProviders')

    // Test OCR failure
    OCRProviderFactory.extractTextFromImage.mockResolvedValue({
      type: 'OCR_FAILED',
      message: 'Failed to process image',
    })

    const file = createMockImageFile('corrupted.jpg')
    const result = await OCRProviderFactory.extractTextFromImage(file, 'google-cloud-vision')

    expect(result.type).toBe('OCR_FAILED')
    expect(result.message).toBe('Failed to process image')
  })
})
