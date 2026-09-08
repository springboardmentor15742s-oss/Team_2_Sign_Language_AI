import { useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { KeyRound, CheckCircle2 } from 'lucide-react';
import { useForm } from 'react-hook-form';

import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useToast } from '../../hooks/useToast';
import { authService } from '../../services/authService';

export default function ResetPassword() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const token = useMemo(
    () => params.get('token') || '',
    [params]
  );

  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const newPassword = watch('new_password');

  const submit = async (data) => {
    if (!token) {
      addToast('Reset token is missing', 'error');
      return;
    }

    if (data.new_password !== data.confirm_password) {
      addToast('Passwords do not match', 'error');
      return;
    }

    try {
      setSaving(true);

      await authService.resetPassword({
        token,
        new_password: data.new_password,
      });

      setDone(true);

      addToast(
        'Password reset successfully',
        'success'
      );
    } catch (error) {
      addToast(
        error.response?.data?.detail ||
          'Unable to reset password',
        'error'
      );
    } finally {
      setSaving(false);
    }
  };

  if (done) {
    return (
      <div className="bg-white rounded-2xl shadow-card p-8 text-center">
        <CheckCircle2
          size={38}
          className="mx-auto text-success mb-4"
        />

        <h1 className="text-xl font-bold text-gray-900">
          Password updated
        </h1>

        <p className="mt-2 text-sm text-gray-500">
          You can now sign in using your new password.
        </p>

        <Button
          className="w-full mt-6"
          onClick={() => navigate('/login')}
        >
          Go to Login
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-card p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">
        Create new password
      </h1>

      <p className="text-sm text-gray-500 mb-6">
        Enter and confirm your new SignSpeak password.
      </p>

      <form onSubmit={handleSubmit(submit)} className="space-y-4">
        <Input
          label="New password"
          type="password"
          icon={KeyRound}
          error={errors.new_password?.message}
          {...register('new_password', {
            required: 'New password is required',
            minLength: {
              value: 8,
              message: 'Minimum 8 characters',
            },
          })}
        />

        <Input
          label="Confirm password"
          type="password"
          icon={KeyRound}
          error={errors.confirm_password?.message}
          {...register('confirm_password', {
            required: 'Please confirm your password',
            validate: (value) =>
              value === newPassword ||
              'Passwords do not match',
          })}
        />

        <Button
          type="submit"
          className="w-full"
          loading={saving}
        >
          Reset Password
        </Button>
      </form>

      <Link
        to="/login"
        className="block text-center mt-5 text-sm text-gray-500"
      >
        Back to sign in
      </Link>
    </div>
  );
}
