# HealthyBitesAI - Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Prerequisites
- Docker and Docker Compose installed
- OR Python 3.12+ and Node.js 18+ for local development

---

## Option 1: Docker Compose (Recommended) ⭐

```bash
# 1. Clone the repository
git clone https://github.com/your-repo/HealthyBitesAI.git
cd HealthyBitesAI

# 2. Create .env file (copy from .env.example or create manually)
# Add your IBM Watson credentials here
nano .env

# 3. Start all services
docker-compose up -d

# 4. Check status
docker-compose ps

# 5. View logs
docker-compose logs -f
```

**Access:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs

**Stop:**
```bash
docker-compose down
```

---

## Option 2: Local Development

### Backend Setup

```bash
# 1. Install Python dependencies
pip install -r requirements.txt

# 2. Create .env file with your credentials
nano .env

# 3. Run backend
python main.py
# Backend will be available at http://localhost:8000
```

### Frontend Setup

```bash
# 1. Navigate to frontend directory
cd Frontend

# 2. Install Node dependencies
npm install

# 3. Create frontend .env (optional)
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local

# 4. Run frontend
npm run dev
# Frontend will be available at http://localhost:3000
```

---

## Testing the Application

### 1. Health Check

```bash
# Backend health
curl http://localhost:8000/health

# Should return: {"status":"healthy","service":"Label Padhega India Backend"}
```

### 2. Search Products

```bash
curl "http://localhost:8000/api/v1/search?q=Nutella&limit=5"
```

### 3. Analyze Product

```bash
curl -X POST "http://localhost:8000/api/v1/analyze/product/3017620422003"
```

### 4. Run Tests

```bash
# Install test dependencies
pip install pytest pytest-asyncio httpx

# Run all tests
pytest

# Run with verbose output
pytest -v

# Run with coverage
pytest --cov=Backend
```

---

## Environment Variables (.env)

**Minimum required for testing (mock mode):**
```env
APP_NAME=Label Padhega India Backend
LOG_LEVEL=info
```

**For full functionality (with IBM Watson):**
```env
# Application
APP_NAME=Label Padhega India Backend
LOG_LEVEL=info
HOST=0.0.0.0
PORT=8000

# IBM Watson AI (for ingredient analysis)
IBM_API_KEY=your_watson_api_key
IBM_SERVICE_URL=https://us-south.ml.cloud.ibm.com
PROJECT_ID=your_watson_project_id

# IBM Watson Discovery (for OCR)
WATSON_DISCOVERY_API_KEY=your_discovery_api_key
WATSON_DISCOVERY_URL=https://api.us-south.discovery.watson.cloud.ibm.com
DISCOVERY_ENVIRONMENT_ID=your_environment_id
DISCOVERY_COLLECTION_ID=your_collection_id
```

**Note:** The application will work in mock mode without IBM credentials (for testing/development).

---

## Common Commands

### Docker Compose

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Rebuild after code changes
docker-compose up -d --build

# Remove all containers and volumes
docker-compose down -v
```

### Local Development

```bash
# Backend with auto-reload
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Frontend with hot reload
cd Frontend && npm run dev

# Build frontend for production
cd Frontend && npm run build && npm start
```

---

## API Endpoints

### Products
- `GET /api/v1/search?q={query}&limit={limit}` - Search products
- `GET /api/v1/product/{barcode}` - Get product details
- `GET /api/v1/barcode/{barcode}` - Barcode lookup

### Analysis
- `POST /api/v1/analyze` - Analyze ingredients text
- `POST /api/v1/analyze/product/{barcode}` - Analyze product by barcode
- `POST /api/v1/ocr` - OCR and analyze image

### System
- `GET /` - API information
- `GET /health` - Health check
- `GET /docs` - Interactive API documentation
- `GET /redoc` - Alternative API documentation

---

## Troubleshooting

### Backend not starting?

```bash
# Check if port 8000 is available
# Windows
netstat -ano | findstr :8000

# Linux/Mac
lsof -i :8000

# Try a different port
PORT=8001 python main.py
```

### Frontend not connecting?

1. Check backend is running: `curl http://localhost:8000/health`
2. Verify `NEXT_PUBLIC_API_URL` in Frontend/.env.local
3. Check CORS settings in main.py (should allow all origins in development)

### Tests failing?

```bash
# Make sure you're in the project root
cd /path/to/HealthyBitesAI

# Install all dependencies including test dependencies
pip install -r requirements.txt

# Run tests with full output
pytest -v -s
```

### Docker issues?

```bash
# Clean up Docker
docker-compose down -v
docker system prune -a

# Rebuild from scratch
docker-compose build --no-cache
docker-compose up
```

---

## Next Steps

1. ✅ **You're running!** - Application is up and accessible
2. 📖 **Read the docs** - Check out `DEPLOYMENT.md` for production deployment
3. 🏗️ **Architecture** - See `ARCHITECTURE_RECOMMENDATIONS.md` for scaling tips
4. 🧪 **Write tests** - Add tests in `tests/` directory
5. 🚀 **Deploy** - Follow `DEPLOYMENT.md` for cloud deployment

---

## Need Help?

- 📚 **Full Documentation**: See `REFACTORING_SUMMARY.md`
- 🏗️ **Architecture Guide**: See `ARCHITECTURE_RECOMMENDATIONS.md`
- 🚀 **Deployment Guide**: See `DEPLOYMENT.md`
- 🧪 **Testing Guide**: See `tests/README.md`
- 📖 **API Docs**: http://localhost:8000/docs (when running)

---

## Sample API Usage

### Search for Products
```bash
curl "http://localhost:8000/api/v1/search?q=Amul%20Butter&limit=5"
```

### Get Product Details
```bash
curl "http://localhost:8000/api/v1/product/8901063018761"
```

### Analyze Ingredients
```bash
curl -X POST "http://localhost:8000/api/v1/analyze" \
  -H "Content-Type: application/json" \
  -d '{
    "ingredients_text": "Sugar, Palm Oil, Wheat Flour, Preservatives",
    "product_name": "Sample Product"
  }'
```

---

**Congratulations! 🎉 You're all set up with HealthyBitesAI!**

*For detailed information, refer to the comprehensive documentation files in the project.*
