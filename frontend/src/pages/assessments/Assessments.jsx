import { Link } from 'react-router-dom';
import { ClipboardCheck, Clock, BarChart3, ArrowRight } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';
import { Breadcrumb } from '../../components/layout/Breadcrumb';

const assessments = [
  { id: 'a1', title: 'ASL Alphabet Assessment', questions: 26, duration: '15 min', difficulty: 'beginner', status: 'available' },
  { id: 'a2', title: 'Greetings & Introductions', questions: 12, duration: '10 min', difficulty: 'beginner', status: 'available' },
  { id: 'a3', title: 'Numbers Proficiency', questions: 20, duration: '12 min', difficulty: 'intermediate', status: 'locked' },
];

export default function Assessments() {
  return (
    <div className="max-w-4xl mx-auto">
      <Breadcrumb items={[{ label: 'Assessments' }]} className="mb-6" />
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Assessments</h1>
        <p className="text-sm text-gray-500 mt-1">Test your knowledge and earn certificates</p>
      </div>
      <div className="space-y-4">
        {assessments.map(a => (
          <Card key={a.id} className={a.status === 'locked' ? 'opacity-60' : ''}>
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center shrink-0">
                <ClipboardCheck size={22} className="text-primary" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-gray-900">{a.title}</h3>
                  <Badge variant={a.difficulty === 'beginner' ? 'success' : a.difficulty === 'intermediate' ? 'warning' : 'danger'}>{a.difficulty}</Badge>
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-400">
                  <span className="flex items-center gap-1"><ClipboardCheck size={12} /> {a.questions} questions</span>
                  <span className="flex items-center gap-1"><Clock size={12} /> {a.duration}</span>
                </div>
              </div>
              {a.status === 'available' ? (
                <Link to={`/assessment/${a.id}`}><Button size="sm">Start <ArrowRight size={14} /></Button></Link>
              ) : (
                <Badge variant="gray">Locked</Badge>
              )}
            </div>
          </Card>
        ))}
      </div>
      <Card className="mt-8">
        <h3 className="font-semibold text-gray-900 mb-4">Your Results</h3>
        <EmptyState icon={BarChart3} title="No assessments taken yet" description="Complete an assessment to see your results and track your progress." />
      </Card>
    </div>
  );
}
