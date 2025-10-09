// require('dotenv').config();
// const App = require('./src/app');

// const PORT = process.env.PORT || 5000;

// const app = new App();
// app.start(PORT);
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 5000;

app.set('trust proxy', 1);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Create uploads directory
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'scan-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['video/webm', 'video/mp4'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

// Controller function with FIXED MediaPipe loading
async function getpage(req, res, next) {
  try {
    const html = `<!DOCTYPE html>
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
            --h1FontSize: 2rem; --h2FontSize: 1.5rem; --normalFontSize: 1rem;
            --smallFontSize: 0.875rem;
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: var(--bgColor); min-height: 100vh; }
        .cameraSection { min-height: 100vh; background: var(--bgColor); padding: 1.5rem; }
        .cameraHeader { background: var(--whiteColor); padding: 2rem; border-radius: 16px; margin-bottom: 2rem; box-shadow: 0 4px 20px rgba(0,0,0,0.08); text-align: center; }
        .cameraHeader h1 { font-size: var(--h1FontSize); color: var(--blackColor); font-weight: 700; margin-bottom: 0.5rem; }
        .cameraHeader p { font-size: var(--normalFontSize); color: var(--textColor); }
        .cameraContainer { background: var(--whiteColor); border-radius: 16px; padding: 2rem; box-shadow: 0 4px 20px rgba(0,0,0,0.08); margin-bottom: 2rem; display: flex; flex-direction: column; align-items: center; gap: 2rem; }
        .errorState { background: var(--inputColor); border-radius: 16px; padding: 4rem 2rem; text-align: center; border: 2px dashed var(--greyText); width: 384px; height: 518px; display: flex; flex-direction: column; align-items: center; justify-content: center; }
        .errorIcon { color: #ff4757; margin-bottom: 1rem; font-size: 4rem; }
        .errorText { font-size: var(--normalFontSize); color: var(--textColor); margin-bottom: 1.5rem; }
        .controlsGrid { display: flex; gap: 1rem; flex-wrap: wrap; justify-content: center; }
        .controlBtn { background: var(--PrimaryColor); color: var(--whiteColor); border: none; padding: 0.875rem 1.75rem; border-radius: 8px; font-size: var(--normalFontSize); font-weight: 600; cursor: pointer; transition: all 0.3s ease; display: flex; align-items: center; gap: 0.75rem; min-width: 160px; justify-content: center; }
        .controlBtn:hover { background: var(--HoverColor); transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0,0,0,0.15); }
        .controlBtn.secondary { background: var(--inputColor); color: var(--blackColor); border: 2px solid var(--itemCardHover); }
        .controlBtn.danger { background: #ff4757; }
        .recordingIndicator { background: #ff4757; color: var(--whiteColor); padding: 0.5rem 1rem; border-radius: 12px; font-size: var(--smallFontSize); font-weight: 600; display: flex; align-items: center; gap: 0.5rem; position: absolute; top: 1rem; left: 1rem; z-index: 100; }
        .recordingDot { width: 8px; height: 8px; background: var(--whiteColor); border-radius: 50%; animation: pulse 1.5s infinite; }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        .statusIndicator { padding: 0.75rem 1rem; border-radius: 8px; font-size: var(--normalFontSize); font-weight: 600; display: flex; align-items: center; gap: 0.5rem; margin-top: 1rem; width: 100%; max-width: 384px; justify-content: center; }
        .statusIndicator.success { background: rgba(16, 185, 129, 0.1); color: var(--successColor); }
        .statusIndicator.warning { background: rgba(245, 158, 11, 0.1); color: var(--warningColor); }
        .statusIndicator.error { background: rgba(255, 71, 87, 0.1); color: #ff4757; }
        .resultsSection, .historySection { background: var(--whiteColor); border-radius: 16px; padding: 2rem; box-shadow: 0 4px 20px rgba(0,0,0,0.08); margin-top: 2rem; width: 100%; max-width: 900px; }
        .sectionHeader { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1.5rem; color: var(--blackColor); }
        .sectionHeader h3 { font-size: var(--h2FontSize); font-weight: 700; }
        .videoPreview { margin-bottom: 2rem; }
        .previewVideo { width: 300px; height: 200px; border-radius: 12px; object-fit: cover; border: 2px solid var(--inputColor); }
        .loadingState { text-align: center; padding: 2rem; color: var(--textColor); }
        .loadingSpinner { width: 24px; height: 24px; border: 3px solid var(--inputColor); border-top: 3px solid var(--PrimaryColor); border-radius: 50%; animation: spin 1s linear infinite; display: inline-block; margin-right: 0.5rem; }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        .predictionGrid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem; }
        .predictionCard { background: var(--paleGreen); border: 1px solid var(--PrimaryColor); border-radius: 12px; padding: 1.5rem; text-align: center; transition: transform 0.2s ease; }
        .predictionCard:hover { transform: translateY(-2px); }
        .predictionValue { font-size: 2.5rem; font-weight: 700; color: var(--PrimaryColor); margin-bottom: 0.5rem; }
        .predictionLabel { font-size: var(--normalFontSize); color: var(--blackColor); font-weight: 600; }
        .predictionUnit { font-size: var(--smallFontSize); color: var(--textColor); }
        .historyList { list-style: none; padding: 0; display: flex; flex-direction: column; gap: 1rem; }
        .historyItem { display: flex; justify-content: space-between; align-items: center; padding: 1rem; background: var(--inputColor); border-radius: 8px; transition: background 0.2s; }
        .historyItem:hover { background: var(--itemCardHover); }
        .historyInfo { display: flex; flex-direction: column; }
        .historyDate { font-weight: 600; color: var(--blackColor); }
        .historyVitals { font-size: var(--smallFontSize); color: var(--textColor); }
        .modalOverlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center; z-index: 1000; }
        .modalContent { background: var(--whiteColor); padding: 2rem; border-radius: 16px; width: 90%; max-width: 600px; max-height: 80vh; overflow-y: auto; position: relative; }
        .modalClose { position: absolute; top: 1rem; right: 1rem; background: none; border: none; cursor: pointer; color: var(--greyText); font-size: 1.5rem; }
        @media screen and (max-width: 768px) { 
            .cameraSection { padding: 1rem; } 
            .cameraHeader { padding: 1.5rem; } 
            .cameraHeader h1 { font-size: 1.5rem; } 
            .cameraContainer { padding: 1rem; } 
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
                <button class="controlBtn" id="retryBtn">Try Again</button>
            </div>
            <div id="cameraInterface" style="display: none;">
                <div style="position: relative; width: 384px; height: 518px; border-radius: 1.5rem; overflow: hidden; border: 2px solid #e5e7eb; box-shadow: 0 4px 20px rgba(0,0,0,0.08);" id="videoContainer">
                    <video id="videoElement" autoplay playsinline muted style="width: 384px; height: 518px; object-fit: cover;"></video>
                    <canvas id="canvasElement" style="position: absolute; top: 0; left: 0; width: 384px; height: 518px; pointer-events: none; z-index: 20;"></canvas>
                    <div style="position: absolute; inset: 0; pointer-events: none; z-index: 30; backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(16px); -webkit-mask-image: radial-gradient(ellipse 61% 68% at 50% 50%, transparent 69%, black 71%); mask-image: radial-gradient(ellipse 61% 68% at 50% 50%, transparent 69%, black 71%); background: rgba(255,255,255,0.10);"></div>
                    <div style="position: absolute; left: 6%; top: 4%; width: 88%; height: 92%; border: 5px dashed #fff; border-radius: 50%; z-index: 31; pointer-events: none;"></div>
                    <div style="position: absolute; width: 100%; mb-3 text-align: center; color: #fff; font-weight: 600; font-size: 1.15rem; text-shadow: 0 2px 12px #003046cc; top: 14px; left: 0; z-index: 40; pointer-events: none;">Place your face in the oval</div>
                    <div id="recordingIndicator" class="recordingIndicator" style="display: none;">
                        <div class="recordingDot"></div>
                        <span id="recordingTime">REC 00:00</span>
                    </div>
                </div>
                <div id="statusIndicator" style="display: none;"></div>
                <div class="controlsGrid">
                    <button id="startBtn" class="controlBtn">Start Recording</button>
                    <button id="stopBtn" class="controlBtn danger" style="display: none;">Stop Recording</button>
                    <button id="recordAgainBtn" class="controlBtn" style="display: none;">Record Again</button>
                </div>
            </div>
        </div>
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
    <div id="scanModal" class="modalOverlay" style="display: none;">
        <div class="modalContent">
            <button class="modalClose" id="modalCloseBtn">×</button>
            <div id="modalBody"></div>
        </div>
    </div>
    <script>
        let videoRef, canvasRef, mediaRecorderRef, recordingTimerRef, stream = null;
        let faceMesh = null;
        let camera = null;
        let isRecording = false, recordingDuration = 0;
        let recordedVideoUrl = null, aiPrediction = null, scanHistory = [];
        const API_BASE_URL = "https://facevital-backend-3.onrender.com";
        const AI_API_URL = "https://anurudh-268064419384.asia-east1.run.app/analyze";
        const WIDTH = 384, HEIGHT = 518;

        function formatTime(s) { 
            const m = Math.floor(s / 60); 
            return m.toString().padStart(2, "0") + ":" + (s % 60).toString().padStart(2, "0"); 
        }

        function showStatus(msg, type) { 
            const el = document.getElementById("statusIndicator"); 
            el.className = "statusIndicator " + type; 
            el.textContent = msg; 
            el.style.display = "flex"; 
        }

        function hideStatus() { 
            document.getElementById("statusIndicator").style.display = "none"; 
        }

        function getAuthHeaders() { 
            const token = localStorage.getItem("authToken"); 
            return token ? { Authorization: "Bearer " + token } : null; 
        }

        function getCanvasDimensions() {
            return { width: WIDTH, height: HEIGHT };
        }

        // Helper function to draw connectors
        function drawConnectors(ctx, landmarks, connections, style) {
            if (!landmarks || !connections) return;
            
            ctx.strokeStyle = style.color;
            ctx.lineWidth = style.lineWidth;
            
            for (const connection of connections) {
                const start = landmarks[connection[0]];
                const end = landmarks[connection[1]];
                
                if (start && end) {
                    ctx.beginPath();
                    ctx.moveTo(start.x * ctx.canvas.width, start.y * ctx.canvas.height);
                    ctx.lineTo(end.x * ctx.canvas.width, end.y * ctx.canvas.height);
                    ctx.stroke();
                }
            }
        }

        // FIXED: Proper MediaPipe script loading with sequence
        function loadMediaPipeScripts() {
            return new Promise((resolve, reject) => {
                const scripts = [
                    "https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/drawing_utils.js",
                    "https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js",
                    "https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/face_mesh.js"
                ];
                
                let loadedCount = 0;
                
                function loadScript(index) {
                    if (index >= scripts.length) {
                        resolve();
                        return;
                    }
                    
                    const script = document.createElement("script");
                    script.src = scripts[index];
                    script.crossOrigin = "anonymous";
                    script.onload = () => {
                        loadedCount++;
                        console.log("Loaded MediaPipe script:", scripts[index]);
                        loadScript(index + 1);
                    };
                    script.onerror = () => reject(new Error("Failed to load: " + scripts[index]));
                    document.head.appendChild(script);
                }
                
                loadScript(0);
            });
        }

        // FIXED: Initialize MediaPipe FaceMesh properly
        async function initializeFaceMesh() {
            if (typeof FaceMesh === 'undefined') {
                throw new Error("FaceMesh not loaded");
            }

            faceMesh = new FaceMesh({
                locateFile: (file) => {
                    return \`https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/\${file}\`;
                }
            });

            faceMesh.setOptions({
                maxNumFaces: 1,
                refineLandmarks: true,
                minDetectionConfidence: 0.5,
                minTrackingConfidence: 0.5
            });

            faceMesh.onResults(onFaceMeshResults);
            console.log("FaceMesh initialized");
        }

        
       function onFaceMeshResults(results) {
            if (!canvasRef) return;
            
            const dims = getCanvasDimensions();
            canvasRef.width = dims.width;
            canvasRef.height = dims.height;
            
            const ctx = canvasRef.getContext('2d');
            ctx.save();
            ctx.clearRect(0, 0, dims.width, dims.height);
            
            // Draw the video frame
            ctx.drawImage(results.image, 0, 0, dims.width, dims.height);

            if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
                // Calculate bounding box for FACE ONLY
                const landmarks = results.multiFaceLandmarks[0];
                
                let minX = 1, maxX = 0, minY = 1, maxY = 0;
                landmarks.forEach(landmark => {
                    minX = Math.min(minX, landmark.x);
                    maxX = Math.max(maxX, landmark.x);
                    minY = Math.min(minY, landmark.y);
                    maxY = Math.max(maxY, landmark.y);
                });
                
                // Small padding for face only (no body)
                const paddingX = 0.15;
                const paddingTop = 0.15;
                const paddingBottom = 0.15;
                
                minX = Math.max(0, minX - paddingX);
                maxX = Math.min(1, maxX + paddingX);
                minY = Math.max(0, minY - paddingTop);
                maxY = Math.min(1, maxY + paddingBottom);
                
                // Create a temporary canvas for blur effect
                const tempCanvas = document.createElement('canvas');
                tempCanvas.width = dims.width;
                tempCanvas.height = dims.height;
                const tempCtx = tempCanvas.getContext('2d');
                
                // Draw original image
                tempCtx.drawImage(results.image, 0, 0, dims.width, dims.height);
                
                // Apply blur to entire image
                tempCtx.filter = 'blur(20px) brightness(0.5)';
                tempCtx.drawImage(tempCanvas, 0, 0);
                tempCtx.filter = 'none';
                
                // Draw blurred background
                ctx.drawImage(tempCanvas, 0, 0);
                
                // Clear person area and draw sharp version
                ctx.save();
                ctx.beginPath();
                const centerX = ((minX + maxX) / 2) * dims.width;
                const centerY = ((minY + maxY) / 2) * dims.height;
                const radiusX = ((maxX - minX) / 2) * dims.width;
                const radiusY = ((maxY - minY) / 2) * dims.height;
                ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, 2 * Math.PI);
                ctx.clip();
                
                // Draw clear person
                ctx.drawImage(results.image, 0, 0, dims.width, dims.height);
                ctx.restore();
                
                // Draw white professional mesh
                if (typeof FACEMESH_TESSELATION !== 'undefined') {
                    for (const landmarks of results.multiFaceLandmarks) {
                        drawConnectors(ctx, landmarks, FACEMESH_TESSELATION, { color: '#FFFFFF', lineWidth: 1 });
                        drawConnectors(ctx, landmarks, FACEMESH_FACE_OVAL, { color: '#FFFFFF', lineWidth: 2 });
                        drawConnectors(ctx, landmarks, FACEMESH_RIGHT_EYE, { color: '#FFFFFF', lineWidth: 1.5 });
                        drawConnectors(ctx, landmarks, FACEMESH_LEFT_EYE, { color: '#FFFFFF', lineWidth: 1.5 });
                        drawConnectors(ctx, landmarks, FACEMESH_RIGHT_EYEBROW, { color: '#FFFFFF', lineWidth: 1.5 });
                        drawConnectors(ctx, landmarks, FACEMESH_LEFT_EYEBROW, { color: '#FFFFFF', lineWidth: 1.5 });
                        drawConnectors(ctx, landmarks, FACEMESH_LIPS, { color: '#FFFFFF', lineWidth: 1.5 });
                        
                        for (const landmark of landmarks) {
                            ctx.beginPath();
                            ctx.arc(landmark.x * dims.width, landmark.y * dims.height, 1.5, 0, 2 * Math.PI);
                            ctx.fillStyle = '#FFFFFF';
                            ctx.fill();
                        }
                    }
                }
            } else {
                // No face detected - show slight blur
                const tempCanvas = document.createElement('canvas');
                tempCanvas.width = dims.width;
                tempCanvas.height = dims.height;
                const tempCtx = tempCanvas.getContext('2d');
                tempCtx.drawImage(results.image, 0, 0, dims.width, dims.height);
                tempCtx.filter = 'blur(8px) brightness(0.7)';
                tempCtx.drawImage(tempCanvas, 0, 0);
                ctx.drawImage(tempCanvas, 0, 0);
            }

            ctx.restore();
        }

        async function initializeScanner() { 
            try { 
                console.log("Loading MediaPipe scripts...");
                await loadMediaPipeScripts(); 
                
                console.log("Initializing FaceMesh...");
                await initializeFaceMesh();
                
                console.log("Starting camera...");
                await startCamera(); 
                
                setupEventListeners(); 
                await fetchScanHistory(); 
                
                document.getElementById("loadingState").style.display = "none"; 
                document.getElementById("cameraInterface").style.display = "block"; 
                console.log("Scanner initialized successfully");
            } catch (error) { 
                console.error("Init failed:", error); 
                showError(error.message || "Failed to initialize"); 
            } 
        }

        async function startCamera() { 
            try { 
                videoRef = document.getElementById("videoElement");
                canvasRef = document.getElementById("canvasElement");
                
                if (stream) stream.getTracks().forEach(t => t.stop()); 
                
                stream = await navigator.mediaDevices.getUserMedia({ 
                    video: { width: WIDTH, height: HEIGHT, facingMode: "user" }, 
                    audio: false 
                }); 
                
                videoRef.srcObject = stream;
                
                // Start MediaPipe camera
                if (typeof Camera !== 'undefined' && faceMesh) {
                    camera = new Camera(videoRef, {
                        onFrame: async () => {
                            await faceMesh.send({image: videoRef});
                        },
                        width: WIDTH,
                        height: HEIGHT
                    });
                    camera.start();
                    console.log("MediaPipe camera started");
                }
            } catch (error) { 
                throw new Error("Camera access denied. Please allow camera permissions."); 
            } 
        }

        function setupEventListeners() { 
            document.getElementById("startBtn").addEventListener("click", startRecording); 
            document.getElementById("stopBtn").addEventListener("click", stopRecording); 
            document.getElementById("recordAgainBtn").addEventListener("click", startRecording);
            document.getElementById("retryBtn").addEventListener("click", () => window.location.reload());
            document.getElementById("modalCloseBtn").addEventListener("click", closeScanModal);
        }

        function startRecording() { 
            if (!stream) return; 
            resetAll(); 
            isRecording = true; 
            recordingDuration = 0; 
            document.getElementById("startBtn").style.display = "none"; 
            document.getElementById("stopBtn").style.display = "block"; 
            document.getElementById("recordAgainBtn").style.display = "none"; 
            document.getElementById("recordingIndicator").style.display = "flex"; 
            document.getElementById("videoContainer").style.border = "4px solid #ff4757"; 
            
            const chunks = []; 
          mediaRecorderRef = new MediaRecorder(stream, { mimeType: "video/webm;codecs=vp9" });
            
            mediaRecorderRef.ondataavailable = e => { 
                if (e.data.size > 0) chunks.push(e.data); 
            }; 
            
            mediaRecorderRef.onstop = async () => { 
                if (recordingTimerRef) { 
                    clearInterval(recordingTimerRef); 
                    recordingTimerRef = null; 
                } 
                isRecording = false; 
                document.getElementById("recordingIndicator").style.display = "none"; 
                document.getElementById("videoContainer").style.border = "2px solid #e5e7eb"; 
                document.getElementById("stopBtn").style.display = "none"; 
                document.getElementById("recordAgainBtn").style.display = "block"; 
                
                const blob = new Blob(chunks, { type: "video/webm" });
                recordedVideoUrl = URL.createObjectURL(blob); 
              await callAIAPI(blob);
            }; 
            
            mediaRecorderRef.start(); 
            
            recordingTimerRef = setInterval(() => { 
                recordingDuration++; 
                document.getElementById("recordingTime").textContent = "REC " + formatTime(recordingDuration); 
                if (recordingDuration >= 30) stopRecording(); 
            }, 1000); 
        }

        function stopRecording() { 
            if (mediaRecorderRef && mediaRecorderRef.state === "recording") {
                mediaRecorderRef.stop(); 
            }
        }

        async function callAIAPI(blob) { 
            showStatus("Analyzing video...", "warning"); 
            try { 
                const fd = new FormData(); 
                fd.append("file", blob, "scan.webm"); 
                const res = await axios.post(AI_API_URL, fd, { 
                    headers: { "Content-Type": "multipart/form-data" }, 
                    timeout: 120000 
                }); 
                const pred = res.data; 
                
                if (typeof pred === "object" && pred && !pred.error) { 
                    aiPrediction = { 
                        heartRate: pred.heart_rate_bpm, 
                        bloodPressure: { 
                            systolic: pred.blood_pressure?.systolic, 
                            diastolic: pred.blood_pressure?.diastolic 
                        }, 
                        oxygenSaturation: pred.spo2_percent, 
                        stressLevel: pred.stress_indicator ? (pred.stress_indicator * 100).toFixed(1) : null 
                    }; 
                    await saveToDatabase(aiPrediction, blob); 
                    displayResults(); 
                } else {
                    throw new Error(pred.error || "Invalid AI response"); 
                }
            } catch (error) { 
                console.error("AI Error:", error); 
                showStatus("Analysis failed: " + error.message, "error"); 
            } 
        }

        async function saveToDatabase(pred, blob) { 
            const auth = getAuthHeaders(); 
            if (!auth) { 
                console.log("No auth, skipping save"); 
                showStatus("Analysis complete! (Not saved - login required)", "success");
                return; 
            } 
            try { 
                const fd = new FormData(); 
                fd.append("video", blob, "scan.webm"); 
                fd.append("predictions", JSON.stringify(pred)); 
                fd.append("heartRate", pred.heartRate || ""); 
                fd.append("scanDuration", recordingDuration); 
                await axios.post(API_BASE_URL + "/api/scan/saveHealthData", fd, { 
                    headers: { ...auth, "Content-Type": "multipart/form-data" } 
                }); 
                showStatus("Complete! Data saved.", "success"); 
                fetchScanHistory(); 
            } catch (error) { 
                console.error("Save error:", error); 
                showStatus("Analysis complete but save failed", "warning"); 
            } 
        }

        function displayResults() { 
            if (!aiPrediction) return; 
            document.getElementById("previewVideo").src = recordedVideoUrl; 
            const hr = aiPrediction.heartRate || "--";
            const bp = (aiPrediction.bloodPressure?.systolic && aiPrediction.bloodPressure?.diastolic) 
                ? aiPrediction.bloodPressure.systolic + "/" + aiPrediction.bloodPressure.diastolic 
                : "--/--";
            const o2 = aiPrediction.oxygenSaturation || "--";
            const stress = aiPrediction.stressLevel || "--";
            
            document.getElementById("predictionGrid").innerHTML = 
                '<div class="predictionCard"><div class="predictionValue">' + hr + '</div><div class="predictionLabel">Heart Rate</div><div class="predictionUnit">BPM</div></div>' +
                '<div class="predictionCard"><div class="predictionValue">' + bp + '</div><div class="predictionLabel">Blood Pressure</div><div class="predictionUnit">mmHg</div></div>' +
                '<div class="predictionCard"><div class="predictionValue">' + o2 + '</div><div class="predictionLabel">Oxygen Saturation</div><div class="predictionUnit">%</div></div>' +
                '<div class="predictionCard"><div class="predictionValue">' + stress + '</div><div class="predictionLabel">Stress Level</div><div class="predictionUnit">%</div></div>';
            
            document.getElementById("resultsSection").style.display = "block"; 
        }

        async function fetchScanHistory() { 
            const auth = getAuthHeaders(); 
            if (!auth) { 
                document.getElementById("historyContent").innerHTML = '<p style="text-align:center;color:var(--textColor)">Login required to view scan history</p>'; 
                return; 
            } 
            try { 
                const res = await axios.get(API_BASE_URL + "/api/scan/getScanHistory?limit=5", { 
                    headers: auth 
                }); 
                scanHistory = res.data.results || []; 
                displayScanHistory(); 
            } catch (error) { 
                console.error("History error:", error); 
                document.getElementById("historyContent").innerHTML = '<p style="text-align:center;color:var(--textColor)">Failed to load history</p>'; 
            } 
        }

        function displayScanHistory() { 
            const el = document.getElementById("historyContent"); 
            if (scanHistory.length === 0) { 
                el.innerHTML = '<p style="text-align:center;color:var(--textColor)">No scan history found</p>'; 
                return; 
            } 
            
            let html = '<ul class="historyList">';
            scanHistory.forEach(s => {
                const date = new Date(s.timestamp).toLocaleString();
                const hr = s.heartRate || "N/A";
                html += '<li class="historyItem">' +
                    '<div class="historyInfo">' +
                    '<span class="historyDate">' + date + '</span>' +
                    '<span class="historyVitals">HR: ' + hr + '</span>' +
                    '</div>' +
                    '<button class="controlBtn secondary scan-detail-btn" style="min-width:120px;padding:0.5rem 1rem;" data-id="' + s._id + '">View</button>' +
                    '</li>';
            });
            html += '</ul>';
            el.innerHTML = html;
            
            document.querySelectorAll('.scan-detail-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    fetchScanDetails(this.getAttribute('data-id'));
                });
            });
        }

        async function fetchScanDetails(id) { 
            const auth = getAuthHeaders(); 
            if (!auth) return; 
            try { 
                const res = await axios.get(API_BASE_URL + "/api/scan/" + id, { 
                    headers: auth 
                }); 
                const scan = res.data.scan; 
                const date = new Date(scan.timestamp).toLocaleString();
                const hr = scan.heartRate || "--";
                const bp = (scan.predictions?.bloodPressure?.systolic && scan.predictions?.bloodPressure?.diastolic)
                    ? scan.predictions.bloodPressure.systolic + "/" + scan.predictions.bloodPressure.diastolic
                    : "--/--";
                const o2 = scan.predictions?.oxygenSaturation || "--";
                const stress = scan.predictions?.stressLevel || "--";
                
                document.getElementById("modalBody").innerHTML = 
                    '<h2>Scan Details</h2>' +
                    '<p><strong>Date:</strong> ' + date + '</p>' +
                    '<div class="predictionGrid" style="margin-top:1.5rem;">' +
                    '<div class="predictionCard"><div class="predictionValue">' + hr + '</div><div class="predictionLabel">Heart Rate</div><div class="predictionUnit">BPM</div></div>' +
                    '<div class="predictionCard"><div class="predictionValue">' + bp + '</div><div class="predictionLabel">Blood Pressure</div><div class="predictionUnit">mmHg</div></div>' +
                    '<div class="predictionCard"><div class="predictionValue">' + o2 + '</div><div class="predictionLabel">Oxygen Saturation</div><div class="predictionUnit">%</div></div>' +
                    '<div class="predictionCard"><div class="predictionValue">' + stress + '</div><div class="predictionLabel">Stress Level</div><div class="predictionUnit">%</div></div>' +
                    '</div>';
                
                document.getElementById("scanModal").style.display = "flex"; 
            } catch (error) { 
                console.error("Fetch details error:", error); 
                alert("Failed to load scan details");
            } 
        }

        function closeScanModal() { 
            document.getElementById("scanModal").style.display = "none"; 
        }

        function resetAll() { 
            isRecording = false; 
            recordingDuration = 0; 
            recordedVideoUrl = null; 
            aiPrediction = null; 
            if (recordingTimerRef) { 
                clearInterval(recordingTimerRef); 
                recordingTimerRef = null; 
            } 
            hideStatus(); 
            document.getElementById("resultsSection").style.display = "none"; 
            document.getElementById("startBtn").style.display = "block"; 
            document.getElementById("stopBtn").style.display = "none"; 
            document.getElementById("recordAgainBtn").style.display = "none"; 
        }

        function showError(msg) { 
            document.getElementById("loadingState").style.display = "none"; 
            document.getElementById("cameraInterface").style.display = "none"; 
            document.getElementById("errorText").textContent = msg; 
            document.getElementById("errorState").style.display = "flex"; 
        }

        document.addEventListener("DOMContentLoaded", initializeScanner);
    </script>
</body>
</html>`;

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.send(html);
  } catch (error) {
    console.error('Error serving health scanner page:', error);
    res.status(500).json({
      success: false,
      message: "Failed to load health scanner",
      error: error.message
    });
  }
}

// Routes
app.get('/', getpage);
app.get('/scanner', getpage);
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Optional video upload endpoint
app.post('/api/upload-video', upload.single('video'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No video file uploaded' });
    }
    res.json({
      success: true,
      message: 'Video uploaded',
      filename: req.file.filename
    });
  } catch (error) {
    res.status(500).json({ error: 'Upload failed' });
  }
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ success: false, message: err.message });
});

app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
