import { motion } from 'framer-motion';

export function ConfidenceMeter({ value = 0, label = 'Confidence' }) {
  const percentage = Math.min(100, Math.max(0, value));
  const color = percentage >= 80 ? 'bg-success' : percentage >= 50 ? 'bg-warning' : 'bg-danger';

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-gray-700">{label}</span>
        <span className="font-semibold text-gray-900">{percentage}%</span>
      </div>
      <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${color}`}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ type: 'spring', damping: 20, stiffness: 100 }}
        />
      </div>
    </div>
  );
}
