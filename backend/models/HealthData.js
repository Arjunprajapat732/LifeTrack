const mongoose = require('mongoose');

const healthDataSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  body_measurements: {
    height_cm: Number,
    weight_kg: Number,
    body_mass_index: Number,
    body_fat_percentage: Number,
    lean_body_mass_kg: Number,
    waist_circumference_cm: Number
  },
  vitals: {
    heart_rate_bpm: Number,
    resting_heart_rate_bpm: Number,
    walking_heart_rate_bpm: Number,
    heart_rate_variability_ms: Number,
    respiratory_rate_bpm: Number,
    oxygen_saturation_percentage: Number,
    body_temperature_celsius: Number,
    skin_temperature_celsius: Number,
    electrodermal_activity: Number
  },
  blood_pressure: {
    systolic_mmHg: Number,
    diastolic_mmHg: Number
  },
  activity: {
    steps: Number,
    flights_climbed: Number,
    distance_walked_km: Number,
    active_energy_burned_kcal: Number,
    basal_energy_burned_kcal: Number,
    exercise_minutes: Number,
    stand_hours: Number
  },
  sleep: {
    sleep_duration_minutes: Number,
    sleep_start: Date,
    sleep_end: Date,
    sleep_stages: {
      awake_minutes: Number,
      light_sleep_minutes: Number,
      deep_sleep_minutes: Number,
      rem_sleep_minutes: Number
    }
  },
  mindfulness: {
    sessions: Number,
    total_minutes: Number
  },
  menstrual_cycle: {
    cycle_day: Number,
    symptoms: [String],
    flow: {
      type: String,
      enum: ['light', 'medium', 'heavy', 'spotting']
    }
  },
  environmental: {
    noise_exposure_dbA: Number
  },
  electrocardiogram: {
    ecg_classification: {
      type: String,
      enum: ['sinus_rhythm', 'atrial_fibrillation', 'bradycardia', 'tachycardia', 'normal']
    },
    average_heart_rate_bpm: Number,
    measurement_time: Date
  }
}, {
  timestamps: true
});

// Index for efficient queries
healthDataSchema.index({ user_id: 1, timestamp: -1 });
healthDataSchema.index({ user_id: 1, createdAt: -1 });

module.exports = mongoose.model('HealthData', healthDataSchema);
