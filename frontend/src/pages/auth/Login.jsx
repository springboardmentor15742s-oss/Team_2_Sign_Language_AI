import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading } = useAuth();
  const { addToast } = useToast();
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    const result = await login(data);
    if (result.success) {
      addToast('Welcome back!', 'success');
      window.location.href = '/dashboard';
    } else {
      addToast(result.error || 'Login failed', 'error');
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-card p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome back</h1>
      <p className="text-sm text-gray-500 mb-6">Sign in to continue your sign language journey.</p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Email"
          type="email"
          placeholder="you@example.com"
          icon={Mail}
          error={errors.email?.message}
          {...register('email', { required: 'Email is required', pattern: { value: /^\S+@\S+$/i, message: 'Invalid email' } })}
        />

        <div className="relative">
          <Input
            label="Password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Enter your password"
            icon={Lock}
            error={errors.password?.message}
            {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Min 6 characters' } })}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-[34px] text-gray-400 hover:text-gray-600"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
            <input type="checkbox" className="rounded border-gray-300 text-primary focus:ring-primary" />
            Remember me
          </label>
          <Link to="/forgot-password" className="text-sm font-medium text-primary hover:text-primary-600">
            Forgot password?
          </Link>
        </div>

        <Button type="submit" className="w-full" loading={isLoading}>
          Sign In
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500">
        Don't have an account?{' '}
        <Link to="/register" className="font-medium text-primary hover:text-primary-600">
          Get started
        </Link>
      </p>
    </div>
  );
}
