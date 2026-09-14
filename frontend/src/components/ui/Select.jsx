import { forwardRef } from 'react';
import { classNames } from '../../utils/helpers';
import { ChevronDown } from 'lucide-react';

export const Select = forwardRef(function Select(
  {
    label,
    error,
    helper,
    options = [],
    className = '',
    ...props
  },
  ref
) {
  return (
    <div className={classNames('w-full', className)}>
      {label && (
        <label
          className="
            block
            mb-1.5
            text-sm
            font-medium
          "
          style={{ color: 'var(--ss-text)' }}
        >
          {label}
        </label>
      )}

      <div className="relative">
        <select
          ref={ref}
          className={classNames(
            `
              ss-select
              w-full
              appearance-none
              rounded-xl
              border
              px-4
              py-2.5
              pr-10
              text-sm
              font-medium
              outline-none
              cursor-pointer
              transition-all
              duration-200
            `,
            error ? 'ss-select-error' : ''
          )}
          {...props}
        >
          {options.map((opt) => (
            <option
              key={opt.value}
              value={opt.value}
            >
              {opt.label}
            </option>
          ))}
        </select>

        <ChevronDown
          size={16}
          className="
            absolute
            right-3
            top-1/2
            -translate-y-1/2
            pointer-events-none
          "
          style={{
            color: 'var(--ss-text-soft)',
          }}
        />
      </div>

      {error && (
        <p className="mt-1.5 text-xs font-medium text-red-500">
          {error}
        </p>
      )}

      {helper && !error && (
        <p
          className="mt-1.5 text-xs"
          style={{
            color: 'var(--ss-text-soft)',
          }}
        >
          {helper}
        </p>
      )}
    </div>
  );
});
