// Results Display Component

'use client';

import { VerificationResult } from '@/types';

interface ResultsDisplayProps {
  result: VerificationResult;
  onRetry: () => void;
}

export default function ResultsDisplay({ result, onRetry }: ResultsDisplayProps) {
  const getStatusIcon = (match: boolean) => {
    return match ? (
      <span className="text-green-500 text-xl">✅</span>
    ) : (
      <span className="text-red-500 text-xl">❌</span>
    );
  };

  const getStatusColor = (match: boolean) => {
    return match ? 'text-green-700' : 'text-red-700';
  };

  const getStatusText = (match: boolean) => {
    return match ? 'Matched' : 'Mismatch';
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
      {/* Overall Status */}
      <div className="text-center">
        <div className="text-4xl mb-2">
          {result.overallMatch ? '✅' : '❌'}
        </div>
        <h2 className={`text-2xl font-bold ${
          result.overallMatch ? 'text-green-700' : 'text-red-700'
        }`}>
          {result.overallMatch ? 'Verification Passed' : 'Verification Failed'}
        </h2>
        <p className="text-gray-600 mt-2">
          {result.overallMatch 
            ? 'All required information matches the label.' 
            : 'Some information does not match the label.'
          }
        </p>
      </div>

      {/* Extracted Text Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800">Extracted Text</h3>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-600">OCR Confidence: {Math.round(result.ocrConfidence * 100)}%</span>
            <button
              onClick={() => navigator.clipboard.writeText(result.extractedText)}
              className="text-xs text-blue-600 hover:text-blue-800 underline"
            >
              Copy to Clipboard
            </button>
          </div>
          <div className="bg-white border border-gray-200 rounded p-3 max-h-60 overflow-y-auto">
            <pre className="text-sm text-gray-800 whitespace-pre-wrap font-mono">
              {result.extractedText || 'No text extracted from image'}
            </pre>
          </div>
        </div>
      </div>

      {/* Detailed Results */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800">Verification Details</h3>
        
        {/* Brand Name */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-3">
            {getStatusIcon(result.brandName.match)}
            <span className="font-medium">Brand Name</span>
          </div>
          <span className={`font-medium ${getStatusColor(result.brandName.match)}`}>
            {getStatusText(result.brandName.match)}
          </span>
        </div>

        {/* Product Class */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-3">
            {getStatusIcon(result.productClass.match)}
            <span className="font-medium">Product Class</span>
          </div>
          <span className={`font-medium ${getStatusColor(result.productClass.match)}`}>
            {getStatusText(result.productClass.match)}
          </span>
        </div>

        {/* Alcohol Content (if provided) */}
        {result.alcoholContent && (
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              {getStatusIcon(result.alcoholContent.match)}
              <span className="font-medium">Alcohol Content</span>
            </div>
            <span className={`font-medium ${getStatusColor(result.alcoholContent.match)}`}>
              {getStatusText(result.alcoholContent.match)}
            </span>
          </div>
        )}

        {/* Net Contents (if provided) */}
        {result.netContents && (
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              {getStatusIcon(result.netContents.match)}
              <span className="font-medium">Net Contents</span>
            </div>
            <span className={`font-medium ${getStatusColor(result.netContents.match)}`}>
              {getStatusText(result.netContents.match)}
            </span>
          </div>
        )}

        {/* Government Warning */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-3">
            {getStatusIcon(result.governmentWarning.found)}
            <span className="font-medium">Government Warning</span>
          </div>
          <span className={`font-medium ${getStatusColor(result.governmentWarning.found)}`}>
            {result.governmentWarning.found ? 'Found' : 'Not Found'}
          </span>
        </div>
      </div>

      {/* Detailed Mismatch Information */}
      {!result.overallMatch && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h4 className="font-semibold text-red-800 mb-2">Issues Found:</h4>
          <ul className="space-y-2 text-sm text-red-700">
            {!result.brandName.match && (
              <li className="flex flex-col">
                <span className="font-medium">• Brand name mismatch:</span>
                <span className="ml-4">Expected: &quot;{result.brandName.expected}&quot;</span>
                <span className="ml-4">Extracted: &quot;{result.brandName.extracted}&quot;</span>
              </li>
            )}
            {!result.productClass.match && (
              <li className="flex flex-col">
                <span className="font-medium">• Product class mismatch:</span>
                <span className="ml-4">Expected: &quot;{result.productClass.expected}&quot;</span>
                <span className="ml-4">Extracted: &quot;{result.productClass.extracted}&quot;</span>
              </li>
            )}
            {result.alcoholContent && !result.alcoholContent.match && (
              <li className="flex flex-col">
                <span className="font-medium">• Alcohol content mismatch:</span>
                <span className="ml-4">Expected: {result.alcoholContent.expected}%</span>
                <span className="ml-4">Extracted: {result.alcoholContent.extracted}%</span>
              </li>
            )}
            {result.netContents && !result.netContents.match && (
              <li className="flex flex-col">
                <span className="font-medium">• Net contents mismatch:</span>
                <span className="ml-4">Expected: &quot;{result.netContents.expected}&quot;</span>
                <span className="ml-4">Extracted: &quot;{result.netContents.extracted}&quot;</span>
              </li>
            )}
            {!result.governmentWarning.found && (
              <li>• Government warning text not found on label</li>
            )}
          </ul>
        </div>
      )}

      {/* Retry Button */}
      <div className="text-center">
        <button
          onClick={onRetry}
          className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Try Another Label
        </button>
      </div>
    </div>
  );
}
