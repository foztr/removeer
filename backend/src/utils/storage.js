const fs = require('fs');
const path = require('path');

const uploadDir = path.join(__dirname, '../../uploads');

// Create uploads directory if it doesn't exist
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

async function uploadToStorage(imageBuffer) {
  try {
    const fileName = `processed-${Date.now()}.png`;
    const filePath = path.join(uploadDir, fileName);
    
    await fs.promises.writeFile(filePath, imageBuffer);
    console.log('File saved to:', filePath);
    
    // Return local URL
    return `http://localhost:5000/uploads/${fileName}`;
  } catch (error) {
    console.error('Storage error:', error);
    throw new Error('Failed to save processed image');
  }
}

module.exports = { uploadToStorage }; 