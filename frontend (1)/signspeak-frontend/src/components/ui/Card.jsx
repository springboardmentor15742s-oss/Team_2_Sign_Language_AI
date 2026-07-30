import { classNames } from '../../utils/helpers';

export function Card({ children, className = '', padding = 'normal', hover = false }) {
  const paddings = {
    none: '',
    small: 'p-4',
    normal: 'p-6',
    large: 'p-8',
  };

  return (
    <div
      className={classNames(
        'bg-white rounded-2xl border border-gray-100 shadow-card',
        paddings[padding],
        hover && 'transition-all duration-200 hover:shadow-soft hover:-translate-y-0.5',
        className
      )}
    >
      {children}
    </div>
  );
}
