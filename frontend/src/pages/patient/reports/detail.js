import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { ArrowLeft, FileText, Calendar, Clock, Download, Eye, AlertCircle, Home } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const PatientReportDetail = () => {
  const { reportId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageModal, setImageModal] = useState({ open: false, src: '' });

  // Fetch report details
  useEffect(() => {
    const fetchReport = async () => {
      if (!reportId) {
        setError('Report ID is missing');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const response = await axios.get(`/api/reports/${reportId}`);
        setReport(response.data.data.report);
      } catch (error) {
        console.error('Error fetching report:', error);
        if (error.response?.status === 404) {
          setError('Report not found');
        } else if (error.response?.status === 403) {
          setError('You are not authorized to view this report');
        } else {
          setError('Failed to load report details');
        }
        toast.error('Failed to load report');
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [reportId]);

  // Handle file download
  const handleDownload = async () => {
    try {
      const response = await axios.get(`/api/reports/download/${reportId}`, {
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
  };

  // Handle file view
  const handleView = async () => {
    try {
      const response = await axios.get(`/api/reports/view/${reportId}`, {
        responseType: 'blob'
      });
      const contentType = response.headers['content-type'];
      const blob = new Blob([response.data], { type: contentType });
      const url = window.URL.createObjectURL(blob);
      // Check if file is an image
      if (contentType.startsWith('image/')) {
        setImageModal({ open: true, src: url });
      } else {
        window.open(url, '_blank');
        toast.success('Report opened successfully');
      }
    } catch (error) {
      console.error('Error viewing report:', error);
      toast.error('Failed to view report');
    }
  };

  // Get status badge styling
  const getStatusBadge = (status) => {
    const statusStyles = {
      pending: 'bg-yellow-100 text-yellow-800',
      reviewed: 'bg-blue-100 text-blue-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800'
    };
    
    return `px-3 py-1 text-sm font-medium rounded-full ${statusStyles[status] || 'bg-gray-100 text-gray-800'}`;
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-bg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading report details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-bg">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Breadcrumb Navigation */}
          <div className="mb-6">
            <nav className="flex items-center space-x-2 text-sm text-gray-600">
              <Link to="/dashboard" className="flex items-center hover:text-primary-600 transition-colors">
                <Home className="w-4 h-4 mr-1" />
                Dashboard
              </Link>
              <span>/</span>
              <Link to="/patient/reports" className="hover:text-primary-600 transition-colors">
                My Reports
              </Link>
              <span>/</span>
              <span className="text-gray-900 font-medium">Report Details</span>
            </nav>
          </div>

          {/* Back Button */}
          <button
            onClick={() => navigate('/patient/reports')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to My Reports
          </button>

          {/* Error Message */}
          <div className="card">
            <div className="text-center py-12">
              <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Report Not Found</h2>
              <blockquote className="text-lg text-gray-600 mb-6 border-l-4 border-red-400 pl-4">
                {error}
              </blockquote>
              <button
                onClick={() => navigate('/patient/reports')}
                className="btn-primary"
              >
                Return to My Reports
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-bg">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb Navigation */}
        <div className="mb-6">
          <nav className="flex items-center space-x-2 text-sm text-gray-600">
            <Link to="/dashboard" className="flex items-center hover:text-primary-600 transition-colors">
              <Home className="w-4 h-4 mr-1" />
              Dashboard
            </Link>
            <span>/</span>
            <Link to="/patient/reports" className="hover:text-primary-600 transition-colors">
              My Reports
            </Link>
            <span>/</span>
            <span className="text-gray-900 font-medium">Report Details</span>
          </nav>
        </div>

        {/* Back Button */}
        <button
          onClick={() => navigate('/patient/reports')}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to My Reports
        </button>

        {/* Report Header */}
        <div className="card mb-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-r from-primary-600 to-healthcare-600 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <h1 className="text-2xl font-bold text-gray-900">{report.title}</h1>
                <p className="text-gray-600">Report ID: {report._id}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <span className={getStatusBadge(report.status)}>
                {report.status}
              </span>
              <button
                onClick={handleView}
                className="btn-secondary flex items-center"
              >
                <Eye className="w-4 h-4 mr-2" />
                View
              </button>
        {/* Image Modal */}
        {imageModal.open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
            <div className="bg-white rounded-lg shadow-lg p-4 max-w-2xl w-full flex flex-col items-center relative">
              <button
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-2xl font-bold"
                onClick={() => setImageModal({ open: false, src: '' })}
                aria-label="Close"
              >
                &times;
              </button>
              <img
                src={imageModal.src}
                alt="Uploaded Report"
                className="max-h-[70vh] w-auto rounded-lg border"
                style={{ objectFit: 'contain' }}
              />
            </div>
          </div>
        )}
              <button
                onClick={handleDownload}
                className="btn-primary flex items-center"
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </button>
            </div>
          </div>
        </div>

        {/* Report Details - Full Width */}
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Report Information</h2>
          <div className="space-y-4">
            <div className="flex items-center">
              <Calendar className="w-5 h-5 text-gray-400 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-500">Created Date</p>
                <p className="text-gray-900">{formatDate(report.createdAt)}</p>
              </div>
            </div>
            <div className="flex items-center">
              <Clock className="w-5 h-5 text-gray-400 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-500">Last Updated</p>
                <p className="text-gray-900">{formatDate(report.updatedAt)}</p>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Report Type</p>
              <p className="text-gray-900 capitalize">{report.reportType.replace('_', ' ')}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Visibility</p>
              <p className="text-gray-900">{report.isPublic ? 'Public' : 'Private'}</p>
            </div>
            {report.tags && report.tags.length > 0 && (
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Tags</p>
                <div className="flex flex-wrap gap-2">
                  {report.tags.map((tag, index) => (
                    <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Description */}
        {report.description && (
          <div className="card mt-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Description</h2>
            <div className="prose max-w-none">
              <p className="text-gray-700 whitespace-pre-wrap">{report.description}</p>
            </div>
          </div>
        )}

        {/* AI Analysis */}
        {report.ai_analysis_status === 'completed' && report.ai_describe && (
          <div className="card mt-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">AI Analysis</h2>
            <div className="prose max-w-none">
              <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-4">
                <p className="text-blue-800 text-sm font-medium">
                  🤖 AI-Powered Medical Report Analysis
                </p>
              </div>
              <div className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                {report.ai_describe}
              </div>
            </div>
          </div>
        )}

        {/* AI Analysis Loading/Failed States */}
        {report.ai_analysis_status === 'processing' && (
          <div className="card mt-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">AI Analysis</h2>
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">AI analysis is in progress...</p>
              <p className="text-sm text-gray-500 mt-2">This may take a few moments</p>
            </div>
          </div>
        )}

        {report.ai_analysis_status === 'failed' && (
          <div className="card mt-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">AI Analysis</h2>
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <p className="text-red-600 font-medium mb-2">AI analysis failed</p>
              <p className="text-gray-600 mb-4">The AI analysis could not be completed for this report.</p>
              <button
                onClick={() => window.location.reload()}
                className="btn-secondary"
              >
                Retry Analysis
              </button>
            </div>
          </div>
        )}

        {/* Review Information */}
        {report.reviewedBy && (
          <div className="card mt-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Review Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Reviewed By</p>
                <p className="text-gray-900">{report.reviewedBy?.firstName} {report.reviewedBy?.lastName}</p>
              </div>
              
              {report.reviewDate && (
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Review Date</p>
                  <p className="text-gray-900">{formatDate(report.reviewDate)}</p>
                </div>
              )}
              
              {report.reviewNotes && (
                <div className="md:col-span-2">
                  <p className="text-sm font-medium text-gray-500 mb-1">Review Notes</p>
                  <div className="prose max-w-none">
                    <p className="text-gray-700 whitespace-pre-wrap">{report.reviewNotes}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientReportDetail;
