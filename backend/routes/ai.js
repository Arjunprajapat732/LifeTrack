const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const { 
  analyzeMedicalReport, 
  analyzeMedicalReportWithContext, 
  extractMedicalInformation 
} = require('../controllers/aiController');
const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: function (req, file, cb) {
    // Allow only images and PDFs
    const allowedTypes = /jpeg|jpg|png|gif|bmp|tiff|webp|pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image and PDF files are allowed!'));
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

/**
 * @route   POST /api/ai/analyze-report
 * @desc    Analyze a medical report using OpenAI Vision API
 * @access  Private
 */
router.post('/analyze-report', auth, upload.single('report'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const filePath = req.file.path;
    
    // Analyze the medical report
    const result = await analyzeMedicalReport(filePath);
    
    res.json({
      success: true,
      data: result,
      message: 'Medical report analyzed successfully'
    });

  } catch (error) {
    console.error('Error in analyze-report route:', error);
    
    // Clean up uploaded file on error
    if (req.file && req.file.path) {
      const fs = require('fs');
      try {
        fs.unlinkSync(req.file.path);
      } catch (unlinkError) {
        console.error('Error deleting file:', unlinkError);
      }
    }

    res.status(500).json({
      success: false,
      message: error.message || 'Failed to analyze medical report'
    });
  }
});

/**
 * @route   POST /api/ai/analyze-report-with-context
 * @desc    Analyze a medical report with patient context
 * @access  Private
 */
router.post('/analyze-report-with-context', auth, upload.single('report'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const filePath = req.file.path;
    const patientContext = {
      age: req.body.age,
      gender: req.body.gender,
      medicalHistory: req.body.medicalHistory
    };
    
    // Analyze the medical report with context
    const result = await analyzeMedicalReportWithContext(filePath, patientContext);
    
    res.json({
      success: true,
      data: result,
      message: 'Medical report analyzed with context successfully'
    });

  } catch (error) {
    console.error('Error in analyze-report-with-context route:', error);
    
    // Clean up uploaded file on error
    if (req.file && req.file.path) {
      const fs = require('fs');
      try {
        fs.unlinkSync(req.file.path);
      } catch (unlinkError) {
        console.error('Error deleting file:', unlinkError);
      }
    }

    res.status(500).json({
      success: false,
      message: error.message || 'Failed to analyze medical report with context'
    });
  }
});

/**
 * @route   POST /api/ai/extract-information
 * @desc    Extract specific information from medical report
 * @access  Private
 */
router.post('/extract-information', auth, upload.single('report'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const filePath = req.file.path;
    const informationTypes = req.body.informationTypes ? 
      JSON.parse(req.body.informationTypes) : 
      ['vitals', 'medications', 'diagnoses', 'recommendations'];
    
    // Extract information from the medical report
    const result = await extractMedicalInformation(filePath, informationTypes);
    
    res.json({
      success: true,
      data: result,
      message: 'Medical information extracted successfully'
    });

  } catch (error) {
    console.error('Error in extract-information route:', error);
    
    // Clean up uploaded file on error
    if (req.file && req.file.path) {
      const fs = require('fs');
      try {
        fs.unlinkSync(req.file.path);
      } catch (unlinkError) {
        console.error('Error deleting file:', unlinkError);
      }
    }

    res.status(500).json({
      success: false,
      message: error.message || 'Failed to extract medical information'
    });
  }
});

/**
 * @route   POST /api/ai/analyze-existing-report
 * @desc    Analyze an existing report file by path
 * @access  Private
 */
router.post('/analyze-existing-report', auth, async (req, res) => {
  try {
    const { filePath, includeContext } = req.body;

    if (!filePath) {
      return res.status(400).json({
        success: false,
        message: 'File path is required'
      });
    }

    let result;
    
    if (includeContext) {
      const patientContext = {
        age: req.body.age,
        gender: req.body.gender,
        medicalHistory: req.body.medicalHistory
      };
      result = await analyzeMedicalReportWithContext(filePath, patientContext);
    } else {
      result = await analyzeMedicalReport(filePath);
    }
    
    res.json({
      success: true,
      data: result,
      message: 'Existing medical report analyzed successfully'
    });

  } catch (error) {
    console.error('Error in analyze-existing-report route:', error);
    
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to analyze existing medical report'
    });
  }
});

module.exports = router;
