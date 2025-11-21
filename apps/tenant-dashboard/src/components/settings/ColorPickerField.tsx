interface ColorPickerFieldProps {
  label: string;
  description?: string;
  value: string;
  onChange: (value: string) => void;
}

export function ColorPickerField({ label, description, value, onChange }: ColorPickerFieldProps) {
  return (
    <div className="flex-1">
      <label className="block text-sm font-semibold text-gray-900 mb-2">
        {label}
      </label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-10 h-10 rounded-lg border-2 border-gray-300 cursor-pointer hover:border-blue-400 transition-colors"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white text-gray-900 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="#4c86f0"
          pattern="^#[0-9A-Fa-f]{6}$"
        />
      </div>
      {description && (
        <p className="text-xs text-gray-500 mt-1">{description}</p>
      )}
    </div>
  );
}
