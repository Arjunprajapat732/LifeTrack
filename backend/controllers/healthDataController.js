const HealthData = require('../models/HealthData');
const User = require('../models/User');

// Generate random health data based on the provided JSON structure
const generateRandomHealthData = (userId) => {
  const now = new Date();
  const sleepStart = new Date(now);
  sleepStart.setHours(22, 30, 0, 0); // 10:30 PM
  const sleepEnd = new Date(now);
  sleepEnd.setHours(5, 30, 0, 0); // 5:30 AM
  sleepEnd.setDate(sleepEnd.getDate() + 1); // Next day

  return {
    user_id: userId,
    timestamp: now,
    body_measurements: {
      height_cm: Math.floor(Math.random() * 30) + 160, // 160-190 cm
      weight_kg: (Math.random() * 30 + 60).toFixed(1), // 60-90 kg
      body_mass_index: (Math.random() * 10 + 20).toFixed(1), // 20-30 BMI
      body_fat_percentage: (Math.random() * 15 + 10).toFixed(1), // 10-25%
      lean_body_mass_kg: (Math.random() * 20 + 50).toFixed(1), // 50-70 kg
      waist_circumference_cm: Math.floor(Math.random() * 20) + 75 // 75-95 cm
    },
    vitals: {
      heart_rate_bpm: Math.floor(Math.random() * 30) + 60, // 60-90 bpm
      resting_heart_rate_bpm: Math.floor(Math.random() * 20) + 55, // 55-75 bpm
      walking_heart_rate_bpm: Math.floor(Math.random() * 25) + 70, // 70-95 bpm
      heart_rate_variability_ms: Math.floor(Math.random() * 50) + 30, // 30-80 ms
      respiratory_rate_bpm: Math.floor(Math.random() * 8) + 12, // 12-20 bpm
      oxygen_saturation_percentage: Math.floor(Math.random() * 5) + 95, // 95-100%
      body_temperature_celsius: (Math.random() * 2 + 36.0).toFixed(1), // 36.0-38.0°C
      skin_temperature_celsius: (Math.random() * 5 + 30.0).toFixed(1), // 30.0-35.0°C
      electrodermal_activity: (Math.random() * 0.1).toFixed(3) // 0.000-0.100
    },
    blood_pressure: {
      systolic_mmHg: Math.floor(Math.random() * 40) + 110, // 110-150 mmHg
      diastolic_mmHg: Math.floor(Math.random() * 20) + 70 // 70-90 mmHg
    },
    activity: {
      steps: Math.floor(Math.random() * 8000) + 5000, // 5000-13000 steps
      flights_climbed: Math.floor(Math.random() * 20) + 5, // 5-25 flights
      distance_walked_km: (Math.random() * 5 + 5).toFixed(1), // 5-10 km
      active_energy_burned_kcal: Math.floor(Math.random() * 400) + 300, // 300-700 kcal
      basal_energy_burned_kcal: Math.floor(Math.random() * 400) + 1400, // 1400-1800 kcal
      exercise_minutes: Math.floor(Math.random() * 60) + 30, // 30-90 minutes
      stand_hours: Math.floor(Math.random() * 6) + 8 // 8-14 hours
    },
    sleep: {
      sleep_duration_minutes: Math.floor(Math.random() * 120) + 360, // 360-480 minutes (6-8 hours)
      sleep_start: sleepStart,
      sleep_end: sleepEnd,
      sleep_stages: {
        awake_minutes: Math.floor(Math.random() * 30) + 15, // 15-45 minutes
        light_sleep_minutes: Math.floor(Math.random() * 120) + 180, // 180-300 minutes
        deep_sleep_minutes: Math.floor(Math.random() * 60) + 60, // 60-120 minutes
        rem_sleep_minutes: Math.floor(Math.random() * 60) + 40 // 40-100 minutes
      }
    },
    mindfulness: {
      sessions: Math.floor(Math.random() * 3) + 1, // 1-3 sessions
      total_minutes: Math.floor(Math.random() * 20) + 5 // 5-25 minutes
    },
    menstrual_cycle: {
      cycle_day: Math.floor(Math.random() * 28) + 1, // 1-28 days
      symptoms: ['cramps', 'fatigue', 'mood_swings'].slice(0, Math.floor(Math.random() * 3) + 1),
      flow: ['light', 'medium', 'heavy', 'spotting'][Math.floor(Math.random() * 4)]
    },
    environmental: {
      noise_exposure_dbA: (Math.random() * 20 + 55).toFixed(1) // 55-75 dB
    },
    electrocardiogram: {
      ecg_classification: ['sinus_rhythm', 'normal'][Math.floor(Math.random() * 2)],
      average_heart_rate_bpm: Math.floor(Math.random() * 30) + 60, // 60-90 bpm
      measurement_time: new Date(now.getTime() - Math.random() * 24 * 60 * 60 * 1000) // Within last 24 hours
    }
  };
};

