import { InputHTMLAttributes } from 'react';

interface InputFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label: string;
  description?: string;
  error?: string;
  value: string | number;
  onChange: (value: string) => void;
  fullWidth?: boolean;
}

export function InputField({
  label,
  description,
  error,
  value,
  onChange,
  fullWidth = false,
  ...inputProps
}: InputFieldProps) {
  return (
    <div className={fullWidth ? '' : 'flex-1'}>
      <label className="block text-sm font-semibold text-gray-900 mb-2">
        {label}
      </label>
      <input
        {...inputProps}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full px-3 py-2 border rounded-lg text-sm bg-white text-gray-900 focus:outline-none focus:ring-2 transition-all ${
          error
            ? 'border-red-300 focus:ring-red-500'
            : 'border-gray-300 focus:ring-blue-500'
        }`}
      />
      {description && !error && (
        <p className="text-xs text-gray-500 mt-1">{description}</p>
      )}
      {error && (
        <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}
