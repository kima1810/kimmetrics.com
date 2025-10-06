export interface NHLTeam {
  id: number;
  name: string;
  abbrev: string;
  division: {
    id: number;
    name: string;
  };
  conference: {
    id: number;
    name: string;
  };
}

export interface NHLStanding {
  team?: NHLTeam; // For calculated standings
  teamName?: { default: string }; // For league standings
  teamAbbrev?: { default: string };
  gamesPlayed: number;
  wins: number;
  losses: number;
  otLosses: number;  // Changed from overtimeLosses
  points: number;
  goalFor: number;  // Changed from goalsFor
  goalAgainst: number;  // Changed from goalsAgainst
  goalDifferential: number;
  divisionName?: string;
  conferenceName?: string;
}

export interface NHLStandingsResponse {
  standings: NHLStanding[];
}

export interface NHLFilters {
  season: string;
  startDate: string | null;
  endDate: string | null;
  division: string | null;
  conference: string | null;
}

export interface NHLSeason {
  id: string;
  name: string;
}

export const NHL_DIVISIONS = [
  { value: 'atlantic', label: 'Atlantic' },
  { value: 'metropolitan', label: 'Metropolitan' },
  { value: 'central', label: 'Central' },
  { value: 'pacific', label: 'Pacific' }
];

export const NHL_CONFERENCES = [
  { value: 'eastern', label: 'Eastern' },
  { value: 'western', label: 'Western' }
];