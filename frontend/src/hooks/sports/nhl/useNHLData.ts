import { useState, useEffect } from 'react';
import type { NHLStandingsResponse, NHLFilters } from '../../../types/nhl';
import api from '../../../utils/api';

export function useNHLStandings(filters: NHLFilters) {
  const [data, setData] = useState<NHLStandingsResponse | undefined>(undefined);
  const [error, setError] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [timeoutOccurred, setTimeoutOccurred] = useState(false);

  useEffect(() => {
    let isCancelled = false;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(undefined);
        setTimeoutOccurred(false);
        
        const params = new URLSearchParams();
        
        if (filters.season) params.append('season', filters.season);
        if (filters.startDate) params.append('start_date', filters.startDate);
        if (filters.endDate) params.append('end_date', filters.endDate);
        if (filters.division) params.append('division', filters.division);
        if (filters.conference) params.append('conference', filters.conference);

        const response = await api.get(`/nhl/standings?${params.toString()}`);
        
        if (!isCancelled) {
          setData(response.data);
          setError(undefined);
        }
      } catch (err: any) {
        if (!isCancelled) {
          console.log('Error caught:', err);
          console.log('Error code:', err.code);
          console.log('Error message:', err.message);
          
          // Check if it's a timeout error - check multiple conditions
          const isTimeout = 
            err.code === 'ECONNABORTED' || 
            err.code === 'ERR_NETWORK' ||
            err.message?.toLowerCase().includes('timeout') ||
            err.message?.toLowerCase().includes('network error');
          
          if (isTimeout || (filters.startDate && filters.endDate)) {
            // Show timeout message
            setError('Custom date range query timed out or took too long. Falling back to current season standings...');
            setTimeoutOccurred(true);
            
            // Fallback to current season without date range
            try {
              const fallbackParams = new URLSearchParams();
              fallbackParams.append('season', '20242025');
              if (filters.division) fallbackParams.append('division', filters.division);
              if (filters.conference) fallbackParams.append('conference', filters.conference);
              
              const fallbackResponse = await api.get(`/nhl/standings?${fallbackParams.toString()}`);
              
              if (!isCancelled) {
                setData(fallbackResponse.data);
                // Keep error message visible but update it
                setError('Query timed out. Showing full 2024-25 season standings instead.');
              }
            } catch (fallbackErr: any) {
              if (!isCancelled) {
                setError('Failed to load standings: ' + (fallbackErr.response?.data?.error || fallbackErr.message || 'Unknown error'));
              }
            }
          } else {
            setError(err.response?.data?.error || err.message || 'An error occurred');
          }
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isCancelled = true;
    };
  }, [filters.season, filters.startDate, filters.endDate, filters.division, filters.conference]);

  return { data, error, loading, timeoutOccurred };
}

export function useNHLTeams() {
  const [data, setData] = useState<any>(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get('/nhl/teams');
        setData(response.data);
      } catch (err) {
        // Silent fail for non-critical data
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { data, loading };
}

export function useNHLSeasons() {
  const [data, setData] = useState<any>(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get('/nhl/seasons');
        setData(response.data);
      } catch (err) {
        // Silent fail for non-critical data
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { data, loading };
}