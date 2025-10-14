// // require('dotenv').config();
// // const App = require('./src/app');

// // const PORT = process.env.PORT || 5000;

// // const app = new App();
// // app.start(PORT);
// const express = require('express');
// const cors = require('cors');
// const multer = require('multer');
// const path = require('path');
// const fs = require('fs');
// const rateLimit = require('express-rate-limit');

// const app = express();
// const PORT = process.env.PORT || 5000;

// app.set('trust proxy', 1);

// // Middleware
// app.use(cors());
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// // Rate limiting
// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000,
//   max: 100,
//   standardHeaders: true,
//   legacyHeaders: false,
// });
// app.use(limiter);

// // Create uploads directory
// const uploadsDir = path.join(__dirname, 'uploads');
// if (!fs.existsSync(uploadsDir)) {
//   fs.mkdirSync(uploadsDir, { recursive: true });
// }

// // Multer configuration
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, uploadsDir);
//   },
//   filename: (req, file, cb) => {
//     const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
//     cb(null, 'scan-' + uniqueSuffix + path.extname(file.originalname));
//   }
// });

// const upload = multer({
//   storage: storage,
//   limits: { fileSize: 50 * 1024 * 1024 },
//   fileFilter: (req, file, cb) => {
//     const allowedTypes = ['video/webm', 'video/mp4'];
//     if (allowedTypes.includes(file.mimetype)) {
//       cb(null, true);
//     } else {
//       cb(new Error('Invalid file type'));
//     }
//   }
// });

// // Controller function with FIXED MediaPipe loading
// async function getpage(req, res, next) {
//   try {
//     const html = `<!DOCTYPE html>
// <html lang="en">
// <head>
//     <meta charset="UTF-8">
//     <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
//     <title>Health Vitals Scanner</title>
//     <script src="https://cdnjs.cloudflare.com/ajax/libs/axios/1.4.0/axios.min.js"></script>
//     <style>
//         :root {
//             --PrimaryColor: #5eaa3c; --HoverColor: #4a8530; --paleGreen: #f0f8eb;
//             --whiteColor: #ffffff; --blackColor: #2c3e50; --greyText: #718096;
//             --textColor: #64748b; --bgColor: #f8fafc; --inputColor: #f1f5f9;
//             --itemCardHover: #e2e8f0; --successColor: #10b981; --warningColor: #f59e0b;
//             --h1FontSize: 2rem; --h2FontSize: 1.5rem; --normalFontSize: 1rem;
//             --smallFontSize: 0.875rem;
//         }
//         * { box-sizing: border-box; margin: 0; padding: 0; }
//         body { 
//             font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; 
//             background: var(--bgColor); 
//             min-height: 100vh;
//             overflow-x: hidden;
//         }
//         .cameraSection { 
//             min-height: 100vh; 
//             background: var(--bgColor); 
//             padding: 1rem;
//             display: flex;
//             flex-direction: column;
//             align-items: center;
//         }
//         .cameraHeader { 
//             background: var(--whiteColor); 
//             padding: 1.5rem; 
//             border-radius: 16px; 
//             margin-bottom: 1.5rem; 
//             box-shadow: 0 4px 20px rgba(0,0,0,0.08); 
//             text-align: center;
//             width: 100%;
//             max-width: 900px;
//         }
//         .cameraHeader h1 { 
//             font-size: clamp(1.25rem, 5vw, 2rem);
//             color: var(--blackColor); 
//             font-weight: 700; 
//             margin-bottom: 0.5rem; 
//         }
//         .cameraHeader p { 
//             font-size: clamp(0.875rem, 3vw, 1rem);
//             color: var(--textColor); 
//         }
//         .cameraContainer { 
//             background: var(--whiteColor); 
//             border-radius: 16px; 
//             padding: 1.5rem; 
//             box-shadow: 0 4px 20px rgba(0,0,0,0.08); 
//             margin-bottom: 1.5rem;
//             display: flex; 
//             flex-direction: column; 
//             align-items: center; 
//             gap: 1.5rem;
//             width: 100%;
//             max-width: 900px;
//         }
//         .errorState { 
//             background: var(--inputColor); 
//             border-radius: 16px; 
//             padding: 2rem 1rem; 
//             text-align: center; 
//             border: 2px dashed var(--greyText); 
//             width: 100%;
//             max-width: 384px;
//             min-height: 300px;
//             display: flex; 
//             flex-direction: column; 
//             align-items: center; 
//             justify-content: center; 
//         }
//         .errorIcon { 
//             color: #ff4757; 
//             margin-bottom: 1rem; 
//             font-size: clamp(2.5rem, 8vw, 4rem);
//         }
//         .errorText { 
//             font-size: var(--normalFontSize); 
//             color: var(--textColor); 
//             margin-bottom: 1.5rem; 
//         }
//         .controlsGrid { 
//             display: flex; 
//             gap: 1rem; 
//             flex-wrap: wrap; 
//             justify-content: center;
//             width: 100%;
//             max-width: 384px;
//         }
//         .controlBtn { 
//             background: var(--PrimaryColor); 
//             color: var(--whiteColor); 
//             border: none; 
//             padding: 0.875rem 1.5rem; 
//             border-radius: 8px; 
//             font-size: var(--normalFontSize); 
//             font-weight: 600; 
//             cursor: pointer; 
//             transition: all 0.3s ease; 
//             display: flex; 
//             align-items: center; 
//             justify-content: center;
//             gap: 0.75rem; 
//             min-width: 140px;
//             flex: 1;
//             min-height: 48px;
//             touch-action: manipulation;
//         }
//         .controlBtn:hover { 
//             background: var(--HoverColor); 
//             transform: translateY(-2px); 
//             box-shadow: 0 6px 20px rgba(0,0,0,0.15); 
//         }
//         .controlBtn.secondary { 
//             background: var(--inputColor); 
//             color: var(--blackColor); 
//             border: 2px solid var(--itemCardHover); 
//         }
//         .controlBtn.danger { 
//             background: #ff4757; 
//         }
//         .recordingIndicator { 
//             background: #ff4757; 
//             color: var(--whiteColor); 
//             padding: 0.5rem 1rem; 
//             border-radius: 12px; 
//             font-size: var(--smallFontSize); 
//             font-weight: 600; 
//             display: flex; 
//             align-items: center; 
//             gap: 0.5rem; 
//             position: absolute; 
//             top: 0.5rem; 
//             left: 0.5rem; 
//             z-index: 100; 
//         }
//         .recordingDot { 
//             width: 8px; 
//             height: 8px; 
//             background: var(--whiteColor); 
//             border-radius: 50%; 
//             animation: pulse 1.5s infinite; 
//         }
//         @keyframes pulse { 
//             0%, 100% { opacity: 1; } 
//             50% { opacity: 0.5; } 
//         }
//         .statusIndicator { 
//             padding: 0.75rem 1rem; 
//             border-radius: 8px; 
//             font-size: var(--normalFontSize); 
//             font-weight: 600; 
//             display: flex; 
//             align-items: center; 
//             gap: 0.5rem; 
//             margin-top: 1rem; 
//             width: 100%; 
//             max-width: 384px; 
//             justify-content: center; 
//         }
//         .statusIndicator.success { 
//             background: rgba(16, 185, 129, 0.1); 
//             color: var(--successColor); 
//         }
//         .statusIndicator.warning { 
//             background: rgba(245, 158, 11, 0.1); 
//             color: var(--warningColor); 
//         }
//         .statusIndicator.error { 
//             background: rgba(255, 71, 87, 0.1); 
//             color: #ff4757; 
//         }
//         .resultsSection, .historySection { 
//             background: var(--whiteColor); 
//             border-radius: 16px; 
//             padding: 1.5rem; 
//             box-shadow: 0 4px 20px rgba(0,0,0,0.08); 
//             margin-top: 1.5rem; 
//             width: 100%; 
//             max-width: 900px; 
//         }
//         .sectionHeader { 
//             display: flex; 
//             align-items: center; 
//             gap: 0.5rem; 
//             margin-bottom: 1.5rem; 
//             color: var(--blackColor); 
//         }
//         .sectionHeader h3 { 
//             font-size: clamp(1.125rem, 4vw, 1.5rem);
//             font-weight: 700; 
//         }
//         .videoPreview { 
//             margin-bottom: 1.5rem; 
//         }
//         .previewVideo { 
//             width: 100%;
//             max-width: 384px;
//             height: auto;
//             aspect-ratio: 384/518;
//             border-radius: 12px; 
//             object-fit: cover; 
//             border: 2px solid var(--inputColor);
//             display: block;
//             margin: 0 auto;
//         }
//         .loadingState { 
//             text-align: center; 
//             padding: 2rem 1rem; 
//             color: var(--textColor); 
//         }
//         .loadingSpinner { 
//             width: 24px; 
//             height: 24px; 
//             border: 3px solid var(--inputColor); 
//             border-top: 3px solid var(--PrimaryColor); 
//             border-radius: 50%; 
//             animation: spin 1s linear infinite; 
//             display: inline-block; 
//             margin-right: 0.5rem; 
//         }
//         @keyframes spin { 
//             0% { transform: rotate(0deg); } 
//             100% { transform: rotate(360deg); } 
//         }
//         .predictionGrid { 
//             display: grid; 
//             grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); 
//             gap: 1rem;
//         }
//         .predictionCard { 
//             background: var(--paleGreen); 
//             border: 1px solid var(--PrimaryColor); 
//             border-radius: 12px; 
//             padding: 1.25rem; 
//             text-align: center; 
//             transition: transform 0.2s ease; 
//         }
//         .predictionCard:hover { 
//             transform: translateY(-2px); 
//         }
//         .predictionValue { 
//             font-size: clamp(1.75rem, 6vw, 2.5rem);
//             font-weight: 700; 
//             color: var(--PrimaryColor); 
//             margin-bottom: 0.5rem;
//             word-break: break-word;
//         }
//         .predictionLabel { 
//             font-size: clamp(0.875rem, 3vw, 1rem);
//             color: var(--blackColor); 
//             font-weight: 600; 
//         }
//         .predictionUnit { 
//             font-size: var(--smallFontSize); 
//             color: var(--textColor); 
//         }
//         .historyList { 
//             list-style: none; 
//             padding: 0; 
//             display: flex; 
//             flex-direction: column; 
//             gap: 1rem; 
//         }
//         .historyItem { 
//             display: flex; 
//             flex-direction: column;
//             gap: 0.75rem;
//             padding: 1rem; 
//             background: var(--inputColor); 
//             border-radius: 8px; 
//             transition: background 0.2s; 
//         }
//         .historyItem:hover { 
//             background: var(--itemCardHover); 
//         }
//         .historyInfo { 
//             display: flex; 
//             flex-direction: column;
//             gap: 0.25rem;
//         }
//         .historyDate { 
//             font-weight: 600; 
//             color: var(--blackColor);
//             font-size: clamp(0.875rem, 3vw, 1rem);
//         }
//         .historyVitals { 
//             font-size: var(--smallFontSize); 
//             color: var(--textColor); 
//         }
//         .modalOverlay { 
//             position: fixed; 
//             top: 0; 
//             left: 0; 
//             right: 0; 
//             bottom: 0; 
//             background: rgba(0,0,0,0.6); 
//             display: flex; 
//             align-items: center; 
//             justify-content: center; 
//             z-index: 1000;
//             padding: 1rem;
//         }
//         .modalContent { 
//             background: var(--whiteColor); 
//             padding: 1.5rem; 
//             border-radius: 16px; 
//             width: 100%;
//             max-width: 600px; 
//             max-height: 90vh; 
//             overflow-y: auto; 
//             position: relative; 
//         }
//         .modalClose { 
//             position: absolute; 
//             top: 1rem; 
//             right: 1rem; 
//             background: none; 
//             border: none; 
//             cursor: pointer; 
//             color: var(--greyText); 
//             font-size: 1.5rem;
//             width: 32px;
//             height: 32px;
//             display: flex;
//             align-items: center;
//             justify-content: center;
//         }
//         #videoContainer {
//             position: relative;
//             width: 100%;
//             max-width: 384px;
//             aspect-ratio: 384/518;
//             border-radius: 1.5rem;
//             overflow: hidden;
//             border: 2px solid #e5e7eb;
//             box-shadow: 0 4px 20px rgba(0,0,0,0.08);
//             margin: 0 auto;
//             background: #000;
//         }
//         #videoElement {
//             position: absolute;
//             top: 0;
//             left: 0;
//             width: 100%;
//             height: 100%;
//             object-fit: cover;
//         }
//         #canvasElement {
//             position: absolute;
//             top: 0;
//             left: 0;
//             width: 100%;
//             height: 100%;
//             pointer-events: none;
//             z-index: 20;
//         }
//         @media screen and (min-width: 480px) {
//             .historyItem {
//                 flex-direction: row;
//                 justify-content: space-between;
//                 align-items: center;
//             }
//             .controlsGrid {
//                 flex-wrap: nowrap;
//             }
//         }
//         @media screen and (max-width: 479px) { 
//             .cameraSection { 
//                 padding: 0.75rem; 
//             } 
//             .cameraHeader { 
//                 padding: 1rem; 
//                 margin-bottom: 1rem;
//             } 
//             .cameraContainer { 
//                 padding: 1rem; 
//                 gap: 1rem;
//             }
//             .controlBtn {
//                 width: 100%;
//                 min-width: unset;
//             }
//             .predictionGrid { 
//                 grid-template-columns: 1fr; 
//             }
//             .resultsSection, .historySection {
//                 padding: 1rem;
//                 margin-top: 1rem;
//             }
//         }
//     </style>
// </head>
// <body>
//     <div class="cameraSection">
//         <div class="cameraHeader">
//             <h1>Health Vitals Scanner</h1>
//             <p>Position your face in frame and record for 30 seconds.</p>
//         </div>
//         <div class="cameraContainer">
//             <div class="loadingState" id="loadingState">
//                 <div class="loadingSpinner"></div>
//                 <p>Loading scanner...</p>
//             </div>
//             <div id="errorState" class="errorState" style="display: none;">
//                 <div class="errorIcon">⚠</div>
//                 <p class="errorText" id="errorText">Failed to access camera</p>
//                 <button class="controlBtn" id="retryBtn">Try Again</button>
//             </div>
//             <div id="cameraInterface" style="display: none; width: 100%;">
//                 <div id="videoContainer">
//                     <video id="videoElement" autoplay playsinline muted></video>
//                     <canvas id="canvasElement"></canvas>
//                     <div id="recordingIndicator" class="recordingIndicator" style="display: none;">
//                         <div class="recordingDot"></div>
//                         <span id="recordingTime">REC 00:00</span>
//                     </div>
//                 </div>
//                 <div id="statusIndicator" style="display: none;"></div>
//                 <div class="controlsGrid">
//                     <button id="startBtn" class="controlBtn">Start Scan</button>
//                     <button id="stopBtn" class="controlBtn danger" style="display: none;">Stop Recording</button>
//                     <button id="recordAgainBtn" class="controlBtn" style="display: none;">Record Again</button>
//                 </div>
//             </div>
//         </div>
//         <div id="resultsSection" class="resultsSection" style="display: none;">
//             <div class="sectionHeader">
//                 <span style="font-size: 1.5rem;">📊</span>
//                 <h3>Analysis Results</h3>
//             </div>
//             <div class="videoPreview">
//                 <h4 style="color: var(--blackColor); margin-bottom: 1rem;">Recorded Video:</h4>
//                 <video id="previewVideo" class="previewVideo" controls></video>
//             </div>
//             <div id="predictionGrid" class="predictionGrid"></div>
//         </div>
//         <div class="historySection">
//             <div class="sectionHeader">
//                 <span style="font-size: 1.5rem;">🕒</span>
//                 <h3>Recent Scans</h3>
//             </div>
//             <div id="historyContent">
//                 <p style="text-align:center;color:var(--textColor)">No scan history available</p>
//             </div>
//         </div>
//     </div>
//     <div id="scanModal" class="modalOverlay" style="display: none;">
//         <div class="modalContent">
//             <button class="modalClose" id="modalCloseBtn">×</button>
//             <div id="modalBody"></div>
//         </div>
//     </div>
//     <script>
//         let videoRef, canvasRef, mediaRecorderRef, recordingTimerRef, stream = null;
//         let faceMesh = null;
//         let camera = null;
//         let isRecording = false, recordingDuration = 0;
//         let recordedVideoUrl = null, aiPrediction = null;
//         const AI_API_URL = "https://anurudh-268064419384.asia-east1.run.app/analyze";
//         const WIDTH = 384, HEIGHT = 518;

