import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ShieldCheck, ArrowLeft, BookOpen, AlertCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';

const STAFF_ROLES = new Set(['admin', 'instructor', 'accessibility_trainer']);

export default function AdminLogin() {
  const [showPassword, setShowPassword] = useState(false);
  const { login, logout, isLoading } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    const result = await login(data);
    if (!result.success) {
      addToast(result.error || 'Authentication failed. Please verify credentials.', 'error');
      return;
    }
    if (!STAFF_ROLES.has(result.user?.role)) {
      await logout();
      addToast('Access Denied: This account does not have administrator privileges. Please use the learner login.', 'error');
      return;
    }
    addToast(`Welcome to Admin Console, ${result.user.full_name}.`, 'success');
    navigate('/admin', { replace: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface px-4 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2.5 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-violet-600/20 border border-violet-500/40 flex items-center justify-center shadow-[0_0_25px_rgba(124,108,242,0.3)]">
              <ShieldCheck size={22} className="text-violet-400" />
            </div>
            <span className="text-2xl font-bold font-display text-white">SignSpeak <span className="text-violet-400">Admin</span></span>
          </Link>
          <p className="text-xs text-slate-400">Administration & Staff Management Workspace</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-card p-8 sm:p-9 text-slate-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-violet-600/10 rounded-bl-full blur-2xl pointer-events-none" />

          <div className="flex items-center justify-between mb-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-violet-950/70 border border-violet-700/50 text-violet-300">
              <ShieldCheck size={13} /> Administrator Login
            </span>
            <Link
              to="/login"
              className="text-xs text-slate-400 hover:text-white transition-colors flex items-center gap-1"
            >
              <ArrowLeft size={13} /> Role Selector
            </Link>
          </div>

          <h1 className="text-2xl font-bold text-white mb-1.5 font-display">Administrator Sign In</h1>
          <p className="text-sm text-slate-400 mb-6">
            Authorized staff and administrator credentials only.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                Admin Email Address
              </label>
              <Input
                type="email"
                placeholder="admin@signspeak.com"
                icon={Mail}
                error={errors.email?.message}
                {...register('email', {
                  required: 'Admin email is required',
                  pattern: { value: /^\S+@\S+$/i, message: 'Please enter a valid email address' },
                })}
              />
            </div>

            <div className="relative">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                Admin Password
              </label>
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter password"
                icon={Lock}
                error={errors.password?.message}
                {...register('password', {
                  required: 'Password is required',
                  minLength: { value: 6, message: 'Minimum 6 characters required' },
                })}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-[32px] text-slate-400 hover:text-slate-200 transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <Button
              type="submit"
              className="w-full justify-center bg-violet-600 hover:bg-violet-500 text-white font-bold mt-2 shadow-[0_0_20px_rgba(124,108,242,0.3)]"
              size="lg"
              loading={isLoading}
            >
              <ShieldCheck size={18} /> Login to Admin Console
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-800/80 text-center space-y-3">
            <p className="text-xs text-slate-400">
              Not a staff member?{' '}
              <Link to="/login/learner" className="font-bold text-primary hover:text-primary-400">
                Go to Learner Login &rarr;
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
