import { Link } from 'react-router-dom';
import { Award, TrendingUp, BookOpen, ArrowRight, RotateCcw } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Breadcrumb } from '../../components/layout/Breadcrumb';
import { EmptyState } from '../../components/ui/EmptyState';

export default function AssessmentResults() {
  return (
    <div className="max-w-4xl mx-auto">
      <Breadcrumb items={[{ label: 'Assessments', path: '/assessments' }, { label: 'Results' }]} className="mb-6" />
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Assessment Results</h1>
        <p className="text-sm text-gray-500 mt-1">Review your performance and identify areas to improve</p>
      </div>
      <EmptyState
        icon={Award}
        title="No assessment results yet"
        description="Complete an assessment to see your score, accuracy breakdown, and personalized recommendations."
        action={
          <Link to="/assessments"><Button><ArrowRight size={16} /> Go to Assessments</Button></Link>
        }
      />
    </div>
  );
}
