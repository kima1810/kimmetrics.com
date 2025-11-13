import { useMemo, useState, memo, useEffect } from 'react';
import { MainLayout } from '../../components/layout/MainLayout';
import { NHLFilters, NHLStandingsTable } from '../../components/sports/nhl';
import { LoadingSpinner } from '../../components/common/Loading';
import { Toast } from '../../components/common/Toast';
import { useFilters } from '../../hooks/common/useFilters';
import { useSorting } from '../../hooks/common/useSorting';
import { useNHLStandings, useNHLSeasons } from '../../hooks/sports/nhl/useNHLData';
import type { NHLFilters as NHLFiltersType } from '../../types/nhl';
import '../../styles/nhl-table.css';

const initialFilters: NHLFiltersType = {
  season: '20242025',
  startDate: null,
  endDate: null,
  division: null,
  conference: null
};

const StandingsContent = memo(({ 
  standings, 
  sortConfig, 
  handleSort, 
  loading, 
  error 
}: any) => {
  if (loading) {
    return <LoadingSpinner size="large" message="Loading NHL standings..." />;
  }

  if (error && !error.includes('timed out')) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h3>Error Loading Standings</h3>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <NHLStandingsTable
      data={standings}
      sortConfig={sortConfig}
      onSort={handleSort}
    />
  );
});

StandingsContent.displayName = 'StandingsContent';

export function StandingsPage() {
  const { filters, updateFilters } = useFilters(initialFilters);
  const [appliedFilters, setAppliedFilters] = useState<NHLFiltersType>(initialFilters);
  const [showToast, setShowToast] = useState(false);
  
  const { data: standingsData, error: standingsError, loading: standingsLoading, timeoutOccurred } = useNHLStandings(appliedFilters);
  const { data: seasonsData } = useNHLSeasons();
  
  const standings = standingsData?.standings || [];
  const { sortedData, sortConfig, handleSort } = useSorting(standings, { key: 'points', direction: 'desc' });
  
  const availableSeasons = seasonsData?.seasons || ['20242025', '20232024', '20222023'];

  useEffect(() => {
    if (timeoutOccurred) {
      setShowToast(true);
    }
  }, [timeoutOccurred]);

  const handleApplyFilters = () => {
    setAppliedFilters({ ...filters });
  };

  const headerText = useMemo(() => {
    if (appliedFilters.startDate && appliedFilters.endDate) {
      return `${appliedFilters.startDate} to ${appliedFilters.endDate}`;
    }
    return `${appliedFilters.season.slice(0, 4)}-${appliedFilters.season.slice(4, 8)} Season`;
  }, [appliedFilters]);

  return (
    <MainLayout>
      {showToast && (
        <Toast
          message="Query timed out. Showing full season instead. Try a shorter date range."
          type="error"
          duration={8000}
          onClose={() => setShowToast(false)}
        />
      )}

      <div className="standings-container">
        <h2 style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
          NHL Standings
        </h2>
        <p style={{ textAlign: 'center', color: '#6b7280', marginBottom: '2rem' }}>
          {headerText}
        </p>

        <NHLFilters
          filters={filters}
          onFiltersChange={updateFilters}
          onApplyFilters={handleApplyFilters}
          availableSeasons={availableSeasons}
        />

        <StandingsContent
          standings={sortedData}
          sortConfig={sortConfig}
          handleSort={handleSort}
          loading={standingsLoading}
          error={standingsError}
        />
      </div>
    </MainLayout>
  );
}