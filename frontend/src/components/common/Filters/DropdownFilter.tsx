// Using the new JSX transform — explicit React import not required
import type { DropdownOption } from '../../../types/common';

interface DropdownFilterProps {
  value: string | null;
  options: DropdownOption[];
  onChange: (value: string | null) => void;
  label: string;
  placeholder?: string;
}

export function DropdownFilter({ value, options, onChange, label, placeholder = "Select..." }: DropdownFilterProps) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </label>
      <select
        value={value || ''}
        onChange={(e) => onChange(e.target.value || null)}
        className="inline-block w-auto min-w-[10rem] px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 text-sm"
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
