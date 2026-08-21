import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Hand, ListChecks, Type, Shuffle, ArrowRight, BarChart3, Loader2, TrendingUp } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import { Breadcrumb } from '../../components/layout/Breadcrumb';
import { assessmentService } from '../../services/assessmentService';

const TYPE_CARDS = [
  { icon: Hand, title: 'Single Sign Recognition', description: 'Show one target sign and get an instant scored result.' },
  { icon: ListChecks, title: 'Multiple Sign Quiz', description: 'A short randomized quiz across several different signs.' },
  { icon: Type, title: 'Alphabet Assessment', description: 'Recognize signs across the full ASL alphabet, A through Z.' },
  { icon: Shuffle, title: 'Mixed Sign Assessment', description: 'Randomized signs from the full supported class list.' },
];

export default function Assessments() {
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    assessmentService.getAssessmentProgress()
      .then(res => !cancelled && setProgress(res.data))
      .catch(err => console.error('Failed to load assessment progress:', err))
      .finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Breadcrumb items={[{ label: 'Assessments' }]} />
      <div>
        <h1 className="text-2xl font-bold text-white">Assessments</h1>
        <p className="text-sm text-slate-300 mt-1">Real camera-based sign recognition, scored live by the trained model.</p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {TYPE_CARDS.map((t) => {
          const Icon = t.icon;
          return (
            <Card key={t.title} className="bg-slate-900 border-slate-800">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary-500/20 text-primary flex items-center justify-center shrink-0">
                  <Icon size={18} />
                </div>
                <div>
                  <h3 className="font-semibold text-white text-sm">{t.title}</h3>
                  <p className="text-xs text-slate-400 mt-1 leading-5">{t.description}</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <Link to="/assessment">
        <Button className="w-full" size="lg">Start an Assessment <ArrowRight size={16} /></Button>
      </Link>

      <Card className="mt-8 bg-slate-900 border-slate-800">
        <h3 className="font-semibold text-white mb-4 flex items-center gap-2"><BarChart3 size={16} className="text-primary" /> Your Progress</h3>
        {loading ? (
          <div className="flex items-center gap-2 text-sm text-slate-400 py-6 justify-center">
            <Loader2 size={16} className="animate-spin" /> Loading progress...
          </div>
        ) : !progress || progress.total_attempts === 0 ? (
          <EmptyState icon={BarChart3} title="No assessments taken yet" description="Complete an assessment to see your results and track your progress." />
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <p className="text-2xl font-bold text-white">{progress.total_attempts}</p>
                <p className="text-[11px] text-slate-400 mt-1">Attempts</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <p className="text-2xl font-bold text-emerald-400">{progress.overall_accuracy}%</p>
                <p className="text-[11px] text-slate-400 mt-1">Overall Accuracy</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <p className="text-2xl font-bold text-white">{progress.strong_signs.length}</p>
                <p className="text-[11px] text-slate-400 mt-1">Signs Mastered</p>
              </div>
            </div>
            {progress.weak_signs.length > 0 && (
              <div className="flex items-center justify-between p-3 rounded-xl bg-amber-950/40 border border-amber-900/60">
                <span className="text-xs text-amber-200 flex items-center gap-2">
                  <TrendingUp size={14} /> Needs practice: {progress.weak_signs.join(', ')}
                </span>
                <Link to={`/practice?signs=${encodeURIComponent(progress.weak_signs.join(','))}`}>
                  <Button size="sm" variant="outline" className="border-amber-700 text-amber-200 hover:bg-amber-900/40">Practice</Button>
                </Link>
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}
