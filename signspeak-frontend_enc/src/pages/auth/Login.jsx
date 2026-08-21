import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, BookOpen, ShieldCheck, ArrowLeft } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    const result = await login(data);
    if (result.success) {
      addToast(`Welcome back, ${result.user?.full_name || 'Learner'}!`, 'success');
      if (['admin', 'instructor', 'accessibility_trainer'].includes(result.user?.role)) {
        navigate('/admin', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    } else {
      addToast(result.error || 'Login failed. Please check your credentials.', 'error');
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-card p-8 sm:p-9 text-slate-100">
      <div className="flex items-center justify-between mb-4">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-primary-900/60 border border-primary-500/30 text-primary">
          <BookOpen size={13} /> Learner Portal
        </span>
        <Link
          to="/login"
          className="text-xs text-slate-400 hover:text-white transition-colors flex items-center gap-1"
        >
          <ArrowLeft size={13} /> Role Selector
        </Link>
      </div>

      <h1 className="text-2xl font-bold text-white mb-1.5 font-display">Learner Sign In</h1>
      <p className="text-sm text-slate-400 mb-6">
        Sign in to practice gestures, complete assessments, and track your progress.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
            Email Address
          </label>
          <Input
            type="email"
            placeholder="learner@example.com"
            icon={Mail}
            error={errors.email?.message}
            {...register('email', {
              required: 'Email is required',
              pattern: { value: /^\S+@\S+$/i, message: 'Please enter a valid email address' },
            })}
          />
        </div>

        <div className="relative">
          <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
            Password
          </label>
          <Input
            type={showPassword ? 'text' : 'password'}
            placeholder="Enter your password"
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

        <div className="flex items-center justify-between pt-1">
          <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer select-none">
            <input
              type="checkbox"
              className="rounded border-slate-700 bg-slate-800 text-primary focus:ring-primary/20"
            />
            Remember me
          </label>
          <Link
            to="/forgot-password"
            className="text-xs font-semibold text-primary hover:text-primary-400 transition-colors"
          >
            Forgot password?
          </Link>
        </div>

        <Button
          type="submit"
          className="w-full justify-center bg-primary hover:bg-primary-600 text-slate-950 font-bold mt-2 shadow-[0_0_20px_rgba(20,201,197,0.25)]"
          size="lg"
          loading={isLoading}
        >
          Sign In as Learner
        </Button>
      </form>

      <div className="mt-6 pt-6 border-t border-slate-800/80 text-center space-y-3">
        <p className="text-xs text-slate-400">
          New to SignSpeak?{' '}
          <Link to="/register" className="font-bold text-primary hover:text-primary-400">
            Create learner account
          </Link>
        </p>

        <div className="p-3 rounded-2xl bg-violet-950/30 border border-violet-800/40 text-xs text-slate-300 flex items-center justify-between">
          <div className="flex items-center gap-2 text-left">
            <ShieldCheck size={16} className="text-violet-400 shrink-0" />
            <span>Administrator access?</span>
          </div>
          <Link
            to="/admin/login"
            className="font-bold text-violet-400 hover:text-violet-300 transition-colors whitespace-nowrap ml-2"
          >
            Admin Login &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
