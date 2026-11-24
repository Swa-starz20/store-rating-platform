import React from 'react';
import { AlertCircle } from 'lucide-react';

const Input = ({
  label,
  id,
  type = 'text',
  value,
  onChange,
  error,
  hint,
  placeholder,
  required = false,
  maxLength,
  minLength,
  showCharCount = false,
  disabled = false,
  className = '',
  rows,
  ...props
}) => {
  const isTextarea = type === 'textarea';
  const charLength = value ? String(value).length : 0;

  return (
    <div className={`w-full ${className}`}>
      <div className="flex items-center justify-between mb-1.5">
        {label && (
          <label htmlFor={id} className="block text-xs font-semibold text-slate-700">
            {label} {required && <span className="text-rose-500">*</span>}
          </label>
        )}
        {showCharCount && (
          <span className={`text-[11px] font-mono ${
            (minLength && charLength < minLength) || (maxLength && charLength > maxLength)
              ? 'text-amber-600 font-semibold'
              : 'text-slate-400'
          }`}>
            {charLength}
            {maxLength ? `/${maxLength}` : ''} chars
            {minLength && charLength < minLength ? ` (min ${minLength})` : ''}
          </span>
        )}
      </div>

      <div className="relative">
        {isTextarea ? (
          <textarea
            id={id}
            rows={rows || 3}
            value={value}
            onChange={onChange}
            disabled={disabled}
            placeholder={placeholder}
            maxLength={maxLength}
            className={`w-full px-3.5 py-2.5 text-sm bg-white border rounded-xl focus:outline-none transition shadow-2xs resize-none ${
              error
                ? 'border-rose-400 focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500'
                : 'border-slate-200 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500'
            } ${disabled ? 'bg-slate-50 text-slate-400 cursor-not-allowed' : 'text-slate-800'}`}
            {...props}
          />
        ) : (
          <input
            id={id}
            type={type}
            value={value}
            onChange={onChange}
            disabled={disabled}
            placeholder={placeholder}
            maxLength={maxLength}
            className={`w-full px-3.5 py-2.5 text-sm bg-white border rounded-xl focus:outline-none transition shadow-2xs ${
              error
                ? 'border-rose-400 focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500'
                : 'border-slate-200 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500'
            } ${disabled ? 'bg-slate-50 text-slate-400 cursor-not-allowed' : 'text-slate-800'}`}
            {...props}
          />
        )}
      </div>

      {error ? (
        <div className="flex items-center space-x-1.5 mt-1 text-xs text-rose-600 font-medium animate-fadeIn">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      ) : hint ? (
        <p className="mt-1 text-[11px] text-slate-400">{hint}</p>
      ) : null}
    </div>
  );
};

export default Input;
