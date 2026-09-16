import {
  CheckCircle,
  XCircle,
  AlertCircle,
  Lightbulb,
} from 'lucide-react';

import { Card } from '../ui/Card';

export function FeedbackPanel({ feedback }) {
  if (!feedback) return null;

  const icons = {
    success: (
      <CheckCircle
        size={20}
        className="text-success"
      />
    ),

    error: (
      <XCircle
        size={20}
        className="text-danger"
      />
    ),

    warning: (
      <AlertCircle
        size={20}
        className="text-[var(--ss-copper)]"
      />
    ),

    tip: (
      <Lightbulb
        size={20}
        className="text-[var(--ss-primary)]"
      />
    ),
  };

  const states = {
    success: 'ss-feedback-success',
    error: 'ss-feedback-error',
    warning: 'ss-feedback-warning',
    tip: 'ss-feedback-info',
  };

  return (
    <Card
      className={`border ${
        states[feedback.type] ||
        states.tip
      }`}
    >
      <div className="flex items-start gap-3">

        {icons[feedback.type] || icons.tip}

        <div>

          <p className="text-sm font-semibold text-[var(--ss-text)]">
            {feedback.title}
          </p>

          <p className="mt-1 text-sm leading-6 text-[var(--ss-text-soft)]">
            {feedback.message}
          </p>

        </div>

      </div>
    </Card>
  );
}
