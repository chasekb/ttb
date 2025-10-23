# TTB Label Verification System - Development Plan

## Project Overview
Build a web application that simulates TTB (Alcohol and Tobacco Tax and Trade Bureau) label verification by comparing form inputs with OCR-extracted text from alcohol label images.

## Success Criteria
- ✅ Functional web app with TTB form fields (Brand Name, Product Class/Type, Alcohol Content, Net Contents)
- ✅ Image upload with drag-and-drop support
- ✅ OCR text extraction from uploaded images
- ✅ Verification comparison with detailed match/mismatch reporting
- ✅ Live deployment with clear documentation

## Technology Stack
- **Frontend:** Next.js 14 with TypeScript, Tailwind CSS
- **Backend:** Next.js API routes
- **OCR:** Tesseract.js (client-side processing)
- **Deployment:** Vercel
- **File Handling:** Next.js built-in image optimization

## System Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   OCR Service   │
│   (Next.js)     │    │   (API Routes)  │    │   (Tesseract)   │
├─────────────────┤    ├─────────────────┤    ├─────────────────┤
│ • TTB Form      │───▶│ • Image Upload  │───▶│ • Text Extract  │
│ • Image Upload  │    │ • OCR Process   │    │ • Text Normalize│
│ • Results UI    │◀───│ • Verification  │◀───│ • Return Text   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Development Tasks

### Phase 1: Project Setup & Architecture ✅
- [x] Initialize Next.js project with TypeScript
- [x] Configure Tailwind CSS for styling
- [x] Set up project structure and components
- [x] Design system architecture

### Phase 2: Frontend Development ✅
- [x] **Build TTB Form Component**
  - Brand Name input field
  - Product Class/Type dropdown/input
  - Alcohol Content (ABV) input with percentage validation
  - Net Contents input (optional)
  - Form validation and error handling
- [x] **Implement Image Upload Component**
  - Drag-and-drop file upload area
  - Image preview functionality
  - Support for JPEG, PNG formats
  - File size validation
- [x] **Create Results Display Component**
  - Success/failure status indicators
  - Detailed match/mismatch reporting
  - Visual cues (✅/❌) for each field
  - Retry functionality

### Phase 3: Backend OCR Integration ✅
- [x] **Integrate Tesseract.js**
  - Client-side OCR processing
  - Text extraction from uploaded images
  - Error handling for unreadable images
- [x] **Implement Text Normalization**
  - Case-insensitive matching
  - Handle OCR errors and variations
  - Extract alcohol percentage from text
  - Parse volume measurements
- [x] **Build Verification Logic**
  - Compare extracted text with form inputs
  - Check for government warning text
  - Generate detailed comparison results

### Phase 4: Testing & Deployment 🚧
- [ ] **Manual Testing**
  - Test with various label images
  - Verify matching scenarios
  - Test mismatch detection
  - Validate error handling
- [ ] **Deploy to Vercel**
  - Configure deployment settings
  - Set up environment variables
  - Test live deployment
- [ ] **Create Documentation**
  - Comprehensive README
  - Setup instructions
  - API documentation
  - Known limitations

## Key Features Implementation

### TTB Form Fields
1. **Brand Name** - Text input with validation
2. **Product Class/Type** - Dropdown with common types (Bourbon, Vodka, IPA, etc.)
3. **Alcohol Content** - Number input with percentage validation
4. **Net Contents** - Text input for volume (750 mL, 12 fl oz, etc.)

### Verification Logic
- **Exact Match:** Brand name must match exactly (case-insensitive)
- **Fuzzy Match:** Product type allows variations (e.g., "Kentucky Straight Bourbon" vs "Bourbon")
- **Numeric Match:** Alcohol content within tolerance (±0.1%)
- **Volume Match:** Net contents must contain matching volume text
- **Warning Check:** Verify "GOVERNMENT WARNING" text presence

### Error Handling
- Unreadable images → Clear error message
- Missing fields → Specific field-level errors
- Multiple mismatches → Comprehensive error list
- OCR failures → Fallback error handling

## Estimated Timeline
- **Total Development Time:** ~4 hours
- **Phase 1:** 30 minutes ✅
- **Phase 2:** 90 minutes ✅
- **Phase 3:** 60 minutes ✅
- **Phase 4:** 45 minutes 🚧

## Deliverables
1. **Source Code Repository** - Complete Next.js application
2. **Live Deployment** - Vercel-hosted application
3. **Documentation** - README with setup instructions
4. **Test Evidence** - Screenshots/video of functionality

## Design Decisions
- **Client-side OCR:** Eliminates API key management, reduces costs
- **Unified Framework:** Next.js provides seamless integration
- **Component Architecture:** Modular, reusable components
- **Error Handling:** Comprehensive user feedback system

## Next Steps
1. Initialize Next.js project
2. Create TTB form component
3. Implement image upload functionality
4. Integrate OCR processing
5. Build verification logic
6. Deploy and document
