import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Sparkles, ArrowRight, Play, BrainCircuit, Target, ScanFace, BarChart3,
  BookOpen, Camera, Award, Users, CheckCircle2, ShieldCheck, Cpu, Hand
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { HolographicHand } from '../../components/landing/HolographicHand';
import { platformService } from '../../services/platformService';
import { useAuth } from '../../hooks/useAuth';

const heroFeatureRow = [
  {
    icon: (
      <div className="w-8 h-8 rounded-full bg-cyan-950/80 border border-cyan-500/50 flex items-center justify-center text-cyan-400 font-extrabold text-xs shadow-[0_0_12px_rgba(32,216,211,0.35)] shrink-0">
        A
      </div>
    ),
    title: 'AI Feedback',
    subtitle: 'Real-time guidance',
  },
  {
    icon: (
      <div className="w-8 h-8 rounded-full bg-cyan-950/80 border border-cyan-500/50 flex items-center justify-center text-cyan-400 shadow-[0_0_12px_rgba(32,216,211,0.35)] shrink-0">
        <ShieldCheck size={16} />
      </div>
    ),
    title: 'Smart Practice',
    subtitle: 'Adaptive learning',
  },
  {
    icon: (
      <div className="w-8 h-8 rounded-full bg-cyan-950/80 border border-cyan-500/50 flex items-center justify-center text-cyan-400 shadow-[0_0_12px_rgba(32,216,211,0.35)] shrink-0">
        <ScanFace size={16} />
      </div>
    ),
    title: 'Accurate Assessment',
    subtitle: 'Track your progress',
  },
  {
    icon: (
      <div className="w-8 h-8 rounded-full bg-cyan-950/80 border border-cyan-500/50 flex items-center justify-center text-cyan-400 shadow-[0_0_12px_rgba(32,216,211,0.35)] shrink-0">
        <BarChart3 size={16} />
      </div>
    ),
    title: 'Detailed Analytics',
    subtitle: 'Measure & improve',
  },
];

const platformFeatures = [
  {
    icon: BookOpen,
    title: 'Structured ASL Curriculum',
    description: 'Learn foundational alphabet fingerspelling, core gestures, numbers, and vocabulary through guided lessons.',
  },
  {
    icon: Camera,
    title: 'Live 21-Point Hand Tracking',
    description: 'Computer-vision landmark detection validates posture, framing, lighting, and finger positions in real time.',
  },
  {
    icon: BrainCircuit,
    title: 'AI Feedback & Mistake Diagnosis',
    description: 'Instant feedback pinpoints misaligned fingers, low lighting, and repeated error streaks with actionable advice.',
  },
  {
    icon: BarChart3,
    title: 'Verified Learning Analytics',
    description: 'Track real gesture attempts, score trajectory, category mastery, and continuous skill progress over time.',
  },
];

const STAT_META = [
  ['total_learners', 'Registered Learners', Users],
  ['total_lessons', 'Published Lessons', BookOpen],
  ['total_sign_attempts', 'Signs Analyzed', Camera],
  ['model_accuracy', 'Model Accuracy', Award],
];

function formatStatValue(key, value) {
  if (value === null || value === undefined) return '—';
  if (key === 'model_accuracy') return `${Math.round(value * 100)}%`;
  return value >= 1000 ? `${Math.floor(value / 1000)}K+` : String(value);
}

