import React from 'react';
import type { TableColumn, SortConfig } from '../../../types/common';
import { TableHeader } from './TableHeader';

interface TableProps<T> {
  data: T[];
  columns: TableColumn<T>[];
  sortConfig: SortConfig | null;
  onSort: (key: string) => void;
  className?: string;
  emptyMessage?: string;
}

export function Table<T>({ 
  data, 
  columns, 
  sortConfig, 
  onSort, 
  className = '',
  emptyMessage = 'No data available'
}: TableProps<T>) {
  if (data.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500 dark:text-gray-400">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className={`overflow-x-auto shadow-md rounded-lg ${className}`}>
      <table className="min-w-full bg-white dark:bg-gray-900">
        <TableHeader columns={columns} sortConfig={sortConfig} onSort={onSort} />
        <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
          {data.map((row: any, index) => (
            <tr 
              key={row.id || index}
              className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-150"
            >
              {columns.map((column) => {
                const value = row[column.key];
                const displayValue = column.formatter ? column.formatter(value, row) : value;
                
                return (
                  <td
                    key={column.key}
                    className={`
                      px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100
                      ${column.align === 'center' ? 'text-center' : column.align === 'right' ? 'text-right' : 'text-left'}
                    `}
                  >
                    {displayValue}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
