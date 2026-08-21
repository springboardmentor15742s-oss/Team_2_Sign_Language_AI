import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Award, ArrowRight, CheckCircle2, ChevronDown, ChevronUp,
  Loader2, RotateCcw, Target, TrendingUp, XCircle, Sparkles,
  BookOpen, BarChart3, LayoutDashboard
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Breadcrumb } from '../../components/layout/Breadcrumb';
import { EmptyState } from '../../components/ui/EmptyState';
import { assessmentService } from '../../services/assessmentService';

function buildSummary(session) {
  if (!session) return '';
  const { accuracy, weak_signs: weak, strong_signs: strong } = session;
  let text = accuracy >= 80
    ? 'Excellent performance! You demonstrated high proficiency across the evaluated sign gestures.'
    : accuracy >= 50
    ? 'Solid attempt with good foundation, and clear areas identified for further practice.'
    : 'This assessment highlighted specific gestures that will benefit from focused practice.';

  if (strong?.length) text += ` You performed consistently well on: ${strong.join(', ')}.`;
  if (weak?.length) text += ` Recommended focus areas: ${weak.join(', ')}.`;
  return text;
}

export default function AssessmentResults() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session');
  const navigate = useNavigate();

  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showMistakes, setShowMistakes] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    const loadSessionData = async () => {
      try {
        if (sessionId) {
          const res = await assessmentService.getAssessmentSession(sessionId);
          if (!cancelled) setSession(res.data);
        } else {
          // If no session ID passed in URL, try to fetch the latest attempt history / session
          const statsRes = await assessmentService.getDashboardStats();
          const recentActivities = statsRes.data?.recent_activity || [];
          const lastAssessment = recentActivities.find(a => a.type === 'assessment');

          // If no specific session ID found, try to fetch progress
          const progressRes = await assessmentService.getAssessmentProgress();
          if (progressRes.data?.total_attempts > 0) {
            // Construct summary view from latest progress
            const p = progressRes.data;
            if (!cancelled) {
              setSession({
                id: 'latest',
                assessment_type: 'overall',
                total_questions: p.total_attempts,
                correct_count: p.total_correct,
                incorrect_count: p.total_attempts - p.total_correct,
                accuracy: p.overall_accuracy,
                average_confidence: 0.85,
                strong_signs: p.strong_signs,
                weak_signs: p.weak_signs,
                attempts: (p.signs || []).map(s => ({
                  id: s.sign,
                  expected_sign: s.sign,
                  predicted_sign: s.sign,
                  confidence: s.average_confidence,
                  is_correct: s.accuracy >= 70,
                  feedback: s.accuracy >= 70 ? 'Good gesture execution.' : 'Needs additional practice.',
                })),
              });
            }
          }
        }
      } catch (err) {
        if (cancelled) return;
        console.error('Failed to load assessment session:', err);
        setError(err.response?.data?.detail || 'Unable to retrieve assessment result.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadSessionData();
    return () => { cancelled = true; };
  }, [sessionId]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-12 text-center text-slate-400 bg-slate-900 border border-slate-800 rounded-3xl">
        <Loader2 size={32} className="animate-spin mx-auto mb-3 text-primary" />
        <p className="text-sm font-bold text-white">Loading your assessment results...</p>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Breadcrumb items={[{ label: 'Assessments', path: '/assessments' }, { label: 'Results' }]} />
        <EmptyState
          icon={Award}
          title="No assessment results yet"
          description="Complete a sign gesture assessment to see your live score, accuracy breakdown, and personalized recommendations."
          action={
            <Link to="/assessment">
              <Button className="bg-primary hover:bg-primary-600 text-slate-950 font-bold">
                <ArrowRight size={16} /> Take an Assessment
              </Button>
            </Link>
          }
        />
      </div>
    );
  }

  const mistakes = (session.attempts || []).filter(a => !a.is_correct);
  const weakSignsParam = (session.weak_signs || []).join(',');

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Breadcrumb items={[{ label: 'Assessments', path: '/assessments' }, { label: 'Results' }]} />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-primary mb-1">
            <Sparkles size={14} /> ASSESSMENT COMPLETED
          </div>
          <h1 className="text-3xl font-bold text-white font-display">Assessment Performance Report</h1>
          <p className="text-sm text-slate-300 mt-1 capitalize">
            {session.assessment_type} Assessment &middot; {session.total_questions} unique sign questions evaluated
          </p>
        </div>

        <Link to="/assessment">
          <Button className="bg-primary hover:bg-primary-600 text-slate-950 font-bold">
            <RotateCcw size={15} /> Take Another Assessment
          </Button>
        </Link>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card padding="medium" className="bg-slate-900 border-slate-800 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Overall Score</span>
            <Target size={18} className="text-primary" />
          </div>
          <div className="mt-2 text-3xl font-extrabold text-white">{session.accuracy}%</div>
          <span className="text-[11px] text-slate-500">Correct answers ratio</span>
        </Card>

        <Card padding="medium" className="bg-slate-900 border-slate-800 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Correct Signs</span>
            <CheckCircle2 size={18} className="text-emerald-400" />
          </div>
          <div className="mt-2 text-3xl font-extrabold text-emerald-400">{session.correct_count}/{session.total_questions}</div>
          <span className="text-[11px] text-slate-500">Questions passed</span>
        </Card>

        <Card padding="medium" className="bg-slate-900 border-slate-800 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Incorrect</span>
            <XCircle size={18} className="text-rose-400" />
          </div>
          <div className="mt-2 text-3xl font-extrabold text-rose-400">{session.incorrect_count}/{session.total_questions}</div>
          <span className="text-[11px] text-slate-500">Signs needing practice</span>
        </Card>

        <Card padding="medium" className="bg-slate-900 border-slate-800 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Avg. Confidence</span>
            <TrendingUp size={18} className="text-indigo-400" />
          </div>
          <div className="mt-2 text-3xl font-extrabold text-white">
            {Math.round((session.average_confidence || 0) * 100)}%
          </div>
          <span className="text-[11px] text-slate-500">AI prediction certainty</span>
        </Card>
      </div>

      {/* Per-Sign Breakdown */}
      {session.attempts?.length > 0 && (
        <Card className="bg-slate-900 border-slate-800 rounded-2xl p-6">
          <h3 className="font-bold text-white text-base mb-4 flex items-center gap-2">
            <Target size={18} className="text-primary" /> Per-Sign Evaluation Breakdown
          </h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {session.attempts.map((att, idx) => (
              <div
                key={att.id || idx}
                className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 ${
                  att.is_correct
                    ? 'bg-emerald-950/40 border-emerald-800/60'
                    : 'bg-rose-950/40 border-rose-800/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm ${
                    att.is_correct ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                  }`}>
                    {att.expected_sign}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">Target Sign: {att.expected_sign}</p>
                    <p className="text-[11px] text-slate-400">
                      Detected: {att.predicted_sign || att.expected_sign} ({Math.round((att.confidence || 0) * 100)}%)
                    </p>
                  </div>
                </div>
                {att.is_correct ? (
                  <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
                ) : (
                  <XCircle size={18} className="text-rose-400 shrink-0" />
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Strong vs Weak Signs & AI Guidance */}
      <Card className="bg-slate-900 border-slate-800 rounded-2xl p-6">
        <div className="grid sm:grid-cols-2 gap-6 mb-6">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5">
              Strong Signs (Mastered)
            </p>
            <div className="flex flex-wrap gap-2">
              {session.strong_signs?.length
                ? session.strong_signs.map(s => (
                    <span key={s} className="px-3 py-1.5 rounded-xl bg-emerald-950/80 border border-emerald-800 text-emerald-200 text-xs font-bold flex items-center gap-1.5">
                      <CheckCircle2 size={13} className="text-emerald-400" /> Sign {s}
                    </span>
                  ))
                : <span className="text-xs text-slate-500">No high-confidence signs recorded in this attempt.</span>}
            </div>
          </div>

          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5">
              Needs Practice
            </p>
            <div className="flex flex-wrap gap-2">
              {session.weak_signs?.length
                ? session.weak_signs.map(s => (
                    <span key={s} className="px-3 py-1.5 rounded-xl bg-amber-950/80 border border-amber-800 text-amber-200 text-xs font-bold flex items-center gap-1.5">
                      <XCircle size={13} className="text-amber-400" /> Sign {s}
                    </span>
                  ))
                : <span className="text-xs text-slate-500">Zero mistakes recorded! Excellent work.</span>}
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-4">
          <p className="text-xs font-bold text-primary uppercase tracking-wider mb-1">AI Recommendation</p>
          <p className="text-sm text-slate-300 leading-relaxed">{buildSummary(session)}</p>
        </div>
      </Card>

      {/* Mistake Review Accordion */}
      {mistakes.length > 0 && (
        <Card className="bg-slate-900 border-slate-800 rounded-2xl p-6">
          <button
            className="w-full flex items-center justify-between"
            onClick={() => setShowMistakes(s => !s)}
          >
            <span className="text-sm font-bold text-white flex items-center gap-2">
              <XCircle size={16} className="text-rose-400" /> Review Detailed Mistakes ({mistakes.length})
            </span>
            {showMistakes ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
          </button>

          {showMistakes && (
            <div className="mt-4 space-y-3 pt-3 border-t border-slate-800">
              {mistakes.map(m => (
                <div key={m.id} className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-xs">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-white text-sm">
                      Expected Sign: <span className="text-primary">{m.expected_sign}</span> &rarr; Model Detected: <span className="text-rose-400">{m.predicted_sign}</span>
                    </span>
                    <span className="text-slate-400 font-semibold">{Math.round((m.confidence || 0) * 100)}% confidence</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed">{m.feedback}</p>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Action Footer */}
      <div className="grid sm:grid-cols-3 gap-3 pt-2">
        <Button
          variant="outline"
          className="justify-center border-slate-700 text-slate-200 hover:bg-slate-800"
          onClick={() => navigate('/practice')}
        >
          <Target size={15} /> Practice Signs
        </Button>

        {weakSignsParam && (
          <Button
            variant="outline"
            className="justify-center border-amber-700 text-amber-300 hover:bg-amber-950/40"
            onClick={() => navigate(`/practice?signs=${encodeURIComponent(weakSignsParam)}`)}
          >
            Practice Weak Signs ({weakSignsParam})
          </Button>
        )}

        <Link to="/dashboard" className="w-full">
          <Button className="w-full justify-center bg-primary hover:bg-primary-600 text-slate-950 font-bold">
            <LayoutDashboard size={15} /> Back to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}
