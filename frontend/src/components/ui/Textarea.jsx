import { forwardRef } from 'react';
import { classNames } from '../../utils/helpers';

export const Textarea = forwardRef(function Textarea(
  { label, error, helper, className = '', rows = 4, ...props },
  ref
) {
  return (
    <div className={classNames('w-full', className)}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        rows={rows}
        className={classNames(
          'w-full rounded-xl border bg-white px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 transition-all duration-200 resize-none',
          'focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none',
          error ? 'border-danger focus:border-danger focus:ring-danger/20' : 'border-gray-200'
        )}
        {...props}
      />
      {error && <p className="mt-1.5 text-xs text-danger font-medium">{error}</p>}
      {helper && !error && <p className="mt-1.5 text-xs text-gray-500">{helper}</p>}
    </div>
  );
});
