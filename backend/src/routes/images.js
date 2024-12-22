const express = require('express');
const multer = require('multer');
const router = express.Router();
const { sendToMLService } = require('../utils/mlService');
const { uploadToStorage } = require('../utils/storage');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post('/upload', upload.single('image'), async (req, res) => {
  try {
    console.log('=== Upload Request Received ===');
    
    if (!req.file) {
      console.log('No file received');
      return res.status(400).json({ error: 'No image file provided' });
    }

    console.log('File info:', {
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
      buffer: req.file.buffer ? 'Buffer present' : 'No buffer'
    });

    try {
      console.log('Sending to ML service...');
      const processedImage = await sendToMLService(req.file.buffer);
      console.log('ML service response:', processedImage);

      res.json({
        status: 'completed',
        processedUrl: processedImage.url
      });
    } catch (mlError) {
      console.error('ML Service error:', mlError);
      throw mlError;
    }
  } catch (error) {
    console.error('=== Upload Error ===');
    console.error('Error type:', error.constructor.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      error: 'Upload failed', 
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

module.exports = router; 