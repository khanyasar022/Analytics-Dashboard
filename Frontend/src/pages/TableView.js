import React, { useState, useEffect } from 'react';
import { Search, Filter, ArrowUpDown, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import { violationsAPI } from '../services/api';
import toast from 'react-hot-toast';

const TableView = () => {
  const [violations, setViolations] = useState([]);
  const [pagination, setPagination] = useState({});
  const [filters, setFilters] = useState({
    drone_id: '',
    violation_type: '',
    date_from: '',
    date_to: '',
    page: 1,
    limit: 10,
    sort_by: 'date',
    sort_order: 'desc'
  });
  const [filterOptions, setFilterOptions] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedViolation, setSelectedViolation] = useState(null);

  useEffect(() => {
    fetchViolations();
    fetchFilterOptions();
  }, [filters]);

  const fetchViolations = async () => {
    try {
      setLoading(true);
      const response = searchTerm 
        ? await violationsAPI.searchViolations(searchTerm, filters)
        : await violationsAPI.getViolations(filters);
      
      setViolations(response.data.data);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Error fetching violations:', error);
      toast.error('Failed to load violations');
    } finally {
      setLoading(false);
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
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const handleSort = (field) => {
    setFilters(prev => ({
      ...prev,
      sort_by: field,
      sort_order: prev.sort_by === field && prev.sort_order === 'asc' ? 'desc' : 'asc',
      page: 1
    }));
  };

  const handleSearch = (e) => {
    if (e.key === 'Enter') {
      setFilters(prev => ({ ...prev, page: 1 }));
      fetchViolations();
    }
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  const clearFilters = () => {
    setFilters({
      drone_id: '',
      violation_type: '',
      date_from: '',
      date_to: '',
      page: 1,
      limit: 10,
      sort_by: 'date',
      sort_order: 'desc'
    });
    setSearchTerm('');
  };

  const getViolationTypeColor = (type) => {
    const colors = {
      'Fire Detected': 'bg-red-100 text-red-800',
      'Unauthorized Person': 'bg-yellow-100 text-yellow-800',
      'No PPE Kit': 'bg-blue-100 text-blue-800',
      'Equipment Malfunction': 'bg-gray-100 text-gray-800',
      'Hazardous Material Spill': 'bg-orange-100 text-orange-800',
      'Unauthorized Vehicle': 'bg-purple-100 text-purple-800',
      'Structural Damage': 'bg-pink-100 text-pink-800',
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const SortButton = ({ field, children }) => (
    <button
      onClick={() => handleSort(field)}
      className="flex items-center space-x-1 hover:text-blue-600 transition-colors"
    >
      <span>{children}</span>
      <ArrowUpDown className="h-3 w-3" />
    </button>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Violations Table</h1>
          <p className="text-gray-600 mt-1">
            {pagination.total_items || 0} total violations found
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-6">
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search violations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={handleSearch}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <select
              value={filters.drone_id}
              onChange={(e) => handleFilterChange('drone_id', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Drones</option>
              {filterOptions.drone_ids?.map(id => (
                <option key={id} value={id}>{id}</option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={filters.violation_type}
              onChange={(e) => handleFilterChange('violation_type', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Types</option>
              {filterOptions.violation_types?.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div>
            <input
              type="date"
              value={filters.date_from}
              onChange={(e) => handleFilterChange('date_from', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="flex space-x-2">
            <input
              type="date"
              value={filters.date_to}
              onChange={(e) => handleFilterChange('date_to', e.target.value)}
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              onClick={clearFilters}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors whitespace-nowrap"
            >
              Clear
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <span className="ml-2 text-gray-600">Loading violations...</span>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <SortButton field="drone_id">Drone ID</SortButton>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <SortButton field="type">Violation Type</SortButton>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Location
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <SortButton field="date">Date & Time</SortButton>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Coordinates
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {violations.map((violation) => (
                    <tr key={violation.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {violation.drone_id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getViolationTypeColor(violation.type)}`}>
                          {violation.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {violation.location}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>
                          <div className="font-medium">{violation.date}</div>
                          <div className="text-gray-500">{violation.timestamp}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="font-mono text-xs">
                          <div>{violation.latitude.toFixed(6)}</div>
                          <div>{violation.longitude.toFixed(6)}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => setSelectedViolation(violation)}
                          className="text-blue-600 hover:text-blue-900 transition-colors flex items-center space-x-1"
                        >
                          <Eye className="h-4 w-4" />
                          <span>View</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {violations.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">No violations found matching your criteria.</p>
              </div>
            )}

            {pagination.total_pages > 1 && (
              <div className="mt-6 flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing {((pagination.current_page - 1) * pagination.per_page) + 1} to{' '}
                  {Math.min(pagination.current_page * pagination.per_page, pagination.total_items)} of{' '}
                  {pagination.total_items} results
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handlePageChange(pagination.current_page - 1)}
                    disabled={pagination.current_page <= 1}
                    className="p-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  
                  <span className="px-4 py-2 text-sm text-gray-700">
                    Page {pagination.current_page} of {pagination.total_pages}
                  </span>
                  
                  <button
                    onClick={() => handlePageChange(pagination.current_page + 1)}
                    disabled={pagination.current_page >= pagination.total_pages}
                    className="p-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {selectedViolation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-96 overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Violation Details</h3>
                <button
                  onClick={() => setSelectedViolation(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">ID</label>
                  <p className="text-sm text-gray-900">{selectedViolation.id}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Type</label>
                  <p className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getViolationTypeColor(selectedViolation.type)}`}>
                    {selectedViolation.type}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Drone ID</label>
                  <p className="text-sm text-gray-900">{selectedViolation.drone_id}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Location</label>
                  <p className="text-sm text-gray-900">{selectedViolation.location}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Date</label>
                  <p className="text-sm text-gray-900">{selectedViolation.date}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Time</label>
                  <p className="text-sm text-gray-900">{selectedViolation.timestamp}</p>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Coordinates</label>
                  <p className="text-sm text-gray-900 font-mono">
                    {selectedViolation.latitude.toFixed(6)}, {selectedViolation.longitude.toFixed(6)}
                  </p>
                </div>
              </div>
              
              {selectedViolation.image_url && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Evidence Image</label>
                  <img
                    src={selectedViolation.image_url}
                    alt={selectedViolation.type}
                    className="w-full h-48 object-cover rounded"
                    onError={(e) => {
                      e.target.src = 'https://picsum.photos/300/200';
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TableView; 