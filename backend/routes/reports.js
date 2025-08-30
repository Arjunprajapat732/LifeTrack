const express = require('express');
const router = express.Router();
const multer = require('multer');
const { auth } = require('../middlewares/auth');
const {
  uploadReport,
  getPatientReports,
  getAllPatientsReports,
  getPatientReportsByCaregiver,
  getReportDetails,
  updateReportStatus,
  deleteReport
} = require('../controllers/reportController');

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

// Upload report
router.post('/upload', upload.single('file'), uploadReport);

// Get patient's own reports
router.get('/my-reports', getPatientReports);

// Get all patients reports (for caregivers)
router.get('/all-patients', getAllPatientsReports);

// Get specific patient's reports (for caregivers)
router.get('/patient/:patientId', getPatientReportsByCaregiver);

// Get single report details
router.get('/:reportId', getReportDetails);

// Update report status (for caregivers)
router.put('/:reportId/status', updateReportStatus);

// Delete report
router.delete('/:reportId', deleteReport);

module.exports = router;
