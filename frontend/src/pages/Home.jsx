import React, { useState, useEffect } from 'react';
import ImageUpload from '../components/ImageUpload';
import DownloadButton from '../components/DownloadButton';

const Home = () => {
  const [originalImage, setOriginalImage] = useState(null);
  const [processedImage, setProcessedImage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);

  // API URL from environment variable
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  // Set page title
  useEffect(() => {
    document.title = "Removeer | AI-Powered Background Removal Tool";
  }, []);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging) return;
      
      const slider = document.querySelector('.demo-container');
      if (!slider) return;

      const rect = slider.getBoundingClientRect();
      const x = Math.min(Math.max(0, e.clientX - rect.left), rect.width);
      const percentage = (x / rect.width) * 100;
      setSliderPosition(percentage);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  const handleUpload = async (file) => {
    setOriginalImage(file);
    setIsProcessing(true);
    setProcessedImage(null);

    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch(`${API_URL}/api/images/upload`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.details || data.error || 'Processing failed');
      }
      
      if (data.processedUrl) {
        setProcessedImage(data.processedUrl);
      } else {
        throw new Error('No processed URL received');
      }
    } catch (error) {
      console.error('Error:', error);
      alert(`Failed to process image: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setOriginalImage(null);
    setProcessedImage(null);
    setIsProcessing(false);
  };

  const handleDownload = async (url) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `removeer-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Download failed:', error);
      alert('Failed to download image. Please try again.');
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Navigation Bar */}
      <nav className="bg-white border-b border-gray-200 fixed w-full top-0 z-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between h-[72px]">
            {/* Left side - Logo and Primary Nav */}
            <div className="flex items-center -ml-3">
              {/* Logo */}
              <a 
                href="#" 
                onClick={(e) => {
                  e.preventDefault();
                  handleReset();
                }} 
                className="flex-shrink-0 flex items-center px-3 hover:opacity-90 transition-opacity"
              >
                <span className="text-[32px] font-black tracking-tight">
                  <span className="text-[#3D4047] font-extrabold tracking-[0.02em]" style={{ fontFamily: 'Inter, system-ui' }}>remove</span>
                  <span className="text-[#2A90FE] tracking-[0.01em]" style={{ fontFamily: 'Inter, system-ui' }}>er</span>
                </span>
              </a>

              {/* Primary Navigation */}
              <div className="hidden lg:flex lg:items-center lg:ml-7">
                {/* Products Dropdown */}
                <div className="relative group">
                  <button className="flex items-center px-3 py-2 text-[15px] font-medium text-[#666D7C] hover:text-[#3D4047] group">
                    Products
                    <svg className="ml-1.5 h-4 w-4 text-[#666D7C] group-hover:text-[#3D4047]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>

                {/* Use Cases Dropdown */}
                <div className="relative group">
                  <button className="flex items-center px-3 py-2 text-[15px] font-medium text-[#666D7C] hover:text-[#3D4047] group">
                    Use Cases
                    <svg className="ml-1.5 h-4 w-4 text-[#666D7C] group-hover:text-[#3D4047]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>

                {/* Developers Link */}
                <a href="#" className="px-3 py-2 text-[15px] font-medium text-[#666D7C] hover:text-[#3D4047]">
                  Developers
                </a>

                {/* Pricing Link */}
                <a href="#" className="px-3 py-2 text-[15px] font-medium text-[#666D7C] hover:text-[#3D4047]">
                  Pricing
                </a>
              </div>
            </div>

            {/* Right side - Secondary Nav and Buttons */}
            <div className="hidden lg:flex lg:items-center">
              <a href="#" className="px-3 py-2 text-[15px] font-medium text-[#666D7C] hover:text-[#3D4047]">
                Help
              </a>
              <a href="#" className="px-3 py-2 text-[15px] font-medium text-[#666D7C] hover:text-[#3D4047]">
                Log in
              </a>
              <button className="ml-3 px-3 py-2 text-[15px] font-medium text-[#2A90FE] hover:text-[#2A90FE]/90">
                Sign up free
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-grow">
        {!originalImage ? (
          // Welcome Page Layout
          <div className="h-[calc(100vh-72px)]">
            <div className="container h-full mx-auto px-4">
              <div className="max-w-7xl mx-auto h-full pt-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 h-full">
                  {/* Left Side - Animation and Message */}
                  <div className="flex flex-col justify-center items-center space-y-8 mt-12">
                    {/* Demo Container */}
                    <div className="relative w-[360px] h-[280px] rounded-xl border border-gray-200 overflow-hidden demo-container"
                         onMouseDown={() => setIsDragging(true)}>
                      {/* Original Side */}
                      <div className="absolute inset-0">
                        <img 
                          src="/demo-original.jpg" 
                          alt="Original" 
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Processed Side */}
                      <div className="absolute inset-0 demo-transition"
                           style={{ clipPath: `polygon(${sliderPosition}% 0, 100% 0, 100% 100%, ${sliderPosition}% 100%)` }}>
                        <div className="absolute inset-0 bg-[#f8f9fb]">
                          <img 
                            src="/demo-processed.png" 
                            alt="Processed" 
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>

                      {/* Divider Line */}
                      <div 
                        className="absolute top-0 bottom-0 w-1 bg-white shadow-lg cursor-col-resize"
                        style={{ left: `${sliderPosition}%` }}
                      >
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center">
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7v10M15 7v10" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    {/* Message */}
                    <div className="text-center max-w-lg">
                      <h1 className="text-[32px] leading-tight font-bold text-[#3D4047] mb-4">
                        Remove Image Background
                      </h1>
                      <p className="text-lg text-[#666D7C] mb-6">
                        Remove background from images automatically in seconds with our AI-powered tool. 
                        100% free, no sign-up required.
                      </p>
                      <div className="flex flex-wrap gap-4 justify-center text-sm text-[#666D7C]">
                        <div className="flex items-center">
                          <svg className="h-5 w-5 mr-2 text-[#2A90FE]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Automatic AI Processing
                        </div>
                        <div className="flex items-center">
                          <svg className="h-5 w-5 mr-2 text-[#2A90FE]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          High-Quality Results
                        </div>
                        <div className="flex items-center">
                          <svg className="h-5 w-5 mr-2 text-[#2A90FE]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Instant Download
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Side - Upload Section */}
                  <div className="flex items-center justify-center">
                    <div className="w-full max-w-md">
                      <ImageUpload onUpload={handleUpload} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          // Image Processing Page
          <div className="min-h-screen bg-gray-50 pt-[72px]">
            <div className="container mx-auto px-4 py-12">
              <div className="max-w-5xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-[2fr,1fr] gap-6">
                  {/* Left Side - Image Display */}
                  <div className="bg-white rounded-2xl shadow-sm p-8">
                    <div className="relative w-full mx-auto">
                      <div className="relative w-full" style={{ maxHeight: '500px' }}>
                        <div className="relative rounded-xl overflow-hidden bg-[#f8f9fb] border border-gray-200" style={{ paddingBottom: '75%' }}>
                          {/* Checkerboard background */}
                          <div className="absolute inset-0" style={{
                            backgroundColor: '#fff',
                            backgroundImage: `
                              linear-gradient(45deg, #f0f0f0 25%, transparent 25%),
                              linear-gradient(-45deg, #f0f0f0 25%, transparent 25%),
                              linear-gradient(45deg, transparent 75%, #f0f0f0 75%),
                              linear-gradient(-45deg, transparent 75%, #f0f0f0 75%)
                            `,
                            backgroundSize: '20px 20px',
                            backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
                          }} />

                          {originalImage && !processedImage && (
                            <img
                              src={URL.createObjectURL(originalImage)}
                              alt="Original"
                              className="absolute inset-0 w-full h-full object-contain"
                            />
                          )}
                          {processedImage && (
                            <img
                              src={processedImage}
                              alt="Processed"
                              className="absolute inset-0 w-full h-full object-contain"
                            />
                          )}
                          {isProcessing && (
                            <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 backdrop-blur-sm">
                              <div className="flex flex-col items-center">
                                <div className="relative w-16 h-16 mb-4">
                                  <div className="absolute inset-0 rounded-full border-4 border-blue-100 opacity-25"></div>
                                  <div className="absolute inset-0 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"></div>
                                </div>
                                <div className="text-center">
                                  <p className="text-lg font-medium text-gray-900">Processing image...</p>
                                  <p className="text-sm text-gray-500 mt-1">This may take a few seconds</p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Side - Options Panel */}
                  <div className="bg-white rounded-2xl shadow-sm p-8">
                    <div className="space-y-8">
                      {/* Background Options */}
                      <div className="space-y-3">
                        <button className="w-full flex items-center px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-xl text-left transition-colors group">
                          <div className="w-10 h-10 flex items-center justify-center bg-white rounded-lg shadow-sm group-hover:scale-105 transition-transform">
                            <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4 4m0 0l4-4m-4 4V4m0 0h8m-8 0H4" />
                            </svg>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">Choose Background Image</div>
                            <div className="text-xs text-gray-500">Upload or select from gallery</div>
                          </div>
                        </button>

                        <button className="w-full flex items-center px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-xl text-left transition-colors group">
                          <div className="w-10 h-10 flex items-center justify-center bg-white rounded-lg shadow-sm group-hover:scale-105 transition-transform">
                            <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4l2 2h4l2-2h4a2 2 0 012 2v12a4 4 0 01-4 4H7z" />
                            </svg>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">Select Background Color</div>
                            <div className="text-xs text-gray-500">Choose solid color or gradient</div>
                          </div>
                        </button>
                      </div>

                      {/* Separator */}
                      <div className="border-t border-gray-200"></div>

                      {/* Download Options */}
                      <div className="space-y-6">
                        <div>
                          <button 
                            onClick={() => handleDownload(processedImage)}
                            className="w-full flex items-center justify-center px-4 py-2 bg-blue-500 rounded-full text-sm font-medium text-white hover:bg-blue-600 transition-colors shadow-sm hover:shadow"
                          >
                            Download
                          </button>
                          <p className="text-xs text-gray-500 mt-2 text-center">1024 x 768 px</p>
                        </div>

                        <div>
                          <button 
                            disabled
                            title="Please login to download HD quality"
                            className="w-full flex items-center justify-center px-4 py-2 bg-gray-300 rounded-full text-sm font-medium text-white hover:bg-gray-300 cursor-not-allowed transition-colors shadow-sm"
                          >
                            Download HD
                          </button>
                          <p className="text-xs text-gray-500 mt-2 text-center">Original Quality • Login Required</p>
                        </div>
                      </div>

                      {/* Process Another Image */}
                      <div className="pt-4 border-t border-gray-200">
                        <button
                          onClick={handleReset}
                          className="w-full flex items-center justify-center px-4 py-2 bg-gray-100 rounded-full text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors"
                        >
                          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L12 8m4-4v12" />
                          </svg>
                          Process Another Image
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Home; 