// TTB Form Component

'use client';

import { useState } from 'react';
import { TTBFormData, OCRProvider } from '@/types';

interface TTBFormProps {
  onSubmit: (data: TTBFormData) => void;
  isLoading?: boolean;
}

export default function TTBForm({ onSubmit, isLoading = false }: TTBFormProps) {
  const [formData, setFormData] = useState<TTBFormData>({
    brandName: '',
    productClass: '',
    alcoholContent: undefined,
    netContents: '',
    ocrProvider: 'google-cloud-vision',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.brandName.trim()) {
      newErrors.brandName = 'Brand name is required';
    }

    if (!formData.productClass.trim()) {
      newErrors.productClass = 'Product class is required';
    }

    if (formData.alcoholContent !== undefined && (formData.alcoholContent <= 0 || formData.alcoholContent > 100)) {
      newErrors.alcoholContent = 'Alcohol content must be between 0 and 100%';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const handleInputChange = (field: keyof TTBFormData, value: string | number | OCRProvider | undefined) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="brandName" className="block text-sm font-medium text-gray-700 mb-2">
          Brand Name *
        </label>
        <input
          type="text"
          id="brandName"
          value={formData.brandName}
          onChange={(e) => handleInputChange('brandName', e.target.value)}
          className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 ${
            errors.brandName ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="e.g., Old Tom Distillery"
          disabled={isLoading}
        />
        {errors.brandName && (
          <p className="mt-1 text-sm text-red-600">{errors.brandName}</p>
        )}
      </div>

      <div>
        <label htmlFor="productClass" className="block text-sm font-medium text-gray-700 mb-2">
          Product Class/Type *
        </label>
        <select
          id="productClass"
          value={formData.productClass}
          onChange={(e) => handleInputChange('productClass', e.target.value)}
          className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 ${
            errors.productClass ? 'border-red-500' : 'border-gray-300'
          }`}
          disabled={isLoading}
        >
          <option value="">Select product type</option>
          <option value="Bourbon Whiskey">Bourbon Whiskey</option>
          <option value="Vodka">Vodka</option>
          <option value="Gin">Gin</option>
          <option value="Rum">Rum</option>
          <option value="Tequila">Tequila</option>
          <option value="Scotch Whisky">Scotch Whisky</option>
          <option value="IPA">IPA</option>
          <option value="Lager">Lager</option>
          <option value="Ale">Ale</option>
          <option value="Wine">Wine</option>
          <option value="Other">Other</option>
        </select>
        {errors.productClass && (
          <p className="mt-1 text-sm text-red-600">{errors.productClass}</p>
        )}
      </div>

      <div>
        <label htmlFor="alcoholContent" className="block text-sm font-medium text-gray-700 mb-2">
          Alcohol Content (ABV) (Optional)
        </label>
        <div className="relative">
          <input
            type="number"
            id="alcoholContent"
            value={formData.alcoholContent || ''}
            onChange={(e) => handleInputChange('alcoholContent', e.target.value ? parseFloat(e.target.value) : undefined)}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 ${
              errors.alcoholContent ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="45"
            min="0"
            max="100"
            step="0.1"
            disabled={isLoading}
          />
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <span className="text-gray-500 sm:text-sm">%</span>
          </div>
        </div>
        {errors.alcoholContent && (
          <p className="mt-1 text-sm text-red-600">{errors.alcoholContent}</p>
        )}
      </div>

      <div>
        <label htmlFor="netContents" className="block text-sm font-medium text-gray-700 mb-2">
          Net Contents (Optional)
        </label>
        <input
          type="text"
          id="netContents"
          value={formData.netContents || ''}
          onChange={(e) => handleInputChange('netContents', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
          placeholder="e.g., 750 mL, 12 fl oz"
          disabled={isLoading}
        />
      </div>

      <div>
        <label htmlFor="ocrProvider" className="block text-sm font-medium text-gray-700 mb-2">
          OCR Provider
        </label>
        <select
          id="ocrProvider"
          value={formData.ocrProvider || 'google-cloud-vision'}
          onChange={(e) => handleInputChange('ocrProvider', e.target.value as OCRProvider)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
          disabled={isLoading}
        >
          <option value="tesseract">Tesseract (Local OCR)</option>
          <option value="google-cloud-vision">Google Cloud Vision API</option>
        </select>
        <p className="mt-1 text-xs text-gray-500">
          Tesseract runs locally in your browser. Google Cloud Vision API requires API credentials and runs on Google's servers.
        </p>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Processing...' : 'Submit for Verification'}
      </button>
    </form>
  );
}
