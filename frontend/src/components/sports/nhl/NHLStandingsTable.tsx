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
      formatter: (value: any, row: NHLStanding) => {
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
      sortable: true
    },
    {
      key: 'wins',
      label: 'W',
      sortable: true
    },
    {
      key: 'losses',
      label: 'L',
      sortable: true
    },
    {
      key: 'otLosses',
      label: 'OT',
      sortable: true
    },
    {
      key: 'points',
      label: 'PTS',
      sortable: true,
      formatter: (value: number) => (
        <span className="points-cell">{value}</span>
      )
    },
    {
      key: 'goalFor',
      label: 'GF',
      sortable: true
    },
    {
      key: 'goalAgainst',
      label: 'GA',
      sortable: true
    },
    {
      key: 'goalDifferential',
      label: 'DIFF',
      sortable: true,
      formatter: (value: number) => {
        const className = value > 0 ? 'diff-positive' : value < 0 ? 'diff-negative' : 'diff-neutral';
        return (
          <span className={className}>
            {value > 0 ? '+' : ''}{value}
          </span>
        );
      }
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
