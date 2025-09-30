const Profile = require('../models/profile');
const User = require('../models/user');

class ProfileController {
  async createOrUpdateProfile(req, res, next) {
    try {
      const userId = req.user.userId; // Set via auth middleware

      const {
        firstName = '',
        lastName = '',
        email = '',
        phone = '',
        dateOfBirth = '',
        gender = '',
        height = '',
        weight = '',
        unit = 'metric',
        bloodType = '',
        allergies = [],
        medications = [],
        emergencyContact = {},
        activityLevel = 'moderate',
      } = req.body;

      // Basic validation example
      if (!firstName || !lastName || !email || !dateOfBirth || !gender || !height || !weight) {
        return res.status(400).json({
          message: 'Required profile fields are missing',
          received: req.body,
        });
      }

      // Validate age via dateOfBirth -> calculate age
      const birthDate = new Date(dateOfBirth);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      if (age < 18) {
        return res.status(400).json({ message: 'User must be at least 18 years old' });
      }

      // Find existing profile
      let profile = await Profile.findOne({ userId });

      if (profile) {
        // Update existing profile
        Object.assign(profile, {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim(),
          phone: phone.trim(),
          dateOfBirth,
          sex: gender.toLowerCase(),
          height,
          weight,
          unit: unit.toLowerCase(),
          bloodGroup: bloodType,
          allergies,
          medications,
          emergencyContact,
          activityLevel,
          updatedAt: new Date(),
        });
      } else {
        // Create new profile
        profile = new Profile({
          userId,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim(),
          phone: phone.trim(),
          dateOfBirth,
          sex: gender.toLowerCase(),
          height,
          weight,
          unit: unit.toLowerCase(),
          bloodGroup: bloodType,
          allergies,
          medications,
          emergencyContact,
          activityLevel,
        });
      }

      await profile.save();

      res.status(200).json({
        success: true,
        message: profile.isNew ? 'Profile created successfully' : 'Profile updated successfully',
        profile: {
          id: profile._id,
          firstName: profile.firstName,
          lastName: profile.lastName,
          email: profile.email,
          phone: profile.phone,
          dateOfBirth: profile.dateOfBirth,
          sex: profile.sex,
          height: profile.height,
          weight: profile.weight,
          unit: profile.unit,
          bloodGroup: profile.bloodGroup,
          allergies: profile.allergies,
          medications: profile.medications,
          emergencyContact: profile.emergencyContact,
          activityLevel: profile.activityLevel,
          bmi: profile.bmi,
          bmiCategory: profile.bmiCategory,
          createdAt: profile.createdAt,
          updatedAt: profile.updatedAt,
        },
        userId: profile.userId,
      });
    } catch (error) {
      console.error('Profile creation/update error:', error);
      res.status(500).json({
        message: 'Server error while saving profile',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
      });
    }
  }

  async getProfile(req, res, next) {
    try {
      const userId = req.user.userId;
      const user = await User.findById(userId).select('-password -verificationToken -resetPasswordToken');
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      const profile = await Profile.findOne({ userId });

      res.status(200).json({
        success: true,
        user: {
          id: user._id,
          email: user.email,
          userName: user.userName,
          isVerified: user.isVerified,
          createdAt: user.createdAt,
        },
        profile: profile ? {
          id: profile._id,
          firstName: profile.firstName,
          lastName: profile.lastName,
          email: profile.email,
          phone: profile.phone,
          dateOfBirth: profile.dateOfBirth,
          sex: profile.sex,
          height: profile.height,
          weight: profile.weight,
          unit: profile.unit,
          bloodGroup: profile.bloodGroup,
          allergies: profile.allergies,
          medications: profile.medications,
          emergencyContact: profile.emergencyContact,
          activityLevel: profile.activityLevel,
          bmi: profile.bmi,
          bmiCategory: profile.bmiCategory,
          createdAt: profile.createdAt,
          updatedAt: profile.updatedAt,
        } : null,
      });
    } catch (error) {
      console.error('Profile fetch error:', error);
      res.status(500).json({
        message: 'Server error while fetching profile',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
      });
    }
  }

  async checkProfileExists(req, res, next) {
    try {
      const userId = req.user.userId;
      const profile = await Profile.findOne({ userId });
      res.status(200).json({
        success: true,
        hasProfile: !!profile,
        profile: profile ? {
          id: profile._id,
          firstName: profile.firstName,
          lastName: profile.lastName,
          email: profile.email,
          phone: profile.phone,
          dateOfBirth: profile.dateOfBirth,
          sex: profile.sex,
          height: profile.height,
          weight: profile.weight,
          unit: profile.unit,
          bloodGroup: profile.bloodGroup,
          allergies: profile.allergies,
          medications: profile.medications,
          emergencyContact: profile.emergencyContact,
          activityLevel: profile.activityLevel,
          bmi: profile.bmi,
          bmiCategory: profile.bmiCategory,
          createdAt: profile.createdAt,
          updatedAt: profile.updatedAt,
        } : null
      });
    } catch (error) {
      console.error('Profile check error:', error);
      res.status(500).json({
        message: 'Server error while checking profile',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
      });
    }
  }