//         function formatTime(s) { 
//             const m = Math.floor(s / 60); 
//             return m.toString().padStart(2, "0") + ":" + (s % 60).toString().padStart(2, "0"); 
//         }

//         function showStatus(msg, type) { 
//             const el = document.getElementById("statusIndicator"); 
//             el.className = "statusIndicator " + type; 
//             el.textContent = msg; 
//             el.style.display = "flex"; 
//         }

//         function hideStatus() { 
//             document.getElementById("statusIndicator").style.display = "none"; 
//         }

//         function drawConnectors(ctx, landmarks, connections, style) {
//             if (!landmarks || !connections) return;
//             ctx.strokeStyle = style.color;
//             ctx.lineWidth = style.lineWidth;
//             for (const connection of connections) {
//                 const start = landmarks[connection[0]];
//                 const end = landmarks[connection[1]];
//                 if (start && end) {
//                     ctx.beginPath();
//                     ctx.moveTo(start.x * WIDTH, start.y * HEIGHT);
//                     ctx.lineTo(end.x * WIDTH, end.y * HEIGHT);
//                     ctx.stroke();
//                 }
//             }
//         }

//         function loadMediaPipeScripts() {
//             return new Promise((resolve, reject) => {
//                 const scripts = [
//                     "https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/drawing_utils.js",
//                     "https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js",
//                     "https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/face_mesh.js"
//                 ];
//                 let index = 0;
//                 function loadScript() {
//                     if (index >= scripts.length) {
//                         resolve();
//                         return;
//                     }
//                     const script = document.createElement("script");
//                     script.src = scripts[index];
//                     script.crossOrigin = "anonymous";
//                     script.onload = () => {
//                         console.log("Loaded:", scripts[index]);
//                         index++;
//                         loadScript();
//                     };
//                     script.onerror = () => reject(new Error("Failed to load: " + scripts[index]));
//                     document.head.appendChild(script);
//                 }
//                 loadScript();
//             });
//         }

//         async function initializeFaceMesh() {
//             if (typeof FaceMesh === 'undefined') {
//                 throw new Error("FaceMesh not loaded");
//             }
//             faceMesh = new FaceMesh({
//                 locateFile: (file) => {
//                     return "https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/" + file;
//                 }
//             });
//             faceMesh.setOptions({
//                 maxNumFaces: 1,
//                 refineLandmarks: true,
//                 minDetectionConfidence: 0.5,
//                 minTrackingConfidence: 0.5
//             });
//             faceMesh.onResults(onFaceMeshResults);
//             console.log("FaceMesh initialized");
//         }

//         function onFaceMeshResults(results) {
//             if (!canvasRef) return;
//             canvasRef.width = WIDTH;
//             canvasRef.height = HEIGHT;
//             const ctx = canvasRef.getContext('2d');
//             ctx.clearRect(0, 0, WIDTH, HEIGHT);

//             if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
//                 if (typeof FACEMESH_TESSELATION !== 'undefined') {
//                     for (const landmarks of results.multiFaceLandmarks) {
//                         drawConnectors(ctx, landmarks, FACEMESH_TESSELATION, { color: '#C0C0C0', lineWidth: 0.5 });
//                         drawConnectors(ctx, landmarks, FACEMESH_FACE_OVAL, { color: '#E0E0E0', lineWidth: 2 });
//                         drawConnectors(ctx, landmarks, FACEMESH_RIGHT_EYE, { color: '#FFFFFF', lineWidth: 1 });
//                         drawConnectors(ctx, landmarks, FACEMESH_LEFT_EYE, { color: '#FFFFFF', lineWidth: 1 });
//                         drawConnectors(ctx, landmarks, FACEMESH_RIGHT_EYEBROW, { color: '#FFFFFF', lineWidth: 1 });
//                         drawConnectors(ctx, landmarks, FACEMESH_LEFT_EYEBROW, { color: '#FFFFFF', lineWidth: 1 });
//                         drawConnectors(ctx, landmarks, FACEMESH_LIPS, { color: '#FFFFFF', lineWidth: 1 });
                        
//                         for (const landmark of landmarks) {
//                             ctx.beginPath();
//                             ctx.arc(landmark.x * WIDTH, landmark.y * HEIGHT, 1, 0, 2 * Math.PI);
//                             ctx.fillStyle = '#FFFFFF';
//                             ctx.fill();
//                         }
//                     }
//                 }
//             }
//         }

//         async function initializeScanner() { 
//             try { 
//                 console.log("Loading MediaPipe scripts...");
//                 await loadMediaPipeScripts(); 
//                 console.log("Initializing FaceMesh...");
//                 await initializeFaceMesh();
//                 console.log("Starting camera...");
//                 await startCamera(); 
//                 setupEventListeners(); 
//                 document.getElementById("loadingState").style.display = "none"; 
//                 document.getElementById("cameraInterface").style.display = "block"; 
//                 console.log("Scanner initialized");
//             } catch (error) { 
//                 console.error("Init failed:", error); 
//                 showError(error.message || "Failed to initialize"); 
//             } 
//         }

//         async function startCamera() { 
//             try { 
//                 videoRef = document.getElementById("videoElement");
//                 canvasRef = document.getElementById("canvasElement");
//                 if (stream) stream.getTracks().forEach(t => t.stop()); 
//                 stream = await navigator.mediaDevices.getUserMedia({ 
//                     video: { width: WIDTH, height: HEIGHT, facingMode: "user" }, 
//                     audio: false 
//                 }); 
//                 videoRef.srcObject = stream;
//                 if (typeof Camera !== 'undefined' && faceMesh) {
//                     camera = new Camera(videoRef, {
//                         onFrame: async () => {
//                             await faceMesh.send({image: videoRef});
//                         },
//                         width: WIDTH,
//                         height: HEIGHT
//                     });
//                     camera.start();
//                     console.log("Camera started");
//                 }
//             } catch (error) { 
//                 throw new Error("Camera access denied"); 
//             } 
//         }

//         function setupEventListeners() { 
//             document.getElementById("startBtn").addEventListener("click", startRecording); 
//             document.getElementById("stopBtn").addEventListener("click", stopRecording); 
//             document.getElementById("recordAgainBtn").addEventListener("click", startRecording);
//             document.getElementById("retryBtn").addEventListener("click", () => window.location.reload());
//             document.getElementById("modalCloseBtn").addEventListener("click", closeScanModal);
//         }

//         function startRecording() { 
//             if (!stream) return; 
//             resetAll(); 
//             isRecording = true; 
//             recordingDuration = 0; 
//             document.getElementById("startBtn").style.display = "none"; 
//             document.getElementById("stopBtn").style.display = "block"; 
//             document.getElementById("recordAgainBtn").style.display = "none"; 
//             document.getElementById("recordingIndicator").style.display = "flex"; 
//             document.getElementById("videoContainer").style.border = "4px solid #ff4757"; 
            
//             const chunks = []; 
//             mediaRecorderRef = new MediaRecorder(stream, { mimeType: "video/webm;codecs=vp9" });
//             mediaRecorderRef.ondataavailable = e => { 
//                 if (e.data.size > 0) chunks.push(e.data); 
//             }; 
//             mediaRecorderRef.onstop = async () => { 
//                 if (recordingTimerRef) { 
//                     clearInterval(recordingTimerRef); 
//                     recordingTimerRef = null; 
//                 } 
//                 isRecording = false; 
//                 document.getElementById("recordingIndicator").style.display = "none"; 
//                 document.getElementById("videoContainer").style.border = "2px solid #e5e7eb"; 
//                 document.getElementById("stopBtn").style.display = "none"; 
//                 document.getElementById("recordAgainBtn").style.display = "block"; 
//                 const blob = new Blob(chunks, { type: "video/webm" });
//                 recordedVideoUrl = URL.createObjectURL(blob); 
//                 await callAIAPI(blob);
//             }; 
//             mediaRecorderRef.start(); 
//             recordingTimerRef = setInterval(() => { 
//                 recordingDuration++; 
//                 document.getElementById("recordingTime").textContent = "REC " + formatTime(recordingDuration); 
//                 if (recordingDuration >= 30) stopRecording(); 
//             }, 1000); 
//         }

//         function stopRecording() { 
//             if (mediaRecorderRef && mediaRecorderRef.state === "recording") {
//                 mediaRecorderRef.stop(); 
//             }
//         }

//         async function callAIAPI(blob) { 
//             showStatus("Analyzing video...", "warning"); 
//             try { 
//                 if (!blob || blob.size === 0) throw new Error("Invalid video data");
//                 const fd = new FormData(); 
//                 fd.append("file", blob, "scan.webm"); 
//                 const res = await axios.post(AI_API_URL, fd, { 
//                     headers: { "Content-Type": "multipart/form-data" }, 
//                     timeout: 120000,
//                     onUploadProgress: (progressEvent) => {
//                         const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
//                         showStatus("Uploading... " + percent + "%", "warning");
//                     }
//                 }); 
//                 const pred = res.data; 
//                 if (!pred || typeof pred !== "object") throw new Error("Invalid response");
//                 if (pred.error) throw new Error(pred.error);
//                 if (!pred.heart_rate_bpm && !pred.blood_pressure && !pred.spo2_percent) {
//                     throw new Error("No vital signs detected");
//                 }
//                 aiPrediction = { 
//                     heartRate: pred.heart_rate_bpm ? Math.round(pred.heart_rate_bpm) : null, 
//                     bloodPressure: { 
//                         systolic: pred.blood_pressure?.systolic ? Math.round(pred.blood_pressure.systolic) : null, 
//                         diastolic: pred.blood_pressure?.diastolic ? Math.round(pred.blood_pressure.diastolic) : null
//                     }, 
//                     oxygenSaturation: pred.spo2_percent ? Math.round(pred.spo2_percent) : null, 
//                     stressLevel: pred.stress_indicator ? (pred.stress_indicator * 100).toFixed(1) : null
//                 }; 
//                 displayResults(); 
//                 showStatus("Analysis complete!", "success");
//             } catch (error) { 
//                 console.error("API Error:", error); 
//                 let errorMessage = "Analysis failed";
//                 if (error.code === 'ECONNABORTED') {
//                     errorMessage = "Request timeout";
//                 } else if (error.response) {
//                     errorMessage = "Server error: " + (error.response.data?.error || error.response.statusText);
//                 } else if (error.request) {
//                     errorMessage = "No response from server";
//                 } else {
//                     errorMessage = error.message || "Unknown error";
//                 }
//                 showStatus(errorMessage, "error"); 
//                 document.getElementById("recordAgainBtn").style.display = "block";
//             } 
//         }

//         function displayResults() { 
//             if (!aiPrediction) return; 
//             document.getElementById("previewVideo").src = recordedVideoUrl; 
//             const hr = aiPrediction.heartRate || "--";
//             const bp = (aiPrediction.bloodPressure?.systolic && aiPrediction.bloodPressure?.diastolic) 
//                 ? aiPrediction.bloodPressure.systolic + "/" + aiPrediction.bloodPressure.diastolic 
//                 : "--/--";
//             const o2 = aiPrediction.oxygenSaturation || "--";
//             const stress = aiPrediction.stressLevel || "--";
            
//             document.getElementById("predictionGrid").innerHTML = 
//                 '<div class="predictionCard"><div class="predictionValue">' + hr + '</div><div class="predictionLabel">Heart Rate</div><div class="predictionUnit">BPM</div></div>' +
//                 '<div class="predictionCard"><div class="predictionValue">' + bp + '</div><div class="predictionLabel">Blood Pressure</div><div class="predictionUnit">mmHg</div></div>' +
//                 '<div class="predictionCard"><div class="predictionValue">' + o2 + '</div><div class="predictionLabel">Oxygen Saturation</div><div class="predictionUnit">%</div></div>' +
//                 '<div class="predictionCard"><div class="predictionValue">' + stress + '</div><div class="predictionLabel">Stress Level</div><div class="predictionUnit">%</div></div>';
            
//             document.getElementById("resultsSection").style.display = "block";
//             setTimeout(() => {
//                 document.getElementById("resultsSection").scrollIntoView({ behavior: 'smooth', block: 'start' });
//             }, 300);
//         }

//         function closeScanModal() { 
//             document.getElementById("scanModal").style.display = "none"; 
//         }

//         function resetAll() { 
//             isRecording = false; 
//             recordingDuration = 0; 
//             recordedVideoUrl = null; 
//             aiPrediction = null; 
//             if (recordingTimerRef) { 
//                 clearInterval(recordingTimerRef); 
//                 recordingTimerRef = null; 
//             } 
//             hideStatus(); 
//             document.getElementById("resultsSection").style.display = "none"; 
//             document.getElementById("startBtn").style.display = "block"; 
//             document.getElementById("stopBtn").style.display = "none"; 
//             document.getElementById("recordAgainBtn").style.display = "none"; 
//         }

//         function showError(msg) { 
//             document.getElementById("loadingState").style.display = "none"; 
//             document.getElementById("cameraInterface").style.display = "none"; 
//             document.getElementById("errorText").textContent = msg; 
//             document.getElementById("errorState").style.display = "flex"; 
//         }

//         document.addEventListener("DOMContentLoaded", initializeScanner);
//     </script>
// </body>
// </html>`;

//     res.setHeader('Content-Type', 'text/html; charset=utf-8');
//     res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
//     res.setHeader('Pragma', 'no-cache');
//     res.setHeader('Expires', '0');
//     res.send(html);
//   } catch (error) {
//     console.error('Error serving health scanner page:', error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to load health scanner",
//       error: error.message
//     });
//   }
// }
// // Routes
// app.get('/', getpage);
// app.get('/scanner', getpage);
// app.get('/health', (req, res) => {
//   res.json({ status: 'OK', message: 'Server is running' });
// });

// // Optional video upload endpoint
// app.post('/api/upload-video', upload.single('video'), (req, res) => {
//   try {
//     if (!req.file) {
//       return res.status(400).json({ error: 'No video file uploaded' });
//     }
//     res.json({
//       success: true,
//       message: 'Video uploaded',
//       filename: req.file.filename
//     });
//   } catch (error) {
//     res.status(500).json({ error: 'Upload failed' });
//   }
// });

// // Error handling
// app.use((err, req, res, next) => {
//   console.error('Error:', err);
//   res.status(500).json({ success: false, message: err.message });
// });

// app.use((req, res) => {
//   res.status(404).json({ success: false, message: 'Not found' });
// });

