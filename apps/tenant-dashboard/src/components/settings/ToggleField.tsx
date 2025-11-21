interface ToggleFieldProps {
  label: string;
  description?: string;
  value: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
}

export function ToggleField({ label, description, value, onChange, disabled = false }: ToggleFieldProps) {
  return (
    <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200">
      <div className="flex-1">
        <p className="text-sm font-semibold text-gray-900">{label}</p>
        {description && (
          <p className="text-xs text-gray-500 mt-0.5">{description}</p>
        )}
      </div>
      <button
        type="button"
        onClick={() => !disabled && onChange(!value)}
        disabled={disabled}
        className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
          disabled
            ? 'bg-gray-300 cursor-not-allowed'
            : value
            ? 'bg-blue-600 cursor-pointer'
            : 'bg-gray-300 cursor-pointer hover:bg-gray-400'
        }`}
      >
        <span
          className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
            value ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
}
