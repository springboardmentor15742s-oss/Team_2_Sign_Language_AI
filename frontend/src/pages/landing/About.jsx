import { Hand, Target, Shield, Users, Award } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Breadcrumb } from '../../components/layout/Breadcrumb';

const values = [
  { icon: Target, title: 'Accessibility First', desc: 'We believe sign language education should be accessible to everyone, everywhere.' },
  { icon: Shield, title: 'Privacy Focused', desc: 'Your data and camera feed are processed locally. Privacy is not optional.' },
  { icon: Users, title: 'Community Driven', desc: 'Built with input from the deaf and hard-of-hearing community.' },
  { icon: Award, title: 'Quality Education', desc: 'Curriculum designed by certified sign language instructors and linguists.' },
];

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <Breadcrumb items={[{ label: 'About' }]} className="mb-6" />
      <div className="text-center mb-12">
        <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center mx-auto mb-4">
          <Hand size={32} className="text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">About SignSpeak</h1>
        <p className="text-gray-500 max-w-xl mx-auto">An AI-powered platform dedicated to making sign language learning accessible, interactive, and effective for everyone.</p>
      </div>
      <div className="grid sm:grid-cols-2 gap-6 mb-10">
        {values.map(v => (
          <Card key={v.title} className="text-center p-6">
            <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center mx-auto mb-3"><v.icon size={22} className="text-primary" /></div>
            <h3 className="font-semibold text-gray-900 mb-2">{v.title}</h3>
            <p className="text-sm text-gray-500">{v.desc}</p>
          </Card>
        ))}
      </div>
      <Card>
        <h3 className="font-semibold text-gray-900 mb-4">Our Mission</h3>
        <p className="text-gray-600 leading-relaxed text-sm mb-4">
          SignSpeak was founded with a simple mission: bridge the communication gap between the hearing and deaf communities through technology. 
          We combine cutting-edge AI with expert-designed curriculum to create a learning experience that is both effective and engaging.
        </p>
        <p className="text-gray-600 leading-relaxed text-sm">
          Whether you are learning sign language for personal, professional, or educational reasons, SignSpeak provides the tools, 
          feedback, and community support you need to succeed.
        </p>
      </Card>
    </div>
  );
}
