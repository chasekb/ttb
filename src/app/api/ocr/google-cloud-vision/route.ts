// Google Cloud Vision API endpoint

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

    // Log environment variables (without exposing sensitive data)
    console.log('Environment variables loaded:', {
      GOOGLE_CLOUD_PROJECT_ID: process.env.GOOGLE_CLOUD_PROJECT_ID ? '***configured***' : 'NOT_SET',
      GOOGLE_CLOUD_CLIENT_EMAIL: process.env.GOOGLE_CLOUD_CLIENT_EMAIL ? '***configured***' : 'NOT_SET',
      GOOGLE_CLOUD_PRIVATE_KEY: process.env.GOOGLE_CLOUD_PRIVATE_KEY ? '***configured***' : 'NOT_SET',
      NODE_ENV: process.env.NODE_ENV,
    });

    // Check for Google Cloud credentials
    if (!process.env.GOOGLE_CLOUD_PROJECT_ID || !process.env.GOOGLE_CLOUD_PRIVATE_KEY) {
      console.error('Missing required Google Cloud environment variables');
      return NextResponse.json(
        { error: 'Google Cloud Vision API credentials not configured' },
        { status: 500 }
      );
    }

    // Import Google Cloud Vision API client
    const { ImageAnnotatorClient } = await import('@google-cloud/vision');
    
    // Initialize the client
    const client = new ImageAnnotatorClient({
      projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
      credentials: {
        client_email: process.env.GOOGLE_CLOUD_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_CLOUD_PRIVATE_KEY.replace(/\\n/g, '\n'),
      },
    });

    // Prepare the image for the API
    const imageBuffer = Buffer.from(image, 'base64');
    const imageRequest = {
      image: { content: imageBuffer },
      features: [{ type: 'TEXT_DETECTION' as const }],
    };

    // Call the Vision API
    const [result] = await client.annotateImage(imageRequest);
    const detections = result.textAnnotations;

    if (!detections || detections.length === 0) {
      return NextResponse.json({
        text: '',
        confidence: 0,
      });
    }

    // Extract text and calculate average confidence
    const fullText = detections[0].description || '';
    const confidence = detections[0].score || 0;

    return NextResponse.json({
      text: fullText,
      confidence: confidence,
    });

  } catch (error) {
    console.error('Google Cloud Vision API error:', error);
    return NextResponse.json(
      { error: 'Failed to process image with Google Cloud Vision API' },
      { status: 500 }
    );
  }
}
