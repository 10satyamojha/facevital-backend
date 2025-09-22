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
      const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Health Vitals Scanner</title>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/axios/1.4.0/axios.min.js"></script>
    <style>
        :root {
            --PrimaryColor: #5eaa3c; --HoverColor: #4a8530; --paleGreen: #f0f8eb;
            --whiteColor: #ffffff; --blackColor: #2c3e50; --greyText: #718096;
            --textColor: #64748b; --bgColor: #f8fafc; --inputColor: #f1f5f9;
            --itemCardHover: #e2e8f0; --successColor: #10b981; --warningColor: #f59e0b;
            --h1FontSize: 2rem; --h2FontSize: 1.5rem; --h3FontSize: 1.25rem;
            --normalFontSize: 1rem; --smallFontSize: 0.875rem; --smallestFontSize: 0.75rem;
        }
        
        * { box-sizing: border-box; margin: 0; padding: 0; }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
            background: var(--bgColor);
            min-height: 100vh;
        }
        
        .cameraSection { 
            min-height: 100vh; 
            background: var(--bgColor); 
            padding: 1.5rem; 
        }
        
        .cameraHeader { 
            background: var(--whiteColor); 
            padding: 2rem; 
            border-radius: 16px; 
            margin-bottom: 2rem; 
            box-shadow: 0 4px 20px rgba(0,0,0,0.08); 
            text-align: center; 
        }
        
        .cameraHeader h1 { 
            font-size: var(--h1FontSize); 
            color: var(--blackColor); 
            font-weight: 700; 
            margin-bottom: 0.5rem; 
            display: flex; 
            align-items: center; 
            gap: 0.5rem; 
            justify-content: center; 
        }
        
        .cameraHeader p { 
            font-size: var(--normalFontSize); 
            color: var(--textColor); 
            margin: 0; 
        }
        
        .cameraContainer { 
            background: var(--whiteColor); 
            border-radius: 16px; 
            padding: 2rem; 
            box-shadow: 0 4px 20px rgba(0,0,0,0.08); 
            margin-bottom: 2rem; 
            display: flex; 
            flex-direction: column; 
            align-items: center; 
            gap: 2rem; 
        }
        
        .cameraWrapper { 
            position: relative; 
            display: inline-block; 
        }
        
        .errorState { 
            background: var(--inputColor); 
            border-radius: 16px; 
            padding: 4rem 2rem; 
            text-align: center; 
            border: 2px dashed var(--greyText); 
            width: 384px; 
            height: 518px; 
            display: flex; 
            flex-direction: column; 
            align-items: center; 
            justify-content: center; 
        }
        
        .errorIcon { 
            color: #ff4757; 
            margin-bottom: 1rem; 
            font-size: 4rem;
        }
        
        .errorText { 
            font-size: var(--normalFontSize); 
            color: var(--textColor); 
            margin-bottom: 1.5rem; 
        }
        
        .controlsGrid { 
            display: flex; 
            gap: 1rem; 
            flex-wrap: wrap; 
            justify-content: center; 
        }
        
        .controlBtn { 
            background: var(--PrimaryColor); 
            color: var(--whiteColor); 
            border: none; 
            padding: 0.875rem 1.75rem; 
            border-radius: 8px; 
            font-size: var(--normalFontSize); 
            font-weight: 600; 
            cursor: pointer; 
            transition: all 0.3s ease; 
            display: flex; 
            align-items: center; 
            gap: 0.75rem; 
            min-width: 160px; 
            justify-content: center; 
        }
        
        .controlBtn:hover { 
            background: var(--HoverColor); 
            transform: translateY(-2px); 
            box-shadow: 0 6px 20px rgba(0,0,0,0.15); 
        }
        
        .controlBtn:disabled { 
            background: var(--greyText); 
            cursor: not-allowed; 
            transform: none; 
            box-shadow: none; 
        }
        
        .controlBtn.secondary { 
            background: var(--inputColor); 
            color: var(--blackColor); 
            border: 2px solid var(--itemCardHover); 
        }
        
        .controlBtn.secondary:hover { 
            background: var(--itemCardHover); 
            border-color: var(--greyText); 
        }
        
        .controlBtn.danger { 
            background: #ff4757; 
            color: var(--whiteColor); 
        }
        
        .controlBtn.danger:hover { 
            background: #ff3742; 
        }
        
        .recordingIndicator { 
            background: #ff4757; 
            color: var(--whiteColor); 
            padding: 0.5rem 1rem; 
            border-radius: 12px; 
            font-size: var(--smallFontSize); 
            font-weight: 600; 
            display: flex; 
            align-items: center; 
            gap: 0.5rem; 
            position: absolute; 
            top: 1rem; 
            left: 1rem; 
            z-index: 100; 
        }
        
        .recordingDot { 
            width: 8px; 
            height: 8px; 
            background: var(--whiteColor); 
            border-radius: 50%; 
            animation: pulse 1.5s infinite; 
        }
        
        @keyframes pulse { 
            0%, 100% { opacity: 1; } 
            50% { opacity: 0.5; } 
        }
        
        .statusIndicator { 
            padding: 0.75rem 1rem; 
            border-radius: 8px; 
            font-size: var(--normalFontSize); 
            font-weight: 600; 
            display: flex; 
            align-items: center; 
            gap: 0.5rem; 
            margin-top: 1rem; 
            width: 100%; 
            max-width: 384px; 
            justify-content: center; 
        }
        
        .statusIndicator.success { 
            background: rgba(16, 185, 129, 0.1); 
            color: var(--successColor); 
        }
        
        .statusIndicator.warning { 
            background: rgba(245, 158, 11, 0.1); 
            color: var(--warningColor); 
        }
        
        .statusIndicator.error { 
            background: rgba(255, 71, 87, 0.1); 
            color: #ff4757; 
        }
        
        .resultsSection, .historySection { 
            background: var(--whiteColor); 
            border-radius: 16px; 
            padding: 2rem; 
            box-shadow: 0 4px 20px rgba(0,0,0,0.08); 
            margin-top: 2rem; 
            width: 100%; 
            max-width: 900px; 
        }
        
        .sectionHeader { 
            display: flex; 
            align-items: center; 
            gap: 0.5rem; 
            margin-bottom: 1.5rem; 
            color: var(--blackColor); 
        }
        
        .sectionHeader h3 { 
            font-size: var(--h2FontSize); 
            font-weight: 700; 
            margin: 0; 
        }
        
        .videoPreview { 
            margin-bottom: 2rem; 
        }
        
        .previewVideo { 
            width: 300px; 
            height: 200px; 
            border-radius: 12px; 
            object-fit: cover; 
            border: 2px solid var(--inputColor); 
        }
        
        .loadingState { 
            text-align: center; 
            padding: 2rem; 
            color: var(--textColor); 
        }
        
        .loadingSpinner { 
            width: 24px; 
            height: 24px; 
            border: 3px solid var(--inputColor); 
            border-top: 3px solid var(--PrimaryColor); 
            border-radius: 50%; 
            animation: spin 1s linear infinite; 
            margin-right: 0.5rem;
        }
        
        @keyframes spin { 
            0% { transform: rotate(0deg); } 
            100% { transform: rotate(360deg); } 
        }
        
        .predictionGrid { 
            display: grid; 
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); 
            gap: 1.5rem; 
        }
        
        .predictionCard { 
            background: var(--paleGreen); 
            border: 1px solid var(--PrimaryColor); 
            border-radius: 12px; 
            padding: 1.5rem; 
            text-align: center; 
            transition: transform 0.2s ease; 
        }
        
        .predictionCard:hover { 
            transform: translateY(-2px); 
        }
        
        .predictionValue { 
            font-size: 2.5rem; 
            font-weight: 700; 
            color: var(--PrimaryColor); 
            margin-bottom: 0.5rem; 
        }
        
        .predictionLabel { 
            font-size: var(--normalFontSize); 
            color: var(--blackColor); 
            font-weight: 600; 
            margin-bottom: 0.25rem; 
        }
        
        .predictionUnit { 
            font-size: var(--smallFontSize); 
            color: var(--textColor); 
        }
        
        .historyList { 
            list-style: none; 
            padding: 0; 
            margin: 0; 
            display: flex; 
            flex-direction: column; 
            gap: 1rem; 
        }
        
        .historyItem { 
            display: flex; 
            justify-content: space-between; 
            align-items: center; 
            padding: 1rem; 
            background: var(--inputColor); 
            border-radius: 8px; 
            transition: background 0.2s; 
        }
        
        .historyItem:hover { 
            background: var(--itemCardHover); 
        }
        
        .historyInfo { 
            display: flex; 
            flex-direction: column; 
        }
        
        .historyDate { 
            font-weight: 600; 
            color: var(--blackColor); 
        }
        
        .historyVitals { 
            font-size: var(--smallFontSize); 
            color: var(--textColor); 
        }
        
        .modalOverlay { 
            position: fixed; 
            top: 0; 
            left: 0; 
            right: 0; 
            bottom: 0; 
            background: rgba(0,0,0,0.6); 
            display: flex; 
            align-items: center; 
            justify-content: center; 
            z-index: 1000; 
        }
        
        .modalContent { 
            background: var(--whiteColor); 
            padding: 2rem; 
            border-radius: 16px; 
            width: 90%; 
            max-width: 600px; 
            max-height: 80vh; 
            overflow-y: auto; 
            position: relative; 
        }
        
        .modalClose { 
            position: absolute; 
            top: 1rem; 
            right: 1rem; 
            background: none; 
            border: none; 
            cursor: pointer; 
            color: var(--greyText);
            font-size: 1.5rem;
        }
        
        .modalBody .predictionGrid { 
            margin-top: 1.5rem; 
        }
        
        @media screen and (max-width: 768px) {
            .cameraSection { padding: 1rem; }
            .cameraHeader { padding: 1.5rem; }
            .cameraHeader h1 { font-size: 1.5rem; }
            .cameraContainer { padding: 1rem; }
            .cameraWrapper { transform: scale(0.85); }
            .controlsGrid { flex-direction: column; align-items: center; }
            .controlBtn { width: 100%; max-width: 280px; }
            .predictionGrid { grid-template-columns: 1fr; }
            .previewVideo { width: 100%; max-width: 300px; }
        }
    </style>
