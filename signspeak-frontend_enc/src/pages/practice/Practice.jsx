import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ArrowRight, CheckCircle2, CircleAlert, Clock3, Hand, Info, Loader2, Pause, Play, RotateCcw, Sparkles, Video, Zap } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Breadcrumb } from '../../components/layout/Breadcrumb';
import { CameraPanel } from '../../components/practice/CameraPanel';
import { ConfidenceMeter } from '../../components/practice/ConfidenceMeter';
import { FeedbackPanel } from '../../components/practice/FeedbackPanel';
import { assessmentService } from '../../services/assessmentService';

// Curated technique notes for the letters historically documented in the
// platform; every other supported class gets an honest generic prompt
// rather than a fabricated technique description.
const CURATED_INSTRUCTIONS = {
  A: 'Make a fist with your thumb resting on the side of your index finger.',
  B: 'Hold your hand flat with all fingers together and thumb tucked in.',
  C: 'Curve your fingers and thumb to form a C shape.',
  D: 'Hold thumb to middle, ring, pinky tips with index finger straight up.',
  E: 'Curl all fingers into your palm with thumb tucked in.',
  del: 'Perform the "delete" gesture used in ASL fingerspelling practice sets.',
  nothing: 'Keep your hand relaxed and out of a specific letter shape.',
  space: 'Perform the "space" gesture used in ASL fingerspelling practice sets.',
};

function buildSignEntry(cls) {
  const label = cls.length === 1 ? `Letter ${cls}` : cls.charAt(0).toUpperCase() + cls.slice(1);
  return {
    id: cls,
    name: label,
    symbol: cls,
    instruction: CURATED_INSTRUCTIONS[cls] || `Form the ASL hand shape for "${cls}" clearly and hold it steady in the frame.`,
  };
}

const QUALITY_CODE_TO_CRITERION = {
  hand_out_of_frame: 'frame',
  hand_near_edge: 'frame',
  insufficient_landmarks: 'frame',
  low_light: 'lighting',
  low_detection_confidence: 'pose',
  hand_too_far: 'distance',
  hand_too_close: 'distance',
};

function buildLiveFeedbackChecklist(result) {
  const criteria = [
    { key: 'frame', label: 'Hand in frame' },
    { key: 'lighting', label: 'Good lighting' },
    { key: 'pose', label: 'Stable pose' },
    { key: 'distance', label: 'Good distance' },
  ];

  if (!result) {
    return criteria.map(c => ({ ...c, state: 'pending' }));
  }
  if (result.status === 'no_hand') {
    return criteria.map(c => ({ ...c, state: c.key === 'frame' ? 'fail' : 'pending' }));
  }

  const failedCriteria = new Set(
    (result.quality?.issues || [])
      .filter(i => i.severity === 'error')
      .map(i => QUALITY_CODE_TO_CRITERION[i.code])
      .filter(Boolean)
  );

  return criteria.map(c => ({ ...c, state: failedCriteria.has(c.key) ? 'fail' : 'pass' }));
}

function buildStatusChips(result) {
  if (!result) return [];
  if (result.status === 'no_hand') {
    return [{ label: 'Hand not detected', tone: 'warning' }];
  }
  const chips = [{ label: 'Hand detected', tone: 'good' }];
  const quality = result.quality;
  if (quality) {
    if (quality.passed === false) {
      const primary = (quality.issues || [])[0];
      chips.push({ label: primary ? primary.message : 'Adjust hand position', tone: 'warning' });
    } else {
      chips.push({ label: 'Framing OK', tone: 'good' });
    }
  }
  return chips;
}

