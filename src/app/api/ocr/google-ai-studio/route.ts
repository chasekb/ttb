// Google AI Studio OCR API Endpoint

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  let image: string | undefined;

  try {
    const body = await request.json();
    image = body.image;

    if (!image) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    if (!process.env.GOOGLE_AI_API_KEY) {
      return NextResponse.json(
        { error: 'Google AI Studio API key not configured' },
        { status: 500 }
      );
    }

    // Convert base64 image to buffer
    const imageBuffer = Buffer.from(image, 'base64');

    // Detect MIME type
    const mimeType =
      imageBuffer.length > 8 &&
      imageBuffer.toString('ascii', 0, 8) === '\x89PNG\r\n\x1a\n'
        ? 'image/png'
        : imageBuffer.length > 4 &&
          imageBuffer[0] === 0xff &&
          imageBuffer[1] === 0xd8 &&
          imageBuffer[2] === 0xff
        ? 'image/jpeg'
        : 'image/png';

    // Google AI Studio Gemini endpoint
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GOOGLE_AI_API_KEY}`;

    const requestBody = {
      contents: [
        {
          parts: [
            {
              text: 'Extract all text from this image. Return only the raw text content without any formatting or explanation.',
            },
            {
              inline_data: {
                mime_type: mimeType,
                data: imageBuffer.toString('base64'),
              },
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 2048,
      },
    };

    // Make request to Google AI Studio
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });

    // ---------- ERROR HANDLING ----------
    if (!response.ok) {
      let rawResponse = '';
      let errorData: any = {};

      try {
        errorData = await response.json();
      } catch {
        rawResponse = await response.text();
        errorData = { rawResponse };
      }

      // Flatten nested "error" object if present
      if (errorData.error && typeof errorData.error === 'object') {
        errorData = { ...errorData, ...errorData.error };
        delete errorData.error;
      }

      const errorDetails = {
        message:
          errorData.message ||
          `Google AI Studio API error: ${response.status} ${response.statusText}`,
        code: errorData.code,
        status: errorData.status || response.statusText,
        details: errorData.details,
        ...errorData, // include all remaining fields
        rawResponse: rawResponse || undefined,
        http: {
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries()),
        },
        request: {
          apiUrl,
          mimeType,
          imageSize: image?.length,
          hasApiKey: !!process.env.GOOGLE_AI_API_KEY,
        },
      };

      console.error('Google AI Studio API Error:', errorDetails);
      return NextResponse.json(errorDetails, { status: response.status });
    }
    // ---------- SUCCESS HANDLING ----------

    const data = await response.json();

    // Extract text from Gemini response
    const candidate = data.candidates?.[0];
    const textPart = candidate?.content?.parts?.[0]?.text ?? '';
    const extractedText = textPart.replace(/[#*_`]/g, '').trim();

    if (!extractedText) {
      return NextResponse.json({ text: '', confidence: 0 });
    }

    const confidence =
      candidate?.finishReason === 'STOP'
        ? 0.9
        : candidate?.finishReason === 'MAX_TOKENS'
        ? 0.7
        : 0.8;

    return NextResponse.json({
      text: extractedText,
      confidence,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';

    console.error('Google AI Studio API Fatal Error:', {
      message,
      stack: error instanceof Error ? error.stack : undefined,
      imageSize: image?.length,
      hasApiKey: !!process.env.GOOGLE_AI_API_KEY,
    });

    return NextResponse.json(
      {
        error: message,
        debug: {
          imageSize: image?.length,
          hasApiKey: !!process.env.GOOGLE_AI_API_KEY,
        },
      },
      { status: 500 }
    );
  }
}
