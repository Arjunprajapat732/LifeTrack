import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, TrendingUp, TrendingDown, Activity, Heart, Scale, Moon, Clock } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const HealthHistory = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [healthHistory, setHealthHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedPeriod, setSelectedPeriod] = useState('7d'); // 7d, 30d, 90d, all
  const [selectedMetric, setSelectedMetric] = useState('all'); // all, heart_rate, steps, bmi, sleep

  // Fetch health data history
  useEffect(() => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }

    const fetchHealthHistory = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`/api/health-data/history/${user.id}?limit=20&page=${currentPage}`);
        
        if (response.data.success) {
          setHealthHistory(response.data.data.healthDataHistory);
          setTotalPages(response.data.data.pagination.totalPages);
        }
      } catch (error) {
        console.error('Error fetching health history:', error);
        toast.error('Failed to load health history');
      } finally {
        setIsLoading(false);
      }
    };

    fetchHealthHistory();
  }, [user?.id, currentPage]);

  // Filter data based on selected period
  const getFilteredData = () => {
    if (!healthHistory.length) return [];
    
    const now = new Date();
    const filterDate = new Date();
    
    switch (selectedPeriod) {
      case '7d':
        filterDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        filterDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        filterDate.setDate(now.getDate() - 90);
        break;
      case 'all':
        return healthHistory;
      default:
        return healthHistory;
    }
    
    return healthHistory.filter(record => new Date(record.timestamp) >= filterDate);
  };

  // Get trend indicator
  const getTrendIndicator = (current, previous) => {
    if (!current || !previous) return 'neutral';
    return current > previous ? 'up' : current < previous ? 'down' : 'neutral';
  };

  // Calculate average for a metric
  const calculateAverage = (data, metric) => {
    const values = data.map(record => {
      switch (metric) {
        case 'heart_rate':
          return record.vitals?.heart_rate_bpm;
        case 'steps':
          return record.activity?.steps;
        case 'bmi':
          return record.body_measurements?.body_mass_index;
        case 'sleep':
          return record.sleep?.sleep_duration_minutes;
        default:
          return null;
      }
    }).filter(val => val !== null && val !== undefined);
    
    if (values.length === 0) return 0;
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get metric display value
  const getMetricValue = (record, metric) => {
    switch (metric) {
      case 'heart_rate':
        return `${record.vitals?.heart_rate_bpm || 'N/A'} bpm`;
      case 'steps':
        return `${record.activity?.steps?.toLocaleString() || 'N/A'}`;
      case 'bmi':
        return record.body_measurements?.body_mass_index || 'N/A';
      case 'sleep':
        const hours = Math.floor((record.sleep?.sleep_duration_minutes || 0) / 60);
        const minutes = (record.sleep?.sleep_duration_minutes || 0) % 60;
        return `${hours}h ${minutes}m`;
      default:
        return 'N/A';
    }
  };

  const filteredData = getFilteredData();
  const recentData = filteredData.slice(0, 2);
  const olderData = filteredData.slice(2);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-bg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading health history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/patient/dashboard')}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Health History</h1>
                <p className="text-gray-600">Track your health data over time</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">Period:</label>
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="all">All time</option>
              </select>
            </div>
            
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">Metric:</label>
              <select
                value={selectedMetric}
                onChange={(e) => setSelectedMetric(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">All metrics</option>
                <option value="heart_rate">Heart Rate</option>
                <option value="steps">Steps</option>
                <option value="bmi">BMI</option>
                <option value="sleep">Sleep</option>
              </select>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        {filteredData.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="card">
              <div className="flex items-center">
                <div className="p-3 bg-red-100 rounded-lg">
                  <Heart className="w-6 h-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Avg Heart Rate</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {calculateAverage(filteredData, 'heart_rate').toFixed(0)} bpm
                  </p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center">
                <div className="p-3 bg-green-100 rounded-lg">
                  <Activity className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Avg Steps</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {calculateAverage(filteredData, 'steps').toFixed(0)}
                  </p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Scale className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Avg BMI</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {calculateAverage(filteredData, 'bmi').toFixed(1)}
                  </p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Moon className="w-6 h-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Avg Sleep</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {Math.floor(calculateAverage(filteredData, 'sleep') / 60)}h
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Health History List */}
        <div className="space-y-6">
          {filteredData.length === 0 ? (
            <div className="card">
              <div className="text-center py-12">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No health data found</h3>
                <p className="text-gray-600 mb-4">
                  {selectedPeriod === 'all' 
                    ? 'No health data has been recorded yet.' 
                    : `No health data found for the selected period.`}
                </p>
                <button
                  onClick={() => navigate('/patient/dashboard')}
                  className="btn-primary"
                >
                  Update Health Data
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Recent Records */}
              {recentData.map((record, index) => (
                <div key={record._id} className="card">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <Calendar className="w-5 h-5 text-gray-500" />
                      <h3 className="text-lg font-semibold text-gray-900">
                        {formatDate(record.timestamp)}
                      </h3>
                      {index === 0 && (
                        <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                          Latest
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Heart Rate */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">Heart Rate</span>
                        <Heart className="w-4 h-4 text-red-500" />
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl font-bold text-gray-900">
                          {record.vitals?.heart_rate_bpm || 'N/A'}
                        </span>
                        <span className="text-sm text-gray-500">bpm</span>
                      </div>
                      <div className="text-sm text-gray-600">
                        Resting: {record.vitals?.resting_heart_rate_bpm || 'N/A'} bpm
                      </div>
                    </div>

                    {/* Activity */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">Activity</span>
                        <Activity className="w-4 h-4 text-green-500" />
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl font-bold text-gray-900">
                          {record.activity?.steps?.toLocaleString() || 'N/A'}
                        </span>
                        <span className="text-sm text-gray-500">steps</span>
                      </div>
                      <div className="text-sm text-gray-600">
                        {record.activity?.distance_walked_km || 'N/A'} km • {record.activity?.exercise_minutes || 'N/A'} min
                      </div>
                    </div>

                    {/* Body Measurements */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">Body</span>
                        <Scale className="w-4 h-4 text-blue-500" />
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl font-bold text-gray-900">
                          {record.body_measurements?.body_mass_index || 'N/A'}
                        </span>
                        <span className="text-sm text-gray-500">BMI</span>
                      </div>
                      <div className="text-sm text-gray-600">
                        {record.body_measurements?.weight_kg || 'N/A'} kg • {record.body_measurements?.height_cm || 'N/A'} cm
                      </div>
                    </div>

                    {/* Sleep */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">Sleep</span>
                        <Moon className="w-4 h-4 text-purple-500" />
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl font-bold text-gray-900">
                          {Math.floor((record.sleep?.sleep_duration_minutes || 0) / 60)}
                        </span>
                        <span className="text-sm text-gray-500">h {(record.sleep?.sleep_duration_minutes || 0) % 60}m</span>
                      </div>
                      <div className="text-sm text-gray-600">
                        Deep: {record.sleep?.sleep_stages?.deep_sleep_minutes || 'N/A'} min
                      </div>
                    </div>
                  </div>

                  {/* Additional Details */}
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-700">Blood Pressure:</span>
                        <span className="ml-2 text-gray-600">
                          {record.blood_pressure?.systolic_mmHg || 'N/A'}/{record.blood_pressure?.diastolic_mmHg || 'N/A'} mmHg
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Temperature:</span>
                        <span className="ml-2 text-gray-600">
                          {record.vitals?.body_temperature_celsius || 'N/A'}°C
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Oxygen:</span>
                        <span className="ml-2 text-gray-600">
                          {record.vitals?.oxygen_saturation_percentage || 'N/A'}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Older Records */}
              {olderData.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Previous Records</h3>
                  {olderData.map((record) => (
                    <div key={record._id} className="card">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-sm font-medium text-gray-900">
                            {formatDate(record.timestamp)}
                          </span>
                        </div>
                        <div className="flex items-center space-x-6 text-sm">
                          <div className="flex items-center space-x-2">
                            <Heart className="w-4 h-4 text-red-400" />
                            <span>{record.vitals?.heart_rate_bpm || 'N/A'} bpm</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Activity className="w-4 h-4 text-green-400" />
                            <span>{record.activity?.steps?.toLocaleString() || 'N/A'} steps</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Scale className="w-4 h-4 text-blue-400" />
                            <span>{record.body_measurements?.body_mass_index || 'N/A'} BMI</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Moon className="w-4 h-4 text-purple-400" />
                            <span>{Math.floor((record.sleep?.sleep_duration_minutes || 0) / 60)}h</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 flex justify-center">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Previous
              </button>
              
              <span className="px-3 py-2 text-sm text-gray-700">
                Page {currentPage} of {totalPages}
              </span>
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-2 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HealthHistory;
