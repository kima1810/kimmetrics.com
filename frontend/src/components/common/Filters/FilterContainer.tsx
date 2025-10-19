import React, { useState } from 'react';

interface FilterContainerProps {
  children: React.ReactNode;
  title?: string;
  defaultOpen?: boolean;
  headerRight?: React.ReactNode;
}

export function FilterContainer({ children, title = "Filters", defaultOpen = false, headerRight }: FilterContainerProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="mb-6 filters box">
      <div className="flex items-center justify-between">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors duration-150"
        >
          <span className="text-xs font-medium text-gray-900">
            {title}
          </span>
          <span className="text-gray-500">
            {isOpen ? '↑' : '↓'}
          </span>
        </button>

        {isOpen && headerRight && (
          <div className="ml-2">
            {headerRight}
          </div>
        )}
      </div>
      
      {isOpen && (
        <div className="mt-4 p-3 bg-white border border-gray-200 rounded-md shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {children}
          </div>
        </div>
      )}
    </div>
  );
}
