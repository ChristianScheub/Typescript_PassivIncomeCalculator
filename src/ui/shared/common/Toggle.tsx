import React from 'react';

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  id: string;
  label?: string;
}

export const Toggle: React.FC<ToggleProps> = ({ checked, onChange, id, label }) => {
  return (
    <div className="relative inline-block w-14 h-8 flex-shrink-0">
      <input
        type="checkbox"
        className="peer sr-only"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        id={id}
      />
      <label
        className="peer-checked:after:translate-x-6 peer-checked:bg-blue-500 block h-8 w-14 cursor-pointer rounded-full bg-gray-200 after:absolute after:left-1 after:top-1 after:h-6 after:w-6 after:rounded-full after:bg-white after:transition-transform"
        htmlFor={id}
      >
        {label && <span className="sr-only">{label}</span>}
      </label>
    </div>
  );
};
