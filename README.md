# Removeer - AI Background Removal Tool

An AI-powered web application that automatically removes backgrounds from images.

## Project Structure

```
removeer/
├── frontend/     # React frontend
├── backend/      # Node.js backend API
└── ml-service/   # Python ML service
```

## Services

### Frontend (React + Vite)
- Modern UI built with React and TailwindCSS
- Real-time image preview
- Background customization options
- Responsive design

### Backend (Node.js)
- RESTful API for image processing
- File handling and storage
- Communication with ML service

### ML Service (Python)
- AI-powered background removal
- Image processing optimization
- Fast response times

## Development Setup

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Backend
```bash
cd backend
npm install
npm run dev
```

### ML Service
```bash
cd ml-service
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python api.py
```

## Environment Variables

Create `.env` files in the respective service directories:

### Frontend (.env)
```
VITE_API_URL=http://localhost:5000
```

### Backend (.env)
```
PORT=5000
ML_SERVICE_URL=http://localhost:5001
```

### ML Service (.env)
```
PORT=5001
```

## Deployment

The application is deployed on Render.com with the following services:
- Frontend: Static Site
- Backend: Web Service
- ML Service: Web Service

## License

MIT License 