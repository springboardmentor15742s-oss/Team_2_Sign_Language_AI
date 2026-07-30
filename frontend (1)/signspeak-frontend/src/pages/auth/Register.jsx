import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';

export default function Register() {
  const [showPassword, setShowPassword] = useState(false);

  const { register: registerUser, isLoading } = useAuth();
  const { addToast } = useToast();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    const payload = {
      full_name: data.full_name,
      email: data.email,
      password: data.password,
      role: 'student',
    };

    const result = await registerUser(payload);

    if (result.success) {
      addToast('Account created successfully!', 'success');
      window.location.href = '/dashboard';
    } else {
      addToast(result.error || 'Registration failed', 'error');
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-card p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">
        Create Account
      </h1>

      <p className="text-sm text-gray-500 mb-6">
        Start your sign language learning journey today.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

        <Input
          label="Full Name"
          placeholder="John Doe"
          icon={User}
          error={errors.full_name?.message}
          {...register('full_name', {
            required: 'Full name is required',
          })}
        />

        <Input
          label="Email"
          type="email"
          placeholder="you@example.com"
          icon={Mail}
          error={errors.email?.message}
          {...register('email', {
            required: 'Email is required',
            pattern: {
              value: /^\S+@\S+$/i,
              message: 'Invalid email',
            },
          })}
        />

        <div className="relative">
          <Input
            label="Password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Create a password"
            icon={Lock}
            error={errors.password?.message}
            {...register('password', {
              required: 'Password is required',
              minLength: {
                value: 8,
                message: 'Minimum 8 characters',
              },
            })}
          />

          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-[34px] text-gray-400 hover:text-gray-600"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        <Input
          label="Confirm Password"
          type="password"
          placeholder="Confirm your password"
          icon={Lock}
          error={errors.confirmPassword?.message}
          {...register('confirmPassword', {
            required: 'Please confirm your password',
            validate: (value) =>
              value === watch('password') || 'Passwords do not match',
          })}
        />

        <label className="flex items-start gap-2 text-sm text-gray-600">
          <input
            type="checkbox"
            className="mt-1 rounded border-gray-300"
            required
          />

          <span>
            I agree to the{' '}
            <Link to="/terms" className="text-primary hover:underline">
              Terms
            </Link>{' '}
            and{' '}
            <Link to="/privacy" className="text-primary hover:underline">
              Privacy Policy
            </Link>
          </span>
        </label>

        <Button
          type="submit"
          className="w-full"
          loading={isLoading}
        >
          Create Account
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500">
        Already have an account?{' '}
        <Link
          to="/login"
          className="font-medium text-primary hover:text-primary-600"
        >
          Sign In
        </Link>
      </p>
    </div>
  );
}
