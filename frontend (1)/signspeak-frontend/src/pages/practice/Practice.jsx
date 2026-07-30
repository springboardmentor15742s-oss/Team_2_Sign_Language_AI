import { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, SkipForward, Hand, Info, ChevronRight } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Breadcrumb } from '../../components/layout/Breadcrumb';
import { CameraPanel } from '../../components/practice/CameraPanel';
import { ConfidenceMeter } from '../../components/practice/ConfidenceMeter';
import { FeedbackPanel } from '../../components/practice/FeedbackPanel';

const PRACTICE_SIGNS = [
  { id: 1, name: 'Letter A', instruction: 'Make a fist with your thumb resting on the side of your index finger.' },
  { id: 2, name: 'Letter B', instruction: 'Hold your hand flat with all fingers together and thumb tucked in.' },
  { id: 3, name: 'Letter C', instruction: 'Curve your fingers and thumb to form a C shape.' },
];

export default function Practice() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [timer, setTimer] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [confidence, setConfidence] = useState(0);
  const intervalRef = useRef(null);

  const currentSign = PRACTICE_SIGNS[currentIndex];

  useEffect(() => {
    if (!isPaused) {
      intervalRef.current = setInterval(() => setTimer(t => t + 1), 1000);
    }
    return () => clearInterval(intervalRef.current);
  }, [isPaused]);

  const formatTime = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  const simulateFeedback = () => {
    const score = Math.floor(Math.random() * 40) + 50;
    setConfidence(score);
    setFeedback({
      type: score >= 70 ? 'success' : score >= 50 ? 'warning' : 'error',
      title: score >= 70 ? 'Great job!' : score >= 50 ? 'Getting there' : 'Keep practicing',
      message: score >= 70 ? 'Your hand shape looks accurate. Try to keep your fingers steady.' : 'Focus on the hand shape. Watch the reference carefully and try again.',
    });
  };

  const nextSign = () => {
    setCurrentIndex(i => (i + 1) % PRACTICE_SIGNS.length);
    setFeedback(null);
    setConfidence(0);
  };

  const reset = () => {
    setTimer(0);
    setFeedback(null);
    setConfidence(0);
    setIsPaused(false);
  };

  return (
    <div className="max-w-5xl mx-auto">
      <Breadcrumb items={[{ label: 'Practice' }]} className="mb-6" />
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Practice Workspace</h1>
          <p className="text-sm text-gray-500 mt-1">Session: {formatTime(timer)}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={() => setIsPaused(!isPaused)}>
            {isPaused ? <Play size={14} /> : <Pause size={14} />} {isPaused ? 'Resume' : 'Pause'}
          </Button>
          <Button size="sm" variant="outline" onClick={reset}><RotateCcw size={14} /> Reset</Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 space-y-6">
          <CameraPanel />
          {feedback && <FeedbackPanel feedback={feedback} />}
          <ConfidenceMeter value={confidence} />
        </div>
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <Hand size={18} className="text-primary" />
              <h3 className="font-semibold text-gray-900">Current Sign</h3>
            </div>
            <div className="bg-primary-50 rounded-xl p-4 mb-4">
              <p className="text-lg font-bold text-primary mb-1">{currentSign.name}</p>
              <p className="text-sm text-gray-600">{currentSign.instruction}</p>
            </div>
            <div className="flex items-start gap-2 text-xs text-gray-500 bg-gray-50 rounded-lg p-3">
              <Info size={14} className="shrink-0 mt-0.5" />
              <p>Position your hand clearly in the camera frame. Good lighting helps the AI detect your signs accurately.</p>
            </div>
          </Card>
          <Card>
            <h3 className="font-semibold text-gray-900 mb-4">Actions</h3>
            <div className="space-y-2">
              <Button className="w-full" onClick={simulateFeedback}><Hand size={16} /> Check My Sign</Button>
              <Button variant="outline" className="w-full" onClick={nextSign}><SkipForward size={16} /> Next Sign</Button>
            </div>
          </Card>
          <Card>
            <h3 className="font-semibold text-gray-900 mb-3">Practice Queue</h3>
            <div className="space-y-2">
              {PRACTICE_SIGNS.map((sign, i) => (
                <div key={sign.id} className={`flex items-center gap-3 p-2 rounded-lg text-sm ${i === currentIndex ? 'bg-primary-50 text-primary font-medium' : 'text-gray-600'}`}>
                  <span className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs font-medium shrink-0">{i + 1}</span>
                  <span>{sign.name}</span>
                  {i === currentIndex && <ChevronRight size={14} className="ml-auto" />}
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
