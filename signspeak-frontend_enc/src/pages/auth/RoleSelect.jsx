import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, ShieldCheck, ArrowRight, UserCheck, Sparkles, Hand, ChevronRight, HelpCircle } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export default function RoleSelect() {
  const navigate = useNavigate();

  return (
    <div className="w-full max-w-4xl mx-auto py-4 px-2">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary text-xs font-semibold mb-3">
          <Sparkles size={14} /> Role-Based Access Portal
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold font-display text-white tracking-tight">
          Welcome to <span className="text-gradient">SignSpeak</span>
        </h1>
        <p className="mt-2 text-base text-slate-300 max-w-lg mx-auto">
          Choose how you want to continue to access the appropriate platform workspace.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 items-stretch">
        {/* Learner Card */}
        <div className="relative group rounded-3xl bg-slate-900/90 border border-slate-800 p-7 flex flex-col justify-between hover:border-primary/50 transition-all duration-300 shadow-card">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-bl-full blur-2xl pointer-events-none" />
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-13 h-13 rounded-2xl bg-primary/15 border border-primary/30 flex items-center justify-center p-3">
                <BookOpen size={26} className="text-primary" />
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-primary-900/50 border border-primary-500/30 text-primary">
                Learner Portal
              </span>
            </div>

            <h2 className="text-2xl font-bold text-white mb-2">Learner</h2>
            <p className="text-sm text-slate-300 leading-relaxed mb-6">
              Learn sign language, practice gestures with real-time AI computer vision feedback, and build signing confidence.
            </p>

            <div className="space-y-2.5 mb-7 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                <span>Interactive ASL courses & structured lessons</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                <span>Real-time camera hand tracking & gesture scoring</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                <span>Track streaks, accuracy, XP, and achievements</span>
              </div>
            </div>
          </div>

          <div className="space-y-3 pt-4 border-t border-slate-800/80">
            <Button
              className="w-full justify-center bg-primary hover:bg-primary-600 text-slate-950 font-bold shadow-[0_0_20px_rgba(20,201,197,0.2)]"
              size="lg"
              onClick={() => navigate('/login/learner')}
            >
              <UserCheck size={18} /> Learner Login
            </Button>
            <Link to="/register" className="block">
              <Button
                variant="outline"
                className="w-full justify-center border-slate-700 text-slate-200 hover:bg-slate-800"
                size="lg"
              >
                Create Account <ArrowRight size={16} />
              </Button>
            </Link>
          </div>
        </div>

        {/* Administrator Card */}
        <div className="relative group rounded-3xl bg-slate-900/90 border border-slate-800 p-7 flex flex-col justify-between hover:border-violet-500/50 transition-all duration-300 shadow-card">
          <div className="absolute top-0 right-0 w-32 h-32 bg-violet-600/10 rounded-bl-full blur-2xl pointer-events-none" />
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-13 h-13 rounded-2xl bg-violet-500/15 border border-violet-500/30 flex items-center justify-center p-3">
                <ShieldCheck size={26} className="text-violet-400" />
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-violet-950/60 border border-violet-700/40 text-violet-300">
                Staff & Admin
              </span>
            </div>

            <h2 className="text-2xl font-bold text-white mb-2">Administrator</h2>
            <p className="text-sm text-slate-300 leading-relaxed mb-6">
              Manage platform users, inspect live assessment attempts, evaluate AI gesture recognition models, and review system activity.
            </p>

            <div className="space-y-2.5 mb-7 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-violet-400" />
                <span>User monitoring, role assignment & status controls</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-violet-400" />
                <span>Live assessment attempts & learner accuracy review</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-violet-400" />
                <span>Model evaluation pipeline & confusion matrix</span>
              </div>
            </div>
          </div>

          <div className="space-y-3 pt-4 border-t border-slate-800/80">
            <Button
              className="w-full justify-center bg-violet-600 hover:bg-violet-500 text-white font-bold shadow-[0_0_20px_rgba(124,108,242,0.25)]"
              size="lg"
              onClick={() => navigate('/admin/login')}
            >
              <ShieldCheck size={18} /> Administrator Login
            </Button>
            <div className="text-center py-2.5">
              <span className="text-xs text-slate-300">Staff credentials only &middot; RBAC protected</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-between text-xs text-slate-300 border-t border-slate-800/80 pt-5 px-2">
        <Link to="/forgot-password" className="hover:text-primary transition-colors flex items-center gap-1">
          <HelpCircle size={14} /> Forgot your password?
        </Link>
        <Link to="/" className="hover:text-white transition-colors flex items-center gap-1">
          ← Back to Public Home
        </Link>
      </div>
    </div>
  );
}
