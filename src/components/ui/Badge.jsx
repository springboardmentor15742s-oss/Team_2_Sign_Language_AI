import { classNames } from '../../utils/helpers';

const variants = {
  primary: 'bg-primary-50 text-primary-700',
  success: 'bg-success-50 text-green-700',
  warning: 'bg-warning-50 text-amber-700',
  danger: 'bg-danger-50 text-red-700',
  gray: 'bg-gray-100 text-gray-700',
};

export function Badge({ children, variant = 'primary', className = '' }) {
  return (
    <span className={classNames(
      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
      variants[variant],
      className
    )}>
      {children}
    </span>
  );
}
