import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, BookOpen, ClipboardCheck, TrendingUp, ArrowRight, LogIn, LogOut, Award, Play, Loader2 } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Breadcrumb } from '../../components/layout/Breadcrumb';
import { EmptyState } from '../../components/ui/EmptyState';
import { adminService } from '../../services/adminService';

const ACTION_ICONS = {
  LOGIN: { icon: LogIn, tone: 'text-emerald-400' },
  LOGOUT: { icon: LogOut, tone: 'text-slate-400' },
  ASSESSMENT_STARTED: { icon: Play, tone: 'text-cyan-400' },
  ASSESSMENT_COMPLETED: { icon: Award, tone: 'text-violet-400' },
  SIGN_EVALUATED: { icon: ClipboardCheck, tone: 'text-cyan-400' },
  MODEL_EVALUATION_RUN: { icon: TrendingUp, tone: 'text-amber-400' },
};

function StatCard({ icon: Icon, label, value, tone }) {
  return (
    <Card className="bg-slate-900 border-slate-800">
      <div className="flex items-start justify-between">
        <div><p className="text-sm text-slate-400">{label}</p><p className="text-2xl font-bold text-white mt-1">{value}</p></div>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${tone}`}><Icon size={20} /></div>
      </div>
    </Card>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    Promise.allSettled([adminService.getDashboard(), adminService.getActivity(12)]).then((results) => {
      if (!active) return;
      setStats(results[0].status === 'fulfilled' ? results[0].value.data : null);
      setActivity(results[1].status === 'fulfilled' ? results[1].value.data : []);
      setLoading(false);
    });
    return () => { active = false; };
  }, []);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Breadcrumb items={[{ label: 'Admin' }]} />
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
        <div className="flex gap-2">
          <Link to="/admin/users" className="text-xs font-semibold text-primary flex items-center gap-1">Users & Activity <ArrowRight size={13} /></Link>
          <Link to="/admin/model-evaluation" className="text-xs font-semibold text-primary flex items-center gap-1">Model Evaluation <ArrowRight size={13} /></Link>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-400 bg-slate-900 border border-slate-800 rounded-2xl">
          <Loader2 size={24} className="animate-spin mx-auto mb-3 text-primary" />
          Loading platform stats...
        </div>
      ) : (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard icon={Users} label="Total Users" value={stats?.total_users ?? '—'} tone="bg-primary-500/10 text-primary" />
            <StatCard icon={BookOpen} label="Courses" value={stats?.courses ?? '—'} tone="bg-emerald-500/10 text-emerald-400" />
            <StatCard icon={ClipboardCheck} label="Sign Assessments Completed" value={stats?.sign_assessments_completed ?? '—'} tone="bg-amber-500/10 text-amber-400" />
            <StatCard icon={TrendingUp} label="Total Sign Attempts" value={stats?.sign_attempts_total ?? '—'} tone="bg-violet-500/10 text-violet-400" />
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <Card className="bg-slate-900 border-slate-800" padding="small">
              <p className="text-xs text-slate-400">Active Users</p>
              <p className="text-xl font-bold text-white mt-1">{stats?.active_users ?? '—'} / {stats?.total_users ?? '—'}</p>
            </Card>
            <Card className="bg-slate-900 border-slate-800" padding="small">
              <p className="text-xs text-slate-400">Learners</p>
              <p className="text-xl font-bold text-white mt-1">{stats?.learners ?? '—'}</p>
            </Card>
            <Card className="bg-slate-900 border-slate-800" padding="small">
              <p className="text-xs text-slate-400">Instructors / Trainers</p>
              <p className="text-xl font-bold text-white mt-1">{(stats?.instructors ?? 0) + (stats?.accessibility_trainers ?? 0)}</p>
            </Card>
          </div>

          <Card className="bg-slate-900 border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-white">Recent Platform Activity</h3>
              <Link to="/admin/users" className="text-xs font-semibold text-primary">View all</Link>
            </div>
            {activity.length === 0 ? (
              <EmptyState icon={TrendingUp} title="No activity yet" description="Platform activity (logins, assessments, evaluations) will appear here." />
            ) : (
              <div className="space-y-2">
                {activity.map((a, i) => {
                  const meta = ACTION_ICONS[a.action] || { icon: TrendingUp, tone: 'text-slate-400' };
                  const Icon = meta.icon;
                  return (
                    <div key={i} className="flex items-center gap-3 rounded-xl border border-slate-800 p-3">
                      <div className={`h-8 w-8 rounded-lg bg-slate-800 flex items-center justify-center shrink-0 ${meta.tone}`}><Icon size={15} /></div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-slate-200 truncate">
                          {a.actor_name} &middot; <span className="font-mono text-xs">{a.action}</span>
                        </p>
                        {a.meta && <p className="text-xs text-slate-500 truncate">{a.meta}</p>}
                      </div>
                      <span className="text-[11px] text-slate-500 shrink-0">{a.created_at ? new Date(a.created_at).toLocaleString() : ''}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  );
}
