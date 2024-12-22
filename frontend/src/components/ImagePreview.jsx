import React from 'react';

const ImagePreview = ({ originalImage, processedImage, isProcessing }) => {
  return (
    <div className="flex flex-col md:flex-row gap-8">
      {/* Original Image */}
      <div className="flex-1 bg-[#fafafa] rounded-xl p-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Original Image</h3>
        </div>
        <div className="relative aspect-square rounded-lg overflow-hidden bg-white shadow-sm">
          {originalImage && (
            <img
              src={URL.createObjectURL(originalImage)}
              alt="Original"
              className="w-full h-full object-contain"
            />
          )}
        </div>
      </div>

      {/* Processing Animation */}
      {isProcessing && (
        <div className="hidden md:flex items-center justify-center w-16">
          <div className="relative">
            <div className="w-10 h-10 border-4 border-blue-200 rounded-full animate-pulse"></div>
            <div className="absolute top-0 left-0 w-10 h-10 border-4 border-blue-500 rounded-full animate-spin border-t-transparent"></div>
          </div>
        </div>
      )}

      {/* Arrow for non-processing state */}
      {!isProcessing && (
        <div className="hidden md:flex items-center justify-center w-16">
          <svg
            className="w-8 h-8 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M14 5l7 7m0 0l-7 7m7-7H3"
            />
          </svg>
        </div>
      )}

      {/* Processed Image */}
      <div className="flex-1 bg-[#fafafa] rounded-xl p-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Removed Background</h3>
        </div>
        <div className="relative aspect-square rounded-lg overflow-hidden shadow-sm">
          {/* Checkerboard background */}
          <div 
            className="absolute inset-0" 
            style={{
              backgroundColor: '#fff',
              backgroundImage: `
                linear-gradient(45deg, #f0f0f0 25%, transparent 25%),
                linear-gradient(-45deg, #f0f0f0 25%, transparent 25%),
                linear-gradient(45deg, transparent 75%, #f0f0f0 75%),
                linear-gradient(-45deg, transparent 75%, #f0f0f0 75%)
              `,
              backgroundSize: '20px 20px',
              backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
            }}
          />
          
          {isProcessing ? (
            <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90">
              <div className="text-center space-y-3">
                <div className="inline-flex items-center px-4 py-2 text-blue-600">
                  <svg className="animate-spin mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span className="font-medium">Processing image...</span>
                </div>
                <p className="text-sm text-gray-500">This may take a few seconds</p>
              </div>
            </div>
          ) : processedImage ? (
            <div className="relative w-full h-full">
              <img
                src={processedImage}
                alt="Processed"
                className="absolute inset-0 w-full h-full object-contain"
              />
            </div>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center p-4">
                <p className="text-sm text-gray-500">
                  Processed image will appear here
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImagePreview; 