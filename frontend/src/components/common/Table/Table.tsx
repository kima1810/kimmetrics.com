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
      <div style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className={`nhl-table-wrapper ${className}`}>
      <table className="nhl-standings-table">
        <TableHeader columns={columns} sortConfig={sortConfig} onSort={onSort} />
        <tbody>
          {data.map((row: any, index) => (
            <tr key={row.id || index}>
              {columns.map((column) => {
                const value = row[column.key];
                const displayValue = column.formatter ? column.formatter(value, row) : value;
                
                return (
                  <td key={column.key}>
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
