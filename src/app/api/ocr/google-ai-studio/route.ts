// app/api/ocr/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { fileTypeFromBuffer } from 'file-type';

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

    // ✅ Validate Base64
    const base64Regex = /^[A-Za-z0-9+/=]+$/;
    if (!base64Regex.test(image.replace(/\s/g, ''))) {
      return NextResponse.json(
        { error: 'Invalid Base64 image data' },
        { status: 400 }
      );
    }

    // ✅ Convert to Buffer
    const imageBuffer = Buffer.from(image, 'base64');

    // ✅ Detect MIME type using `file-type`
    const detectedType = await fileTypeFromBuffer(imageBuffer);
    const mimeType = detectedType?.mime || 'image/png'; // fallback

    // ✅ Google AI Studio endpoint (latest stable)
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GOOGLE_AI_API_KEY}`;

    // ✅ Build request payload
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

    // ✅ Call Google AI Studio
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
        try {
          rawResponse = await response.text();
          errorData = { rawResponse };
        } catch {
          rawResponse = '[No response body]';
        }
      }

      // Flatten nested "error" object if present
      if (errorData.error && typeof errorData.error === 'object') {
        errorData = { ...errorData, ...errorData.error };
        delete errorData.error;
      }

      const errorDetails = {
        message:
          errorData.message ||
          rawResponse ||
          `Google AI Studio API error: ${response.status} ${response.statusText}`,
        code: errorData.code || response.status,
        status: errorData.status || response.statusText,
        details: errorData.details || null,
        ...errorData,
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

      console.error('Google AI Studio API Error (Full Dump):', errorDetails);
      return NextResponse.json(errorDetails, { status: response.status });
    }

    // ---------- SUCCESS ----------
    const data = await response.json();
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

    return NextResponse.json({ text: extractedText, confidence });
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
