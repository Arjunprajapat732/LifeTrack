const express = require('express');
const router = express.Router();
const multer = require('multer');
const { auth } = require('../middlewares/auth');
const {
  initializeUpload,
  uploadFile,
  getUploadProgress,
  getPatientUploads,
  getAllUploads,
  retryUpload,
  deleteUpload,
  getUploadStats
} = require('../controllers/reportUploadController');

// Configure multer for file uploads with progress tracking
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

// Initialize upload (create upload record)
router.post('/initialize', initializeUpload);

// Upload file with progress tracking
router.post('/:uploadId/upload', upload.single('file'), uploadFile);

// Get upload progress
router.get('/:uploadId/progress', getUploadProgress);

// Get patient's uploads
router.get('/my-uploads', getPatientUploads);

// Get all uploads (for caregivers)
router.get('/all-uploads', getAllUploads);

// Retry failed upload
router.post('/:uploadId/retry', retryUpload);

// Delete upload
router.delete('/:uploadId', deleteUpload);

// Get upload statistics
router.get('/stats/overview', getUploadStats);

module.exports = router;
