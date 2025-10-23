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
│  │ (Tesseract) │  │             │  │ Utils      │            │
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

#### OCR Processing (`src/utils/ocr.ts`)
- **Technology**: Tesseract.js (client-side)
- **Functions**:
  - `extractTextFromImage()`: Main OCR processing
  - `isOCRResult()`: Type guard for OCR results
- **Error Handling**: Invalid images, file size limits, OCR failures

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

### 3. Data Layer

#### Type Definitions (`src/types/index.ts`)
- **TTBFormData**: Form input structure
- **OCRResult**: OCR processing results
- **VerificationResult**: Verification output structure
- **ProcessingError**: Error handling types

## Data Flow

1. **User Input**: User fills TTB form and uploads label image
2. **Form Validation**: Client-side validation of form data
3. **Image Processing**: OCR extraction using Tesseract.js
4. **Text Analysis**: Normalization and extraction of key information
5. **Verification**: Comparison of form data with extracted text
6. **Results Display**: Visual presentation of verification results

## Technology Stack

- **Frontend**: Next.js 14 with TypeScript
- **Styling**: Tailwind CSS v4
- **OCR**: Tesseract.js (client-side processing)
- **State Management**: React hooks (useState)
- **File Handling**: Native File API
- **Build Tool**: Next.js built-in bundler

## Key Design Decisions

### 1. Client-Side OCR Processing
- **Rationale**: Eliminates need for API keys, reduces costs, improves privacy
- **Trade-offs**: Larger bundle size, processing time depends on client device

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

1. **Server-Side OCR**: Option for more powerful OCR processing
2. **Database Integration**: Store verification history
3. **Advanced Matching**: Machine learning-based text matching
4. **Batch Processing**: Multiple image verification
5. **API Integration**: Real TTB API integration
