import React, { useState } from 'react';
import ImageUpload from '../components/ImageUpload';
import ImagePreview from '../components/ImagePreview';
import DownloadButton from '../components/DownloadButton';

const Home = () => {
  const [originalImage, setOriginalImage] = useState(null);
  const [processedImage, setProcessedImage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleUpload = async (file) => {
    setOriginalImage(file);
    setIsProcessing(true);
    setProcessedImage(null);

    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('/api/images/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      
      if (data.processedUrl) {
        setProcessedImage(data.processedUrl);
      } else {
        throw new Error('Processing failed');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to process image. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">
        Background Removal Tool
      </h1>
      
      <ImageUpload onUpload={handleUpload} />
      
      {(originalImage || isProcessing || processedImage) && (
        <ImagePreview
          originalImage={originalImage}
          processedImage={processedImage}
          isProcessing={isProcessing}
        />
      )}
      
      {processedImage && (
        <div className="mt-8 text-center">
          <DownloadButton
            imageUrl={processedImage}
            fileName="removed-background.png"
          />
        </div>
      )}
    </div>
  );
};

export default Home; 