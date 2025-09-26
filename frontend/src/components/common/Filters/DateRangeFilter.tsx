import React from 'react';
import type { DateRange } from '../../../types/common';

interface DateRangeFilterProps {
  dateRange: DateRange;
  onChange: (dateRange: DateRange) => void;
  label?: string;
}

export function DateRangeFilter({ dateRange, onChange, label = "Date Range" }: DateRangeFilterProps) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </label>
      <div className="flex gap-2">
        <div>
          <input
            type="date"
            value={dateRange.startDate || ''}
            onChange={(e) => onChange({ ...dateRange, startDate: e.target.value || null })}
            className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-sm"
            placeholder="Start Date"
          />
        </div>
        <div>
          <input
            type="date"
            value={dateRange.endDate || ''}
            onChange={(e) => onChange({ ...dateRange, endDate: e.target.value || null })}
            className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-sm"
            placeholder="End Date"
          />
        </div>
      </div>
    </div>
  );
}
