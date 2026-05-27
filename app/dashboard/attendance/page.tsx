'use client';

import { validateFaceMatch } from '@/utils/faceValidation';
import { useEffect, useRef, useState } from 'react';
import * as faceapi from 'face-api.js';
import { Camera, AlertCircle, CheckCircle2, Power, FlipHorizontal, Loader2, Coffee, LogOut, Play, Info } from 'lucide-react';

type AttendanceStatus = 'ABSENT' | 'PRESENT' | 'ON_BREAK' | 'CHECKED_OUT';

export default function AttendancePage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  const isProcessingRef = useRef(false);
  const isSubmittingRef = useRef(false);

  // --- NEW: Bulletproof Refs for AI & Memory Leaks ---
  const matcherRef = useRef<faceapi.FaceMatcher | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // UX Settings
  const [isMirrored, setIsMirrored] = useState(true);
  const [isCameraActive, setIsCameraActive] = useState(false);

  // App States
  const [mode, setMode] = useState<'LOADING' | 'REGISTER' | 'CHECK_IN' | 'DASHBOARD' | 'CHECK_OUT'>('LOADING');
  const [statusMsg, setStatusMsg] = useState("Initializing System...");
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [isFaceDetected, setIsFaceDetected] = useState(false);
  const [isSnapshotting, setIsSnapshotting] = useState(false);
  
  // Data States
  const [attendanceStatus, setAttendanceStatus] = useState<AttendanceStatus>('ABSENT');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [tempDescriptor, setTempDescriptor] = useState<Float32Array | null>(null);
  const lastCheckInRef = useRef(0);

  // Break Modal State (Kept exactly as you requested!)
  const [showBreakModal, setShowBreakModal] = useState(false);
  const [breakReason, setBreakReason] = useState("");
  const [breakFile, setBreakFile] = useState<File | null>(null);
  const [isBreakLoading, setIsBreakLoading] = useState(false);

  // 1. Initialize System
  useEffect(() => {
    const init = async () => {
      try {
        navigator.geolocation.getCurrentPosition(() => {}, () => setStatusMsg("⚠️ Allow Location Access"));

        // Load Models
        const MODEL_URL = '/models';
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
          faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL)
        ]);
        setModelsLoaded(true);

        // Fetch Data
        const [faceRes, statusRes] = await Promise.all([
            fetch('/api/user/face-descriptor'),
            fetch('/api/attendance/today')
        ]);

        const faceData = await faceRes.json();
        const statusData = await statusRes.json();

        // --- ROBUST DESCRIPTOR PARSING ---
        if (faceData.hasFace && faceData.descriptor) {
            try {
                // Safely handle strings from Prisma @db.Text OR direct arrays
                const parsedData = typeof faceData.descriptor === 'string' 
                    ? JSON.parse(faceData.descriptor) 
                    : faceData.descriptor;
                
                const descriptor = new Float32Array(parsedData);
                const labeled = new faceapi.LabeledFaceDescriptors(faceData.name || 'You', [descriptor]);
                
                // Set threshold to 0.65 (slightly more forgiving for webcams/lighting)
                matcherRef.current = new faceapi.FaceMatcher(labeled, 0.65); 
            } catch (e) {
                console.error("Gagal membaca Face ID dari database", e);
            }
        }

        // --- LOGIC ROUTING ---
        if (statusData.status && statusData.status !== 'ABSENT') {
            setAttendanceStatus(statusData.status);
            setMode('DASHBOARD'); 
            setStatusMsg("Welcome back!");
            setIsCameraActive(false); 
        } else {
            if (faceData.hasFace) {
                setMode('CHECK_IN');
                setStatusMsg("Ready. Smile to Check In!");
                setIsCameraActive(true); 
            } else {
                setMode('REGISTER');
                setStatusMsg("Registration Mode.");
                setIsCameraActive(true); 
            }
        }

      } catch (err) {
        console.error("Init Error:", err);
        setStatusMsg("System Error: Refresh page.");
      }
    };
    init();
    
    // Cleanup interval on unmount
    return () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  // 2. Camera Manager
  useEffect(() => {
    const shouldRunCamera = 
        isCameraActive && 
        !capturedImage && 
        modelsLoaded && 
        (mode === 'CHECK_IN' || mode === 'REGISTER' || mode === 'CHECK_OUT');

    if (shouldRunCamera) {
      startVideo();
    } else {
      stopVideo();
    }
    return () => stopVideo();
  }, [isCameraActive, capturedImage, modelsLoaded, mode]);

  const startVideo = async () => {
    try {
      stopVideo(); 
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      
      streamRef.current = stream; 
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      
      if (mode === 'CHECK_IN') setStatusMsg("Ready. Smile to Check In!");
      else if (mode === 'REGISTER') setStatusMsg("Registration Mode.");

    } catch (e) {
      setStatusMsg("Camera Error: Click Start to retry.");
      setIsCameraActive(false);
    }
  };

  const stopVideo = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsFaceDetected(false);
  };

  // 3. ACTIONS
  const takeSnapshot = async () => {
      if (!videoRef.current || isSnapshotting) return;
      if (videoRef.current.paused || videoRef.current.ended) return;

      setIsSnapshotting(true);
      setStatusMsg("Processing image...");

      try {
        const detection = await faceapi.detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceDescriptor();

        if (detection) {
            setTempDescriptor(detection.descriptor);
            const canvas = document.createElement('canvas');
            canvas.width = videoRef.current.videoWidth;
            canvas.height = videoRef.current.videoHeight;
            const ctx = canvas.getContext('2d');
            
            if (ctx) {
                if (isMirrored) { ctx.translate(canvas.width, 0); ctx.scale(-1, 1); }
                ctx.drawImage(videoRef.current, 0, 0);
            }
            
            setCapturedImage(canvas.toDataURL('image/jpeg'));
            setStatusMsg("Face captured. Save to finish.");
        } else {
            setStatusMsg("No face detected. Try again.");
        }
      } catch (err) {
        setStatusMsg("Error taking photo. Try again.");
      } finally {
        setIsSnapshotting(false);
      }
  };

  const saveRegistration = async () => {
      if (!tempDescriptor) return;
      await fetch('/api/user/face-descriptor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ descriptor: Array.from(tempDescriptor) })
      });
      window.location.reload();
  };

  const resetSnapshot = () => {
      setCapturedImage(null);
      setTempDescriptor(null);
      setIsCameraActive(true); 
  };
   
  const handleCheckIn = async (match: faceapi.FaceMatch, isSmiling: boolean) => {
    if (Date.now() - lastCheckInRef.current < 5000 || isSubmittingRef.current) return;
    if (match.label === 'unknown' || !isSmiling) return; 

    isSubmittingRef.current = true;
    setStatusMsg(mode === 'CHECK_OUT' ? "Memproses Absen Pulang..." : "Verifikasi Lokasi...");
    
    const apiEndpoint = mode === 'CHECK_OUT' ? '/api/attendance/checkout' : '/api/attendance/check-in';

    navigator.geolocation.getCurrentPosition(async (pos) => {
      try {
        const res = await fetch(apiEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        });
        const json = await res.json();
        
        if (json.success) {
           if (mode === 'CHECK_OUT') {
               alert("Berhasil absen pulang. Hati-hati di jalan! 👋");
               setAttendanceStatus('CHECKED_OUT');
           } else {
               alert("Berhasil absen masuk. Selamat bekerja! 🚀");
               setAttendanceStatus('PRESENT');
           }

           setStatusMsg(mode === 'CHECK_OUT' ? "👋 Sampai Jumpa!" : "✅ Berhasil Masuk!");
           setMode('DASHBOARD'); 
           setIsCameraActive(false); 
           lastCheckInRef.current = Date.now();
        } else {
           setStatusMsg(`❌ ${json.error}`);
        }
      } catch(e) { setStatusMsg("Network Error"); }
      finally { isSubmittingRef.current = false; }
    }, () => { setStatusMsg("GPS Error"); isSubmittingRef.current = false; });
  };

  // 4. BREAK & CHECKOUT HANDLER
  const handleStatusChange = async (action: "START" | "END" | "CHECK_OUT") => {
    setIsBreakLoading(true);
    try {
        if (action === "CHECK_OUT") {
            if(!confirm("Apakah Anda yakin ingin absen pulang?")) {
                setIsBreakLoading(false);
                return;
            }

            const res = await fetch("/api/attendance/checkout", { method: "POST" });
            const data = await res.json();

            if (res.ok) {
                setAttendanceStatus("CHECKED_OUT"); 
                alert("Berhasil absen pulang. Hati-hati di jalan!");
            } else {
                alert(data.error || "Gagal absen pulang.");
            }
            setIsBreakLoading(false);
            return;
        }

        const formData = new FormData();
        formData.append("action", action);
        
        if (action === "START") {
            formData.append("reason", breakReason);
            if (breakFile) formData.append("file", breakFile);
        }

        const res = await fetch("/api/attendance/break", { method: "POST", body: formData });
        const data = await res.json();

        if (res.ok) {
            setAttendanceStatus(data.status);
            setShowBreakModal(false);
            setBreakReason("");
            setBreakFile(null); 
        } else {
            alert(data.error || "Gagal memproses.");
        }
    } catch (e) {
        alert("Terjadi kesalahan sistem.");
    } finally {
        setIsBreakLoading(false);
    }
  };

  // 5. AI Loop (BULLETPROOF VERSION)
  const handleVideoPlay = () => {
    const video = videoRef.current;
    if (!video || !modelsLoaded) return;

    if (intervalRef.current) clearInterval(intervalRef.current);

    intervalRef.current = setInterval(async () => {
        if (video.paused || video.ended || isProcessingRef.current || (mode !== 'CHECK_IN' && mode !== 'CHECK_OUT')) return;
        isProcessingRef.current = true;

        try {
            // Ambil data mentah dari kamera
            const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
                .withFaceLandmarks()
                .withFaceDescriptors()
                .withFaceExpressions();
            
            // Masukkan data ke fungsi UTIL kita yang super rapi
            const validation = validateFaceMatch(detections[0], matcherRef.current);

            // Tentukan reaksi UI berdasarkan hasil fungsi murni tadi
            if (validation.isMatched) {
                 setIsFaceDetected(true);
                 handleCheckIn(validation.matchDetails!.label, true); 
            } else {
                 setIsFaceDetected(false);
                 // Opsional: Kamu bisa menampilkan validation.error ke statusMsg di sini
                 // setStatusMsg(validation.error || "Mencari wajah...");
            }

        } catch (err) { 
            console.log(err); 
        } finally { 
            isProcessingRef.current = false; 
        }
    }, 500);
};

  const handleReset = async () => {
    if (!confirm("Reset Face ID?")) return;
    await fetch('/api/user/face-descriptor', { method: 'DELETE' });
    window.location.reload();
  };

  return (
    <div className="p-4 md:p-6 w-full max-w-6xl mx-auto">
      
      {/* HEADER: Show only during active scanning modes */}
      {(mode === 'REGISTER' || mode === 'CHECK_IN' || mode === 'CHECK_OUT') && (
        <div className="mb-4 flex flex-wrap justify-between items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <div>
                <h1 className="font-bold text-gray-800 flex items-center gap-2">
                    <Camera className="text-[#1193b5]" /> 
                    {mode === 'CHECK_OUT' ? 'Konfirmasi Pulang' : 
                    mode === 'REGISTER' ? 'Registrasi Wajah' : 
                    'Scan Presensi'}
                </h1>
            </div>

            <div className="flex gap-2">
                <button 
                    onClick={() => setIsCameraActive(!isCameraActive)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-bold transition-colors border ${
                        isCameraActive 
                        ? 'bg-red-50 text-red-600 border-red-100 hover:bg-red-100' 
                        : 'bg-green-50 text-green-600 border-green-100 hover:bg-green-100'
                    }`}
                >
                    <Power size={18} /> {isCameraActive ? "Stop" : "Start"}
                </button>
                <button 
                    onClick={() => setIsMirrored(!isMirrored)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-bold transition-colors border ${
                  isMirrored 
                  ? 'bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100 shadow-sm'
                  : 'bg-white text-gray-400 border-gray-200 hover:bg-gray-50'
                }`}
                >
                    <FlipHorizontal size={18} />
                </button>
            </div>
        </div>
      )}

      {/* LOADING VIEW */}
      {mode === 'LOADING' && (
          <div className="flex flex-col items-center justify-center min-h-[400px] animate-pulse">
              <Loader2 size={48} className="text-[#1193b5] animate-spin mb-4" />
              <p className="text-gray-400 font-medium">Loading ...</p>
          </div>
      )}
    
      {/* --- VIEW 1: CAMERA SCANNER (Register / Check In / Check Out) --- */}
      {(mode === 'REGISTER' || mode === 'CHECK_IN' || mode === 'CHECK_OUT') && (
          <>
            {/* --- INFO BANNER --- */}
            {(mode === 'CHECK_IN' || mode === 'CHECK_OUT') && (
                <div className="mb-4 flex items-start gap-2 bg-blue-50 text-blue-700 p-3.5 rounded-xl text-sm border border-blue-100 shadow-sm">
                    <Info className="shrink-0 mt-0.5" size={18} />
                    <p>
                        <strong>Tips:</strong> Pastikan pencahayaan cukup dan wajah terlihat jelas. Bingkai <span className="text-green-600 font-bold">hijau</span> pada kamera menandakan wajah Anda berhasil terdeteksi.
                    </p>
                </div>
            )}

            {/* CAMERA VIEW */}
            <div className={`relative w-full bg-black rounded-2xl overflow-hidden shadow-lg transition-all md:aspect-[16/9] aspect-[3/4] 
                ${isFaceDetected && isCameraActive ? 'ring-4 ring-green-500' : ''}
            `}>
                <div className="absolute inset-0 flex items-center justify-center bg-zinc-900">
                {!isCameraActive ? (
                    <div className="text-center text-gray-500">
                        <Power size={48} className="mx-auto mb-2 opacity-50" />
                        <p>Camera is Off</p>
                        <button onClick={() => setIsCameraActive(true)} className="mt-4 text-[#1193b5] hover:text-blue-400 font-bold underline">Turn On</button>
                    </div>
                ) : capturedImage ? (
                    <img src={capturedImage} alt="Captured" className="w-full h-full object-cover" />
                ) : (
                    <video 
                        ref={videoRef} 
                        autoPlay muted playsInline 
                        onPlay={handleVideoPlay}
                        className={`w-full h-full object-cover ${isMirrored ? 'scale-x-[-1]' : ''}`}
                    />
                )}

                {/* Status Pill */}
                {(statusMsg && isCameraActive) || statusMsg.includes("Captured") ? (
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 w-auto">
                        <div className={`px-6 py-3 rounded-full backdrop-blur-md font-medium flex items-center gap-2 shadow-lg transition-all bg-black/60 text-white`}>
                            {statusMsg.includes("Verifying") && <Loader2 className="animate-spin" size={18} />}
                            {statusMsg}
                        </div>
                    </div>
                ) : null}
                </div>
            </div>

            {/* Register Buttons */}
            <div className="mt-6 flex flex-col items-center gap-4">
                {mode === 'REGISTER' && !capturedImage && isCameraActive && (
                    <button onClick={takeSnapshot} disabled={isSnapshotting} className="px-12 py-4 rounded-full font-bold text-lg bg-[#1193b5] text-white hover:scale-105 shadow-xl transition flex items-center gap-2">
                        {isSnapshotting ? "Processing..." : <><Camera size={24} /> Ambil Foto</>}
                    </button>
                )}
                {mode === 'REGISTER' && capturedImage && (
                    <div className="flex gap-4">
                        <button onClick={resetSnapshot} className="px-6 py-3 bg-gray-200 rounded-full font-bold">Ulangi</button>
                        <button onClick={saveRegistration} className="px-6 py-3 bg-green-600 text-white rounded-full font-bold">Simpan</button>
                    </div>
                )}
                <button onClick={handleReset} className="text-xs text-red-300 hover:text-red-500 underline transition">[DEV] Reset Face ID</button>
            </div>
          </>
      )}

      {/* --- VIEW 2: DASHBOARD (Already Checked In) --- */}
      {mode === 'DASHBOARD' && (
          <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              
              <div className={`p-8 rounded-2xl border-2 text-center shadow-sm ${
                  attendanceStatus === 'ON_BREAK' 
                  ? 'bg-yellow-50 border-yellow-200 text-yellow-800' 
                  : attendanceStatus === 'CHECKED_OUT'
                  ? 'bg-blue-50 border-blue-200 text-blue-800'
                  : 'bg-green-50 border-green-200 text-green-800'
              }`}>
                  <div className="inline-block p-4 rounded-full bg-white mb-4 shadow-sm">
                      {attendanceStatus === 'ON_BREAK' ? <Coffee size={48} className="text-yellow-500" /> : 
                       attendanceStatus === 'CHECKED_OUT' ? <CheckCircle2 size={48} className="text-blue-500" /> :
                       <CheckCircle2 size={48} className="text-green-500" />}
                  </div>
                  <h2 className="text-2xl font-bold mb-1">
                      {attendanceStatus === 'ON_BREAK' ? 'Sedang Istirahat' : 
                       attendanceStatus === 'CHECKED_OUT' ? 'Selesai Bekerja' :
                       'Sudah Absen Masuk'}
                  </h2>
                  <p className="opacity-80">
                      {attendanceStatus === 'ON_BREAK' 
                        ? 'Jangan lupa klik tombol di bawah saat kembali.' 
                        : attendanceStatus === 'CHECKED_OUT'
                        ? 'Terima kasih atas kerja kerasmu hari ini!'
                        : 'Selamat bekerja! Gunakan tombol di bawah jika perlu keluar.'}
                  </p>
              </div>

              {attendanceStatus !== 'CHECKED_OUT' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {['PRESENT', 'LATE', 'LATE_EXCUSED'].includes(attendanceStatus) ? (
                        <>
                            <button 
                                onClick={() => setShowBreakModal(true)}
                                className="bg-yellow-500 hover:bg-yellow-600 text-white p-6 rounded-2xl flex flex-col items-center justify-center gap-2 shadow-lg transition transform hover:-translate-y-1"
                            >
                                <Coffee size={32} />
                                <span className="font-bold text-lg">Izin Keluar / Istirahat</span>
                                <span className="text-xs opacity-90">Kuliah / Makan / Keperluan Lain</span>
                            </button>

                            <button 
                                onClick={() => {
                                    if(confirm("Siap untuk pulang? Scan wajah untuk konfirmasi.")) {
                                        setMode('CHECK_OUT');      
                                        setIsCameraActive(true);   
                                        setStatusMsg("Senyum untuk Absen Pulang!");
                                    }
                                }}
                                className="bg-red-500 hover:bg-red-600 text-white p-6 rounded-2xl flex flex-col items-center justify-center gap-2 shadow-lg transition transform hover:-translate-y-1"
                            >
                                <LogOut size={32} />
                                <span className="font-bold text-lg">Absen Pulang</span>
                                <span className="text-xs opacity-90">Scan Wajah & Selesai</span>
                            </button>
                        </>
                    ) : (
                        <button 
                            onClick={() => handleStatusChange("END")}
                            disabled={isBreakLoading}
                            className="md:col-span-2 bg-green-600 hover:bg-green-700 text-white p-6 rounded-2xl flex flex-col items-center justify-center gap-2 shadow-lg transition"
                        >
                            {isBreakLoading ? <Loader2 className="animate-spin" /> : <Play size={32} fill="currentColor"/>}
                            <span className="font-bold text-lg">Kembali Bekerja</span>
                            <span className="text-xs opacity-90">Lanjut aktivitas kantor</span>
                        </button>
                    )}
                </div>
              )}

              {attendanceStatus === 'CHECKED_OUT' && (
                <div className="p-6 bg-blue-50 border border-blue-200 rounded-2xl text-center mt-4 animate-in zoom-in-95">
                    <h3 className="font-bold text-blue-800 text-lg">Sampai Jumpa Besok! 👋</h3>
                    <p className="text-blue-600 text-sm mt-1">Hati-hati di jalan.</p>
                </div>
              )}

              <div className="text-center mt-4 border-t border-gray-100 pt-4">
                 <button onClick={handleReset} className="text-xs text-red-300 hover:text-red-500 underline transition">[DEV] Reset Face ID</button>
              </div>
          </div>
      )}

      {/* MODAL: Break Reason */}
        {showBreakModal && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl animate-in zoom-in-95">
                <h3 className="font-bold text-lg mb-4 text-gray-800">Form Izin Keluar</h3>
                
                <div className="mb-4">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Alasan</label>
                    <textarea
                        autoFocus
                        rows={3}
                        className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-yellow-400 outline-none resize-none text-sm"
                        placeholder="Misal: Kuliah, Makan, dll..."
                        value={breakReason}
                        onChange={(e) => setBreakReason(e.target.value)}
                    />
                </div>

                <div className="mb-6">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Bukti (Opsional)</label>
                    <input 
                        type="file" 
                        accept="image/*,.pdf"
                        onChange={(e) => setBreakFile(e.target.files ? e.target.files[0] : null)}
                        className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-yellow-50 file:text-yellow-700 hover:file:bg-yellow-100"
                    />
                    <p className="text-[10px] text-gray-400 mt-1">Upload jadwal kuliah atau foto kegiatan jika ada.</p>
                </div>

                <div className="flex gap-3">
                    <button 
                        onClick={() => {
                            setShowBreakModal(false);
                            setBreakFile(null);
                        }}
                        className="flex-1 py-3 text-gray-500 font-bold hover:bg-gray-100 rounded-xl transition"
                    >
                        Batal
                    </button>
                    <button 
                        onClick={() => handleStatusChange("START")}
                        disabled={!breakReason || isBreakLoading}
                        className="flex-1 py-3 bg-yellow-500 text-white font-bold rounded-xl hover:bg-yellow-600 disabled:opacity-50 transition"
                    >
                        {isBreakLoading ? "Upload..." : "Mulai Izin"}
                    </button>
                </div>
            </div>
            </div>
        )}

    </div>
  );
}