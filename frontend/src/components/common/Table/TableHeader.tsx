import React from 'react';
import type { TableColumn, SortConfig } from '../../../types/common';

interface TableHeaderProps<T> {
  columns: TableColumn<T>[];
  sortConfig: SortConfig | null;
  onSort: (key: string) => void;
}

export function TableHeader<T>({ columns, sortConfig, onSort }: TableHeaderProps<T>) {
  const getSortIcon = (column: TableColumn<T>) => {
    if (!column.sortable) return null;
    
    if (sortConfig?.key === column.key) {
      return sortConfig.direction === 'desc' ? ' ↓' : ' ↑';
    }
    
    return ' ↕';
  };

  return (
    <thead className="bg-gray-50 dark:bg-gray-800">
      <tr>
        {columns.map((column) => (
          <th
            key={column.key}
            className={`
              px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider
              ${column.sortable ? 'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700' : ''}
              ${column.align === 'center' ? 'text-center' : column.align === 'right' ? 'text-right' : 'text-left'}
            `}
            style={{ width: column.width }}
            onClick={() => column.sortable && onSort(column.key)}
          >
            {column.label}{getSortIcon(column)}
          </th>
        ))}
      </tr>
    </thead>
  );
}
