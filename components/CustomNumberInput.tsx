import React from 'react';

interface CustomNumberInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  min?: number;
  max?: number;
}

const CustomNumberInput: React.FC<CustomNumberInputProps> = ({ id, label, value, onChange, min = 0, max }) => {
  const handleValueChange = (newValue: number) => {
    if (min !== undefined && newValue < min) {
      newValue = min;
    }
    if (max !== undefined && newValue > max) {
      newValue = max;
    }
    onChange(String(newValue));
  };

  const handleIncrement = () => {
    const currentValue = parseInt(value, 10) || 0;
    handleValueChange(currentValue + 1);
  };

  const handleDecrement = () => {
    const currentValue = parseInt(value, 10) || 0;
    handleValueChange(currentValue - 1);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
     const cleanValue = e.target.value.replace(/[^0-9]/g, '');
     onChange(cleanValue);
  }
  
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const currentValue = parseInt(e.target.value, 10) || 0;
    handleValueChange(currentValue);
  }

  return (
    <div className="flex-1">
      <label htmlFor={id} className="block text-sm font-medium text-text-secondary mb-1">{label}</label>
      <div className="relative">
        <input
          type="number"
          id={id}
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          className="w-full bg-primary text-text-main pl-3 pr-10 py-2 border border-border-color rounded-md focus:ring-accent focus:border-accent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          min={min}
          max={max}
          required
        />
        <div className="absolute inset-y-0 right-0 flex flex-col items-center justify-center w-8 border-l border-border-color rounded-r-md overflow-hidden">
          <button
            type="button"
            onClick={handleIncrement}
            className="h-1/2 w-full flex items-center justify-center text-text-secondary hover:text-white hover:bg-accent active:bg-accent-hover transition-colors"
            aria-label={`Increase ${label}`}
            tabIndex={-1}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7"></path></svg>
          </button>
          <button
            type="button"
            onClick={handleDecrement}
            className="h-1/2 w-full flex items-center justify-center text-text-secondary hover:text-white hover:bg-accent active:bg-accent-hover border-t border-border-color transition-colors"
             aria-label={`Decrease ${label}`}
             tabIndex={-1}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomNumberInput;