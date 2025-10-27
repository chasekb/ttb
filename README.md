# TTB Label Verification System

A web application that simulates TTB (Alcohol and Tobacco Tax and Trade Bureau) label verification by comparing form inputs with OCR-extracted text from alcohol label images.

## 🚀 Live Demo

**Production URL:** https://ttb-pied.vercel.app/

## 📋 Overview

This system helps verify that alcohol label information matches TTB application form data by:

- Extracting text from uploaded label images using OCR (Tesseract.js)
- Comparing extracted information with form inputs
- Providing detailed match/mismatch reporting
- Checking for required government warning text

## 📁 Project Structure

```
ttb/
├── src/
│   ├── app/                  # Next.js app router pages and API routes
│   │   ├── api/ocr/         # API endpoints for OCR processing
│   │   ├── components/       # React components
│   │   ├── lib/             # Business logic (verification)
│   │   ├── types/           # TypeScript type definitions
│   │   ├── utils/           # Utility functions (OCR, text processing)
│   │   └── __tests__/       # Integration tests
│   ├── components/__tests__/ # Component unit tests
│   ├── lib/__tests__/       # Library unit tests
│   └── utils/__tests__/     # Utility unit tests
├── docs/                    # Documentation
│   ├── ARCHITECTURE.md      # System architecture details
│   ├── TESTING.md           # Comprehensive testing guide
│   ├── CR.md                # Code review documentation
│   └── HIGH.md              # High-level requirements
├── public/                  # Static assets
└── testimages/              # Test image assets
```

## ✨ Features

- **TTB Form Interface** - Complete form with brand name, product class, alcohol content, and net contents
- **Drag-and-Drop Image Upload** - Easy image upload with preview functionality
- **Triple OCR Support** - Choose between Tesseract.js (client-side), Google Cloud Vision API (server-side), or Google AI Studio (Gemini AI)
- **Intelligent Verification** - Fuzzy matching with tolerance for OCR errors
- **Detailed Results** - Comprehensive reporting with visual indicators
- **Error Handling** - Graceful handling of invalid images and processing failures

## 🛠️ Technology Stack

- **Frontend:** Next.js 16 with React 19 and TypeScript
- **Styling:** Tailwind CSS v4
- **OCR:** Triple provider support
  - Tesseract.js (client-side OCR with WebAssembly)
  - Google Cloud Vision API (server-side via API routes)
  - Google AI Studio (Gemini AI via direct API calls)
- **Testing:** Jest with React Testing Library, 80%+ code coverage
- **Deployment:** Vercel
- **File Handling:** Native File API with type validation

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm, yarn, pnpm, or bun

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/chasekb/ttb.git
   cd ttb
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Start development server**
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Build for Production

```bash
npm run build
npm start
```

## 📖 Usage Guide

### Step 1: Fill Out TTB Form
- **Brand Name:** Enter the exact brand name from your TTB application
- **Product Class/Type:** Select from dropdown (Bourbon, Vodka, IPA, etc.)
- **Alcohol Content (ABV):** Enter percentage (0-100%)
- **Net Contents:** Optional volume information (e.g., "750 mL", "12 fl oz")
- **OCR Provider:** Choose between Tesseract.js (client-side), Google Cloud Vision API (server-side), or Google AI Studio (Gemini AI)

### Step 2: Upload Label Image
- Drag and drop an image file or click to browse
- Supported formats: JPEG, PNG, GIF, WebP
- File size limits vary by OCR provider:
  - Tesseract.js: Up to 50MB
  - Google Cloud Vision API: Up to 20MB
  - Google AI Studio: Up to 20MB
- Image should be clear and readable for best OCR results

### Step 3: Review Results
- ✅ **Verification Passed:** All information matches the label
- ❌ **Verification Failed:** Issues found with specific details
- Detailed breakdown shows match status for each field

## 🔧 API Documentation

### Components

#### `TTBForm`
```typescript
interface TTBFormProps {
  onSubmit: (data: TTBFormData) => void;
  isLoading?: boolean;
}
```

#### `ImageUpload`
```typescript
interface ImageUploadProps {
  onImageSelect: (file: File) => void;
  isLoading?: boolean;
}
```

#### `ResultsDisplay`
```typescript
interface ResultsDisplayProps {
  result: VerificationResult;
  onRetry: () => void;
}
```

### Types

#### `TTBFormData`
```typescript
interface TTBFormData {
  brandName: string;
  productClass: string;
  alcoholContent: number;
  netContents?: string;
  ocrProvider?: OCRProvider;
}
```

#### `OCRProvider`
```typescript
type OCRProvider = 'tesseract' | 'google-cloud-vision' | 'google-ai-studio';
```

#### `VerificationResult`
```typescript
interface VerificationResult {
  brandName: { match: boolean; extracted: string; expected: string };
  productClass: { match: boolean; extracted: string; expected: string };
  alcoholContent: { match: boolean; extracted: number; expected: number };
  netContents?: { match: boolean; extracted: string; expected: string };
  governmentWarning: { found: boolean; text?: string };
  overallMatch: boolean;
}
```

## 🔍 Verification Logic

### Matching Criteria

- **Brand Name:** Case-insensitive fuzzy matching
- **Product Class:** Fuzzy matching with variations (e.g., "Kentucky Straight Bourbon" vs "Bourbon")
- **Alcohol Content:** Within ±0.1% tolerance
- **Net Contents:** Fuzzy matching for volume text
- **Government Warning:** Must contain required warning text

### Text Processing

The system uses intelligent text processing to handle OCR variations:

- **Normalization:** Removes punctuation and converts to lowercase
- **Pattern Matching:** Recognizes alcohol percentages and volume measurements
- **Fuzzy Matching:** Handles OCR errors and text variations

