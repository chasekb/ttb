# Testing Guide - TTB Label Verification System

This document outlines the comprehensive testing strategy for the TTB Label Verification System, including unit tests, integration tests, component tests, and end-to-end testing.

## 📋 Testing Overview

### Test Structure
```
src/
├── __tests__/                          # Integration and end-to-end tests
│   ├── integration.test.tsx            # OCR provider integration tests
│   └── performance.test.tsx           # Performance benchmarks (planned)
├── components/__tests__/               # Component tests
│   ├── ImageUpload.test.tsx           # File upload component tests
│   ├── ResultsDisplay.test.tsx        # Results display component tests
│   └── TTBForm.test.tsx               # Form component tests
├── utils/__tests__/                    # Utility function tests
│   ├── ocr.test.ts                    # OCR utility tests
│   └── textProcessing.test.ts         # Text processing utility tests
├── lib/__tests__/                      # Library function tests
│   └── verification.test.ts           # Label verification tests
└── app/api/__tests__/                  # API route tests
    └── ocr/google-cloud-vision/       # Google Cloud Vision API tests
```

### Test Types
- **Unit Tests**: Individual function and utility testing ✅ IMPLEMENTED
- **Component Tests**: React component behavior and interaction testing ✅ IMPLEMENTED
- **Integration Tests**: OCR provider switching and API integration ✅ IMPLEMENTED
- **End-to-End Tests**: Complete user workflows ✅ IMPLEMENTED
- **Performance Tests**: Load testing and performance validation 📋 PLANNED
- **Accessibility Tests**: Screen reader and keyboard navigation testing 📋 PLANNED

## 🛠️ Testing Setup

### Prerequisites
```bash
npm install
```

### Running Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run tests in CI mode
npm run test:ci
```

### Test Configuration
- **Framework**: Jest
- **Testing Library**: React Testing Library
- **Coverage Target**: 80%+
- **Test Environment**: jsdom for browser simulation

## 📝 Writing Tests

### Unit Tests
Unit tests focus on individual functions and utilities:

```typescript
// src/utils/__tests__/textProcessing.test.ts
import { extractAlcoholContent, validateTTBFormat } from '../textProcessing'

describe('textProcessing', () => {
  describe('extractAlcoholContent', () => {
    it('should extract alcohol percentage correctly', () => {
      const result = extractAlcoholContent('12.5% ABV')
      expect(result).toBe('12.5%')
    })

    it('should handle various formats', () => {
      expect(extractAlcoholContent('5.0% alcohol')).toBe('5.0%')
      expect(extractAlcoholContent('14% ABV')).toBe('14%')
    })
  })
})
```

### Component Tests
Component tests verify React component behavior:

```typescript
// src/components/__tests__/ImageUpload.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ImageUpload from '../ImageUpload'
import { createMockImageFile } from '../../utils/__tests__/test-utils'

describe('ImageUpload', () => {
  it('should render upload area', () => {
    render(<ImageUpload onImageSelect={jest.fn()} />)
    expect(screen.getByText(/upload.*image/i)).toBeInTheDocument()
  })

  it('should handle file selection', async () => {
    const onImageSelect = jest.fn()
    const user = userEvent.setup()
    const file = createMockImageFile()

    render(<ImageUpload onImageSelect={onImageSelect} />)

    const input = screen.getByRole('textbox') // File input
    await user.upload(input, file)

    expect(onImageSelect).toHaveBeenCalledWith(file)
  })
})
```

### Integration Tests
Integration tests verify component interactions and API calls:

```typescript
// src/__tests__/integration.test.tsx
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '../app/page'
import { mockOCRProviders } from '../utils/__tests__/test-utils'

describe('OCR Integration', () => {
  beforeEach(() => {
    // Mock OCR providers
    jest.mock('../utils/ocrProviders', () => ({
      ...jest.requireActual('../utils/ocrProviders'),
      ...mockOCRProviders
    }))
  })

  it('should process image through OCR providers', async () => {
    const user = userEvent.setup()

    render(<App />)

    // Upload image
    const fileInput = screen.getByRole('textbox')
    const file = createMockImageFile()
    await user.upload(fileInput, file)

    // Verify OCR processing
    await waitFor(() => {
      expect(screen.getByText(/mock.*ocr.*text/i)).toBeInTheDocument()
    })
  })
})
```

## 🎯 Test Coverage

### Current Status (as of October 26, 2025)
```
✅ HIGH COVERAGE (>80%):
- lib/verification.ts: 100% (functions, lines, branches, statements)
- components/ResultsDisplay.tsx: 100% (functions, lines, branches, statements)
- utils/ocr.ts: 100% (functions, lines, branches, statements)
- components/TTBForm.tsx: 96.77% (functions), 96.66% (lines), 87.87% (branches)
- utils/textProcessing.ts: 86.44% (statements), 87.27% (lines), 87.5% (branches)
- components/ImageUpload.tsx: 86.04% (statements, lines), 73.33% (branches)

❌ LOW COVERAGE (<50%):
- utils/ocrProviders.ts: 0% (not tested)
- app/page.tsx: 0% (main app component)
- app/layout.tsx: 0% (layout component)
- app/api/ocr/google-cloud-vision/route.ts: 0% (API routes)

