const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  caregiverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  reportType: {
    type: String,
    enum: ['lab_report', 'imaging', 'prescription', 'discharge_summary', 'progress_note', 'other'],
    default: 'other'
  },
  fileUrl: {
    type: String,
    required: true
  },
  fileName: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number
  },
  fileType: {
    type: String
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  tags: [String],
  status: {
    type: String,
    enum: ['pending', 'reviewed', 'approved', 'rejected'],
    default: 'pending'
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewNotes: String,
  reviewDate: Date,
  ai_describe: {
    type: String,
    default: null
  },
  ai_analysis_status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending'
  },
  ai_analysis_date: Date
}, {
  timestamps: true
});

// Index for efficient queries
reportSchema.index({ patientId: 1, createdAt: -1 });
reportSchema.index({ caregiverId: 1, createdAt: -1 });
reportSchema.index({ reportType: 1 });
reportSchema.index({ status: 1 });

module.exports = mongoose.model('Report', reportSchema);
