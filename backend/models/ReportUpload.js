const mongoose = require('mongoose');

const reportUploadSchema = new mongoose.Schema({
  // File upload information
  originalName: {
    type: String,
    required: true
  },
  filename: {
    type: String,
    required: true
  },
  filePath: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  mimeType: {
    type: String,
    required: true
  },
  
  // Report metadata
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
  
  // User information
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Upload status and processing
  uploadStatus: {
    type: String,
    enum: ['uploading', 'completed', 'failed', 'processing'],
    default: 'uploading'
  },
  uploadProgress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  
  // File validation
  isValidFile: {
    type: Boolean,
    default: false
  },
  validationErrors: [String],
  
  // Security and access
  isPublic: {
    type: Boolean,
    default: false
  },
  accessLevel: {
    type: String,
    enum: ['private', 'patient_only', 'caregiver', 'public'],
    default: 'private'
  },
  
  // Tags and categorization
  tags: [String],
  category: {
    type: String,
    enum: ['medical', 'administrative', 'billing', 'legal', 'other'],
    default: 'medical'
  },
  
  // Processing information
  processingStartedAt: Date,
  processingCompletedAt: Date,
  processingDuration: Number, // in milliseconds
  
  // Error handling
  errorMessage: String,
  retryCount: {
    type: Number,
    default: 0
  },
  maxRetries: {
    type: Number,
    default: 3
  },
  
  // AI Analysis fields
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

// Indexes for efficient queries
reportUploadSchema.index({ patientId: 1, createdAt: -1 });
reportUploadSchema.index({ uploadStatus: 1 });
reportUploadSchema.index({ reportType: 1 });
reportUploadSchema.index({ uploadedBy: 1 });
reportUploadSchema.index({ filename: 1 });

// Virtual for file extension
reportUploadSchema.virtual('fileExtension').get(function() {
  return this.originalName ? this.originalName.split('.').pop().toLowerCase() : '';
});

// Virtual for formatted file size
reportUploadSchema.virtual('formattedFileSize').get(function() {
  if (!this.fileSize) return '0 B';
  
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(this.fileSize) / Math.log(1024));
  return Math.round(this.fileSize / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
});

// Virtual for upload duration
reportUploadSchema.virtual('uploadDuration').get(function() {
  if (!this.processingStartedAt || !this.processingCompletedAt) return null;
  return this.processingCompletedAt - this.processingStartedAt;
});

// Pre-save middleware to set processing start time
reportUploadSchema.pre('save', function(next) {
  if (this.isNew && this.uploadStatus === 'uploading') {
    this.processingStartedAt = new Date();
  }
  next();
});

// Method to mark upload as completed
reportUploadSchema.methods.markCompleted = function() {
  this.uploadStatus = 'completed';
  this.uploadProgress = 100;
  this.processingCompletedAt = new Date();
  this.processingDuration = this.processingCompletedAt - this.processingStartedAt;
  return this.save();
};

// Method to mark upload as failed
reportUploadSchema.methods.markFailed = function(errorMessage) {
  this.uploadStatus = 'failed';
  this.errorMessage = errorMessage;
  this.processingCompletedAt = new Date();
  return this.save();
};

// Method to retry upload
reportUploadSchema.methods.retry = function() {
  if (this.retryCount < this.maxRetries) {
    this.retryCount += 1;
    this.uploadStatus = 'uploading';
    this.uploadProgress = 0;
    this.errorMessage = '';
    this.processingStartedAt = new Date();
    this.processingCompletedAt = null;
    return this.save();
  }
  throw new Error('Max retries exceeded');
};

// Static method to get uploads by status
reportUploadSchema.statics.findByStatus = function(status) {
  return this.find({ uploadStatus: status });
};

// Static method to get uploads by patient
reportUploadSchema.statics.findByPatient = function(patientId) {
  return this.find({ patientId }).sort({ createdAt: -1 });
};

// Static method to get failed uploads
reportUploadSchema.statics.findFailed = function() {
  return this.find({ uploadStatus: 'failed' });
};

// Static method to get uploads that need retry
reportUploadSchema.statics.findNeedsRetry = function() {
  return this.find({
    uploadStatus: 'failed',
    retryCount: { $lt: '$maxRetries' }
  });
};

module.exports = mongoose.model('ReportUpload', reportUploadSchema);
