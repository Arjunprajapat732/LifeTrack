import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Heart, Calendar, Pill, Activity, Bell, Clock, TrendingUp, FileText, Upload, Download, Eye } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const PatientDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [patientStatus, setPatientStatus] = useState(null);
  const [reports, setReports] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isStatusLoading, setIsStatusLoading] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    title: '',
    description: '',
    reportType: 'other',
    tags: ''
  });
  const [selectedFile, setSelectedFile] = useState(null);

  // Fetch patient status every 15 seconds
  useEffect(() => {
    // Only start fetching if user.id exists
    if (!user?.id) {
      console.log('User ID not available, skipping status fetch');
      return;
    }

    console.log('🔄 Starting status fetch for user:', user.id, 'at:', new Date().toISOString());

    let isMounted = true;
    let intervalId = null;

    const fetchStatus = async () => {
      if (!isMounted) return false;
      
      try {
        const response = await axios.get(`/api/patient-status/latest/${user.id}`);
        if (isMounted) {
          setPatientStatus(response.data.data.status);
          console.log('✅ Status fetched successfully at:', new Date().toISOString());
        }
      } catch (error) {
        console.error('Error fetching status:', error);
        // Stop the interval if we get a 429 error (too many requests)
        if (error.response?.status === 429) {
          console.log('Rate limit reached, stopping status updates');
          if (isMounted) {
            toast.error('Rate limit reached. Status updates paused.');
          }
          return true; // Signal to stop the interval
        }
      }
      return false; // Continue the interval
    };

    // Initial fetch
    fetchStatus();

    // Set up interval for every 15 seconds
    intervalId = setInterval(async () => {
      const shouldStop = await fetchStatus();
      if (shouldStop && isMounted) {
        clearInterval(intervalId);
      }
    }, 15000);

    return () => {
      console.log('🧹 Cleaning up status fetch interval for user:', user.id);
      isMounted = false;
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [user?.id]);

  // Fetch patient reports
  useEffect(() => {
    if (!user?.id) {
      // If no user ID, still set loading to false to show the dashboard
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    const fetchReports = async () => {
      console.log('📄 Fetching reports for user:', user.id);
      try {
        const response = await axios.get('/api/reports/my-reports');
        if (isMounted) {
          setReports(response.data.data.reports);
          console.log('✅ Reports fetched successfully');
        }
      } catch (error) {
        console.error('❌ Error fetching reports:', error);
        // Even if reports fetch fails, we should still show the dashboard
        if (isMounted) {
          setReports([]);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    // Add a timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      if (isMounted && isLoading) {
        console.log('⏰ Loading timeout reached, showing dashboard');
        setIsLoading(false);
        setReports([]);
      }
    }, 10000); // 10 second timeout

    fetchReports();

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [user?.id, isLoading]);

  // Update patient status (demo API)
  const updateStatus = async () => {
    if (!user?.id) {
      toast.error('User ID not available');
      return;
    }
    
    if (isStatusLoading) {
      toast.error('Status update already in progress');
      return;
    }
    
    setIsStatusLoading(true);
    try {
      await axios.put(`/api/patient-status/update/${user.id}`);
      toast.success('Status updated successfully');
      
      // Refresh the status after update
      const response = await axios.get(`/api/patient-status/latest/${user.id}`);
      setPatientStatus(response.data.data.status);
    } catch (error) {
      console.error('Error updating status:', error);
      if (error.response?.status === 429) {
        toast.error('Rate limit reached. Please wait before trying again.');
      } else {
        toast.error('Failed to update status');
      }
    } finally {
      setIsStatusLoading(false);
    }
  };

  // Handle file selection
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  // Handle report upload
  const handleUploadReport = async (e) => {
    e.preventDefault();
    
    if (!selectedFile) {
      toast.error('Please select a file');
      return;
    }

    setIsUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('title', uploadForm.title);
      formData.append('description', uploadForm.description);
      formData.append('reportType', uploadForm.reportType);
      formData.append('tags', uploadForm.tags);

      const response = await axios.post('/api/reports/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      toast.success('Report uploaded successfully');
      setShowUploadModal(false);
      setUploadForm({ title: '', description: '', reportType: 'other', tags: '' });
      setSelectedFile(null);
      
      // Refresh reports list
      const reportsResponse = await axios.get('/api/reports/my-reports');
      setReports(reportsResponse.data.data.reports);
    } catch (error) {
      console.error('Error uploading report:', error);
      toast.error('Failed to upload report');
    } finally {
      setIsUploading(false);
    }
  };

  // Show loading state while user data is being loaded
  if (isLoading && user) {
    return (
      <div className="min-h-screen bg-gradient-bg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Show error state if no user data
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-bg flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-600 text-2xl">⚠️</span>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Authentication Required</h2>
          <p className="text-gray-600 mb-4">Please log in to access your dashboard.</p>
          <button 
            onClick={() => window.location.href = '/login'} 
            className="btn-primary"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.firstName}!
          </h1>
          <p className="text-gray-600">
            Stay on top of your health journey and care plan.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card">
            <div className="flex items-center">
              <div className="p-3 bg-primary-100 rounded-lg">
                <Heart className="w-6 h-6 text-primary-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Health Score</p>
                <p className="text-2xl font-bold text-gray-900">
                  {patientStatus?.healthScore || 85}%
                </p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="p-3 bg-healthcare-100 rounded-lg">
                <Calendar className="w-6 h-6 text-healthcare-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Next Appointment</p>
                <p className="text-2xl font-bold text-gray-900">Tomorrow</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="p-3 bg-secondary-100 rounded-lg">
                <Pill className="w-6 h-6 text-secondary-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Medications</p>
                <p className="text-2xl font-bold text-gray-900">4</p>
              </div>
            </div>
          </div>

          <div className="card cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/patient/reports')}>
            <div className="flex items-center">
              <div className="p-3 bg-warm-100 rounded-lg">
                <Bell className="w-6 h-6 text-warm-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Reports</p>
                <p className="text-2xl font-bold text-gray-900">{reports.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Health Overview */}
          <div className="lg:col-span-2">
            <div className="card">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Today's Health Overview</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Vital Signs */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800">Vital Signs</h3>
                                     <div className="space-y-3">
                     <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                       <span className="text-sm font-medium text-gray-700">Blood Pressure</span>
                       <span className="text-sm text-gray-900">
                         {patientStatus?.vitalSigns?.bloodPressure?.systolic || 120}/{patientStatus?.vitalSigns?.bloodPressure?.diastolic || 80} mmHg
                       </span>
                     </div>
                     <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                       <span className="text-sm font-medium text-gray-700">Heart Rate</span>
                       <span className="text-sm text-gray-900">
                         {patientStatus?.vitalSigns?.heartRate?.value || 72} bpm
                       </span>
                     </div>
                     <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                       <span className="text-sm font-medium text-gray-700">Temperature</span>
                       <span className="text-sm text-gray-900">
                         {patientStatus?.vitalSigns?.temperature?.value || 98.6}°F
                       </span>
                     </div>
                     <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                       <span className="text-sm font-medium text-gray-700">Weight</span>
                       <span className="text-sm text-gray-900">
                         {patientStatus?.vitalSigns?.weight?.value || 165} lbs
                       </span>
                     </div>
                   </div>
                </div>

                {/* Medication Schedule */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800">Today's Medications</h3>
                                     <div className="space-y-3">
                     {patientStatus?.medicationStatus?.map((med, index) => (
                       <div key={index} className={`flex items-center space-x-3 p-3 rounded-lg ${
                         med.taken ? 'bg-green-50' : 'bg-yellow-50'
                       }`}>
                         <div className={`w-2 h-2 rounded-full ${
                           med.taken ? 'bg-green-500' : 'bg-yellow-500'
                         }`}></div>
                         <div className="flex-1">
                           <p className="text-sm font-medium text-gray-900">{med.medicationName}</p>
                           <p className="text-sm text-gray-600">
                             {med.taken ? 'Taken' : 'Pending'} - {new Date(med.scheduledTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                           </p>
                         </div>
                       </div>
                     )) || (
                       <>
                         <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                           <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                           <div className="flex-1">
                             <p className="text-sm font-medium text-gray-900">Metformin 500mg</p>
                             <p className="text-sm text-gray-600">8:00 AM - Taken</p>
                           </div>
                         </div>
                         <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg">
                           <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                           <div className="flex-1">
                             <p className="text-sm font-medium text-gray-900">Lisinopril 10mg</p>
                             <p className="text-sm text-gray-600">8:00 AM - Pending</p>
                           </div>
                         </div>
                       </>
                     )}
                   </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="card mt-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Activity</h2>
              <div className="space-y-4">
                <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                  <div className="w-2 h-2 bg-healthcare-600 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Blood pressure recorded</p>
                    <p className="text-sm text-gray-600">120/80 mmHg - Normal range</p>
                  </div>
                  <span className="text-sm text-gray-500">2 hours ago</span>
                </div>
                <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                  <div className="w-2 h-2 bg-primary-600 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Appointment scheduled</p>
                    <p className="text-sm text-gray-600">Follow-up with Dr. Smith tomorrow</p>
                  </div>
                  <span className="text-sm text-gray-500">1 day ago</span>
                </div>
                <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                  <div className="w-2 h-2 bg-secondary-600 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Care plan updated</p>
                    <p className="text-sm text-gray-600">New exercise routine added</p>
                  </div>
                  <span className="text-sm text-gray-500">3 days ago</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions & Reminders */}
          <div>
                         <div className="card">
               <h2 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h2>
               <div className="space-y-3">
                                   <button 
                    onClick={updateStatus}
                    disabled={isStatusLoading}
                    className="w-full btn-primary text-left"
                  >
                    {isStatusLoading ? 'Updating...' : 'Update Status'}
                  </button>
                 <button 
                   onClick={() => setShowUploadModal(true)}
                   className="w-full btn-secondary text-left"
                 >
                   Upload Report
                 </button>
                 <button className="w-full btn-healthcare text-left">
                   Schedule Appointment
                 </button>
                 <button className="w-full btn-secondary text-left">
                   Contact Caregiver
                 </button>
                 <button 
                   onClick={() => navigate('/patient/reports')}
                   className="w-full btn-warm text-left"
                 >
                   View Reports
                 </button>
                {user?.role === 'caregiver' && (
                  <button 
                    onClick={() => navigate('/patient/task-calendar')}
                    className="w-full btn-healthcare text-left"
                  >
                    Task
                  </button>
                )}
               </div>
             </div>

            {/* Reminders */}
            <div className="card mt-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Today's Reminders</h2>
              <div className="space-y-4">
                <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                  <Clock className="w-4 h-4 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-blue-900">Take Lisinopril</p>
                    <p className="text-sm text-blue-700">Due in 30 minutes</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
                  <Activity className="w-4 h-4 text-green-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-green-900">30-minute walk</p>
                    <p className="text-sm text-green-700">Recommended daily exercise</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3 p-3 bg-purple-50 rounded-lg">
                  <FileText className="w-4 h-4 text-purple-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-purple-900">Update symptoms</p>
                    <p className="text-sm text-purple-700">Daily health check-in</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Patient Profile */}
            <div className="card mt-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Your Profile</h2>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-primary-600 to-healthcare-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">
                      {user?.firstName?.[0]}{user?.lastName?.[0]}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p className="text-sm text-gray-600 capitalize">{user?.role}</p>
                  </div>
                </div>
                <div className="pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-600 mb-2">Email: {user?.email}</p>
                  {user?.phone && (
                    <p className="text-sm text-gray-600">Phone: {user?.phone}</p>
                  )}
                </div>
              </div>
            </div>
                     </div>
         </div>
       </div>

       {/* Upload Report Modal */}
       {showUploadModal && (
         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
           <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
             <h3 className="text-lg font-bold text-gray-900 mb-4">Upload Report</h3>
             <form onSubmit={handleUploadReport} className="space-y-4">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-2">
                     Report Title
                   </label>
                   <input
                     type="text"
                     value={uploadForm.title}
                     onChange={(e) => setUploadForm({...uploadForm, title: e.target.value})}
                     className="input-field"
                     placeholder="Enter report title"
                     required
                   />
                 </div>
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-2">
                     Report Type
                   </label>
                   <select
                     value={uploadForm.reportType}
                     onChange={(e) => setUploadForm({...uploadForm, reportType: e.target.value})}
                     className="input-field"
                   >
                     <option value="lab_report">Lab Report</option>
                     <option value="imaging">Imaging</option>
                     <option value="prescription">Prescription</option>
                     <option value="discharge_summary">Discharge Summary</option>
                     <option value="progress_note">Progress Note</option>
                     <option value="other">Other</option>
                   </select>
                 </div>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-2">
                     Description
                   </label>
                   <textarea
                     value={uploadForm.description}
                     onChange={(e) => setUploadForm({...uploadForm, description: e.target.value})}
                     className="input-field"
                     placeholder="Enter description"
                     rows="3"
                   />
                 </div>
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-2">
                     Tags (comma separated)
                   </label>
                   <input
                     type="text"
                     value={uploadForm.tags}
                     onChange={(e) => setUploadForm({...uploadForm, tags: e.target.value})}
                     className="input-field"
                     placeholder="e.g., diabetes, blood test, follow-up"
                   />
                 </div>
               </div>
               <div className="col-span-full">
                 <label className="block text-sm font-medium text-gray-700 mb-2">
                   File
                 </label>
                 <input
                   type="file"
                   onChange={handleFileSelect}
                   className="input-field"
                   accept=".pdf,.jpg,.jpeg,.png,.gif,.doc,.docx,.txt"
                   required
                 />
                 {selectedFile && (
                   <p className="text-sm text-gray-600 mt-1">
                     Selected: {selectedFile.name}
                   </p>
                 )}
               </div>
               <div className="flex space-x-3">
                 <button
                   type="button"
                   onClick={() => setShowUploadModal(false)}
                   className="flex-1 btn-secondary"
                 >
                   Cancel
                 </button>
                 <button
                   type="submit"
                   disabled={isUploading}
                   className="flex-1 btn-primary"
                 >
                   {isUploading ? 'Uploading...' : 'Upload'}
                 </button>
               </div>
             </form>
           </div>
         </div>
       )}

       {/* Reports Section */}
       <div className="mt-8">
         <div className="card">
           <h2 className="text-xl font-bold text-gray-900 mb-6">My Reports</h2>
           {reports.length > 0 ? (
             <div className="space-y-4">
               {reports.map((report) => (
                 <div key={report._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                   <div className="flex items-center space-x-4">
                     <div className="w-10 h-10 bg-gradient-to-r from-primary-600 to-healthcare-600 rounded-full flex items-center justify-center">
                       <FileText className="w-5 h-5 text-white" />
                     </div>
                     <div>
                       <p className="text-sm font-medium text-gray-900">{report.title}</p>
                       <p className="text-sm text-gray-600">
                         {report.reportType.replace('_', ' ')} • {new Date(report.createdAt).toLocaleDateString()}
                       </p>
                     </div>
                   </div>
                   <div className="flex items-center space-x-2">
                     <span className={`px-2 py-1 text-xs rounded-full ${
                       report.status === 'approved' ? 'bg-green-100 text-green-800' :
                       report.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                       report.status === 'rejected' ? 'bg-red-100 text-red-800' :
                       'bg-gray-100 text-gray-800'
                     }`}>
                       {report.status}
                     </span>
                     <button className="p-2 text-gray-400 hover:text-gray-600">
                       <Eye className="w-4 h-4" />
                     </button>
                   </div>
                 </div>
               ))}
             </div>
           ) : (
             <p className="text-gray-600 text-center py-8">No reports uploaded yet.</p>
           )}
         </div>
       </div>
     </div>
   );
 };

 export default PatientDashboard;
