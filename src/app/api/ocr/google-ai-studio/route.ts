// Google AI Studio API endpoint

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  let image: string | undefined;

  try {
    const body = await request.json();
    image = body.image;

    if (!image) {
      return NextResponse.json(
        { error: 'No image provided' },
        { status: 400 }
      );
    }

    // Check for Google AI Studio credentials
    if (!process.env.GOOGLE_AI_API_KEY) {
      return NextResponse.json(
        { error: 'Google AI Studio API key not configured' },
        { status: 500 }
      );
    }

    // Clean up any whitespace/newlines from the base64 string
    const cleanImage = image.replace(/\s/g, '');

    // Convert base64 image to the format expected by Google AI Studio
    const imageBuffer = Buffer.from(cleanImage, 'base64');

    // Detect MIME type from the image buffer
    const mimeType = imageBuffer.length > 8 && imageBuffer.toString('ascii', 0, 8) === '\x89PNG\r\n\x1a\n'
      ? 'image/png'
      : imageBuffer.length > 4 && imageBuffer[0] === 0xFF && imageBuffer[1] === 0xD8 && imageBuffer[2] === 0xFF
      ? 'image/jpeg'
      : 'image/png'; // Default fallback to PNG since that's what we're testing with

    // Prepare the request for Google AI Studio Gemini API
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GOOGLE_AI_API_KEY}`;

    const requestBody = {
      contents: [
        {
          parts: [
            {
              text: "Extract all text from this image. Return only the raw text content without any additional formatting or explanation."
            },
            {
              inline_data: {
                mime_type: mimeType,
                data: cleanImage
              }
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 2048,
      }
    };

    // Call Google AI Studio API
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      let errorMessage = `Google AI Studio API error: ${response.status} ${response.statusText}`;
      let errorDetails = {};

      try {
        const errorData = await response.json();
        console.error('Google AI Studio API error response:', {
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries()),
          errorData: errorData
        });
        errorDetails = errorData;

        if (errorData.error && errorData.error.message) {
          errorMessage = `Google AI Studio API error: ${errorData.error.message}`;
        } else if (errorData.message) {
          errorMessage = `Google AI Studio API error: ${errorData.message}`;
        }
      } catch (jsonError) {
        // If response is not JSON, log the raw response
        const responseText = await response.text();
        console.error('Google AI Studio API error (non-JSON response):', {
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries()),
          responseText: responseText
        });
        errorDetails = { responseText };
      }

      // Log additional request details for debugging
      console.error('Google AI Studio API request details:', {
        apiUrl: apiUrl,
        mimeType: mimeType,
        imageSize: image.length,
        requestBody: requestBody
      });

      // Include detailed error information in the response for debugging
      const detailedError = {
        error: errorMessage,
        details: errorDetails,
        requestInfo: {
          apiUrl: apiUrl,
          mimeType: mimeType,
          imageSize: image.length
        }
      };

      console.error('Google AI Studio API final error:', detailedError);
      throw new Error(JSON.stringify(detailedError));
    }

    const data = await response.json();

    // Extract text from the response
    let extractedText = '';
    let confidence = 0.8; // Default confidence for AI models

    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
      extractedText = data.candidates[0].content.parts[0].text || '';

      // Clean up the text (remove any markdown formatting if present)
      extractedText = extractedText.replace(/[#*_`]/g, '').trim();

      // Calculate confidence based on response structure
      if (data.candidates[0].finishReason === 'STOP') {
        confidence = 0.9; // High confidence for complete responses
      } else if (data.candidates[0].finishReason === 'MAX_TOKENS') {
        confidence = 0.7; // Medium confidence for truncated responses
      }
    }

    if (!extractedText || extractedText.trim().length === 0) {
      return NextResponse.json({
        text: '',
        confidence: 0,
      });
    }

    return NextResponse.json({
      text: extractedText,
      confidence: confidence,
    });

  } catch (error) {
    console.error('Google AI Studio API error:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace',
      imageSize: image ? image.length : 'No image',
      credentials: {
        hasApiKey: !!process.env.GOOGLE_AI_API_KEY,
      }
    });

    // Return detailed error information for debugging
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      {
        error: 'Failed to process image with Google AI Studio',
        details: errorMessage,
        debug: {
          imageSize: image ? image.length : 'No image',
          hasApiKey: !!process.env.GOOGLE_AI_API_KEY,
        }
      },
      { status: 500 }
    );
  }
}
