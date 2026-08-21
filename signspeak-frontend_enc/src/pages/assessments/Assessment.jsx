import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight, CheckCircle2, ChevronRight, Clock, Hand, Layers,
  ListChecks, Loader2, Shuffle, Sparkles, Type, AlertTriangle,
  Info, HelpCircle, RotateCcw
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Breadcrumb } from '../../components/layout/Breadcrumb';
import { CameraPanel } from '../../components/practice/CameraPanel';
import { assessmentService } from '../../services/assessmentService';

const DIFFICULTY_LEVELS = [
  { id: '', label: 'All Levels' },
  { id: 'beginner', label: 'Beginner' },
  { id: 'intermediate', label: 'Intermediate' },
  { id: 'advanced', label: 'Advanced' },
];

const ASSESSMENT_TYPES = [
  {
    id: 'single',
    title: 'Single Sign Recognition',
    description: 'Perform one sign gesture and receive an instant AI assessment score.',
    icon: Hand,
    fixedCount: 1,
  },
  {
    id: 'quiz',
    title: 'Multiple Sign Quiz',
    description: 'A structured assessment testing a sequence of unique ASL signs.',
    icon: ListChecks,
    counts: [5, 8, 10],
  },
  {
    id: 'alphabet',
    title: 'Alphabet Assessment',
    description: 'Comprehensive fingerspelling assessment testing letters A through Z.',
    icon: Type,
    counts: [5, 10, 15, 26],
  },
  {
    id: 'mixed',
    title: 'Mixed Sign Assessment',
    description: 'Randomized signs from the full supported platform vocabulary without duplicate questions.',
    icon: Shuffle,
    counts: [5, 8, 12, 16],
  },
];

const SIGN_HINTS = {
  A: 'Fist with thumb resting firmly against the side of the index finger.',
  B: 'Flat hand held vertically, fingers pressed together, thumb folded across palm.',
  C: 'Curved fingers and thumb forming an open "C" shape.',
  D: 'Index finger pointing straight up, remaining fingers touching thumb in an "O".',
  E: 'All fingers curled tightly into palm, thumb tucked underneath.',
  F: 'Index finger and thumb touching to form a circle, other three fingers upright.',
  G: 'Index finger and thumb pointing horizontally forward like a pinch.',
  H: 'Index and middle fingers extended together horizontally.',
  I: 'Pinky finger extended upright, other fingers curled with thumb over them.',
  J: 'Pinky finger extended, tracing a small "J" curve in the air.',
  K: 'Index pointing up, middle pointing forward, thumb tucked between them.',
  L: 'Index and thumb forming an "L" shape.',
  M: 'Three fingers folded over thumb.',
  N: 'Two fingers folded over thumb.',
  O: 'All fingers and thumb curved to form an "O" shape.',
  P: 'Like a "K" pointing downwards.',
  Q: 'Like a "G" pointing downwards.',
  R: 'Index and middle fingers crossed.',
  S: 'Fist with thumb wrapped across the front of the fingers.',
  T: 'Thumb tucked between index and middle fingers.',
  U: 'Index and middle fingers held straight up and pressed together.',
  V: 'Index and middle fingers held straight up in a "V" shape.',
  W: 'Index, middle, and ring fingers extended upward in a "W" shape.',
  X: 'Index finger bent into a hook shape.',
  Y: 'Thumb and pinky extended, middle three fingers folded.',
  Z: 'Index finger drawing a "Z" in the air.',
};

function buildStatusChips(result) {
  if (!result) return [];
  if (result.status === 'no_hand') return [{ label: 'Hand not detected in frame', tone: 'warning' }];
  const chips = [{ label: 'Hand detected', tone: 'good' }];
  if (result.quality) {
    if (result.quality.passed === false) {
      const primary = (result.quality.issues || [])[0];
      chips.push({ label: primary ? primary.message : 'Adjust hand position', tone: 'warning' });
    } else {
      chips.push({ label: 'Position & Lighting OK', tone: 'good' });
    }
  }
  return chips;
}

