import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Hand, BookOpen, Play, Award, Target, User, ChevronRight,
  Sparkles, Compass, TrendingUp, Clock
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import { Breadcrumb } from '../../components/layout/Breadcrumb';
import { MOCK_COURSES } from '../../constants/mockData';
import { SIGN_LANGUAGES, SKILL_LEVELS, LEARNING_GOALS } from '../../constants/navigation';

export default function Dashboard() {
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [preferences, setPreferences] = useState({
    language: '',
    level: '',
    goals: [],
  });

  const isNewUser = true; // Toggle to simulate returning user

  const toggleGoal = (goal) => {
    setPreferences(prev => ({
      ...prev,
      goals: prev.goals.includes(goal)
        ? prev.goals.filter(g => g !== goal)
        : [...prev.goals, goal]
    }));
  };

  const renderOnboarding = () => {
    if (onboardingStep === 0) {
      return (
        <Card className="mb-8">
          <div className="flex flex-col lg:flex-row items-center gap-8 p-4">
            <div className="w-20 h-20 rounded-2xl bg-primary-50 flex items-center justify-center shrink-0">
              <Sparkles size={36} className="text-primary" />
            </div>
            <div className="flex-1 text-center lg:text-left">
              <h2 className="text-xl font-bold text-gray-900 mb-2">Welcome to SignSpeak!</h2>
              <p className="text-gray-500 mb-4">Let's personalize your learning experience in just a few steps.</p>
              <Button onClick={() => setOnboardingStep(1)}>Get Started <ChevronRight size={16} /></Button>
            </div>
          </div>
        </Card>
      );
    }

    if (onboardingStep === 1) {
      return (
        <Card className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Which sign language do you want to learn?</h3>
          <div className="grid sm:grid-cols-2 gap-3 mb-6">
            {SIGN_LANGUAGES.map(lang => (
              <button
                key={lang.value}
                onClick={() => { setPreferences(p => ({ ...p, language: lang.value })); setOnboardingStep(2); }}
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  preferences.language === lang.value
                    ? 'border-primary bg-primary-50'
                    : 'border-gray-100 hover:border-gray-200'
                }`}
              >
                <p className="font-medium text-gray-900">{lang.label}</p>
              </button>
            ))}
          </div>
        </Card>
      );
    }

    if (onboardingStep === 2) {
      return (
        <Card className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">What's your current skill level?</h3>
          <div className="space-y-3 mb-6">
            {SKILL_LEVELS.map(level => (
              <button
                key={level.value}
                onClick={() => { setPreferences(p => ({ ...p, level: level.value })); setOnboardingStep(3); }}
                className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                  preferences.level === level.value
                    ? 'border-primary bg-primary-50'
                    : 'border-gray-100 hover:border-gray-200'
                }`}
              >
                <p className="font-medium text-gray-900">{level.label}</p>
                <p className="text-sm text-gray-500 mt-1">{level.description}</p>
              </button>
            ))}
          </div>
        </Card>
      );
    }

    if (onboardingStep === 3) {
      return (
        <Card className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">What are your learning goals?</h3>
          <div className="grid sm:grid-cols-2 gap-3 mb-6">
            {LEARNING_GOALS.map(goal => (
              <button
                key={goal.value}
                onClick={() => toggleGoal(goal.value)}
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  preferences.goals.includes(goal.value)
                    ? 'border-primary bg-primary-50'
                    : 'border-gray-100 hover:border-gray-200'
                }`}
              >
                <p className="font-medium text-gray-900">{goal.label}</p>
              </button>
            ))}
          </div>
          <Button
            onClick={() => setOnboardingStep(4)}
            disabled={preferences.goals.length === 0}
          >
            Continue <ChevronRight size={16} />
          </Button>
        </Card>
      );
    }

    return (
      <Card className="mb-8">
        <div className="flex flex-col lg:flex-row items-center gap-8 p-4">
          <div className="w-20 h-20 rounded-2xl bg-success-50 flex items-center justify-center shrink-0">
            <Target size={36} className="text-success" />
          </div>
          <div className="flex-1 text-center lg:text-left">
            <h2 className="text-xl font-bold text-gray-900 mb-2">You're all set!</h2>
            <p className="text-gray-500 mb-4">Based on your preferences, we've selected beginner courses to get you started.</p>
            <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
              <Link to="/courses">
                <Button>Browse Courses</Button>
              </Link>
              <Link to="/practice">
                <Button variant="outline">Start Practicing</Button>
              </Link>
            </div>
          </div>
        </div>
      </Card>
    );
  };

  return (
    <div className="max-w-6xl mx-auto">
      <Breadcrumb items={[{ label: 'Dashboard' }]} className="mb-6" />

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Your learning hub</p>
      </div>

      {isNewUser ? (
        <>
          {renderOnboarding()}

          <div className="grid lg:grid-cols-3 gap-6 mb-8">
            <Card className="lg:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <Compass size={20} className="text-primary" />
                <h3 className="font-semibold text-gray-900">Recommended for You</h3>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                {MOCK_COURSES.slice(0, 2).map(course => (
                  <Link key={course.id} to={`/course/${course.id}`} className="group">
                    <div className="flex gap-4 p-3 rounded-xl border border-gray-100 hover:border-primary-200 hover:shadow-soft transition-all">
                      <img src={course.image} alt={course.title} className="w-20 h-20 rounded-lg object-cover shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-gray-900 group-hover:text-primary transition-colors">{course.title}</p>
                        <p className="text-xs text-gray-400 mt-1">{course.lessonsCount} lessons · {course.duration}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </Card>

            <Card>
              <div className="flex items-center gap-3 mb-4">
                <TrendingUp size={20} className="text-primary" />
                <h3 className="font-semibold text-gray-900">Getting Started</h3>
              </div>
              <div className="space-y-3">
                {[
                  { label: 'Complete your profile', done: false },
                  { label: 'Take a skill assessment', done: false },
                  { label: 'Complete first lesson', done: false },
                  { label: 'Practice 5 signs', done: false },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${item.done ? 'bg-success border-success' : 'border-gray-300'}`}>
                      {item.done && <TrendingUp size={12} className="text-white" />}
                    </div>
                    <span className={`text-sm ${item.done ? 'text-gray-400 line-through' : 'text-gray-700'}`}>{item.label}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </>
      ) : (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-500">Courses Enrolled</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">—</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center">
                  <BookOpen size={20} className="text-primary" />
                </div>
              </div>
            </Card>
            <Card>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-500">Practice Sessions</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">—</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-success-50 flex items-center justify-center">
                  <Hand size={20} className="text-success" />
                </div>
              </div>
            </Card>
            <Card>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-500">Assessments</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">—</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-warning-50 flex items-center justify-center">
                  <Award size={20} className="text-warning" />
                </div>
              </div>
            </Card>
            <Card>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-500">Learning Time</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">—</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center">
                  <Clock size={20} className="text-primary" />
                </div>
              </div>
            </Card>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card>
                <h3 className="font-semibold text-gray-900 mb-4">Learning Progress</h3>
                <EmptyState
                  icon={TrendingUp}
                  title="No progress yet"
                  description="Your progress will appear here as you complete lessons and practice."
                  action={
                    <Link to="/courses">
                      <Button size="sm">Start Learning</Button>
                    </Link>
                  }
                />
              </Card>
            </div>
            <Card>
              <h3 className="font-semibold text-gray-900 mb-4">Recent Activity</h3>
              <EmptyState
                icon={Clock}
                title="No recent activity"
                description="Your practice history will appear here."
              />
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