export default function Practice() {
  const [searchParams] = useSearchParams();
  const focusSigns = (searchParams.get('signs') || '').split(',').map(s => s.trim().toUpperCase()).filter(Boolean);

  const [allClasses, setAllClasses] = useState([]);
  const [classesLoading, setClassesLoading] = useState(true);
  const [classesError, setClassesError] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [timer, setTimer] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [confidence, setConfidence] = useState(0);
  const [score, setScore] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState(null);
  const [lastResult, setLastResult] = useState(null);

  const intervalRef = useRef(null);
  const cameraRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    setClassesLoading(true);
    assessmentService.getSignClasses()
      .then((res) => {
        if (cancelled) return;
        const classes = res.data?.classes || [];
        const ordered = focusSigns.length
          ? focusSigns.filter(s => classes.includes(s))
          : classes;
        setAllClasses(ordered.length ? ordered.map(buildSignEntry) : classes.map(buildSignEntry));
      })
      .catch((err) => {
        if (cancelled) return;
        console.error('Failed to load supported sign classes:', err);
        setClassesError(err.response?.data?.detail || 'Unable to load supported sign classes from the backend.');
      })
      .finally(() => !cancelled && setClassesLoading(false));
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!isPaused) intervalRef.current = setInterval(() => setTimer(t => t + 1), 1000);
    return () => clearInterval(intervalRef.current);
  }, [isPaused]);

  const formatTime = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  const currentSign = allClasses[currentIndex];

  const analyzeSign = async () => {
    if (!currentSign) return;
    setAnalysisError(null);

    if (!cameraRef.current?.isActive) {
      setAnalysisError('Please start the camera and position your hand in the frame.');
      return;
    }

    setIsAnalyzing(true);
    try {
      const frames = await cameraRef.current.captureBurst(3, 160);
      const singleFrame = cameraRef.current.captureFrame();

      if (!frames.length && !singleFrame) {
        setAnalysisError('Camera is not ready yet. Wait a moment for the live preview to start, then try again.');
        setIsAnalyzing(false);
        return;
      }

      const response = await assessmentService.evaluateSign({
        expected_sign: currentSign.symbol,
        frames: frames.length ? frames : [singleFrame],
        image_data: singleFrame || (frames.length ? frames[0] : null),
      });

      const res = response.data;
      setLastResult(res);
      if (res.raw_landmarks) {
        cameraRef.current?.drawLandmarks(res.raw_landmarks, res.confidence);
      }
      const confPercent = Math.round((res.confidence || 0) * 100);
      setConfidence(confPercent);
      setScore(res.score || 0);

      let feedbackType = 'tip';
      let feedbackTitle = 'Analysis complete';
      if (res.status === 'no_hand') {
        feedbackType = 'error';
        feedbackTitle = 'Hand not detected';
      } else if (res.status === 'quality_issue') {
        feedbackType = 'warning';
        feedbackTitle = 'Adjust your hand position';
      } else if (res.status === 'low_confidence') {
        feedbackType = 'tip';
        feedbackTitle = 'Unable to confidently recognize the sign';
      } else if (res.is_correct) {
        feedbackType = 'success';
        feedbackTitle = `Correct ${res.expected_sign} (Score: ${res.score}%)`;
      } else {
        feedbackType = 'warning';
        feedbackTitle = `Detected: ${res.predicted_sign} (Expected: ${res.expected_sign})`;
      }

      setFeedback({
        type: feedbackType,
        title: feedbackTitle,
        message: res.feedback || 'Hand position analyzed.',
      });
    } catch (err) {
      console.error('Sign analysis failed:', err);
      const status = err.response?.status;
      if (status === 401) {
        setAnalysisError('Your session has expired. Please log in again.');
      } else if (!err.response) {
        setAnalysisError('AI analysis service is unavailable. Please check that the backend server is running.');
      } else {
        setAnalysisError(err.response?.data?.detail || 'Failed to analyze sign. Please try again.');
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  const nextSign = () => {
    setCurrentIndex(i => (i + 1) % Math.max(allClasses.length, 1));
    setFeedback(null);
    setConfidence(0);
    setScore(0);
    setAnalysisError(null);
    setLastResult(null);
  };

  const reset = () => {
    setTimer(0);
    setFeedback(null);
    setConfidence(0);
    setScore(0);
    setIsPaused(false);
    setAnalysisError(null);
    setLastResult(null);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <Breadcrumb items={[{ label: 'Practice' }]} />

      <section className="rounded-[26px] bg-slate-950 text-white p-6 lg:p-7 shadow-soft border border-slate-800">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-blue-200">
              <Sparkles size={14} /> AI gesture assessment workspace
            </div>
            <h1 className="mt-2 text-2xl lg:text-3xl font-bold text-white">Practice & get real-time AI feedback</h1>
            <p className="mt-2 text-sm text-slate-300">
              {focusSigns.length ? 'Focused practice on your weaker signs.' : 'Position your hand clearly in front of the camera and analyze your performance.'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2 text-sm text-slate-200">
              <Clock3 size={15} /> {formatTime(timer)}
            </div>
            <Button variant="ghost" onClick={() => setIsPaused(!isPaused)} className="text-white hover:bg-white/10 hover:text-white">
              {isPaused ? <Play size={15} /> : <Pause size={15} />} {isPaused ? 'Resume' : 'Pause'}
            </Button>
            <Button variant="ghost" onClick={reset} className="text-white hover:bg-white/10 hover:text-white">
              <RotateCcw size={15} /> Reset
            </Button>
          </div>
        </div>
      </section>

      {classesError && (
        <div className="p-4 rounded-xl bg-red-950/80 border border-red-800 text-red-200 text-xs font-medium">
          {classesError}
        </div>
      )}

      <div className="grid xl:grid-cols-[1.45fr_0.8fr] gap-6 items-start">
        <div className="space-y-5">
          <Card padding="none" className="overflow-hidden bg-slate-900 border-slate-800">
            <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-primary-500/20 text-primary flex items-center justify-center">
                  <Video size={18} />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">Live practice camera</p>
                  <p className="text-xs text-slate-300">Hand tracking & landmark feature extraction</p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2.5 py-1.5 rounded-full">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live AI Mode
              </span>
            </div>
            <div className="p-4">
              <CameraPanel ref={cameraRef} statusChips={buildStatusChips(lastResult)} />
            </div>
          </Card>

          {analysisError && (
            <div className="p-4 rounded-xl bg-red-950/80 border border-red-800 text-red-200 text-xs font-medium">
              {analysisError}
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-5">
            <Card className="bg-slate-900 border-slate-800">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Zap size={18} className="text-amber-400" />
                  <h3 className="font-bold text-white">AI confidence</h3>
                </div>
                {score > 0 && (
                  <span className="text-xs font-bold text-primary bg-primary-500/20 border border-primary-500/30 px-2.5 py-1 rounded-lg">
                    Score: {score}%
                  </span>
                )}
              </div>
              <ConfidenceMeter value={confidence} />
              <p className="mt-3 text-[11px] text-slate-400 leading-relaxed">
                Model confidence reflects how sure the classifier is about this single attempt -- it is not the same
                as your overall assessment accuracy.
              </p>
            </Card>

            {feedback ? (
              <FeedbackPanel feedback={feedback} />
            ) : (
              <Card className="border-dashed bg-slate-900 border-slate-800">
                <div className="h-full flex flex-col justify-center">
                  <div className="h-10 w-10 rounded-xl bg-violet-500/20 text-violet-300 flex items-center justify-center">
                    <Sparkles size={19} />
                  </div>
                  <h3 className="mt-3 font-bold text-white">Real-time feedback appears here</h3>
                  <p className="mt-1 text-sm text-slate-300">Perform the target gesture and click "Analyze my sign".</p>
                </div>
              </Card>
            )}
          </div>
        </div>

        <div className="space-y-5">
          <Card className="bg-slate-900 border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-primary" />
                <h3 className="text-sm font-bold text-white">Live Feedback</h3>
              </div>
              <span className="text-xs font-bold text-slate-300">
                {confidence > 0 ? `${confidence}%` : '--%'}
              </span>
            </div>
            <div className="space-y-2.5">
              {buildLiveFeedbackChecklist(lastResult).map(({ key, label, state }) => (
                <div key={key} className="flex items-center justify-between text-xs">
                  <span className={state === 'pending' ? 'text-slate-500' : 'text-slate-200'}>{label}</span>
                  {state === 'pass' && <CheckCircle2 size={15} className="text-emerald-400" />}
                  {state === 'fail' && <CircleAlert size={15} className="text-amber-400" />}
                  {state === 'pending' && <span className="h-2 w-2 rounded-full bg-slate-700" />}
                </div>
              ))}
            </div>
            <p className="mt-3 pt-3 border-t border-slate-800 text-[11px] text-slate-500">
              {lastResult ? 'Based on your last analyzed frame.' : 'Waiting for analysis...'}
            </p>
          </Card>

          <Card padding="large" className="bg-slate-900 border-slate-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Hand size={18} className="text-primary" />
                <span className="text-xs font-bold uppercase tracking-wider text-primary">Target sign</span>
              </div>
              <span className="text-xs font-semibold text-slate-400">{allClasses.length ? currentIndex + 1 : 0} / {allClasses.length}</span>
            </div>
            {classesLoading ? (
              <div className="mt-4 flex items-center gap-2 text-sm text-slate-300">
                <Loader2 size={16} className="animate-spin" /> Loading supported signs...
              </div>
            ) : currentSign ? (
              <>
                <h2 className="mt-4 text-2xl font-bold text-white">{currentSign.name}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-200">{currentSign.instruction}</p>
                <div className="mt-5 rounded-2xl bg-blue-950/60 border border-blue-800/60 p-4 flex gap-3">
                  <Info size={17} className="text-primary mt-0.5 shrink-0" />
                  <p className="text-xs leading-5 text-blue-200">Keep your hand inside the frame, use good lighting, and make the gesture clearly.</p>
                </div>
                <div className="mt-5 space-y-2">
                  <Button className="w-full" onClick={analyzeSign} disabled={isAnalyzing}>
                    {isAnalyzing ? (
                      <>
                        <Loader2 size={16} className="animate-spin" /> Analyzing gesture...
                      </>
                    ) : (
                      <>
                        <Hand size={16} /> Analyze my sign
                      </>
                    )}
                  </Button>
                  <Button variant="outline" className="w-full text-slate-200 border-slate-700 hover:bg-slate-800" onClick={nextSign}>
                    Next sign <ArrowRight size={16} />
                  </Button>
                </div>
              </>
            ) : (
              <p className="mt-4 text-sm text-slate-300">No supported sign classes were returned by the backend.</p>
            )}
          </Card>

          <Card className="bg-slate-900 border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-white">Practice queue</h3>
              <span className="text-xs text-slate-400">{focusSigns.length ? 'Focused' : `${allClasses.length} signs`}</span>
            </div>
            <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
              {allClasses.map((sign, i) => (
                <button
                  key={sign.id}
                  onClick={() => {
                    setCurrentIndex(i);
                    setFeedback(null);
                    setConfidence(0);
                    setScore(0);
                    setAnalysisError(null);
                    setLastResult(null);
                    cameraRef.current?.clearOverlay();
                  }}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all ${
                    i === currentIndex ? 'bg-primary-500/20 border border-primary-500/40 text-white' : 'hover:bg-slate-800 border border-transparent text-slate-300'
                  }`}
                >
                  <span
                    className={`h-7 w-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                      i === currentIndex ? 'bg-primary text-white' : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {sign.symbol.length === 1 ? sign.symbol : sign.symbol.slice(0, 2).toUpperCase()}
                  </span>
                  <span className={`text-sm font-semibold flex-1 ${i === currentIndex ? 'text-white font-bold' : 'text-slate-200'}`}>
                    {sign.name}
                  </span>
                  {i === currentIndex ? <CheckCircle2 size={16} className="text-primary" /> : <CircleAlert size={15} className="text-slate-500" />}
                </button>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
