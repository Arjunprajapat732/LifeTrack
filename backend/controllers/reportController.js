const Report = require('../models/Report');
const User = require('../models/User');
const AIAnalysisService = require('../services/aiAnalysisService');
const path = require('path');

console.log('🔧 AIAnalysisService imported:', typeof AIAnalysisService);
console.log('🔧 AIAnalysisService.processReportAnalysis:', typeof AIAnalysisService.processReportAnalysis);

// Upload a new report
exports.uploadReport = async (req, res) => {
  console.log('🚨 UPLOAD REPORT FUNCTION EXECUTED! 🚨');
  console.log('📤 Upload report function called!');
  console.log('📤 Request body:', req.body);
  console.log('📤 Request file:', req.file);
  
  try {
    const { title, description, reportType, tags, isPublic } = req.body;
    const { file } = req;

    if (!file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    // Get the caregiver ID from the authenticated user
    let caregiverId = null;
    if (req.user.role === 'patient' && req.user.caregiverId) {
      caregiverId = req.user.caregiverId;
    }

    // For demo purposes, we'll store file info without actual file upload
    // In production, you'd upload to cloud storage (AWS S3, etc.)
    const reportData = {
      patientId: req.user.id,
      caregiverId: caregiverId,
      title,
      description,
      reportType: reportType || 'other',
      fileUrl: `/uploads/${file.filename}`, // Demo URL
      fileName: file.originalname,
      fileSize: file.size,
      fileType: file.mimetype,
      uploadedBy: req.user.id,
      isPublic: isPublic || false,
      tags: tags ? tags.split(',').map(tag => tag.trim()) : []
    };

    const newReport = new Report(reportData);
    await newReport.save();

    // Trigger AI analysis in the background (non-blocking)
    const filePath = path.join(__dirname, '..', file.path || `uploads/${file.filename}`);
    
    // Alternative file path construction
    const altFilePath = path.join(__dirname, '..', 'uploads', file.filename);
    
    console.log('🤖 AI Analysis Debug:');
    console.log('  - Report ID:', newReport._id);
    console.log('  - File Path:', filePath);
    console.log('  - File exists:', require('fs').existsSync(filePath));
    console.log('  - Alt File Path:', altFilePath);
    console.log('  - Alt File exists:', require('fs').existsSync(altFilePath));
    console.log('  - File object:', { filename: file.filename, path: file.path, originalname: file.originalname });
    
    // Start AI analysis asynchronously
    setImmediate(async () => {
      console.log('🚀 Starting AI analysis in background...');
      try {
        console.log('📞 Calling AIAnalysisService.processReportAnalysis...');
        await AIAnalysisService.processReportAnalysis(newReport._id, filePath);
        console.log('✅ AI analysis completed successfully');
      } catch (error) {
        console.error('❌ Background AI analysis failed:', error);
        console.error('❌ Error stack:', error.stack);
        // Don't throw error here as it's background processing
      }
    });

    res.status(201).json({
      success: true,
      message: 'Report uploaded successfully. AI analysis is being processed in the background.',
      data: {
        report: newReport
      }
    });
  } catch (error) {
    console.error('Error uploading report:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading report',
      error: error.message
    });
  }
};

// Get patient's own reports
exports.getPatientReports = async (req, res) => {
  try {
    const { limit = 10, page = 1, reportType, status } = req.query;
    const skip = (page - 1) * limit;

    const filter = { patientId: req.user.id };
    
    if (reportType) filter.reportType = reportType;
    if (status) filter.status = status;

    const reports = await Report.find(filter)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip)
      .populate('uploadedBy', 'firstName lastName');

    const total = await Report.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: {
        reports,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Error getting patient reports:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving reports',
      error: error.message
    });
  }
};

// Get all patients reports (for caregivers)
exports.getAllPatientsReports = async (req, res) => {
  try {
    if (req.user.role !== 'caregiver') {
      return res.status(403).json({
        success: false,
        message: 'Only caregivers can view all patients reports'
      });
    }

    const { limit = 10, page = 1, patientId, reportType, status } = req.query;
    const skip = (page - 1) * limit;

    const filter = {};
    
    if (patientId) filter.patientId = patientId;
    if (reportType) filter.reportType = reportType;
    if (status) filter.status = status;

    const reports = await Report.find(filter)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip)
      .populate('patientId', 'firstName lastName email')
      .populate('uploadedBy', 'firstName lastName');

    const total = await Report.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: {
        reports,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Error getting all patients reports:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving reports',
      error: error.message
    });
  }
};

