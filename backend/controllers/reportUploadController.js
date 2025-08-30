const ReportUpload = require('../models/ReportUpload');
const AIAnalysisService = require('../services/aiAnalysisService');
const fs = require('fs');
const path = require('path');

console.log('🔧 AIAnalysisService imported in reportUploadController:', typeof AIAnalysisService);

// Initialize upload
exports.initializeUpload = async (req, res) => {
  try {
    const { title, description, reportType, tags, category } = req.body;
    const patientId = req.user.id;

    // Get the caregiver ID from the authenticated user
    let caregiverId = null;
    if (req.user.role === 'patient' && req.user.caregiverId) {
      caregiverId = req.user.caregiverId;
    }

    // Create upload record
    const uploadData = {
      title,
      description,
      reportType: reportType || 'other',
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      category: category || 'medical',
      patientId,
      caregiverId: caregiverId,
      uploadedBy: req.user.id,
      uploadStatus: 'uploading',
      uploadProgress: 0
    };

    const newUpload = new ReportUpload(uploadData);
    await newUpload.save();

    res.status(201).json({
      success: true,
      message: 'Upload initialized successfully',
      data: {
        uploadId: newUpload._id,
        upload: newUpload
      }
    });
  } catch (error) {
    console.error('Error initializing upload:', error);
    res.status(500).json({
      success: false,
      message: 'Error initializing upload',
      error: error.message
    });
  }
};

// Upload file with progress tracking
exports.uploadFile = async (req, res) => {
  try {
    const { uploadId } = req.params;
    const { file } = req;

    if (!file) {
      return res.status(400).json({
        success: false,
        message: 'No file provided'
      });
    }

    // Find the upload record
    const upload = await ReportUpload.findById(uploadId);
    if (!upload) {
      return res.status(404).json({
        success: false,
        message: 'Upload record not found'
      });
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

    if (!allowedTypes.includes(file.mimetype)) {
      await upload.markFailed('Invalid file type');
      return res.status(400).json({
        success: false,
        message: 'Invalid file type. Only PDF, images, and documents are allowed.'
      });
    }

    // Validate file size (100MB limit)
    const maxSize = 100 * 1024 * 1024; // 100MB
    if (file.size > maxSize) {
      await upload.markFailed('File size too large');
      return res.status(400).json({
        success: false,
        message: 'File size too large. Maximum size is 100MB.'
      });
    }

    // Update upload record with file information
    upload.originalName = file.originalname;
    upload.filename = file.filename;
    upload.filePath = file.path;
    upload.fileSize = file.size;
    upload.mimeType = file.mimetype;
    upload.isValidFile = true;
    upload.uploadProgress = 50;

    await upload.save();

    // Simulate processing (in real app, you might do virus scanning, OCR, etc.)
    setTimeout(async () => {
      try {
        await upload.markCompleted();
        console.log(`Upload ${uploadId} completed successfully`);
        
        // Trigger AI analysis in the background
        console.log('🤖 Triggering AI analysis for upload:', uploadId);
        const filePath = path.join(__dirname, '..', upload.filePath);
        
        setImmediate(async () => {
          try {
            console.log('🚀 Starting AI analysis in background for upload:', uploadId);
            console.log('📁 File path:', filePath);
            console.log('📁 File exists:', fs.existsSync(filePath));
            
            await AIAnalysisService.processUploadAnalysis(uploadId, filePath);
            console.log('✅ AI analysis completed for upload:', uploadId);
          } catch (error) {
            console.error('❌ AI analysis failed for upload:', uploadId, error);
            console.error('❌ Error stack:', error.stack);
          }
        });
        
      } catch (error) {
        console.error(`Error completing upload ${uploadId}:`, error);
      }
    }, 2000);

    res.status(200).json({
      success: true,
      message: 'File uploaded successfully',
      data: {
        upload: upload,
        progress: upload.uploadProgress
      }
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading file',
      error: error.message
    });
  }
};

// Get upload progress
exports.getUploadProgress = async (req, res) => {
  try {
    const { uploadId } = req.params;

    const upload = await ReportUpload.findById(uploadId)
      .populate('patientId', 'firstName lastName')
      .populate('uploadedBy', 'firstName lastName');

    if (!upload) {
      return res.status(404).json({
        success: false,
        message: 'Upload not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        upload: upload,
        progress: upload.uploadProgress,
        status: upload.uploadStatus
      }
    });
  } catch (error) {
    console.error('Error getting upload progress:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting upload progress',
      error: error.message
    });
  }
};

