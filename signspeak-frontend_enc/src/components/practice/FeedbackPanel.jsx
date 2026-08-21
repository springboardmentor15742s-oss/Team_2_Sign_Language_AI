import { CheckCircle, XCircle, AlertCircle, Lightbulb } from 'lucide-react';
import { Card } from '../ui/Card';

export function FeedbackPanel({ feedback }) {
  if (!feedback) return null;

  const icons = {
    success: <CheckCircle size={20} className="text-success" />,
    error: <XCircle size={20} className="text-danger" />,
    warning: <AlertCircle size={20} className="text-warning" />,
    tip: <Lightbulb size={20} className="text-primary" />,
  };

  const borders = {
    success: 'border-success-100 bg-success-50',
    error: 'border-danger-100 bg-danger-50',
    warning: 'border-warning-100 bg-warning-50',
    tip: 'border-primary-100 bg-primary-50',
  };

  return (
    <Card className={`border ${borders[feedback.type] || borders.tip}`}>
      <div className="flex items-start gap-3">
        {icons[feedback.type] || icons.tip}
        <div>
          <p className="text-sm font-medium text-gray-900">{feedback.title}</p>
          <p className="text-sm text-gray-600 mt-1">{feedback.message}</p>
        </div>
      </div>
    </Card>
  );
}
