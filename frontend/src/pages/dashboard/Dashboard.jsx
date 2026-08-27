import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight, Award, BarChart3, BookOpen, CalendarDays, CheckCircle2,
  ChevronRight, Flame, Hand, PlayCircle, Sparkles, Target, Trophy, Video, Zap
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Breadcrumb } from '../../components/layout/Breadcrumb';
import { useAuth } from '../../hooks/useAuth';
import { profileService } from '../../services/profileService';
import { reportService } from '../../services/reportService';
import { courseService } from '../../services/courseService';
import { notificationService } from '../../services/notificationService';
import apiClient from '../../services/apiClient';

const scoring = [
  ['Gesture Accuracy', 40],
  ['Assessment Performance', 25],
  ['Lesson Completion', 15],
  ['Practice Consistency', 10],
  ['Skill Improvement Rate', 10],
];

const quickActions = [
  { title: 'Continue Learning', path: '/courses', icon: PlayCircle, tone: 'teal' },
  { title: 'Practice Signs', path: '/practice', icon: Video, tone: 'cyan' },
  { title: 'Take Assessment', path: '/assessments', icon: Target, tone: 'violet' },
  { title: 'Browse Courses', path: '/courses', icon: BookOpen, tone: 'amber' },
];

function Stat({ icon: Icon, value, label, tone }) {
  const tones = {
    teal: 'bg-[#0b3c3d] text-[#20d8d3]',
    amber: 'bg-[#3a2d14] text-amber-400',
    cyan: 'bg-[#0d3447] text-cyan-400',
    violet: 'bg-[#28234b] text-violet-400',
  };
  return (
    <Card padding="small" className="min-h-[142px] flex flex-col justify-between">
      <div className={`h-11 w-11 rounded-xl flex items-center justify-center ${tones[tone]}`}><Icon size={21} /></div>
      <div>
        <p className="text-2xl font-bold text-white">{value}</p>
        <p className="mt-1 text-xs text-slate-400">{label}</p>
      </div>
    </Card>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState({ learning: null, assessment: null, accuracy: null, progress: null, practice: [], courses: [], enrolled: [], notifications: [] });

  useEffect(() => {
    let active = true;
    Promise.allSettled([
      profileService.getProfile(),
      reportService.getLearningReport(),
      reportService.getAssessmentReport(),
      reportService.getAccuracyReport(),
      reportService.getProgressReport(),
      apiClient.get('/practice/sessions'),
      courseService.getCourses({ limit: 6 }),
      courseService.getEnrolled(),
      notificationService.getNotifications(),
    ]).then((results) => {
      if (!active) return;
      const value = (i) => results[i].status === 'fulfilled' ? results[i].value.data : null;
      setData({
        learning: value(1), assessment: value(2), accuracy: value(3), progress: value(4),
        practice: value(5) || [], courses: value(6) || [], enrolled: value(7) || [], notifications: value(8) || [],
      });
    });
    return () => { active = false; };
  }, []);

  const weekly = useMemo(() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const counts = days.map((day) => ({ day, minutes: 0 }));
    const now = new Date();
    (Array.isArray(data.practice) ? data.practice : []).forEach((session) => {
      const raw = session.started_at || session.created_at;
      if (!raw) return;
      const d = new Date(raw);
      const diff = Math.floor((new Date(now.getFullYear(), now.getMonth(), now.getDate()) - new Date(d.getFullYear(), d.getMonth(), d.getDate())) / 86400000);
      if (diff >= 0 && diff < 7) {
        const index = (d.getDay() + 6) % 7;
        counts[index].minutes += Math.max(1, Math.round((session.duration_seconds || 0) / 60));
      }
    });
    return counts;
  }, [data.practice]);

  const maxMinutes = Math.max(4, ...weekly.map((d) => d.minutes));
  const accuracy = Math.round(Number(data.accuracy?.accuracy_percent || 0));
  const progress = data.learning?.courses?.length ? Math.round(data.learning.courses.reduce((a, c) => a + Number(c.progress_percent || 0), 0) / data.learning.courses.length) : 0;
  const achievements = 0;
  const name = user?.full_name || user?.name || 'Learner';

  return (
    <div className="max-w-[1400px] mx-auto space-y-6">
      <Breadcrumb items={[{ label: 'Dashboard' }]} />

      <section className="relative overflow-hidden rounded-2xl border border-slate-800 bg-[#111827] px-6 py-7 lg:px-9 lg:py-8 shadow-card">
        <div className="absolute -right-24 -top-28 h-72 w-72 rounded-full bg-[#0fc8c4]/20 blur-3xl" />
        <div className="absolute right-1/3 -bottom-32 h-64 w-64 rounded-full bg-violet-600/10 blur-3xl" />
        <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
          <div>
            <div className="flex items-center gap-2 text-[#20d8d3] text-xs font-semibold uppercase tracking-wider"><Sparkles size={15} /> Daily Motivation</div>
            <h1 className="mt-3 text-3xl lg:text-[32px] font-bold tracking-tight text-white">Hello, {name}! <span>👋</span></h1>
            <p className="mt-2 max-w-2xl text-sm lg:text-base text-slate-400 leading-6">Welcome to SignSpeak AI. Every sign you learn bridges a gap.<br className="hidden sm:block" /> Ready to begin your journey?</p>
          </div>
          <Link to="/courses" className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#16c8c4] hover:bg-[#20d8d3] text-slate-950 px-6 py-3 text-sm font-bold shadow-[0_0_30px_rgba(20,201,197,0.18)] transition-colors">
            Start Learning <ArrowRight size={17} />
          </Link>
        </div>
      </section>

      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}><Stat icon={Zap} value={user?.xp_points ?? 0} label="Total XP" tone="teal" /></motion.div>
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .05 }}><Stat icon={Flame} value={`${user?.current_streak ?? 0} days`} label="Current Streak" tone="amber" /></motion.div>
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .1 }}><Stat icon={Target} value={`${accuracy}%`} label="Gesture Accuracy" tone="cyan" /></motion.div>
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .15 }}><Stat icon={Trophy} value={achievements} label="Achievements" tone="violet" /></motion.div>
      </div>

      <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4">
        {quickActions.map(({ title, path, icon: Icon, tone }) => (
          <Link key={title} to={path} className="group flex items-center gap-4 rounded-2xl border border-slate-800 bg-[#151a24] p-4 hover:border-slate-700 hover:bg-[#181f2b] transition-all">
            <div className={`h-11 w-11 rounded-xl flex items-center justify-center ${tone === 'violet' ? 'bg-violet-500/10 text-violet-400' : tone === 'amber' ? 'bg-amber-500/10 text-amber-400' : 'bg-cyan-500/10 text-cyan-400'}`}><Icon size={19} /></div>
            <span className="flex-1 text-sm font-semibold text-slate-200">{title}</span><ChevronRight size={17} className="text-slate-600 group-hover:text-slate-300" />
          </Link>
        ))}
      </div>

      <div className="grid xl:grid-cols-[1.6fr_0.8fr] gap-6">
        <Card padding="large">
          <div className="flex items-start justify-between mb-6">
            <div><div className="flex items-center gap-2 text-sm font-bold text-white"><BarChart3 size={17} className="text-[#20d8d3]" /> Weekly Activity</div><p className="mt-1 text-xs text-slate-500">Your practice minutes this week</p></div>
            <Link to="/reports" className="text-xs font-semibold text-[#20d8d3]">View analytics</Link>
          </div>
          <div className="h-52 flex items-end gap-3 sm:gap-5 border-b border-slate-800">
            {weekly.map((item) => (
              <div key={item.day} className="flex-1 h-full flex flex-col justify-end items-center gap-2">
                <span className="text-[10px] text-slate-500">{item.minutes || ''}</span>
                <div className="w-full max-w-9 rounded-t-md bg-gradient-to-t from-[#0d7775] to-[#22d7d2] transition-all" style={{ height: `${Math.max(4, (item.minutes / maxMinutes) * 72)}%` }} />
                <span className="text-[10px] text-slate-500 pb-2">{item.day}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card padding="large">
          <div className="flex items-center gap-3"><div className="h-10 w-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center"><Target size={19} /></div><div><h2 className="font-bold text-white">Today's Goal</h2><p className="text-xs text-slate-500">Daily learning target</p></div></div>
          <div className="flex justify-center py-8">
            <div className="relative h-40 w-40 rounded-full flex items-center justify-center" style={{ background: `conic-gradient(#16c8c4 ${Math.min(progress, 100) * 3.6}deg, #252d3b 0deg)` }}>
              <div className="h-32 w-32 rounded-full bg-[#151a24] flex flex-col items-center justify-center"><span className="text-3xl font-bold text-white">{progress}%</span><span className="text-xs text-slate-500">complete</span></div>
            </div>
          </div>
          <Link to="/practice" className="flex items-center justify-center gap-2 rounded-xl border border-slate-700 py-2.5 text-xs font-semibold text-slate-300 hover:bg-white/5">Practice now <ArrowRight size={14} /></Link>
        </Card>
      </div>

      <div className="grid xl:grid-cols-[1.2fr_0.8fr] gap-6">
        <Card padding="large">
          <div className="flex items-center justify-between mb-5"><div><p className="text-xs font-semibold uppercase tracking-wider text-[#20d8d3]">Learning path</p><h2 className="mt-1 text-xl font-bold text-white">Recommended next steps</h2></div><Zap size={19} className="text-amber-400" /></div>
          <div className="space-y-3">
            {[
              ['Complete your learner profile', '/profile/edit', CheckCircle2],
              ['Explore a structured course', '/courses', BookOpen],
              ['Practice a sign with AI', '/practice', Video],
              ['Take your first assessment', '/assessments', Award],
            ].map(([title, path, Icon], i) => (
              <Link key={title} to={path} className="group flex items-center gap-4 rounded-xl border border-slate-800 p-3.5 hover:border-slate-700 hover:bg-white/[0.02] transition-all">
                <div className="h-9 w-9 rounded-lg bg-[#0d3b3c] text-[#20d8d3] flex items-center justify-center"><Icon size={17} /></div>
                <div className="flex-1"><span className="text-[10px] font-bold uppercase tracking-wider text-slate-600">Step {i + 1}</span><p className="text-sm font-semibold text-slate-200">{title}</p></div><ChevronRight size={16} className="text-slate-600 group-hover:text-slate-300" />
              </Link>
            ))}
          </div>
        </Card>

        <Card padding="large">
          <div className="flex items-center gap-3 mb-5"><div className="h-10 w-10 rounded-xl bg-violet-500/10 text-violet-400 flex items-center justify-center"><Sparkles size={19} /></div><div><h2 className="font-bold text-white">Performance Model</h2><p className="text-xs text-slate-500">Specification weighted scoring</p></div></div>
          <div className="space-y-4">
            {scoring.map(([label, weight]) => <div key={label}><div className="flex justify-between text-xs mb-1.5"><span className="text-slate-400">{label}</span><span className="font-bold text-slate-200">{weight}%</span></div><div className="h-1.5 rounded-full bg-slate-800 overflow-hidden"><div className="h-full rounded-full bg-[#16c8c4]" style={{ width: `${weight}%` }} /></div></div>)}
          </div>
        </Card>
      </div>

      <Card padding="large">
        <div className="flex items-center justify-between mb-5"><div><p className="text-xs font-semibold uppercase tracking-wider text-[#20d8d3]">My Learning</p><h2 className="mt-1 text-xl font-bold text-white">Continue your enrolled courses</h2></div><Link to="/courses" className="text-xs font-semibold text-[#20d8d3] flex items-center gap-1">Manage courses <ChevronRight size={14} /></Link></div>
        {data.enrolled.length ? <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">{data.enrolled.slice(0, 3).map((entry) => { const course = entry.course; return <Link key={entry.enrollment_id} to={`/course/${course.id}`} className="group rounded-xl border border-slate-800 p-4 hover:border-slate-700 hover:bg-white/[0.02]"><div className="flex items-center gap-3"><div className="h-10 w-10 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center"><BookOpen size={18} /></div><div className="min-w-0"><p className="text-sm font-bold text-slate-200 truncate">{course.title}</p><p className="text-xs text-slate-500">{course.level || 'Beginner'} · {entry.progress_percent}% complete</p></div></div><div className="mt-4 h-1.5 rounded-full bg-slate-800 overflow-hidden"><div className="h-full rounded-full bg-[#16c8c4]" style={{width:`${entry.progress_percent}%`}} /></div><div className="mt-3 flex items-center gap-1 text-xs font-semibold text-[#20d8d3]">Continue learning <ArrowRight size={13} /></div></Link>})}</div> : <div className="rounded-xl border border-dashed border-slate-800 p-7 text-center"><BookOpen className="mx-auto text-slate-600" size={28} /><p className="mt-3 text-sm text-slate-400">You have not enrolled in a course yet.</p><Link to="/courses" className="mt-3 inline-flex text-xs font-semibold text-[#20d8d3]">Explore and enroll</Link></div>}
      </Card>

      <div className="flex items-center justify-between text-[11px] text-slate-600 pb-2"><span className="flex items-center gap-2"><CalendarDays size={13} /> Data shown from connected learner APIs where available.</span><span>SignSpeak AI</span></div>
    </div>
  );
}
