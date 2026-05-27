'use client';

import { useEffect, useRef, useState } from 'react';
import * as faceapi from 'face-api.js';
import { Camera, MapPin, AlertCircle, CheckCircle2 } from 'lucide-react'; // Icons for better UI

export default function AttendancePage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // App States
  const [mode, setMode] = useState<'LOADING' | 'REGISTER' | 'CHECK_IN'>('LOADING');
  const [status, setStatus] = useState("Initializing AI Models...");
  const [modelsLoaded, setModelsLoaded] = useState(false);
  
  // Face Matching Logic
  const [matcher, setMatcher] = useState<faceapi.FaceMatcher | null>(null);
  const lastCheckInRef = useRef(0);

  // 1. Initialize: Load Models & Check User Status
  useEffect(() => {
    const loadResources = async () => {
      try {
        const MODEL_URL = '/models'; // Ensure this folder exists in /public
        
        // A. Load AI Models
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
          faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL)
        ]);
        setModelsLoaded(true);

        // B. Check if user already has a face registered
        const res = await fetch('/api/user/face-descriptor');
        const data = await res.json();

        if (data.hasFace) {
           // User is ready -> Switch to Check-In Mode
           const descriptor = new Float32Array(data.descriptor);
           
           // Create a matcher for THIS specific user
           const labeled = new faceapi.LabeledFaceDescriptors(data.name || 'You', [descriptor]);
           setMatcher(new faceapi.FaceMatcher(labeled, 0.6));
           
           setMode('CHECK_IN');
           setStatus("Ready. Please SMILE to Check In! 😁");
        } else {
           // User needs setup -> Switch to Register Mode
           setMode('REGISTER');
           setStatus("Face ID not found. Please look at the camera to register.");
        }
        
        startVideo();
      } catch (err) {
        console.error(err);
        setStatus("Error: Failed to load AI models. Refresh page.");
      }
    };
    loadResources();
  }, []);

  // 2. Camera Setup
  const startVideo = () => {
    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } })
      .then(stream => {
        if (videoRef.current) videoRef.current.srcObject = stream;
      })
      .catch(() => setStatus("Camera access denied. Please allow permissions."));
  };

  // 3. LOGIC: Register Face (First Time)
  const handleRegistration = async (detection: faceapi.WithFaceDescriptor<any>) => {
    // Only register if face is clear (score > 0.8)
    if (detection.detection.score < 0.8) return;

    setStatus("Capturing face data...");
    const vector = Array.from(detection.descriptor);
    
    try {
      const res = await fetch('/api/user/face-descriptor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ descriptor: vector })
      });
      
      if (res.ok) {
        alert("Face Registered Successfully! Reloading...");
        window.location.reload();
      }
    } catch (e) {
      setStatus("Registration failed. Please try again.");
    }
  };

  // 4. LOGIC: Check In (Daily)
  const handleCheckIn = async (match: faceapi.FaceMatch, isSmiling: boolean) => {
    // 10-second cooldown to prevent spamming
    if (Date.now() - lastCheckInRef.current < 10000) return;
    
    if (match.label === 'unknown') {
      setStatus("Face not recognized. Are you the account owner?");
      return;
    }
    
    if (!isSmiling) return; // Wait for smile

    // If recognized + smiling:
    lastCheckInRef.current = Date.now();
    setStatus("Verifying Location...");

    // Get GPS
    navigator.geolocation.getCurrentPosition(async (pos) => {
      try {
        const res = await fetch('/api/attendance/check-in', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            lat: pos.coords.latitude, 
            lng: pos.coords.longitude 
          })
        });
        
        const json = await res.json();
        if (json.success) {
           setStatus(`✅ SUCCESS: Attendance Logged!`);
        } else {
           setStatus(`❌ FAILED: ${json.error}`);
        }
      } catch (e) {
        setStatus("Network Error.");
      }
    }, (err) => {
       setStatus("❌ GPS Permission Required.");
    });
  };

  // 5. The AI Loop
  const handleVideoPlay = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || !modelsLoaded) return;

    const displaySize = { width: video.videoWidth, height: video.videoHeight };
    faceapi.matchDimensions(canvas, displaySize);

    const interval = setInterval(async () => {
      if (video.paused || video.ended) return;

      const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptors()
        .withFaceExpressions();

      const resized = faceapi.resizeResults(detections, displaySize);
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);

      resized.forEach(d => {
        const box = d.detection.box;
        
        if (mode === 'REGISTER') {
             new faceapi.draw.DrawBox(box, { label: "Registering..." }).draw(canvas);
             handleRegistration(d); // Attempt register
        } 
        else if (mode === 'CHECK_IN' && matcher) {
             const match = matcher.findBestMatch(d.descriptor);
             const isSmiling = d.expressions.happy > 0.7;
             
             const label = `${isSmiling ? "😊" : "😐"} ${match.label}`;
             const boxColor = (match.label !== 'unknown' && isSmiling) ? 'green' : 'blue';

             new faceapi.draw.DrawBox(box, { label, boxColor }).draw(canvas);
             handleCheckIn(match, isSmiling); // Attempt check-in
        }
      });
    }, 500);
    return () => clearInterval(interval);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Camera className="text-[#1193b5]" />
          Attendance Scanner
        </h1>
        <p className="text-gray-500">
          {mode === 'REGISTER' 
            ? "First time setup: Register your Face ID." 
            : "Daily Check-in: Verify your identity and location."}
        </p>
      </div>

      {/* Camera Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden max-w-2xl mx-auto">
        <div className="relative aspect-[4/3] bg-black">
          <video 
            ref={videoRef} 
            autoPlay 
            muted 
            playsInline 
            onPlay={handleVideoPlay}
            className="absolute inset-0 w-full h-full object-cover"
          />
          <canvas 
            ref={canvasRef} 
            className="absolute inset-0 w-full h-full pointer-events-none" 
          />
          
          {/* Overlay Status */}
          <div className="absolute bottom-4 left-4 right-4">
            <div className={`
              px-4 py-3 rounded-xl font-medium text-white text-center shadow-lg backdrop-blur-md transition-colors
              ${status.includes('✅') ? 'bg-green-500/90' : 
                status.includes('❌') ? 'bg-red-500/90' : 
                'bg-slate-900/80'}
            `}>
              <div className="flex items-center justify-center gap-2">
                {status.includes('✅') ? <CheckCircle2 size={18}/> : 
                 status.includes('❌') ? <AlertCircle size={18}/> : 
                 <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"/>}
                {status}
              </div>
            </div>
          </div>
        </div>
        
        {/* Footer Instructions */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <MapPin size={16} />
            <span>GPS Location Required</span>
          </div>
          <div>
            {mode === 'CHECK_IN' && "Tip: You must SMILE to verify liveness."}
            {mode === 'REGISTER' && "Tip: Hold still in good lighting."}
          </div>
        </div>
      </div>
    </div>
  );
}