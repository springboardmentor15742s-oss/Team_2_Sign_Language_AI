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

import {
  FilesetResolver,
  HandLandmarker,
} from '@mediapipe/tasks-vision';

import { Button } from '../ui/Button';


const HAND_CONNECTIONS = [
  [0, 1], [1, 2], [2, 3], [3, 4],
  [0, 5], [5, 6], [6, 7], [7, 8],
  [5, 9], [9, 10], [10, 11], [11, 12],
  [9, 13], [13, 14], [14, 15], [15, 16],
  [13, 17], [17, 18], [18, 19], [19, 20],
  [0, 17],
];


export const CameraPanel = forwardRef(
  function CameraPanel(_, ref) {

    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const overlayRef = useRef(null);

    const streamRef = useRef(null);
    const landmarkerRef = useRef(null);

    const animationRef = useRef(null);
    const lastVideoTimeRef = useRef(-1);
    const currentLandmarksRef = useRef(null);

    const [isActive, setIsActive] =
      useState(false);

    const [isReady, setIsReady] =
      useState(false);

    const [error, setError] =
      useState(null);

    const [handDetected, setHandDetected] =
      useState(false);


    // =====================================================
    // MEDIAPIPE INITIALIZATION
    // =====================================================

    useEffect(() => {
      let cancelled = false;

      const initializeLandmarker = async () => {
        try {
          const vision =
            await FilesetResolver.forVisionTasks(
              'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
            );

          const landmarker =
            await HandLandmarker.createFromOptions(
              vision,
              {
                baseOptions: {
                  modelAssetPath:
                    'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/latest/hand_landmarker.task',
                  delegate: 'GPU',
                },

                runningMode: 'VIDEO',

                numHands: 1,

                minHandDetectionConfidence: 0.55,
                minHandPresenceConfidence: 0.55,
                minTrackingConfidence: 0.50,
              }
            );

          if (!cancelled) {
            landmarkerRef.current =
              landmarker;
          }

        } catch (err) {
          console.error(
            'Hand landmark initialization error:',
            err
          );
        }
      };

      initializeLandmarker();

      return () => {
        cancelled = true;

        if (landmarkerRef.current) {
          try {
            landmarkerRef.current.close();
          } catch (_) {}

          landmarkerRef.current = null;
        }
      };
    }, []);


    // =====================================================
    // START CAMERA
    // =====================================================

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

        if (streamRef.current) {
          streamRef.current
            .getTracks()
            .forEach(
              (track) =>
                track.stop()
            );
        }

        const stream =
          await navigator.mediaDevices
            .getUserMedia({
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

        streamRef.current = stream;

        setIsActive(true);

      } catch (err) {
        console.error(
          'Camera error:',
          err
        );

        setError(
          err?.message ||
          'Could not access camera.'
        );

        setIsActive(false);
        setIsReady(false);
      }
    };


    // =====================================================
    // ATTACH STREAM
    // =====================================================

    useEffect(() => {
      if (
        !isActive ||
        !videoRef.current ||
        !streamRef.current
      ) {
        return;
      }

      const video =
        videoRef.current;

      video.srcObject =
        streamRef.current;

      video
        .play()
        .catch((err) => {
          console.error(
            'Unable to play camera:',
            err
          );
        });

    }, [isActive]);


    // =====================================================
    // VIDEO READY
    // =====================================================

    const handleVideoReady = () => {
      const video =
        videoRef.current;

      if (
        video &&
        video.videoWidth > 0 &&
        video.videoHeight > 0
      ) {
        setIsReady(true);
        setError(null);
      }
    };


    // =====================================================
    // DRAW LANDMARKS
    // =====================================================

    const drawLandmarks = (
      landmarks
    ) => {
      const canvas =
        overlayRef.current;

      const video =
        videoRef.current;

      if (!canvas || !video) {
        return;
      }

      canvas.width =
        video.videoWidth;

      canvas.height =
        video.videoHeight;

      const ctx =
        canvas.getContext('2d');

      ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
      );

      if (
        !landmarks ||
        landmarks.length === 0
      ) {
        return;
      }

      ctx.lineWidth = 4;
      ctx.strokeStyle =
        '#43e6d5';

      HAND_CONNECTIONS.forEach(
        ([start, end]) => {
          const a =
            landmarks[start];

          const b =
            landmarks[end];

          if (!a || !b) return;

          ctx.beginPath();

          ctx.moveTo(
            a.x * canvas.width,
            a.y * canvas.height
          );

          ctx.lineTo(
            b.x * canvas.width,
            b.y * canvas.height
          );

          ctx.stroke();
        }
      );


      landmarks.forEach(
        (point) => {
          ctx.beginPath();

          ctx.arc(
            point.x *
              canvas.width,
            point.y *
              canvas.height,
            6,
            0,
            Math.PI * 2
          );

          ctx.fillStyle =
            '#ffffff';

          ctx.fill();

          ctx.lineWidth = 2;

          ctx.strokeStyle =
            '#15988b';

          ctx.stroke();
        }
      );
    };


    // =====================================================
    // LIVE HAND DETECTION
    // =====================================================

    useEffect(() => {
      if (!isActive) {
        return;
      }

      const detectHands = () => {
        const video =
          videoRef.current;

        const landmarker =
          landmarkerRef.current;

        if (
          video &&
          landmarker &&
          video.readyState >= 2
        ) {
          try {

            if (
              video.currentTime !==
              lastVideoTimeRef.current
            ) {

              lastVideoTimeRef.current =
                video.currentTime;

              const result =
                landmarker
                  .detectForVideo(
                    video,
                    performance.now()
                  );

              const hand =
                result?.landmarks?.[0];

              currentLandmarksRef.current =
                hand || null;

              setHandDetected(
                Boolean(hand)
              );

              drawLandmarks(
                hand || []
              );
            }

          } catch (err) {
            console.error(
              'Hand detection error:',
              err
            );
          }
        }

        animationRef.current =
          requestAnimationFrame(
            detectHands
          );
      };

      animationRef.current =
        requestAnimationFrame(
          detectHands
        );

      return () => {
        if (
          animationRef.current
        ) {
          cancelAnimationFrame(
            animationRef.current
          );
        }
      };

    }, [isActive]);


    // =====================================================
    // STOP CAMERA
    // =====================================================

    const stopCamera = () => {
      if (
        animationRef.current
      ) {
        cancelAnimationFrame(
          animationRef.current
        );
      }

      if (
        streamRef.current
      ) {
        streamRef.current
          .getTracks()
          .forEach(
            (track) =>
              track.stop()
          );

        streamRef.current = null;
      }

      if (
        videoRef.current
      ) {
        videoRef.current
          .srcObject = null;
      }

      const overlay =
        overlayRef.current;

      if (overlay) {
        const ctx =
          overlay.getContext('2d');

        ctx?.clearRect(
          0,
          0,
          overlay.width,
          overlay.height
        );
      }

      currentLandmarksRef.current = null;

      setIsActive(false);
      setIsReady(false);
      setHandDetected(false);
    };


    // =====================================================
    // CAPTURE GUIDE REGION ONLY
    //
    // Guide displayed:
    // width  = 58%
    // height = 78%
    // centered.
    //
    // We now send ONLY this region to ML.
    // =====================================================

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

      const video =
        videoRef.current;

      if (
        !isReady ||
        video.readyState < 2 ||
        video.videoWidth <= 0 ||
        video.videoHeight <= 0
      ) {
        throw new Error(
          'Camera is not ready yet.'
        );
      }

      const canvas =
        canvasRef.current;

      if (!canvas) {
        throw new Error(
          'Camera capture is unavailable.'
        );
      }


      const sourceWidth =
        video.videoWidth * 0.58;

      const sourceHeight =
        video.videoHeight * 0.78;

      const sourceX =
        (
          video.videoWidth -
          sourceWidth
        ) / 2;

      const sourceY =
        (
          video.videoHeight -
          sourceHeight
        ) / 2;


      canvas.width = 512;
      canvas.height = 512;


      const context =
        canvas.getContext('2d');


      context.fillStyle =
        '#000000';

      context.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
      );


      context.drawImage(
        video,

        sourceX,
        sourceY,
        sourceWidth,
        sourceHeight,

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
                    'Unable to create image.'
                  )
                );

                return;
              }

              resolve(
                new File(
                  [blob],
                  `sign-${Date.now()}.jpg`,
                  {
                    type:
                      'image/jpeg',
                  }
                )
              );
            },

            'image/jpeg',

            0.95
          );
        }
      );
    };


    // =====================================================
    // EXPOSE METHODS
    // =====================================================

    useImperativeHandle(
      ref,

      () => ({
        captureFrame,

        isCameraActive:
          () => isActive,

        isCameraReady:
          () => isReady,

        isHandDetected:
          () => handDetected,

        getCurrentLandmarks: () => {
          const points =
            currentLandmarksRef.current;

          if (
            !points ||
            points.length !== 21
          ) {
            return null;
          }

          // Wrist becomes the origin.
          const wrist = points[0];

          const translated =
            points.map((point) => ({
              x: point.x - wrist.x,
              y: point.y - wrist.y,
              z: point.z - wrist.z,
            }));

          // Normalize by wrist -> middle MCP distance.
          const middleMcp =
            translated[9];

          const scale =
            Math.sqrt(
              middleMcp.x ** 2 +
              middleMcp.y ** 2 +
              middleMcp.z ** 2
            ) || 1;

          return translated.flatMap(
            (point) => [
              point.x / scale,
              point.y / scale,
              point.z / scale,
            ]
          );
        },
      }),

      [
        isActive,
        isReady,
        handDetected,
      ]
    );


    // =====================================================
    // CLEANUP
    // =====================================================

    useEffect(() => {
      return () => {
        if (
          streamRef.current
        ) {
          streamRef.current
            .getTracks()
            .forEach(
              (track) =>
                track.stop()
            );
        }
      };
    }, []);


    // =====================================================
    // UI
    // =====================================================

    return (
      <div
        className="
          relative
          aspect-video
          ss-camera
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

              onLoadedMetadata={
                handleVideoReady
              }

              onCanPlay={
                handleVideoReady
              }

              onPlaying={
                handleVideoReady
              }

              className="
                w-full
                h-full
                object-cover
              "
            />


            {/* LANDMARK OVERLAY */}

            <canvas
              ref={overlayRef}

              className="
                absolute
                inset-0
                w-full
                h-full
                pointer-events-none
              "
            />


            {/* GUIDE */}

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
                bg-black/55
                text-white
                text-xs
              "
            >
              Keep your hand inside the guide
            </div>


            {/* HAND STATUS */}

            <div
              className="
                absolute
                bottom-4
                left-4
                rounded-lg
                bg-black/55
                px-3
                py-1.5
                text-xs
                text-white
              "
            >
              {handDetected
                ? '✓ Hand detected'
                : 'Move hand into guide'}
            </div>


            <div
              className="
                absolute
                top-4
                right-4
                px-2.5
                py-1
                rounded-lg
                bg-black/55
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
                onClick={
                  stopCamera
                }
              >
                <CameraOff
                  size={14}
                />

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
              ss-camera-placeholder
            "
          >

            {error ? (
              <>

                <CameraOff
                  size={40}

                  className="
                    mb-3
                    text-[var(--ss-text-muted)]
                  "
                />

                <p
                  className="
                    text-sm
                    text-[var(--ss-text-soft)]
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

                  onClick={
                    startCamera
                  }
                >
                  <RefreshCw
                    size={14}
                  />

                  Retry
                </Button>

              </>

            ) : (

              <>

                <Camera
                  size={40}

                  className="
                    mb-3
                    text-[var(--ss-text-muted)]
                  "
                />

                <p
                  className="
                    text-sm
                    text-[var(--ss-text-soft)]
                    mb-4
                  "
                >
                  Start your camera for AI practice
                </p>

                <Button
                  size="sm"

                  onClick={
                    startCamera
                  }
                >
                  <Camera
                    size={14}
                  />

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
