import React, { useState } from 'react';
import { DateRangeFilter, DropdownFilter, FilterContainer } from '../../common/Filters';
import type { NHLFilters } from '../../../types/nhl';

interface NHLFiltersProps {
  filters: NHLFilters;
  onFiltersChange: (filters: Partial<NHLFilters>) => void;
  onApplyFilters: () => void;
  availableSeasons?: string[];
}

export function NHLFiltersComponent({ filters, onFiltersChange, onApplyFilters, availableSeasons = [] }: NHLFiltersProps) {
  const [showCustomDates, setShowCustomDates] = useState(false);
  
  // Create season options with "Custom Date Range" at the end
  const seasonOptions = [
    ...availableSeasons.map(season => ({
      value: season,
      label: `${season.slice(0, 4)}-${season.slice(4, 8)}`
    })),
    { value: 'custom', label: 'Custom Date Range' }
  ];

  // Combined division/conference options
  const locationOptions = [
    { value: 'conference:eastern', label: 'Eastern Conference' },
    { value: 'conference:western', label: 'Western Conference' },
    { value: 'division:atlantic', label: 'Atlantic Division' },
    { value: 'division:metropolitan', label: 'Metropolitan Division' },
    { value: 'division:central', label: 'Central Division' },
    { value: 'division:pacific', label: 'Pacific Division' }
  ];

  const handleSeasonChange = (value: string | null) => {
    if (value === 'custom') {
      setShowCustomDates(true);
    } else {
      setShowCustomDates(false);
      onFiltersChange({ 
        season: value || '20242025',
        startDate: null,
        endDate: null
      });
    }
  };

  const handleLocationChange = (value: string | null) => {
    if (!value) {
      onFiltersChange({ division: null, conference: null });
    } else {
      const [type, name] = value.split(':');
      if (type === 'conference') {
        onFiltersChange({ conference: name, division: null });
      } else if (type === 'division') {
        onFiltersChange({ division: name, conference: null });
      }
    }
  };

  // Determine current location value for dropdown
  const getCurrentLocationValue = () => {
    if (filters.conference) {
      return `conference:${filters.conference}`;
    }
    if (filters.division) {
      return `division:${filters.division}`;
    }
    return '';
  };

  return (
    <FilterContainer title="Filters">
      <DropdownFilter
        label="Season / Date Range"
        value={showCustomDates ? 'custom' : filters.season}
        options={seasonOptions}
        onChange={handleSeasonChange}
        placeholder="Select Season"
      />

      {showCustomDates && (
        <DateRangeFilter
          label="Custom Date Range (Optional)"
          dateRange={{
            startDate: filters.startDate,
            endDate: filters.endDate
          }}
          onChange={({ startDate, endDate }) => 
            onFiltersChange({ startDate, endDate })
          }
        />
      )}

      <DropdownFilter
        label="Conference / Division"
        value={getCurrentLocationValue()}
        options={locationOptions}
        onChange={handleLocationChange}
        placeholder="Entire League"
      />

      <div className="flex items-end">
        <button
          onClick={onApplyFilters}
          className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Apply Filters
        </button>
      </div>
    </FilterContainer>
  );
}