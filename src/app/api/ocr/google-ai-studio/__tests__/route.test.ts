// Google AI Studio API endpoint tests

// Mock fetch globally before any imports
const mockFetch = global.fetch = jest.fn() as jest.MockedFunction<typeof fetch>;

// Mock NextRequest before importing the route
jest.mock('next/server', () => ({
  NextRequest: jest.fn().mockImplementation((url, options) => ({
    json: jest.fn().mockResolvedValue(options?.body ? JSON.parse(options.body as string) : {}),
  })),
  NextResponse: {
    json: jest.fn().mockImplementation((data, options) => ({
      status: options?.status || 200,
      json: jest.fn().mockResolvedValue(data),
    })),
  },
}));

import { NextRequest } from 'next/server';
import { POST } from '../route';

describe('/api/ocr/google-ai-studio', () => {
  beforeEach(() => {
    mockFetch.mockClear();
    // Mock environment variable
    process.env.GOOGLE_AI_API_KEY = 'test-api-key';
  });

  afterEach(() => {
    delete process.env.GOOGLE_AI_API_KEY;
    mockFetch.mockReset();
  });

  it('should return 400 if no image provided', async () => {
    const request = new NextRequest('http://localhost:3000/api/ocr/google-ai-studio', {
      method: 'POST',
      body: JSON.stringify({}),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('No image provided');
  });

  it('should return 500 if API key not configured', async () => {
    delete process.env.GOOGLE_AI_API_KEY;

    const request = new NextRequest('http://localhost:3000/api/ocr/google-ai-studio', {
      method: 'POST',
      body: JSON.stringify({ image: 'base64data' }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Google AI Studio API key not configured');
  });

  it('should successfully process image and return text', async () => {
    const mockApiResponse = {
      candidates: [
        {
          content: {
            parts: [
              {
                text: 'Sample extracted text from image'
              }
            ]
          },
          finishReason: 'STOP'
        }
      ]
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockApiResponse,
    } as Response);

    const request = new NextRequest('http://localhost:3000/api/ocr/google-ai-studio', {
      method: 'POST',
      body: JSON.stringify({ image: 'base64data' }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.text).toBe('Sample extracted text from image');
    expect(data.confidence).toBe(0.9);
    expect(mockFetch).toHaveBeenCalledWith(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=test-api-key',
      expect.objectContaining({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: expect.stringContaining('base64data'),
      })
    );
  });

  it('should handle API errors gracefully', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      statusText: 'Internal Server Error',
    } as Response);

    const request = new NextRequest('http://localhost:3000/api/ocr/google-ai-studio', {
      method: 'POST',
      body: JSON.stringify({ image: 'base64data' }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Failed to process image with Google AI Studio');
  });

  it('should handle empty text response', async () => {
    const mockApiResponse = {
      candidates: [
        {
          content: {
            parts: [
              {
                text: ''
              }
            ]
          },
          finishReason: 'STOP'
        }
      ]
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockApiResponse,
    } as Response);

    const request = new NextRequest('http://localhost:3000/api/ocr/google-ai-studio', {
      method: 'POST',
      body: JSON.stringify({ image: 'base64data' }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.text).toBe('');
    expect(data.confidence).toBe(0);
  });

  it('should handle truncated response with lower confidence', async () => {
    const mockApiResponse = {
      candidates: [
        {
          content: {
            parts: [
              {
                text: 'Some text that was truncated'
              }
            ]
          },
          finishReason: 'MAX_TOKENS'
        }
      ]
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockApiResponse,
    } as Response);

    const request = new NextRequest('http://localhost:3000/api/ocr/google-ai-studio', {
      method: 'POST',
      body: JSON.stringify({ image: 'base64data' }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.text).toBe('Some text that was truncated');
    expect(data.confidence).toBe(0.7);
  });
});