export default function Assessment() {
  const navigate = useNavigate();

  const [stage, setStage] = useState('select'); // 'select' | 'running' | 'finishing'
  const [selectedType, setSelectedType] = useState('quiz');
  const [selectedCount, setSelectedCount] = useState(5);
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  const [starting, setStarting] = useState(false);
  const [startError, setStartError] = useState(null);

  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [attemptByQuestion, setAttemptByQuestion] = useState({});
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [assessmentFeedback, setAssessmentFeedback] = useState(null);
  const [lastResult, setLastResult] = useState(null);
  const [elapsed, setElapsed] = useState(0);

  const cameraRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    if (stage === 'running') {
      timerRef.current = setInterval(() => setElapsed(t => t + 1), 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [stage]);

  const startAssessment = async () => {
    setStarting(true);
    setStartError(null);
    try {
      const typeMeta = ASSESSMENT_TYPES.find(t => t.id === selectedType);
      const count = typeMeta.fixedCount || selectedCount;
      const res = await assessmentService.getAssessmentQuestions(selectedType, count, selectedDifficulty);
      const qs = res.data?.questions || [];
      if (qs.length === 0) {
        setStartError('No questions could be generated. Please ensure the backend is running.');
        return;
      }
      setQuestions(qs);
      setCurrent(0);
      setAttemptByQuestion({});
      setAssessmentFeedback(null);
      setLastResult(null);
      cameraRef.current?.clearOverlay();
      setElapsed(0);
      setStage('running');
    } catch (err) {
      console.error('Failed to start assessment:', err);
      setStartError(err.response?.data?.detail || 'Unable to start assessment. Please ensure backend server is running.');
    } finally {
      setStarting(false);
    }
  };

  const q = questions[current];
  const progress = questions.length ? ((current + 1) / questions.length) * 100 : 0;

  const analyzeGesture = async () => {
    if (!cameraRef.current?.isActive) {
      setAssessmentFeedback({
        type: 'error',
        message: 'Camera is not active. Please click "Start Camera" below.',
      });
      return;
    }

    setIsAnalyzing(true);
    setAssessmentFeedback(null);
    try {
      // Capture a short burst of consecutive frames for server-side majority voting
      const frames = await cameraRef.current.captureBurst(3, 160);
      const singleFrame = cameraRef.current.captureFrame();

      if (!frames.length && !singleFrame) {
        setAssessmentFeedback({
          type: 'error',
          message: 'Could not capture camera frame. Please ensure video preview is active and try again.',
        });
        setIsAnalyzing(false);
        return;
      }

      const payload = {
        expected_sign: q.target_sign,
        frames: frames.length ? frames : [singleFrame],
        image_data: singleFrame || (frames.length ? frames[0] : null),
      };

      const response = await assessmentService.evaluateSign(payload);
      const res = response.data;
      setLastResult(res);

      if (res.raw_landmarks) {
        cameraRef.current?.drawLandmarks(res.raw_landmarks, res.confidence);
      }

      setAttemptByQuestion(prev => ({ ...prev, [current]: res.attempt_id }));

      let type = 'warning';
      if (res.status === 'no_hand') type = 'error';
      else if (res.status === 'quality_issue') type = 'warning';
      else if (res.status === 'low_confidence') type = 'warning';
      else if (res.is_correct) type = 'success';

      setAssessmentFeedback({
        type,
        score: res.score,
        predicted: res.predicted_sign,
        expected: res.expected_sign,
        confidence: res.confidence,
        message: res.feedback || 'Sign evaluation complete.',
        suggestions: res.suggestions || [],
      });
    } catch (err) {
      console.error('Assessment gesture analysis failed:', err);
      const status = err.response?.status;
      setAssessmentFeedback({
        type: 'error',
        message: !err.response
          ? 'AI analysis service is unreachable. Please check backend connection.'
          : status === 401
          ? 'Session expired. Please log in again.'
          : err.response?.data?.detail || 'Failed to evaluate sign gesture.',
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const goNext = () => {
    setAssessmentFeedback(null);
    setLastResult(null);
    cameraRef.current?.clearOverlay();
    setCurrent(c => c + 1);
  };

  const finishAssessment = async () => {
    setStage('finishing');
    const attemptIds = Object.values(attemptByQuestion).filter(Boolean);
    if (attemptIds.length === 0) {
      setStartError('No evaluated questions were recorded for this assessment.');
      setStage('running');
      return;
    }
    try {
      const res = await assessmentService.submitAssessmentSession(selectedType, attemptIds);
      navigate(`/assessment-results?session=${res.data.id}`);
    } catch (err) {
      console.error('Failed to submit assessment session:', err);
      setStartError(err.response?.data?.detail || 'Failed to submit the assessment session.');
      setStage('running');
    }
  };

  if (stage === 'select') {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Breadcrumb items={[{ label: 'Assessments', path: '/assessments' }, { label: 'Start Assessment' }]} />
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-primary mb-1">
            <Sparkles size={14} /> AI GESTURE ASSESSMENT
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Choose Assessment Type</h1>
          <p className="text-sm text-slate-300 mt-1">
            Test your sign language skills with real-time camera tracking and live AI model scoring.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          {ASSESSMENT_TYPES.map((t) => {
            const Icon = t.icon;
            const isSelected = selectedType === t.id;
            return (
              <Card
                key={t.id}
                onClick={() => {
                  setSelectedType(t.id);
                  if (t.counts) setSelectedCount(t.counts[0]);
                }}
                className={`cursor-pointer bg-slate-900 border-2 transition-all p-5 rounded-2xl ${
                  isSelected ? 'border-primary shadow-[0_0_20px_rgba(20,201,197,0.2)]' : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div className={`h-11 w-11 rounded-xl flex items-center justify-center shrink-0 ${
                    isSelected ? 'bg-primary text-slate-950 font-bold' : 'bg-slate-800 text-slate-300'
                  }`}>
                    <Icon size={20} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-white text-base">{t.title}</h3>
                    <p className="text-xs text-slate-400 mt-1 leading-5">{t.description}</p>
                  </div>
                  {isSelected && <CheckCircle2 size={18} className="text-primary shrink-0" />}
                </div>
              </Card>
            );
          })}
        </div>

        {ASSESSMENT_TYPES.find(t => t.id === selectedType)?.counts && (
          <Card className="bg-slate-900 border-slate-800 p-5 rounded-2xl">
            <p className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">Number of Unique Questions</p>
            <div className="flex gap-2.5 flex-wrap">
              {ASSESSMENT_TYPES.find(t => t.id === selectedType).counts.map(c => (
                <button
                  key={c}
                  onClick={() => setSelectedCount(c)}
                  className={`px-5 py-2.5 rounded-xl text-sm font-bold border transition-all ${
                    selectedCount === c
                      ? 'bg-primary text-slate-950 border-primary shadow-[0_0_15px_rgba(20,201,197,0.25)]'
                      : 'bg-slate-950/60 text-slate-300 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {c} Questions
                </button>
              ))}
            </div>
            <p className="text-xs text-slate-500 mt-2">Each question presents a unique sign without duplicate prompts.</p>
          </Card>
        )}

        <Card className="bg-slate-900 border-slate-800 p-5 rounded-2xl">
          <p className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">Difficulty Filter</p>
          <div className="flex gap-2.5 flex-wrap">
            {DIFFICULTY_LEVELS.map(d => (
              <button
                key={d.id}
                onClick={() => setSelectedDifficulty(d.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                  selectedDifficulty === d.id
                    ? 'bg-primary text-slate-950 border-primary'
                    : 'bg-slate-950/60 text-slate-300 border-slate-800 hover:border-slate-700'
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
        </Card>

        {startError && (
          <div className="p-4 rounded-xl bg-red-950/80 border border-red-800 text-red-200 text-xs font-medium">
            {startError}
          </div>
        )}

        <Button
          className="w-full justify-center bg-primary hover:bg-primary-600 text-slate-950 font-bold shadow-[0_0_25px_rgba(20,201,197,0.25)]"
          size="lg"
          onClick={startAssessment}
          disabled={starting}
        >
          {starting ? (
            <><Loader2 size={18} className="animate-spin" /> Preparing question set...</>
          ) : (
            <>Start Assessment ({selectedType === 'single' ? '1' : selectedCount} Questions) <ArrowRight size={18} /></>
          )}
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Breadcrumb items={[{ label: 'Assessments', path: '/assessments' }, { label: 'Assessment In Progress' }]} />

      <Card className="bg-slate-900 border-slate-800 rounded-3xl p-6 sm:p-7 shadow-card">
        {/* Top Assessment Progress Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 pb-5 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-primary-900/60 border border-primary-500/30 text-primary">
                Question {current + 1} of {questions.length}
              </span>
              <span className="text-xs text-slate-400 capitalize">{selectedType} Mode</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-2">
              Show the sign for <span className="text-gradient">"{q?.target_sign}"</span>
            </h2>
            {SIGN_HINTS[q?.target_sign] && (
              <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                <Info size={13} className="text-primary shrink-0" />
                <span>{SIGN_HINTS[q.target_sign]}</span>
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-200 bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-xl">
              <Clock size={14} className="text-primary" /> {Math.floor(elapsed / 60)}:{String(elapsed % 60).padStart(2, '0')}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="h-2 bg-slate-950 rounded-full overflow-hidden mb-6 border border-slate-800/80">
          <div
            className="h-full bg-gradient-to-r from-primary to-violet-500 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Camera Viewport and Analysis Actions */}
        <div className="space-y-5">
          <CameraPanel
            ref={cameraRef}
            autoStart={true}
            statusChips={buildStatusChips(lastResult)}
          />

          <div className="flex gap-3">
            <Button
              onClick={analyzeGesture}
              disabled={isAnalyzing}
              className="flex-1 justify-center bg-primary hover:bg-primary-600 text-slate-950 font-bold py-3 text-sm shadow-[0_0_20px_rgba(20,201,197,0.25)]"
            >
              {isAnalyzing ? (
                <><Loader2 size={16} className="animate-spin" /> Analyzing gesture...</>
              ) : (
                <><Hand size={16} /> Evaluate Sign Gesture</>
              )}
            </Button>
          </div>

          {/* AI Feedback Display */}
          {assessmentFeedback && (
            <div
              className={`p-4 rounded-2xl text-xs font-medium border transition-all ${
                assessmentFeedback.type === 'success'
                  ? 'bg-emerald-950/70 border-emerald-800 text-emerald-200'
                  : assessmentFeedback.type === 'warning'
                  ? 'bg-amber-950/70 border-amber-800 text-amber-200'
                  : 'bg-red-950/70 border-red-800 text-red-200'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5 font-bold">
                <span className="text-sm flex items-center gap-1.5">
                  {assessmentFeedback.type === 'success' ? (
                    <><CheckCircle2 size={16} className="text-emerald-400" /> Correct Sign Recognized!</>
                  ) : (
                    <><AlertTriangle size={16} className="text-amber-400" /> Sign Feedback</>
                  )}
                </span>
                {assessmentFeedback.confidence !== undefined && (
                  <span className="bg-black/40 px-2.5 py-1 rounded-lg text-xs font-bold text-white border border-white/10">
                    Confidence: {Math.round((assessmentFeedback.confidence || 0) * 100)}%
                  </span>
                )}
              </div>
              <p className="text-slate-300 leading-relaxed">{assessmentFeedback.message}</p>
              {assessmentFeedback.suggestions?.length > 0 && (
                <ul className="mt-2 space-y-1 list-disc list-inside text-slate-400">
                  {assessmentFeedback.suggestions.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </Card>

      {startError && (
        <div className="p-4 rounded-xl bg-red-950/80 border border-red-800 text-red-200 text-xs font-medium">
          {startError}
        </div>
      )}

      {/* Question Navigation */}
      <div className="flex items-center justify-between pt-2">
        <span className="text-xs text-slate-400">
          {!attemptByQuestion[current]
            ? '⚠ Evaluate your gesture to enable the next question.'
            : '✓ Graded attempt saved. Ready to proceed.'}
        </span>

        {current < questions.length - 1 ? (
          <Button
            size="md"
            onClick={goNext}
            disabled={!attemptByQuestion[current]}
            className="bg-slate-800 hover:bg-slate-700 text-white font-bold px-5"
          >
            Next Question ({current + 2}/{questions.length}) <ChevronRight size={15} />
          </Button>
        ) : (
          <Button
            size="md"
            onClick={finishAssessment}
            disabled={!attemptByQuestion[current] || stage === 'finishing'}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6 shadow-[0_0_20px_rgba(16,185,129,0.3)]"
          >
            {stage === 'finishing' ? (
              <><Loader2 size={16} className="animate-spin" /> Submitting Assessment...</>
            ) : (
              <>Complete & View Results <Sparkles size={16} /></>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
