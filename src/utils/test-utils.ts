/**
 * Test utilities for TTB Label Verification System
 */

export const createMockImageFile = (
  name: string = 'test.jpg',
  size: number = 1024 * 1024, // 1MB default
  type: string = 'image/jpeg'
): File => {
  const file = new File(['mock image content'], name, { type })
  Object.defineProperty(file, 'size', { value: size, writable: false })
  return file
}

export const createMockTextFile = (
  name: string = 'test.txt',
  size: number = 1024,
  type: string = 'text/plain'
): File => {
  const file = new File(['mock text content'], name, { type })
  Object.defineProperty(file, 'size', { value: size, writable: false })
  return file
}

export const createMockPDFFile = (
  name: string = 'test.pdf',
  size: number = 2 * 1024 * 1024, // 2MB default
  type: string = 'application/pdf'
): File => {
  const file = new File(['mock pdf content'], name, { type })
  Object.defineProperty(file, 'size', { value: size, writable: false })
  return file
}

export const mockOCRProviders = {
  googleCloudVision: {
    extractTextFromImage: jest.fn().mockResolvedValue({
      text: 'Mock Google Cloud Vision OCR text',
      confidence: 0.95,
    }),
  },
  tesseract: {
    extractTextFromImage: jest.fn().mockResolvedValue({
      text: 'Mock Tesseract OCR text',
      confidence: 0.85,
    }),
  },
  azure: {
    extractTextFromImage: jest.fn().mockResolvedValue({
      text: 'Mock Azure OCR text',
      confidence: 0.90,
    }),
  },
}

export const mockOCRResult = {
  text: 'Budweiser Premium Beer 5.0% ABV 12 FL OZ Government Warning',
  confidence: 0.95,
}

export const mockVerificationResult = {
  overallMatch: true,
  brandName: {
    match: true,
    extracted: 'Budweiser',
    expected: 'Budweiser',
  },
  productClass: {
    match: true,
    extracted: 'Beer',
    expected: 'Beer',
  },
  alcoholContent: {
    match: true,
    extracted: 5.0,
    expected: 5.0,
  },
  netContents: {
    match: true,
    extracted: '12 FL OZ',
    expected: '12 FL OZ',
  },
  governmentWarning: {
    found: true,
    text: 'GOVERNMENT WARNING',
  },
  ocrConfidence: 0.95,
  extractedText: 'Budweiser Premium Beer 5.0% ABV 12 FL OZ Government Warning',
}

export const mockTTBFormData = {
  brandName: 'Budweiser',
  productClass: 'Beer',
  alcoholContent: 5.0,
  netContents: '12 FL OZ',
  ocrProvider: 'google-cloud-vision',
}

// Mock fetch responses for API testing
export const mockFetchResponses = {
  success: {
    ok: true,
    status: 200,
    json: async () => ({
      text: 'Mock OCR response text',
      confidence: 0.95,
    }),
  },
  error: {
    ok: false,
    status: 500,
    json: async () => ({
      error: 'Internal server error',
    }),
  },
  notFound: {
    ok: false,
    status: 404,
    json: async () => ({
      error: 'Not found',
    }),
  },
}

// Helper function to wait for async operations in tests
export const waitForAsync = (ms: number = 0): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// Helper to create mock events for testing
export const createMockEvent = (type: string, data: any = {}): Event => {
  const event = new Event(type)
  Object.assign(event, data)
  return event
}

// Helper to create mock data transfer for drag and drop tests
export const createMockDataTransfer = (files: File[] = []): DataTransfer => {
  const dataTransfer = {
    files,
    types: files.length > 0 ? ['Files'] : [],
    getData: jest.fn(),
    setData: jest.fn(),
    clearData: jest.fn(),
    items: files.map(file => ({
      kind: 'file',
      type: file.type,
      getAsFile: () => file,
    })),
  }
  return dataTransfer as any
}
