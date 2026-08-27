import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Flag, Clock } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Breadcrumb } from '../../components/layout/Breadcrumb';

const QUESTIONS = [
  { id: 1, text: 'Demonstrate the sign for letter "A"', type: 'camera' },
  { id: 2, text: 'Which hand shape represents the letter "B"?', type: 'multiple', options: ['Fist with thumb out', 'Flat hand, fingers together', 'Peace sign', 'Thumbs up'] },
  { id: 3, text: 'Show the sign for "Hello"', type: 'camera' },
  { id: 4, text: 'In ASL, how do you sign the number 5?', type: 'multiple', options: ['Closed fist', 'Open hand, fingers spread', 'Three fingers up', 'Peace sign'] },
];

export default function Assessment() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(900);

  const q = QUESTIONS[current];
  const progress = ((current + 1) / QUESTIONS.length) * 100;

  const selectAnswer = (ans) => {
    setAnswers(prev => ({ ...prev, [q.id]: ans }));
  };

  const submit = () => {
    navigate('/assessment-results');
  };

  return (
    <div className="max-w-3xl mx-auto">
      <Breadcrumb items={[{ label: 'Assessments', path: '/assessments' }, { label: 'Assessment' }]} className="mb-6" />
      <Card className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm text-gray-500">Question {current + 1} of {QUESTIONS.length}</p>
            <h2 className="text-lg font-semibold text-gray-900 mt-1">{q.text}</h2>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-gray-500 bg-gray-50 px-3 py-1.5 rounded-lg">
            <Clock size={14} /> {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
          </div>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-6">
          <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${progress}%` }} />
        </div>

        {q.type === 'multiple' ? (
          <div className="space-y-2">
            {q.options.map((opt, i) => (
              <button key={i} onClick={() => selectAnswer(opt)}
                className={`w-full p-4 rounded-xl border-2 text-left transition-all ${answers[q.id] === opt ? 'border-primary bg-primary-50' : 'border-gray-100 hover:border-gray-200'}`}>
                <span className="font-medium text-gray-900">{opt}</span>
              </button>
            ))}
          </div>
        ) : (
          <div className="aspect-video bg-gray-900 rounded-xl flex items-center justify-center">
            <div className="text-center text-white">
              <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center mx-auto mb-3">
                <Flag size={28} />
              </div>
              <p className="text-sm font-medium">Camera Required</p>
              <p className="text-xs text-gray-400 mt-1">Show your sign to the camera</p>
            </div>
          </div>
        )}
      </Card>

      <div className="flex items-center justify-between">
        <Button variant="outline" size="sm" onClick={() => setCurrent(c => Math.max(0, c - 1))} disabled={current === 0}>
          <ChevronLeft size={14} /> Previous
        </Button>
        {current < QUESTIONS.length - 1 ? (
          <Button size="sm" onClick={() => setCurrent(c => c + 1)}>
            Next <ChevronRight size={14} />
          </Button>
        ) : (
          <Button size="sm" onClick={submit}>Submit Assessment</Button>
        )}
      </div>
    </div>
  );
}
