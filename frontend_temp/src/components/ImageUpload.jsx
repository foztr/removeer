import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';

const ImageUpload = ({ onUpload }) => {
  const [uploading, setUploading] = useState(false);

  const { getRootProps, getInputProps } = useDropzone({
    accept: 'image/*',
    maxFiles: 1,
    onDrop: async (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        setUploading(true);
        const file = acceptedFiles[0];
        await handleUpload(file);
        setUploading(false);
      }
    },
  });

  const handleUpload = async (file) => {
    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch('/api/images/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      onUpload(data);
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto">
      <div
        {...getRootProps()}
        className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500"
      >
        <input {...getInputProps()} />
        {uploading ? (
          <p>Uploading...</p>
        ) : (
          <div>
            <p className="text-lg">Drag & drop an image here, or click to select</p>
            <p className="text-sm text-gray-500 mt-2">Supports JPG, PNG files</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageUpload; 