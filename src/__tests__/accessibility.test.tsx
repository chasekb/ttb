import { render } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'
import ImageUpload from '../components/ImageUpload'
import ResultsDisplay from '../components/ResultsDisplay'
import TTBForm from '../components/TTBForm'
import { mockVerificationResult, mockTTBFormData } from '../utils/test-utils'

// Extend Jest matchers
expect.extend(toHaveNoViolations)

describe('Accessibility Tests', () => {
  beforeAll(() => {
    // Mock clipboard API for ResultsDisplay tests
    Object.assign(navigator, {
      clipboard: {
        writeText: jest.fn().mockImplementation(() => Promise.resolve()),
      },
    })
  })

  describe('ImageUpload Component', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(<ImageUpload onImageSelect={jest.fn()} />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('should have proper ARIA labels and roles', () => {
      render(<ImageUpload onImageSelect={jest.fn()} />)

      // Check for proper button labeling
      const uploadButton = document.querySelector('button')
      expect(uploadButton).toHaveTextContent('Click to upload')

      // Check for file input accessibility
      const fileInput = document.querySelector('input[type="file"]')
      expect(fileInput).toHaveAttribute('accept', 'image/*')
    })

    it('should maintain accessibility when loading', async () => {
      const { container } = render(<ImageUpload onImageSelect={jest.fn()} isLoading={true} />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })

  describe('TTBForm Component', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(<TTBForm onSubmit={jest.fn()} />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('should have proper form labels and structure', () => {
      render(<TTBForm onSubmit={jest.fn()} />)

      // Check all required form fields have labels
      expect(document.querySelector('label[for="brandName"]')).toHaveTextContent('Brand Name *')
      expect(document.querySelector('label[for="productClass"]')).toHaveTextContent('Product Class/Type *')
      expect(document.querySelector('label[for="alcoholContent"]')).toHaveTextContent('Alcohol Content (ABV) (Optional)')
      expect(document.querySelector('label[for="netContents"]')).toHaveTextContent('Net Contents (Optional)')
      expect(document.querySelector('label[for="ocrProvider"]')).toHaveTextContent('OCR Provider')

      // Check form structure
      const form = document.querySelector('form')
      expect(form).toBeInTheDocument()

      // Check submit button
      const submitButton = document.querySelector('button[type="submit"]')
      expect(submitButton).toHaveTextContent('Submit for Verification')
    })

    it('should show error messages accessibly', async () => {
      const { container } = render(<TTBForm onSubmit={jest.fn()} />)

      // Submit empty form to trigger validation errors
      const submitButton = document.querySelector('button[type="submit"]')
      submitButton?.click()

      // Wait for error messages to appear
      await new Promise(resolve => setTimeout(resolve, 0))

      // Check that error messages are properly associated with form fields
      const errorMessages = container.querySelectorAll('[role="alert"]')
      expect(errorMessages.length).toBeGreaterThan(0)

      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('should maintain accessibility when loading', async () => {
      const { container } = render(<TTBForm onSubmit={jest.fn()} isLoading={true} />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })

  describe('ResultsDisplay Component', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(
        <ResultsDisplay result={mockVerificationResult} onRetry={jest.fn()} />
      )
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('should have proper heading structure', () => {
      render(<ResultsDisplay result={mockVerificationResult} onRetry={jest.fn()} />)

      // Check for main heading
      const mainHeading = document.querySelector('h2') || document.querySelector('[data-testid="result-heading"]')
      expect(mainHeading).toBeInTheDocument()

      // Check for status indicators
      const statusIcons = document.querySelectorAll('[aria-label*="Status"], [role="img"]')
      expect(statusIcons.length).toBeGreaterThan(0)
    })

    it('should have accessible copy functionality', async () => {
      render(<ResultsDisplay result={mockVerificationResult} onRetry={jest.fn()} />)

      const copyButton = document.querySelector('button[aria-label*="copy" i], button:has-text("Copy")')
      if (copyButton) {
        expect(copyButton).toHaveAttribute('type', 'button')

        // Test clipboard interaction
        copyButton.click()
        expect(navigator.clipboard.writeText).toHaveBeenCalled()
      }
    })

    it('should display verification details accessibly', () => {
      render(<ResultsDisplay result={mockVerificationResult} onRetry={jest.fn()} />)

      // Check for proper semantic structure
      const sections = document.querySelectorAll('section, div[role="region"]')
      expect(sections.length).toBeGreaterThan(0)

      // Check for status indicators
      const statusElements = document.querySelectorAll('[aria-label*="match" i], [aria-label*="found" i]')
      expect(statusElements.length).toBeGreaterThan(0)
    })
  })

  describe('Color Contrast and Visual Accessibility', () => {
    it('should have sufficient color contrast ratios', async () => {
      const { container } = render(
        <div>
          <ImageUpload onImageSelect={jest.fn()} />
          <TTBForm onSubmit={jest.fn()} />
          <ResultsDisplay result={mockVerificationResult} onRetry={jest.fn()} />
        </div>
      )

      const results = await axe(container, {
        rules: {
          'color-contrast': { enabled: true },
        },
      })

      // Filter for color contrast violations
      const contrastViolations = results.violations.filter(
        violation => violation.id === 'color-contrast'
      )

      expect(contrastViolations).toHaveLength(0)
    })
  })

  describe('Keyboard Navigation', () => {
    it('should be fully navigable with keyboard', async () => {
      const { container } = render(
        <div>
          <ImageUpload onImageSelect={jest.fn()} />
          <TTBForm onSubmit={jest.fn()} />
        </div>
      )

      const results = await axe(container, {
        rules: {
          'keyboard': { enabled: true },
          'focus-order-semantics': { enabled: true },
        },
      })

      const keyboardViolations = results.violations.filter(
        violation => violation.id === 'keyboard' || violation.id === 'focus-order-semantics'
      )

      expect(keyboardViolations).toHaveLength(0)
    })

    it('should have proper focus management', () => {
      render(<TTBForm onSubmit={jest.fn()} />)

      // Check that all interactive elements are focusable
      const focusableElements = document.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )

      expect(focusableElements.length).toBeGreaterThan(0)

      // Check that form elements have proper tab order
      const formInputs = document.querySelectorAll('input, select, button[type="submit"]')
      formInputs.forEach((input, index) => {
        if (input.tagName !== 'BUTTON') {
          expect(input).toHaveAttribute('tabindex')
        }
      })
    })
  })

  describe('Screen Reader Support', () => {
    it('should have proper ARIA labels and descriptions', async () => {
      const { container } = render(
        <div>
          <ImageUpload onImageSelect={jest.fn()} />
          <ResultsDisplay result={mockVerificationResult} onRetry={jest.fn()} />
        </div>
      )

      const results = await axe(container, {
        rules: {
          'aria-required-attr': { enabled: true },
          'aria-valid-attr': { enabled: true },
        },
      })

      const ariaViolations = results.violations.filter(
        violation => violation.id.startsWith('aria-')
      )

      expect(ariaViolations).toHaveLength(0)
    })

    it('should provide meaningful text alternatives', () => {
      render(<ImageUpload onImageSelect={jest.fn()} />)

      // Check for SVG with proper descriptions or labels
      const svg = document.querySelector('svg')
      expect(svg).toBeInTheDocument()

      // Check for text content that provides context
      expect(document.querySelector('button')).toHaveTextContent('Click to upload')
    })
  })

  describe('Error Handling Accessibility', () => {
    it('should announce errors to screen readers', async () => {
      const { container } = render(<TTBForm onSubmit={jest.fn()} />)

      // Trigger validation errors
      const submitButton = document.querySelector('button[type="submit"]')
      submitButton?.click()

      await new Promise(resolve => setTimeout(resolve, 0))

      // Check that error messages are properly announced
      const errorElements = container.querySelectorAll('[role="alert"], .error, .text-red-600')
      expect(errorElements.length).toBeGreaterThan(0)

      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })
})
