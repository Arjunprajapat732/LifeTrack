const express = require('express');
const router = express.Router();
const { auth } = require('../middlewares/auth');
const {
  updateStatus,
  getLatestStatus,
  getStatusHistory,
  getAllPatientsStatus
} = require('../controllers/patientStatusController');

// All routes require authentication
router.use(auth);

// Update patient status (demo API - called every 5 seconds)
router.put('/update/:patientId', updateStatus);

// Get latest patient status
router.get('/latest/:patientId', getLatestStatus);

// Get patient status history
router.get('/history/:patientId', getStatusHistory);

// Get all patients status (for caregivers)
router.get('/all-patients', getAllPatientsStatus);

module.exports = router;
