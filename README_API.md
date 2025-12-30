# NeuroPath AI - FastAPI Backend

## Quick Start

### 1. Install dependencies
```bash
pip install -r requirements.txt
```

### 2. Run the FastAPI server
```bash
python src/app.py
```

The API will be available at:
- **API**: http://localhost:8000
- **Interactive API Docs**: http://localhost:8000/docs
- **Alternative Docs**: http://localhost:8000/redoc

### 3. Open the web interface
Open `src/ui/index.html` in your browser, or serve it with:
```bash
python -m http.server 3000 --directory src/ui
```

Then visit: http://localhost:3000

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login or create patient account

### Patient Management
- `GET /api/patient/{patient_id}` - Get patient data
- `POST /api/patient/{patient_id}/session` - Add exercise session
- `GET /api/patient/{patient_id}/stats` - Get statistics
- `GET /api/patient/{patient_id}/progress` - Get progress data
- `GET /api/patient/{patient_id}/predictions` - Get AI predictions
- `DELETE /api/patient/{patient_id}` - Delete patient data
- `GET /api/patient/{patient_id}/export` - Export data as JSON

## Architecture

### Backend (FastAPI)
- **Fast**: High performance async API
- **Simple**: Pure Python, no complex frontend build
- **RESTful**: Clean API design
- **Interactive Docs**: Auto-generated Swagger UI

### Frontend (Vanilla JS + TailwindCSS)
- **Zero Build**: No npm/webpack needed
- **Simple**: Pure HTML/JS
- **Responsive**: TailwindCSS styling
- **Charts**: Chart.js for visualizations

## Testing the API

### Using curl:
```bash
# Health check
curl http://localhost:8000/health

# Login
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"patient_id":"PATIENT001","name":"John Doe"}'

# Get patient stats
curl http://localhost:8000/api/patient/PATIENT001/stats
```

### Using Python:
```python
import requests

# Login
response = requests.post('http://localhost:8000/api/auth/login', 
    json={'patient_id': 'PATIENT001', 'name': 'John Doe'})
print(response.json())

# Get stats
stats = requests.get('http://localhost:8000/api/patient/PATIENT001/stats')
print(stats.json())
```

## Advantages over Streamlit

1. **Better Performance**: FastAPI is async and much faster
2. **Separation of Concerns**: Backend API separate from frontend
3. **Mobile Ready**: Can build native mobile apps using the API
4. **Scalable**: Can deploy backend/frontend separately
5. **Modern**: RESTful API is industry standard
6. **No Session Issues**: No ScriptRunContext warnings
7. **Easy Integration**: Any frontend framework can use the API

## Next Steps

1. Add WebSocket support for real-time exercise tracking
2. Integrate MediaPipe exercise tracking
3. Add user authentication (JWT tokens)
4. Build React/Vue frontend for richer UI
5. Deploy to cloud (AWS, Azure, GCP)
