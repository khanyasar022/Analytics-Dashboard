import React, { useState, useEffect, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, GeoJSON } from 'react-leaflet';
import { Filter, RefreshCw } from 'lucide-react';
import { violationsAPI, boundariesAPI } from '../services/api';
import toast from 'react-hot-toast';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

const violationTypeColors = {
  'Fire Detected': '#FF6B6B',
  'Unauthorized Person': '#4ECDC4', 
  'No PPE Kit': '#45B7D1',
  'Equipment Malfunction': '#96CEB4',
  'Hazardous Material Spill': '#F7DC6F',
  'Unauthorized Vehicle': '#BB8FCE',
  'Structural Damage': '#EC7063',
};

const createCustomIcon = (color) => {
  return new L.Icon({
    iconUrl: `data:image/svg+xml;base64,${btoa(`
      <svg width="25" height="41" viewBox="0 0 25 41" xmlns="http://www.w3.org/2000/svg">
        <path d="M12.5 0C5.6 0 0 5.6 0 12.5c0 6.9 12.5 28.5 12.5 28.5S25 19.4 25 12.5C25 5.6 19.4 0 12.5 0z" fill="${color}" stroke="#fff" stroke-width="2"/>
        <circle cx="12.5" cy="12.5" r="6" fill="#fff"/>
      </svg>
    `)}`,
    iconSize: [25, 41],
    iconAnchor: [12.5, 41],
    popupAnchor: [0, -35],
  });
};

const MapView = () => {
  const [violations, setViolations] = useState([]);
  const [boundaries, setBoundaries] = useState(null);
  const [filters, setFilters] = useState({
    drone_id: '',
    violation_type: '',
    date_from: '',
    date_to: '',
  });
  const [filterOptions, setFilterOptions] = useState({});
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchMapData();
    fetchBoundaries();
    fetchFilterOptions();
  }, []);

  useEffect(() => {
    fetchMapData();
  }, [filters]);

  const fetchMapData = async () => {
    try {
      setLoading(true);
      const response = await violationsAPI.getMapData(filters);
      setViolations(response.data.markers);
    } catch (error) {
      console.error('Error fetching map data:', error);
      toast.error('Failed to load map data');
    } finally {
      setLoading(false);
    }
  };

  const fetchBoundaries = async () => {
    try {
      const response = await boundariesAPI.getBoundaries();
      setBoundaries(response.data.data);
    } catch (error) {
      console.error('Error fetching boundaries:', error);
      toast.error('Failed to load boundary data');
    }
  };

  const fetchFilterOptions = async () => {
    try {
      const response = await violationsAPI.getFilters();
      setFilterOptions(response.data.filters);
    } catch (error) {
      console.error('Error fetching filter options:', error);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      drone_id: '',
      violation_type: '',
      date_from: '',
      date_to: '',
    });
  };

  const boundaryStyle = {
    color: '#3B82F6',
    weight: 2,
    fillColor: '#3B82F6',
    fillOpacity: 0.1,
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Map View</h1>
          <p className="text-gray-600 mt-1">
            {violations.length} violations displayed on map
          </p>
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <Filter className="h-4 w-4" />
            <span>Filters</span>
          </button>
          <button
            onClick={fetchMapData}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Drone ID
              </label>
              <select
                value={filters.drone_id}
                onChange={(e) => handleFilterChange('drone_id', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Drones</option>
                {filterOptions.drone_ids?.map(id => (
                  <option key={id} value={id}>{id}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Violation Type
              </label>
              <select
                value={filters.violation_type}
                onChange={(e) => handleFilterChange('violation_type', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Types</option>
                {filterOptions.violation_types?.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                From Date
              </label>
              <input
                type="date"
                value={filters.date_from}
                onChange={(e) => handleFilterChange('date_from', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                To Date
              </label>
              <input
                type="date"
                value={filters.date_to}
                onChange={(e) => handleFilterChange('date_to', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="mt-4 flex justify-end">
            <button
              onClick={clearFilters}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md overflow-hidden" style={{ height: '600px' }}>
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <span className="ml-2 text-gray-600">Loading map data...</span>
          </div>
        ) : (
          <MapContainer
            center={[23.7489, 85.9852]}
            zoom={13}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            {boundaries && (
              <GeoJSON
                data={boundaries}
                style={boundaryStyle}
                onEachFeature={(feature, layer) => {
                  if (feature.properties && feature.properties.name) {
                    layer.bindPopup(`
                      <div>
                        <strong>${feature.properties.name}</strong><br/>
                        Type: ${feature.properties.type}<br/>
                        Security Level: ${feature.properties.security_level}
                      </div>
                    `);
                  }
                }}
              />
            )}

            {violations.map((violation) => (
              <Marker
                key={violation.id}
                position={[violation.latitude, violation.longitude]}
                icon={createCustomIcon(violationTypeColors[violation.type] || '#666')}
              >
                <Popup>
                  <div className="min-w-64">
                    <div className="flex items-center space-x-2 mb-2">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: violationTypeColors[violation.type] || '#666' }}
                      ></div>
                      <strong className="text-lg">{violation.type}</strong>
                    </div>
                    
                    <div className="space-y-1 text-sm text-gray-600">
                      <p><strong>Drone:</strong> {violation.drone_id}</p>
                      <p><strong>Location:</strong> {violation.location}</p>
                      <p><strong>Date:</strong> {violation.date}</p>
                      <p><strong>Time:</strong> {violation.timestamp}</p>
                      <p><strong>Coordinates:</strong> {violation.latitude.toFixed(6)}, {violation.longitude.toFixed(6)}</p>
                    </div>

                    {violation.image_url && (
                      <div className="mt-3">
                        <img
                          src={violation.image_url}
                          alt={violation.type}
                          className="w-full h-32 object-cover rounded"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-md p-4">
        <h3 className="text-lg font-medium text-gray-900 mb-3">Legend</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {Object.entries(violationTypeColors).map(([type, color]) => (
            <div key={type} className="flex items-center space-x-2">
              <div 
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: color }}
              ></div>
              <span className="text-sm text-gray-700">{type}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MapView; 