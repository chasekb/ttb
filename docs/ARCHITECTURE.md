# TTB Label Verification System - Architecture Documentation

## System Overview

The TTB Label Verification System is a Next.js web application that simulates TTB (Alcohol and Tobacco Tax and Trade Bureau) label verification by comparing form inputs with OCR-extracted text from alcohol label images.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend Layer                          │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │
│  │ TTBForm     │  │ImageUpload  │  │ResultsDisplay│            │
│  │ Component   │  │ Component   │  │ Component   │            │
│  └─────────────┘  └─────────────┘  └─────────────┘            │
│         │                │                │                   │
│         └────────────────┼────────────────┘                   │
│                          │                                    │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │                Main Page Component                       │  │
│  │              (State Management)                         │  │
│  └─────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Business Logic Layer                       │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │
│  │   OCR       │  │Verification │  │Text         │            │
│  │ Processing  │  │ Logic       │  │Processing  │            │
│  │ (Dual)      │  │             │  │ Utils      │            │
│  └─────────────┘  └─────────────┘  └─────────────┘            │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                        Data Layer                               │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │
│  │   Types     │  │   File      │  │   State     │            │
│  │ Definitions │  │ Handling    │  │ Management  │            │
│  │             │  │             │  │             │            │
│  └─────────────┘  └─────────────┘  └─────────────┘            │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                      OCR Provider Layer                         │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │
│  │ Tesseract.js│  │Google Cloud │  │OCR Provider │            │
│  │ (Client)    │  │Vision API   │  │Factory      │            │
│  │             │  │ (Server)    │  │             │            │
│  └─────────────┘  └─────────────┘  └─────────────┘            │
└─────────────────────────────────────────────────────────────────┘
```

## Component Architecture

### 1. Frontend Components

#### TTBForm Component
- **Purpose**: Handles user input for TTB application data
- **Props**: `onSubmit`, `isLoading`
- **Features**: 
  - Form validation
  - Error handling
  - Responsive design
- **Location**: `src/components/TTBForm.tsx`

#### ImageUpload Component
- **Purpose**: Handles image file upload with drag-and-drop
- **Props**: `onImageSelect`, `isLoading`
- **Features**:
  - Drag-and-drop interface
  - File validation
  - Image preview
  - File size limits
- **Location**: `src/components/ImageUpload.tsx`

#### ResultsDisplay Component
- **Purpose**: Shows verification results to the user
- **Props**: `result`, `onRetry`
- **Features**:
  - Visual status indicators
  - Detailed mismatch reporting
  - Retry functionality
- **Location**: `src/components/ResultsDisplay.tsx`

### 2. Business Logic Layer

#### OCR Processing (`src/utils/ocr.ts` & `src/utils/ocrProviders.ts`)
- **Technology**: Dual OCR provider support
  - **Tesseract.js**: Client-side processing with WebAssembly
  - **Google Cloud Vision API**: Server-side processing via API routes
- **Functions**:
  - `extractTextFromImage()`: Main OCR processing with provider selection
  - `isOCRResult()`: Type guard for OCR results
  - `OCRProviderFactory`: Factory pattern for provider management
- **Error Handling**: Invalid images, file size limits, OCR failures, API errors

#### Text Processing (`src/utils/textProcessing.ts`)
- **Functions**:
  - `normalizeText()`: Text normalization for comparison
  - `extractAlcoholPercentage()`: Extract ABV from text
  - `extractVolume()`: Extract volume measurements
  - `checkGovernmentWarning()`: Check for required warning text
  - `fuzzyMatch()`: Fuzzy text matching algorithm

#### Verification Logic (`src/lib/verification.ts`)
- **Purpose**: Core business logic for comparing form data with OCR results
- **Function**: `verifyLabel()`: Main verification algorithm
- **Output**: Comprehensive verification results with match/mismatch details

### 3. OCR Provider Layer

#### OCR Provider Factory (`src/utils/ocrProviders.ts`)
- **TesseractProvider**: Client-side OCR using Tesseract.js with WebAssembly
- **GoogleCloudVisionProvider**: Server-side OCR using Google Cloud Vision API
- **OCRProviderFactory**: Factory pattern for provider selection and management
- **Error Handling**: Comprehensive error handling for both providers

#### API Routes (`src/app/api/ocr/google-cloud-vision/route.ts`)
- **Google Cloud Vision Integration**: Server-side API endpoint for Google Cloud Vision
- **Authentication**: Environment variable-based credential management
- **Error Handling**: API-specific error handling and response formatting

### 4. Data Layer

#### Type Definitions (`src/types/index.ts`)
- **TTBFormData**: Form input structure with OCR provider selection
- **OCRResult**: OCR processing results with confidence scores
- **VerificationResult**: Verification output structure with detailed match information
- **ProcessingError**: Error handling types for different failure scenarios
- **OCRProvider**: Type-safe provider selection

## Data Flow

1. **User Input**: User fills TTB form and uploads label image
2. **Form Validation**: Client-side validation of form data
3. **OCR Provider Selection**: User chooses between Tesseract.js or Google Cloud Vision API
4. **Image Processing**: OCR extraction using selected provider
5. **Text Analysis**: Normalization and extraction of key information
6. **Verification**: Comparison of form data with extracted text
7. **Results Display**: Visual presentation of verification results

## Technology Stack

- **Frontend**: Next.js 16 with TypeScript
- **Styling**: Tailwind CSS v4
- **OCR**: Dual provider support (Tesseract.js client-side + Google Cloud Vision API server-side)
- **State Management**: React hooks (useState)
- **File Handling**: Native File API
- **Build Tool**: Next.js built-in bundler

## Key Design Decisions

### 1. Dual OCR Provider Architecture
- **Rationale**: Provides flexibility between client-side processing (Tesseract.js) and server-side processing (Google Cloud Vision API)
- **Benefits**: 
  - Tesseract.js: No API keys required, client-side processing, privacy-focused
  - Google Cloud Vision: Higher accuracy, server-side processing, enterprise-grade
- **Trade-offs**: 
  - Tesseract.js: Larger bundle size, processing depends on client device
  - Google Cloud Vision: Requires API keys, network dependency, costs

### 2. Component-Based Architecture
- **Rationale**: Modular, reusable, testable components
- **Benefits**: Easy maintenance, clear separation of concerns

### 3. TypeScript Integration
- **Rationale**: Type safety, better developer experience
- **Benefits**: Compile-time error checking, better IDE support

### 4. Tailwind CSS
- **Rationale**: Utility-first CSS framework for rapid development
- **Benefits**: Consistent design system, responsive by default

## Error Handling Strategy

1. **Form Validation**: Client-side validation with real-time feedback
2. **File Validation**: Type and size checking before processing
3. **OCR Error Handling**: Graceful fallback for OCR failures
4. **User Feedback**: Clear error messages and retry options

## Performance Considerations

1. **Image Optimization**: File size limits and format validation
2. **Lazy Loading**: Components loaded as needed
3. **Memory Management**: Proper cleanup of object URLs
4. **Processing Feedback**: Loading states and progress indicators

## Security Considerations

1. **Client-Side Processing**: No server-side image storage
2. **File Validation**: Strict file type and size limits
3. **No Data Persistence**: No storage of user data between sessions

## Future Enhancements

1. **Advanced OCR Providers**: Integration with additional OCR services (AWS Textract, Azure Computer Vision)
2. **Database Integration**: Store verification history and user sessions
3. **Machine Learning**: ML-based text matching and label classification
4. **Batch Processing**: Multiple image verification in a single session
5. **Real TTB API Integration**: Connect with actual TTB label approval APIs
6. **Enhanced Matching**: More sophisticated fuzzy matching algorithms
7. **Label Template Recognition**: Detect and validate against known label templates
8. **Compliance Checking**: Automated compliance validation against TTB regulations
