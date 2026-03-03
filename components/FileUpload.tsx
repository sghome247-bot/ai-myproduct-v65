import React, { useState, useCallback } from 'react';
import { Icon } from './Icon';
import { Texts } from '../types';

interface FileUploadProps {
  onFileChange: (file: File | null) => void;
  imagePreview: string | null;
  texts: Texts;
  isLoading?: boolean;
  className?: string;
  onClear?: () => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileChange, imagePreview, texts, isLoading = false, className = 'h-48', onClear }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragEnter = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (isLoading) return;
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (isLoading) return;
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileChange(e.dataTransfer.files[0]);
    }
  }, [onFileChange, isLoading]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileChange(e.target.files[0]);
    }
  };

  return (
    <div>
      <label
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={`relative flex justify-center items-center w-full border-2 border-dashed rounded-lg transition-colors ${className} ${
          isLoading 
            ? 'border-blue-400 bg-blue-200/50' 
            : isDragging 
            ? 'border-blue-500 bg-blue-200/50' 
            : 'border-blue-300 hover:border-blue-400 cursor-pointer'
        }`}
      >
        {isLoading ? (
          <div className="text-center text-blue-700 flex flex-col items-center justify-center">
             <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-sm font-medium mt-2">{texts.analyzingImage}</p>
          </div>
        ) : imagePreview ? (
          <>
            <img src={imagePreview} alt="Preview" className="w-full h-full object-contain rounded-lg p-1" />
            {onClear && (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onClear();
                }}
                className="absolute top-1 right-1 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg hover:bg-blue-700 transition-colors z-10 border-2 border-white shadow-sm"
                aria-label="Remove image"
              >
                &times;
              </button>
            )}
          </>
        ) : (
          <div className="text-center text-blue-600">
            <Icon type="upload" className="w-8 h-8 mx-auto mb-2" />
            <p className="text-sm">{texts.uploadPlaceholder}</p>
          </div>
        )}
        <input
          type="file"
          className="hidden"
          accept="image/png, image/jpeg"
          onChange={handleFileSelect}
          disabled={isLoading}
        />
      </label>
    </div>
  );
};