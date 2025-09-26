import React from 'react';

export interface TableColumn<T = any> {
  key: string;
  label: string;
  sortable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
  formatter?: (value: any, row: T) => React.ReactNode;
}

export interface SortConfig {
  key: string;
  direction: 'asc' | 'desc';
}

export interface FilterConfig {
  [key: string]: any;
}

export interface DateRange {
  startDate: string | null;
  endDate: string | null;
}

export interface DropdownOption {
  value: string;
  label: string;
}

export interface APIResponse<T = any> {
  data?: T;
  error?: string;
  loading: boolean;
}

export interface PaginationConfig {
  page: number;
  pageSize: number;
  total: number;
}