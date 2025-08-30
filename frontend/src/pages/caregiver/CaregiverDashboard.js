import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { User, Calendar, Activity, Bell, Heart, Clock, Users, FileText, Eye, Download, Search, MessageCircle } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import HealthAssistance from '../../components/HealthAssistance';

const CaregiverDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [reports, setReports] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showPatientModal, setShowPatientModal] = useState(false);
  const [showReportsModal, setShowReportsModal] = useState(false);
  const [showHealthAssistance, setShowHealthAssistance] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch all patients and their status
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const response = await axios.get('/api/patient-status/all-patients');
        setPatients(response.data.data.patients);
      } catch (error) {
        console.error('Error fetching patients:', error);
      }
    };

    fetchPatients();
  }, []);


  // Fetch all reports
  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await axios.get('/api/reports/all-patients');
        setReports(response.data.data.reports);
      } catch (error) {
        console.error('Error fetching reports:', error);
      }
    };
    fetchReports();
  }, []);

  // Only show Task button if logged-in user is a caregiver

  // View patient details
  const viewPatientDetails = (patient) => {
    setSelectedPatient(patient);
    setShowPatientModal(true);
  };

  // View patient reports
  const viewPatientReports = (patient) => {
    setSelectedPatient(patient);
    setShowReportsModal(true);
  };

  // Filter patients: only show those associated with this caregiver (user._id), and match search
  const filteredPatients = patients
    .filter(patientData => {
      // patientData.patient.caregiverId should match user._id
      // fallback: show all if caregiverId is not set (for backward compatibility)
      return (
        (!patientData.patient.caregiverId || patientData.patient.caregiverId === user?._id) &&
        (
          patientData.patient.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          patientData.patient.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          patientData.patient.email.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    });

  return (
    <div className="min-h-screen bg-gradient-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.firstName}!
          </h1>
          <p className="text-gray-600">
            Manage your patients and care plans efficiently.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                     <div className="card">
             <div className="flex items-center">
               <div className="p-3 bg-primary-100 rounded-lg">
                 <Users className="w-6 h-6 text-primary-600" />
               </div>
               <div className="ml-4">
                 <p className="text-sm font-medium text-gray-600">Active Patients</p>
                 <p className="text-2xl font-bold text-gray-900">{patients.length}</p>
               </div>
             </div>
           </div>

          <div className="card">
            <div className="flex items-center">
              <div className="p-3 bg-healthcare-100 rounded-lg">
                <Calendar className="w-6 h-6 text-healthcare-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Today's Visits</p>
                <p className="text-2xl font-bold text-gray-900">8</p>
              </div>
            </div>
          </div>

                     <div className="card cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/caregiver/reports')}>
             <div className="flex items-center">
               <div className="p-3 bg-secondary-100 rounded-lg">
                 <FileText className="w-6 h-6 text-secondary-600" />
               </div>
               <div className="ml-4">
                 <p className="text-sm font-medium text-gray-600">Total Reports</p>
                 <p className="text-2xl font-bold text-gray-900">{reports.length}</p>
               </div>
             </div>
           </div>

          <div className="card">
            <div className="flex items-center">
              <div className="p-3 bg-warm-100 rounded-lg">
                <Bell className="w-6 h-6 text-warm-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Alerts</p>
                <p className="text-2xl font-bold text-gray-900">3</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Patient List */}
                     <div className="lg:col-span-2">
             <div className="card">
               <div className="flex justify-between items-center mb-6">
                 <h2 className="text-xl font-bold text-gray-900">Patient Management</h2>
                 <div className="relative">
                   <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                   <input
                     type="text"
                     placeholder="Search patients..."
                     value={searchTerm}
                     onChange={(e) => setSearchTerm(e.target.value)}
                     className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                   />
                 </div>
               </div>
               <div className="space-y-4">
                 {filteredPatients.length > 0 ? (
                   filteredPatients.map((patientData) => (
                     <div key={patientData.patient._id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                       <div className="w-10 h-10 bg-gradient-to-r from-primary-600 to-healthcare-600 rounded-full flex items-center justify-center">
                         <span className="text-white font-bold text-sm">
                           {patientData.patient.firstName[0]}{patientData.patient.lastName[0]}
                         </span>
                       </div>
                       <div className="flex-1">
                         <p className="text-sm font-medium text-gray-900">
                           {patientData.patient.firstName} {patientData.patient.lastName}
                         </p>
                         <p className="text-sm text-gray-600">
                           {patientData.patient.email} • Health Score: {patientData.latestStatus?.healthScore || 85}%
                         </p>
                       </div>
                       <div className="flex items-center space-x-2">
                         <span className={`px-2 py-1 text-xs rounded-full ${
                           patientData.latestStatus?.status === 'stable' ? 'bg-green-100 text-green-800' :
                           patientData.latestStatus?.status === 'improving' ? 'bg-blue-100 text-blue-800' :
                           patientData.latestStatus?.status === 'declining' ? 'bg-yellow-100 text-yellow-800' :
                           patientData.latestStatus?.status === 'critical' ? 'bg-red-100 text-red-800' :
                           'bg-gray-100 text-gray-800'
                         }`}>
                           {patientData.latestStatus?.status || 'stable'}
                         </span>
                         <button 
                           onClick={() => viewPatientDetails(patientData)}
                           className="p-2 text-gray-400 hover:text-gray-600"
                         >
                           <Eye className="w-4 h-4" />
                         </button>
                       </div>
                     </div>
                   ))
                 ) : (
                   <p className="text-gray-600 text-center py-8">
                     {searchTerm ? 'No patients found matching your search.' : 'No patients available.'}
                   </p>
                 )}
               </div>
             </div>
           </div>

          {/* Quick Actions & Alerts */}
          <div>
                         <div className="card">
               <h2 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h2>
               <div className="space-y-3">
                                   <button 
                    className="w-full btn-primary text-left"
                    onClick={() => navigate('/caregiver/add-patient')}
                  >
                    Add New Patient
                  </button>
                  <button 
                    onClick={() => navigate('/caregiver/reports')}
                    className="w-full btn-healthcare text-left"
                  >
                    View All Reports
                  </button>
                                 {user?.role === 'caregiver' && (
                   <button 
                     onClick={() => navigate('/caregiver/task-calendar')}
                     className="w-full btn-healthcare text-left"
                   >
                     Schedule Appointment
                   </button>
                 )}
                  <button className="w-full btn-secondary text-left">
                    Record Vital Signs
                  </button>
                 <button 
                   onClick={() => setShowHealthAssistance(true)}
                   className="w-full btn-primary text-left flex items-center space-x-2"
                 >
                   <MessageCircle className="w-4 h-4" />
                   <span>AI Health Assistant</span>
                 </button>
              
               </div>
             </div>

            {/* Alerts */}
            <div className="card mt-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Alerts</h2>
              <div className="space-y-4">
                <div className="flex items-start space-x-3 p-3 bg-red-50 rounded-lg">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium text-red-900">High Blood Pressure</p>
                    <p className="text-sm text-red-700">Mary Smith - 160/95 mmHg</p>
                    <p className="text-xs text-red-600">2 hours ago</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium text-yellow-900">Missed Medication</p>
                    <p className="text-sm text-yellow-700">Robert Johnson - Morning dose</p>
                    <p className="text-xs text-yellow-600">4 hours ago</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium text-blue-900">Appointment Reminder</p>
                    <p className="text-sm text-blue-700">John Doe - Tomorrow 9:00 AM</p>
                    <p className="text-xs text-blue-600">1 day ago</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Caregiver Profile */}
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

       {/* Patient Details Modal */}
       {showPatientModal && selectedPatient && (
         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
           <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
             <div className="flex justify-between items-center mb-4">
               <h3 className="text-lg font-bold text-gray-900">
                 Patient Details: {selectedPatient.patient.firstName} {selectedPatient.patient.lastName}
               </h3>
               <button 
                 onClick={() => setShowPatientModal(false)}
                 className="text-gray-400 hover:text-gray-600"
               >
                 ✕
               </button>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div>
                 <h4 className="font-semibold text-gray-800 mb-3">Patient Information</h4>
                 <div className="space-y-2">
                   <p><span className="font-medium">Name:</span> {selectedPatient.patient.firstName} {selectedPatient.patient.lastName}</p>
                   <p><span className="font-medium">Email:</span> {selectedPatient.patient.email}</p>
                   <p><span className="font-medium">Phone:</span> {selectedPatient.patient.phone || 'Not provided'}</p>
                   <p><span className="font-medium">Health Score:</span> {selectedPatient.latestStatus?.healthScore || 85}%</p>
                   <p><span className="font-medium">Status:</span> 
                     <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                       selectedPatient.latestStatus?.status === 'stable' ? 'bg-green-100 text-green-800' :
                       selectedPatient.latestStatus?.status === 'improving' ? 'bg-blue-100 text-blue-800' :
                       selectedPatient.latestStatus?.status === 'declining' ? 'bg-yellow-100 text-yellow-800' :
                       selectedPatient.latestStatus?.status === 'critical' ? 'bg-red-100 text-red-800' :
                       'bg-gray-100 text-gray-800'
                     }`}>
                       {selectedPatient.latestStatus?.status || 'stable'}
                     </span>
                   </p>
                 </div>
               </div>
               
               <div>
                 <h4 className="font-semibold text-gray-800 mb-3">Latest Vital Signs</h4>
                 <div className="space-y-2">
                   <p><span className="font-medium">Blood Pressure:</span> {selectedPatient.latestStatus?.vitalSigns?.bloodPressure?.systolic || 120}/{selectedPatient.latestStatus?.vitalSigns?.bloodPressure?.diastolic || 80} mmHg</p>
                   <p><span className="font-medium">Heart Rate:</span> {selectedPatient.latestStatus?.vitalSigns?.heartRate?.value || 72} bpm</p>
                   <p><span className="font-medium">Temperature:</span> {selectedPatient.latestStatus?.vitalSigns?.temperature?.value || 98.6}°F</p>
                   <p><span className="font-medium">Weight:</span> {selectedPatient.latestStatus?.vitalSigns?.weight?.value || 165} lbs</p>
                 </div>
               </div>
             </div>
             
             <div className="mt-6 flex space-x-3">
               <button 
                 onClick={() => viewPatientReports(selectedPatient)}
                 className="btn-primary"
               >
                 View Reports
               </button>
               <button 
                 onClick={() => setShowPatientModal(false)}
                 className="btn-secondary"
               >
                 Close
               </button>
             </div>
           </div>
         </div>
       )}

       {/* Reports Modal */}
       {showReportsModal && (
         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
           <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
             <div className="flex justify-between items-center mb-4">
               <h3 className="text-lg font-bold text-gray-900">
                 {selectedPatient ? `${selectedPatient.patient.firstName} ${selectedPatient.patient.lastName}'s Reports` : 'All Patient Reports'}
               </h3>
               <button 
                 onClick={() => {
                   setShowReportsModal(false);
                   setSelectedPatient(null);
                 }}
                 className="text-gray-400 hover:text-gray-600"
               >
                 ✕
               </button>
             </div>
             
             <div className="space-y-4">
               {reports.length > 0 ? (
                 reports
                   .filter(report => !selectedPatient || report.patientId._id === selectedPatient.patient._id)
                   .map((report) => (
                     <div key={report._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                       <div className="flex items-center space-x-4">
                         <div className="w-10 h-10 bg-gradient-to-r from-primary-600 to-healthcare-600 rounded-full flex items-center justify-center">
                           <FileText className="w-5 h-5 text-white" />
                         </div>
                         <div>
                           <p className="text-sm font-medium text-gray-900">{report.title}</p>
                           <p className="text-sm text-gray-600">
                             {report.patientId.firstName} {report.patientId.lastName} • {report.reportType.replace('_', ' ')} • {new Date(report.createdAt).toLocaleDateString()}
                           </p>
                           {report.description && (
                             <p className="text-sm text-gray-500 mt-1">{report.description}</p>
                           )}
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
                         <button 
                           onClick={async () => {
                             try {
                               const response = await axios.get(`/api/reports/view/${report._id}`, {
                                 responseType: 'blob'
                               });
                               const blob = new Blob([response.data], { type: response.headers['content-type'] });
                               const url = window.URL.createObjectURL(blob);
                               window.open(url, '_blank');
                               toast.success('Report opened successfully');
                             } catch (error) {
                               console.error('Error viewing report:', error);
                               toast.error('Failed to view report');
                             }
                           }}
                           className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                           title="View report"
                         >
                           <Eye className="w-4 h-4" />
                         </button>
                         <button 
                           onClick={async () => {
                             try {
                               const response = await axios.get(`/api/reports/download/${report._id}`, {
                                 responseType: 'blob'
                               });
                               const blob = new Blob([response.data], { type: response.headers['content-type'] });
                               const url = window.URL.createObjectURL(blob);
                               const a = document.createElement('a');
                               a.href = url;
                               a.download = report.fileName || `${report.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`;
                               document.body.appendChild(a);
                               a.click();
                               document.body.removeChild(a);
                               window.URL.revokeObjectURL(url);
                               toast.success('Report downloaded successfully');
                             } catch (error) {
                               console.error('Error downloading report:', error);
                               toast.error('Failed to download report');
                             }
                           }}
                           className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
                           title="Download report"
                         >
                           <Download className="w-4 h-4" />
                         </button>
                       </div>
                     </div>
                   ))
               ) : (
                 <p className="text-gray-600 text-center py-8">No reports available.</p>
               )}
             </div>
           </div>
         </div>
       )}

       {/* AI Health Assistance Modal */}
       <HealthAssistance 
         isOpen={showHealthAssistance}
         onClose={() => setShowHealthAssistance(false)}
         userRole="caregiver"
       />
     </div>
   );
 };

 export default CaregiverDashboard;
