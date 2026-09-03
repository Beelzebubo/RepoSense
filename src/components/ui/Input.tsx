import { forwardRef, type InputHTMLAttributes } from 'react';

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'prefix'> {
  label?: string;
  error?: string;
  prefix?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, prefix, className = '', id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="mb-1.5 block text-xs font-medium text-text-secondary font-ui"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {prefix && (
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-text-tertiary font-mono-ui">
              {prefix}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={`
              w-full rounded-md border bg-bg-input px-3 py-2.5 text-sm text-text-primary
              placeholder:text-text-tertiary
              focus:border-border-focus focus:bg-bg-input-focus focus:outline-none
              focus:ring-2 focus:ring-accent/20 focus:ring-offset-0
              disabled:cursor-not-allowed disabled:opacity-50
              transition-colors duration-200
              ${prefix ? 'pl-9' : 'pl-3'} pr-3
              ${error ? 'border-error focus:border-error' : 'border-border'}
              ${className}
            `}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={error ? `${inputId}-error` : undefined}
            {...props}
          />
        </div>
        {error && (
          <p id={`${inputId}-error`} className="mt-1.5 text-xs text-error font-ui">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';