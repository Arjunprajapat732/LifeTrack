import React, { useState, useRef } from 'react';
import { Upload, X, CheckCircle, AlertCircle, Clock, FileText } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const ReportUpload = ({ onUploadComplete, onClose }) => {
  const [uploadForm, setUploadForm] = useState({
    title: '',
    description: '',
    reportType: 'other',
    tags: '',
    category: 'medical'
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState('idle'); // idle, uploading, completed, failed
  const [uploadId, setUploadId] = useState(null);
  const fileInputRef = useRef(null);

  const reportTypes = [
    { value: 'lab_report', label: 'Lab Report' },
    { value: 'imaging', label: 'Imaging' },
    { value: 'prescription', label: 'Prescription' },
    { value: 'discharge_summary', label: 'Discharge Summary' },
    { value: 'progress_note', label: 'Progress Note' },
    { value: 'other', label: 'Other' }
  ];

  const categories = [
    { value: 'medical', label: 'Medical' },
    { value: 'administrative', label: 'Administrative' },
    { value: 'billing', label: 'Billing' },
    { value: 'legal', label: 'Legal' },
    { value: 'other', label: 'Other' }
  ];

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (100MB)
      if (file.size > 100 * 1024 * 1024) {
        toast.error('File size must be less than 100MB');
        return;
      }

      // Validate file type
      const allowedTypes = [
        'application/pdf',
        'image/jpeg',
        'image/png',
        'image/gif',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain'
      ];

      if (!allowedTypes.includes(file.type)) {
        toast.error('Invalid file type. Only PDF, images, and documents are allowed.');
        return;
      }

      setSelectedFile(file);
    }
  };

  const initializeUpload = async () => {
    try {
      const response = await axios.post('/api/report-upload/initialize', uploadForm);
      setUploadId(response.data.data.uploadId);
      return response.data.data.uploadId;
    } catch (error) {
      console.error('Error initializing upload:', error);
      toast.error('Failed to initialize upload');
      throw error;
    }
  };

  const uploadFile = async (uploadId) => {
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await axios.post(`/api/report-upload/${uploadId}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(progress);
        }
      });

      return response.data;
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('Failed to upload file');
      throw error;
    }
  };

  const monitorProgress = async (uploadId) => {
    const checkProgress = async () => {
      try {
        const response = await axios.get(`/api/report-upload/${uploadId}/progress`);
        const { progress, status } = response.data.data;

        setUploadProgress(progress);
        setUploadStatus(status);

        if (status === 'completed') {
          toast.success('Upload completed successfully!');
          if (onUploadComplete) {
            onUploadComplete(response.data.data.upload);
          }
          return true;
        } else if (status === 'failed') {
          toast.error('Upload failed');
          return true;
        }

        return false;
      } catch (error) {
        console.error('Error checking progress:', error);
        return false;
      }
    };

    // Check progress every 2 seconds
    const interval = setInterval(async () => {
      const isComplete = await checkProgress();
      if (isComplete) {
        clearInterval(interval);
      }
    }, 2000);

    // Initial check
    await checkProgress();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedFile) {
      toast.error('Please select a file');
      return;
    }

    if (!uploadForm.title.trim()) {
      toast.error('Please enter a title');
      return;
    }

    setIsUploading(true);
    setUploadStatus('uploading');
    setUploadProgress(0);

    try {
      // Step 1: Initialize upload
      const id = await initializeUpload();
      setUploadId(id);

      // Step 2: Upload file
      await uploadFile(id);

      // Step 3: Monitor progress
      await monitorProgress(id);

    } catch (error) {
      setUploadStatus('failed');
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRetry = async () => {
    if (!uploadId) return;

    setUploadStatus('uploading');
    setUploadProgress(0);

    try {
      await axios.post(`/api/report-upload/${uploadId}/retry`);
      await monitorProgress(uploadId);
    } catch (error) {
      console.error('Retry error:', error);
      toast.error('Failed to retry upload');
      setUploadStatus('failed');
    }
  };

  const resetForm = () => {
    setUploadForm({
      title: '',
      description: '',
      reportType: 'other',
      tags: '',
      category: 'medical'
    });
    setSelectedFile(null);
    setUploadProgress(0);
    setUploadStatus('idle');
    setUploadId(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getStatusIcon = () => {
    switch (uploadStatus) {
      case 'uploading':
        return <Clock className="w-5 h-5 text-blue-500 animate-spin" />;
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'failed':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <FileText className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusText = () => {
    switch (uploadStatus) {
      case 'uploading':
        return 'Uploading...';
      case 'completed':
        return 'Upload completed';
      case 'failed':
        return 'Upload failed';
      default:
        return 'Ready to upload';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 w-full max-w-4xl max-h-[95vh] overflow-y-auto">
                 <div className="flex justify-between items-center mb-8">
           <h3 className="text-2xl font-bold text-gray-900">Upload Report</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            disabled={isUploading}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

                 <form onSubmit={handleSubmit} className="space-y-8">
          {/* File Selection */}
                     <div>
             <label className="block text-base font-medium text-gray-700 mb-3">
               Select File
             </label>
             <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileSelect}
                className="hidden"
                accept=".pdf,.jpg,.jpeg,.png,.gif,.doc,.docx,.txt"
                disabled={isUploading}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center space-y-2 text-gray-600 hover:text-gray-800"
                disabled={isUploading}
              >
                                 <Upload className="w-12 h-12" />
                 <span className="text-base">
                   {selectedFile ? selectedFile.name : 'Click to select file'}
                 </span>
              </button>
                             {selectedFile && (
                 <div className="mt-3 text-base text-gray-500">
                   Size: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                 </div>
               )}
            </div>
          </div>

                     {/* Upload Progress */}
           {uploadStatus !== 'idle' && (
             <div className="space-y-3">
               <div className="flex items-center space-x-3">
                 {getStatusIcon()}
                 <span className="text-base font-medium">{getStatusText()}</span>
               </div>
               <div className="w-full bg-gray-200 rounded-full h-3">
                 <div
                   className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                   style={{ width: `${uploadProgress}%` }}
                 ></div>
               </div>
               <div className="text-base text-gray-600">
                 {uploadProgress}% complete
               </div>
             </div>
           )}

                                {/* Form Fields */}
           <div className="space-y-6">
             <div>
               <label className="block text-base font-medium text-gray-700 mb-3">
                 Report Title *
               </label>
               <input
                 type="text"
                 value={uploadForm.title}
                 onChange={(e) => setUploadForm({...uploadForm, title: e.target.value})}
                 className="input-field"
                 placeholder="Enter report title"
                 required
                 disabled={isUploading}
               />
             </div>

             <div>
               <label className="block text-base font-medium text-gray-700 mb-3">
                 Report Type
               </label>
               <select
                 value={uploadForm.reportType}
                 onChange={(e) => setUploadForm({...uploadForm, reportType: e.target.value})}
                 className="input-field"
                 disabled={isUploading}
               >
                 {reportTypes.map(type => (
                   <option key={type.value} value={type.value}>
                     {type.label}
                   </option>
                 ))}
               </select>
             </div>
           </div>

                     <div>
             <label className="block text-base font-medium text-gray-700 mb-3">
               Description
             </label>
             <textarea
               value={uploadForm.description}
               onChange={(e) => setUploadForm({...uploadForm, description: e.target.value})}
               className="input-field"
               placeholder="Enter description"
               rows="3"
               disabled={isUploading}
             />
           </div>

           <div className="space-y-6">
             <div>
               <label className="block text-base font-medium text-gray-700 mb-3">
                 Category
               </label>
               <select
                 value={uploadForm.category}
                 onChange={(e) => setUploadForm({...uploadForm, category: e.target.value})}
                 className="input-field"
                 disabled={isUploading}
               >
                 {categories.map(category => (
                   <option key={category.value} value={category.value}>
                     {category.label}
                   </option>
                 ))}
               </select>
             </div>

             <div>
               <label className="block text-base font-medium text-gray-700 mb-3">
                 Tags (comma separated)
               </label>
               <input
                 type="text"
                 value={uploadForm.tags}
                 onChange={(e) => setUploadForm({...uploadForm, tags: e.target.value})}
                 className="input-field"
                 placeholder="e.g., diabetes, blood test, follow-up"
                 disabled={isUploading}
               />
             </div>
           </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4">
            {uploadStatus === 'failed' && (
              <button
                type="button"
                onClick={handleRetry}
                className="flex-1 btn-secondary"
              >
                Retry Upload
              </button>
            )}
            
            {uploadStatus === 'completed' && (
              <button
                type="button"
                onClick={resetForm}
                className="flex-1 btn-primary"
              >
                Upload Another
              </button>
            )}

            {uploadStatus === 'idle' && (
              <>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading || !selectedFile}
                  className="flex-1 btn-primary"
                >
                  {isUploading ? 'Uploading...' : 'Upload Report'}
                </button>
              </>
            )}

            {uploadStatus === 'completed' && (
              <button
                type="button"
                onClick={onClose}
                className="flex-1 btn-secondary"
              >
                Close
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReportUpload;