export default function Home() {
  const { isAuthenticated, user } = useAuth();
  const [platformStats, setPlatformStats] = useState(null);

  useEffect(() => {
    let active = true;
    platformService.getStats()
      .then(res => active && setPlatformStats(res.data))
      .catch(err => console.error('Failed to load platform stats:', err));
    return () => { active = false; };
  }, []);

  const isStaff = ['admin', 'instructor', 'accessibility_trainer'].includes(user?.role);

  return (
    <div className="overflow-hidden bg-[#070913] text-white selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* ------------------------------------------------------------- */}
      {/* 1. HERO SECTION                                               */}
      {/* ------------------------------------------------------------- */}
      <section className="relative pt-6 pb-12 lg:pt-10 lg:pb-14 overflow-hidden">
        {/* Background ambient lighting */}
        <div className="absolute top-0 right-1/4 w-[600px] h-[600px] rounded-full bg-cyan-500/15 blur-[140px] pointer-events-none" />
        <div className="absolute top-1/3 left-0 w-[500px] h-[500px] rounded-full bg-violet-600/15 blur-[140px] pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[450px] h-[450px] rounded-full bg-blue-600/10 blur-[130px] pointer-events-none" />

        <div className="container-page relative z-10">
          <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-8 lg:gap-6 items-center">
            {/* Left Column: Hero Content */}
            <motion.div
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: 'easeOut' }}
              className="flex flex-col items-start text-left"
            >
              {/* Top Tag Pill */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/80 border border-slate-700/70 text-slate-300 text-xs font-semibold backdrop-blur-md mb-5 shadow-[0_0_15px_rgba(0,0,0,0.5)]">
                <Sparkles size={13} className="text-[#20d8d3]" />
                <span>AI-Powered Sign Language Learning</span>
              </div>

              {/* Bold Hero Typography */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-[66px] font-extrabold font-display leading-[1.08] tracking-tight text-white mb-5">
                Learn Signs.<br />
                Express Yourself.<br />
                <span className="bg-gradient-to-r from-[#20d8d3] via-[#70bbfb] to-[#a855f7] bg-clip-text text-transparent drop-shadow-[0_0_35px_rgba(32,216,211,0.35)]">
                  Inspire the World.
                </span>
              </h1>

              {/* Subtitle description */}
              <p className="text-slate-300 text-sm sm:text-base lg:text-lg max-w-lg leading-relaxed mb-7">
                Master sign language with AI guidance, real-time feedback and personalized learning pathways.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-3.5 w-full sm:w-auto">
                <Link
                  to={isAuthenticated ? (isStaff ? '/admin' : '/dashboard') : '/register'}
                  className="w-full sm:w-auto"
                >
                  <Button
                    size="lg"
                    className="w-full justify-center bg-gradient-to-r from-[#20d8d3] to-[#8b5cf6] hover:opacity-95 text-white font-bold px-7 py-3.5 rounded-2xl shadow-[0_0_30px_rgba(32,216,211,0.35)] transition-all flex items-center gap-2"
                  >
                    <span>{isAuthenticated ? (isStaff ? 'Admin Console' : 'Go to Dashboard') : 'Start Learning'}</span>
                    <ArrowRight size={17} />
                  </Button>
                </Link>

                <Link to="/about" className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full justify-center border-slate-700/80 bg-slate-900/60 hover:bg-slate-800/80 text-slate-200 font-semibold px-7 py-3.5 rounded-2xl backdrop-blur-md transition-all flex items-center gap-2"
                  >
                    <Play size={15} className="text-[#20d8d3]" />
                    <span>Explore Platform</span>
                  </Button>
                </Link>
              </div>
            </motion.div>

            {/* Right Column: 3D Holographic Hand Visual */}
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.9, delay: 0.15, ease: 'easeOut' }}
              className="relative flex items-center justify-center"
            >
              <HolographicHand />
            </motion.div>
          </div>

          {/* ------------------------------------------------------------- */}
          {/* 2. BOTTOM FEATURE BAR (Horizontal Row across Hero Bottom)     */}
          {/* ------------------------------------------------------------- */}
          <div className="relative z-10 mt-10 pt-7 border-t border-slate-800/60">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {heroFeatureRow.map((feat) => (
                <div key={feat.title} className="flex items-center gap-3">
                  {feat.icon}
                  <div className="min-w-0">
                    <h4 className="text-xs sm:text-sm font-bold text-white tracking-wide truncate">{feat.title}</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5 truncate">{feat.subtitle}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 3. PLATFORM CAPABILITIES SECTION                              */}
      {/* ------------------------------------------------------------- */}
      <section id="features" className="py-20 bg-[#0a0d1a] border-t border-slate-800/80 relative">
        <div className="container-page">
          <div className="max-w-2xl mb-12">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#20d8d3]">Platform Capabilities</p>
            <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold text-white font-display">
              Engineered for genuine sign language mastery.
            </h2>
            <p className="mt-3 text-slate-400 leading-relaxed text-sm sm:text-base">
              The platform brings together interactive gesture recognition, assessment scoring, and structured learning—powered by live computer vision models.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {platformFeatures.map((feat, i) => (
              <motion.div
                key={feat.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
              >
                <Card className="h-full bg-slate-900/80 border-slate-800 hover:border-slate-700 transition-all p-6 rounded-2xl flex flex-col justify-between">
                  <div>
                    <div className="h-12 w-12 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-[#20d8d3] flex items-center justify-center mb-5 shadow-[0_0_20px_rgba(32,216,211,0.2)]">
                      <feat.icon size={22} />
                    </div>
                    <h3 className="text-base font-bold text-white mb-2">{feat.title}</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">{feat.description}</p>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 4. COMPUTER VISION PIPELINE SECTION                           */}
      {/* ------------------------------------------------------------- */}
      <section className="py-20 bg-[#070913] relative">
        <div className="container-page grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#20d8d3]">AI Vision Pipeline</p>
            <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold text-white font-display">
              Real-time landmark analysis and confidence validation.
            </h2>
            <p className="mt-3 text-slate-400 leading-relaxed text-sm sm:text-base">
              Every sign gesture is verified for hand framing, distance, and lighting conditions before inference, ensuring accurate evaluation scores.
            </p>

            <div className="mt-7 space-y-3">
              {[
                '21-Point MediaPipe hand landmark extraction',
                'Frame lighting and distance quality verification',
                'Temporal frame-burst majority voting',
                'Structured AI feedback and mistake correction',
                'Dynamic multi-question assessment scoring',
              ].map((step, idx) => (
                <div
                  key={step}
                  className="flex items-center gap-3.5 rounded-xl border border-slate-800/80 bg-slate-900/60 p-3.5 backdrop-blur-sm"
                >
                  <div className="h-7 w-7 rounded-lg bg-cyan-950 border border-cyan-500/30 flex items-center justify-center text-xs font-bold text-[#20d8d3]">
                    0{idx + 1}
                  </div>
                  <span className="text-xs sm:text-sm font-semibold text-slate-200">{step}</span>
                  <CheckCircle2 size={16} className="ml-auto text-emerald-400 shrink-0" />
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-6 sm:p-8 text-white shadow-card relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/10 rounded-bl-full blur-3xl pointer-events-none" />

            <div className="flex items-center justify-between pb-5 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-300">
                  <Cpu size={20} />
                </div>
                <div>
                  <p className="font-bold text-white text-sm">Live Recognition Engine</p>
                  <p className="text-xs text-slate-400">MediaPipe + Random Forest Model</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-950/80 border border-emerald-800 text-emerald-300 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Active
              </span>
            </div>

            {/* Real Statistics or Neutral Model Capabilities */}
            <div className="mt-6 grid grid-cols-2 gap-4">
              {STAT_META.map(([key, label, Icon]) => (
                <div key={key} className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80">
                  <div className="flex items-center gap-2 mb-1.5 text-slate-400">
                    <Icon size={14} className="text-[#20d8d3]" />
                    <span className="text-xs font-semibold">{label}</span>
                  </div>
                  <p className="text-2xl font-extrabold text-white font-display">
                    {platformStats ? formatStatValue(key, platformStats[key]) : '—'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 5. CALL TO ACTION BANNER                                      */}
      {/* ------------------------------------------------------------- */}
      <section className="py-20 bg-[#070913] border-t border-slate-800/80">
        <div className="container-page">
          <div className="rounded-3xl bg-gradient-to-r from-cyan-950/80 via-slate-900/90 to-purple-950/80 border border-cyan-500/30 p-8 sm:p-12 text-center relative overflow-hidden shadow-[0_0_60px_rgba(32,216,211,0.12)]">
            <div className="absolute -right-20 -top-20 w-64 h-64 rounded-full bg-cyan-500/20 blur-3xl pointer-events-none" />
            <div className="absolute -left-20 -bottom-20 w-64 h-64 rounded-full bg-purple-600/20 blur-3xl pointer-events-none" />

            <div className="relative z-10 max-w-xl mx-auto">
              <h2 className="text-3xl sm:text-4xl font-extrabold font-display text-white mb-3">
                Start building your sign language fluency.
              </h2>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-6">
                Practice gestures with interactive guidance, test your knowledge in assessments, and track verified progress.
              </p>
              <Link to="/register">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-[#20d8d3] to-[#8b5cf6] hover:opacity-95 text-white font-bold px-8 py-3.5 rounded-2xl shadow-[0_0_30px_rgba(32,216,211,0.35)] transition-all inline-flex items-center gap-2"
                >
                  <span>Create Free Account</span>
                  <ArrowRight size={17} />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
