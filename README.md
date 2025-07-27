# Drone Analytics Dashboard

A full-stack AI-powered drone analytics dashboard for monitoring safety violations with real-time visualization capabilities.

## Features

### Upload Interface
- **File Upload**: Drag & drop JSON reports or browse files
- **JSON Input**: Direct JSON payload input with validation
- **Sample Data**: Load sample data for testing

### Dashboard View
- **KPI Cards**: Total violations, Drone IDs, locations, violation types
- **Charts**: Pie chart for violation distribution, time series, drone performance
- **Real-time Updates**: Refresh data with live analytics

### Map View
- **Interactive Map**: Leaflet.js integration with violation markers
- **Boundary Overlays**: GeoJSON safety zone boundaries
- **Marker Popups**: Detailed violation info with evidence images
- **Color-coded Markers**: Different colors for violation types

### Table View
- **Data Table**: Sortable, filterable violation list
- **Advanced Filtering**: By drone ID, violation type, date range
- **Search**: Real-time search across violations
- **Pagination**: Efficient data browsing

### Advanced Filtering
- Filter by Drone ID, Date Range, Violation Type, Location
- Search functionality across all violations
- Real-time filter application

## Tech Stack

**Frontend:**
- React.js with modern hooks
- Tailwind CSS for styling
- Chart.js for data visualization
- Leaflet.js for interactive maps
- Axios for API communication
- React Hot Toast for notifications

**Backend:**
- Node.js with Express.js
- Joi for data validation
- Multer for file uploads
- In-memory data storage (demo)
- RESTful API architecture

**DevOps:**
- Docker & Docker Compose
- Multi-stage builds
- Hot reload for development

## Sample Data Format

```json
{
  "drone_id": "DRONE_ZONE_1",
  "date": "2025-07-10",
  "location": "Zone A",
  "violations": [
    {
      "id": "v1",
      "type": "Fire Detected",
      "timestamp": "10:32:14",
      "latitude": 23.74891,
      "longitude": 85.98523,
      "image_url": "https://picsum.photos/150"
    }
  ]
}
```

## Quick Start

### Prerequisites
- Docker & Docker Compose
- Node.js 18+ (for local development)
- Git

### Using Docker (Recommended)

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd drone-analytics-dashboard
   ```

2. **Start the application**
   ```bash
   docker-compose up --build
   ```

3. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - Health Check: http://localhost:5000/api/health

### Local Development

**Backend Setup:**
```bash
cd backend
npm install
npm start
```

**Frontend Setup:**
```bash
cd frontend
npm install
npm start
```

## API Endpoints

### Upload API
- `POST /api/upload/report` - Upload JSON file
- `POST /api/upload/json` - Upload JSON payload
- `GET /api/upload/status` - Get upload statistics

### Violations API
- `GET /api/violations` - List violations with filters
- `GET /api/violations/filters` - Get filter options
- `GET /api/violations/map` - Get map data
- `GET /api/violations/search/:term` - Search violations

### Analytics API
- `GET /api/analytics/kpis` - Get KPI metrics
- `GET /api/analytics/charts/pie` - Pie chart data
- `GET /api/analytics/charts/timeseries` - Time series data
- `GET /api/analytics/summary` - Dashboard summary

### Boundaries API
- `GET /api/boundaries` - Get GeoJSON boundaries
- `GET /api/boundaries/kml` - Get KML boundaries

## UI/UX Features

- **Responsive Design**: Works on desktop, tablet, and mobile
- **Modern Interface**: Clean, professional design with Tailwind CSS
- **Interactive Elements**: Hover effects, smooth transitions
- **Loading States**: Spinner animations during data fetching
- **Error Handling**: Toast notifications for user feedback
- **Accessibility**: Keyboard navigation and screen reader support

## Supported Violation Types

- Fire Detected
- Unauthorized Person
- No PPE Kit
- Equipment Malfunction
- Hazardous Material Spill
- Unauthorized Vehicle
- Structural Damage

## Configuration

### Environment Variables

**Backend (.env):**
```env
PORT=5000
NODE_ENV=development
UPLOAD_MAX_SIZE=10485760
```

**Frontend:**
```env
REACT_APP_API_URL=http://localhost:5000
```

## Project Structure

```
drone-analytics-dashboard/
├── backend/
│   ├── models/          # Data models and validation
│   ├── routes/          # API endpoints
│   ├── utils/           # Utilities and sample data
│   ├── data/            # Static data files
│   └── server.js        # Main server file
├── frontend/
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── pages/       # Page components
│   │   └── services/    # API services
│   └── public/          # Static assets
├── docker-compose.yml   # Docker orchestration
└── README.md           # Project documentation
```

## Testing

### Manual Testing
1. **Upload Test**: Upload sample.json file
2. **Dashboard Test**: Check KPIs and charts load correctly
3. **Map Test**: Verify markers display with boundaries
4. **Table Test**: Test filtering and sorting
5. **Search Test**: Search for specific violations

### API Testing
```bash
# Health check
curl http://localhost:5000/api/health

# Upload sample data
curl -X POST http://localhost:5000/api/upload/json \
  -H "Content-Type: application/json" \
  -d @sample.json

# Get violations
curl http://localhost:5000/api/violations
```

## Deployment

### Production Deployment
1. **Build for production**
   ```bash
   docker-compose -f docker-compose.prod.yml up --build
   ```

2. **Environment Configuration**
   - Update API URLs
   - Configure CORS settings
   - Set production database

### Docker Commands
```bash
# Build and start
docker-compose up --build

# Start in background
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Demo Video

[Link to demo video showing:]
- Upload process demonstration
- Dashboard navigation and features
- Map interaction with violation markers
- Table filtering and sorting
- Real-time data updates
