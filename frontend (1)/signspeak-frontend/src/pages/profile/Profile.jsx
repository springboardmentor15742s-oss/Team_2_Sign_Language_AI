import { Link } from 'react-router-dom';
import { User, Mail, Calendar, MapPin, BookOpen, Award, Hand, TrendingUp } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Breadcrumb } from '../../components/layout/Breadcrumb';
import { EmptyState } from '../../components/ui/EmptyState';

export default function Profile() {
  return (
    <div className="max-w-4xl mx-auto">
      <Breadcrumb items={[{ label: 'Profile' }]} className="mb-6" />

      <div className="bg-white rounded-2xl shadow-card border border-gray-100 overflow-hidden mb-6">
        <div className="h-32 bg-gradient-to-r from-primary to-secondary" />
        <div className="px-6 pb-6">
          <div className="relative -mt-12 mb-4">
            <div className="w-24 h-24 rounded-2xl bg-white p-1">
              <div className="w-full h-full rounded-xl bg-primary-100 flex items-center justify-center">
                <User size={36} className="text-primary" />
              </div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Learner</h1>
              <p className="text-sm text-gray-500">Beginner · ASL</p>
            </div>
            <Link to="/profile/edit">
              <Button variant="outline" size="sm">Edit Profile</Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <h3 className="font-semibold text-gray-900 mb-4">About</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3 text-gray-600">
                <Mail size={16} className="text-gray-400" />
                <span>learner@example.com</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600">
                <Calendar size={16} className="text-gray-400" />
                <span>Joined recently</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600">
                <MapPin size={16} className="text-gray-400" />
                <span>Not set</span>
              </div>
            </div>
          </Card>

          <Card>
            <h3 className="font-semibold text-gray-900 mb-4">Learning Preferences</h3>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-400 mb-1.5">Sign Language</p>
                <Badge>American Sign Language (ASL)</Badge>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1.5">Skill Level</p>
                <Badge variant="success">Beginner</Badge>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1.5">Goals</p>
                <div className="flex flex-wrap gap-1.5">
                  <Badge variant="gray">Daily Conversation</Badge>
                </div>
              </div>
            </div>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <Card>
            <h3 className="font-semibold text-gray-900 mb-4">Progress Overview</h3>
            <EmptyState
              icon={TrendingUp}
              title="No progress yet"
              description="Complete lessons and practice to see your progress here."
              action={
                <Link to="/courses">
                  <Button size="sm">Explore Courses</Button>
                </Link>
              }
            />
          </Card>

          <Card>
            <h3 className="font-semibold text-gray-900 mb-4">Practice History</h3>
            <EmptyState
              icon={Hand}
              title="No practice sessions yet"
              description="Your practice history will appear here after you start practicing."
              action={
                <Link to="/practice">
                  <Button size="sm">Start Practicing</Button>
                </Link>
              }
            />
          </Card>

          <Card>
            <h3 className="font-semibold text-gray-900 mb-4">Assessment History</h3>
            <EmptyState
              icon={Award}
              title="No assessments yet"
              description="Take assessments to track your proficiency."
              action={
                <Link to="/assessments">
                  <Button size="sm">View Assessments</Button>
                </Link>
              }
            />
          </Card>
        </div>
      </div>
    </div>
  );
}