## ⚠️ Known Limitations

### OCR Accuracy
- OCR accuracy depends on image quality and text clarity
- Handwritten text may not be recognized accurately
- Low-resolution images may produce poor results

### Text Extraction
- Complex label layouts may confuse text extraction
- Stylized fonts may not be recognized properly
- Background patterns can interfere with text recognition

### Verification Logic
- Fuzzy matching may produce false positives
- Government warning detection relies on keyword matching
- Product class variations may not be comprehensive

### Browser Compatibility
- Requires modern browsers with WebAssembly support
- Large images may cause performance issues on mobile devices
- OCR processing is CPU-intensive and may be slow on older devices

## 🚀 Deployment

### Vercel Deployment

1. **Connect to Vercel**
   ```bash
   npx vercel
   ```

2. **Deploy to Production**
   ```bash
   npx vercel --prod
   ```

### Environment Variables

#### For Tesseract.js OCR (Client-Side)
No environment variables are required. Tesseract runs locally in the browser with WebAssembly support.

#### For Google Cloud Vision API
Create a `.env.local` file with your Google Cloud credentials:

```bash
# Google Cloud Project ID
GOOGLE_CLOUD_PROJECT_ID=your-project-id

# Google Cloud Service Account Email
GOOGLE_CLOUD_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com

# Google Cloud Private Key (replace \n with actual newlines)
GOOGLE_CLOUD_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"
```

#### For Google AI Studio (Gemini)
Create a `.env.local` file with your Google AI Studio API key:

```bash
# Google AI Studio API Key
GOOGLE_AI_API_KEY=your-api-key-here
```

#### Setting up Google AI Studio

1. **Go to Google AI Studio**
   - Visit [https://aistudio.google.com/](https://aistudio.google.com/)

2. **Create API Key**
   - Click on "Get API key" in the left sidebar
   - Create a new API key or use an existing one

3. **Copy API Key**
   - Copy the generated API key
   - Add it to your `.env.local` file as `GOOGLE_AI_API_KEY`

#### Setting up Google Cloud Vision API

1. **Go to Google Cloud Console**
   - Visit [https://console.cloud.google.com/](https://console.cloud.google.com/)

2. **Create or Select Project**
   - Create a new project or select an existing one

3. **Enable Vision API**
   - Navigate to "APIs & Services" > "Library"
   - Search for "Cloud Vision API" and enable it

4. **Create Service Account**
   - Go to "IAM & Admin" > "Service Accounts"
   - Click "Create Service Account"
   - Give it a name and description
   - Grant "Cloud Vision API User" role

5. **Download Credentials**
   - Click on the service account
   - Go to "Keys" tab
   - Click "Add Key" > "Create new key" > "JSON"
   - Download the JSON file

6. **Extract Credentials**
   - Open the downloaded JSON file
   - Copy `project_id`, `client_email`, and `private_key`
   - Add them to your `.env.local` file

## 🧪 Testing

This project includes comprehensive testing with Jest and React Testing Library. The test suite covers unit tests, component tests, integration tests, and end-to-end workflow tests.

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage

# Run tests in CI mode
npm run test:ci
```

### Test Coverage

Current test coverage: ~53% overall (target: 80%+)

**Coverage Breakdown:**
- **Unit Tests:** Utility functions and business logic ✅
- **Component Tests:** React component behavior ✅
- **Integration Tests:** OCR provider integration ✅
- **API Route Tests:** Server-side endpoints 📋 (planned improvements needed)

### Test Structure

```
src/
├── __tests__/
│   ├── accessibility.test.tsx    # A11y testing with axe-core
│   ├── integration.test.tsx      # OCR provider integration
│   └── performance.test.tsx      # Performance benchmarks
├── components/__tests__/
│   ├── ImageUpload.test.tsx
│   ├── ResultsDisplay.test.tsx
│   └── TTBForm.test.tsx
├── utils/__tests__/
│   ├── ocr.test.ts
│   └── textProcessing.test.ts
├── lib/__tests__/
│   └── verification.test.ts
└── app/api/__tests__/
    └── ocr/google-cloud-vision/
```

### Manual Testing Checklist

- [ ] Test with various label images (different formats, sizes)
- [ ] Verify matching scenarios (exact matches, fuzzy matches)
- [ ] Test mismatch detection (wrong brand, wrong ABV, etc.)
- [ ] Validate error handling (invalid images, no text found)
- [ ] Test government warning detection
- [ ] Verify responsive design on different screen sizes

### Test Images

For testing, use clear, high-resolution images of alcohol labels with:
- Readable text
- Visible alcohol percentage
- Government warning text
- Brand name and product type

### Additional Resources

For detailed testing information, see [`docs/TESTING.md`](docs/TESTING.md).

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Tesseract.js](https://tesseract.projectnaptha.com/) for OCR capabilities
- [Next.js](https://nextjs.org/) for the React framework
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [Vercel](https://vercel.com/) for deployment platform

## 📚 Documentation

### Additional Resources

- **[`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)** - Detailed system architecture and design decisions
- **[`docs/TESTING.md`](docs/TESTING.md)** - Comprehensive testing guide and coverage reports
- **[`docs/CR.md`](docs/CR.md)** - Code review guidelines and standards
- **[`docs/HIGH.md`](docs/HIGH.md)** - High-level system requirements and specifications

## 📞 Support

For questions or issues, please:
1. Check the [Known Limitations](#-known-limitations) section
2. Review the detailed documentation in the [`docs/`](docs/) directory
3. Review existing [GitHub Issues](https://github.com/chasekb/ttb/issues)
4. Create a new issue with detailed information

---

**Note:** This is a demonstration system for TTB label verification. It uses OCR technology to extract text from alcohol label images and compare it with form data. For production use, additional validation and compliance checks would be required.
