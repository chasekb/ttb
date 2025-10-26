import { NextRequest } from 'next/server'
import { POST } from '../route'

// Mock the Google Cloud Vision API
jest.mock('@google-cloud/vision', () => ({
  ImageAnnotatorClient: jest.fn().mockImplementation(() => ({
    annotateImage: jest.fn().mockResolvedValue([
      {
        textAnnotations: [
          {
            description: 'Mock OCR text from Google Cloud Vision',
            score: 0.95,
          },
        ],
      },
    ]),
  })),
}))

// Mock environment variables
process.env.GOOGLE_CLOUD_PROJECT_ID = 'test-project'
process.env.GOOGLE_CLOUD_CLIENT_EMAIL = 'test@test.iam.gserviceaccount.com'
process.env.GOOGLE_CLOUD_PRIVATE_KEY = '-----BEGIN PRIVATE KEY-----\ntest-key\n-----END PRIVATE KEY-----'

describe('/api/ocr/google-cloud-vision', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should successfully process image and return OCR text', async () => {
    const mockImageData = 'data:image/jpeg;base64,mock-base64-data'
    const request = new NextRequest('http://localhost:3000/api/ocr/google-cloud-vision', {
      method: 'POST',
      body: JSON.stringify({ image: mockImageData }),
      headers: {
        'content-type': 'application/json',
      },
    })

    const response = await POST(request)
    const result = await response.json()

    expect(response.status).toBe(200)
    expect(result).toEqual({
      text: 'Mock OCR text from Google Cloud Vision',
      confidence: 0.95,
    })
  })

  it('should return 400 error when no image provided', async () => {
    const request = new NextRequest('http://localhost:3000/api/ocr/google-cloud-vision', {
      method: 'POST',
      body: JSON.stringify({}),
      headers: {
        'content-type': 'application/json',
      },
    })

    const response = await POST(request)
    const result = await response.json()

    expect(response.status).toBe(400)
    expect(result).toEqual({
      error: 'No image provided',
    })
  })

  it('should return 500 error when credentials not configured', async () => {
    // Temporarily remove credentials
    const originalProjectId = process.env.GOOGLE_CLOUD_PROJECT_ID
    const originalPrivateKey = process.env.GOOGLE_CLOUD_PRIVATE_KEY

    delete process.env.GOOGLE_CLOUD_PROJECT_ID
    delete process.env.GOOGLE_CLOUD_PRIVATE_KEY

    const mockImageData = 'data:image/jpeg;base64,mock-base64-data'
    const request = new NextRequest('http://localhost:3000/api/ocr/google-cloud-vision', {
      method: 'POST',
      body: JSON.stringify({ image: mockImageData }),
      headers: {
        'content-type': 'application/json',
      },
    })

    const response = await POST(request)
    const result = await response.json()

    expect(response.status).toBe(500)
    expect(result).toEqual({
      error: 'Google Cloud Vision API credentials not configured',
    })

    // Restore credentials
    process.env.GOOGLE_CLOUD_PROJECT_ID = originalProjectId
    process.env.GOOGLE_CLOUD_PRIVATE_KEY = originalPrivateKey
  })

  it('should handle Google Cloud Vision API errors', async () => {
    // Mock API error
    const { ImageAnnotatorClient } = require('@google-cloud/vision')
    ImageAnnotatorClient.mockImplementationOnce(() => ({
      annotateImage: jest.fn().mockRejectedValue(new Error('API Error')),
    }))

    const mockImageData = 'data:image/jpeg;base64,mock-base64-data'
    const request = new NextRequest('http://localhost:3000/api/ocr/google-cloud-vision', {
      method: 'POST',
      body: JSON.stringify({ image: mockImageData }),
      headers: {
        'content-type': 'application/json',
      },
    })

    const response = await POST(request)
    const result = await response.json()

    expect(response.status).toBe(500)
    expect(result).toEqual({
      error: 'Failed to process image with Google Cloud Vision API',
    })
  })

  it('should handle empty OCR results', async () => {
    // Mock empty result
    const { ImageAnnotatorClient } = require('@google-cloud/vision')
    ImageAnnotatorClient.mockImplementationOnce(() => ({
      annotateImage: jest.fn().mockResolvedValue([{
        textAnnotations: [],
      }]),
    }))

    const mockImageData = 'data:image/jpeg;base64,mock-base64-data'
    const request = new NextRequest('http://localhost:3000/api/ocr/google-cloud-vision', {
      method: 'POST',
      body: JSON.stringify({ image: mockImageData }),
      headers: {
        'content-type': 'application/json',
      },
    })

    const response = await POST(request)
    const result = await response.json()

    expect(response.status).toBe(200)
    expect(result).toEqual({
      text: '',
      confidence: 0,
    })
  })

  it('should handle missing text annotations', async () => {
    // Mock result without text annotations
    const { ImageAnnotatorClient } = require('@google-cloud/vision')
    ImageAnnotatorClient.mockImplementationOnce(() => ({
      annotateImage: jest.fn().mockResolvedValue([{}]),
    }))

    const mockImageData = 'data:image/jpeg;base64,mock-base64-data'
    const request = new NextRequest('http://localhost:3000/api/ocr/google-cloud-vision', {
      method: 'POST',
      body: JSON.stringify({ image: mockImageData }),
      headers: {
        'content-type': 'application/json',
      },
    })

    const response = await POST(request)
    const result = await response.json()

    expect(response.status).toBe(200)
    expect(result).toEqual({
      text: '',
      confidence: 0,
    })
  })
})
