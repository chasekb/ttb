import '@testing-library/jest-dom'

// Mock environment variables for testing
process.env.NEXT_PUBLIC_GOOGLE_VISION_API_KEY = 'test-api-key'
process.env.NEXT_PUBLIC_AZURE_VISION_API_KEY = 'test-api-key'
process.env.NEXT_PUBLIC_AZURE_VISION_ENDPOINT = 'https://test.cognitiveservices.azure.com/'

// Mock fetch for API tests
global.fetch = jest.fn()

// Mock File for file upload tests
global.File = class {
  name: string
  size: number
  type: string
  lastModified: number

  constructor(chunks: any[], filename: string, options?: any) {
    this.name = filename
    this.size = chunks.reduce((acc: number, chunk: any) => acc + (chunk.length || 0), 0)
    this.type = options?.type || ''
    this.lastModified = Date.now()
  }

  arrayBuffer() {
    return Promise.resolve(new ArrayBuffer(this.size))
  }

  text() {
    return Promise.resolve('mock file content')
  }
} as any

// Mock FileReader for file upload tests
global.FileReader = class {
  result: string | ArrayBuffer | null = null
  error: any = null
  readyState: number = 0

  readAsDataURL() {
    this.readyState = 1
    setTimeout(() => {
      this.result = 'data:image/jpeg;base64,mock-base64-data'
      this.readyState = 2
      if (this.onload) this.onload({} as any)
    }, 0)
  }

  readAsText() {
    this.readyState = 1
    setTimeout(() => {
      this.result = 'mock file content'
      this.readyState = 2
      if (this.onload) this.onload({} as any)
    }, 0)
  }

  abort() {
    this.readyState = 0
    if (this.onabort) this.onabort({} as any)
  }

  onload: ((event: any) => void) | null = null
  onerror: ((event: any) => void) | null = null
  onabort: ((event: any) => void) | null = null
} as any

// Mock URL.createObjectURL and URL.revokeObjectURL
global.URL.createObjectURL = jest.fn(() => 'mock-object-url')
global.URL.revokeObjectURL = jest.fn()

// Mock ResizeObserver
global.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
} as any

// Mock IntersectionObserver
global.IntersectionObserver = class {
  constructor() {}
  observe() {}
  unobserve() {}
  disconnect() {}
} as any
