import { useEffect, useRef, useState } from 'react';
import { ArrowRight, CheckCircle2, CircleAlert, Clock3, Hand, Info, Pause, Play, RotateCcw, Sparkles, Video, Zap } from 'lucide-react';
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
    if (!isPaused) intervalRef.current = setInterval(() => setTimer(t => t + 1), 1000);
    return () => clearInterval(intervalRef.current);
  }, [isPaused]);

  const formatTime = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  const simulateFeedback = () => {
    const score = Math.floor(Math.random() * 40) + 50;
    setConfidence(score);
    setFeedback({
      type: score >= 70 ? 'success' : score >= 50 ? 'warning' : 'error',
      title: score >= 70 ? 'Strong attempt' : score >= 50 ? 'Almost there' : 'Keep practicing',
      message: score >= 70
        ? 'Your hand shape is looking accurate. Keep the movement steady for a cleaner sign.'
        : 'Focus on hand shape and position. Compare your gesture with the reference and try again.',
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
    <div className="max-w-7xl mx-auto space-y-6">
      <Breadcrumb items={[{ label: 'Practice' }]} />

      <section className="rounded-[26px] bg-slate-950 text-white p-6 lg:p-7 shadow-soft">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-blue-200"><Sparkles size={14} /> AI gesture assessment workspace</div>
            <h1 className="mt-2 text-2xl lg:text-3xl font-bold">Practice & get instant feedback</h1>
            <p className="mt-2 text-sm text-slate-400">Position your hand clearly and use the camera panel to evaluate the current sign.</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2 text-sm text-slate-300"><Clock3 size={15} /> {formatTime(timer)}</div>
            <Button variant="ghost" onClick={() => setIsPaused(!isPaused)} className="text-white hover:bg-white/10 hover:text-white">
              {isPaused ? <Play size={15} /> : <Pause size={15} />} {isPaused ? 'Resume' : 'Pause'}
            </Button>
            <Button variant="ghost" onClick={reset} className="text-white hover:bg-white/10 hover:text-white"><RotateCcw size={15} /> Reset</Button>
          </div>
        </div>
      </section>

      <div className="grid xl:grid-cols-[1.45fr_0.8fr] gap-6 items-start">
        <div className="space-y-5">
          <Card padding="none" className="overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-primary-50 text-primary flex items-center justify-center"><Video size={18} /></div>
                <div><p className="text-sm font-bold text-slate-900">Live practice camera</p><p className="text-xs text-slate-400">Hand tracking & pose analysis</p></div>
              </div>
              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1.5 rounded-full"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Ready</span>
            </div>
            <div className="p-4"><CameraPanel /></div>
          </Card>

          <div className="grid md:grid-cols-2 gap-5">
            <Card>
              <div className="flex items-center gap-3 mb-4"><Zap size={18} className="text-amber-500" /><h3 className="font-bold text-slate-900">AI confidence</h3></div>
              <ConfidenceMeter value={confidence} />
            </Card>
            {feedback ? <FeedbackPanel feedback={feedback} /> : (
              <Card className="border-dashed">
                <div className="h-full flex flex-col justify-center">
                  <div className="h-10 w-10 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center"><Sparkles size={19} /></div>
                  <h3 className="mt-3 font-bold text-slate-900">Live feedback appears here</h3>
                  <p className="mt-1 text-sm text-slate-500">Check your sign to receive correction guidance and improvement tips.</p>
                </div>
              </Card>
            )}
          </div>
        </div>

        <div className="space-y-5">
          <Card padding="large">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2"><Hand size={18} className="text-primary" /><span className="text-xs font-bold uppercase tracking-wider text-primary">Target sign</span></div>
              <span className="text-xs font-semibold text-slate-400">{currentIndex + 1} / {PRACTICE_SIGNS.length}</span>
            </div>
            <h2 className="mt-4 text-2xl font-bold text-slate-950">{currentSign.name}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">{currentSign.instruction}</p>
            <div className="mt-5 rounded-2xl bg-blue-50 border border-blue-100 p-4 flex gap-3">
              <Info size={17} className="text-primary mt-0.5 shrink-0" />
              <p className="text-xs leading-5 text-blue-900">Keep your hand inside the frame, use good lighting, and make the gesture slowly.</p>
            </div>
            <div className="mt-5 space-y-2">
              <Button className="w-full" onClick={simulateFeedback}><Hand size={16} /> Analyze my sign</Button>
              <Button variant="outline" className="w-full" onClick={nextSign}>Next sign <ArrowRight size={16} /></Button>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between mb-4"><h3 className="font-bold text-slate-900">Practice queue</h3><span className="text-xs text-slate-400">Alphabet</span></div>
            <div className="space-y-2">
              {PRACTICE_SIGNS.map((sign, i) => (
                <button key={sign.id} onClick={() => { setCurrentIndex(i); setFeedback(null); setConfidence(0); }} className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all ${i === currentIndex ? 'bg-primary-50 border border-primary-100' : 'hover:bg-slate-50 border border-transparent'}`}>
                  <span className={`h-7 w-7 rounded-lg flex items-center justify-center text-xs font-bold ${i === currentIndex ? 'bg-primary text-white' : 'bg-slate-100 text-slate-500'}`}>{i + 1}</span>
                  <span className={`text-sm font-semibold flex-1 ${i === currentIndex ? 'text-primary' : 'text-slate-700'}`}>{sign.name}</span>
                  {i === currentIndex ? <CheckCircle2 size={16} className="text-primary" /> : <CircleAlert size={15} className="text-slate-300" />}
                </button>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
