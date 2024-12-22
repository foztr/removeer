const express = require('express');
const cors = require('cors');
const imagesRouter = require('./routes/images');

const app = express();
const PORT = process.env.PORT || 5000;

// Add CORS configuration
app.use(cors({
  origin: 'http://localhost:5173', // Vite's default port
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}));

app.use(express.json());

// Temporary storage for processed images
app.use('/uploads', express.static('uploads'));

app.use('/api/images', imagesRouter);

app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
}); 