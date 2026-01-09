import React, { useState, useRef, useEffect } from 'react';

interface CategoryDropdownProps {
  value: string;
  onChange: (value: string) => void;
  categories: string[];
  placeholder?: string;
}

const CategoryDropdown: React.FC<CategoryDropdownProps> = ({ value, onChange, categories, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const filteredCategories = value 
    ? categories.filter(cat => cat.toLowerCase().includes(value.toLowerCase()))
    : categories;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={containerRef}>
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        onFocus={() => setIsOpen(true)}
        className="w-full bg-primary text-text-main px-3 py-2 border border-border-color rounded-md focus:ring-accent focus:border-accent"
        placeholder={placeholder}
        autoComplete="off"
        required
      />
      {isOpen && (
        <ul className="absolute z-10 w-full bg-secondary border border-border-color rounded-md mt-1 max-h-40 overflow-y-auto shadow-lg">
          {filteredCategories.length > 0 ? filteredCategories.map(cat => (
            <li
              key={cat}
              onClick={() => {
                onChange(cat);
                setIsOpen(false);
              }}
              className="px-3 py-2 text-text-main hover:bg-accent hover:text-white cursor-pointer"
            >
              {cat}
            </li>
          )) : (
             <li className="px-3 py-2 text-text-secondary italic">Type to create a new category</li>
          )}
        </ul>
      )}
    </div>
  );
};

export default CategoryDropdown;
