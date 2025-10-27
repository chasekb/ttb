import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  let image: string | undefined;
  let lastApiResult: any = null; // Store Vision API response for debugging

  try {
    const body = await request.json();
    image = body.image;

    if (!image) {
      return NextResponse.json(
        { error: 'No image provided' },
        { status: 400 }
      );
    }

    // Validate credentials early
    const missingCredentials = [];
    if (!process.env.GOOGLE_CLOUD_PROJECT_ID) missingCredentials.push('GOOGLE_CLOUD_PROJECT_ID');
    if (!process.env.GOOGLE_CLOUD_PRIVATE_KEY) missingCredentials.push('GOOGLE_CLOUD_PRIVATE_KEY');
    if (!process.env.GOOGLE_CLOUD_CLIENT_EMAIL) missingCredentials.push('GOOGLE_CLOUD_CLIENT_EMAIL');

    if (missingCredentials.length > 0) {
      return NextResponse.json(
        {
          error: 'Google Cloud Vision API credentials not configured.',
          missingCredentials,
        },
        { status: 500 }
      );
    }

    // Import and initialize Vision API client
    const { ImageAnnotatorClient } = await import('@google-cloud/vision');
    const client = new ImageAnnotatorClient({
      projectId: process.env.GOOGLE_CLOUD_PROJECT_ID!,
      credentials: {
        client_email: process.env.GOOGLE_CLOUD_CLIENT_EMAIL!,
        private_key: process.env.GOOGLE_CLOUD_PRIVATE_KEY!.replace(/\\n/g, '\n'),
      },
    });

    // Prepare image for Vision API
    const imageBuffer = Buffer.isBuffer(image)
      ? image
      : Buffer.from(image.replace(/^data:image\/\w+;base64,/, ''), 'base64');

    const imageRequest = {
      image: { content: imageBuffer },
      features: [{ type: 'TEXT_DETECTION' as const }],
    };

    // Perform Vision API call
    const [apiResult] = await client.annotateImage(imageRequest);
    lastApiResult = apiResult;

    const detections = apiResult.textAnnotations;

    if (!detections || detections.length === 0) {
      return NextResponse.json({
        text: '',
        confidence: 0,
        apiResult, // Return full raw result for transparency
      });
    }

    const fullText = detections[0].description || '';
    const confidence = detections[0].score || 0;

    return NextResponse.json({
      text: fullText,
      confidence,
      apiResult, // Include the full Vision API output
    });
  } catch (error: any) {
    console.error('Google Cloud Vision API error (raw):', error);

    // Try to extract as much as possible
    const allProps: Record<string, any> = {};
    try {
      const props = [
        ...Object.getOwnPropertyNames(error),
        ...Object.getOwnPropertySymbols(error).map((s) => s.toString()),
      ];
      for (const key of props) {
        try {
          allProps[key] =
            typeof (error as any)[key] === 'object'
              ? JSON.stringify((error as any)[key], null, 2)
              : (error as any)[key];
        } catch (innerErr) {
          allProps[key] = `[unreadable: ${(innerErr as Error)?.message}]`;
        }
      }
    } catch (extractErr) {
      allProps['_errorPropsExtractionFailed'] = (extractErr as Error)?.message;
    }

    // Google Vision often attaches useful info in gRPC metadata and details
    const errorResponse = {
      message: error?.message || 'Unknown error',
      name: error?.name,
      code: error?.code,
      status: error?.status,
      details: error?.details,
      note: error?.note,
      metadata: error?.metadata
        ? JSON.stringify(error.metadata, null, 2)
        : 'No metadata',
      stack: error?.stack || 'No stack trace',
      fullStringified: JSON.stringify(error, Object.getOwnPropertyNames(error), 2),
      allProperties: allProps,
      context: {
        imageSize: image ? image.length : 'No image provided',
        hasCredentials: {
          projectId: !!process.env.GOOGLE_CLOUD_PROJECT_ID,
          privateKey: !!process.env.GOOGLE_CLOUD_PRIVATE_KEY,
          clientEmail: !!process.env.GOOGLE_CLOUD_CLIENT_EMAIL,
        },
      },
      lastApiResult: lastApiResult || null,
    };

    console.error('Full error details:', JSON.stringify(errorResponse, null, 2));

    return NextResponse.json(
      {
        error: 'Failed to process image with Google Cloud Vision.',
        details: errorResponse,
      },
      { status: 500 }
    );
  }
}