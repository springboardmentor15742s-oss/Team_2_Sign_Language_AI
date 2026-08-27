import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';

import {
  Camera,
  CameraOff,
  RefreshCw,
} from 'lucide-react';

import { Button } from '../ui/Button';


export const CameraPanel = forwardRef(
  function CameraPanel(_, ref) {

    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const streamRef = useRef(null);

    const [isActive, setIsActive] = useState(false);
    const [isReady, setIsReady] = useState(false);
    const [error, setError] = useState(null);


    // --------------------------------------------------
    // START CAMERA
    // --------------------------------------------------

    const startCamera = async () => {
      try {
        setError(null);
        setIsReady(false);

        if (
          !navigator.mediaDevices ||
          !navigator.mediaDevices.getUserMedia
        ) {
          throw new Error(
            'Camera is not supported in this browser.'
          );
        }

        // Stop any old stream first
        if (streamRef.current) {
          streamRef.current
            .getTracks()
            .forEach((track) => track.stop());

          streamRef.current = null;
        }

        const stream =
          await navigator.mediaDevices.getUserMedia({
            video: {
              facingMode: 'user',
              width: {
                ideal: 1280,
              },
              height: {
                ideal: 720,
              },
            },
            audio: false,
          });

        // Store the stream first.
        // The video element will be attached after React renders it.
        streamRef.current = stream;

        setIsActive(true);

      } catch (err) {
        console.error('Camera error:', err);

        setError(
          err?.message ||
          'Could not access camera. Please allow camera permissions.'
        );

        setIsActive(false);
        setIsReady(false);
      }
    };


    // --------------------------------------------------
    // ATTACH STREAM AFTER VIDEO ELEMENT EXISTS
    // --------------------------------------------------

    useEffect(() => {
      if (
        !isActive ||
        !videoRef.current ||
        !streamRef.current
      ) {
        return;
      }

      const video = videoRef.current;

      video.srcObject = streamRef.current;

      const prepareVideo = async () => {
        try {
          await video.play();
        } catch (err) {
          console.error(
            'Unable to play camera stream:',
            err
          );

          setError(
            'Unable to start camera preview.'
          );

          setIsReady(false);
        }
      };

      prepareVideo();

    }, [isActive]);


    // --------------------------------------------------
    // VIDEO READY
    // --------------------------------------------------

    const handleVideoReady = () => {
      const video = videoRef.current;

      if (
        video &&
        video.videoWidth > 0 &&
        video.videoHeight > 0
      ) {
        console.log(
          'Camera ready:',
          video.videoWidth,
          'x',
          video.videoHeight
        );

        setIsReady(true);
        setError(null);
      }
    };


    // --------------------------------------------------
    // STOP CAMERA
    // --------------------------------------------------

    const stopCamera = () => {

      if (streamRef.current) {
        streamRef.current
          .getTracks()
          .forEach((track) => track.stop());

        streamRef.current = null;
      }

      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }

      setIsActive(false);
      setIsReady(false);
    };


    // --------------------------------------------------
    // CAPTURE CURRENT VIDEO FRAME
    // --------------------------------------------------

    const captureFrame = async () => {

      if (
        !isActive ||
        !videoRef.current ||
        !streamRef.current
      ) {
        throw new Error(
          'Start the camera before analyzing your sign.'
        );
      }

      const video = videoRef.current;

      if (
        !isReady ||
        video.readyState < 2 ||
        video.videoWidth <= 0 ||
        video.videoHeight <= 0
      ) {
        throw new Error(
          'Camera is not ready yet. Please wait a moment.'
        );
      }

      const canvas = canvasRef.current;

      if (!canvas) {
        throw new Error(
          'Camera capture is unavailable.'
        );
      }

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const context =
        canvas.getContext('2d');

      if (!context) {
        throw new Error(
          'Unable to capture camera frame.'
        );
      }

      context.drawImage(
        video,
        0,
        0,
        canvas.width,
        canvas.height
      );

      return new Promise(
        (resolve, reject) => {

          canvas.toBlob(
            (blob) => {

              if (!blob) {
                reject(
                  new Error(
                    'Unable to create image from camera.'
                  )
                );

                return;
              }

              const file = new File(
                [blob],
                `sign-${Date.now()}.jpg`,
                {
                  type: 'image/jpeg',
                }
              );

              resolve(file);
            },
            'image/jpeg',
            0.92
          );
        }
      );
    };


    // --------------------------------------------------
    // EXPOSE CAMERA METHODS
    // --------------------------------------------------

    useImperativeHandle(
      ref,
      () => ({
        captureFrame,
        isCameraActive: () => isActive,
        isCameraReady: () => isReady,
      }),
      [isActive, isReady]
    );


    // --------------------------------------------------
    // CLEANUP
    // --------------------------------------------------

    useEffect(() => {
      return () => {

        if (streamRef.current) {
          streamRef.current
            .getTracks()
            .forEach((track) => track.stop());

          streamRef.current = null;
        }

      };
    }, []);


    // --------------------------------------------------
    // UI
    // --------------------------------------------------

    return (
      <div
        className="
          relative
          aspect-video
          bg-gray-900
          rounded-2xl
          overflow-hidden
        "
      >

        <canvas
          ref={canvasRef}
          className="hidden"
        />


        {isActive ? (
          <>

            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted

              onLoadedMetadata={handleVideoReady}
              onCanPlay={handleVideoReady}
              onPlaying={handleVideoReady}

              className="
                w-full
                h-full
                object-cover
              "
            />


            {/* GUIDE FRAME */}

            <div
              className="
                pointer-events-none
                absolute
                inset-0
                flex
                items-center
                justify-center
              "
            >

              <div
                className="
                  w-[58%]
                  h-[78%]
                  rounded-[40px]
                  border-2
                  border-dashed
                  border-white/40
                "
              />

            </div>


            <div
              className="
                absolute
                top-4
                left-4
                px-3
                py-1.5
                rounded-lg
                bg-black/50
                text-white
                text-xs
              "
            >
              Keep your hand inside the guide
            </div>


            <div
              className="
                absolute
                top-4
                right-4
                px-2.5
                py-1
                rounded-lg
                bg-black/50
                text-white
                text-xs
                font-medium
                flex
                items-center
                gap-1.5
              "
            >

              <span
                className={`
                  w-2
                  h-2
                  rounded-full
                  ${
                    isReady
                      ? 'bg-green-500'
                      : 'bg-yellow-500'
                  }
                `}
              />

              {isReady
                ? 'Camera Ready'
                : 'Starting...'}

            </div>


            <div
              className="
                absolute
                bottom-4
                left-1/2
                -translate-x-1/2
              "
            >

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

          <div
            className="
              w-full
              h-full
              flex
              flex-col
              items-center
              justify-center
              text-white
            "
          >

            {error ? (
              <>

                <CameraOff
                  size={40}
                  className="
                    mb-3
                    text-gray-500
                  "
                />

                <p
                  className="
                    text-sm
                    text-gray-400
                    mb-4
                    max-w-xs
                    text-center
                  "
                >
                  {error}
                </p>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={startCamera}
                  className="
                    border-gray-600
                    text-white
                    hover:bg-gray-800
                  "
                >
                  <RefreshCw size={14} />
                  Retry
                </Button>

              </>
            ) : (
              <>

                <Camera
                  size={40}
                  className="
                    mb-3
                    text-gray-600
                  "
                />

                <p
                  className="
                    text-sm
                    text-gray-400
                    mb-4
                  "
                >
                  Start your camera for AI practice
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
);