import { useState, useRef, useEffect, useImperativeHandle, forwardRef } from 'react';
import { Camera, CameraOff, RefreshCw, AlertCircle, CheckCircle2, AlertTriangle, Hand, Sparkles, Scan, Focus } from 'lucide-react';
import { Button } from '../ui/Button';

// Standard MediaPipe 21-point hand landmark skeleton connections
const HAND_CONNECTIONS = [
  [0, 1], [1, 2], [2, 3], [3, 4],         // Thumb: wrist -> CMC -> MCP -> IP -> Tip
  [0, 5], [5, 6], [6, 7], [7, 8],         // Index: wrist -> MCP -> PIP -> DIP -> Tip
  [5, 9], [9, 10], [10, 11], [11, 12],    // Middle: MCP -> PIP -> DIP -> Tip
  [9, 13], [13, 14], [14, 15], [15, 16],  // Ring: MCP -> PIP -> DIP -> Tip
  [13, 17], [17, 18], [18, 19], [19, 20], // Pinky: MCP -> PIP -> DIP -> Tip
  [0, 17],                                 // Palm base connection
];

export const CameraPanel = forwardRef(function CameraPanel(
  { onFrame, autoStart = false, statusChips = [], showGuide = true, onReadyChange },
  ref
) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null); // offscreen capture canvas
  const overlayCanvasRef = useRef(null); // visible skeleton overlay
  const streamRef = useRef(null);

  const [isActive, setIsActive] = useState(false);
  const [error, setError] = useState(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const [hasLandmarks, setHasLandmarks] = useState(false);
  const [handState, setHandState] = useState('idle'); // 'idle' | 'detected' | 'analyzing'
  const [detectedConfidence, setDetectedConfidence] = useState(null);

  const getDetailedErrorMessage = (err) => {
    if (!err) return 'Could not access camera. Please allow camera permissions.';
    const name = err.name || '';
    if (name === 'NotAllowedError' || name === 'PermissionDeniedError') {
      return 'Camera permission denied. Please allow camera access in your browser address bar and reload.';
    }
    if (name === 'NotFoundError' || name === 'DevicesNotFoundError') {
      return 'No camera device detected. Please ensure your webcam is connected.';
    }
    if (name === 'NotReadableError' || name === 'TrackStartError') {
      return 'Camera is currently locked by another application. Please close other software using the camera.';
    }
    if (name === 'OverconstrainedError') {
      return 'Requested camera resolution is not supported by your video device.';
    }
    if (!window.isSecureContext) {
      return 'Camera access requires a Secure Context (HTTPS or http://localhost).';
    }
    return err.message || 'Failed to initialize webcam feed.';
  };

  const startCamera = async () => {
    setIsInitializing(true);
    setError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Webcam API (navigator.mediaDevices.getUserMedia) is not supported in this browser.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
        audio: false,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(e => console.warn('Video play caught:', e));
      }

      setIsActive(true);
      setError(null);
      setHandState('idle');
      if (onReadyChange) onReadyChange(true);
    } catch (err) {
      console.error('Camera initialization failed:', err);
      setError(getDetailedErrorMessage(err));
      setIsActive(false);
      if (onReadyChange) onReadyChange(false);
    } finally {
      setIsInitializing(false);
    }
  };

  const clearOverlay = () => {
    const canvas = overlayCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasLandmarks(false);
    setHandState('idle');
    setDetectedConfidence(null);
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    clearOverlay();
    setIsActive(false);
    if (onReadyChange) onReadyChange(false);
  };

  // Captures current video frame as base64 JPEG data URL
  const captureFrameBase64 = () => {
    if (!videoRef.current || !isActive) return null;
    const video = videoRef.current;
    if (video.videoWidth === 0 || video.videoHeight === 0) return null;

    if (!canvasRef.current) {
      canvasRef.current = document.createElement('canvas');
    }
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', 0.85);
  };

  // Captures a burst of multiple frames for robust temporal smoothing prediction
  const captureBurst = (count = 3, intervalMs = 150) => new Promise((resolve) => {
    const frames = [];
    const capture = () => {
      const frame = captureFrameBase64();
      if (frame) frames.push(frame);
      if (frames.length >= count) {
        resolve(frames);
      } else {
        setTimeout(capture, intervalMs);
      }
    };
    capture();
  });

  // Draws the 21 MediaPipe hand landmarks, connection skeleton, and bounding box
  const drawLandmarks = (points, confidence = null) => {
    const canvas = overlayCanvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;

    if (!points || points.length < 21) {
      clearOverlay();
      return;
    }

    canvas.width = video.clientWidth;
    canvas.height = video.clientHeight;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const toXY = (p) => [p[0] * canvas.width, p[1] * canvas.height];

    // 1. Draw glowing skeleton connection lines
    ctx.shadowBlur = 8;
    ctx.shadowColor = 'rgba(20, 201, 197, 0.8)';
    ctx.strokeStyle = 'rgba(20, 201, 197, 0.95)';
    ctx.lineWidth = 2.5;

    HAND_CONNECTIONS.forEach(([a, b]) => {
      const [ax, ay] = toXY(points[a]);
      const [bx, by] = toXY(points[b]);
      ctx.beginPath();
      ctx.moveTo(ax, ay);
      ctx.lineTo(bx, by);
      ctx.stroke();
    });

    // 2. Draw Landmark Joints
    points.forEach((p, i) => {
      const [x, y] = toXY(p);
      ctx.beginPath();
      const isTip = [4, 8, 12, 16, 20].includes(i);
      const isWrist = i === 0;

      ctx.arc(x, y, isWrist ? 6 : isTip ? 5 : 3.5, 0, Math.PI * 2);
      ctx.fillStyle = isWrist ? '#f59e0b' : isTip ? '#a78bfa' : '#20d8d3';
      ctx.shadowBlur = isTip ? 12 : 6;
      ctx.shadowColor = isTip ? '#a78bfa' : '#20d8d3';
      ctx.fill();

      // Outer ring for fingertip nodes
      if (isTip) {
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.2;
        ctx.stroke();
      }
    });

    // 3. Draw Bounding Box around detected hand
    const xs = points.map(p => p[0] * canvas.width);
    const ys = points.map(p => p[1] * canvas.height);
    const minX = Math.max(0, Math.min(...xs) - 18);
    const maxX = Math.min(canvas.width, Math.max(...xs) + 18);
    const minY = Math.max(0, Math.min(...ys) - 18);
    const maxY = Math.min(canvas.height, Math.max(...ys) + 18);
    const width = maxX - minX;
    const height = maxY - minY;

    ctx.shadowBlur = 0;
    ctx.strokeStyle = 'rgba(20, 201, 197, 0.7)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([8, 5]);
    ctx.strokeRect(minX, minY, width, height);
    ctx.setLineDash([]);

    // Bounding Box Label
    ctx.fillStyle = 'rgba(11, 16, 24, 0.85)';
    ctx.fillRect(minX, Math.max(0, minY - 22), 110, 20);
    ctx.strokeStyle = 'rgba(20, 201, 197, 0.5)';
    ctx.strokeRect(minX, Math.max(0, minY - 22), 110, 20);

    ctx.font = 'bold 10px Inter, sans-serif';
    ctx.fillStyle = '#20d8d3';
    ctx.fillText('HAND DETECTED', minX + 8, Math.max(14, minY - 8));

    setHasLandmarks(true);
    setHandState('detected');
    if (confidence !== null) setDetectedConfidence(confidence);
  };

  useImperativeHandle(ref, () => ({
    captureFrame: captureFrameBase64,
    captureBurst,
    startCamera,
    stopCamera,
    drawLandmarks,
    clearOverlay,
    isActive,
  }));

  useEffect(() => {
    if (autoStart) {
      startCamera();
    }
    return () => stopCamera();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoStart]);

  return (
    <div className="relative aspect-video bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 shadow-card">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className={`w-full h-full object-cover ${isActive ? 'block' : 'hidden'}`}
      />
      <canvas
        ref={overlayCanvasRef}
        className={`absolute inset-0 w-full h-full pointer-events-none z-10 ${isActive ? 'block' : 'hidden'}`}
      />

      {isActive ? (
        <>
          {/* Hand Placement Guide Overlay (shown when no skeleton is drawn yet) */}
          {showGuide && !hasLandmarks && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-[5]">
              <div className="relative w-[48%] max-w-[240px] aspect-square rounded-3xl border-2 border-dashed border-primary/40 bg-primary/5 flex flex-col items-center justify-center gap-2 backdrop-blur-[1px]">
                {/* Corner reticle brackets */}
                <span className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-primary rounded-tl" />
                <span className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-primary rounded-tr" />
                <span className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-primary rounded-bl" />
                <span className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-primary rounded-br" />

                <Hand size={32} className="text-primary/60 animate-pulse" />
                <span className="text-[11px] font-bold text-primary/80 uppercase tracking-wider text-center px-2">
                  Place Hand Inside Frame
                </span>
                <span className="text-[9px] text-slate-400">Position clearly &middot; Good lighting</span>
              </div>
            </div>
          )}

          {/* Top-Right Live Preview Pill */}
          <div className="absolute top-4 right-4 px-3 py-1 rounded-xl bg-slate-950/80 backdrop-blur-md text-white text-xs font-semibold flex items-center gap-2 z-20 border border-slate-800">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Live Camera</span>
          </div>

          {/* Top-Left Dynamic Status Chips */}
          <div className="absolute top-4 left-4 flex flex-col gap-1.5 z-20 max-w-[70%]">
            {hasLandmarks ? (
              <div className="px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5 bg-emerald-950/80 border border-emerald-800 text-emerald-300 backdrop-blur-md">
                <CheckCircle2 size={14} className="text-emerald-400" />
                <span>Hand Landmarks Tracked</span>
              </div>
            ) : (
              <div className="px-3 py-1 rounded-xl text-xs font-semibold flex items-center gap-1.5 bg-slate-900/80 border border-slate-700 text-slate-300 backdrop-blur-md">
                <Scan size={13} className="text-primary animate-pulse" />
                <span>Align hand inside capture zone</span>
              </div>
            )}

            {statusChips.map((chip, i) => (
              <div
                key={i}
                className={`px-3 py-1 rounded-xl text-xs font-semibold flex items-center gap-1.5 border backdrop-blur-md ${
                  chip.tone === 'good'
                    ? 'bg-emerald-950/80 border-emerald-800 text-emerald-200'
                    : 'bg-amber-950/80 border-amber-800 text-amber-200'
                }`}
              >
                {chip.tone === 'good' ? <CheckCircle2 size={13} /> : <AlertTriangle size={13} />}
                {chip.label}
              </div>
            ))}
          </div>

          {/* Bottom Center Stop Camera Action */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
            <Button
              size="sm"
              variant="danger"
              onClick={stopCamera}
              className="bg-red-600/80 hover:bg-red-600 text-white backdrop-blur-md border border-red-500/30"
            >
              <CameraOff size={14} /> Stop Camera
            </Button>
          </div>
        </>
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center text-white p-6 bg-slate-900/90">
          {error ? (
            <>
              <div className="h-13 w-13 rounded-2xl bg-red-500/20 text-red-400 flex items-center justify-center mb-3">
                <AlertCircle size={26} />
              </div>
              <p className="text-sm font-bold text-red-200 mb-1">Camera Initialization Failed</p>
              <p className="text-xs text-slate-400 mb-4 max-w-sm text-center leading-relaxed">{error}</p>
              <Button size="sm" variant="outline" onClick={startCamera} className="border-slate-700 text-slate-200 hover:bg-slate-800">
                <RefreshCw size={14} /> Try Again
              </Button>
            </>
          ) : (
            <>
              <div className="h-13 w-13 rounded-2xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center mb-3 shadow-[0_0_20px_rgba(20,201,197,0.15)]">
                <Camera size={26} />
              </div>
              <p className="text-sm font-bold text-white mb-1">Camera Required for Sign Recognition</p>
              <p className="text-xs text-slate-400 mb-4 max-w-sm text-center">
                Click below to start live video capture for real-time hand tracking and gesture assessment.
              </p>
              <Button
                size="sm"
                onClick={startCamera}
                loading={isInitializing}
                className="bg-primary hover:bg-primary-600 text-slate-950 font-bold shadow-[0_0_20px_rgba(20,201,197,0.25)]"
              >
                <Camera size={15} /> Start Camera Feed
              </Button>
            </>
          )}
        </div>
      )}
    </div>
  );
});