// Get all uploads for a patient
exports.getPatientUploads = async (req, res) => {
  try {
    const { limit = 10, page = 1, status } = req.query;
    const skip = (page - 1) * limit;

    const filter = { patientId: req.user.id };
    if (status) filter.uploadStatus = status;

    const uploads = await ReportUpload.find(filter)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip)
      .populate('uploadedBy', 'firstName lastName');

    const total = await ReportUpload.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: {
        uploads,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Error getting patient uploads:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving uploads',
      error: error.message
    });
  }
};

// Get all uploads (for caregivers)
exports.getAllUploads = async (req, res) => {
  try {
    if (req.user.role !== 'caregiver') {
      return res.status(403).json({
        success: false,
        message: 'Only caregivers can view all uploads'
      });
    }

    const { limit = 10, page = 1, status, patientId } = req.query;
    const skip = (page - 1) * limit;

    const filter = {};
    if (status) filter.uploadStatus = status;
    if (patientId) filter.patientId = patientId;

    const uploads = await ReportUpload.find(filter)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip)
      .populate('patientId', 'firstName lastName email')
      .populate('uploadedBy', 'firstName lastName');

    const total = await ReportUpload.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: {
        uploads,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Error getting all uploads:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving uploads',
      error: error.message
    });
  }
};

// Retry failed upload
exports.retryUpload = async (req, res) => {
  try {
    const { uploadId } = req.params;

    const upload = await ReportUpload.findById(uploadId);
    if (!upload) {
      return res.status(404).json({
        success: false,
        message: 'Upload not found'
      });
    }

    if (upload.uploadStatus !== 'failed') {
      return res.status(400).json({
        success: false,
        message: 'Only failed uploads can be retried'
      });
    }

    await upload.retry();

    res.status(200).json({
      success: true,
      message: 'Upload retry initiated',
      data: {
        upload: upload
      }
    });
  } catch (error) {
    console.error('Error retrying upload:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrying upload',
      error: error.message
    });
  }
};

// Delete upload
exports.deleteUpload = async (req, res) => {
  try {
    const { uploadId } = req.params;

    const upload = await ReportUpload.findById(uploadId);
    if (!upload) {
      return res.status(404).json({
        success: false,
        message: 'Upload not found'
      });
    }

    // Check authorization
    if (req.user.role !== 'caregiver' && upload.patientId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this upload'
      });
    }

    // Delete file from filesystem
    if (upload.filePath && fs.existsSync(upload.filePath)) {
      fs.unlinkSync(upload.filePath);
    }

    // Delete upload record
    await ReportUpload.findByIdAndDelete(uploadId);

    res.status(200).json({
      success: true,
      message: 'Upload deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting upload:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting upload',
      error: error.message
    });
  }
};

// Get upload statistics
exports.getUploadStats = async (req, res) => {
  try {
    const stats = await ReportUpload.aggregate([
      {
        $group: {
          _id: '$uploadStatus',
          count: { $sum: 1 },
          totalSize: { $sum: '$fileSize' }
        }
      }
    ]);

    const totalUploads = await ReportUpload.countDocuments();
    const totalSize = await ReportUpload.aggregate([
      { $group: { _id: null, total: { $sum: '$fileSize' } } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        stats,
        totalUploads,
        totalSize: totalSize[0]?.total || 0
      }
    });
  } catch (error) {
    console.error('Error getting upload stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting upload statistics',
      error: error.message
    });
  }
};
