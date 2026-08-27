import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useToast } from '../../hooks/useToast';

export default function ForgotPassword() {
  const [sent, setSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { addToast } = useToast();
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    setSent(true);
    addToast('Reset link sent to your email', 'success');
    setIsLoading(false);
  };

  return (
    <div className="bg-white rounded-2xl shadow-card p-8">
      <Link to="/login" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-6">
        <ArrowLeft size={16} /> Back to sign in
      </Link>

      {sent ? (
        <div className="text-center py-4">
          <div className="w-14 h-14 rounded-full bg-success-50 flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={28} className="text-success" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Check your email</h1>
          <p className="text-sm text-gray-500 mb-6">We've sent a password reset link to your email address.</p>
          <Link to="/login" className="text-sm font-medium text-primary hover:text-primary-600">
            Return to sign in
          </Link>
        </div>
      ) : (
        <>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Reset password</h1>
          <p className="text-sm text-gray-500 mb-6">Enter your email and we'll send you a reset link.</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              icon={Mail}
              error={errors.email?.message}
              {...register('email', { required: 'Email is required', pattern: { value: /^\S+@\S+$/i, message: 'Invalid email' } })}
            />
            <Button type="submit" className="w-full" loading={isLoading}>
              Send Reset Link
            </Button>
          </form>
        </>
      )}
    </div>
  );
}
