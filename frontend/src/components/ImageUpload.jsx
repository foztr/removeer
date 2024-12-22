import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_IMAGE_DIMENSION = 2000; // Maximum width or height in pixels

const ImageUpload = ({ onUpload }) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const validateAndResizeImage = async (file) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        URL.revokeObjectURL(img.src);
        
        // Check dimensions
        const maxDim = Math.max(img.width, img.height);
        if (maxDim > MAX_IMAGE_DIMENSION) {
          const canvas = document.createElement('canvas');
          const scale = MAX_IMAGE_DIMENSION / maxDim;
          
          canvas.width = img.width * scale;
          canvas.height = img.height * scale;
          
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          
          canvas.toBlob((blob) => {
            resolve(new File([blob], file.name, { type: 'image/jpeg' }));
          }, 'image/jpeg', 0.9);
        } else {
          resolve(file);
        }
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.webp']
    },
    maxFiles: 1,
    maxSize: MAX_FILE_SIZE,
    onDrop: async (acceptedFiles, rejectedFiles) => {
      if (rejectedFiles.length > 0) {
        const error = rejectedFiles[0].errors[0];
        if (error.code === 'file-too-large') {
          setError(`File is too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB`);
        } else {
          setError(error.message);
        }
        return;
      }

      if (acceptedFiles.length > 0) {
        setError(null);
        setUploading(true);
        try {
          const resizedFile = await validateAndResizeImage(acceptedFiles[0]);
          await onUpload(resizedFile);
        } catch (err) {
          setError('Failed to process image. Please try again.');
        } finally {
          setUploading(false);
        }
      }
    },
  });

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div
        {...getRootProps()}
        className={`
          relative rounded-xl p-8
          border-2 border-dashed transition-all duration-200
          ${isDragActive 
            ? 'border-blue-500 bg-blue-50' 
            : error 
              ? 'border-red-300 hover:border-red-400 bg-red-50'
              : 'border-gray-300 hover:border-blue-400 bg-white'
          }
        `}
      >
        <input {...getInputProps()} />
        
        {/* Upload Content */}
        <div className="space-y-4">
          {/* Icon */}
          <div className="mx-auto w-20 h-20 flex items-center justify-center">
            <svg
              className={`w-12 h-12 transition-colors duration-200 ${
                isDragActive ? 'text-blue-500' : error ? 'text-red-400' : 'text-gray-400'
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>

          {/* Text Content */}
          {uploading ? (
            <div className="text-center space-y-3">
              <div className="inline-flex items-center px-4 py-2 font-semibold text-blue-600">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Uploading image...
              </div>
            </div>
          ) : (
            <div className="text-center space-y-3">
              {error ? (
                <p className="text-sm font-medium text-red-600">{error}</p>
              ) : (
                <>
                  <p className="text-lg font-medium text-gray-900">
                    Drop your image here, or{' '}
                    <span className="text-blue-500">browse</span>
                  </p>
                  <p className="text-sm text-gray-500">
                    Supports JPG, PNG, WEBP
                  </p>
                </>
              )}
            </div>
          )}

          {/* File Size Info */}
          {!uploading && !error && (
            <div className="text-center">
              <p className="text-xs text-gray-400">
                Up to 5 MB • Max dimension 2000px
              </p>
            </div>
          )}
        </div>

        {/* Drag Overlay */}
        {isDragActive && !error && (
          <div className="absolute inset-0 bg-blue-50 bg-opacity-90 rounded-xl flex items-center justify-center">
            <p className="text-lg font-medium text-blue-600">
              Drop your image here
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageUpload; 