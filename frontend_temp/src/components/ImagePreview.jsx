import React from 'react';

const ImagePreview = ({ originalImage, processedImage, isProcessing }) => {
  return (
    <div className="flex flex-col md:flex-row gap-8 mt-8">
      <div className="flex-1">
        <h3 className="text-lg font-semibold mb-2">Original Image</h3>
        <div className="bg-gray-50 rounded-lg p-4">
          {originalImage && (
            <img
              src={URL.createObjectURL(originalImage)}
              alt="Original"
              className="max-w-full h-auto rounded"
            />
          )}
        </div>
      </div>
      
      <div className="flex-1">
        <h3 className="text-lg font-semibold mb-2">Processed Image</h3>
        <div className="bg-gray-50 rounded-lg p-4">
          {isProcessing ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : processedImage ? (
            <img
              src={processedImage}
              alt="Processed"
              className="max-w-full h-auto rounded"
            />
          ) : (
            <div className="text-gray-400 text-center py-8">
              Processed image will appear here
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImagePreview; 