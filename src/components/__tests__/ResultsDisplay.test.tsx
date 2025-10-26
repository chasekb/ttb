import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ResultsDisplay from '../ResultsDisplay'
import { VerificationResult } from '@/types'

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn().mockImplementation(() => Promise.resolve()),
  },
})

describe('ResultsDisplay', () => {
  const mockOnRetry = jest.fn()

  const mockVerificationResult: VerificationResult = {
    brandName: {
      match: true,
      extracted: 'Budweiser',
      expected: 'Budweiser',
    },
    productClass: {
      match: true,
      extracted: 'Beer',
      expected: 'Beer',
    },
    alcoholContent: {
      match: true,
      extracted: 5.0,
      expected: 5.0,
    },
    netContents: {
      match: true,
      extracted: '12 FL OZ',
      expected: '12 FL OZ',
    },
    governmentWarning: {
      found: true,
      text: 'GOVERNMENT WARNING',
    },
    overallMatch: true,
    extractedText: 'Budweiser Premium Beer 5.0% ABV 12 FL OZ Government Warning text',
    ocrConfidence: 0.95,
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should display successful verification result', () => {
    render(<ResultsDisplay result={mockVerificationResult} onRetry={mockOnRetry} />)

    expect(screen.getByText('✅')).toBeInTheDocument()
    expect(screen.getByText('Verification Passed')).toBeInTheDocument()
    expect(screen.getByText(/all required information matches/i)).toBeInTheDocument()
  })

  it('should display failed verification result', () => {
    const failedResult: VerificationResult = {
      ...mockVerificationResult,
      overallMatch: false,
      brandName: {
        match: false,
        extracted: 'Coors',
        expected: 'Budweiser',
      },
    }

    render(<ResultsDisplay result={failedResult} onRetry={mockOnRetry} />)

    expect(screen.getByText('❌')).toBeInTheDocument()
    expect(screen.getByText('Verification Failed')).toBeInTheDocument()
    expect(screen.getByText(/some information does not match/i)).toBeInTheDocument()
  })

  it('should display extracted text with confidence', () => {
    render(<ResultsDisplay result={mockVerificationResult} onRetry={mockOnRetry} />)

    expect(screen.getByText('Extracted Text')).toBeInTheDocument()
    expect(screen.getByText('OCR Confidence: 95%')).toBeInTheDocument()
    expect(screen.getByText(/budweiser premium beer/i)).toBeInTheDocument()
  })

  it('should copy text to clipboard when copy button is clicked', async () => {
    const user = userEvent.setup()

    render(<ResultsDisplay result={mockVerificationResult} onRetry={mockOnRetry} />)

    const copyButton = screen.getByText('Copy to Clipboard')
    await user.click(copyButton)

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      'Budweiser Premium Beer 5.0% ABV 12 FL OZ Government Warning text'
    )
  })

  it('should display verification details with correct status icons', () => {
    render(<ResultsDisplay result={mockVerificationResult} onRetry={mockOnRetry} />)

    // Check brand name
    expect(screen.getByText('Brand Name')).toBeInTheDocument()
    expect(screen.getByText('Matched')).toBeInTheDocument()
    expect(screen.getAllByText('✅')).toHaveLength(6) // Overall + 5 details

    // Check product class
    expect(screen.getByText('Product Class')).toBeInTheDocument()

    // Check alcohol content
    expect(screen.getByText('Alcohol Content')).toBeInTheDocument()

    // Check net contents
    expect(screen.getByText('Net Contents')).toBeInTheDocument()

    // Check government warning
    expect(screen.getByText('Government Warning')).toBeInTheDocument()
    expect(screen.getByText('Found')).toBeInTheDocument()
  })

  it('should handle missing alcohol content', () => {
    const resultWithoutAlcohol: VerificationResult = {
      ...mockVerificationResult,
      alcoholContent: undefined,
    }

    render(<ResultsDisplay result={resultWithoutAlcohol} onRetry={mockOnRetry} />)

    expect(screen.queryByText('Alcohol Content')).not.toBeInTheDocument()
  })

  it('should handle missing net contents', () => {
    const resultWithoutVolume: VerificationResult = {
      ...mockVerificationResult,
      netContents: undefined,
    }

    render(<ResultsDisplay result={resultWithoutVolume} onRetry={mockOnRetry} />)

    expect(screen.queryByText('Net Contents')).not.toBeInTheDocument()
  })

  it('should display mismatch information when verification fails', () => {
    const failedResult: VerificationResult = {
      ...mockVerificationResult,
      overallMatch: false,
      brandName: {
        match: false,
        extracted: 'Coors',
        expected: 'Budweiser',
      },
      productClass: {
        match: false,
        extracted: 'Wine',
        expected: 'Beer',
      },
      governmentWarning: {
        found: false,
      },
    }

    render(<ResultsDisplay result={failedResult} onRetry={mockOnRetry} />)

    expect(screen.getByText('Issues Found:')).toBeInTheDocument()
    expect(screen.getByText(/brand name mismatch/i)).toBeInTheDocument()
    expect(screen.getByText(/product class mismatch/i)).toBeInTheDocument()
    expect(screen.getByText(/government warning text not found/i)).toBeInTheDocument()
  })

  it('should display detailed mismatch values', () => {
    const failedResult: VerificationResult = {
      ...mockVerificationResult,
      overallMatch: false,
      alcoholContent: {
        match: false,
        extracted: 4.5,
        expected: 5.0,
      },
    }

    render(<ResultsDisplay result={failedResult} onRetry={mockOnRetry} />)

    expect(screen.getByText(/alcohol content mismatch/i)).toBeInTheDocument()
    expect(screen.getByText('Expected: 5%')).toBeInTheDocument()
    expect(screen.getByText('Extracted: 4.5%')).toBeInTheDocument()
  })

  it('should call onRetry when retry button is clicked', async () => {
    const user = userEvent.setup()

    render(<ResultsDisplay result={mockVerificationResult} onRetry={mockOnRetry} />)

    const retryButton = screen.getByText('Try Another Label')
    await user.click(retryButton)

    expect(mockOnRetry).toHaveBeenCalledTimes(1)
  })

  it('should handle empty extracted text', () => {
    const resultWithEmptyText: VerificationResult = {
      ...mockVerificationResult,
      extractedText: '',
    }

    render(<ResultsDisplay result={resultWithEmptyText} onRetry={mockOnRetry} />)

    expect(screen.getByText('No text extracted from image')).toBeInTheDocument()
  })

  it('should handle low confidence OCR results', () => {
    const lowConfidenceResult: VerificationResult = {
      ...mockVerificationResult,
      ocrConfidence: 0.1,
    }

    render(<ResultsDisplay result={lowConfidenceResult} onRetry={mockOnRetry} />)

    expect(screen.getByText('OCR Confidence: 10%')).toBeInTheDocument()
  })

  it('should handle government warning not found', () => {
    const resultWithoutWarning: VerificationResult = {
      ...mockVerificationResult,
      governmentWarning: {
        found: false,
      },
    }

    render(<ResultsDisplay result={resultWithoutWarning} onRetry={mockOnRetry} />)

    expect(screen.getByText('Not Found')).toBeInTheDocument()
  })
})
