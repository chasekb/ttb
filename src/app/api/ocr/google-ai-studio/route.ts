// Google AI Studio API endpoint

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { image } = await request.json();

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

    // Convert base64 image to the format expected by Google AI Studio
    const imageBuffer = Buffer.from(image, 'base64');
    const mimeType = 'image/jpeg'; // Default to JPEG, could be enhanced to detect actual type

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
                mime_type: `image/${mimeType.split('/')[1]}`,
                data: image
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
      let errorMessage = `Google AI Studio API error: ${response.statusText}`;
      try {
        const errorData = await response.json();
        console.error('Google AI Studio API error:', errorData);
        if (errorData.error && errorData.error.message) {
          errorMessage = `Google AI Studio API error: ${errorData.error.message}`;
        }
      } catch (jsonError) {
        // If response is not JSON, use the status text
        console.error('Google AI Studio API error (non-JSON response):', response.statusText);
      }
      throw new Error(errorMessage);
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
    return NextResponse.json(
      { error: 'Failed to process image with Google AI Studio' },
      { status: 500 }
    );
  }
}
