import { useEffect, useState } from 'react';
import { Award, Trophy, Flame, Sparkles, BookOpen, Lock, Loader2 } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Breadcrumb } from '../../components/layout/Breadcrumb';
import { assessmentService } from '../../services/assessmentService';

const ICONS = { Award, Trophy, Flame, Sparkles, BookOpen };

const TABS = [
  { id: 'all', label: 'All' },
  { id: 'unlocked', label: 'Unlocked' },
  { id: 'locked', label: 'Locked' },
];

export default function Achievements() {
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState('all');

  useEffect(() => {
    let active = true;
    assessmentService.getAchievements()
      .then(res => active && setAchievements(res.data))
      .catch(err => {
        console.error('Failed to load achievements:', err);
        active && setError(err.response?.data?.detail || 'Unable to load achievements.');
      })
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, []);

  const filtered = achievements.filter(a => {
    if (tab === 'unlocked') return a.unlocked;
    if (tab === 'locked') return !a.unlocked;
    return true;
  });
  const unlockedCount = achievements.filter(a => a.unlocked).length;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Breadcrumb items={[{ label: 'Achievements' }]} />

      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2"><Trophy size={22} className="text-violet-400" /> Achievements</h1>
          <p className="text-sm text-slate-400 mt-1">
            {loading ? 'Loading...' : `${unlockedCount} of ${achievements.length} unlocked -- earned from your real practice and assessment activity.`}
          </p>
        </div>
        <div className="flex gap-1.5 rounded-xl bg-slate-900 border border-slate-800 p-1">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                tab === t.id ? 'bg-primary text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-400 bg-slate-900 border border-slate-800 rounded-2xl">
          <Loader2 size={24} className="animate-spin mx-auto mb-3 text-primary" /> Loading achievements...
        </div>
      ) : error ? (
        <Card className="bg-red-950/80 border-red-800 text-red-200 text-sm">{error}</Card>
      ) : filtered.length === 0 ? (
        <Card className="bg-slate-900 border-slate-800 text-center py-12">
          <p className="text-sm text-slate-400">No achievements in this view yet.</p>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((a) => {
            const Icon = ICONS[a.icon] || Award;
            return (
              <Card
                key={a.id}
                className={`bg-slate-900 border-slate-800 transition-all ${a.unlocked ? 'hover:border-violet-700' : 'opacity-60'}`}
              >
                <div className="flex items-start gap-4">
                  <div className={`h-14 w-14 rounded-2xl flex items-center justify-center shrink-0 ${
                    a.unlocked
                      ? 'bg-gradient-to-br from-primary/30 to-violet-500/30 text-violet-300 border border-violet-500/40 shadow-[0_0_18px_rgba(124,108,242,0.25)]'
                      : 'bg-slate-800 text-slate-600'
                  }`}>
                    {a.unlocked ? <Icon size={26} /> : <Lock size={22} />}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-white text-sm">{a.title}</h3>
                    <p className="text-xs text-slate-400 mt-1 leading-5">{a.description}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-[11px] font-bold text-amber-400">+{a.xp_reward} XP</span>
                      {a.unlocked && a.earned_at && (
                        <span className="text-[11px] text-slate-500">&middot; {new Date(a.earned_at).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
