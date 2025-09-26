import React from 'react';
import { NHLFilters, NHLStandingsTable } from '../../components/sports/nhl';
import { LoadingSpinner } from '../../components/common/Loading';
import { useFilters } from '../../hooks/common/useFilters';
import { useSorting } from '../../hooks/common/useSorting';
import { useNHLStandings, useNHLSeasons } from '../../hooks/sports/nhl/useNHLData';
import type { NHLFilters as NHLFiltersType } from '../../types/nhl';

const initialFilters: NHLFiltersType = {
  season: '20242025',
  startDate: null,
  endDate: null,
  division: null,
  conference: null
};

export function StandingsPage() {
  const { filters, updateFilters } = useFilters(initialFilters);
  
  const { data: standingsData, error: standingsError, loading: standingsLoading } = useNHLStandings(filters);
  const { data: seasonsData, loading: seasonsLoading } = useNHLSeasons();
  
  const standings = standingsData?.standings || [];
  const { sortedData, sortConfig, handleSort } = useSorting(standings, { key: 'points', direction: 'desc' });
  
  const availableSeasons = seasonsData?.seasons || ['20242025', '20232024', '20222023'];

  if (standingsLoading) {
    return <LoadingSpinner size="large" message="Loading NHL standings..." />;
  }

  if (standingsError) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <h3 className="text-lg font-medium text-red-800 dark:text-red-200">
              Error Loading Standings
            </h3>
            <p className="mt-2 text-red-700 dark:text-red-300">
              {standingsError}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">
            NHL Standings
          </h1>
          <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
            {filters.startDate && filters.endDate 
              ? `Custom date range: ${filters.startDate} to ${filters.endDate}`
              : `${filters.season.slice(0, 4)}-${filters.season.slice(4, 8)} Season`
            }
          </p>
        </div>

        {/* Filters */}
        <NHLFilters
          filters={filters}
          onFiltersChange={updateFilters}
          availableSeasons={availableSeasons}
        />

        {/* Results Summary */}
        <div className="mb-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Showing {sortedData.length} teams
            {filters.division && ` in ${filters.division} Division`}
            {filters.conference && ` in ${filters.conference} Conference`}
          </p>
        </div>

        {/* Standings Table */}
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg">
          <NHLStandingsTable
            data={sortedData}
            sortConfig={sortConfig}
            onSort={handleSort}
          />
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>
            Data provided by NHL API • Last updated: {new Date().toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
}