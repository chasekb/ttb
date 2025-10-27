import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import TTBForm from '../TTBForm'
import { TTBFormData } from '@/types'

describe('TTBForm', () => {
  const mockOnSubmit = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render all form fields', () => {
    render(<TTBForm onSubmit={mockOnSubmit} />)

    expect(screen.getByLabelText(/brand name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/product class/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/alcohol content/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/net contents/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/ocr provider/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /submit for verification/i })).toBeInTheDocument()
  })

  it('should initialize with default values', () => {
    render(<TTBForm onSubmit={mockOnSubmit} />)

    const brandInput = screen.getByLabelText(/brand name/i)
    expect(brandInput).toHaveValue('')

    const productSelect = screen.getByLabelText(/product class/i)
    expect(productSelect).toHaveValue('')

    const ocrSelect = screen.getByLabelText(/ocr provider/i)
    expect(ocrSelect).toHaveValue('google-cloud-vision')
  })

  it('should validate required fields', async () => {
    const user = userEvent.setup()

    render(<TTBForm onSubmit={mockOnSubmit} />)

    const submitButton = screen.getByRole('button', { name: /submit for verification/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Brand name is required')).toBeInTheDocument()
      expect(screen.getByText('Product class is required')).toBeInTheDocument()
    })

    expect(mockOnSubmit).not.toHaveBeenCalled()
  })

  it.skip('should validate alcohol content range', async () => {
    const user = userEvent.setup()

    render(<TTBForm onSubmit={mockOnSubmit} />)

    // Fill required fields first
    const brandInput = screen.getByLabelText(/brand name/i)
    await user.clear(brandInput)
    await user.type(brandInput, 'Budweiser')

    const productSelect = screen.getByLabelText(/product class/i)
    await user.selectOptions(productSelect, 'Beer')

    // Set invalid alcohol content by directly setting the value (bypassing HTML5 validation)
    const alcoholInput = screen.getByLabelText(/alcohol content/i) as HTMLInputElement
    await user.clear(alcoholInput)
    await user.type(alcoholInput, '150')

    const submitButton = screen.getByRole('button', { name: /submit for verification/i })
    await user.click(submitButton)

    // Should show validation error and not submit
    await waitFor(() => {
      expect(screen.getByText('Alcohol content must be between 0 and 100%')).toBeInTheDocument()
    })

    expect(mockOnSubmit).not.toHaveBeenCalled()
  })

  it('should submit form with valid data', async () => {
    const user = userEvent.setup()

    render(<TTBForm onSubmit={mockOnSubmit} />)

    // Fill in brand name
    const brandInput = screen.getByLabelText(/brand name/i)
    await user.clear(brandInput)
    await user.type(brandInput, 'Budweiser')

    // Select product class
    const productSelect = screen.getByLabelText(/product class/i)
    await user.selectOptions(productSelect, 'Beer')

    // Fill in alcohol content
    const alcoholInput = screen.getByLabelText(/alcohol content/i)
    await user.clear(alcoholInput)
    await user.type(alcoholInput, '5.0')

    // Fill in net contents
    const volumeInput = screen.getByLabelText(/net contents/i)
    await user.clear(volumeInput)
    await user.type(volumeInput, '12 FL OZ')

    // Submit form
    const submitButton = screen.getByRole('button', { name: /submit for verification/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        brandName: 'Budweiser',
        productClass: 'Beer',
        alcoholContent: 5.0,
        netContents: '12 FL OZ',
        ocrProvider: 'google-cloud-vision',
      })
    })
  })

  it('should clear errors when user starts typing', async () => {
    const user = userEvent.setup()

    render(<TTBForm onSubmit={mockOnSubmit} />)

    // Try to submit empty form
    const submitButton = screen.getByRole('button', { name: /submit for verification/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Brand name is required')).toBeInTheDocument()
    })

    // Start typing in brand name
    const brandInput = screen.getByLabelText(/brand name/i)
    await user.type(brandInput, 'Budweiser')

    await waitFor(() => {
      expect(screen.queryByText('Brand name is required')).not.toBeInTheDocument()
    })
  })

  it('should handle optional fields correctly', async () => {
    const user = userEvent.setup()

    render(<TTBForm onSubmit={mockOnSubmit} />)

    // Fill only required fields
    const brandInput = screen.getByLabelText(/brand name/i)
    await user.clear(brandInput)
    await user.type(brandInput, 'Budweiser')

    const productSelect = screen.getByLabelText(/product class/i)
    await user.selectOptions(productSelect, 'Beer')

    // Submit without optional fields
    const submitButton = screen.getByRole('button', { name: /submit for verification/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        brandName: 'Budweiser',
        productClass: 'Beer',
        alcoholContent: undefined,
        netContents: '',
        ocrProvider: 'google-cloud-vision',
      })
    })
  })

  it('should handle OCR provider selection', async () => {
    const user = userEvent.setup()

    render(<TTBForm onSubmit={mockOnSubmit} />)

    const ocrSelect = screen.getByLabelText(/ocr provider/i)
    await user.selectOptions(ocrSelect, 'tesseract')

    // Fill required fields and submit
    const brandInput = screen.getByLabelText(/brand name/i)
    await user.clear(brandInput)
    await user.type(brandInput, 'Budweiser')

    const productSelect = screen.getByLabelText(/product class/i)
    await user.selectOptions(productSelect, 'Beer')

    const submitButton = screen.getByRole('button', { name: /submit for verification/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        brandName: 'Budweiser',
        productClass: 'Beer',
        alcoholContent: undefined,
        netContents: '',
        ocrProvider: 'tesseract',
      })
    })
  })

  it('should disable form when loading', () => {
    render(<TTBForm onSubmit={mockOnSubmit} isLoading={true} />)

    expect(screen.getByLabelText(/brand name/i)).toBeDisabled()
    expect(screen.getByLabelText(/product class/i)).toBeDisabled()
    expect(screen.getByLabelText(/alcohol content/i)).toBeDisabled()
    expect(screen.getByLabelText(/net contents/i)).toBeDisabled()
    expect(screen.getByLabelText(/ocr provider/i)).toBeDisabled()
    expect(screen.getByRole('button', { name: /processing/i })).toBeDisabled()
  })

  it('should show loading state', () => {
    render(<TTBForm onSubmit={mockOnSubmit} isLoading={true} />)

    expect(screen.getByText('Processing...')).toBeInTheDocument()
  })

  it('should handle alcohol content as undefined when empty', async () => {
    const user = userEvent.setup()

    render(<TTBForm onSubmit={mockOnSubmit} />)

    // Fill required fields
    const brandInput = screen.getByLabelText(/brand name/i)
    await user.clear(brandInput)
    await user.type(brandInput, 'Budweiser')

    const productSelect = screen.getByLabelText(/product class/i)
    await user.selectOptions(productSelect, 'Beer')

    // Leave alcohol content empty
    const alcoholInput = screen.getByLabelText(/alcohol content/i)
    await user.clear(alcoholInput)

    // Submit form
    const submitButton = screen.getByRole('button', { name: /submit for verification/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          alcoholContent: undefined,
        })
      )
    })
  })

  it('should handle decimal alcohol content', async () => {
    const user = userEvent.setup()

    render(<TTBForm onSubmit={mockOnSubmit} />)

    // Fill required fields
    const brandInput = screen.getByLabelText(/brand name/i)
    await user.clear(brandInput)
    await user.type(brandInput, 'Budweiser')

    const productSelect = screen.getByLabelText(/product class/i)
    await user.selectOptions(productSelect, 'Beer')

    // Fill alcohol content with decimal
    const alcoholInput = screen.getByLabelText(/alcohol content/i)
    await user.clear(alcoholInput)
    await user.type(alcoholInput, '5.5')

    // Submit form
    const submitButton = screen.getByRole('button', { name: /submit for verification/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          alcoholContent: 5.5,
        })
      )
    })
  })

  it('should display all product class options', () => {
    render(<TTBForm onSubmit={mockOnSubmit} />)

    const productSelect = screen.getByLabelText(/product class/i)

    expect(screen.getByText('Ale')).toBeInTheDocument()
    expect(screen.getByText('Beer')).toBeInTheDocument()
    expect(screen.getByText('Bourbon')).toBeInTheDocument()
    expect(screen.getByText('Wine')).toBeInTheDocument()
    expect(screen.getByText('Vodka')).toBeInTheDocument()
    expect(screen.getByText('Other')).toBeInTheDocument()
  })

  it('should show OCR provider descriptions', () => {
    render(<TTBForm onSubmit={mockOnSubmit} />)

    expect(screen.getByText(/tesseract runs locally/i)).toBeInTheDocument()
    expect(screen.getByText(/google cloud vision api requires/i)).toBeInTheDocument()
  })
})
