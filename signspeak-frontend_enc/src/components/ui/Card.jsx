import { classNames } from '../../utils/helpers';

export function Card({ children, className = '', padding = 'normal', hover = false, ...props }) {
  const paddings = {
    none: '',
    small: 'p-4',
    normal: 'p-5',
    large: 'p-6',
  };

  return (
    <div
      className={classNames(
        'bg-card rounded-2xl border border-slate-800/90 shadow-card text-slate-100',
        paddings[padding],
        hover && 'transition-all duration-200 hover:border-slate-700 hover:-translate-y-0.5 hover:shadow-soft',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
