import React, { useMemo, useState } from 'react';
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

// Memoized table component to prevent unnecessary re-renders
const StandingsTableSection = React.memo(({ 
  standings, 
  sortConfig, 
  handleSort, 
  loading, 
  error 
}: any) => {
  if (loading) {
    return <LoadingSpinner size="large" message="Loading NHL standings..." />;
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-800 rounded-lg p-4">
        <h3 className="text-lg font-medium text-red-800 dark:text-red-200">
          Error Loading Standings
        </h3>
        <p className="mt-2 text-red-700 dark:text-red-300">
          {error}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg">
      <NHLStandingsTable
        data={standings}
        sortConfig={sortConfig}
        onSort={handleSort}
      />
    </div>
  );
});

StandingsTableSection.displayName = 'StandingsTableSection';

export function StandingsPage() {
  const { filters, updateFilters } = useFilters(initialFilters);
  const [appliedFilters, setAppliedFilters] = useState<NHLFiltersType>(initialFilters);
  
  const { data: standingsData, error: standingsError, loading: standingsLoading } = useNHLStandings(appliedFilters);
  const { data: seasonsData } = useNHLSeasons();
  
  const standings = standingsData?.standings || [];
  const { sortedData, sortConfig, handleSort } = useSorting(standings, { key: 'points', direction: 'desc' });
  
  const availableSeasons = seasonsData?.seasons || ['20242025', '20232024', '20222023', '20212022', '20202021'];

  const handleApplyFilters = () => {
    setAppliedFilters({ ...filters });
  };

  // Memoize the header text to prevent recalculation
  const headerSubtext = useMemo(() => {
    if (appliedFilters.startDate && appliedFilters.endDate) {
      return `Custom date range: ${appliedFilters.startDate} to ${appliedFilters.endDate}`;
    } else if (appliedFilters.startDate) {
      return `From ${appliedFilters.startDate} to present`;
    } else if (appliedFilters.endDate) {
      return `Season start to ${appliedFilters.endDate}`;
    }
    return `${appliedFilters.season.slice(0, 4)}-${appliedFilters.season.slice(4, 8)} Season`;
  }, [appliedFilters.startDate, appliedFilters.endDate, appliedFilters.season]);

  // Memoize the results summary
  const resultsSummary = useMemo(() => {
    let summary = `Showing ${sortedData.length} teams`;
    if (appliedFilters.division) {
      summary += ` in ${appliedFilters.division.charAt(0).toUpperCase() + appliedFilters.division.slice(1)} Division`;
    } else if (appliedFilters.conference) {
      summary += ` in ${appliedFilters.conference.charAt(0).toUpperCase() + appliedFilters.conference.slice(1)} Conference`;
    }
    return summary;
  }, [sortedData.length, appliedFilters.division, appliedFilters.conference]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header - Static, doesn't re-render on filter changes */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">
            NHL Standings
          </h1>
          <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
            {headerSubtext}
          </p>
        </div>

        {/* Filters - Remains open when data changes */}
        <NHLFilters
          filters={filters}
          onFiltersChange={updateFilters}
          onApplyFilters={handleApplyFilters}
          availableSeasons={availableSeasons}
        />

        {/* Results Summary */}
        <div className="mb-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {resultsSummary}
          </p>
        </div>

        {/* Standings Table - Only this section re-renders with new data */}
        <StandingsTableSection
          standings={sortedData}
          sortConfig={sortConfig}
          handleSort={handleSort}
          loading={standingsLoading}
          error={standingsError}
        />

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
