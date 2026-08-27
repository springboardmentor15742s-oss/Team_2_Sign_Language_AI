import { forwardRef } from 'react';
import { classNames } from '../../utils/helpers';

export const Input = forwardRef(function Input(
  { label, error, helper, className = '', icon: Icon, ...props },
  ref
) {
  return (
    <div className={classNames('w-full', className)}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <Icon size={18} />
          </div>
        )}
        <input
          ref={ref}
          className={classNames(
            'w-full rounded-xl border bg-white px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 transition-all duration-200',
            'focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none',
            error ? 'border-danger focus:border-danger focus:ring-danger/20' : 'border-gray-200',
            Icon ? 'pl-10' : ''
          )}
          {...props}
        />
      </div>
      {error && <p className="mt-1.5 text-xs text-danger font-medium">{error}</p>}
      {helper && !error && <p className="mt-1.5 text-xs text-gray-500">{helper}</p>}
    </div>
  );
});
