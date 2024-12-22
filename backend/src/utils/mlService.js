const axios = require('axios');
const FormData = require('form-data');
const { uploadToStorage } = require('./storage');

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://127.0.0.1:5001';

async function sendToMLService(imageBuffer) {
  try {
    console.log('=== ML Service Request ===');
    console.log('Creating form data...');
    const formData = new FormData();
    formData.append('image', imageBuffer, {
      filename: 'image.jpg',
      contentType: 'image/jpeg',
    });

    console.log(`Sending request to ${ML_SERVICE_URL}/process`);
    const response = await axios.post(`${ML_SERVICE_URL}/process`, formData, {
      headers: {
        ...formData.getHeaders(),
      },
      responseType: 'arraybuffer',
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
      timeout: 120000 // Increased to 120 seconds
    });
    
    console.log('ML Response status:', response.status);
    console.log('ML Response headers:', response.headers);

    if (!response.data) {
      throw new Error('No data received from ML service');
    }

    console.log('Processing response data...');
    const processedImageUrl = await uploadToStorage(response.data);
    console.log('Image stored successfully at:', processedImageUrl);

    return { url: processedImageUrl };
  } catch (error) {
    console.error('=== ML Service Error ===');
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response headers:', error.response.headers);
      console.error('Response data:', error.response.data.toString());
    } else if (error.request) {
      console.error('No response received');
      console.error('Request details:', error.request);
    } else {
      console.error('Error details:', error.message);
    }
    throw new Error(`ML Service error: ${error.message}`);
  }
}

module.exports = { sendToMLService }; 