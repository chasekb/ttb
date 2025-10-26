import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ImageUpload from '../ImageUpload'
import { createMockImageFile, createMockTextFile } from '../../utils/test-utils'

// Mock URL.createObjectURL and URL.revokeObjectURL
const mockCreateObjectURL = jest.fn()
const mockRevokeObjectURL = jest.fn()

Object.defineProperty(global.URL, 'createObjectURL', {
  value: mockCreateObjectURL,
  writable: true,
})
Object.defineProperty(global.URL, 'revokeObjectURL', {
  value: mockRevokeObjectURL,
  writable: true,
})

describe('ImageUpload', () => {
  const mockOnImageSelect = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    mockCreateObjectURL.mockReturnValue('mock-object-url')
  })

  afterEach(() => {
    mockRevokeObjectURL.mockClear()
  })

  it('should render upload area with instructions', () => {
    render(<ImageUpload onImageSelect={mockOnImageSelect} />)

    expect(screen.getByText(/click to upload/i)).toBeInTheDocument()
    expect(screen.getByText(/or drag and drop/i)).toBeInTheDocument()
    expect(screen.getByText(/png, jpg, gif up to 10mb/i)).toBeInTheDocument()
  })

  it('should handle file selection via button click', async () => {
    const user = userEvent.setup()
    const file = createMockImageFile('test.jpg')

    render(<ImageUpload onImageSelect={mockOnImageSelect} />)

    // Click the upload button
    const uploadButton = screen.getByRole('button', { name: /click to upload/i })
    await user.click(uploadButton)

    // Get the hidden file input and simulate file selection
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
    expect(fileInput).toBeInTheDocument()

    // Simulate file selection by calling the onChange handler directly
    fireEvent.change(fileInput, { target: { files: [file] } })

    expect(mockOnImageSelect).toHaveBeenCalledWith(file)
    expect(mockCreateObjectURL).toHaveBeenCalledWith(file)
    expect(screen.getByAltText('Preview')).toBeInTheDocument()
  })

  it('should display file preview after selection', () => {
    const file = createMockImageFile('test.jpg')

    render(<ImageUpload onImageSelect={mockOnImageSelect} />)

    // Get the hidden file input and simulate file selection
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
    fireEvent.change(fileInput, { target: { files: [file] } })

    expect(screen.getByAltText('Preview')).toBeInTheDocument()
    expect(screen.getByText(/test.jpg/i)).toBeInTheDocument()
    expect(screen.getByText(/\d+\.\d+ mb/i)).toBeInTheDocument()
  })

  it('should handle drag and drop', () => {
    const file = createMockImageFile('test.jpg')

    render(<ImageUpload onImageSelect={mockOnImageSelect} />)

    const dropZone = screen.getByText(/click to upload/i).closest('div')

    // Simulate drag events
    fireEvent.dragEnter(dropZone!, {
      dataTransfer: { files: [file] },
    })

    fireEvent.dragOver(dropZone!, {
      dataTransfer: { files: [file] },
    })

    fireEvent.drop(dropZone!, {
      dataTransfer: { files: [file] },
    })

    expect(mockOnImageSelect).toHaveBeenCalledWith(file)
  })

  it('should show drag active state', () => {
    render(<ImageUpload onImageSelect={mockOnImageSelect} />)

    const dropZone = screen.getByText(/click to upload/i).closest('div')

    fireEvent.dragEnter(dropZone!, {
      dataTransfer: { files: [] },
    })

    expect(dropZone).toHaveClass('border-blue-400', 'bg-blue-50')
  })

  it('should remove drag active state on drag leave', () => {
    render(<ImageUpload onImageSelect={mockOnImageSelect} />)

    const dropZone = screen.getByText(/click to upload/i).closest('div')

    fireEvent.dragEnter(dropZone!, {
      dataTransfer: { files: [] },
    })

    fireEvent.dragLeave(dropZone!)

    expect(dropZone).not.toHaveClass('border-blue-400', 'bg-blue-50')
  })

  it('should validate file type and reject non-images', () => {
    const textFile = createMockTextFile('test.txt')
    const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {})

    render(<ImageUpload onImageSelect={mockOnImageSelect} />)

    // Get the hidden file input and simulate file selection
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
    fireEvent.change(fileInput, { target: { files: [textFile] } })

    expect(alertSpy).toHaveBeenCalledWith(
      expect.stringContaining('valid image file')
    )
    expect(mockOnImageSelect).not.toHaveBeenCalled()

    alertSpy.mockRestore()
  })

  it('should validate file size and reject large files', () => {
    const largeFile = createMockImageFile('large.jpg')
    Object.defineProperty(largeFile, 'size', { value: 15 * 1024 * 1024 }) // 15MB

    const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {})

    render(<ImageUpload onImageSelect={mockOnImageSelect} />)

    // Get the hidden file input and simulate file selection
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
    fireEvent.change(fileInput, { target: { files: [largeFile] } })

    expect(alertSpy).toHaveBeenCalledWith(
      expect.stringContaining('too large')
    )
    expect(mockOnImageSelect).not.toHaveBeenCalled()

    alertSpy.mockRestore()
  })

  it('should remove file when remove button is clicked', () => {
    const file = createMockImageFile('test.jpg')

    render(<ImageUpload onImageSelect={mockOnImageSelect} />)

    // Select file first
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
    fireEvent.change(fileInput, { target: { files: [file] } })

    // Click remove button
    const removeButton = screen.getByText('×')
    fireEvent.click(removeButton)

    expect(mockRevokeObjectURL).toHaveBeenCalledWith('mock-object-url')
    expect(screen.queryByAltText('Preview')).not.toBeInTheDocument()
    expect(screen.getByText(/click to upload/i)).toBeInTheDocument()
  })

  it('should disable interactions when loading', () => {
    render(<ImageUpload onImageSelect={mockOnImageSelect} isLoading={true} />)

    const uploadButton = screen.getByRole('button', { name: /click to upload/i })
    expect(uploadButton).toBeDisabled()

    const dropZone = uploadButton.closest('div')
    expect(dropZone).toHaveClass('opacity-50', 'pointer-events-none')
  })

  it('should handle multiple file selection and use first file', () => {
    const file1 = createMockImageFile('test1.jpg')
    const file2 = createMockImageFile('test2.jpg')

    render(<ImageUpload onImageSelect={mockOnImageSelect} />)

    // Get the hidden file input and simulate file selection
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
    fireEvent.change(fileInput, { target: { files: [file1, file2] } })

    expect(mockOnImageSelect).toHaveBeenCalledWith(file1)
  })

  it('should clear file input when removing file', () => {
    const file = createMockImageFile('test.jpg')

    render(<ImageUpload onImageSelect={mockOnImageSelect} />)

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement

    // Select file first
    fireEvent.change(fileInput, { target: { files: [file] } })

    // Click remove button
    const removeButton = screen.getByText('×')
    fireEvent.click(removeButton)

    expect(fileInput.value).toBe('')
  })
})
