import { useAPI } from '../../common/useAPI';
import type { NHLStandingsResponse, NHLFilters } from '../../../types/nhl';
import api from '../../../utils/api';

export function useNHLStandings(filters: NHLFilters) {
  return useAPI<NHLStandingsResponse>(async () => {
    const params = new URLSearchParams();
    
    if (filters.season) params.append('season', filters.season);
    if (filters.startDate) params.append('start_date', filters.startDate);
    if (filters.endDate) params.append('end_date', filters.endDate);
    if (filters.division) params.append('division', filters.division);
    if (filters.conference) params.append('conference', filters.conference);

    const response = await api.get(`/nhl/standings?${params.toString()}`);
    return response.data;
  }, [filters.season, filters.startDate, filters.endDate, filters.division, filters.conference]);
}

export function useNHLTeams() {
  return useAPI(async () => {
    const response = await api.get('/nhl/teams');
    return response.data;
  }, []);
}

export function useNHLSeasons() {
  return useAPI(async () => {
    const response = await api.get('/nhl/seasons');
    return response.data;
  }, []);
}