// Get caregiver's patients reports (filtered by caregiver ID)
exports.getCaregiverPatientsReports = async (req, res) => {
  try {
    if (req.user.role !== 'caregiver') {
      return res.status(403).json({
        success: false,
        message: 'Only caregivers can view their patients reports'
      });
    }

    const { limit = 10, page = 1, patientId, reportType, status } = req.query;
    const skip = (page - 1) * limit;

    // Filter reports by caregiver ID
    const filter = { caregiverId: req.user.id };
    
    if (patientId) filter.patientId = patientId;
    if (reportType) filter.reportType = reportType;
    if (status) filter.status = status;

    const reports = await Report.find(filter)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip)
      .populate('patientId', 'firstName lastName email')
      .populate('uploadedBy', 'firstName lastName');

    const total = await Report.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: {
        reports,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Error getting caregiver patients reports:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving reports',
      error: error.message
    });
  }
};

// Get specific patient's reports (for caregivers)
exports.getPatientReportsByCaregiver = async (req, res) => {
  try {
    if (req.user.role !== 'caregiver') {
      return res.status(403).json({
        success: false,
        message: 'Only caregivers can view patient reports'
      });
    }

    const { patientId } = req.params;
    const { limit = 10, page = 1, reportType, status } = req.query;
    const skip = (page - 1) * limit;

    const filter = { patientId };
    
    if (reportType) filter.reportType = reportType;
    if (status) filter.status = status;

    const reports = await Report.find(filter)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip)
      .populate('patientId', 'firstName lastName email')
      .populate('uploadedBy', 'firstName lastName');

    const total = await Report.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: {
        reports,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Error getting patient reports:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving patient reports',
      error: error.message
    });
  }
};

// Get single report details
exports.getReportDetails = async (req, res) => {
  try {
    const { reportId } = req.params;
    const userId = req.user.id;

    const report = await Report.findById(reportId)
      .populate('patientId', 'firstName lastName email')
      .populate('uploadedBy', 'firstName lastName')
      .populate('reviewedBy', 'firstName lastName');

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    // Check authorization
    if (req.user.role !== 'caregiver' && report.patientId._id.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this report'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        report
      }
    });
  } catch (error) {
    console.error('Error getting report details:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving report details',
      error: error.message
    });
  }
};

// Update report status (for caregivers)
exports.updateReportStatus = async (req, res) => {
  try {
    if (req.user.role !== 'caregiver') {
      return res.status(403).json({
        success: false,
        message: 'Only caregivers can update report status'
      });
    }

    const { reportId } = req.params;
    const { status, reviewNotes } = req.body;

    const report = await Report.findById(reportId);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    report.status = status;
    report.reviewNotes = reviewNotes;
    report.reviewedBy = req.user.id;
    report.reviewDate = new Date();

    await report.save();

    res.status(200).json({
      success: true,
      message: 'Report status updated successfully',
      data: {
        report
      }
    });
  } catch (error) {
    console.error('Error updating report status:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating report status',
      error: error.message
    });
  }
};

// Delete report
exports.deleteReport = async (req, res) => {
  try {
    const { reportId } = req.params;
    const userId = req.user.id;

    const report = await Report.findById(reportId);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    // Check authorization
    if (req.user.role !== 'caregiver' && report.patientId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this report'
      });
    }

    await Report.findByIdAndDelete(reportId);

    res.status(200).json({
      success: true,
      message: 'Report deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting report:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting report',
      error: error.message
    });
  }
};

// Get AI analysis status for a report
exports.getAIAnalysisStatus = async (req, res) => {
  try {
    const { reportId } = req.params;
    const userId = req.user.id;

    const report = await Report.findById(reportId);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    // Check authorization
    if (req.user.role !== 'caregiver' && report.patientId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this report'
      });
    }

    const analysisStatus = await AIAnalysisService.getAnalysisStatus(reportId);

    res.status(200).json({
      success: true,
      data: {
        analysisStatus,
        reportId
      }
    });
  } catch (error) {
    console.error('Error getting AI analysis status:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting AI analysis status',
      error: error.message
    });
  }
};

// Retry AI analysis for a report
exports.retryAIAnalysis = async (req, res) => {
  try {
    const { reportId } = req.params;
    const userId = req.user.id;

    const report = await Report.findById(reportId);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    // Check authorization
    if (req.user.role !== 'caregiver' && report.patientId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to retry AI analysis for this report'
      });
    }

    // Check if AI analysis is in a retryable state
    if (report.ai_analysis_status !== 'failed') {
      return res.status(400).json({
        success: false,
        message: 'AI analysis can only be retried if it previously failed'
      });
    }

    // Get the file path
    const filePath = path.join(__dirname, '..', report.fileUrl.replace('/uploads/', 'uploads/'));
    
    // Retry AI analysis in the background
    setImmediate(async () => {
      try {
        await AIAnalysisService.retryAnalysis(reportId, filePath);
      } catch (error) {
        console.error('Background AI analysis retry failed:', error);
      }
    });

    res.status(200).json({
      success: true,
      message: 'AI analysis retry initiated. Check status for updates.',
      data: {
        reportId,
        status: 'retrying'
      }
    });
  } catch (error) {
    console.error('Error retrying AI analysis:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrying AI analysis',
      error: error.message
    });
  }
};