// // Start server
// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });


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
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
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
        body { 
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; 
            background: var(--bgColor); 
            min-height: 100vh;
            overflow-x: hidden;
        }
        .cameraSection { 
            min-height: 100vh; 
            background: var(--bgColor); 
            padding: 1rem;
            display: flex;
            flex-direction: column;
            align-items: center;
        }
        .cameraHeader { 
            background: var(--whiteColor); 
            padding: 1.5rem; 
            border-radius: 16px; 
            margin-bottom: 1.5rem; 
            box-shadow: 0 4px 20px rgba(0,0,0,0.08); 
            text-align: center;
            width: 100%;
            max-width: 900px;
        }
        .cameraHeader h1 { 
            font-size: clamp(1.25rem, 5vw, 2rem);
            color: var(--blackColor); 
            font-weight: 700; 
            margin-bottom: 0.5rem; 
        }
        .cameraHeader p { 
            font-size: clamp(0.875rem, 3vw, 1rem);
            color: var(--textColor); 
        }
        .cameraContainer { 
            background: var(--whiteColor); 
            border-radius: 16px; 
            padding: 1.5rem; 
            box-shadow: 0 4px 20px rgba(0,0,0,0.08); 
            margin-bottom: 1.5rem;
            display: flex; 
            flex-direction: column; 
            align-items: center; 
            gap: 1.5rem;
            width: 100%;
            max-width: 900px;
        }
        .errorState { 
            background: var(--inputColor); 
            border-radius: 16px; 
            padding: 2rem 1rem; 
            text-align: center; 
            border: 2px dashed var(--greyText); 
            width: 100%;
            max-width: 384px;
            min-height: 300px;
            display: flex; 
            flex-direction: column; 
            align-items: center; 
            justify-content: center; 
        }
        .errorIcon { 
            color: #ff4757; 
            margin-bottom: 1rem; 
            font-size: clamp(2.5rem, 8vw, 4rem);
        }
        .errorText { 
            font-size: var(--normalFontSize); 
            color: var(--textColor); 
            margin-bottom: 1.5rem; 
        }
        .controlsGrid { 
            width:full;
            display: flex; 
            gap: 1rem; 
            flex-wrap: wrap; 
            justify-content: center;
            width: 100%;
            max-width: 384px;
        }
        .controlBtn { 
            background: var(--PrimaryColor); 
            color: var(--whiteColor); 
            border: none; 
            padding: 0.875rem 1.5rem; 
            border-radius: 8px; 
            font-size: var(--normalFontSize); 
            font-weight: 600; 
            cursor: pointer; 
            transition: all 0.3s ease; 
            display: flex; 
            align-items: center; 
            justify-content: center;
            gap: 0.75rem; 
            min-width: 140px;
            flex: 1;
            min-height: 48px;
            touch-action: manipulation;
        }
        .controlBtn:hover { 
            background: var(--HoverColor); 
            transform: translateY(-2px); 
            box-shadow: 0 6px 20px rgba(0,0,0,0.15); 
        }
        .controlBtn.secondary { 
            background: var(--inputColor); 
            color: var(--blackColor); 
            border: 2px solid var(--itemCardHover); 
        }
        .controlBtn.danger { 
            background: #ff4757; 
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
            top: 0.5rem; 
            left: 0.5rem; 
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
            padding: 1.5rem; 
            box-shadow: 0 4px 20px rgba(0,0,0,0.08); 
            margin-top: 1.5rem; 
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
            font-size: clamp(1.125rem, 4vw, 1.5rem);
            font-weight: 700; 
        }
        .videoPreview { 
            margin-bottom: 1.5rem; 
        }
        .previewVideo { 
            width: 100%;
            max-width: 384px;
            height: auto;
            aspect-ratio: 384/518;
            border-radius: 12px; 
            object-fit: cover; 
            border: 2px solid var(--inputColor);
            display: block;
            margin: 0 auto;
        }
        .loadingState { 
            text-align: center; 
            padding: 2rem 1rem; 
            color: var(--textColor); 
        }
        .loadingSpinner { 
            width: 24px; 
            height: 24px; 
            border: 3px solid var(--inputColor); 
            border-top: 3px solid var(--PrimaryColor); 
            border-radius: 50%; 
            animation: spin 1s linear infinite; 
            display: inline-block; 
            margin-right: 0.5rem; 
        }
        @keyframes spin { 
            0% { transform: rotate(0deg); } 
            100% { transform: rotate(360deg); } 
        }
        .predictionGrid { 
            display: grid; 
            grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); 
            gap: 1rem;
        }
        .predictionCard { 
            background: var(--paleGreen); 
            border: 1px solid var(--PrimaryColor); 
            border-radius: 12px; 
            padding: 1.25rem; 
            text-align: center; 
            transition: transform 0.2s ease; 
        }
        .predictionCard:hover { 
            transform: translateY(-2px); 
        }
        .predictionValue { 
            font-size: clamp(1.75rem, 6vw, 2.5rem);
            font-weight: 700; 
            color: var(--PrimaryColor); 
            margin-bottom: 0.5rem;
            word-break: break-word;
        }
        .predictionLabel { 
            font-size: clamp(0.875rem, 3vw, 1rem);
            color: var(--blackColor); 
            font-weight: 600; 
        }
        .predictionUnit { 
            font-size: var(--smallFontSize); 
            color: var(--textColor); 
        }
        .historyList { 
            list-style: none; 
            padding: 0; 
            display: flex; 
            flex-direction: column; 
            gap: 1rem; 
        }
        .historyItem { 
            display: flex; 
            flex-direction: column;
            gap: 0.75rem;
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
            gap: 0.25rem;
        }
        .historyDate { 
            font-weight: 600; 
            color: var(--blackColor);
            font-size: clamp(0.875rem, 3vw, 1rem);
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
            padding: 1rem;
        }
        .modalContent { 
            background: var(--whiteColor); 
            padding: 1.5rem; 
            border-radius: 16px; 
            width: 100%;
            max-width: 600px; 
            max-height: 90vh; 
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
            width: 32px;
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        #videoContainer {
            position: relative;
            width: 100%;
            max-width: 384px;
            aspect-ratio: 384/518;
            border-radius: 1.5rem;
            overflow: hidden;
            border: 2px solid #e5e7eb;
            box-shadow: 0 4px 20px rgba(0,0,0,0.08);
            margin: 0 auto;
        }
        #videoElement, #canvasElement {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
        #canvasElement {
            pointer-events: none;
            z-index: 20;
        }
        .videoOverlay {
             backdrop-filter: blur(25px);  /* 20px → 25px */
             background: rgba(0,0,0,0.70);  /* rgba(255,255,255,0.10) → rgba(0,0,0,0.70) */
            -webkit-mask-image: radial-gradient(ellipse 61% 68% at 50% 50%, transparent 68%, black 72%);
            position: absolute;
            inset: 0;
            pointer-events: none;
            z-index: 30;
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(16px);
            mask-image: radial-gradient(ellipse 61% 68% at 50% 50%, transparent 69%, black 71%);
         
        }
        .videoOval {
            border: 4px dashed rgba(255, 255, 255, 0.95);
            position: absolute;
            left: 6%;
            top: 4%;
            width: 88%;
            height: 92%;
            border: 5px dashed #fff;
            border-radius: 50%;
            z-index: 31;
            pointer-events: none;
        }
      .controlsGrid {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
}

