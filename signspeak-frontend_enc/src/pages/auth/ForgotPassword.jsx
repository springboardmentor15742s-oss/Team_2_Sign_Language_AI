import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle, HelpCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useToast } from '../../hooks/useToast';
import { authService } from '../../services/authService';

export default function ForgotPassword() {
  const [sent, setSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { addToast } = useToast();
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      await authService.forgotPassword(data.email);
      setSent(true);
      addToast('If that email is registered, a password reset link has been dispatched.', 'success');
    } catch (err) {
      console.error('Password reset request error:', err);
      // Still setSent or show generic message for security
      setSent(true);
      addToast('If that email is registered, a password reset link has been dispatched.', 'success');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-card p-8 sm:p-9 text-slate-100">
      <Link to="/login" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white mb-6 transition-colors">
        <ArrowLeft size={14} /> Back to Sign In
      </Link>

      {sent ? (
        <div className="text-center py-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto mb-4 text-emerald-400">
            <CheckCircle size={28} />
          </div>
          <h1 className="text-xl font-bold text-white mb-2 font-display">Check your inbox</h1>
          <p className="text-sm text-slate-400 mb-6 leading-relaxed">
            If an account is associated with that email, we've sent password reset instructions.
          </p>
          <Link to="/login" className="inline-block">
            <Button variant="outline" className="border-slate-700 text-slate-200 hover:bg-slate-800">
              Return to Sign In
            </Button>
          </Link>
        </div>
      ) : (
        <>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-primary-900/60 border border-primary-500/30 text-primary mb-3">
            <HelpCircle size={13} /> Account Recovery
          </div>
          <h1 className="text-2xl font-bold text-white mb-1.5 font-display">Reset password</h1>
          <p className="text-sm text-slate-400 mb-6">
            Enter your registered email address and we'll send you a password reset link.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                Email Address
              </label>
              <Input
                type="email"
                placeholder="you@example.com"
                icon={Mail}
                error={errors.email?.message}
                {...register('email', {
                  required: 'Email is required',
                  pattern: { value: /^\S+@\S+$/i, message: 'Invalid email address' },
                })}
              />
            </div>
            <Button
              type="submit"
              className="w-full justify-center bg-primary hover:bg-primary-600 text-slate-950 font-bold mt-2 shadow-[0_0_20px_rgba(20,201,197,0.25)]"
              size="lg"
              loading={isLoading}
            >
              Send Reset Link
            </Button>
          </form>
        </>
      )}
    </div>
  );
}
