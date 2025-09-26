import React from 'react';
import { Table } from '../../common/Table';
import type { TableColumn, SortConfig } from '../../../types/common';
import type { NHLStanding } from '../../../types/nhl';

interface NHLStandingsTableProps {
  data: NHLStanding[];
  sortConfig: SortConfig | null;
  onSort: (key: string) => void;
}

export function NHLStandingsTable({ data, sortConfig, onSort }: NHLStandingsTableProps) {
  const columns: TableColumn<NHLStanding>[] = [
    {
      key: 'team',
      label: 'Team',
      sortable: true,
      align: 'left',
      formatter: (value: any, row: NHLStanding) => {
        // Handle both league standings format and calculated format
        if (row.teamName?.default) {
          return row.teamName.default;
        }
        if (row.team?.name) {
          return row.team.name;
        }
        return 'Unknown Team';
      }
    },
    {
      key: 'gamesPlayed',
      label: 'GP',
      sortable: true,
      align: 'center',
      width: '80px'
    },
    {
      key: 'wins',
      label: 'W',
      sortable: true,
      align: 'center',
      width: '80px'
    },
    {
      key: 'losses',
      label: 'L',
      sortable: true,
      align: 'center',
      width: '80px'
    },
    {
      key: 'overtimeLosses',
      label: 'OTL',
      sortable: true,
      align: 'center',
      width: '80px'
    },
    {
      key: 'points',
      label: 'PTS',
      sortable: true,
      align: 'center',
      width: '80px',
      formatter: (value: number) => (
        <span className="font-semibold text-blue-600 dark:text-blue-400">
          {value}
        </span>
      )
    },
    {
      key: 'goalsFor',
      label: 'GF',
      sortable: true,
      align: 'center',
      width: '80px'
    },
    {
      key: 'goalsAgainst',
      label: 'GA',
      sortable: true,
      align: 'center',
      width: '80px'
    },
    {
      key: 'goalDifferential',
      label: 'DIFF',
      sortable: true,
      align: 'center',
      width: '80px',
      formatter: (value: number) => (
        <span className={`font-medium ${
          value > 0 
            ? 'text-green-600 dark:text-green-400' 
            : value < 0 
              ? 'text-red-600 dark:text-red-400' 
              : 'text-gray-600 dark:text-gray-400'
        }`}>
          {value > 0 ? '+' : ''}{value}
        </span>
      )
    }
  ];

  return (
    <Table
      data={data}
      columns={columns}
      sortConfig={sortConfig}
      onSort={onSort}
      emptyMessage="No standings data available"
    />
  );
}