.controlBtn {
  margin: 0 !important;
  flex: none !important;
  min-width: 140px;
  width: auto !important;
}


        @media screen and (min-width: 480px) {
            .historyItem {
                flex-direction: row;
                justify-content: space-between;
                align-items: center;
            }
            .controlsGrid {
                flex-wrap: nowrap;
            }
        }
        @media screen and (max-width: 479px) { 

         #videoContainer {
        aspect-ratio: 3/4;  /* 9/16 → 3/4 (better for face) */
    }
    .videoOval {
        border-width: 3px;  /* NEW: thinner border on mobile */
    }
            .cameraSection { 
                padding: 0.75rem; 
            } 
            .cameraHeader { 
                padding: 1rem; 
                margin-bottom: 1rem;
            } 
            .cameraContainer { 
                padding: 1rem; 
                gap: 1rem;
            }
            .controlBtn {
                width: 100%;
                min-width: unset;
            }
            .predictionGrid { 
                grid-template-columns: 1fr; 
            }
            .resultsSection, .historySection {
                padding: 1rem;
                margin-top: 1rem;
            }
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
            <div id="cameraInterface" style="display: none; width: 100%;">
                <div id="videoContainer">
                    <video id="videoElement" autoplay playsinline muted></video>
                    <canvas id="canvasElement"></canvas>
                    <div class="videoOverlay"></div>
                    <div class="videoOval"></div>
                    <div id="recordingIndicator" class="recordingIndicator" style="display: none;">
                        <div class="recordingDot"></div>
                        <span id="recordingTime">REC 00:00</span>
                    </div>
                </div>
                <div id="statusIndicator" style="display: none;"></div>
                
                <div class="controlsGrid">
                    <button id="startBtn" class="controlBtn">Start Scanning</button>
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
                <p style="text-align:center;color:var(--textColor)">No scan history available</p>
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
    
    // Face detection state
    let faceDetected = false;
    let faceDetectionTimeout = null;
    let recordingPaused = false;
    
    const AI_API_URL = "https://anurudh-268064419384.asia-east1.run.app/analyze";
    const WIDTH = 1280, HEIGHT = 720;  // High quality resolution

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

    function getCanvasDimensions() {
        return { width: WIDTH, height: HEIGHT };
    }

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

    async function initializeFaceMesh() {
        if (typeof FaceMesh === 'undefined') {
            throw new Error("FaceMesh not loaded");
        }

        faceMesh = new FaceMesh({
            locateFile: (file) => {
                return "https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/" + file;
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
        
        ctx.drawImage(results.image, 0, 0, dims.width, dims.height);

        // Check if face is detected
        const hasFace = results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0;

        if (hasFace) {
            handleFaceDetected();
            
            const landmarks = results.multiFaceLandmarks[0];
            
            let minX = 1, maxX = 0, minY = 1, maxY = 0;
            landmarks.forEach(landmark => {
                minX = Math.min(minX, landmark.x);
                maxX = Math.max(maxX, landmark.x);
                minY = Math.min(minY, landmark.y);
                maxY = Math.max(maxY, landmark.y);
            });
            
            const paddingX = 0.15;
            const paddingTop = 0.15;
            const paddingBottom = 0.15;
            
            minX = Math.max(0, minX - paddingX);
            maxX = Math.min(1, maxX + paddingX);
            minY = Math.max(0, minY - paddingTop);
            maxY = Math.min(1, maxY + paddingBottom);
            
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = dims.width;
            tempCanvas.height = dims.height;
            const tempCtx = tempCanvas.getContext('2d');
            
            tempCtx.drawImage(results.image, 0, 0, dims.width, dims.height);
            
            tempCtx.filter = 'blur(20px) brightness(0.5)';
            tempCtx.drawImage(tempCanvas, 0, 0);
            tempCtx.filter = 'none';
            
            ctx.drawImage(tempCanvas, 0, 0);
            
            ctx.save();
            ctx.beginPath();
            const centerX = ((minX + maxX) / 2) * dims.width;
            const centerY = ((minY + maxY) / 2) * dims.height;
            const radiusX = ((maxX - minX) / 2) * dims.width;
            const radiusY = ((maxY - minY) / 2) * dims.height;
            ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, 2 * Math.PI);
            ctx.clip();
            
            ctx.drawImage(results.image, 0, 0, dims.width, dims.height);
            ctx.restore();
            
            // Draw moderate low-poly style
            if (typeof FACEMESH_TESSELATION !== 'undefined') {
                for (const landmarks of results.multiFaceLandmarks) {
                    const connections = FACEMESH_TESSELATION;
                    ctx.strokeStyle = '#FFFFFF';
                    ctx.lineWidth = 1;
                    ctx.globalAlpha = 0.7;
                    
                    for (let i = 0; i < connections.length; i += 15) {
                        const connection = connections[i];
                        const from = landmarks[connection[0]];
                        const to = landmarks[connection[1]];
                        
                        ctx.beginPath();
                        ctx.moveTo(from.x * dims.width, from.y * dims.height);
                        ctx.lineTo(to.x * dims.width, to.y * dims.height);
                        ctx.stroke();
                    }
                    
                    ctx.globalAlpha = 1.0;
                    
                    drawConnectors(ctx, landmarks, FACEMESH_FACE_OVAL, { color: '#FFFFFF', lineWidth: 1.5 });
                    drawConnectors(ctx, landmarks, FACEMESH_RIGHT_EYE, { color: '#FFFFFF', lineWidth: 1.5 });
                    drawConnectors(ctx, landmarks, FACEMESH_LEFT_EYE, { color: '#FFFFFF', lineWidth: 1.5 });
                    drawConnectors(ctx, landmarks, FACEMESH_LIPS, { color: '#FFFFFF', lineWidth: 1.5 });
                }
            }
            
            // Green border when face detected
            drawFaceBorder(ctx, '#10b981', dims);
        } else {
            handleFaceLost();
            
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = dims.width;
            tempCanvas.height = dims.height;
            const tempCtx = tempCanvas.getContext('2d');
            tempCtx.drawImage(results.image, 0, 0, dims.width, dims.height);
            tempCtx.filter = 'blur(8px) brightness(0.7)';
            tempCtx.drawImage(tempCanvas, 0, 0);
            ctx.drawImage(tempCanvas, 0, 0);
            
            // Red border when no face
            drawFaceBorder(ctx, '#ef4444', dims);
        }

        ctx.restore();
    }

    function handleFaceDetected() {
        if (faceDetectionTimeout) {
            clearTimeout(faceDetectionTimeout);
            faceDetectionTimeout = null;
        }
        
        if (!faceDetected) {
            faceDetected = true;
            hideFaceAlert();
            
            if (mediaRecorderRef && recordingPaused) {
                mediaRecorderRef.resume();
                recordingPaused = false;
                console.log("Recording resumed - face detected");
            }
        }
    }

    function handleFaceLost() {
        if (faceDetected) {
            if (!faceDetectionTimeout) {
                faceDetectionTimeout = setTimeout(() => {
                    faceDetected = false;
                    showFaceAlert();
                    
                    if (mediaRecorderRef && mediaRecorderRef.state === 'recording' && !recordingPaused) {
                        mediaRecorderRef.pause();
                        recordingPaused = true;
                        console.log("Recording paused - no face detected");
                    }
                }, 1000);
            }
        }
    }

    function drawFaceBorder(ctx, color, dims) {
        ctx.strokeStyle = color;
        ctx.lineWidth = 4;
        ctx.strokeRect(10, 10, dims.width - 20, dims.height - 20);
    }

    function showFaceAlert() {
        let alertDiv = document.getElementById("faceAlert");
        alertDiv.style.display = "block";
        setTimeout(() => {
            alertDiv.style.opacity = "1";
            alertDiv.style.transform = "translateX(-50%) translateY(0)";
        }, 10);
    }

    function hideFaceAlert() {
        const alertDiv = document.getElementById("faceAlert");
        if (alertDiv) {
            alertDiv.style.opacity = "0";
            alertDiv.style.transform = "translateX(-50%) translateY(20px)";
            setTimeout(() => {
                alertDiv.style.display = "none";
            }, 300);
        }
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
                video: { 
                    width: { ideal: WIDTH },
                    height: { ideal: HEIGHT },
                    facingMode: "user",
                    frameRate: { ideal: 30 }
                }, 
                audio: false 
            }); 
            
            videoRef.srcObject = stream;
            
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
        if (!stream) {
            alert("Camera stream not found!");
            return; 
        }
        resetAll(); 
        isRecording = true; 
        recordingDuration = 0;
        recordingPaused = false;
        
        const startBtn = document.getElementById("startBtn");
        const stopBtn = document.getElementById("stopBtn");
        const recordAgainBtn = document.getElementById("recordAgainBtn");

        // Start button completely hide ho jayega
        startBtn.style.display = "none";
        stopBtn.disabled = false;
        stopBtn.style.display = "block";
        recordAgainBtn.style.display = "none";
        
        document.getElementById("recordingIndicator").style.display = "flex"; 
        document.getElementById("videoContainer").style.border = "4px solid #ff4757"; 

        const chunks = []; 
        
        // High quality video recording ke liye settings
        const options = {
            mimeType: 'video/webm;codecs=vp9',
            videoBitsPerSecond: 5000000  // 5 Mbps for high quality
        };
        
        // Fallback agar vp9 support nahi hai
        if (!MediaRecorder.isTypeSupported(options.mimeType)) {
            options.mimeType = 'video/webm;codecs=vp8';
        }
        
        mediaRecorderRef = new MediaRecorder(stream, options);

        mediaRecorderRef.ondataavailable = e => { 
            if (e.data.size > 0) chunks.push(e.data); 
        }; 
        
        mediaRecorderRef.onstop = async () => { 
            if (recordingTimerRef) { 
                clearInterval(recordingTimerRef); 
                recordingTimerRef = null; 
            } 
            isRecording = false;
            recordingPaused = false;
            document.getElementById("recordingIndicator").style.display = "none"; 
            document.getElementById("videoContainer").style.border = "2px solid #e5e7eb"; 
            stopBtn.style.display = "none"; 
            recordAgainBtn.style.display = "block"; 
            startBtn.style.display = "block";  // Stop ke baad wapas aa jayega
            hideFaceAlert();
            
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
        if (mediaRecorderRef && mediaRecorderRef.state !== "inactive") {
            if (mediaRecorderRef.state === "paused") {
                mediaRecorderRef.resume();
            }
            mediaRecorderRef.stop(); 
        }
    }

    async function callAIAPI(blob) { 
        showStatus("Analyzing video...", "warning"); 
        try { 
            if (!blob || blob.size === 0) {
                throw new Error("Invalid video data - blob is empty");
            }
            
            console.log("Sending video to AI API:", {
                size: (blob.size / 1024 / 1024).toFixed(2) + " MB",
                type: blob.type,
                duration: recordingDuration + "s"
            });
            
            const fd = new FormData(); 
            fd.append("file", blob, "scan.webm"); 
            
            const res = await axios.post(AI_API_URL, fd, { 
                headers: { 
                    "Content-Type": "multipart/form-data" 
                }, 
                timeout: 120000,
                onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    showStatus("Uploading... " + percentCompleted + "%", "warning");
                }
            }); 
            
            console.log("AI API Response:", res.data);
            
            const pred = res.data; 
            
            if (!pred || typeof pred !== "object") {
                throw new Error("Invalid response format from AI server");
            }
            
            if (pred.error) {
                throw new Error(pred.error);
            }
            
            if (!pred.heart_rate_bpm && !pred.blood_pressure && !pred.spo2_percent) {
                throw new Error("No vital signs detected in the analysis");
            }
            
            aiPrediction = { 
                heartRate: pred.heart_rate_bpm ? Math.round(pred.heart_rate_bpm) : null, 
                bloodPressure: { 
                    systolic: pred.blood_pressure?.systolic ? Math.round(pred.blood_pressure.systolic) : null, 
                    diastolic: pred.blood_pressure?.diastolic ? Math.round(pred.blood_pressure.diastolic) : null
                }, 
                oxygenSaturation: pred.spo2_percent ? Math.round(pred.spo2_percent) : null, 
                stressLevel: pred.stress_indicator ? (pred.stress_indicator * 100).toFixed(1) : null,
                respiratoryRate: pred.respiratory_rate_bpm ? Math.round(pred.respiratory_rate_bpm) : null,
                age: pred.age || null,
                gender: pred.gender || null,
                healthRisk: pred.health_risk_indicator ? (pred.health_risk_indicator * 100).toFixed(1) : null
            }; 
            
            console.log("Parsed predictions:", aiPrediction);
            
            displayResults(); 
            showStatus("Analysis complete!", "success");
            
        } catch (error) { 
            console.error("AI API Error:", error); 
            
            let errorMessage = "Analysis failed";
            
            if (error.code === 'ECONNABORTED') {
                errorMessage = "Request timeout - video too long or slow connection";
            } else if (error.response) {
                errorMessage = "Server error: " + (error.response.data?.error || error.response.statusText);
                console.error("Server response:", error.response.data);
            } else if (error.request) {
                errorMessage = "No response from AI server - check your connection";
            } else {
                errorMessage = error.message || "Unknown error occurred";
            }
            
            showStatus(errorMessage, "error"); 
            
            document.getElementById("recordAgainBtn").style.display = "block";
        } 
    }

    function getStressColor(stress) {
        if (stress >= 0 && stress <= 1) return '#10b981';
        if (stress > 1 && stress <= 2) return '#fbbf24';
        if (stress > 2 && stress <= 3) return '#3b82f6';
        if (stress > 3 && stress <= 4) return '#f97316';
        if (stress > 4 && stress <= 5) return '#ef4444';
        return '#6b7280';
    }

    function getStressLevel(stress) {
        if (stress >= 0 && stress <= 1) return 'Low';
        if (stress > 1 && stress <= 2) return 'Mild';
        if (stress > 2 && stress <= 3) return 'Moderate';
        if (stress > 3 && stress <= 4) return 'High';
        if (stress > 4 && stress <= 5) return 'Very High';
        return 'Unknown';
    }

    function displayResults() { 
        if (!aiPrediction) return; 
        document.getElementById("previewVideo").src = recordedVideoUrl; 
        
        const hr = aiPrediction.heartRate ? Math.round(aiPrediction.heartRate) : "--";
        const systolic = aiPrediction.bloodPressure?.systolic ? Math.round(aiPrediction.bloodPressure.systolic) : "--";
        const diastolic = aiPrediction.bloodPressure?.diastolic ? Math.round(aiPrediction.bloodPressure.diastolic) : "--";
        const o2 = aiPrediction.oxygenSaturation ? Math.round(aiPrediction.oxygenSaturation) : "--";
        const stress = aiPrediction.stressLevel !== undefined ? parseFloat(aiPrediction.stressLevel) : null;
        const stressValue = stress !== null ? stress.toFixed(2) : "--";
        const stressColor = stress !== null ? getStressColor(stress) : '#6b7280';
        const stressLabel = stress !== null ? getStressLevel(stress) : 'Unknown';
        
        // Progress bar calculations
        const hrProgress = hr !== '--' ? Math.min((hr / 120) * 100, 100) : 0;
        const sysProgress = systolic !== '--' ? Math.min((systolic / 140) * 100, 100) : 0;
        const diaProgress = diastolic !== '--' ? Math.min((diastolic / 90) * 100, 100) : 0;
        const o2Progress = o2 !== '--' ? Math.min((o2 / 100) * 100, 100) : 0;
        const stressProgress = stress !== null ? (stress / 5) * 100 : 0;
        
        document.getElementById("predictionGrid").innerHTML = 
            '<style>' +
                '.vitals-table-wrapper { overflow-x: auto; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 24px; border-radius: 20px; box-shadow: 0 20px 50px rgba(102, 126, 234, 0.4); }' +
                '.vitals-table { width: 100%; border-collapse: separate; border-spacing: 0; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 8px 24px rgba(0,0,0,0.12); }' +
                '.vitals-table thead tr { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }' +
                '.vitals-table th { padding: 20px 16px; text-align: left; color: white; font-weight: 700; font-size: 15px; text-transform: uppercase; letter-spacing: 0.5px; text-shadow: 0 2px 4px rgba(0,0,0,0.2); }' +
                '.vitals-table th:nth-child(2), .vitals-table th:nth-child(3), .vitals-table th:nth-child(4) { text-align: center; }' +
                '.vitals-table tbody tr { transition: all 0.3s ease; border-bottom: 1px solid #f3f4f6; }' +
                '.vitals-table tbody tr:hover { background: linear-gradient(90deg, #f9fafb 0%, #f3f4f6 100%); transform: scale(1.01); }' +
                '.vitals-table tbody tr:last-child { border-bottom: none; }' +
                '.vitals-table td { padding: 20px 16px; font-weight: 500; color: #374151; }' +
                '.vital-label { display: flex; align-items: center; gap: 12px; font-weight: 600; font-size: 15px; }' +
                '.vital-icon { width: 40px; height: 40px; border-radius: 10px; display: inline-flex; align-items: center; justify-content: center; font-size: 20px; }' +
                '.vital-value { text-align: center; font-size: 32px; font-weight: 800; position: relative; }' +
                '.vital-progress { width: 100%; height: 6px; background: #e5e7eb; border-radius: 3px; overflow: hidden; margin-top: 8px; }' +
                '.vital-progress-bar { height: 100%; border-radius: 3px; transition: width 1.5s cubic-bezier(0.4, 0, 0.2, 1); }' +
                '.vital-unit { text-align: center; color: #6b7280; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }' +
                '.vital-status { text-align: center; }' +
                '.status-badge { background: #dbeafe; color: #1e40af; padding: 8px 16px; border-radius: 25px; font-size: 13px; font-weight: 700; display: inline-block; box-shadow: 0 2px 8px rgba(30, 64, 175, 0.2); text-transform: uppercase; letter-spacing: 0.5px; }' +
                '@keyframes slideIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }' +
                '.vitals-table tbody tr { animation: slideIn 0.5s ease forwards; }' +
                '.vitals-table tbody tr:nth-child(1) { animation-delay: 0.1s; opacity: 0; }' +
                '.vitals-table tbody tr:nth-child(2) { animation-delay: 0.2s; opacity: 0; }' +
                '.vitals-table tbody tr:nth-child(3) { animation-delay: 0.3s; opacity: 0; }' +
                '.vitals-table tbody tr:nth-child(4) { animation-delay: 0.4s; opacity: 0; }' +
                '.vitals-table tbody tr:nth-child(5) { animation-delay: 0.5s; opacity: 0; }' +
            '</style>' +
            '<div class="vitals-table-wrapper">' +
                '<table class="vitals-table">' +
                    '<thead>' +
                        '<tr>' +
                            '<th>Vital Sign</th>' +
                            '<th>Result</th>' +
                            '<th>Unit</th>' +
                            '<th>Status</th>' +
                        '</tr>' +
                    '</thead>' +
                    '<tbody>' +
                        '<tr>' +
                            '<td><div class="vital-label"><span class="vital-icon" style="background: linear-gradient(135deg, #ef4444, #dc2626);">❤️</span>Heart Rate</div></td>' +
                            '<td><div class="vital-value" style="color: #ef4444;">' + hr + '<div class="vital-progress"><div class="vital-progress-bar" style="background: linear-gradient(90deg, #ef4444, #dc2626); width: ' + hrProgress + '%;"></div></div></div></td>' +
                            '<td class="vital-unit">BPM</td>' +
                            '<td class="vital-status"><span class="status-badge" style="background: #fee2e2; color: #991b1b;">Normal</span></td>' +
                        '</tr>' +
                        '<tr>' +
                            '<td><div class="vital-label"><span class="vital-icon" style="background: linear-gradient(135deg, #ec4899, #db2777);">💓</span>Systolic BP</div></td>' +
                            '<td><div class="vital-value" style="color: #ec4899;">' + systolic + '<div class="vital-progress"><div class="vital-progress-bar" style="background: linear-gradient(90deg, #ec4899, #db2777); width: ' + sysProgress + '%;"></div></div></div></td>' +
                            '<td class="vital-unit">mmHg</td>' +
                            '<td class="vital-status"><span class="status-badge" style="background: #fce7f3; color: #be185d;">Normal</span></td>' +
                        '</tr>' +
                        '<tr>' +
                            '<td><div class="vital-label"><span class="vital-icon" style="background: linear-gradient(135deg, #8b5cf6, #7c3aed);">🩸</span>Diastolic BP</div></td>' +
                            '<td><div class="vital-value" style="color: #8b5cf6;">' + diastolic + '<div class="vital-progress"><div class="vital-progress-bar" style="background: linear-gradient(90deg, #8b5cf6, #7c3aed); width: ' + diaProgress + '%;"></div></div></div></td>' +
                            '<td class="vital-unit">mmHg</td>' +
                            '<td class="vital-status"><span class="status-badge" style="background: #ede9fe; color: #6b21a8;">Normal</span></td>' +
                        '</tr>' +
                        '<tr>' +
                            '<td><div class="vital-label"><span class="vital-icon" style="background: linear-gradient(135deg, #10b981, #059669);">🫁</span>Oxygen Saturation</div></td>' +
                            '<td><div class="vital-value" style="color: #10b981;">' + o2 + '<div class="vital-progress"><div class="vital-progress-bar" style="background: linear-gradient(90deg, #10b981, #059669); width: ' + o2Progress + '%;"></div></div></div></td>' +
                            '<td class="vital-unit">% SpO2</td>' +
                            '<td class="vital-status"><span class="status-badge" style="background: #d1fae5; color: #065f46;">Excellent</span></td>' +
                        '</tr>' +
                        '<tr>' +
                            '<td><div class="vital-label"><span class="vital-icon" style="background: linear-gradient(135deg, ' + stressColor + ', ' + stressColor + ');">🧠</span>Stress Level</div></td>' +
                            '<td><div class="vital-value stress-value" style="color: ' + stressColor + ';">' + stressValue + '<div class="vital-progress"><div class="vital-progress-bar" style="background: linear-gradient(90deg, ' + stressColor + ', ' + stressColor + 'dd); width: ' + stressProgress + '%;"></div></div></div></td>' +
                            '<td class="vital-unit">0-5 Scale</td>' +
                            '<td class="vital-status"><span class="stress-badge status-badge" style="background: ' + stressColor + '20; color: ' + stressColor + ';">' + stressLabel + '</span></td>' +
                        '</tr>' +
                    '</tbody>' +
                '</table>' +
            '</div>';
        
        document.getElementById("resultsSection").style.display = "block";
        setTimeout(() => {
            document.getElementById("resultsSection").scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 300);
    }

    function closeScanModal() { 
        document.getElementById("scanModal").style.display = "none"; 
    }

    function resetAll() { 
        isRecording = false; 
        recordingDuration = 0; 
        recordedVideoUrl = null; 
        aiPrediction = null;
        recordingPaused = false;
        if (recordingTimerRef) { 
            clearInterval(recordingTimerRef); 
            recordingTimerRef = null; 
        } 
        hideStatus(); 
        hideFaceAlert();
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


// async function getCameraPage(req, res, next) {
//   try {
//     const html = `<!DOCTYPE html>
// <html lang="en">
// <head>
//     <meta charset="UTF-8">
//     <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
//     <title>Health Vitals Scanner</title>
//     <script src="https://cdnjs.cloudflare.com/ajax/libs/axios/1.4.0/axios.min.js"></script>
//     <style>
//         * { box-sizing: border-box; margin: 0; padding: 0; }
//         body { 
//             font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; 
//             background: #f8fafc; 
//             min-height: 100vh;
//             padding: 1rem;
//         }
//         .mainContainer {
//             max-width: 900px;
//             margin: 0 auto;
//         }
//         .header { 
//             background: #ffffff; 
//             padding: 1.5rem; 
//             border-radius: 16px; 
//             margin-bottom: 1.5rem; 
//             box-shadow: 0 4px 20px rgba(0,0,0,0.08); 
//             text-align: center;
//         }
//         .header h1 { 
//             font-size: clamp(1.25rem, 5vw, 2rem);
//             color: #2c3e50; 
//             font-weight: 700; 
//             margin-bottom: 0.5rem; 
//         }
//         .header p { 
//             font-size: clamp(0.875rem, 3vw, 1rem);
//             color: #64748b; 
//         }
//         .cameraContainer { 
//             background: #ffffff; 
//             border-radius: 16px; 
//             padding: 1.5rem; 
//             box-shadow: 0 4px 20px rgba(0,0,0,0.08); 
//             display: flex; 
//             flex-direction: column; 
//             align-items: center; 
//             gap: 1.5rem;
//             margin-bottom: 1.5rem;
//         }
//         .loadingState { 
//             text-align: center; 
//             padding: 2rem 1rem; 
//             color: #64748b; 
//         }
//         .loadingSpinner { 
//             width: 24px; 
//             height: 24px; 
//             border: 3px solid #f1f5f9; 
//             border-top: 3px solid #5eaa3c; 
//             border-radius: 50%; 
//             animation: spin 1s linear infinite; 
//             display: inline-block; 
//             margin-right: 0.5rem; 
//         }
//         @keyframes spin { 
//             0% { transform: rotate(0deg); } 
//             100% { transform: rotate(360deg); } 
//         }
//         .errorState { 
//             background: #f1f5f9; 
//             border-radius: 16px; 
//             padding: 2rem 1rem; 
//             text-align: center; 
//             border: 2px dashed #718096; 
//             width: 100%;
//             max-width: 384px;
//             min-height: 300px;
//             display: flex; 
//             flex-direction: column; 
//             align-items: center; 
//             justify-content: center; 
//         }
//         .errorIcon { 
//             color: #ff4757; 
//             margin-bottom: 1rem; 
//             font-size: 3rem;
//         }
//         .errorText { 
//             font-size: 1rem; 
//             color: #64748b; 
//             margin-bottom: 1.5rem; 
//         }
//         .controlBtn { 
//             background: #5eaa3c; 
//             color: #ffffff; 
//             border: none; 
//             padding: 0.875rem 1.5rem; 
//             border-radius: 8px; 
//             font-size: 1rem; 
//             font-weight: 600; 
//             cursor: pointer; 
//             transition: all 0.3s ease; 
//             display: flex; 
//             align-items: center; 
//             justify-content: center;
//             gap: 0.75rem; 
//             min-width: 140px;
//             min-height: 48px;
//         }
//         .controlBtn:hover:not(:disabled) { 
//             background: #4a8530; 
//             transform: translateY(-2px); 
//             box-shadow: 0 6px 20px rgba(0,0,0,0.15); 
//         }
//         .controlBtn:disabled {
//             background: #cbd5e1;
//             cursor: not-allowed;
//             opacity: 0.6;
//         }
//         .controlBtn.danger { 
//             background: #ff4757; 
//         }
//         .controlBtn.danger:hover { 
//             background: #ee2737; 
//         }
//         .controlBtn.analyze {
//             background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
//             font-size: 1.125rem;
//             padding: 1rem 2rem;
//             min-width: 200px;
//         }
//         .controlBtn.analyze:hover:not(:disabled) {
//             transform: translateY(-2px);
//             box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
//         }
//         .controlBtn .spinner {
//             display: none;
//             width: 16px;
//             height: 16px;
//             border: 2px solid rgba(255,255,255,0.3);
//             border-top: 2px solid #ffffff;
//             border-radius: 50%;
//             animation: spin 1s linear infinite;
//         }
//         .controlBtn.loading .spinner {
//             display: inline-block;
//         }
//         #videoContainer {
//             position: relative;
//             width: 100%;
//             max-width: 384px;
//             aspect-ratio: 384/518;
//             border-radius: 1.5rem;
//             overflow: hidden;
//             border: 2px solid #e5e7eb;
//             box-shadow: 0 4px 20px rgba(0,0,0,0.08);
//             margin: 0 auto;
//         }
//         #videoElement, #canvasElement {
//             position: absolute;
//             top: 0;
//             left: 0;
//             width: 100%;
//             height: 100%;
//             object-fit: cover;
//         }
//         #canvasElement {
//             pointer-events: none;
//             z-index: 20;
//         }
//         .recordingIndicator { 
//             background: #ff4757; 
//             color: #ffffff; 
//             padding: 0.5rem 1rem; 
//             border-radius: 12px; 
//             font-size: 0.875rem; 
//             font-weight: 600; 
//             display: flex; 
//             align-items: center; 
//             gap: 0.5rem; 
//             position: absolute; 
//             top: 0.5rem; 
//             left: 0.5rem; 
//             z-index: 100; 
//         }
//         .recordingDot { 
//             width: 8px; 
//             height: 8px; 
//             background: #ffffff; 
//             border-radius: 50%; 
//             animation: pulse 1.5s infinite; 
//         }
//         @keyframes pulse { 
//             0%, 100% { opacity: 1; } 
//             50% { opacity: 0.5; } 
//         }
//         .faceAlert {
//             position: absolute;
//             bottom: 1rem;
//             left: 50%;
//             transform: translateX(-50%) translateY(20px);
//             background: rgba(239, 68, 68, 0.95);
//             color: white;
//             padding: 0.75rem 1.5rem;
//             border-radius: 12px;
//             font-weight: 600;
//             font-size: 0.875rem;
//             z-index: 110;
//             display: none;
//             opacity: 0;
//             transition: all 0.3s ease;
//             box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
//         }
//         .faceAlert.show {
//             display: block;
//             opacity: 1;
//             transform: translateX(-50%) translateY(0);
//         }
//         .controlsGrid { 
//             display: flex; 
//             gap: 1rem; 
//             justify-content: center;
//             width: 100%;
//             flex-wrap: wrap;
//         }
//         .statusMessage {
//             text-align: center;
//             padding: 1rem;
//             border-radius: 12px;
//             font-weight: 600;
//             width: 100%;
//             max-width: 384px;
//         }
//         .statusMessage.info {
//             background: #dbeafe;
//             color: #1e40af;
//         }
//         .statusMessage.success {
//             background: #d1fae5;
//             color: #065f46;
//         }
//         .statusMessage.error {
//             background: #fee2e2;
//             color: #991b1b;
//         }
//         .statusMessage.warning {
//             background: #fef3c7;
//             color: #92400e;
//         }
//         @media screen and (max-width: 479px) { 
//             .cameraContainer { 
//                 padding: 1rem; 
//             }
//             .controlBtn {
//                 width: 100%;
//             }
//         }
//     </style>
// </head>
// <body>
//     <div class="mainContainer">
//         <div class="header">
//             <h1>🏥 Health Vitals Scanner</h1>
//             <p>Position your face in frame and record for 30 seconds</p>
//         </div>

//         <div class="cameraContainer">
//             <div class="loadingState" id="loadingState">
//                 <div class="loadingSpinner"></div>
//                 <p>Loading scanner...</p>
//             </div>
            
//             <div id="errorState" class="errorState" style="display: none;">
//                 <div class="errorIcon">⚠</div>
//                 <p class="errorText" id="errorText">Failed to access camera</p>
//                 <button class="controlBtn" id="retryBtn">Try Again</button>
//             </div>
            
//             <div id="cameraInterface" style="display: none; width: 100%;">
//                 <div id="videoContainer">
//                     <video id="videoElement" autoplay playsinline muted></video>
//                     <canvas id="canvasElement"></canvas>
//                     <div id="recordingIndicator" class="recordingIndicator" style="display: none;">
//                         <div class="recordingDot"></div>
//                         <span id="recordingTime">REC 00:00</span>
//                     </div>
//                     <div id="faceAlert" class="faceAlert">
//                         ⚠️ No face detected! Recording paused
//                     </div>
//                 </div>
                
//                 <div id="statusMessage" class="statusMessage info" style="display: none;">
//                     Ready to scan
//                 </div>
                
//                 <div class="controlsGrid">
//                     <button id="startBtn" class="controlBtn">🎥 Start Scanning</button>
//                     <button id="stopBtn" class="controlBtn danger" style="display: none;">⏹️ Stop Recording</button>
//                     <button id="recordAgainBtn" class="controlBtn" style="display: none;">🔄 Record Again</button>
//                 </div>

//                 <button id="analyzeBtn" class="controlBtn analyze" style="display: none; margin-top: 1rem;" disabled>
//                     <span class="spinner"></span>
//                     <span class="btnText">📊 Analyze Results</span>
//                 </button>
//             </div>
//         </div>
//     </div>

//     <script>
//         let videoRef, canvasRef, mediaRecorderRef, recordingTimerRef, stream = null;
//         let faceMesh = null;
//         let camera = null;
//         let isRecording = false, recordingDuration = 0;
//         let recordedVideoUrl = null;
//         let aiPrediction = null;
        
//         // Face detection
//         let faceDetected = false;
//         let faceDetectionTimeout = null;
//         let recordingPaused = false;
//         let recordedBlob = null;
        
//         const AI_API_URL = "https://anurudh-268064419384.asia-east1.run.app/analyze";
//         const WIDTH = 1280, HEIGHT = 720;

//         function formatTime(s) { 
//             const m = Math.floor(s / 60); 
//             return m.toString().padStart(2, "0") + ":" + (s % 60).toString().padStart(2, "0"); 
//         }

//         function showStatus(msg, type) {
//             const statusEl = document.getElementById("statusMessage");
//             statusEl.className = "statusMessage " + type;
//             statusEl.textContent = msg;
//             statusEl.style.display = "block";
//         }

//         function hideStatus() {
//             document.getElementById("statusMessage").style.display = "none";
//         }

//         function loadMediaPipeScripts() {
//             return new Promise((resolve, reject) => {
//                 const scripts = [
//                     "https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/drawing_utils.js",
//                     "https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js",
//                     "https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/face_mesh.js"
//                 ];
                
//                 function loadScript(index) {
//                     if (index >= scripts.length) {
//                         resolve();
//                         return;
//                     }
                    
//                     const script = document.createElement("script");
//                     script.src = scripts[index];
//                     script.crossOrigin = "anonymous";
//                     script.onload = () => {
//                         console.log("Loaded:", scripts[index]);
//                         loadScript(index + 1);
//                     };
//                     script.onerror = () => reject(new Error("Failed to load: " + scripts[index]));
//                     document.head.appendChild(script);
//                 }
                
//                 loadScript(0);
//             });
//         }

//         async function initializeFaceMesh() {
//             if (typeof FaceMesh === 'undefined') {
//                 throw new Error("FaceMesh not loaded");
//             }

//             faceMesh = new FaceMesh({
//                 locateFile: (file) => "https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/" + file
//             });

//             faceMesh.setOptions({
//                 maxNumFaces: 1,
//                 refineLandmarks: true,
//                 minDetectionConfidence: 0.5,
//                 minTrackingConfidence: 0.5
//             });

//             faceMesh.onResults(onFaceMeshResults);
//         }

//         function onFaceMeshResults(results) {
//             if (!canvasRef) return;
            
//             canvasRef.width = WIDTH;
//             canvasRef.height = HEIGHT;
            
//             const ctx = canvasRef.getContext('2d');
//             ctx.save();
//             ctx.clearRect(0, 0, WIDTH, HEIGHT);
//             ctx.drawImage(results.image, 0, 0, WIDTH, HEIGHT);

//             const hasFace = results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0;

//             if (hasFace) {
//                 handleFaceDetected();
//                 const landmarks = results.multiFaceLandmarks[0];
                
//                 if (typeof FACEMESH_TESSELATION !== 'undefined') {
//                     ctx.strokeStyle = '#FFFFFF';
//                     ctx.lineWidth = 1;
//                     ctx.globalAlpha = 0.5;
                    
//                     const connections = FACEMESH_TESSELATION;
//                     for (let i = 0; i < connections.length; i += 15) {
//                         const connection = connections[i];
//                         const from = landmarks[connection[0]];
//                         const to = landmarks[connection[1]];
                        
//                         ctx.beginPath();
//                         ctx.moveTo(from.x * WIDTH, from.y * HEIGHT);
//                         ctx.lineTo(to.x * WIDTH, to.y * HEIGHT);
//                         ctx.stroke();
//                     }
//                     ctx.globalAlpha = 1.0;
//                 }
                
//                 ctx.strokeStyle = '#10b981';
//                 ctx.lineWidth = 4;
//                 ctx.strokeRect(10, 10, WIDTH - 20, HEIGHT - 20);
//             } else {
//                 handleFaceLost();
//                 ctx.strokeStyle = '#ef4444';
//                 ctx.lineWidth = 4;
//                 ctx.strokeRect(10, 10, WIDTH - 20, HEIGHT - 20);
//             }

//             ctx.restore();
//         }

//         function handleFaceDetected() {
//             if (faceDetectionTimeout) {
//                 clearTimeout(faceDetectionTimeout);
//                 faceDetectionTimeout = null;
//             }
            
//             if (!faceDetected) {
//                 faceDetected = true;
//                 hideFaceAlert();
                
//                 // Resume recording if paused
//                 if (isRecording && recordingPaused && mediaRecorderRef && mediaRecorderRef.state === 'paused') {
//                     mediaRecorderRef.resume();
//                     recordingPaused = false;
//                     console.log("Recording resumed - face detected");
//                 }
//             }
//         }

//         function handleFaceLost() {
//             if (faceDetected) {
//                 if (!faceDetectionTimeout) {
//                     faceDetectionTimeout = setTimeout(() => {
//                         faceDetected = false;
//                         showFaceAlert();
                        
//                         // Pause recording if no face
//                         if (isRecording && !recordingPaused && mediaRecorderRef && mediaRecorderRef.state === 'recording') {
//                             mediaRecorderRef.pause();
//                             recordingPaused = true;
//                             console.log("Recording paused - no face detected");
//                         }
//                     }, 1000);
//                 }
//             }
//         }

//         function showFaceAlert() {
//             const alertDiv = document.getElementById("faceAlert");
//             alertDiv.classList.add("show");
//         }

//         function hideFaceAlert() {
//             const alertDiv = document.getElementById("faceAlert");
//             alertDiv.classList.remove("show");
//         }

//         async function initializeScanner() { 
//             try { 
//                 await loadMediaPipeScripts(); 
//                 await initializeFaceMesh();
//                 await startCamera(); 
//                 setupEventListeners(); 
                
//                 document.getElementById("loadingState").style.display = "none"; 
//                 document.getElementById("cameraInterface").style.display = "block";
//                 showStatus("Ready to scan!", "info");
//             } catch (error) { 
//                 showError(error.message || "Failed to initialize"); 
//             } 
//         }

//         async function startCamera() { 
//             try { 
//                 videoRef = document.getElementById("videoElement");
//                 canvasRef = document.getElementById("canvasElement");
                
//                 if (stream) stream.getTracks().forEach(t => t.stop()); 
                
//                 stream = await navigator.mediaDevices.getUserMedia({ 
//                     video: { 
//                         width: { ideal: WIDTH },
//                         height: { ideal: HEIGHT },
//                         facingMode: "user",
//                         frameRate: { ideal: 30 }
//                     }, 
//                     audio: false 
//                 }); 
                
//                 videoRef.srcObject = stream;
                
//                 if (typeof Camera !== 'undefined' && faceMesh) {
//                     camera = new Camera(videoRef, {
//                         onFrame: async () => {
//                             await faceMesh.send({image: videoRef});
//                         },
//                         width: WIDTH,
//                         height: HEIGHT
//                     });
//                     camera.start();
//                 }
//             } catch (error) { 
//                 throw new Error("Camera access denied"); 
//             } 
//         }

//         function setupEventListeners() { 
//             document.getElementById("startBtn").addEventListener("click", startRecording); 
//             document.getElementById("stopBtn").addEventListener("click", stopRecording); 
//             document.getElementById("recordAgainBtn").addEventListener("click", startRecording);
//             document.getElementById("retryBtn").addEventListener("click", () => window.location.reload());
//             document.getElementById("analyzeBtn").addEventListener("click", analyzeVideo);
//         }

//         function startRecording() { 
//             if (!stream) return; 
            
//             resetAll();
//             isRecording = true; 
//             recordingDuration = 0;
//             recordingPaused = false;
            
//             const startBtn = document.getElementById("startBtn");
//             const stopBtn = document.getElementById("stopBtn");
//             const recordAgainBtn = document.getElementById("recordAgainBtn");
//             const analyzeBtn = document.getElementById("analyzeBtn");

//             startBtn.style.display = "none";
//             stopBtn.style.display = "block";
//             recordAgainBtn.style.display = "none";
//             analyzeBtn.style.display = "none";
            
//             document.getElementById("recordingIndicator").style.display = "flex"; 
//             document.getElementById("videoContainer").style.border = "4px solid #ff4757";
//             showStatus("Recording... Keep your face in frame", "warning");

//             const chunks = []; 
//             const options = {
//                 mimeType: 'video/webm;codecs=vp9',
//                 videoBitsPerSecond: 5000000
//             };
            
//             if (!MediaRecorder.isTypeSupported(options.mimeType)) {
//                 options.mimeType = 'video/webm;codecs=vp8';
//             }
            
//             mediaRecorderRef = new MediaRecorder(stream, options);

//             mediaRecorderRef.ondataavailable = e => { 
//                 if (e.data.size > 0) chunks.push(e.data); 
//             }; 
            
//             mediaRecorderRef.onstop = async () => { 
//                 if (recordingTimerRef) { 
//                     clearInterval(recordingTimerRef); 
//                     recordingTimerRef = null; 
//                 } 
//                 isRecording = false;
//                 recordingPaused = false;
//                 document.getElementById("recordingIndicator").style.display = "none"; 
//                 document.getElementById("videoContainer").style.border = "2px solid #e5e7eb"; 
//                 stopBtn.style.display = "none"; 
//                 recordAgainBtn.style.display = "block";
//                 hideFaceAlert();
                
//                 recordedBlob = new Blob(chunks, { type: "video/webm" });
//                 recordedVideoUrl = URL.createObjectURL(recordedBlob);
                
//                 showStatus("Recording complete! Click 'Analyze Results' to continue", "success");
                
//                 // Enable analyze button
//                 analyzeBtn.style.display = "block";
//                 analyzeBtn.disabled = false;
//             }; 
            
//             mediaRecorderRef.start(); 
            
//             recordingTimerRef = setInterval(() => { 
//                 recordingDuration++; 
//                 document.getElementById("recordingTime").textContent = "REC " + formatTime(recordingDuration); 
//                 if (recordingDuration >= 30) stopRecording(); 
//             }, 1000); 
//         }

//         function stopRecording() { 
//             if (mediaRecorderRef && mediaRecorderRef.state !== "inactive") {
//                 if (mediaRecorderRef.state === "paused") {
//                     mediaRecorderRef.resume();
//                 }
//                 mediaRecorderRef.stop(); 
//             }
//         }

//         async function analyzeVideo() {
//             if (!recordedBlob) {
//                 showStatus("No video recorded!", "error");
//                 return;
//             }

//             const analyzeBtn = document.getElementById("analyzeBtn");
//             analyzeBtn.disabled = true;
//             analyzeBtn.classList.add("loading");
//             analyzeBtn.querySelector(".btnText").textContent = "Analyzing...";
//             showStatus("Analyzing video... This may take a moment", "warning");

//             try {
//                 const fd = new FormData();
//                 fd.append("file", recordedBlob, "scan.webm");
                
//                 const res = await axios.post(AI_API_URL, fd, {
//                     headers: { "Content-Type": "multipart/form-data" },
//                     timeout: 120000,
//                     onUploadProgress: (progressEvent) => {
//                         const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
//                         showStatus("Uploading... " + percentCompleted + "%", "warning");
//                     }
//                 });
                
//                 aiPrediction = res.data;
                
//                 if (!aiPrediction || aiPrediction.error) {
//                     throw new Error(aiPrediction.error || "Analysis failed");
//                 }
                
//                 showStatus("Analysis complete! Redirecting to results...", "success");
                
//                 // Redirect to results page with data
//                 setTimeout(() => {
//                     window.location.href = '/results?data=' + encodeURIComponent(JSON.stringify(aiPrediction)) + 
//                                           '&video=' + encodeURIComponent(recordedVideoUrl);
//                 }, 1500);
                
//             } catch (error) {
//                 console.error("Analysis error:", error);
//                 showStatus("Analysis failed: " + error.message, "error");
//                 analyzeBtn.disabled = false;
//                 analyzeBtn.classList.remove("loading");
//                 analyzeBtn.querySelector(".btnText").textContent = "📊 Retry Analysis";
//             }
//         }

//         function resetAll() {
//             isRecording = false;
//             recordingDuration = 0;
//             recordingPaused = false;
//             recordedBlob = null;
//             recordedVideoUrl = null;
//             aiPrediction = null;
            
//             if (recordingTimerRef) {
//                 clearInterval(recordingTimerRef);
//                 recordingTimerRef = null;
//             }
            
//             hideFaceAlert();
//             hideStatus();
            
//             const analyzeBtn = document.getElementById("analyzeBtn");
//             analyzeBtn.style.display = "none";
//             analyzeBtn.disabled = true;
//             analyzeBtn.classList.remove("loading");
//             analyzeBtn.querySelector(".btnText").textContent = "📊 Analyze Results";
//         }

//         function showError(msg) { 
//             document.getElementById("loadingState").style.display = "none"; 
//             document.getElementById("cameraInterface").style.display = "none"; 
//             document.getElementById("errorText").textContent = msg; 
//             document.getElementById("errorState").style.display = "flex"; 
//         }

//         document.addEventListener("DOMContentLoaded", initializeScanner);
//     </script>
// </body>
// </html>`;

//     res.setHeader('Content-Type', 'text/html; charset=utf-8');
//     res.send(html);
//   } catch (error) {
//     res.status(500).json({ success: false, error: error.message });
//   }
// }



async function getCameraPage(req, res, next) {
  try {
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>Health Vitals Scanner</title>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/axios/1.4.0/axios.min.js"></script>
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { 
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; 
            background: linear-gradient(135deg,);
            min-height: 100vh;
            padding: 1rem;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .mainContainer {
            width: 100%;
            max-width: 500px;
        }
        .videoOverlay {
            position: absolute;
            inset: 0;
            pointer-events: none;
            z-index: 30;
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            -webkit-mask-image: radial-gradient(ellipse 61% 68% at 50% 50%, transparent 69%, black 71%);
            mask-image: radial-gradient(ellipse 61% 68% at 50% 50%, transparent 69%, black 71%);
            background: rgba(255,255,255,0.10);
        }
        .videoOval {
            position: absolute;
            left: 6%;
            top: 4%;
            width: 88%;
            height: 92%;
            border: 5px dashed #fff;
            border-radius: 50%;
            z-index: 31;
            pointer-events: none;
        }
        .header { 
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            padding: 1.5rem; 
            border-radius: 20px 20px 0 0; 
            text-align: center;
            border-bottom: 3px solid rgba(102, 126, 234, 0.3);
        }
        .header h1 { 
            font-size: 1.5rem;
            background: linear-gradient(135deg, #000000);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            font-weight: 500; 
            margin-bottom: 0.5rem; 
        }
        .header p { 
            font-size: 0.875rem;
            color: #64748b; 
            font-weight: 500;
        }
        .cameraContainer { 
            background: rgba(255, 255, 255, 0.98);
            backdrop-filter: blur(20px);
            border-radius: 0 0 20px 20px; 
            padding: 1.5rem; 
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3); 
            display: flex; 
            flex-direction: column; 
            align-items: center; 
            gap: 1.5rem;
        }
        .loadingState { 
            text-align: center; 
            padding: 3rem 1rem; 
            color: #64748b; 
        }
        .loadingSpinner { 
            width: 40px; 
            height: 40px; 
            border: 4px solid #f1f5f9; 
            border-top: 4px solid #667eea; 
            border-radius: 50%; 
            animation: spin 1s linear infinite; 
            display: inline-block; 
            margin-bottom: 1rem; 
        }
        @keyframes spin { 
            0% { transform: rotate(0deg); } 
            100% { transform: rotate(360deg); } 
        }
        .errorState { 
            background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
            border-radius: 16px; 
            padding: 2rem 1.5rem; 
            text-align: center; 
            border: 2px solid #ef4444; 
            width: 100%;
            min-height: 300px;
            display: flex; 
            flex-direction: column; 
            align-items: center; 
            justify-content: center; 
        }
        .errorIcon { 
            font-size: 4rem;
            margin-bottom: 1rem;
            animation: shake 0.5s ease-in-out;
        }
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-10px); }
            75% { transform: translateX(10px); }
        }
        .errorText { 
            font-size: 1.125rem; 
            color: #991b1b; 
            margin-bottom: 1.5rem;
            font-weight: 600; 
        }
        .controlBtn { 
            background: linear-gradient(135deg);
            color: #000000ff; 
            border: none; 
            padding: 1rem 2rem; 
           margin-top: 15px;
            border-radius: 12px; 
            font-size: 1rem; 
            font-weight: 700; 
            cursor: pointer; 
            transition: all 0.3s ease; 
            display: flex; 
            align-items: center; 
            justify-content: center;
            gap: 0.75rem; 
            min-width: 160px;
            min-height: 52px;
            box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
            position: relative;
            overflow: hidden;
        }
        .controlBtn::before {
            content: '';
            position: absolute;
            top: 50%;
            left: 50%;
            width: 0;
            height: 0;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.3);
            transform: translate(-50%, -50%);
            transition: width 0.6s, height 0.6s;
        }
        .controlBtn:hover:not(:disabled)::before {
            width: 300px;
            height: 300px;
        }
        .controlBtn:hover:not(:disabled) { 
            transform: translateY(-3px); 
            box-shadow: 0 8px 25px rgba(102, 126, 234, 0.5); 
        }
        .controlBtn:active:not(:disabled) {
            transform: translateY(-1px);
        }
        .controlBtn:disabled {
            background: linear-gradient(135deg, #cbd5e1 0%, #94a3b8 100%);
            cursor: not-allowed;
            box-shadow: none;
        }
        .controlBtn .spinner {
            display: none;
            width: 18px;
            height: 18px;
            border: 3px solid rgba(255,255,255,0.3);
            border-top: 3px solid #ffffff;
            border-radius: 50%;
            animation: spin 1s linear infinite;
        }
        .controlBtn.loading .spinner {
            display: inline-block;
        }
        #videoContainer {
            position: relative;
            width: 100%;
            aspect-ratio: 3/4;
            border-radius: 20px;
            overflow: hidden;
            border: 4px solid rgba(102, 126, 234, 0.3);
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
            background: #000;
        }
        #videoContainer.scanning {
            border-color: #10b981;
            box-shadow: 0 10px 40px rgba(16, 185, 129, 0.5);
        }
        #videoElement, #canvasElement {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
        #canvasElement {
            pointer-events: none;
            z-index: 20;
        }
        .scanningIndicator { 
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            color: #ffffff; 
            padding: 0.75rem 1.25rem; 
            border-radius: 50px; 
            font-size: 0.875rem; 
            font-weight: 700; 
            display: flex; 
            align-items: center; 
            gap: 0.75rem; 
            position: absolute; 
            top: 1rem; 
            left: 1rem; 
            z-index: 100; 
            box-shadow: 0 4px 12px rgba(16, 185, 129, 0.5);
            backdrop-filter: blur(10px);
        }
        .scanningDot { 
            width: 10px; 
            height: 10px; 
            background: #ffffff; 
            border-radius: 50%; 
            animation: pulse 1.5s infinite; 
        }
        @keyframes pulse { 
            0%, 100% { opacity: 1; transform: scale(1); } 
            50% { opacity: 0.4; transform: scale(0.8); } 
        }
        .faceAlert {
            position: absolute;
            bottom: 1.5rem;
            left: 50%;
            transform: translateX(-50%) translateY(20px);
            background: rgba(239, 68, 68, 0.95);
            backdrop-filter: blur(10px);
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 50px;
            font-weight: 700;
            font-size: 0.875rem;
            z-index: 110;
            display: none;
            opacity: 0;
            transition: all 0.3s ease;
            box-shadow: 0 6px 20px rgba(239, 68, 68, 0.6);
            border: 2px solid rgba(255, 255, 255, 0.3);
        }
        .faceAlert.show {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            opacity: 1;
            transform: translateX(-50%) translateY(0);
        }
        .faceAlert.warning {
            background: rgba(245, 158, 11, 0.95);
            border-color: rgba(255, 255, 255, 0.3);
            box-shadow: 0 6px 20px rgba(245, 158, 11, 0.6);
        }
        .controlsGrid { 
            display: flex; 
            gap: 1rem; 
            justify-content: center;
            width: 100%;
            flex-wrap: wrap;
        }
        .statusMessage {
            text-align: center;
            padding: 1rem 1.5rem;
            border-radius: 12px;
            font-weight: 600;
            width: 100%;
            font-size: 0.875rem;
            border: 2px solid;
            backdrop-filter: blur(10px);
        }
        .statusMessage.info {
            background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
            color: #1e40af;
            border-color: #3b82f6;
        }
        .statusMessage.success {
            background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
            color: #065f46;
            border-color: #10b981;
        }
        .statusMessage.error {
            background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
            color: #991b1b;
            border-color: #ef4444;
        }
        .statusMessage.warning {
            background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
            color: #92400e;
            border-color: #f59e0b;
        }
        @media screen and (max-width: 479px) { 
            body {
                padding: 0.5rem;
            }
            .header {
                padding: 1rem;
                border-radius: 16px 16px 0 0;
            }
            .header h1 {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);  
                font-size: 1.25rem;
            }
            .cameraContainer { 
                padding: 1rem;
                border-radius: 0 0 16px 16px;
            }
            .controlBtn {
                width: 100%;
                min-width: unset;
            }
            .controlsGrid {
                flex-direction: column;
            }
            #videoContainer {
                aspect-ratio: 9/16;
            }
        }
    </style>
