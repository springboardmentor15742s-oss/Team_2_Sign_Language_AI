const FINGER_NAMES = ['index', 'middle', 'ring', 'pinky'];

const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z);

const average = (values) => values.reduce((sum, value) => sum + value, 0) / values.length;

function normalizeLandmarks(landmarks) {
  const wrist = landmarks[0];
  const centered = landmarks.map((point) => ({
    x: point.x - wrist.x,
    y: point.y - wrist.y,
    z: point.z - wrist.z,
  }));

  const scale = Math.max(
    ...centered.map((point) => Math.hypot(point.x, point.y, point.z)),
    0.0001
  );

  return centered.map((point) => ({
    x: point.x / scale,
    y: point.y / scale,
    z: point.z / scale,
  }));
}

function getFingerStates(landmarks) {
  const states = {};
  const pipIndices = [6, 10, 14, 18];
  const tipIndices = [8, 12, 16, 20];

  FINGER_NAMES.forEach((name, index) => {
    const tip = landmarks[tipIndices[index]];
    const pip = landmarks[pipIndices[index]];
    const wrist = landmarks[0];
    states[name] = distance(tip, wrist) > distance(pip, wrist) * 1.08;
  });

  const thumbTip = landmarks[4];
  const thumbIp = landmarks[3];
  const indexMcp = landmarks[5];
  states.thumb = distance(thumbTip, indexMcp) > distance(thumbIp, indexMcp) * 1.05;

  return states;
}

function classifyLandmarks(rawLandmarks) {
  if (!rawLandmarks || rawLandmarks.length !== 21) {
    return { gesture: 'Unknown', confidence: 0, fingerStates: {} };
  }

  const landmarks = normalizeLandmarks(rawLandmarks);
  const fingers = getFingerStates(landmarks);
  const extendedCount = FINGER_NAMES.filter((finger) => fingers[finger]).length;

  const thumbTip = landmarks[4];
  const indexTip = landmarks[8];
  const thumbIndexGap = distance(thumbTip, indexTip);

  // These are deliberately lightweight, explainable heuristics for the
  // alphabet practice workflow. They can later be replaced by a trained
  // CNN/LSTM/Transformer classifier without changing the camera contract.
  let gesture = 'Unknown';
  let confidence = 0.18;

  if (extendedCount === 0 && fingers.thumb && thumbIndexGap < 0.38) {
    gesture = 'A';
    confidence = 0.72;
  } else if (extendedCount >= 4 && !fingers.thumb) {
    gesture = 'B';
    confidence = 0.82;
  } else if (!fingers.thumb && extendedCount >= 3) {
    gesture = 'B';
    confidence = 0.62;
  } else if (extendedCount <= 1 && fingers.thumb && thumbIndexGap >= 0.38 && thumbIndexGap < 0.82) {
    gesture = 'C';
    confidence = 0.68;
  }

  // Add a small geometric consistency bonus when the detected hand is stable.
  const palmWidth = distance(landmarks[5], landmarks[17]);
  const palmHeight = distance(landmarks[0], landmarks[9]);
  const ratio = palmWidth / Math.max(palmHeight, 0.0001);
  if (ratio > 0.35 && ratio < 1.5) confidence = Math.min(0.98, confidence + 0.06);

  return {
    gesture,
    confidence,
    fingerStates: fingers,
    landmarks: rawLandmarks,
  };
}

export function createGestureEngine({ onResults, targetGesture = null }) {
  let hands = null;
  let running = false;
  let frameBusy = false;
  let lastVideo = null;
  let rafId = null;

  const emit = (result) => {
    const enriched = {
      ...result,
      targetGesture,
      matchesTarget: targetGesture ? result.gesture === targetGesture : null,
      timestamp: Date.now(),
    };
    onResults?.(enriched);
  };

  const init = async () => {
    if (!window.Hands) {
      throw new Error('MediaPipe Hands is not loaded. Check the network connection and refresh the page.');
    }

    hands = new window.Hands({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
    });

    hands.setOptions({
      maxNumHands: 1,
      modelComplexity: 1,
      minDetectionConfidence: 0.55,
      minTrackingConfidence: 0.55,
    });

    hands.onResults((results) => {
      const landmarks = results.multiHandLandmarks?.[0] || null;
      if (!landmarks) {
        emit({ gesture: 'No hand', confidence: 0, fingerStates: {}, landmarks: [] });
        return;
      }
      emit(classifyLandmarks(landmarks));
    });
  };

  const process = async (video) => {
    if (!running || !hands || !video || frameBusy) return;
    frameBusy = true;
    try {
      await hands.send({ image: video });
    } catch (error) {
      console.error('Gesture frame processing failed:', error);
    } finally {
      frameBusy = false;
    }
  };

  const loop = () => {
    if (!running) return;
    if (lastVideo?.readyState >= 2) process(lastVideo);
    rafId = requestAnimationFrame(loop);
  };

  return {
    async start(video) {
      await init();
      lastVideo = video;
      running = true;
      loop();
    },
    stop() {
      running = false;
      if (rafId) cancelAnimationFrame(rafId);
      rafId = null;
      lastVideo = null;
      if (hands?.close) hands.close();
      hands = null;
    },
  };
}

export { classifyLandmarks, normalizeLandmarks };