📊 OVERALL COVERAGE: 52.99% (Target: 80%+)
```

### Coverage Goals
- **Functions**: 90% coverage
- **Lines**: 85% coverage
- **Branches**: 80% coverage
- **Statements**: 85% coverage

### Coverage Exclusions
- Configuration files
- Type definitions
- Test utilities
- Third-party integrations (when mocked)

### Next Steps to Reach 80%+ Coverage
1. **Fix Failing Tests** (2 tests currently failing)
2. **Add App Component Tests** (page.tsx, layout.tsx)
3. **Add OCR Provider Tests** (ocrProviders.ts implementation)
4. **Fix API Route Tests** (Next.js test environment setup)
5. **Add Performance Tests** (basic benchmarks)
6. **Add Accessibility Tests** (axe-core integration)

## 🔧 Mocking Strategy

### External Dependencies
```typescript
// Mock Google Cloud Vision
jest.mock('@google-cloud/vision', () => ({
  ImageAnnotatorClient: jest.fn().mockImplementation(() => ({
    textDetection: jest.fn().mockResolvedValue([{
      textAnnotations: [{
        description: 'Mock Google OCR text',
        boundingPoly: { vertices: [] }
      }]
    }])
  }))
}))

// Mock Azure Computer Vision
jest.mock('@azure/cognitiveservices-computervision', () => ({
  ComputerVisionClient: jest.fn().mockImplementation(() => ({
    read: jest.fn().mockResolvedValue({
      operationLocation: 'mock-url'
    })
  }))
}))
```

### File System Operations
```typescript
// Mock file operations
jest.mock('fs', () => ({
  readFileSync: jest.fn(),
  writeFileSync: jest.fn(),
  existsSync: jest.fn().mockReturnValue(true)
}))
```

## 🚀 CI/CD Integration

### GitHub Actions
The project includes automated testing in CI/CD:

- **Test Execution**: Runs on every push and PR
- **Coverage Reporting**: Uploads to Codecov
- **Performance Testing**: Lighthouse CI integration
- **Security Scanning**: Automated vulnerability checks

### Pre-commit Hooks
```bash
# Install Husky for pre-commit hooks
npm install --save-dev husky lint-staged

# Setup pre-commit hooks
npx husky install
npx husky add .husky/pre-commit "npm run test:ci"
npx husky add .husky/pre-commit "npm run lint"
```

## 📊 Performance Testing

### Lighthouse CI
Performance testing is integrated via Lighthouse:

```bash
# Run performance tests locally
npm install -g lighthouse
lighthouse http://localhost:3000 --output=json --output-path=./lighthouse-report.json
```

### Load Testing
```typescript
// src/__tests__/performance.test.ts
import { performance } from 'perf_hooks'

describe('Performance Tests', () => {
  it('should process OCR within acceptable time', async () => {
    const startTime = performance.now()

    // OCR processing logic
    await processOCR(mockImage)

    const endTime = performance.now()
    const duration = endTime - startTime

    expect(duration).toBeLessThan(5000) // 5 seconds max
  })
})
```

## ♿ Accessibility Testing

### Automated Testing
```typescript
// src/__tests__/accessibility.test.tsx
import { render } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'

expect.extend(toHaveNoViolations)

describe('Accessibility', () => {
  it('should have no accessibility violations', async () => {
    const { container } = render(<App />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
```

### Manual Testing Checklist
- [ ] Screen reader compatibility
- [ ] Keyboard navigation
- [ ] Color contrast ratios
- [ ] Focus indicators
- [ ] Alternative text for images

## 🐛 Debugging Tests

### Common Issues
1. **Async Operations**: Use `waitFor` or `findBy*` queries
2. **Mock Setup**: Ensure mocks are properly configured before tests
3. **DOM Updates**: Use `act()` for state updates in React components
4. **Timer Issues**: Mock timers for consistent test execution

### Debug Commands
```bash
# Run specific test file
npm test ImageUpload.test.tsx

# Run with debug output
DEBUG=* npm test

# Generate coverage report
npm run test:coverage
```

## 📋 Test Data Management

### Test Fixtures
```typescript
// src/__tests__/fixtures/ocr-responses.ts
export const mockOCRResponses = {
  validLabel: {
    text: '12.5% ABV\nPremium Beer\n12 FL OZ',
    confidence: 0.95
  },
  invalidLabel: {
    text: 'Invalid text',
    confidence: 0.1
  }
}
```

### Factory Functions
```typescript
// src/__tests__/factories/file.factory.ts
export const createTestFile = (overrides: Partial<File> = {}): File => {
  return Object.assign(new File(['content'], 'test.jpg', {
    type: 'image/jpeg'
  }), overrides)
}
```

## 🔄 Continuous Integration

### Branch Protection
- Require status checks before merging
- Require branches to be up to date
- Include administrators in restrictions

### Quality Gates
- Minimum coverage percentage
- No failing tests
- No critical security vulnerabilities
- Performance benchmarks met

## 📚 Resources

### Documentation
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci)

### Best Practices
- [Testing Best Practices](https://martinfowler.com/testing/)
- [React Testing Patterns](https://www.robinwieruch.de/react-testing-library)
- [Accessibility Testing](https://www.w3.org/WAI/test-evaluate/)

---

*Testing Guide Created: October 26, 2025*
*Last Updated: October 26, 2025*