</head>
<body>
    <div class="mainContainer">
        <div class="header">
            <h1>🏥 Health Vitals Scanner</h1>
            <p>Position your face in frame • Scan for 30 seconds</p>
        </div>

        <div class="cameraContainer">
            <div class="loadingState" id="loadingState">
                <div class="loadingSpinner"></div>
                <p style="font-weight: 600; font-size: 1.125rem;">Loading Scanner...</p>
                <p style="margin-top: 0.5rem; font-size: 0.875rem;">Please wait</p>
            </div>
            
            <div id="errorState" class="errorState" style="display: none;">
                <div class="errorIcon">⚠️</div>
                <p class="errorText" id="errorText">Failed to access camera</p>
                <button class="controlBtn" id="retryBtn">🔄 Try Again</button>
            </div>
            
            <div id="cameraInterface" style="display: none; width: 100%;">
                <div id="videoContainer">
                   <video id="videoElement" autoplay playsinline muted></video>
                    <canvas id="canvasElement"></canvas>
                    <div class="videoOverlay"></div>
                    <div class="videoOval"></div>
                    <div id="scanningIndicator" class="scanningIndicator" style="display: none;">
                        <div class="scanningDot"></div>
                        <span id="scanningTime">SCAN 00:00</span>
                    </div>
                    <div id="faceAlert" class="faceAlert">
                        ⚠️ No face detected! Scanning paused
                    </div>
                </div>
                
                <div id="statusMessage" class="statusMessage info" style="display: none;">
                    Ready to scan
                </div>
                
                <div class="controlsGrid" id="controlsGrid">
                    <button id="startBtn" class="controlBtn">
                        🎯 Start Scanning
                    </button>
                </div>
            </div>
        </div>
    </div>

    <script>
        let videoRef, canvasRef, mediaRecorderRef, scanningTimerRef, stream = null;
        let faceMesh = null;
        let camera = null;
        let isScanning = false, actualDuration = 0, displayDuration = 0;
        let recordedVideoUrl = null;
        let aiPrediction = null;
        
        let faceDetected = false;
        let faceDetectionTimeout = null;
        let scanningPaused = false;
        let recordedBlob = null;
        let scanCompleted = false;
        let currentAlertType = null;
        let lastFaceSize = 0;
        let distanceWarningShown = false;
        const MIN_FACE_SIZE = 0.40;
        const IDEAL_FACE_SIZE = 0.42;
        const CENTER_TOLERANCE = 0.15; 
        const MIN_BRIGHTNESS = 60; 



        const AI_API_URL = "https://anurudh-268064419384.asia-east1.run.app/analyze";
        const WIDTH = 1280, HEIGHT = 720;
        const ACTUAL_DURATION = 35;
        const DISPLAY_DURATION = 30;

        function formatTime(s) { 
            const m = Math.floor(s / 60); 
            return m.toString().padStart(2, "0") + ":" + (s % 60).toString().padStart(2, "0"); 
        }

        function showStatus(msg, type) {
            const statusEl = document.getElementById("statusMessage");
            statusEl.className = "statusMessage " + type;
            statusEl.textContent = msg;
            statusEl.style.display = "block";
        }

        function hideStatus() {
            document.getElementById("statusMessage").style.display = "none";
        }

        function loadMediaPipeScripts() {
            return new Promise((resolve, reject) => {
                const scripts = [
                    "https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/drawing_utils.js",
                    "https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js",
                    "https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/face_mesh.js"
                ];
                
                function loadScript(index) {
                    if (index >= scripts.length) {
                        resolve();
                        return;
                    }
                    
                    const script = document.createElement("script");
                    script.src = scripts[index];
                    script.crossOrigin = "anonymous";
                    script.onload = () => {
                        console.log("Loaded:", scripts[index]);
                        loadScript(index + 1);
                    };
                    script.onerror = () => reject(new Error("Failed to load: " + scripts[index]));
                    document.head.appendChild(script);
                }
                
                loadScript(0);
            });
        }

        async function initializeFaceMesh() {
            if (typeof FaceMesh === 'undefined') {
                throw new Error("FaceMesh not loaded");
            }

            faceMesh = new FaceMesh({
                locateFile: (file) => "https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/" + file
            });

            faceMesh.setOptions({
                maxNumFaces: 1,
                refineLandmarks: false,
                minDetectionConfidence: 0.3,
                minTrackingConfidence: 0.3
            });

            faceMesh.onResults(onFaceMeshResults);
            console.log("FaceMesh initialized");
        }

        function onFaceMeshResults(results) {
            if (!canvasRef || scanCompleted) return;
            
            canvasRef.width = WIDTH;
            canvasRef.height = HEIGHT;
            
            const ctx = canvasRef.getContext('2d');
            ctx.save();
            ctx.clearRect(0, 0, WIDTH, HEIGHT);

            const hasFace = results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0;

            if (hasFace) {
                const landmarks = results.multiFaceLandmarks[0];
                
                let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
                landmarks.forEach(landmark => {
                    minX = Math.min(minX, landmark.x);
                    maxX = Math.max(maxX, landmark.x);
                    minY = Math.min(minY, landmark.y);
                    maxY = Math.max(maxY, landmark.y);
                });
                
                const faceWidth = maxX - minX;
                const faceHeight = maxY - minY;
                const faceSize = Math.max(faceWidth, faceHeight);
                lastFaceSize = faceSize;
                
                // Real-time distance feedback
                const facePercentage = (faceSize * 100).toFixed(1);
                console.log("📏 Face size:", facePercentage + "% of frame");
                
              // Calculate face center
const faceCenterX = (minX + maxX) / 2;
const faceCenterY = (minY + maxY) / 2;
const frameCenterX = 0.5;
const frameCenterY = 0.5;

// Check if face is centered
const offsetX = Math.abs(faceCenterX - frameCenterX);
const offsetY = Math.abs(faceCenterY - frameCenterY);
const isOffCenter = offsetX > CENTER_TOLERANCE || offsetY > CENTER_TOLERANCE;

// Calculate brightness
const tempCanvasBright = document.createElement('canvas');
tempCanvasBright.width = WIDTH;
tempCanvasBright.height = HEIGHT;
const tempCtxBright = tempCanvasBright.getContext('2d');
tempCtxBright.drawImage(results.image, 0, 0, WIDTH, HEIGHT);

const faceX = Math.floor(minX * WIDTH);
const faceY = Math.floor(minY * HEIGHT);
const faceW = Math.floor((maxX - minX) * WIDTH);
const faceH = Math.floor((maxY - minY) * HEIGHT);
const imageData = tempCtxBright.getImageData(faceX, faceY, faceW, faceH);

let totalBrightness = 0;
for (let i = 0; i < imageData.data.length; i += 4) {
    totalBrightness += (imageData.data[i] + imageData.data[i + 1] + imageData.data[i + 2]) / 3;
}
const avgBrightness = totalBrightness / (imageData.data.length / 4);
const isLowLight = avgBrightness < MIN_BRIGHTNESS;

console.log("📏 Face:", (faceSize * 100).toFixed(1) + "% | Center:", !isOffCenter ? "✅" : "❌", "| Light:", Math.round(avgBrightness));

if (faceSize < MIN_FACE_SIZE) {
    if (currentAlertType !== 'far') {
        const alertDiv = document.getElementById("faceAlert");
        alertDiv.innerHTML = '🚫 Too far! Move within 1 foot of camera';
        alertDiv.classList.add("show");
        alertDiv.classList.remove("warning");
        currentAlertType = 'far';
    }
    if (isScanning && !scanningPaused && mediaRecorderRef && mediaRecorderRef.state === 'recording') {
        mediaRecorderRef.pause();
        scanningPaused = true;
        if (scanningTimerRef) {
            clearInterval(scanningTimerRef);
            scanningTimerRef = null;
        }
    }
} else if (isOffCenter) {
    if (currentAlertType !== 'center') {
        const alertDiv = document.getElementById("faceAlert");
        let dir = offsetX > CENTER_TOLERANCE ? (faceCenterX < frameCenterX ? 'right' : 'left') : (faceCenterY < frameCenterY ? 'down' : 'up');
        alertDiv.innerHTML = '⚠️ Move your face ' + dir + ' to center it';
        alertDiv.classList.add("show", "warning");
        currentAlertType = 'center';
    }
    handleFaceDetected();
} else if (isLowLight) {
    if (currentAlertType !== 'light') {
        const alertDiv = document.getElementById("faceAlert");
        alertDiv.innerHTML = '💡 More light needed! Move to brighter area';
        alertDiv.classList.add("show", "warning");
        currentAlertType = 'light';
    }
    handleFaceDetected();
} else if (faceSize < IDEAL_FACE_SIZE) {
    if (currentAlertType !== 'warning') {
        const alertDiv = document.getElementById("faceAlert");
        alertDiv.innerHTML = '⚠️ Move a bit closer for best scan quality';
        alertDiv.classList.add("show", "warning");
        currentAlertType = 'warning';
    }
    handleFaceDetected();
} else {
    if (currentAlertType !== null) {
        const alertDiv = document.getElementById("faceAlert");
        alertDiv.classList.remove("show", "warning");
        currentAlertType = null;
    }
    handleFaceDetected();
}
                
                const padding = 0.10;
                minX = Math.max(0, minX - padding);
                maxX = Math.min(1, maxX + padding);
                minY = Math.max(0, minY - padding);
                maxY = Math.min(1, maxY + padding);
                
                const tempCanvas = document.createElement('canvas');
                tempCanvas.width = WIDTH;
                tempCanvas.height = HEIGHT;
                const tempCtx = tempCanvas.getContext('2d');
                
                tempCtx.drawImage(results.image, 0, 0, WIDTH, HEIGHT);
                tempCtx.filter = 'blur(25px) brightness(0.6)';
                tempCtx.drawImage(tempCanvas, 0, 0);
                
                const centerX = ((minX + maxX) / 2) * WIDTH;
                const centerY = ((minY + maxY) / 2) * HEIGHT;
                const radiusX = ((maxX - minX) / 2) * WIDTH;
                const radiusY = ((maxY - minY) / 2) * HEIGHT;
                
                ctx.save();
                ctx.beginPath();
                ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, 2 * Math.PI);
                ctx.clip();
                ctx.drawImage(results.image, 0, 0, WIDTH, HEIGHT);
                ctx.restore();
                
                ctx.save();
                ctx.globalCompositeOperation = "destination-over";
                ctx.drawImage(tempCanvas, 0, 0);
                ctx.globalCompositeOperation = "source-over";
                ctx.restore();
                
                if (typeof window.FACEMESH_TESSELATION !== 'undefined') {
                    window.drawConnectors(ctx, landmarks, window.FACEMESH_TESSELATION, { color: '#FFFFFF', lineWidth: 0.5 });
                    window.drawConnectors(ctx, landmarks, window.FACEMESH_FACE_OVAL, { color: '#FFFFFF', lineWidth: 2 });
                    window.drawConnectors(ctx, landmarks, window.FACEMESH_LEFT_EYE, { color: '#FFFFFF', lineWidth: 1.5 });
                    window.drawConnectors(ctx, landmarks, window.FACEMESH_RIGHT_EYE, { color: '#FFFFFF', lineWidth: 1.5 });
                    window.drawConnectors(ctx, landmarks, window.FACEMESH_LEFT_EYEBROW, { color: '#FFFFFF', lineWidth: 1.5 });
                    window.drawConnectors(ctx, landmarks, window.FACEMESH_RIGHT_EYEBROW, { color: '#FFFFFF', lineWidth: 1.5 });
                    window.drawConnectors(ctx, landmarks, window.FACEMESH_LIPS, { color: '#FFFFFF', lineWidth: 1.5 });
                    
                    landmarks.forEach(lm => {
                        ctx.beginPath();
                        ctx.arc(lm.x * WIDTH, lm.y * HEIGHT, 1, 0, Math.PI * 2);
                        ctx.fillStyle = '#ffffff';
                        ctx.fill();
                    });
                }
                
            } else {
                handleFaceLost();
                
                const tempCanvas = document.createElement('canvas');
                tempCanvas.width = WIDTH;
                tempCanvas.height = HEIGHT;
                const tempCtx = tempCanvas.getContext('2d');
                tempCtx.drawImage(results.image, 0, 0, WIDTH, HEIGHT);
                tempCtx.filter = 'blur(10px) brightness(0.7)';
                tempCtx.drawImage(tempCanvas, 0, 0);
                ctx.drawImage(tempCanvas, 0, 0);
                
                const centerX = WIDTH / 2;
                const centerY = HEIGHT / 2;
                const radiusX = WIDTH * 0.35;
                const radiusY = HEIGHT * 0.45;
                
                ctx.beginPath();
               ctx.ellipse(centerX, centerY, radiusY, radiusX, Math.PI / 2, 0, 2 * Math.PI);
               ctx.clip();
ctx.drawImage(results.image, 0, 0, WIDTH, HEIGHT);
ctx.restore();
               ctx.strokeStyle = '#ef4444';
                ctx.lineWidth = 4;
                ctx.setLineDash([15, 15]);
                ctx.stroke();
                ctx.setLineDash([]);
            }

            ctx.restore();
        }

      function handleFaceTooFar() {
            const facePercentage = (lastFaceSize * 100).toFixed(1);
            console.log("❌ TOO FAR! Face size:", facePercentage + "% (minimum: 40%)");
            showDistanceAlert('far');
            distanceWarningShown = false; // Reset warning flag
            
            if (isScanning && !scanningPaused && mediaRecorderRef) {
                if (mediaRecorderRef.state === 'recording') {
                    mediaRecorderRef.pause();
                    scanningPaused = true;
                    
                    if (scanningTimerRef) {
                        clearInterval(scanningTimerRef);
                        scanningTimerRef = null;
                    }
                    console.log("⏸️ Scanning paused - face too far");
                }
            }
        }

        function handleFaceDistanceWarning() {
            if (!distanceWarningShown) {
                const facePercentage = (lastFaceSize * 100).toFixed(1);
                console.log("⚠️ Warning! Face size:", facePercentage + "% (ideal: 50%+)");
                showDistanceAlert('warning');
                distanceWarningShown = true;
            }
        }
      function handleFaceDistanceOk() {
            const facePercentage = (lastFaceSize * 100).toFixed(1);
            console.log("✅ Perfect distance! Face size:", facePercentage + "%");
            hideDistanceAlert();
            distanceWarningShown = false;
        }

        function showDistanceAlert(type) {
            const alertDiv = document.getElementById("faceAlert");
            if (type === 'far') {
                alertDiv.innerHTML = '🚫 Too far! Move within 1 foot of camera';
                alertDiv.classList.add("show");
                alertDiv.classList.remove("warning");
            } else {
               
                alertDiv.classList.add("show", "warning");
            }
        }

        function hideDistanceAlert() {
            const alertDiv = document.getElementById("faceAlert");
            if (alertDiv.textContent.includes('Move closer')) {
                alertDiv.classList.remove("show", "warning");
            }
        }

        function handleFaceDetected() {
            if (faceDetectionTimeout) {
                clearTimeout(faceDetectionTimeout);
                faceDetectionTimeout = null;
            }
            
            if (!faceDetected) {
                faceDetected = true;
                console.log("✅ Face detected!");
                hideFaceAlert();
                
                if (isScanning && scanningPaused && mediaRecorderRef) {
                    if (mediaRecorderRef.state === 'paused') {
                        mediaRecorderRef.resume();
                        scanningPaused = false;
                        
                        if (!scanningTimerRef) {
                            scanningTimerRef = setInterval(() => { 
                                actualDuration++;
                                displayDuration = Math.floor(actualDuration * (DISPLAY_DURATION / ACTUAL_DURATION));
                                document.getElementById("scanningTime").textContent = "SCAN " + formatTime(displayDuration); 
                                if (actualDuration >= ACTUAL_DURATION) stopScanning(); 
                            }, 1000);
                        }
                        console.log("▶️ Scanning resumed");
                    }
                }
            }
        }

        function handleFaceLost() {
            if (faceDetected && !faceDetectionTimeout) {
                faceDetectionTimeout = setTimeout(() => {
                    faceDetected = false;
                    console.log("❌ Face lost!");
                    showFaceAlert();
                    
                    if (isScanning && !scanningPaused && mediaRecorderRef) {
                        if (mediaRecorderRef.state === 'recording') {
                            mediaRecorderRef.pause();
                            scanningPaused = true;
                            
                            if (scanningTimerRef) {
                                clearInterval(scanningTimerRef);
                                scanningTimerRef = null;
                            }
                            console.log("⏸️ Scanning paused");
                        }
                    }
                }, 500);
            }
        }

        function showFaceAlert() {
            const alertDiv = document.getElementById("faceAlert");
            alertDiv.innerHTML = '⚠️ No face detected! Scanning paused';
            alertDiv.classList.remove("warning");
            alertDiv.classList.add("show");
        }

        function hideFaceAlert() {
            const alertDiv = document.getElementById("faceAlert");
            alertDiv.classList.remove("show", "warning");
        }

        async function initializeScanner() { 
            try { 
                await loadMediaPipeScripts(); 
                await initializeFaceMesh();
                await startCamera(); 
                setupEventListeners(); 
                
                document.getElementById("loadingState").style.display = "none"; 
                document.getElementById("cameraInterface").style.display = "block";
                showStatus("✅ Camera ready! Click 'Start Scanning' to begin", "info");
            } catch (error) { 
                showError(error.message || "Failed to initialize"); 
            } 
        }

        async function startCamera() { 
            try { 
                videoRef = document.getElementById("videoElement");
                canvasRef = document.getElementById("canvasElement");
                
                if (stream) stream.getTracks().forEach(t => t.stop()); 
                
                stream = await navigator.mediaDevices.getUserMedia({ 
                    video: { 
                        width: { ideal: WIDTH },
                        height: { ideal: HEIGHT },
                        facingMode: "user",
                        frameRate: { ideal: 30 }
                    }, 
                    audio: false 
                }); 
                
                videoRef.srcObject = stream;
                
                if (typeof Camera !== 'undefined' && faceMesh) {
                    camera = new Camera(videoRef, {
                        onFrame: async () => {
                            if (!scanCompleted) {
                                await faceMesh.send({image: videoRef});
                            }
                        },
                        width: WIDTH,
                        height: HEIGHT
                    });
                    camera.start();
                }
            } catch (error) { 
                throw new Error("Camera access denied"); 
            } 
        }

        function setupEventListeners() { 
            document.getElementById("startBtn").addEventListener("click", startScanning); 
            document.getElementById("retryBtn").addEventListener("click", () => window.location.reload());
        }

        function startScanning() { 
            if (!stream || scanCompleted) return; 
            
            isScanning = true; 
            actualDuration = 0;
            displayDuration = 0;
            scanningPaused = false;
            scanCompleted = false;
            
            const videoContainer = document.getElementById("videoContainer");
            const controlsGrid = document.getElementById("controlsGrid");

            controlsGrid.style.display = "none";
            
            videoContainer.classList.add("scanning");
            document.getElementById("scanningIndicator").style.display = "flex"; 
            showStatus("🔬 Scanning in progress... Keep your face in frame", "warning");

            const chunks = []; 
            const options = {
                mimeType: 'video/webm;codecs=vp9',
                videoBitsPerSecond: 5000000
            };
            
            if (!MediaRecorder.isTypeSupported(options.mimeType)) {
                options.mimeType = 'video/webm;codecs=vp8';
            }
            
            mediaRecorderRef = new MediaRecorder(stream, options);

            mediaRecorderRef.ondataavailable = e => { 
                if (e.data.size > 0) chunks.push(e.data); 
            }; 
            
            mediaRecorderRef.onstop = async () => { 
                if (scanningTimerRef) { 
                    clearInterval(scanningTimerRef); 
                    scanningTimerRef = null; 
                } 
                isScanning = false;
                scanningPaused = false;
                faceDetected = false;
                scanCompleted = true;
                
                if (faceDetectionTimeout) {
                    clearTimeout(faceDetectionTimeout);
                    faceDetectionTimeout = null;
                }
                distanceWarningShown = false;
                
                videoContainer.classList.remove("scanning");
                document.getElementById("scanningIndicator").style.display = "none"; 
                hideFaceAlert();
                
                if (camera) {
                    camera.stop();
                    camera = null;
                }
                if (stream) {
                    stream.getTracks().forEach(t => t.stop());
                    stream = null;
                }
                
                if (canvasRef) {
                    const ctx = canvasRef.getContext('2d');
                    ctx.clearRect(0, 0, WIDTH, HEIGHT);
                }
                
                recordedBlob = new Blob(chunks, { type: "video/webm" });
                recordedVideoUrl = URL.createObjectURL(recordedBlob);
                
                showStatus("✅ Scan complete! Analyzing results...", "success");
                
                setTimeout(() => {
                    analyzeVideo();
                }, 1000);
            }; 
            
            mediaRecorderRef.start(); 
            
            scanningTimerRef = setInterval(() => { 
                if (!scanningPaused) {
                    actualDuration++;
                    displayDuration = Math.floor(actualDuration * (DISPLAY_DURATION / ACTUAL_DURATION));
                    document.getElementById("scanningTime").textContent = "SCAN " + formatTime(displayDuration); 
                    if (actualDuration >= ACTUAL_DURATION) stopScanning(); 
                }
            }, 1000); 
        }

        function stopScanning() { 
            if (mediaRecorderRef && mediaRecorderRef.state !== "inactive") {
                if (mediaRecorderRef.state === "paused") {
                    mediaRecorderRef.resume();
                }
                mediaRecorderRef.stop(); 
            }
        }

        async function analyzeVideo() {
            if (!recordedBlob) {
                showStatus("❌ No video recorded!", "error");
                return;
            }

            showStatus("🔄 Analyzing video... This may take a moment", "warning");

            try {
                const fd = new FormData();
                fd.append("file", recordedBlob, "scan.webm");
                
                const res = await axios.post(AI_API_URL, fd, {
                    headers: { "Content-Type": "multipart/form-data" },
                    timeout: 120000,
                    onUploadProgress: (progressEvent) => {
                        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                        
                    }
                });
                
                aiPrediction = res.data;
                
                if (!aiPrediction || aiPrediction.error) {
                    throw new Error(aiPrediction.error || "Analysis failed");
                }
                
                showStatus("✅ Analysis complete! Redirecting...", "success");
                
                setTimeout(() => {
                    window.location.href = '/results?data=' + encodeURIComponent(JSON.stringify(aiPrediction)) + 
                                          '&video=' + encodeURIComponent(recordedVideoUrl);
                }, 1500);
                
            } catch (error) {
                console.error("Analysis error:", error);
                let errorMsg = "Analysis failed";
                if (error.response) {
                    errorMsg = error.response.data?.error || "Server error: " + error.response.status;
                } else if (error.code === 'ECONNABORTED') {
                    errorMsg = "Request timeout - please try again";
                } else {
                    errorMsg = error.message;
                }
                showStatus("❌ " + errorMsg, "error");
                
                setTimeout(() => {
                    const controlsGrid = document.getElementById("controlsGrid");
                    controlsGrid.style.display = "flex";
                    controlsGrid.innerHTML = '<button class="controlBtn" onclick="window.location.reload()">🔄 Scan Again</button>';
                }, 2000);
            }
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
    res.send(html);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

async function getResultsPage(req, res, next) {
  try {
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Analysis Results</title>
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { 
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; 
            background: #f8fafc; 
            min-height: 100vh;
            padding: 1rem;
        }
        .mainContainer {
            max-width: 900px;
            margin: 0 auto;
        }
        .header { 
            background: #ffffff; 
            padding: 1.5rem; 
            border-radius: 16px; 
            margin-bottom: 1.5rem; 
            box-shadow: 0 4px 20px rgba(0,0,0,0.08); 
            text-align: center;
        }
        .header h1 { 
            font-size: clamp(1.5rem, 5vw, 2rem);
            color: #2c3e50; 
            font-weight: 700; 
            margin-bottom: 0.5rem; 
        }
        .backBtn {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            background: #5eaa3c;
            color: white;
            padding: 0.75rem 1.5rem;
            border-radius: 8px;
            text-decoration: none;
            font-weight: 600;
            transition: all 0.3s ease;
            margin-top: 1rem;
        }
        .backBtn:hover {
            background: #4a8530;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(94, 170, 60, 0.3);
        }
        .resultsContainer { 
            background: #ffffff; 
            border-radius: 16px; 
            padding: 1.5rem; 
            box-shadow: 0 4px 20px rgba(0,0,0,0.08); 
            margin-bottom: 1.5rem;
        }
        .sectionHeader { 
            display: flex; 
            align-items: center; 
            gap: 0.5rem; 
            margin-bottom: 1.5rem; 
            color: #2c3e50; 
        }
        .sectionHeader h3 { 
            font-size: 1.5rem;
            font-weight: 700; 
        }
        .videoPreview { 
            margin-bottom: 1.5rem; 
        }
        .videoPreview h4 {
            color: #2c3e50;
            margin-bottom: 1rem;
            font-size: 1.125rem;
        }
        .previewVideo { 
            width: 100%;
            max-width: 384px;
            height: auto;
            border-radius: 12px; 
            object-fit: cover; 
            border: 2px solid #f1f5f9;
            display: block;
            margin: 0 auto;
        }
        .waitingMessage {
            text-align: center;
            padding: 3rem 1rem;
            color: #64748b;
            font-size: 1.125rem;
        }
        .vitals-table-wrapper { 
            overflow-x: auto; 
            background: linear-gradient(135deg); 
            padding: 24px; 
            border-radius: 20px; 
            box-shadow: 0 20px 50px rgba(102, 126, 234, 0.4); 
        }
        .vitals-table { 
            width: 100%; 
            border-collapse: separate; 
            border-spacing: 0; 
            background: white; 
            border-radius: 16px; 
            overflow: hidden; 
            box-shadow: 0 8px 24px rgba(0,0,0,0.12); 
        }
        .vitals-table thead tr { 
            background: linear-gradient(135deg); 
        }
        .vitals-table th { 
            padding: 20px 16px; 
            text-align: left; 
            color: white; 
            font-weight: 700; 
            font-size: 15px; 
            text-transform: uppercase; 
            letter-spacing: 0.5px; 
        }
        .vitals-table th:nth-child(2), .vitals-table th:nth-child(3), .vitals-table th:nth-child(4) { 
            text-align: center; 
        }
        .vitals-table tbody tr { 
            transition: all 0.3s ease; 
            border-bottom: 1px solid #f3f4f6; 
        }
        .vitals-table tbody tr:hover { 
            background: linear-gradient(90deg, #f9fafb 0%, #f3f4f6 100%); 
            transform: scale(1.01); 
        }
        .vitals-table tbody tr:last-child { 
            border-bottom: none; 
        }
        .vitals-table td { 
            padding: 20px 16px; 
            font-weight: 500; 
            color: #374151; 
        }
        .vital-label { 
            display: flex; 
            align-items: center; 
            gap: 12px; 
            font-weight: 600; 
            font-size: 15px; 
        }
        .vital-icon { 
            width: 40px; 
            height: 40px; 
            border-radius: 10px; 
            display: inline-flex; 
            align-items: center; 
            justify-content: center; 
            font-size: 20px; 
        }
        .vital-value { 
            text-align: center; 
            font-size: 32px; 
            font-weight: 800; 
        }
        .vital-progress { 
            width: 100%; 
            height: 6px; 
            background: #e5e7eb; 
            border-radius: 3px; 
            overflow: hidden; 
            margin-top: 8px; 
        }
        .vital-progress-bar { 
            height: 100%; 
            border-radius: 3px; 
            transition: width 1.5s cubic-bezier(0.4, 0, 0.2, 1); 
        }
        .vital-unit { 
            text-align: center; 
            color: #6b7280; 
            font-size: 13px; 
            font-weight: 600; 
            text-transform: uppercase; 
        }
        .vital-status { 
            text-align: center; 
        }
        .status-badge { 
            background: #dbeafe; 
            color: #1e40af; 
            padding: 8px 16px; 
            border-radius: 25px; 
            font-size: 13px; 
            font-weight: 700; 
            display: inline-block; 
            text-transform: uppercase; 
        }
        @keyframes slideIn { 
            from { opacity: 0; transform: translateY(20px); } 
            to { opacity: 1; transform: translateY(0); } 
        }
        .vitals-table tbody tr { 
            animation: slideIn 0.5s ease forwards; 
        }
        .vitals-table tbody tr:nth-child(1) { animation-delay: 0.1s; opacity: 0; }
        .vitals-table tbody tr:nth-child(2) { animation-delay: 0.2s; opacity: 0; }
        .vitals-table tbody tr:nth-child(3) { animation-delay: 0.3s; opacity: 0; }
        .vitals-table tbody tr:nth-child(4) { animation-delay: 0.4s; opacity: 0; }
        .vitals-table tbody tr:nth-child(5) { animation-delay: 0.5s; opacity: 0; }
        .errorMessage {
            text-align: center;
            padding: 2rem;
            color: #ef4444;
        }
        .errorMessage .icon {
            font-size: 3rem;
            margin-bottom: 1rem;
        }
        @media screen and (max-width: 479px) {
            .vitals-table th, .vitals-table td {
                padding: 12px 8px;
                font-size: 13px;
            }
            .vital-value {
                font-size: 24px;
            }
            .vital-icon {
                width: 32px;
                height: 32px;
                font-size: 16px;
            }
        }
    </style>
</head>
<body>
    <div class="mainContainer">
        <div class="header">
            <h1> Analysis Results</h1>
            <a href="/camera" class="backBtn">← Back to Scanner</a>
        </div>

        <div class="resultsContainer">
            <div class="sectionHeader">
                <span style="font-size: 1.5rem;">🩺</span>
                <h3>Your Health Vitals</h3>
            </div>
            <div id="resultsContent">
                <div class="waitingMessage">
                    <p>⏳ Loading results...</p>
                </div>
            </div>
        </div>
    </div>

    <script>
        function getStressColor(stress) {
            if (stress >= 0 && stress <= 1) return '#10b981';
            if (stress > 1 && stress <= 2) return '#fbbf24';
            if (stress > 2 && stress <= 3) return '#3b82f6';
            if (stress > 3 && stress <= 4) return '#f97316';
            if (stress > 4 && stress <= 5) return '#ef4444';
            return '#6b7280';
        }

        function getStressLevel(stress) {
            if (stress >= 0 && stress <= 1) return 'Low';
            if (stress > 1 && stress <= 2) return 'Mild';
            if (stress > 2 && stress <= 3) return 'Moderate';
            if (stress > 3 && stress <= 4) return 'High';
            if (stress > 4 && stress <= 5) return 'Very High';
            return 'Unknown';
        }

        function displayResults(pred, videoUrl) {
            const hr = pred.heart_rate_bpm ? Math.round(pred.heart_rate_bpm) : "--";
            const systolic = pred.blood_pressure?.systolic ? Math.round(pred.blood_pressure.systolic) : "--";
            const diastolic = pred.blood_pressure?.diastolic ? Math.round(pred.blood_pressure.diastolic) : "--";
            const o2 = pred.spo2_percent ? Math.round(pred.spo2_percent) : "--";
            const stress = pred.stress_indicator ? parseFloat((pred.stress_indicator * 100).toFixed(1)) : null;
            const stressValue = stress !== null ? stress.toFixed(2) : "--";
            const stressColor = stress !== null ? getStressColor(stress) : '#6b7280';
            const stressLabel = stress !== null ? getStressLevel(stress) : 'Unknown';
            
            const hrProgress = hr !== '--' ? Math.min((hr / 120) * 100, 100) : 0;
            const sysProgress = systolic !== '--' ? Math.min((systolic / 140) * 100, 100) : 0;
            const diaProgress = diastolic !== '--' ? Math.min((diastolic / 90) * 100, 100) : 0;
            const o2Progress = o2 !== '--' ? Math.min((o2 / 100) * 100, 100) : 0;
            const stressProgress = stress !== null ? (stress / 5) * 100 : 0;
            
            let html = '';
            
            // if (videoUrl) {
            //     html += '<div class="videoPreview">' +
            //         '<h4>📹 Recorded Video:</h4>' +
            //         '<video class="previewVideo" controls src="' + videoUrl + '"></video>' +
            //     '</div>';
            // }
            
            html += '<div class="vitals-table-wrapper">' +
                '<table class="vitals-table">' +
                    '<thead><tr><th>Vital Sign</th><th>Result</th><th>Unit</th><th>Status</th></tr></thead>' +
                    '<tbody>' +
                        '<tr>' +
                            '<td><div class="vital-label"><span class="vital-icon" style="background: linear-gradient(135deg, #ef4444, #dc2626);">❤️</span>Heart Rate</div></td>' +
                            '<td><div class="vital-value" style="color: #ef4444;">' + hr + '<div class="vital-progress"><div class="vital-progress-bar" style="background: linear-gradient(90deg, #ef4444, #dc2626); width: ' + hrProgress + '%;"></div></div></div></td>' +
                            '<td class="vital-unit">BPM</td>' +
                            '<td class="vital-status"><span class="status-badge" style="background: #fee2e2; color: #991b1b;">Normal</span></td>' +
                        '</tr>' +
                        '<tr>' +
                            '<td><div class="vital-label"><span class="vital-icon" style="background: linear-gradient(135deg, #ec4899, #db2777);">💓</span>Systolic BP</div></td>' +
                            '<td><div class="vital-value" style="color: #ec4899;">' + systolic + '<div class="vital-progress"><div class="vital-progress-bar" style="background: linear-gradient(90deg, #ec4899, #db2777); width: ' + sysProgress + '%;"></div></div></div></td>' +
                            '<td class="vital-unit">mmHg</td>' +
                            '<td class="vital-status"><span class="status-badge" style="background: #fce7f3; color: #be185d;">Normal</span></td>' +
                        '</tr>' +
                        '<tr>' +
                            '<td><div class="vital-label"><span class="vital-icon" style="background: linear-gradient(135deg, #8b5cf6, #7c3aed);">🩸</span>Diastolic BP</div></td>' +
                            '<td><div class="vital-value" style="color: #8b5cf6;">' + diastolic + '<div class="vital-progress"><div class="vital-progress-bar" style="background: linear-gradient(90deg, #8b5cf6, #7c3aed); width: ' + diaProgress + '%;"></div></div></div></td>' +
                            '<td class="vital-unit">mmHg</td>' +
                            '<td class="vital-status"><span class="status-badge" style="background: #ede9fe; color: #6b21a8;">Normal</span></td>' +
                        '</tr>' +
                        '<tr>' +
                            '<td><div class="vital-label"><span class="vital-icon" style="background: linear-gradient(135deg, #10b981, #059669);">🫁</span>Oxygen Saturation</div></td>' +
                            '<td><div class="vital-value" style="color: #10b981;">' + o2 + '<div class="vital-progress"><div class="vital-progress-bar" style="background: linear-gradient(90deg, #10b981, #059669); width: ' + o2Progress + '%;"></div></div></div></td>' +
                            '<td class="vital-unit">% SpO2</td>' +
                            '<td class="vital-status"><span class="status-badge" style="background: #d1fae5; color: #065f46;">Excellent</span></td>' +
                        '</tr>' +
                        '<tr>' +
                            '<td><div class="vital-label"><span class="vital-icon" style="background: linear-gradient(135deg, ' + stressColor + ', ' + stressColor + ');">🧠</span>Stress Level</div></td>' +
                            '<td><div class="vital-value" style="color: ' + stressColor + ';">' + stressValue + '<div class="vital-progress"><div class="vital-progress-bar" style="background: linear-gradient(90deg, ' + stressColor + ', ' + stressColor + 'dd); width: ' + stressProgress + '%;"></div></div></div></td>' +
                            '<td class="vital-unit">0-5 Scale</td>' +
                            '<td class="vital-status"><span class="status-badge" style="background: ' + stressColor + '20; color: ' + stressColor + ';">' + stressLabel + '</span></td>' +
                        '</tr>' +
                    '</tbody>' +
                '</table>' +
            '</div>';
            
            document.getElementById("resultsContent").innerHTML = html;
        }

        function showError(errorMsg) {
            document.getElementById("resultsContent").innerHTML = 
                '<div class="errorMessage">' +
                    '<div class="icon">❌</div>' +
                    '<h3 style="margin-bottom: 0.5rem; color: #ef4444;">Analysis Failed</h3>' +
                    '<p>' + errorMsg + '</p>' +
                '</div>';
        }

        // Get data from URL parameters
        function loadResults() {
            try {
                const urlParams = new URLSearchParams(window.location.search);
                const dataParam = urlParams.get('data');
                const videoParam = urlParams.get('video');
                
                if (!dataParam) {
                    showError("No analysis data found. Please scan again.");
                    return;
                }
                
                const predictionData = JSON.parse(decodeURIComponent(dataParam));
                const videoUrl = videoParam ? decodeURIComponent(videoParam) : null;
                
                displayResults(predictionData, videoUrl);
            } catch (error) {
                console.error("Error loading results:", error);
                showError("Failed to load results. Please try again.");
            }
        }

        // Load results on page load
        document.addEventListener("DOMContentLoaded", loadResults);
    </script>
</body>
</html>`;  
 res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(html);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}
// Routes
app.get('/', getpage);
app.get('/getCameraPage', getCameraPage);
app.get('/results',getResultsPage)
app.get('/getResultsPage', (req, res) => {
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

