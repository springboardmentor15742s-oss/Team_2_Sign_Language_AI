import { forwardRef } from 'react';
import { classNames } from '../../utils/helpers';
import { ChevronDown } from 'lucide-react';

export const Select = forwardRef(function Select(
  { label, error, helper, options = [], className = '', ...props },
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
        <select
          ref={ref}
          className={classNames(
            'w-full rounded-xl border bg-white px-4 py-2.5 text-sm text-gray-900 appearance-none transition-all duration-200',
            'focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none',
            error ? 'border-danger focus:border-danger focus:ring-danger/20' : 'border-gray-200'
          )}
          {...props}
        >
          {options.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
      </div>
      {error && <p className="mt-1.5 text-xs text-danger font-medium">{error}</p>}
      {helper && !error && <p className="mt-1.5 text-xs text-gray-500">{helper}</p>}
    </div>
  );
});
