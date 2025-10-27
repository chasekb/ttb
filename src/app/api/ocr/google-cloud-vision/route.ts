// Google Cloud Vision API endpoint

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

    // Check for Google Cloud credentials
    if (!process.env.GOOGLE_CLOUD_PROJECT_ID || !process.env.GOOGLE_CLOUD_PRIVATE_KEY || !process.env.GOOGLE_CLOUD_CLIENT_EMAIL) {
      return NextResponse.json(
        { 
          error: 'Google Cloud Vision API credentials not configured. Please configure the following environment variables: GOOGLE_CLOUD_PROJECT_ID, GOOGLE_CLOUD_PRIVATE_KEY, and GOOGLE_CLOUD_CLIENT_EMAIL.' 
        },
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

    // Prepare the image for the API - Google Cloud Vision expects raw bytes
    const imageBuffer = Buffer.from(image, 'base64');
    const imageRequest = {
      image: { content: imageBuffer },
      features: [{ type: 'TEXT_DETECTION' as const }],
    };

    // Call the Vision API
    const [result] = await client.annotateImage(imageRequest);
    const detections = result.textAnnotations;

    console.log('Google Cloud Vision API result:', {
      hasDetections: !!detections,
      detectionsCount: detections ? detections.length : 0,
      fullResult: result
    });

    if (!detections || detections.length === 0) {
      return NextResponse.json({
        text: '',
        confidence: 0,
      });
    }

    // Extract text and calculate average confidence
    const fullText = detections[0].description || '';
    const confidence = detections[0].score || 0;

    console.log('Google Cloud Vision extracted text:', {
      text: fullText.substring(0, 200),
      confidence: confidence
    });

    return NextResponse.json({
      text: fullText,
      confidence: confidence,
    });

  } catch (error) {
    console.error('Google Cloud Vision API error:', error);
    const errorDetails = {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace',
      imageSize: image ? image.length : 'No image',
      credentials: {
        hasProjectId: !!process.env.GOOGLE_CLOUD_PROJECT_ID,
        hasPrivateKey: !!process.env.GOOGLE_CLOUD_PRIVATE_KEY,
        hasClientEmail: !!process.env.GOOGLE_CLOUD_CLIENT_EMAIL,
      }
    };
    console.error('Error details:', errorDetails);
    
    // Return a more specific error message
    let errorMessage = error instanceof Error ? error.message : 'Failed to process the image with Google Cloud Vision. Please try again.';
    if (!errorMessage || errorMessage.trim() === '') {
      errorMessage = 'Unknown error occurred while processing the image';
    }
    
    // Determine details based on missing credentials
    let errorDetailsText = '';
    if (!errorDetails.credentials.hasProjectId) {
      errorDetailsText = 'Missing GOOGLE_CLOUD_PROJECT_ID';
    } else if (!errorDetails.credentials.hasPrivateKey) {
      errorDetailsText = 'Missing GOOGLE_CLOUD_PRIVATE_KEY';
    } else if (!errorDetails.credentials.hasClientEmail) {
      errorDetailsText = 'Missing GOOGLE_CLOUD_CLIENT_EMAIL';
    } else {
      errorDetailsText = errorMessage;
    }
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: errorDetailsText
      },
      { status: 500 }
    );
  }
}
