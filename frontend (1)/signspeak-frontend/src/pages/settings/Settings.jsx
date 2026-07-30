import { useState } from 'react';
import { User, Lock, Palette, Globe, Bell, Shield, Save } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Breadcrumb } from '../../components/layout/Breadcrumb';
import { useToast } from '../../hooks/useToast';

const tabs = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'password', label: 'Password', icon: Lock },
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'language', label: 'Language', icon: Globe },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'privacy', label: 'Privacy', icon: Shield },
];

export default function Settings() {
  const [activeTab, setActiveTab] = useState('profile');
  const { addToast } = useToast();
  const { register, handleSubmit } = useForm();

  const onSubmit = (data) => {
    addToast('Settings saved successfully', 'success');
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Breadcrumb items={[{ label: 'Settings' }]} className="mb-6" />
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Settings</h1>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="lg:w-56 shrink-0">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-2 space-y-1">
            {tabs.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${activeTab === tab.id ? 'bg-primary-50 text-primary' : 'text-gray-600 hover:bg-gray-50'}`}>
                <tab.icon size={16} /> {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1">
          <form onSubmit={handleSubmit(onSubmit)}>
            {activeTab === 'profile' && (
              <Card>
                <h3 className="font-semibold text-gray-900 mb-4">Profile Settings</h3>
                <div className="space-y-4">
                  <Input label="Display Name" {...register('displayName')} />
                  <Input label="Email" type="email" {...register('email')} />
                  <Input label="Phone" {...register('phone')} />
                </div>
              </Card>
            )}
            {activeTab === 'password' && (
              <Card>
                <h3 className="font-semibold text-gray-900 mb-4">Change Password</h3>
                <div className="space-y-4">
                  <Input label="Current Password" type="password" {...register('currentPassword')} />
                  <Input label="New Password" type="password" {...register('newPassword')} />
                  <Input label="Confirm New Password" type="password" {...register('confirmPassword')} />
                </div>
              </Card>
            )}
            {activeTab === 'appearance' && (
              <Card>
                <h3 className="font-semibold text-gray-900 mb-4">Appearance</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Theme</p>
                    <div className="flex gap-3">
                      {['light', 'dark', 'system'].map(t => (
                        <label key={t} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 cursor-pointer hover:border-primary transition-colors">
                          <input type="radio" name="theme" value={t} className="text-primary" />
                          <span className="text-sm capitalize">{t}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            )}
            {activeTab === 'language' && (
              <Card>
                <h3 className="font-semibold text-gray-900 mb-4">Language & Region</h3>
                <div className="space-y-4">
                  <Select label="Interface Language" options={[{ value: 'en', label: 'English' }, { value: 'es', label: 'Spanish' }, { value: 'fr', label: 'French' }]} {...register('language')} />
                  <Select label="Date Format" options={[{ value: 'mdy', label: 'MM/DD/YYYY' }, { value: 'dmy', label: 'DD/MM/YYYY' }, { value: 'ymd', label: 'YYYY/MM/DD' }]} {...register('dateFormat')} />
                </div>
              </Card>
            )}
            {activeTab === 'notifications' && (
              <Card>
                <h3 className="font-semibold text-gray-900 mb-4">Notification Preferences</h3>
                <div className="space-y-3">
                  {['Email notifications', 'Practice reminders', 'Course updates', 'Assessment results', 'Weekly progress report'].map(item => (
                    <label key={item} className="flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:border-gray-200 cursor-pointer transition-colors">
                      <span className="text-sm text-gray-700">{item}</span>
                      <input type="checkbox" defaultChecked className="w-4 h-4 rounded text-primary focus:ring-primary" />
                    </label>
                  ))}
                </div>
              </Card>
            )}
            {activeTab === 'privacy' && (
              <Card>
                <h3 className="font-semibold text-gray-900 mb-4">Privacy & Security</h3>
                <div className="space-y-3">
                  {['Share progress with community', 'Allow analytics collection', 'Public profile'].map(item => (
                    <label key={item} className="flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:border-gray-200 cursor-pointer transition-colors">
                      <span className="text-sm text-gray-700">{item}</span>
                      <input type="checkbox" className="w-4 h-4 rounded text-primary focus:ring-primary" />
                    </label>
                  ))}
                </div>
              </Card>
            )}
            <div className="mt-6">
              <Button type="submit"><Save size={16} /> Save Changes</Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
