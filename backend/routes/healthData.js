const express = require('express');
const router = express.Router();
const { auth } = require('../middlewares/auth');
const {
  updateHealthData,
  getLatestHealthData,
  getHealthDataHistory,
  getAllPatientsHealthData
} = require('../controllers/healthDataController');

// All routes require authentication
router.use(auth);

// Update health data (creates new health record)
router.put('/update/:patientId', updateHealthData);

// Get latest health data
router.get('/latest/:patientId', getLatestHealthData);

// Get health data history
router.get('/history/:patientId', getHealthDataHistory);

// Get all patients health data (for caregivers)
router.get('/all-patients', getAllPatientsHealthData);

module.exports = router;
