// /src/components/ui/checkbox.tsx
import React, { forwardRef } from 'react';

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  onCheckedChange?: (checked: boolean) => void;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, onCheckedChange, ...props }, ref) => {
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      if (onCheckedChange) {
        onCheckedChange(event.target.checked);
      }
    };

    return (
      <label className="flex items-center space-x-2 cursor-pointer">
        <div className="relative">
          <input
            type="checkbox"
            ref={ref}
            className="sr-only"
            onChange={handleChange}
            {...props}
          />
          <div className={`w-5 h-5 border-2 rounded transition-all duration-200 ease-in-out ${
            props.checked ? 'bg-blue-500 border-blue-500' : 'bg-white border-gray-300'
          }`}>
            <svg className={`w-4 h-4 text-white fill-current ${props.checked ? 'opacity-100' : 'opacity-0'} transition-opacity duration-200 ease-in-out`} viewBox="0 0 20 20">
              <path d="M0 11l2-2 5 5L18 3l2 2L7 18z" />
            </svg>
          </div>
        </div>
        {label && <span className="text-sm">{label}</span>}
      </label>
    );
  }
);

Checkbox.displayName = 'Checkbox';