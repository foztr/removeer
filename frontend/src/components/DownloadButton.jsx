import React from 'react';

const DownloadButton = ({ imageUrl, fileName }) => {
  const handleDownload = async () => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName || 'processed-image.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  return (
    <button
      onClick={handleDownload}
      className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded"
      disabled={!imageUrl}
    >
      Download Image
    </button>
  );
};

export default DownloadButton; 