import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Hand, BookOpen, Camera, Award, Users, ChevronRight,
  Sparkles, Shield, Zap, Globe
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';

const features = [
  {
    icon: BookOpen,
    title: 'Structured Courses',
    description: 'Progressive lessons from alphabet to advanced conversation, designed by sign language experts.',
  },
  {
    icon: Camera,
    title: 'AI Practice',
    description: 'Use your camera for real-time feedback. Our AI helps you perfect every gesture and expression.',
  },
  {
    icon: Award,
    title: 'Certifications',
    description: 'Earn verified certificates as you complete assessments and demonstrate your proficiency.',
  },
  {
    icon: Users,
    title: 'Community Learning',
    description: 'Connect with learners worldwide, share progress, and practice together.',
  },
];

const stats = [
  { value: '6+', label: 'Sign Languages' },
  { value: '50+', label: 'Interactive Lessons' },
  { value: '10K+', label: 'Active Learners' },
  { value: '95%', label: 'Accuracy Rate' },
];

export default function Home() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-white">
        <div className="absolute inset-0 bg-grid opacity-50" />
        <div className="container-page relative pt-16 pb-24 lg:pt-24 lg:pb-32">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-50 text-primary text-sm font-medium mb-6">
                <Sparkles size={16} />
                AI-Powered Sign Language Learning
              </div>
              <h1 className="text-4xl lg:text-6xl font-bold font-display text-gray-900 leading-tight mb-6">
                Learn Sign Language<br />
                <span className="text-gradient">With Confidence</span>
              </h1>
              <p className="text-lg text-gray-500 mb-8 max-w-xl mx-auto leading-relaxed">
                Master sign language through interactive lessons, real-time AI feedback, and personalized assessments. Start your journey today.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link to="/register">
                  <Button size="lg">
                    Get Started Free <ChevronRight size={18} />
                  </Button>
                </Link>
                <Link to="/courses">
                  <Button size="lg" variant="outline">
                    Explore Courses
                  </Button>
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-16 relative"
            >
              <div className="relative rounded-2xl overflow-hidden shadow-glow-lg border border-gray-100 bg-white">
                <div className="aspect-[16/9] bg-gradient-to-br from-primary-50 to-blue-50 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-20 h-20 rounded-2xl bg-primary flex items-center justify-center mx-auto mb-4 shadow-glow">
                      <Hand size={36} className="text-white" />
                    </div>
                    <p className="text-lg font-semibold text-gray-900">Interactive Learning Interface</p>
                    <p className="text-sm text-gray-500 mt-1">Practice with real-time AI feedback</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-surface border-y border-gray-100">
        <div className="container-page py-12">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <p className="text-3xl lg:text-4xl font-bold text-primary font-display">{stat.value}</p>
                <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 lg:py-28">
        <div className="container-page">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold font-display text-gray-900 mb-4">Everything you need to learn</h2>
            <p className="text-gray-500">A complete platform designed to take you from beginner to fluent signer.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Card hover className="h-full">
                  <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center mb-4">
                    <feature.icon size={22} className="text-primary" />
                  </div>
                  <h3 className="text-base font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{feature.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust */}
      <section className="py-20 bg-white border-t border-gray-100">
        <div className="container-page">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold font-display text-gray-900 mb-6">
                Why learners choose SignSpeak
              </h2>
              <div className="space-y-6">
                {[
                  { icon: Zap, title: 'Real-time Feedback', desc: 'Get instant corrections as you practice with your camera.' },
                  { icon: Shield, title: 'Privacy First', desc: 'Your camera data stays in your browser. Nothing is stored without consent.' },
                  { icon: Globe, title: 'Multiple Languages', desc: 'Learn ASL, BSL, Auslan, and more — all in one platform.' },
                ].map(item => (
                  <div key={item.title} className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center shrink-0">
                      <item.icon size={18} className="text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{item.title}</h4>
                      <p className="text-sm text-gray-500 mt-1">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-gradient-to-br from-primary-50 to-blue-50 rounded-3xl p-8 lg:p-12">
              <div className="bg-white rounded-2xl shadow-soft p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                    <Hand size={18} className="text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Practice Session</p>
                    <p className="text-xs text-gray-400">ASL Alphabet — Letter A</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full w-3/4 bg-success rounded-full" />
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">Confidence</span>
                    <span className="font-semibold text-success">75%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="container-page">
          <div className="bg-primary rounded-3xl p-8 lg:p-16 text-center text-white">
            <h2 className="text-3xl lg:text-4xl font-bold font-display mb-4">Ready to start learning?</h2>
            <p className="text-primary-100 max-w-lg mx-auto mb-8">Join thousands of learners mastering sign language with AI-powered guidance.</p>
            <Link to="/register">
              <Button size="lg" className="bg-white text-primary hover:bg-gray-100">
                Create Free Account
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
