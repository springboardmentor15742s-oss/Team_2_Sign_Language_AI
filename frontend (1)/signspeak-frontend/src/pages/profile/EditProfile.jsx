import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, MapPin, Camera } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Breadcrumb } from '../../components/layout/Breadcrumb';
import { useToast } from '../../hooks/useToast';
import { SIGN_LANGUAGES, SKILL_LEVELS } from '../../constants/navigation';

export default function EditProfile() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      name: 'Learner',
      email: 'learner@example.com',
      bio: '',
      location: '',
      language: 'asl',
      level: 'beginner',
    }
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 800));
    addToast('Profile updated successfully', 'success');
    setIsLoading(false);
    navigate('/profile');
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Breadcrumb items={[{ label: 'Profile', path: '/profile' }, { label: 'Edit' }]} className="mb-6" />

      <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Profile</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <h3 className="font-semibold text-gray-900 mb-4">Profile Photo</h3>
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-xl bg-primary-100 flex items-center justify-center">
              <User size={32} className="text-primary" />
            </div>
            <div>
              <Button size="sm" variant="outline" type="button">
                <Camera size={14} /> Upload Photo
              </Button>
              <p className="text-xs text-gray-400 mt-2">JPG, PNG. Max 2MB.</p>
            </div>
          </div>
        </Card>

        <Card>
          <h3 className="font-semibold text-gray-900 mb-4">Personal Information</h3>
          <div className="space-y-4">
            <Input
              label="Full Name"
              icon={User}
              error={errors.name?.message}
              {...register('name', { required: 'Name is required' })}
            />
            <Input
              label="Email"
              type="email"
              icon={Mail}
              error={errors.email?.message}
              {...register('email', { required: 'Email is required' })}
            />
            <Input
              label="Location"
              icon={MapPin}
              {...register('location')}
            />
            <Textarea
              label="Bio"
              placeholder="Tell us about yourself..."
              {...register('bio')}
            />
          </div>
        </Card>

        <Card>
          <h3 className="font-semibold text-gray-900 mb-4">Learning Preferences</h3>
          <div className="space-y-4">
            <Select
              label="Preferred Sign Language"
              options={SIGN_LANGUAGES}
              {...register('language')}
            />
            <Select
              label="Current Skill Level"
              options={SKILL_LEVELS}
              {...register('level')}
            />
          </div>
        </Card>

        <div className="flex items-center gap-3">
          <Button type="submit" loading={isLoading}>Save Changes</Button>
          <Button type="button" variant="ghost" onClick={() => navigate('/profile')}>Cancel</Button>
        </div>
      </form>
    </div>
  );
}
