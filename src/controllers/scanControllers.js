const HealthData = require('../models/scanResult'); // Using the HealthData model
const mongoose = require('mongoose');

// This controller now handles saving scan data, fetching history, and getting a single scan.
class HealthDataController {
  async saveHealthData(req, res, next) {
    try {
      // The 'upload' middleware provides req.files and req.body
      if (!req.files || !req.files.video || !req.files.video[0]) {
        return res.status(400).json({ message: 'Video file is required.' });
      }

      const {
        userId,
        profileId, // Assuming frontend sends this
        predictions, // Raw JSON from AI model
        heartRate,
        bloodPressureSystolic,
        bloodPressureDiastolic,
        oxygenSaturation,
        stressLevel,
        scanDuration,
        scanQuality,
        // Assuming environmentFactors and analysis are nested in predictions or sent separately
      } = req.body;

      // --- Basic Validation ---
      if (!userId || !profileId) {
        return res.status(400).json({ message: 'User ID and Profile ID are required.' });
      }
      if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(profileId)) {
          return res.status(400).json({ message: 'Invalid User ID or Profile ID format.' });
      }
      if (!predictions) {
        return res.status(400).json({ message: 'AI predictions data is required.' });
      }

      // --- File Paths ---
      const videoPath = req.files.video[0].path;
      const framePaths = req.files.frames ? req.files.frames.map(file => file.path) : [];
      
      let parsedPredictions = {};
      try {
          parsedPredictions = JSON.parse(predictions);
      } catch (e) {
          return res.status(400).json({ message: 'Invalid predictions JSON format.'});
      }

      // --- Create New Scan Document ---
      const newScanResult = new HealthData({
        userId,
        profileId,
        videoPath,
        framePaths,
        
        // Vitals from request body
        heartRate: parseFloat(heartRate) || null,
        bloodPressureSystolic: parseFloat(bloodPressureSystolic) || null,
        bloodPressureDiastolic: parseFloat(bloodPressureDiastolic) || null,
        oxygenSaturation: parseFloat(oxygenSaturation) || null,
        stressIndex: parseFloat(stressLevel) || null, // Mapping stressLevel to stressIndex

        // Metadata from request body
        scanDuration: parseInt(scanDuration) || 30,
        scanQuality: scanQuality || 'good',

        // Complex objects can be extracted from the main predictions object
        // This assumes the AI service provides these keys
        healthIndicators: parsedPredictions.healthIndicators || {},
        faceFeatures: parsedPredictions.faceFeatures || {},
        environmentFactors: parsedPredictions.environmentFactors || {},
        analysis: parsedPredictions.analysis || {},

        timestamp: new Date(),
      });

      await newScanResult.save();

      res.status(201).json({
        message: 'Scan completed and saved successfully',
        result: newScanResult,
      });

    } catch (error) {
      next(error); // Pass error to the global error handler
    }
  }

  /**
   * Get a paginated history of scans for the logged-in user.
   */
  async getScanHistory(req, res, next) {
    try {
      const { userId } = req.user; // From auth middleware
      const { limit = 10, page = 1 } = req.query;
      const skip = (parseInt(page) - 1) * parseInt(limit);

      const scanResults = await HealthData.find({ userId })
        .sort({ timestamp: -1 })
        .limit(parseInt(limit))
        .skip(skip);
        // .populate('profileId', 'nickname'); // Can be added back if Profile model is used

      const total = await HealthData.countDocuments({ userId });

      res.status(200).json({
        results: scanResults,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / limit),
        },
      });

    } catch (error) {
      next(error);
    }
  }

  /**
   * Get a single scan result by its ID.
   */
  async getScanById(req, res, next) {
    try {
      const { userId } = req.user; // From auth middleware
      const { scanId } = req.params;

      if (!mongoose.Types.ObjectId.isValid(scanId)) {
        return res.status(400).json({ message: 'Invalid Scan ID format.' });
      }

      const scanResult = await HealthData.findOne({ _id: scanId, userId });
      // .populate('profileId'); // Can be added back if Profile model is used

      if (!scanResult) {
        return res.status(404).json({ message: 'Scan result not found' });
      }

      res.status(200).json({ result: scanResult });

    } catch (error) {
      next(error);
    }
  }
}

module.exports = new HealthDataController();

