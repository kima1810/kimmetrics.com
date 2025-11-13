import React, { useState } from 'react';

interface FilterContainerProps {
  children: React.ReactNode;
  title?: string;
  defaultOpen?: boolean;
}

export function FilterContainer({ children, title = "Filters", defaultOpen = false }: FilterContainerProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="mb-6">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors duration-150"
      >
        <span className="text-lg font-medium text-gray-900 dark:text-gray-100">
          {title}
        </span>
        <span className="text-gray-500">
          {isOpen ? '↑' : '↓'}
        </span>
      </button>
      
      {isOpen && (
        <div className="mt-4 p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {children}
          </div>
        </div>
      )}
    </div>
  );
}
