import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StandingsPage } from './pages/nhl/NHLStandingsPage';
import './index.css';

// Create a client for React Query (optional but recommended for future API caching)
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="App">
          <Routes>
            {/* Temporary: NHL standings as main page */}
            <Route path="/" element={<StandingsPage />} />
            
            {/* Future routes structure */}
            <Route path="/nhl" element={<StandingsPage />} />
            <Route path="/nhl/standings" element={<StandingsPage />} />
            
            {/* Future sport routes */}
            {/* <Route path="/nba/*" element={<NBASection />} /> */}
            {/* <Route path="/mlb/*" element={<MLBSection />} /> */}
          </Routes>
        </div>
      </Router>
    </QueryClientProvider>
  );
}

export default App;