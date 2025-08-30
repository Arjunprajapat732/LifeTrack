const PatientStatus = require('../models/PatientStatus');
const User = require('../models/User');

// Generate demo data for patient status
const generateDemoStatus = (patientId) => {
  const statuses = ['stable', 'improving', 'declining', 'critical'];
  const symptoms = [
    { name: 'Fatigue', severity: 'mild' },
    { name: 'Headache', severity: 'moderate' },
    { name: 'Nausea', severity: 'mild' },
    { name: 'Dizziness', severity: 'moderate' }
  ];

  return {
    patientId,
    vitalSigns: {
      bloodPressure: {
        systolic: Math.floor(Math.random() * 40) + 110, // 110-150
        diastolic: Math.floor(Math.random() * 20) + 70, // 70-90
        unit: 'mmHg'
      },
      heartRate: {
        value: Math.floor(Math.random() * 30) + 60, // 60-90
        unit: 'bpm'
      },
      temperature: {
        value: (Math.random() * 2 + 97.5).toFixed(1), // 97.5-99.5
        unit: '°F'
      },
      weight: {
        value: Math.floor(Math.random() * 20) + 150, // 150-170
        unit: 'lbs'
      },
      bloodSugar: {
        value: Math.floor(Math.random() * 100) + 80, // 80-180
        unit: 'mg/dL'
      }
    },
    healthScore: Math.floor(Math.random() * 30) + 70, // 70-100
    symptoms: symptoms.slice(0, Math.floor(Math.random() * 3) + 1),
    medicationStatus: [
      {
        medicationName: 'Metformin 500mg',
        taken: Math.random() > 0.3,
        scheduledTime: new Date(),
        actualTime: Math.random() > 0.3 ? new Date() : null
      },
      {
        medicationName: 'Lisinopril 10mg',
        taken: Math.random() > 0.2,
        scheduledTime: new Date(),
        actualTime: Math.random() > 0.2 ? new Date() : null
      }
    ],
    notes: Math.random() > 0.5 ? 'Patient feeling better today' : '',
    status: statuses[Math.floor(Math.random() * statuses.length)]
  };
};

// Update patient status (demo API - called every 5 seconds)
exports.updateStatus = async (req, res) => {
  try {
    const { patientId } = req.params;
    const userId = req.user.id;

    // Verify the user is updating their own status or is a caregiver
    if (req.user.role !== 'caregiver' && userId !== patientId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this patient status'
      });
    }

    // Generate demo status data
    const statusData = generateDemoStatus(patientId);
    
    // Create new status entry
    const newStatus = new PatientStatus(statusData);
    await newStatus.save();

    res.status(200).json({
      success: true,
      message: 'Patient status updated successfully',
      data: {
        status: newStatus
      }
    });
  } catch (error) {
    console.error('Error updating patient status:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating patient status',
      error: error.message
    });
  }
};

// Get latest patient status
exports.getLatestStatus = async (req, res) => {
  try {
    const { patientId } = req.params;
    const userId = req.user.id;

    // Verify the user can view this patient's status
    if (req.user.role !== 'caregiver' && userId !== patientId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this patient status'
      });
    }

    const latestStatus = await PatientStatus.findOne({ patientId })
      .sort({ createdAt: -1 })
      .populate('patientId', 'firstName lastName email');

    if (!latestStatus) {
      // Generate initial demo status if none exists
      const statusData = generateDemoStatus(patientId);
      const newStatus = new PatientStatus(statusData);
      await newStatus.save();
      
      return res.status(200).json({
        success: true,
        data: {
          status: newStatus
        }
      });
    }

    res.status(200).json({
      success: true,
      data: {
        status: latestStatus
      }
    });
  } catch (error) {
    console.error('Error getting patient status:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving patient status',
      error: error.message
    });
  }
};

// Get patient status history
exports.getStatusHistory = async (req, res) => {
  try {
    const { patientId } = req.params;
    const { limit = 10, page = 1 } = req.query;
    const userId = req.user.id;

    // Verify the user can view this patient's status
    if (req.user.role !== 'caregiver' && userId !== patientId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this patient status'
      });
    }

    const skip = (page - 1) * limit;

    const statusHistory = await PatientStatus.find({ patientId })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip)
      .populate('patientId', 'firstName lastName email');

    const total = await PatientStatus.countDocuments({ patientId });

    res.status(200).json({
      success: true,
      data: {
        statusHistory,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Error getting patient status history:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving patient status history',
      error: error.message
    });
  }
};

// Get all patients status (for caregivers)
exports.getAllPatientsStatus = async (req, res) => {
  try {
    if (req.user.role !== 'caregiver') {
      return res.status(403).json({
        success: false,
        message: 'Only caregivers can view all patients status'
      });
    }

  // Get only patients for this caregiver
  const patients = await User.find({ role: 'patient', caregiverId: req.user.id });
    
    // Get latest status for each patient
    const patientsWithStatus = await Promise.all(
      patients.map(async (patient) => {
        const latestStatus = await PatientStatus.findOne({ patientId: patient._id })
          .sort({ createdAt: -1 });
        
        return {
          patient: {
            _id: patient._id,
            firstName: patient.firstName,
            lastName: patient.lastName,
            email: patient.email,
            phone: patient.phone
          },
          latestStatus: latestStatus || generateDemoStatus(patient._id)
        };
      })
    );

    res.status(200).json({
      success: true,
      data: {
        patients: patientsWithStatus
      }
    });
  } catch (error) {
    console.error('Error getting all patients status:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving patients status',
      error: error.message
    });
  }
};
