import { TextareaHTMLAttributes } from 'react';

interface TextAreaFieldProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'onChange'> {
  label: string;
  description?: string;
  value: string;
  onChange: (value: string) => void;
}

export function TextAreaField({
  label,
  description,
  value,
  onChange,
  rows = 3,
  ...textareaProps
}: TextAreaFieldProps) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-900 mb-2">
        {label}
      </label>
      <textarea
        {...textareaProps}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
      />
      {description && (
        <p className="text-xs text-gray-500 mt-1">{description}</p>
      )}
    </div>
  );
}
