import { useState, useRef, useEffect } from 'react';
import { Camera, CameraOff, RefreshCw } from 'lucide-react';
import { Button } from '../ui/Button';

export function CameraPanel({ onFrame }) {
  const videoRef = useRef(null);
  const [isActive, setIsActive] = useState(false);
  const [error, setError] = useState(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsActive(true);
      setError(null);
    } catch (err) {
      setError('Could not access camera. Please allow camera permissions.');
      setIsActive(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(t => t.stop());
      videoRef.current.srcObject = null;
    }
    setIsActive(false);
  };

  useEffect(() => {
    return () => stopCamera();
  }, []);

  return (
    <div className="relative aspect-video bg-gray-900 rounded-2xl overflow-hidden">
      {isActive ? (
        <>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
            <Button size="sm" variant="danger" onClick={stopCamera}>
              <CameraOff size={14} /> Stop
            </Button>
          </div>
          <div className="absolute top-4 right-4 px-2.5 py-1 rounded-lg bg-black/50 text-white text-xs font-medium flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            Live
          </div>
        </>
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center text-white">
          {error ? (
            <>
              <CameraOff size={40} className="mb-3 text-gray-500" />
              <p className="text-sm text-gray-400 mb-4 max-w-xs text-center">{error}</p>
              <Button size="sm" variant="outline" onClick={startCamera} className="border-gray-600 text-white hover:bg-gray-800">
                <RefreshCw size={14} /> Retry
              </Button>
            </>
          ) : (
            <>
              <Camera size={40} className="mb-3 text-gray-600" />
              <p className="text-sm text-gray-400 mb-4">Camera preview is ready</p>
              <Button size="sm" onClick={startCamera}>
                <Camera size={14} /> Start Camera
              </Button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
