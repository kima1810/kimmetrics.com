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
      return sortConfig.direction === 'desc' ? ' ▼' : ' ▲';
    }
    
    return ' ⇅';
  };

  return (
    <thead>
      <tr>
        {columns.map((column) => (
          <th
            key={column.key}
            className={column.sortable ? 'sortable' : ''}
            onClick={() => column.sortable && onSort(column.key)}
          >
            {column.label}{getSortIcon(column)}
          </th>
        ))}
      </tr>
    </thead>
  );
}
