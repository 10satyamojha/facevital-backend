const mongoose = require('mongoose');

// This schema defines the structure for a single health scan result,
// including vitals, metadata, and file paths for the recorded media.
const healthDataSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Assuming you have a User model
    required: true,
  },
  profileId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Profile', // Assuming you have a Profile model
    required: true,
  },

  // File paths for the recorded scan
  videoPath: {
    type: String, // Path to the stored video file
    required: true,
  },
  framePaths: {
    type: [String], // Array of paths to stored frame images
    default: [],
  },

  // AI Model Vitals Results
  heartRate: Number,
  temperature: Number,
  breathingRate: Number,
  bloodPressureSystolic: Number,
  bloodPressureDiastolic: Number,
  stressIndex: {
    type: Number,
    min: 1,
    max: 5,
  },
  oxygenSaturation: Number,
  
  // Additional AI Analysis Results
  faceFeatures: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  },
  healthIndicators: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  },
  
  // Scan Metadata
  scanDuration: Number, // in seconds
  scanQuality: {
    type: String,
    enum: ['excellent', 'good', 'fair', 'poor'],
  },
  environmentFactors: {
    lighting: String,
    facePosition: String,
    stability: Number, // e.g., a percentage
  },
  
  // Final Analysis and Recommendations
  analysis: {
    status: {
      type: String,
      enum: ['normal', 'attention_needed', 'consult_doctor'],
    },
    recommendations: [String],
    alerts: [String],
  },
  
  timestamp: {
    type: Date,
    default: Date.now,
  }
}, {
  // Add createdAt and updatedAt timestamps automatically
  timestamps: true 
});

// The model is now named 'HealthData' to align with the file's purpose.
module.exports = mongoose.model('HealthData', healthDataSchema);