  async deleteProfile(req, res, next) {
    try {
      const userId = req.user.userId;
      const profile = await Profile.findOneAndDelete({ userId });
      if (!profile) {
        return res.status(404).json({ message: 'Profile not found' });
      }
      res.status(200).json({
        success: true,
        message: 'Profile deleted successfully'
      });
    } catch (error) {
      console.error('Profile deletion error:', error);
      res.status(500).json({
        message: 'Server error while deleting profile',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
      });
    }
  }

  async getpage(req, res, next) {
    try {
      // Build HTML content using string concatenation to avoid template literal conflicts
      let htmlContent = '<!DOCTYPE html>\n';
      htmlContent += '<html lang="en">\n';
      htmlContent += '<head>\n';
      htmlContent += '    <meta charset="UTF-8">\n';
      htmlContent += '    <meta name="viewport" content="width=device-width, initial-scale=1.0">\n';
      htmlContent += '    <title>Health Vitals Scanner</title>\n';
      htmlContent += '    <script src="https://cdnjs.cloudflare.com/ajax/libs/axios/1.4.0/axios.min.js"></script>\n';
      htmlContent += '    <style>\n';
      htmlContent += '        :root {\n';
      htmlContent += '            --PrimaryColor: #5eaa3c; --HoverColor: #4a8530; --paleGreen: #f0f8eb;\n';
      htmlContent += '            --whiteColor: #ffffff; --blackColor: #2c3e50; --greyText: #718096;\n';
      htmlContent += '            --textColor: #64748b; --bgColor: #f8fafc; --inputColor: #f1f5f9;\n';
      htmlContent += '            --itemCardHover: #e2e8f0; --successColor: #10b981; --warningColor: #f59e0b;\n';
      htmlContent += '            --h1FontSize: 2rem; --h2FontSize: 1.5rem; --h3FontSize: 1.25rem;\n';
      htmlContent += '            --normalFontSize: 1rem; --smallFontSize: 0.875rem; --smallestFontSize: 0.75rem;\n';
      htmlContent += '        }\n';
      htmlContent += '        * { box-sizing: border-box; margin: 0; padding: 0; }\n';
      htmlContent += '        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif; background: var(--bgColor); min-height: 100vh; }\n';
      htmlContent += '        .cameraSection { min-height: 100vh; background: var(--bgColor); padding: 1.5rem; }\n';
      htmlContent += '        .cameraHeader { background: var(--whiteColor); padding: 2rem; border-radius: 16px; margin-bottom: 2rem; box-shadow: 0 4px 20px rgba(0,0,0,0.08); text-align: center; }\n';
      htmlContent += '        .cameraHeader h1 { font-size: var(--h1FontSize); color: var(--blackColor); font-weight: 700; margin-bottom: 0.5rem; display: flex; align-items: center; gap: 0.5rem; justify-content: center; }\n';
      htmlContent += '        .cameraHeader p { font-size: var(--normalFontSize); color: var(--textColor); margin: 0; }\n';
      htmlContent += '        .cameraContainer { background: var(--whiteColor); border-radius: 16px; padding: 2rem; box-shadow: 0 4px 20px rgba(0,0,0,0.08); margin-bottom: 2rem; display: flex; flex-direction: column; align-items: center; gap: 2rem; }\n';
      htmlContent += '        .cameraWrapper { position: relative; display: inline-block; }\n';
      htmlContent += '        .errorState { background: var(--inputColor); border-radius: 16px; padding: 4rem 2rem; text-align: center; border: 2px dashed var(--greyText); width: 384px; height: 518px; display: flex; flex-direction: column; align-items: center; justify-content: center; }\n';
      htmlContent += '        .errorIcon { color: #ff4757; margin-bottom: 1rem; font-size: 4rem; }\n';
      htmlContent += '        .errorText { font-size: var(--normalFontSize); color: var(--textColor); margin-bottom: 1.5rem; }\n';
      htmlContent += '        .controlsGrid { display: flex; gap: 1rem; flex-wrap: wrap; justify-content: center; }\n';
      htmlContent += '        .controlBtn { background: var(--PrimaryColor); color: var(--whiteColor); border: none; padding: 0.875rem 1.75rem; border-radius: 8px; font-size: var(--normalFontSize); font-weight: 600; cursor: pointer; transition: all 0.3s ease; display: flex; align-items: center; gap: 0.75rem; min-width: 160px; justify-content: center; }\n';
      htmlContent += '        .controlBtn:hover { background: var(--HoverColor); transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0,0,0,0.15); }\n';
      htmlContent += '        .controlBtn:disabled { background: var(--greyText); cursor: not-allowed; transform: none; box-shadow: none; }\n';
      htmlContent += '        .controlBtn.secondary { background: var(--inputColor); color: var(--blackColor); border: 2px solid var(--itemCardHover); }\n';
      htmlContent += '        .controlBtn.secondary:hover { background: var(--itemCardHover); border-color: var(--greyText); }\n';
      htmlContent += '        .controlBtn.danger { background: #ff4757; color: var(--whiteColor); }\n';
      htmlContent += '        .controlBtn.danger:hover { background: #ff3742; }\n';
      htmlContent += '        .recordingIndicator { background: #ff4757; color: var(--whiteColor); padding: 0.5rem 1rem; border-radius: 12px; font-size: var(--smallFontSize); font-weight: 600; display: flex; align-items: center; gap: 0.5rem; position: absolute; top: 1rem; left: 1rem; z-index: 100; }\n';
      htmlContent += '        .recordingDot { width: 8px; height: 8px; background: var(--whiteColor); border-radius: 50%; animation: pulse 1.5s infinite; }\n';
      htmlContent += '        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }\n';
      htmlContent += '        .statusIndicator { padding: 0.75rem 1rem; border-radius: 8px; font-size: var(--normalFontSize); font-weight: 600; display: flex; align-items: center; gap: 0.5rem; margin-top: 1rem; width: 100%; max-width: 384px; justify-content: center; }\n';
      htmlContent += '        .statusIndicator.success { background: rgba(16, 185, 129, 0.1); color: var(--successColor); }\n';
      htmlContent += '        .statusIndicator.warning { background: rgba(245, 158, 11, 0.1); color: var(--warningColor); }\n';
      htmlContent += '        .statusIndicator.error { background: rgba(255, 71, 87, 0.1); color: #ff4757; }\n';
      htmlContent += '        .resultsSection, .historySection { background: var(--whiteColor); border-radius: 16px; padding: 2rem; box-shadow: 0 4px 20px rgba(0,0,0,0.08); margin-top: 2rem; width: 100%; max-width: 900px; }\n';
      htmlContent += '        .sectionHeader { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1.5rem; color: var(--blackColor); }\n';
      htmlContent += '        .sectionHeader h3 { font-size: var(--h2FontSize); font-weight: 700; margin: 0; }\n';
      htmlContent += '        .videoPreview { margin-bottom: 2rem; }\n';
      htmlContent += '        .previewVideo { width: 300px; height: 200px; border-radius: 12px; object-fit: cover; border: 2px solid var(--inputColor); }\n';
      htmlContent += '        .loadingState { text-align: center; padding: 2rem; color: var(--textColor); }\n';
      htmlContent += '        .loadingSpinner { width: 24px; height: 24px; border: 3px solid var(--inputColor); border-top: 3px solid var(--PrimaryColor); border-radius: 50%; animation: spin 1s linear infinite; margin-right: 0.5rem; }\n';
      htmlContent += '        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }\n';
      htmlContent += '        .predictionGrid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem; }\n';
      htmlContent += '        .predictionCard { background: var(--paleGreen); border: 1px solid var(--PrimaryColor); border-radius: 12px; padding: 1.5rem; text-align: center; transition: transform 0.2s ease; }\n';
      htmlContent += '        .predictionCard:hover { transform: translateY(-2px); }\n';
      htmlContent += '        .predictionValue { font-size: 2.5rem; font-weight: 700; color: var(--PrimaryColor); margin-bottom: 0.5rem; }\n';
      htmlContent += '        .predictionLabel { font-size: var(--normalFontSize); color: var(--blackColor); font-weight: 600; margin-bottom: 0.25rem; }\n';
      htmlContent += '        .predictionUnit { font-size: var(--smallFontSize); color: var(--textColor); }\n';
      htmlContent += '        .historyList { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 1rem; }\n';
      htmlContent += '        .historyItem { display: flex; justify-content: space-between; align-items: center; padding: 1rem; background: var(--inputColor); border-radius: 8px; transition: background 0.2s; }\n';
      htmlContent += '        .historyItem:hover { background: var(--itemCardHover); }\n';
      htmlContent += '        .historyInfo { display: flex; flex-direction: column; }\n';
      htmlContent += '        .historyDate { font-weight: 600; color: var(--blackColor); }\n';
      htmlContent += '        .historyVitals { font-size: var(--smallFontSize); color: var(--textColor); }\n';
      htmlContent += '        .modalOverlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center; z-index: 1000; }\n';
      htmlContent += '        .modalContent { background: var(--whiteColor); padding: 2rem; border-radius: 16px; width: 90%; max-width: 600px; max-height: 80vh; overflow-y: auto; position: relative; }\n';
      htmlContent += '        .modalClose { position: absolute; top: 1rem; right: 1rem; background: none; border: none; cursor: pointer; color: var(--greyText); font-size: 1.5rem; }\n';
      htmlContent += '        .modalBody .predictionGrid { margin-top: 1.5rem; }\n';
      htmlContent += '        @media screen and (max-width: 768px) {\n';
      htmlContent += '            .cameraSection { padding: 1rem; }\n';
      htmlContent += '            .cameraHeader { padding: 1.5rem; }\n';
      htmlContent += '            .cameraHeader h1 { font-size: 1.5rem; }\n';
      htmlContent += '            .cameraContainer { padding: 1rem; }\n';
      htmlContent += '            .cameraWrapper { transform: scale(0.85); }\n';
      htmlContent += '            .controlsGrid { flex-direction: column; align-items: center; }\n';
      htmlContent += '            .controlBtn { width: 100%; max-width: 280px; }\n';
      htmlContent += '            .predictionGrid { grid-template-columns: 1fr; }\n';
      htmlContent += '            .previewVideo { width: 100%; max-width: 300px; }\n';
      htmlContent += '        }\n';
      htmlContent += '    </style>\n';
      htmlContent += '</head>\n';
      htmlContent += '<body>\n';
      htmlContent += '    <div class="cameraSection">\n';
      htmlContent += '        <div class="cameraHeader">\n';
      htmlContent += '            <h1>Health Vitals Scanner</h1>\n';
      htmlContent += '            <p>Position your face in the oval and record for 30 seconds.</p>\n';
      htmlContent += '        </div>\n';
      htmlContent += '        <div class="cameraContainer">\n';
      htmlContent += '            <div class="loadingState" id="loadingState">\n';
      htmlContent += '                <div class="loadingSpinner"></div>\n';
      htmlContent += '                <p>Loading scanner...</p>\n';
      htmlContent += '            </div>\n';
      htmlContent += '            <div id="errorState" class="errorState" style="display: none;">\n';
      htmlContent += '                <div class="errorIcon">⚠</div>\n';
      htmlContent += '                <p class="errorText" id="errorText">Failed to access camera</p>\n';
      htmlContent += '                <button class="controlBtn" onclick="window.location.reload()">Try Again</button>\n';
      htmlContent += '            </div>\n';
      htmlContent += '            <div id="cameraInterface" style="display: none;">\n';
      htmlContent += '                <div class="cameraWrapper" id="cameraWrapper">\n';
      htmlContent += '                    <div id="videoContainer" style="position: relative; width: 384px; height: 518px; border-radius: 1.5rem; overflow: hidden; border: 2px solid #e5e7eb; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">\n';
      htmlContent += '                        <video id="videoElement" autoplay playsinline muted style="width: 384px; height: 518px; object-fit: cover;"></video>\n';
      htmlContent += '                        <canvas id="canvasElement" style="position: absolute; top: 0; left: 0; width: 384px; height: 518px; pointer-events: none; z-index: 20;"></canvas>\n';
      htmlContent += '                        <div style="position: absolute; inset: 0; pointer-events: none; z-index: 30; backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(16px); -webkit-mask-image: radial-gradient(ellipse 61% 68% at 50% 50%, transparent 69%, black 71%); mask-image: radial-gradient(ellipse 61% 68% at 50% 50%, transparent 69%, black 71%); background: rgba(255,255,255,0.10);"></div>\n';
      htmlContent += '                        <div style="position: absolute; left: 6%; top: 4%; width: 88%; height: 92%; border: 5px dashed #fff; border-radius: 50%; box-sizing: border-box; z-index: 31; pointer-events: none;"></div>\n';
      htmlContent += '                        <div style="position: absolute; width: 100%; text-align: center; color: #fff; font-weight: 600; font-size: 1.15rem; text-shadow: 0 2px 12px #003046cc; letter-spacing: 0.02em; top: 14px; left: 0; z-index: 40; pointer-events: none;">Place your face in the oval</div>\n';
      htmlContent += '                        <div id="recordingIndicator" class="recordingIndicator" style="display: none;">\n';
      htmlContent += '                            <div class="recordingDot"></div>\n';
      htmlContent += '                            <span id="recordingTime">REC 00:00</span>\n';
      htmlContent += '                        </div>\n';
      htmlContent += '                    </div>\n';
      htmlContent += '                </div>\n';
      htmlContent += '                <div id="statusIndicator" style="display: none;"></div>\n';
      htmlContent += '                <div class="controlsGrid">\n';
      htmlContent += '                    <button id="startBtn" class="controlBtn">Start Recording</button>\n';
      htmlContent += '                    <button id="stopBtn" class="controlBtn danger" style="display: none;">Stop Recording</button>\n';
      htmlContent += '                    <button id="recordAgainBtn" class="controlBtn" style="display: none;">Record Again</button>\n';
      htmlContent += '                </div>\n';
      htmlContent += '            </div>\n';
      htmlContent += '        </div>\n';
      htmlContent += '        <div id="resultsSection" class="resultsSection" style="display: none;">\n';
      htmlContent += '            <div class="sectionHeader">\n';
      htmlContent += '                <span style="font-size: 1.5rem;">📊</span>\n';
      htmlContent += '                <h3>Analysis Results</h3>\n';
      htmlContent += '            </div>\n';
      htmlContent += '            <div class="videoPreview">\n';
      htmlContent += '                <h4 style="color: var(--blackColor); margin-bottom: 1rem;">Recorded Video:</h4>\n';
      htmlContent += '                <video id="previewVideo" class="previewVideo" controls></video>\n';
      htmlContent += '            </div>\n';
      htmlContent += '            <div id="predictionGrid" class="predictionGrid"></div>\n';
      htmlContent += '        </div>\n';
      htmlContent += '        <div class="historySection">\n';
      htmlContent += '            <div class="sectionHeader">\n';
      htmlContent += '                <span style="font-size: 1.5rem;">🕒</span>\n';
      htmlContent += '                <h3>Recent Scans</h3>\n';
      htmlContent += '            </div>\n';
      htmlContent += '            <div id="historyContent">\n';
      htmlContent += '                <div class="loadingState">\n';
      htmlContent += '                    <div class="loadingSpinner"></div>\n';
      htmlContent += '                    Loading history...\n';
      htmlContent += '                </div>\n';
      htmlContent += '            </div>\n';
      htmlContent += '        </div>\n';
      htmlContent += '    </div>\n';
      htmlContent += '    <div id="scanModal" class="modalOverlay" style="display: none;">\n';
      htmlContent += '        <div class="modalContent">\n';
      htmlContent += '            <button class="modalClose" onclick="closeScanModal()">×</button>\n';
      htmlContent += '            <div id="modalBody"></div>\n';
      htmlContent += '        </div>\n';
      htmlContent += '    </div>\n';

      // Add JavaScript functionality
      htmlContent += '    <script>\n';
      htmlContent += '        let videoRef, canvasRef, cameraInstance, mediaRecorderRef, recordingTimerRef, recordedBlobRef;\n';
      htmlContent += '        let stream = null;\n';
      htmlContent += '        let scriptsLoaded = false;\n';
      htmlContent += '        let isRecording = false;\n';
      htmlContent += '        let recordingDuration = 0;\n';
      htmlContent += '        let recordedVideoUrl = null;\n';
      htmlContent += '        let aiPrediction = null;\n';
      htmlContent += '        let isAnalyzing = false;\n';
      htmlContent += '        let isSaving = false;\n';
      htmlContent += '        let saveSuccess = false;\n';
      htmlContent += '        let analysisComplete = false;\n';
      htmlContent += '        let scanHistory = [];\n';
      htmlContent += '        let selectedScan = null;\n';
      htmlContent += '        const API_BASE_URL = "https://facevital-backend-3.onrender.com";\n';
      htmlContent += '        const AI_API_URL = "https://anurudh-268064419384.asia-east1.run.app/analyze";\n';
      htmlContent += '        const WIDTH = 384;\n';
      htmlContent += '        const HEIGHT = 518;\n';
      htmlContent += '        document.addEventListener("DOMContentLoaded", function() {\n';
      htmlContent += '            initializeScanner();\n';
      htmlContent += '        });\n';
     
      htmlContent += '        function formatTime(seconds) {\n';
      htmlContent += '            const mins = Math.floor(seconds / 60);\n';
      htmlContent += '            const secs = seconds % 60;\n';
      htmlContent += '            return mins.toString().padStart(2, "0") + ":" + secs.toString().padStart(2, "0");\n';
      htmlContent += '        }\n';
      htmlContent += '        function showStatus(message, type) {\n';
      htmlContent += '            const statusEl = document.getElementById("statusIndicator");\n';
      htmlContent += '            statusEl.style.display = "flex";\n';
      htmlContent += '        }\n';
      htmlContent += '        function hideStatus() {\n';
      htmlContent += '            document.getElementById("statusIndicator").style.display = "none";\n';
      htmlContent += '        }\n';
      htmlContent += '        async function initializeScanner() {\n';
      htmlContent += '            try {\n';
      htmlContent += '                await loadMediaPipeScripts();\n';
      htmlContent += '                scriptsLoaded = true;\n';
      htmlContent += '                await startCamera();\n';
      htmlContent += '                await fetchScanHistory();\n';
      htmlContent += '                setupEventListeners();\n';
      htmlContent += '                document.getElementById("loadingState").style.display = "none";\n';
      htmlContent += '                document.getElementById("cameraInterface").style.display = "block";\n';
      htmlContent += '            } catch (error) {\n';
      htmlContent += '                console.error("Initialization failed:", error);\n';
      htmlContent += '                showError(error.message || "Failed to initialize scanner");\n';
      htmlContent += '            }\n';
      htmlContent += '        }\n';
      htmlContent += '        function loadMediaPipeScripts() {\n';
      htmlContent += '            return new Promise((resolve, reject) => {\n';
      htmlContent += '                let loadedCount = 0;\n';
      htmlContent += '                const scripts = [\n';
      htmlContent += '                    "https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js",\n';
      htmlContent += '                    "https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/drawing_utils.js",\n';
      htmlContent += '                    "https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/face_mesh.js"\n';
      htmlContent += '                ];\n';
      htmlContent += '                scripts.forEach(src => {\n';
      htmlContent += '                    const script = document.createElement("script");\n';
      htmlContent += '                    script.src = src;\n';
      htmlContent += '                    script.crossOrigin = "anonymous";\n';
      htmlContent += '                    script.onload = () => {\n';
      htmlContent += '                        loadedCount++;\n';
      htmlContent += '                        if (loadedCount === scripts.length) {\n';
      htmlContent += '                            resolve();\n';
      htmlContent += '                        }\n';
      htmlContent += '                    };\n';
      htmlContent += '                    script.onerror = () => reject(new Error("Failed to load MediaPipe scripts"));\n';
      htmlContent += '                    document.head.appendChild(script);\n';
      htmlContent += '                });\n';
      htmlContent += '            });\n';
      htmlContent += '        }\n';
      htmlContent += '        async function startCamera() {\n';
      htmlContent += '            try {\n';
      htmlContent += '                videoRef = document.getElementById("videoElement");\n';
      htmlContent += '                canvasRef = document.getElementById("canvasElement");\n';
      htmlContent += '                if (stream) {\n';
      htmlContent += '                    stream.getTracks().forEach(track => track.stop());\n';
      htmlContent += '                }\n';
      htmlContent += '                stream = await navigator.mediaDevices.getUserMedia({\n';
      htmlContent += '                    video: { width: WIDTH, height: HEIGHT, facingMode: "user" },\n';
      htmlContent += '                    audio: false\n';
      htmlContent += '                });\n';
      htmlContent += '                videoRef.srcObject = stream;\n';
      htmlContent += '            } catch (error) {\n';
      htmlContent += '                throw new Error("Could not access the camera. Please grant permission in your browser.");\n';
      htmlContent += '            }\n';
      htmlContent += '        }\n';
      htmlContent += '        function setupEventListeners() {\n';
      htmlContent += '            document.getElementById("startBtn").addEventListener("click", startRecording);\n';
      htmlContent += '            document.getElementById("stopBtn").addEventListener("click", stopRecording);\n';
      htmlContent += '            document.getElementById("recordAgainBtn").addEventListener("click", startRecording);\n';
      htmlContent += '        }\n';
      htmlContent += '        function startRecording() {\n';
      htmlContent += '            if (!stream) return;\n';
      htmlContent += '            resetAll();\n';
      htmlContent += '            isRecording = true;\n';
      htmlContent += '            recordingDuration = 0;\n';
      htmlContent += '            document.getElementById("startBtn").style.display = "none";\n';
      htmlContent += '            document.getElementById("stopBtn").style.display = "block";\n';
      htmlContent += '            document.getElementById("recordAgainBtn").style.display = "none";\n';
      htmlContent += '            document.getElementById("recordingIndicator").style.display = "flex";\n';
      htmlContent += '            document.getElementById("videoContainer").style.border = "4px solid #ff4757";\n';
      htmlContent += '            const chunks = [];\n';
      htmlContent += '            mediaRecorderRef = new MediaRecorder(stream, { mimeType: "video/webm;codecs=vp9" });\n';
      htmlContent += '            mediaRecorderRef.ondataavailable = (event) => {\n';
      htmlContent += '                if (event.data.size > 0) chunks.push(event.data);\n';
      htmlContent += '            };\n';
      htmlContent += '            mediaRecorderRef.onstop = async () => {\n';
      htmlContent += '                if (recordingTimerRef) {\n';
      htmlContent += '                    clearInterval(recordingTimerRef);\n';
      htmlContent += '                    recordingTimerRef = null;\n';
      htmlContent += '                }\n';
      htmlContent += '                isRecording = false;\n';
      htmlContent += '                document.getElementById("recordingIndicator").style.display = "none";\n';
      htmlContent += '                document.getElementById("videoContainer").style.border = "2px solid #e5e7eb";\n';
      htmlContent += '                document.getElementById("stopBtn").style.display = "none";\n';
      htmlContent += '                document.getElementById("recordAgainBtn").style.display = "block";\n';
      htmlContent += '                const blob = new Blob(chunks, { type: "video/webm" });\n';
      htmlContent += '                recordedVideoUrl = URL.createObjectURL(blob);\n';
      htmlContent += '                recordedBlobRef = blob;\n';
      htmlContent += '                await callAIAPI(blob);\n';
      htmlContent += '            };\n';
      htmlContent += '            mediaRecorderRef.start();\n';
      htmlContent += '            recordingTimerRef = setInterval(() => {\n';
      htmlContent += '                recordingDuration++;\n';
      htmlContent += '                document.getElementById("recordingTime").textContent = "REC " + formatTime(recordingDuration);\n';
      htmlContent += '                if (recordingDuration >= 30) {\n';
      htmlContent += '                    stopRecording();\n';
      htmlContent += '                }\n';
      htmlContent += '            }, 1000);\n';
      htmlContent += '        }\n';
      htmlContent += '        function stopRecording() {\n';
      htmlContent += '            if (mediaRecorderRef && mediaRecorderRef.state === "recording") {\n';
      htmlContent += '                mediaRecorderRef.stop();\n';
      htmlContent += '            }\n';
      htmlContent += '        }\n';
      htmlContent += '        async function callAIAPI(videoBlob) {\n';
      htmlContent += '            isAnalyzing = true;\n';
      htmlContent += '            analysisComplete = false;\n';
      htmlContent += '            aiPrediction = null;\n';
      htmlContent += '            showStatus("Analyzing your video...", "warning");\n';
      htmlContent += '            try {\n';
      htmlContent += '                const formData = new FormData();\n';
      htmlContent += '                formData.append("file", videoBlob, "health-scan.webm");\n';
      htmlContent += '                const response = await axios.post(AI_API_URL, formData, {\n';
      htmlContent += '                    headers: { "Content-Type": "multipart/form-data" },\n';
      htmlContent += '                    timeout: 120000\n';
      htmlContent += '                });\n';
      htmlContent += '                const prediction = response.data;\n';
      htmlContent += '                if (typeof prediction === "object" && prediction !== null && !prediction.error) {\n';
      htmlContent += '                    const mappedPrediction = {\n';
      htmlContent += '                        heartRate: prediction.heart_rate_bpm,\n';
      htmlContent += '                        bloodPressure: {\n';
      htmlContent += '                            systolic: prediction.blood_pressure?.systolic,\n';
      htmlContent += '                            diastolic: prediction.blood_pressure?.diastolic\n';
      htmlContent += '                        },\n';
      htmlContent += '                        oxygenSaturation: prediction.spo2_percent,\n';
      htmlContent += '                        stressLevel: prediction.stress_indicator ? (prediction.stress_indicator * 100).toFixed(1) : null\n';
      htmlContent += '                    };\n';
      htmlContent += '                    aiPrediction = mappedPrediction;\n';
      htmlContent += '                    await saveToDatabase(mappedPrediction, videoBlob);\n';
      htmlContent += '                    displayResults();\n';
      htmlContent += '                } else {\n';
      htmlContent += '                    throw new Error(prediction.error || "Invalid response structure from AI API.");\n';
      htmlContent += '                }\n';
      htmlContent += '            } catch (error) {\n';
      htmlContent += '                console.error("AI API Error:", error);\n';
      htmlContent += '                showStatus("Analysis failed: " + error.message, "error");\n';
      htmlContent += '                aiPrediction = { error: error.message };\n';
      htmlContent += '            } finally {\n';
      htmlContent += '                isAnalyzing = false;\n';
      htmlContent += '                analysisComplete = true;\n';
      htmlContent += '            }\n';
      htmlContent += '        }\n';
      htmlContent += '        async function saveToDatabase(predictionData, videoBlob) {\n';
      htmlContent += '            const authHeaders = getAuthHeaders();\n';
      htmlContent += '            if (!authHeaders) {\n';
      htmlContent += '                console.log("No auth token, skipping database save");\n';
      htmlContent += '                return;\n';
      htmlContent += '            }\n';
      htmlContent += '            try {\n';
      htmlContent += '                const formData = new FormData();\n';
      htmlContent += '                formData.append("video", videoBlob, "health-scan.webm");\n';
      htmlContent += '                formData.append("predictions", JSON.stringify(predictionData));\n';
      htmlContent += '                formData.append("heartRate", predictionData.heartRate || "");\n';
      htmlContent += '                formData.append("scanDuration", recordingDuration);\n';
      htmlContent += '                await axios.post(API_BASE_URL + "/api/scan/saveHealthData", formData, {\n';
      htmlContent += '                    headers: { ...authHeaders, "Content-Type": "multipart/form-data" }\n';
      htmlContent += '                });\n';
      htmlContent += '                showStatus("Analysis complete and data saved.", "success");\n';
      htmlContent += '                fetchScanHistory();\n';
      htmlContent += '            } catch (error) {\n';
      htmlContent += '                console.error("Error saving to database:", error);\n';
      htmlContent += '                showStatus("Analysis complete but failed to save.", "warning");\n';
      htmlContent += '            }\n';
      htmlContent += '        }\n';
      htmlContent += '        function displayResults() {\n';
      htmlContent += '            if (!aiPrediction || aiPrediction.error) return;\n';
      htmlContent += '            const previewVideo = document.getElementById("previewVideo");\n';
      htmlContent += '            previewVideo.src = recordedVideoUrl;\n';
      htmlContent += '            const predictionGrid = document.getElementById("predictionGrid");\n';
      htmlContent += '            predictionGrid.innerHTML = `\n';
      htmlContent += '                <div class="predictionCard">\n';
      htmlContent += '                    <div class="predictionValue">${aiPrediction.heartRate || "--"}</div>\n';
      htmlContent += '                    <div class="predictionLabel">Heart Rate</div>\n';
      htmlContent += '                    <div class="predictionUnit">BPM</div>\n';
      htmlContent += '                </div>\n';
      htmlContent += '                <div class="predictionCard">\n';
      htmlContent += '                    <div class="predictionValue">${aiPrediction.bloodPressure?.systolic && aiPrediction.bloodPressure?.diastolic ? aiPrediction.bloodPressure.systolic + "/" + aiPrediction.bloodPressure.diastolic : "--/--"}</div>\n';
      htmlContent += '                    <div class="predictionLabel">Blood Pressure</div>\n';
      htmlContent += '                    <div class="predictionUnit">mmHg</div>\n';
      htmlContent += '                </div>\n';
      htmlContent += '                <div class="predictionCard">\n';
      htmlContent += '                    <div class="predictionValue">${aiPrediction.oxygenSaturation || "--"}</div>\n';
      htmlContent += '                    <div class="predictionLabel">Oxygen Saturation</div>\n';
      htmlContent += '                    <div class="predictionUnit">%</div>\n';
      htmlContent += '                </div>\n';
      htmlContent += '                <div class="predictionCard">\n';
      htmlContent += '                    <div class="predictionValue">${aiPrediction.stressLevel || "--"}</div>\n';
      htmlContent += '                    <div class="predictionLabel">Stress Level</div>\n';
      htmlContent += '                    <div class="predictionUnit">%</div>\n';
      htmlContent += '                </div>\n';
      htmlContent += '            `;\n';
      htmlContent += '            document.getElementById("resultsSection").style.display = "block";\n';
      htmlContent += '        }\n';
      htmlContent += '        async function fetchScanHistory() {\n';
      htmlContent += '            const authHeaders = getAuthHeaders();\n';
      htmlContent += '            if (!authHeaders) {\n';
      htmlContent += '                document.getElementById("historyContent").innerHTML = `<p style="text-align: center; color: var(--textColor);">Login required to view scan history.</p>`;\n';
      htmlContent += '                return;\n';
      htmlContent += '            }\n';
      htmlContent += '            try {\n';
      htmlContent += '                const response = await axios.get(API_BASE_URL + "/api/scan/getScanHistory?limit=5", {\n';
      htmlContent += '                    headers: authHeaders\n';
      htmlContent += '                });\n';
      htmlContent += '                scanHistory = response.data.results || [];\n';
      htmlContent += '                displayScanHistory();\n';
      htmlContent += '            } catch (error) {\n';
      htmlContent += '                console.error("Error fetching history:", error);\n';
      htmlContent += '                scanHistory = [];\n';
      htmlContent += '                document.getElementById("historyContent").innerHTML = `<p style="text-align: center; color: var(--textColor);">Failed to load scan history.</p>`;\n';
      htmlContent += '            }\n';
      htmlContent += '        }\n';
      htmlContent += '        function displayScanHistory() {\n';
      htmlContent += '            const historyContent = document.getElementById("historyContent");\n';
      htmlContent += '            if (scanHistory.length === 0) {\n';
      htmlContent += '                historyContent.innerHTML = `<p style="text-align: center; color: var(--textColor);">No scan history found.</p>`;\n';
      htmlContent += '                return;\n';
      htmlContent += '            }\n';
      htmlContent += '            const historyHTML = `<ul class="historyList">${scanHistory.map(scan => `<li class="historyItem"><div class="historyInfo"><span class="historyDate">${new Date(scan.timestamp).toLocaleString()}</span><span class="historyVitals">HR: ${scan.heartRate || "N/A"}</span></div><button class="controlBtn secondary" style="min-width: 120px; padding: 0.5rem 1rem;" onclick="fetchScanDetails(\\`${scan._id}\\`)">View Details</button></li>`).join("")}</ul>`;\n';
      htmlContent += '            historyContent.innerHTML = historyHTML;\n';
      htmlContent += '        }\n';
      htmlContent += '        function resetAll() {\n';
      htmlContent += '            isRecording = false;\n';
      htmlContent += '            recordingDuration = 0;\n';
      htmlContent += '            recordedVideoUrl = null;\n';
      htmlContent += '            aiPrediction = null;\n';
      htmlContent += '            if (recordingTimerRef) {\n';
      htmlContent += '                clearInterval(recordingTimerRef);\n';
      htmlContent += '                recordingTimerRef = null;\n';
      htmlContent += '            }\n';
      htmlContent += '            hideStatus();\n';
      htmlContent += '            document.getElementById("resultsSection").style.display = "none";\n';
      htmlContent += '            document.getElementById("startBtn").style.display = "block";\n';
      htmlContent += '            document.getElementById("stopBtn").style.display = "none";\n';
      htmlContent += '            document.getElementById("recordAgainBtn").style.display = "none";\n';
      htmlContent += '        }\n';
      htmlContent += '        function showError(message) {\n';
      htmlContent += '            document.getElementById("loadingState").style.display = "none";\n';
      htmlContent += '            document.getElementById("cameraInterface").style.display = "none";\n';
      htmlContent += '            document.getElementById("errorText").textContent = message;\n';
      htmlContent += '            document.getElementById("errorState").style.display = "flex";\n';
      htmlContent += '        }\n';
      htmlContent += '    </script>\n';
      htmlContent += '</body>\n';

      // Set proper headers
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');

      // Send HTML content directly
      res.send(htmlContent);

    } catch (error) {
      console.error('Error serving health scanner page:', error);
      res.status(500).json({
        success: false,
        message: "Failed to load health scanner",
        error: error.message
      });
    }
  }

  // Alternative JSON API endpoint (if you need JSON format)
  async getHealthScannerJSON(req, res, next) {
    try {
      const response = {
        success: true,
        message: "Health Scanner HTML content",
        data: {
          pageInfo: {
            title: "Health Vitals Scanner",
            version: "1.0.0",
            features: [
              "Face detection with MediaPipe",
              "30-second video recording",
              "AI-powered health analysis",
              "Results visualization",
              "Scan history tracking"
            ],
            requirements: {
              camera: true,
              internet: true,
              browser: "Modern browser with WebRTC support"
            }
          },
          apiEndpoints: {
            aiAnalysis: 'https://anurudh-268064419384.asia-east1.run.app/analyze',
            saveData: 'https://facevital-backend-3.onrender.com/api/scan/saveHealthData',
            getHistory: 'https://facevital-backend-3.onrender.com/api/scan/getScanHistory',
            getScanDetails: 'https://facevital-backend-3.onrender.com/api/scan/:id'
          }
        }
      };

      res.json(response);

    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to generate health scanner content",
        error: error.message
      });
    }
  }
}
module.exports = new ProfileController(); 
