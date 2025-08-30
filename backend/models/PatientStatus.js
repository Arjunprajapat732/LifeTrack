const mongoose = require('mongoose');

const patientStatusSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  vitalSigns: {
    bloodPressure: {
      systolic: Number,
      diastolic: Number,
      unit: { type: String, default: 'mmHg' }
    },
    heartRate: {
      value: Number,
      unit: { type: String, default: 'bpm' }
    },
    temperature: {
      value: Number,
      unit: { type: String, default: '°F' }
    },
    weight: {
      value: Number,
      unit: { type: String, default: 'lbs' }
    },
    bloodSugar: {
      value: Number,
      unit: { type: String, default: 'mg/dL' }
    }
  },
  healthScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 85
  },
  symptoms: [{
    name: String,
    severity: {
      type: String,
      enum: ['mild', 'moderate', 'severe'],
      default: 'mild'
    },
    description: String
  }],
  medicationStatus: [{
    medicationName: String,
    taken: { type: Boolean, default: false },
    scheduledTime: Date,
    actualTime: Date
  }],
  notes: String,
  status: {
    type: String,
    enum: ['stable', 'improving', 'declining', 'critical'],
    default: 'stable'
  }
}, {
  timestamps: true
});

// Index for efficient queries
patientStatusSchema.index({ patientId: 1, createdAt: -1 });

module.exports = mongoose.model('PatientStatus', patientStatusSchema);
