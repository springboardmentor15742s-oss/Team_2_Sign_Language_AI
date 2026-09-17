import { useState } from 'react';
import { Mail, Send, MapPin, Phone } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Breadcrumb } from '../../components/layout/Breadcrumb';
import { useToast } from '../../hooks/useToast';

export default function ContactPage() {
  const [isLoading, setIsLoading] = useState(false);
  const { addToast } = useToast();
  const { register, handleSubmit, formState: { errors }, reset } = useForm();

  const onSubmit = async (data) => {
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    addToast('Message sent successfully!', 'success');
    setIsLoading(false);
    reset();
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <Breadcrumb items={[{ label: 'Contact' }]} className="mb-6" />
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Contact Us</h1>
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <Card className="text-center p-6">
            <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center mx-auto mb-3"><Mail size={22} className="text-primary" /></div>
            <h3 className="font-semibold text-gray-900">Email</h3>
            <p className="text-sm text-gray-500 mt-1">support@signspeak.app</p>
          </Card>
          <Card className="text-center p-6">
            <div className="w-12 h-12 rounded-xl bg-success-50 flex items-center justify-center mx-auto mb-3"><Phone size={22} className="text-success" /></div>
            <h3 className="font-semibold text-gray-900">Phone</h3>
            <p className="text-sm text-gray-500 mt-1">+1 (555) 123-4567</p>
          </Card>
          <Card className="text-center p-6">
            <div className="w-12 h-12 rounded-xl bg-warning-50 flex items-center justify-center mx-auto mb-3"><MapPin size={22} className="text-warning" /></div>
            <h3 className="font-semibold text-gray-900">Office</h3>
            <p className="text-sm text-gray-500 mt-1">San Francisco, CA</p>
          </Card>
        </div>
        <div className="lg:col-span-2">
          <Card>
            <h3 className="font-semibold text-gray-900 mb-4">Send us a message</h3>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <Input label="Name" {...register('name', { required: 'Name is required' })} error={errors.name?.message} />
                <Input label="Email" type="email" {...register('email', { required: 'Email is required' })} error={errors.email?.message} />
              </div>
              <Input label="Subject" {...register('subject', { required: 'Subject is required' })} error={errors.subject?.message} />
              <Textarea label="Message" {...register('message', { required: 'Message is required' })} error={errors.message?.message} />
              <Button type="submit" loading={isLoading}><Send size={16} /> Send Message</Button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
