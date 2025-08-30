const express = require('express');
const router = express.Router();
const multer = require('multer');
const { auth } = require('../middlewares/auth');
const Report = require('../models/Report');
const {
  uploadReport,
  getPatientReports,
  getAllPatientsReports,
  getCaregiverPatientsReports,
  getPatientReportsByCaregiver,
  getReportDetails,
  updateReportStatus,
  deleteReport,
  getAIAnalysisStatus,
  retryAIAnalysis
} = require('../controllers/reportController');

console.log('🔧 Routes Debug:');
console.log('  - uploadReport function:', typeof uploadReport);
console.log('  - uploadReport is function:', typeof uploadReport === 'function');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow PDF, images, and common document formats
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, images, and documents are allowed.'), false);
    }
  }
});

// All routes require authentication
router.use(auth);

// Test route to see if routes are working
router.get('/test', (req, res) => {
  console.log('🧪 Test route hit!');
  res.json({ message: 'Test route working' });
});

// Upload report
router.post('/upload', upload.single('file'), uploadReport);

// Get patient's own reports
router.get('/my-reports', getPatientReports);

// Get all patients reports (for caregivers)
router.get('/all-patients', getAllPatientsReports);

// Get caregiver's patients reports (filtered by caregiver ID)
router.get('/caregiver-patients', getCaregiverPatientsReports);

// Get specific patient's reports (for caregivers)
router.get('/patient/:patientId', getPatientReportsByCaregiver);

// Get single report details
router.get('/:reportId', getReportDetails);

// Update report status (for caregivers)
router.put('/:reportId/status', updateReportStatus);

// Delete report
router.delete('/:reportId', deleteReport);

// Get AI analysis status for a report
router.get('/:reportId/ai-status', getAIAnalysisStatus);

// Retry AI analysis for a report
router.post('/:reportId/ai-retry', retryAIAnalysis);

// Download report file
router.get('/download/:reportId', async (req, res) => {
  try {
    const { reportId } = req.params;
    const report = await Report.findById(reportId);
    
    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    // Check authorization
    if (req.user.role !== 'caregiver' && report.patientId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to download this report'
      });
    }

    // For demo purposes, return a simple text file
    // In production, you'd serve the actual file from storage
    const fileContent = `Report: ${report.title}\nPatient: ${report.patientId}\nDate: ${report.createdAt}\nDescription: ${report.description || 'No description'}`;
    
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Content-Disposition', `attachment; filename="${report.fileName || 'report.txt'}"`);
    res.send(fileContent);
  } catch (error) {
    console.error('Error downloading report:', error);
    res.status(500).json({
      success: false,
      message: 'Error downloading report',
      error: error.message
    });
  }
});

// View report file
router.get('/view/:reportId', async (req, res) => {
  try {
    const { reportId } = req.params;
    const report = await Report.findById(reportId);
    
    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    // Check authorization
    if (req.user.role !== 'caregiver' && report.patientId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this report'
      });
    }

    // For demo purposes, return a simple text file
    // In production, you'd serve the actual file from storage
    const fileContent = `Report: ${report.title}\nPatient: ${report.patientId}\nDate: ${report.createdAt}\nDescription: ${report.description || 'No description'}`;
    
    res.setHeader('Content-Type', 'text/plain');
    res.send(fileContent);
  } catch (error) {
    console.error('Error viewing report:', error);
    res.status(500).json({
      success: false,
      message: 'Error viewing report',
      error: error.message
    });
  }
});

module.exports = router;
