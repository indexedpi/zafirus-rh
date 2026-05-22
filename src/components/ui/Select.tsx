import React from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '../../utils/cn';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helper?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}

export function Select({
  label,
  error,
  helper,
  options,
  placeholder,
  className,
  id,
  ...props
}: SelectProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="block mb-1.5 text-[13px] font-medium text-[var(--text-secondary)]"
        >
          {label}
        </label>
      )}
      <div className="relative">
        <select
          id={inputId}
          className={cn(
            'w-full appearance-none bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-lg px-3.5 py-2.5 pr-10',
            'text-sm text-[var(--text-primary)]',
            'hover:border-[var(--border-strong)]',
            'focus-visible:outline-none focus-visible:border-[var(--border-focus)] focus-visible:shadow-[var(--shadow-focus)]',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'transition-[border-color,box-shadow,background-color] duration-150',
            error && 'border-[var(--border-error)]',
            !props.value && 'text-[var(--text-tertiary)]',
            className
          )}
          aria-invalid={!!error}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)] pointer-events-none" />
      </div>
      {helper && !error && (
        <p className="mt-1.5 text-xs text-[var(--text-tertiary)]">{helper}</p>
      )}
      {error && (
        <p className="mt-1.5 text-xs text-[var(--text-error)]">{error}</p>
      )}
    </div>
  );
}
