import React, { useState, useRef } from 'react';
import { ImportValidationResult } from '@/types/domains/setupWizard';

interface QuickDataImportProps {
  onFileSelect: (file: File, type: 'csv' | 'json') => void;
  onValidationResult?: (result: ImportValidationResult) => void;
  acceptedFormats?: string[];
  maxFileSize?: number; // in MB
  className?: string;
}

const QuickDataImport: React.FC<QuickDataImportProps> = ({
  onFileSelect,
  onValidationResult,
  acceptedFormats = ['.csv', '.json'],
  maxFileSize = 10,
  className = ''
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importType, setImportType] = useState<'csv' | 'json'>('csv');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    if (file.size > maxFileSize * 1024 * 1024) {
      const validationResult: ImportValidationResult = {
        isValid: false,
        warnings: [],
        errors: [`File size exceeds ${maxFileSize}MB limit`]
      };
      onValidationResult?.(validationResult);
      return;
    }

    const extension = file.name.toLowerCase().split('.').pop();
    if (!acceptedFormats.some(format => format.includes(extension || ''))) {
      const validationResult: ImportValidationResult = {
        isValid: false,
        warnings: [],
        errors: [`File type not supported. Accepted formats: ${acceptedFormats.join(', ')}`]
      };
      onValidationResult?.(validationResult);
      return;
    }

    setSelectedFile(file);
    
    // Auto-detect import type based on file extension
    const detectedType = extension === 'json' ? 'json' : 'csv';
    setImportType(detectedType);
    
    onFileSelect(file, detectedType);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const handleClearFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={className}>
      {/* File Drop Zone - Mobile Optimized */}
      <div
        className={`
          border-2 border-dashed rounded-lg p-4 sm:p-6 text-center
          transition-colors duration-200
          ${isDragOver 
            ? 'border-blue-400 bg-blue-50' 
            : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
          }
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {selectedFile ? (
          <div className="space-y-4">
            {/* Selected File Info */}
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-2">
              <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="text-center sm:text-left">
                <p className="text-sm font-medium text-gray-900 break-all">{selectedFile.name}</p>
                <p className="text-xs text-gray-500">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB • {importType.toUpperCase()}
                </p>
              </div>
            </div>
            
            {/* Import Type Selection - Mobile Responsive */}
            <div className="flex flex-col sm:flex-row justify-center space-y-2 sm:space-y-0 sm:space-x-4">
              <label className="flex items-center justify-center sm:justify-start">
                <input
                  type="radio"
                  value="csv"
                  checked={importType === 'csv'}
                  onChange={(e) => {
                    setImportType(e.target.value as 'csv' | 'json');
                    onFileSelect(selectedFile, e.target.value as 'csv' | 'json');
                  }}
                  className="mr-2"
                />
                <span className="text-sm">CSV Format</span>
              </label>
              <label className="flex items-center justify-center sm:justify-start">
                <input
                  type="radio"
                  value="json"
                  checked={importType === 'json'}
                  onChange={(e) => {
                    setImportType(e.target.value as 'csv' | 'json');
                    onFileSelect(selectedFile, e.target.value as 'csv' | 'json');
                  }}
                  className="mr-2"
                />
                <span className="text-sm">JSON Format</span>
              </label>
            </div>

            {/* Actions - Mobile Stacked */}
            <div className="flex flex-col sm:flex-row justify-center space-y-2 sm:space-y-0 sm:space-x-3">
              <button
                type="button"
                onClick={handleBrowseClick}
                className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Choose Different File
              </button>
              <button
                type="button"
                onClick={handleClearFile}
                className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Remove File
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-center">
              <svg className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            
            <div>
              <p className="text-base sm:text-lg font-medium text-gray-900 mb-2">
                Import Your Data
              </p>
              <p className="text-sm text-gray-600 mb-4">
                Drag and drop your file here, or click to browse
              </p>
            </div>

            <button
              type="button"
              onClick={handleBrowseClick}
              className="w-full sm:w-auto px-6 py-3 sm:py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Browse Files
            </button>

            <p className="text-xs text-gray-500 px-2">
              Supports {acceptedFormats.join(', ')} files up to {maxFileSize}MB
            </p>
          </div>
        )}
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedFormats.join(',')}
        onChange={handleFileInputChange}
        className="hidden"
      />
    </div>
  );
};

export default QuickDataImport;