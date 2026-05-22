import React from 'react';
import { cn } from '../../utils/cn';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helper?: string;
}

export function Input({
  label,
  error,
  helper,
  className,
  id,
  ...props
}: InputProps) {
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
      <input
        id={inputId}
        className={cn(
          'w-full bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-lg px-3.5 py-2.5',
          'text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)]',
          'hover:border-[var(--border-strong)]',
          'focus-visible:outline-none focus-visible:border-[var(--border-focus)] focus-visible:shadow-[var(--shadow-focus)]',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          'transition-[border-color,box-shadow,background-color] duration-150',
          error && 'border-[var(--border-error)]',
          className
        )}
        aria-invalid={!!error}
        {...props}
      />
      {helper && !error && (
        <p className="mt-1.5 text-xs text-[var(--text-tertiary)]">{helper}</p>
      )}
      {error && (
        <p className="mt-1.5 text-xs text-[var(--text-error)]">{error}</p>
      )}
    </div>
  );
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helper?: string;
}

export function Textarea({
  label,
  error,
  helper,
  className,
  id,
  ...props
}: TextareaProps) {
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
      <textarea
        id={inputId}
        className={cn(
          'w-full bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-lg px-3.5 py-2.5',
          'text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)]',
          'hover:border-[var(--border-strong)]',
          'focus-visible:outline-none focus-visible:border-[var(--border-focus)] focus-visible:shadow-[var(--shadow-focus)]',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          'transition-[border-color,box-shadow,background-color] duration-150 resize-none',
          error && 'border-[var(--border-error)]',
          className
        )}
        aria-invalid={!!error}
        {...props}
      />
      {helper && !error && (
        <p className="mt-1.5 text-xs text-[var(--text-tertiary)]">{helper}</p>
      )}
      {error && (
        <p className="mt-1.5 text-xs text-[var(--text-error)]">{error}</p>
      )}
    </div>
  );
}
