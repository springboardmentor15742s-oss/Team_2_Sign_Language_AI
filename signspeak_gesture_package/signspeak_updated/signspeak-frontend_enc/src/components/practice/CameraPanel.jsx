import { useState, useRef, useEffect } from 'react';
import { Camera, CameraOff, RefreshCw, ScanLine } from 'lucide-react';
import { Button } from '../ui/Button';
import { createGestureEngine } from '../../services/gestureEngine';

function drawLandmarks(canvas, landmarks, width, height) {
  const ctx = canvas.getContext('2d');

  ctx.clearRect(0, 0, width, height);

  if (!landmarks?.length) return;

  ctx.strokeStyle = '#60a5fa';
  ctx.fillStyle = '#ffffff';
  ctx.lineWidth = 2;

  const connections = [
    [0, 1], [1, 2], [2, 3], [3, 4],
    [0, 5], [5, 6], [6, 7], [7, 8],
    [5, 9], [9, 10], [10, 11], [11, 12],
    [9, 13], [13, 14], [14, 15], [15, 16],
    [13, 17], [17, 18], [18, 19], [19, 20],
    [17, 0],
  ];

  connections.forEach(([from, to]) => {
    ctx.beginPath();
    ctx.moveTo(
      landmarks[from].x * width,
      landmarks[from].y * height
    );
    ctx.lineTo(
      landmarks[to].x * width,
      landmarks[to].y * height
    );
    ctx.stroke();
  });

  landmarks.forEach((point) => {
    ctx.beginPath();
    ctx.arc(
      point.x * width,
      point.y * height,
      3,
      0,
      Math.PI * 2
    );
    ctx.fill();
  });
}

export function CameraPanel({ onFrame, targetGesture }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const engineRef = useRef(null);

  const [isActive, setIsActive] = useState(false);
  const [error, setError] = useState(null);
  const [detectedGesture, setDetectedGesture] = useState('No hand');
  const [confidence, setConfidence] = useState(0);

  const stopCamera = () => {
    engineRef.current?.stop();
    engineRef.current = null;

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop();
      });

      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');

      if (ctx) {
        ctx.clearRect(
          0,
          0,
          canvasRef.current.width,
          canvasRef.current.height
        );
      }
    }

    setIsActive(false);
    setDetectedGesture('No hand');
    setConfidence(0);
  };

  const startCamera = async () => {
    try {
      setError(null);

      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error(
          'Camera access is not supported by this browser.'
        );
      }

      const stream =
        await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'user',
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });

      streamRef.current = stream;

      /*
       * The video element is always mounted now,
       * so videoRef.current will not be null.
       */
      const video = videoRef.current;

      if (!video) {
        throw new Error(
          'Camera video element is not available.'
        );
      }

      video.srcObject = stream;

      await video.play();

      const engine = createGestureEngine({
        targetGesture,

        onResults: (result) => {
          setDetectedGesture(
            result.gesture || 'No hand'
          );

          setConfidence(
            Math.round(
              (result.confidence || 0) * 100
            )
          );

          if (
            canvasRef.current &&
            videoRef.current
          ) {
            const width =
              videoRef.current.videoWidth ||
              videoRef.current.clientWidth;

            const height =
              videoRef.current.videoHeight ||
              videoRef.current.clientHeight;

            if (width && height) {
              canvasRef.current.width = width;
              canvasRef.current.height = height;

              drawLandmarks(
                canvasRef.current,
                result.landmarks,
                width,
                height
              );
            }
          }

          onFrame?.(result);
        },
      });

      engineRef.current = engine;

      await engine.start(video);

      setIsActive(true);

    } catch (err) {
      console.error(
        'Camera/Gesture Engine Error:',
        err
      );

      stopCamera();

      setError(
        err?.message ||
        'Could not access camera. Please allow camera permissions.'
      );
    }
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <div className="relative aspect-video bg-gray-900 rounded-2xl overflow-hidden">

      {/* Video is ALWAYS mounted */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className={`absolute inset-0 w-full h-full object-cover -scale-x-100 ${
          isActive ? 'block' : 'hidden'
        }`}
      />

      <canvas
        ref={canvasRef}
        className={`absolute inset-0 w-full h-full pointer-events-none -scale-x-100 ${
          isActive ? 'block' : 'hidden'
        }`}
      />

      {isActive ? (
        <>
          <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-2 rounded-xl bg-black/60 text-white text-xs backdrop-blur-sm">
            <ScanLine
              size={14}
              className="text-blue-300"
            />

            <span>
              Detected:{' '}
              <strong>{detectedGesture}</strong>
            </span>

            <span className="text-slate-300">
              {confidence}%
            </span>
          </div>

          <div className="absolute top-4 right-4 px-2.5 py-1 rounded-lg bg-black/50 text-white text-xs font-medium flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            Live tracking
          </div>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
            <Button
              size="sm"
              variant="danger"
              onClick={stopCamera}
            >
              <CameraOff size={14} />
              Stop
            </Button>
          </div>
        </>
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white">

          {error ? (
            <>
              <CameraOff
                size={40}
                className="mb-3 text-gray-500"
              />

              <p className="text-sm text-gray-400 mb-4 max-w-md text-center">
                {error}
              </p>

              <Button
                size="sm"
                variant="outline"
                onClick={startCamera}
                className="border-gray-600 text-white hover:bg-gray-800"
              >
                <RefreshCw size={14} />
                Retry
              </Button>
            </>
          ) : (
            <>
              <Camera
                size={40}
                className="mb-3 text-gray-600"
              />

              <p className="text-sm text-gray-400 mb-4">
                Start the camera to enable real-time hand tracking.
              </p>

              <Button
                size="sm"
                onClick={startCamera}
              >
                <Camera size={14} />
                Start Camera
              </Button>
            </>
          )}

        </div>
      )}
    </div>
  );
}