// Update health data (creates new health record)
exports.updateHealthData = async (req, res) => {
  try {
    const { patientId } = req.params;
    const userId = req.user.id;

    // Verify the user is updating their own health data or is a caregiver
    if (req.user.role !== 'caregiver' && userId !== patientId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this patient health data'
      });
    }

    // Generate random health data
    const healthData = generateRandomHealthData(patientId);
    
    // Create new health data entry
    const newHealthData = new HealthData(healthData);
    await newHealthData.save();

    res.status(200).json({
      success: true,
      message: 'Health data updated successfully',
      data: {
        healthData: newHealthData
      }
    });
  } catch (error) {
    console.error('Error updating health data:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating health data',
      error: error.message
    });
  }
};

// Get latest health data
exports.getLatestHealthData = async (req, res) => {
  try {
    const { patientId } = req.params;
    const userId = req.user.id;

    // Verify the user can view this patient's health data
    if (req.user.role !== 'caregiver' && userId !== patientId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this patient health data'
      });
    }

    const latestHealthData = await HealthData.findOne({ user_id: patientId })
      .sort({ timestamp: -1 })
      .populate('user_id', 'firstName lastName email');

    if (!latestHealthData) {
      // Generate initial health data if none exists
      const healthData = generateRandomHealthData(patientId);
      const newHealthData = new HealthData(healthData);
      await newHealthData.save();
      
      return res.status(200).json({
        success: true,
        data: {
          healthData: newHealthData
        }
      });
    }

    res.status(200).json({
      success: true,
      data: {
        healthData: latestHealthData
      }
    });
  } catch (error) {
    console.error('Error getting health data:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving health data',
      error: error.message
    });
  }
};

// Get health data history
exports.getHealthDataHistory = async (req, res) => {
  try {
    const { patientId } = req.params;
    const { limit = 10, page = 1 } = req.query;
    const userId = req.user.id;

    // Verify the user can view this patient's health data
    if (req.user.role !== 'caregiver' && userId !== patientId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this patient health data'
      });
    }

    const skip = (page - 1) * limit;

    const healthDataHistory = await HealthData.find({ user_id: patientId })
      .sort({ timestamp: -1 })
      .limit(parseInt(limit))
      .skip(skip)
      .populate('user_id', 'firstName lastName email');

    const total = await HealthData.countDocuments({ user_id: patientId });

    res.status(200).json({
      success: true,
      data: {
        healthDataHistory,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Error getting health data history:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving health data history',
      error: error.message
    });
  }
};

// Get all patients health data (for caregivers)
exports.getAllPatientsHealthData = async (req, res) => {
  try {
    if (req.user.role !== 'caregiver') {
      return res.status(403).json({
        success: false,
        message: 'Only caregivers can view all patients health data'
      });
    }

    // Get only patients for this caregiver
    const patients = await User.find({ role: 'patient', caregiverId: req.user.id });
    
    // Get latest health data for each patient
    const patientsWithHealthData = await Promise.all(
      patients.map(async (patient) => {
        const latestHealthData = await HealthData.findOne({ user_id: patient._id })
          .sort({ timestamp: -1 });
        
        return {
          patient: {
            _id: patient._id,
            firstName: patient.firstName,
            lastName: patient.lastName,
            email: patient.email,
            phone: patient.phone
          },
          latestHealthData: latestHealthData || generateRandomHealthData(patient._id)
        };
      })
    );

    res.status(200).json({
      success: true,
      data: {
        patients: patientsWithHealthData
      }
    });
  } catch (error) {
    console.error('Error getting all patients health data:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving patients health data',
      error: error.message
    });
  }
};
