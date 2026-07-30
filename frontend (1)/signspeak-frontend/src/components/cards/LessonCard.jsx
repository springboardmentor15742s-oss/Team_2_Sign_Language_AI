import { Play, Lock, CheckCircle } from 'lucide-react';
import { classNames } from '../../utils/helpers';

export function LessonCard({ lesson, index, isLocked = false, isCompleted = false, onClick }) {
  return (
    <button
      onClick={onClick}
      disabled={isLocked}
      className={classNames(
        'w-full flex items-center gap-4 p-4 rounded-xl border transition-all duration-200 text-left',
        isLocked
          ? 'border-gray-100 bg-gray-50 opacity-60 cursor-not-allowed'
          : 'border-gray-200 bg-white hover:border-primary-200 hover:shadow-soft cursor-pointer'
      )}
    >
      <div className={classNames(
        'w-10 h-10 rounded-xl flex items-center justify-center shrink-0',
        isCompleted ? 'bg-success-50 text-success' :
        isLocked ? 'bg-gray-100 text-gray-400' :
        'bg-primary-50 text-primary'
      )}>
        {isCompleted ? <CheckCircle size={20} /> :
         isLocked ? <Lock size={18} /> :
         <Play size={18} />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">{lesson.title}</p>
        <p className="text-xs text-gray-400 mt-0.5">{lesson.duration}</p>
      </div>
      <span className="text-xs font-medium text-gray-400 shrink-0">{String(index + 1).padStart(2, '0')}</span>
    </button>
  );
}
