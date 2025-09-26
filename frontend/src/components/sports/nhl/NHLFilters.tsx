import React from 'react';
import { DateRangeFilter, DropdownFilter, FilterContainer } from '../../common/Filters';
import { NHL_DIVISIONS, NHL_CONFERENCES } from '../../../types/nhl';
import type { NHLFilters } from '../../../types/nhl';

interface NHLFiltersProps {
  filters: NHLFilters;
  onFiltersChange: (filters: Partial<NHLFilters>) => void;
  availableSeasons?: string[];
}

export function NHLFiltersComponent({ filters, onFiltersChange, availableSeasons = [] }: NHLFiltersProps) {
  const seasonOptions = availableSeasons.map(season => ({
    value: season,
    label: `${season.slice(0, 4)}-${season.slice(4, 8)}`
  }));

  return (
    <FilterContainer title="NHL Standings Filters">
      <DropdownFilter
        label="Season"
        value={filters.season}
        options={seasonOptions}
        onChange={(season) => onFiltersChange({ season: season || '20242025' })}
        placeholder="Select Season"
      />

      <DateRangeFilter
        label="Date Range (Optional)"
        dateRange={{
          startDate: filters.startDate,
          endDate: filters.endDate
        }}
        onChange={({ startDate, endDate }) => 
          onFiltersChange({ startDate, endDate })
        }
      />

      <DropdownFilter
        label="Division"
        value={filters.division}
        options={NHL_DIVISIONS}
        onChange={(division) => onFiltersChange({ division })}
        placeholder="All Divisions"
      />

      <DropdownFilter
        label="Conference"
        value={filters.conference}
        options={NHL_CONFERENCES}
        onChange={(conference) => onFiltersChange({ conference })}
        placeholder="All Conferences"
      />
    </FilterContainer>
  );
}