</head>
<body>
    <div class="cameraSection">
        <div class="cameraHeader">
            <h1>Health Vitals Scanner</h1>
            <p>Position your face in the oval and record for 30 seconds.</p>
        </div>
        
        <div class="cameraContainer">
            <div class="loadingState" id="loadingState">
                <div class="loadingSpinner"></div>
                <p>Loading scanner...</p>
            </div>
            
            <div id="errorState" class="errorState" style="display: none;">
                <div class="errorIcon">⚠</div>
                <p class="errorText" id="errorText">Failed to access camera</p>
                <button class="controlBtn" onclick="window.location.reload()">Try Again</button>
            </div>
            
            <div id="cameraInterface" style="display: none;">
                <div class="cameraWrapper" id="cameraWrapper">
                    <div id="videoContainer" style="position: relative; width: 384px; height: 518px; border-radius: 1.5rem; overflow: hidden; border: 2px solid #e5e7eb; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
                        <video id="videoElement" autoplay playsinline muted style="width: 384px; height: 518px; object-fit: cover;"></video>
                        <canvas id="canvasElement" style="position: absolute; top: 0; left: 0; width: 384px; height: 518px; pointer-events: none; z-index: 20;"></canvas>
                        
                        <!-- Face overlay -->
                        <div style="position: absolute; inset: 0; pointer-events: none; z-index: 30; backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(16px); -webkit-mask-image: radial-gradient(ellipse 61% 68% at 50% 50%, transparent 69%, black 71%); mask-image: radial-gradient(ellipse 61% 68% at 50% 50%, transparent 69%, black 71%); background: rgba(255,255,255,0.10);"></div>
                        
                        <!-- Face outline -->
                        <div style="position: absolute; left: 6%; top: 4%; width: 88%; height: 92%; border: 5px dashed #fff; border-radius: 50%; box-sizing: border-box; z-index: 31; pointer-events: none;"></div>
                        
                        <!-- Instructions -->
                        <div style="position: absolute; width: 100%; text-align: center; color: #fff; font-weight: 600; font-size: 1.15rem; text-shadow: 0 2px 12px #003046cc; letter-spacing: 0.02em; top: 14px; left: 0; z-index: 40; pointer-events: none;">Place your face in the oval</div>
                        
                        <!-- Recording indicator -->
                        <div id="recordingIndicator" class="recordingIndicator" style="display: none;">
                            <div class="recordingDot"></div>
                            <span id="recordingTime">REC 00:00</span>
                        </div>
                    </div>
                </div>
                
                <!-- Status indicator -->
                <div id="statusIndicator" style="display: none;"></div>
                
                <!-- Controls -->
                <div class="controlsGrid">
                    <button id="startBtn" class="controlBtn">Start Recording</button>
                    <button id="stopBtn" class="controlBtn danger" style="display: none;">Stop Recording</button>
                    <button id="recordAgainBtn" class="controlBtn" style="display: none;">Record Again</button>
                </div>
            </div>
        </div>
        
        <!-- Results Section -->
        <div id="resultsSection" class="resultsSection" style="display: none;">
            <div class="sectionHeader">
                <span style="font-size: 1.5rem;">📊</span>
                <h3>Analysis Results</h3>
            </div>
            
            <div class="videoPreview">
                <h4 style="color: var(--blackColor); margin-bottom: 1rem;">Recorded Video:</h4>
                <video id="previewVideo" class="previewVideo" controls></video>
            </div>
            
            <div id="predictionGrid" class="predictionGrid"></div>
        </div>
        
        <!-- History Section -->
        <div class="historySection">
            <div class="sectionHeader">
                <span style="font-size: 1.5rem;">🕒</span>
                <h3>Recent Scans</h3>
            </div>
            
            <div id="historyContent">
                <div class="loadingState">
                    <div class="loadingSpinner"></div>
                    Loading history...
                </div>
            </div>
        </div>
    </div>
    
    <!-- Modal for scan details -->
    <div id="scanModal" class="modalOverlay" style="display: none;">
        <div class="modalContent">
            <button class="modalClose" onclick="closeScanModal()">×</button>
            <div id="modalBody"></div>
        </div>
    </div>

    <script>
        // Global variables
        let videoRef, canvasRef, cameraInstance, mediaRecorderRef, recordingTimerRef, recordedBlobRef;
        let stream = null;
        let scriptsLoaded = false;
        let isRecording = false;
        let recordingDuration = 0;
        let recordedVideoUrl = null;
        let aiPrediction = null;
        let isAnalyzing = false;
        let isSaving = false;
        let saveSuccess = false;
        let analysisComplete = false;
        let scanHistory = [];
        let selectedScan = null;
        
        // Backend URLs - Update these with your actual URLs
        const API_BASE_URL = 'https://facevital-backend-3.onrender.com';
        const AI_API_URL = 'https://anurudh-268064419384.asia-east1.run.app/analyze';
        
        const WIDTH = 384;
        const HEIGHT = 518;
        
        // Initialize when page loads
        document.addEventListener('DOMContentLoaded', function() {
            initializeScanner();
        });
        
        // Helper functions
        function getAuthHeaders() {
            const token = localStorage.getItem('token') || 
                          localStorage.getItem('authToken') || 
                          localStorage.getItem('accessToken');
            if (!token) {
                console.error("Auth token is not available for API call.");
                return null;
            }
            return {
                'Authorization': 'Bearer ' + token
            };
        }
        
        function formatTime(seconds) {
            const mins = Math.floor(seconds / 60);
            const secs = seconds % 60;
            return mins.toString().padStart(2, '0') + ':' + secs.toString().padStart(2, '0');
        }
        
        function showStatus(message, type = 'success') {
            const statusEl = document.getElementById('statusIndicator');
            statusEl.className = 'statusIndicator ' + type;
            statusEl.innerHTML = '<span>' + message + '</span>';
            statusEl.style.display = 'flex';
        }
        
        function hideStatus() {
            document.getElementById('statusIndicator').style.display = 'none';
        }
        
        // Initialize scanner
        async function initializeScanner() {
            try {
                // Load MediaPipe scripts
                await loadMediaPipeScripts();
                scriptsLoaded = true;
                
                // Initialize camera
                await startCamera();
                
                // Fetch scan history
                await fetchScanHistory();
                
                // Setup event listeners
                setupEventListeners();
                
                document.getElementById('loadingState').style.display = 'none';
                document.getElementById('cameraInterface').style.display = 'block';
                
            } catch (error) {
                console.error('Initialization failed:', error);
                showError(error.message || 'Failed to initialize scanner');
            }
        }
        
        function loadMediaPipeScripts() {
            return new Promise((resolve, reject) => {
                let loadedCount = 0;
                const scripts = [
                    'https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js',
                    'https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/drawing_utils.js',
                    'https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/face_mesh.js'
                ];
                
                scripts.forEach(src => {
                    const script = document.createElement('script');
                    script.src = src;
                    script.crossOrigin = 'anonymous';
                    script.onload = () => {
                        loadedCount++;
                        if (loadedCount === scripts.length) {
                            resolve();
                        }
                    };
                    script.onerror = () => reject(new Error('Failed to load MediaPipe scripts'));
                    document.head.appendChild(script);
                });
            });
        }
        
        async function startCamera() {
            try {
                videoRef = document.getElementById('videoElement');
                canvasRef = document.getElementById('canvasElement');
                
                if (stream) {
                    stream.getTracks().forEach(track => track.stop());
                }
                
                stream = await navigator.mediaDevices.getUserMedia({
                    video: { width: WIDTH, height: HEIGHT, facingMode: 'user' },
                    audio: false
                });
                
                videoRef.srcObject = stream;
                
                videoRef.onloadedmetadata = () => {
                    if (!window.FaceMesh || !window.Camera) return;
                    
                    const faceMesh = new window.FaceMesh({
                        locateFile: (file) => 'https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/' + file
                    });
                    
                    faceMesh.setOptions({
                        selfieMode: true,
                        maxNumFaces: 1,
                        minDetectionConfidence: 0.5,
                        minTrackingConfidence: 0.5
                    });
                    
                    faceMesh.onResults(onResults);
                    
                    if (cameraInstance) cameraInstance.close();
                    
                    cameraInstance = new window.Camera(videoRef, {
                        onFrame: async () => {
                            if (videoRef) await faceMesh.send({ image: videoRef });
                        },
                        width: WIDTH,
                        height: HEIGHT,
                    });
                    
                    cameraInstance.start();
                };
                
            } catch (error) {
                throw new Error('Could not access the camera. Please grant permission in your browser.');
            }
        }
        
        function onResults(results) {
            if (!window.drawConnectors || !window.drawLandmarks) return;
            
            const canvas = canvasRef;
            if (!canvas) return;
            const ctx = canvas.getContext('2d');
            if (!ctx || !videoRef) return;
            
            canvas.width = WIDTH;
            canvas.height = HEIGHT;
            ctx.save();
            ctx.clearRect(0, 0, WIDTH, HEIGHT);
            ctx.scale(-1, 1);
            ctx.translate(-WIDTH, 0);
            
            if (results.multiFaceLandmarks && results.multiFaceLandmarks.length) {
                const landmarks = results.multiFaceLandmarks[0];
                
                ctx.shadowColor = 'rgba(0,0,0,0.35)';
                ctx.shadowBlur = 8;
                window.drawConnectors(ctx, landmarks, window.FACEMESH_FACE_OVAL, { color: '#FFF', lineWidth: 2 });
                ctx.shadowBlur = 0;
                window.drawConnectors(ctx, landmarks, window.FACEMESH_LEFT_EYE, { color: 'rgba(255,255,255,0.75)', lineWidth: 1.3 });
                window.drawConnectors(ctx, landmarks, window.FACEMESH_RIGHT_EYE, { color: 'rgba(255,255,255,0.75)', lineWidth: 1.3 });
                window.drawConnectors(ctx, landmarks, window.FACEMESH_LIPS, { color: 'rgba(255,255,255,0.8)', lineWidth: 1.3 });
                window.drawLandmarks(ctx, landmarks, { color: '#FFF', lineWidth: 0.7, radius: 0.8 });
            }
            ctx.restore();
        }
        
        function setupEventListeners() {
            document.getElementById('startBtn').addEventListener('click', startRecording);
            document.getElementById('stopBtn').addEventListener('click', stopRecording);
            document.getElementById('recordAgainBtn').addEventListener('click', startRecording);
        }
        
        function startRecording() {
            if (!stream) return;
            resetAll();
            
            isRecording = true;
            recordingDuration = 0;
            
            // Update UI
            document.getElementById('startBtn').style.display = 'none';
            document.getElementById('stopBtn').style.display = 'block';
            document.getElementById('recordAgainBtn').style.display = 'none';
            document.getElementById('recordingIndicator').style.display = 'flex';
            document.getElementById('videoContainer').style.border = '4px solid #ff4757';
            
            const chunks = [];
            mediaRecorderRef = new MediaRecorder(stream, { 
                mimeType: 'video/webm;codecs=vp9' 
            });
            
            mediaRecorderRef.ondataavailable = (event) => {
                if (event.data.size > 0) chunks.push(event.data);
            };
            
            mediaRecorderRef.onstop = async () => {
                if (recordingTimerRef) {
                    clearInterval(recordingTimerRef);
                    recordingTimerRef = null;
                }
                isRecording = false;
                
                // Update UI
                document.getElementById('recordingIndicator').style.display = 'none';
                document.getElementById('videoContainer').style.border = '2px solid #e5e7eb';
                document.getElementById('stopBtn').style.display = 'none';
                document.getElementById('recordAgainBtn').style.display = 'block';
                
                const blob = new Blob(chunks, { type: 'video/webm' });
                recordedVideoUrl = URL.createObjectURL(blob);
                recordedBlobRef = blob;
                
                // Start analysis
                await callAIAPI(blob);
            };
            
            mediaRecorderRef.start();
            
            recordingTimerRef = setInterval(() => {
                recordingDuration++;
                document.getElementById('recordingTime').textContent = 'REC ' + formatTime(recordingDuration);
                
                if (recordingDuration >= 30) {
                    stopRecording();
                }
            }, 1000);
        }
        
        function stopRecording() {
            if (mediaRecorderRef && mediaRecorderRef.state === "recording") {
                mediaRecorderRef.stop();
            }
        }
        
        async function callAIAPI(videoBlob) {
            isAnalyzing = true;
            analysisComplete = false;
            aiPrediction = null;
            
            showStatus('Analyzing your video...', 'warning');
            
            try {
                console.log('Starting AI analysis...');
                
                const formData = new FormData();
                formData.append('file', videoBlob, 'health-scan.webm');
                
                console.log('Sending video to AI API...');
                
                const response = await axios.post(AI_API_URL, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    },
                    timeout: 120000,
                    onUploadProgress: (progressEvent) => {
                        const percentCompleted = Math.round(
                            (progressEvent.loaded * 100) / progressEvent.total
                        );
                        console.log('Upload progress: ' + percentCompleted + '%');
                    }
                });
                
                console.log('AI API Response:', response.data);
                
                const prediction = response.data;
                
                if (typeof prediction === 'object' && prediction !== null && !prediction.error) {
                    // Map the response
                    const mappedPrediction = {
                        heartRate: prediction.heart_rate_bpm,
                        bloodPressure: {
                            systolic: prediction.blood_pressure?.systolic,
                            diastolic: prediction.blood_pressure?.diastolic
                        },
                        oxygenSaturation: prediction.spo2_percent,
                        stressLevel: prediction.stress_indicator ? (prediction.stress_indicator * 100).toFixed(1) : null,
                        respiratoryRate: prediction.respiratory_rate_bpm,
                        age: prediction.age,
                        gender: prediction.gender,
                        healthRisk: prediction.health_risk_indicator
                    };
                    
                    aiPrediction = mappedPrediction;
                    await saveToDatabase(mappedPrediction, videoBlob);
                    displayResults();
                } else {
                    throw new Error(prediction.error || "Invalid response structure from AI API.");
                }
                
            } catch (error) {
                console.error('AI API Error:', error);
                let errorMessage = 'Analysis failed';
                
                if (error.response) {
                    console.error('Response data:', error.response.data);
                    console.error('Response status:', error.response.status);
                    errorMessage = 'Analysis failed: ' + error.response.status + ' - ' + (error.response.data?.error || 'Server error');
                } else if (error.request) {
                    console.error('Request error:', error.request);
                    errorMessage = 'Analysis failed: No response from server. Please check your internet connection.';
                } else {
                    console.error('Error message:', error.message);
                    errorMessage = 'Analysis failed: ' + error.message;
                }
                
                showStatus(errorMessage, 'error');
                aiPrediction = { error: errorMessage };
            } finally {
                isAnalyzing = false;
                analysisComplete = true;
            }
        }
        
        async function saveToDatabase(predictionData, videoBlob) {
            const authHeaders = getAuthHeaders();
            if (!authHeaders) {
                console.log("No auth token, skipping database save");
                return;
            }
            
            isSaving = true;
            saveSuccess = false;
            
            showStatus('Saving results...', 'warning');
            
            try {
                const formData = new FormData();
                formData.append('video', videoBlob, 'health-scan.webm');
                formData.append('predictions', JSON.stringify(predictionData));
                formData.append('heartRate', predictionData.heartRate || '');
                formData.append('bloodPressureSystolic', predictionData.bloodPressure?.systolic || '');
                formData.append('bloodPressureDiastolic', predictionData.bloodPressure?.diastolic || '');
                formData.append('oxygenSaturation', predictionData.oxygenSaturation || '');
                formData.append('stressLevel', predictionData.stressLevel || '');
                formData.append('scanDuration', recordingDuration);
                
                await axios.post(API_BASE_URL + '/api/scan/saveHealthData', formData, {
                    headers: {
                        ...authHeaders,
                        'Content-Type': 'multipart/form-data'
                    },
                });
                
                saveSuccess = true;
                showStatus('Analysis complete and data saved.', 'success');
                fetchScanHistory();
                
            } catch (error) {
                console.error('Error saving to database:', error);
                saveSuccess = false;
                showStatus('Analysis complete but failed to save.', 'warning');
            } finally {
                isSaving = false;
            }
        }
        
        function displayResults() {
            if (!aiPrediction || aiPrediction.error) return;
            
            // Show video preview
            const previewVideo = document.getElementById('previewVideo');
            previewVideo.src = recordedVideoUrl;
            
            // Display prediction results
            const predictionGrid = document.getElementById('predictionGrid');
            predictionGrid.innerHTML = `
                <div class="predictionCard">
                    <div class="predictionValue">${aiPrediction.heartRate || '--'}</div>
                    <div class="predictionLabel">Heart Rate</div>
                    <div class="predictionUnit">BPM</div>
                </div>
                <div class="predictionCard">
                    <div class="predictionValue">${aiPrediction.bloodPressure?.systolic && aiPrediction.bloodPressure?.diastolic ? aiPrediction.bloodPressure.systolic + '/' + aiPrediction.bloodPressure.diastolic : '--/--'}</div>
                    <div class="predictionLabel">Blood Pressure</div>
                    <div class="predictionUnit">mmHg</div>
                </div>
                <div class="predictionCard">
                    <div class="predictionValue">${aiPrediction.oxygenSaturation || '--'}</div>
                    <div class="predictionLabel">Oxygen Saturation</div>
                    <div class="predictionUnit">%</div>
                </div>
                <div class="predictionCard">
                    <div class="predictionValue">${aiPrediction.stressLevel || '--'}</div>
                    <div class="predictionLabel">Stress Level</div>
                    <div class="predictionUnit">%</div>
                </div>
            `;
            
            document.getElementById('resultsSection').style.display = 'block';
        }
        
        async function fetchScanHistory() {
            const authHeaders = getAuthHeaders();
            if (!authHeaders) {
                document.getElementById('historyContent').innerHTML = '<p style="text-align: center; color: var(--textColor);">Login required to view scan history.</p>';
                return;
            }
            
            try {
                const response = await axios.get(API_BASE_URL + '/api/scan/getScanHistory?limit=5', {
                    headers: authHeaders,
                });
                
                scanHistory = response.data.results || [];
                displayScanHistory();
                
            } catch (error) {
                console.error("Error fetching history:", error);
                scanHistory = [];
                document.getElementById('historyContent').innerHTML = '<p style="text-align: center; color: var(--textColor);">Failed to load scan history.</p>';
            }
        }
        
        function displayScanHistory() {
            const historyContent = document.getElementById('historyContent');
            
            if (scanHistory.length === 0) {
                historyContent.innerHTML = '<p style="text-align: center; color: var(--textColor);">No scan history found.</p>';
                return;
            }
            
            const historyHTML = `
                <ul class="historyList">
                    ${scanHistory.map(scan => `
                        <li class="historyItem">
                            <div class="historyInfo">
                                <span class="historyDate">${new Date(scan.timestamp).toLocaleString()}</span>
                                <span class="historyVitals">HR: ${scan.heartRate || 'N/A'}</span>
                            </div>
                            <button class="controlBtn secondary" style="min-width: 120px; padding: 0.5rem 1rem;" onclick="fetchScanDetails('${scan._id}')">View Details</button>
                        </li>
                    `).join('')}
                </ul>
            `;
            
            historyContent.innerHTML = historyHTML;
        }
        
        async function fetchScanDetails(scanId) {
            const authHeaders = getAuthHeaders();
            if (!authHeaders) return;
            
            selectedScan = null;
            document.getElementById('scanModal').style.display = 'flex';
            document.getElementById('modalBody').innerHTML = `
                <div class="loadingState">
                    <div class="loadingSpinner"></div>
                    <p>Loading Details...</p>
                </div>
            `;
            
            try {
                const response = await axios.get(API_BASE_URL + '/api/scan/' + scanId, {
                    headers: authHeaders,
                });
                
                selectedScan = response.data.result;
                displayScanDetails();
                
            } catch (error) {
                console.error("Error fetching details:", error);
                document.getElementById('modalBody').innerHTML = '<p style="color: var(--textColor);">Failed to load scan details.</p>';
            }
        }
        
        function displayScanDetails() {
            if (!selectedScan) return;
            
            document.getElementById('modalBody').innerHTML = `
                <div class="sectionHeader">
                    <h3>Scan Details</h3>
                </div>
                <p><strong>Date:</strong> ${new Date(selectedScan.timestamp).toLocaleString()}</p>
                <div class="predictionGrid" style="margin-top: 1.5rem;">
                    <div class="predictionCard">
                        <div class="predictionValue">${selectedScan.heartRate || '--'}</div>
                        <div class="predictionLabel">Heart Rate</div>
                        <div class="predictionUnit">BPM</div>
                    </div>
                    <div class="predictionCard">
                        <div class="predictionValue">${selectedScan.bloodPressureSystolic && selectedScan.bloodPressureDiastolic ? selectedScan.bloodPressureSystolic + '/' + selectedScan.bloodPressureDiastolic : '--/--'}</div>
                        <div class="predictionLabel">Blood Pressure</div>
                        <div class="predictionUnit">mmHg</div>
                    </div>
                    <div class="predictionCard">
                        <div class="predictionValue">${selectedScan.oxygenSaturation || '--'}</div>
                        <div class="predictionLabel">Oxygen Saturation</div>
                        <div class="predictionUnit">%</div>
                    </div>
                    <div class="predictionCard">
                        <div class="predictionValue">${selectedScan.stressIndex || '--'}</div>
                        <div class="predictionLabel">Stress Level</div>
                        <div class="predictionUnit">%</div>
                    </div>
                </div>
            `;
        }
        
        function closeScanModal() {
            document.getElementById('scanModal').style.display = 'none';
        }
        
        function resetAll() {
            isRecording = false;
            recordingDuration = 0;
            recordedVideoUrl = null;
            aiPrediction = null;
            isAnalyzing = false;
            analysisComplete = false;
            saveSuccess = false;
            isSaving = false;
            recordedBlobRef = null;
            
            if (recordingTimerRef) {
                clearInterval(recordingTimerRef);
                recordingTimerRef = null;
            }
            
            hideStatus();
            document.getElementById('resultsSection').style.display = 'none';
            document.getElementById('startBtn').style.display = 'block';
            document.getElementById('stopBtn').style.display = 'none';
            document.getElementById('recordAgainBtn').style.display = 'none';
        }
        
        function showError(message) {
            document.getElementById('loadingState').style.display = 'none';
            document.getElementById('cameraInterface').style.display = 'none';
            document.getElementById('errorText').textContent = message;
            document.getElementById('errorState').style.display = 'flex';
        }
        
        // Click outside modal to close
        document.getElementById('scanModal').addEventListener('click', function(e) {
            if (e.target === this) {
                closeScanModal();
            }
        });
    </script>
</body>
</html>`;

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
      const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Health Vitals Scanner</title>
    <!-- Complete HTML content here - same as above -->
</head>
<body>
    <!-- Same body content as above -->
</body>
</html>`;

      const response = {
        success: true,
        message: "Health Scanner HTML content",
        data: {
          htmlContent: htmlContent,
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
