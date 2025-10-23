'use client';

import { useState } from 'react';
import TTBForm from '@/components/TTBForm';
import ImageUpload from '@/components/ImageUpload';
import ResultsDisplay from '@/components/ResultsDisplay';
import { TTBFormData, VerificationResult, OCRResult, ProcessingError } from '@/types';
import { extractTextFromImage, isOCRResult } from '@/utils/ocr';
import { verifyLabel } from '@/lib/verification';

export default function Home() {
  const [formData, setFormData] = useState<TTBFormData | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFormSubmit = async (data: TTBFormData) => {
    setFormData(data);
    setError(null);
    
    if (!selectedImage) {
      setError('Please upload an image before submitting the form.');
      return;
    }

    setIsProcessing(true);
    
    try {
      // Extract text from image using OCR
      const ocrResult = await extractTextFromImage(selectedImage);
      
      if (isOCRResult(ocrResult)) {
        // Verify the label against form data
        const result = verifyLabel(data, ocrResult);
        setVerificationResult(result);
      } else {
        // Handle OCR error
        setError(ocrResult.message);
      }
    } catch (err) {
      setError('An unexpected error occurred during processing.');
      console.error('Processing error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleImageSelect = (file: File) => {
    setSelectedImage(file);
    setError(null);
    setVerificationResult(null);
  };

  const handleRetry = () => {
    setFormData(null);
    setSelectedImage(null);
    setVerificationResult(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            TTB Label Verification System
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Upload an alcohol label image and verify it matches your TTB application form data.
            This system uses OCR technology to extract and compare label information.
          </p>
        </div>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto">
          {!verificationResult ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Form Section */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-2xl font-semibold text-gray-800 mb-6">
                  TTB Application Form
                </h2>
                <TTBForm onSubmit={handleFormSubmit} isLoading={isProcessing} />
              </div>

              {/* Image Upload Section */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-2xl font-semibold text-gray-800 mb-6">
                  Label Image Upload
                </h2>
                <ImageUpload onImageSelect={handleImageSelect} isLoading={isProcessing} />
              </div>
            </div>
          ) : (
            /* Results Section */
            <div className="max-w-4xl mx-auto">
              <ResultsDisplay result={verificationResult} onRetry={handleRetry} />
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <span className="text-red-400 text-xl">⚠️</span>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Error</h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>{error}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Processing Indicator */}
          {isProcessing && (
            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-blue-800">
                    Processing image and verifying label information...
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-gray-500 text-sm">
          <p>
            This is a demonstration system for TTB label verification. 
            It uses OCR technology to extract text from alcohol label images and compare it with form data.
          </p>
        </div>
      </div>
    </div>
  );
}
