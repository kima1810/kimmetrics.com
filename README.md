# Kimmetrics - Multi-Sport Analytics Platform

A web application for viewing and analyzing sports statistics, starting with NHL data. Built with a modular architecture to easily support multiple sports in the future.

## Tech Stack

### Backend
- **Python 3.13** with FastAPI
- **nhl-api-py** - Python wrapper for the NHL API
- **uvicorn** - ASGI server
- **PostgreSQL** - Game data caching and fast queries
- **SQLAlchemy** - Python ORM
- **Alembic** - Database migrations

### Frontend
- **React 18** with TypeScript
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **React Router** - Navigation
- **Axios** - HTTP client
- **TanStack Query (React Query)** - API state management

## Project Structure
```bash
kimmetrics.com/
├── backend/                    # Python FastAPI backend
│   ├── src/
│   │   ├── main.py            # FastAPI app entry point
│   │   ├── core/              # Core utilities (config, database)
│   │   └── sports/            # Sport-specific modules
│   │       ├── nhl/           # NHL API integration
│   │       │   ├── routes.py  # API endpoints
│   │       │   ├── services.py # Business logic
│   │       │   └── models.py  # Data models
│   │       └── common/        # Shared sports utilities
│   ├── requirements.txt       # Python dependencies
│   └── .env                   # Environment variables
│
├── frontend/                   # React TypeScript frontend
│   ├── src/
│   │   ├── types/             # TypeScript type definitions
│   │   │   ├── common.ts      # Reusable types (Table, Filter, etc.)
│   │   │   └── nhl.ts         # NHL-specific types
│   │   │
│   │   ├── utils/             # Utility functions
│   │   │   └── api.ts         # Axios instance and interceptors
│   │   │
│   │   ├── hooks/             # Custom React hooks
│   │   │   ├── common/        # Reusable hooks
│   │   │   │   ├── useAPI.ts     # Generic API fetching
│   │   │   │   ├── useSorting.ts # Generic table sorting
│   │   │   │   └── useFilters.ts # Generic filter state
│   │   │   └── sports/nhl/
│   │   │       └── useNHLData.ts # NHL-specific data fetching
│   │   │
│   │   ├── components/
│   │   │   ├── common/        # Reusable UI components
│   │   │   │   ├── Table/
│   │   │   │   │   ├── Table.tsx        # Generic sortable table
│   │   │   │   │   ├── TableHeader.tsx  # Table header with sort
│   │   │   │   │   └── index.ts
│   │   │   │   ├── Filters/
│   │   │   │   │   ├── DateRangeFilter.tsx   # Date range picker
│   │   │   │   │   ├── DropdownFilter.tsx    # Dropdown selector
│   │   │   │   │   ├── FilterContainer.tsx   # Collapsible filter panel
│   │   │   │   │   └── index.ts
│   │   │   │   └── Loading/
│   │   │   │       ├── LoadingSpinner.tsx
│   │   │   │       └── index.ts
│   │   │   │
│   │   │   └── sports/        # Sport-specific components
│   │   │       └── nhl/
│   │   │           ├── NHLStandingsTable.tsx  # NHL standings display
│   │   │           ├── NHLFilters.tsx         # NHL filter controls
│   │   │           └── index.ts
│   │   │
│   │   ├── pages/             # Page-level components
│   │   │   └── NHL/
│   │   │       └── StandingsPage.tsx  # Main NHL standings page
│   │   │
│   │   ├── App.tsx            # Main app component with routing
│   │   └── index.css          # Global styles (Tailwind)
│   │
│   ├── package.json           # Node dependencies
│   ├── tailwind.config.js     # Tailwind configuration
│   └── vite.config.ts         # Vite configuration
│
├── shared/                     # Shared types (future use)
├── .venv/                      # Python virtual environment
├── docker-compose.yml          # Docker setup (optional)
└── README.md                   # This file
```

## Features

### Current Features (NHL)
- **Live NHL Standings** - View current season standings
- **Historical Data** - Access past seasons
- **Date Range Filtering** - Calculate standings for custom date ranges
- **Combined Conference/Division Filter with Entire League option** - Filter by division or conference
- **Sortable Columns** - Click any column header to sort
- **Responsive Design** - Works on desktop and mobile
- **Dark Mode Support** - Built-in dark mode styling
- **Combined Season/Custom Date Range selector** - Choose full season or specific dates
- **Manual filter application with 'Apply Filters' button to prevent accidental expensive queries**
- **Smart date range defaults (start-to-present, season-start-to-end, or full season)**

### Planned Features
- NBA statistics and standings
- MLB statistics and standings
- Custom analytics and advanced metrics
- Team comparison tools
- Player statistics
- Game predictions

## API Endpoints

### NHL Endpoints

#### GET `/api/nhl/standings`
Get NHL standings with optional filtering.

**Query Parameters:**
- `season` (string): NHL season in format YYYYYYYY (e.g., "20242025")
- `start_date` (string, optional): Filter games from this date (YYYY-MM-DD)
- `end_date` (string, optional): Filter games until this date (YYYY-MM-DD)
- `division` (string, optional): Filter by division name
- `conference` (string, optional): Filter by conference name

**Example:**
GET /api/nhl/standings?season=20242025&division=atlantic

#### GET `/api/nhl/teams`
Get all NHL teams with their information.

#### GET `/api/nhl/seasons`
Get available seasons for selection.

## Setup Instructions

### Prerequisites
- Python 3.13+
- Node.js 18+
- npm or yarn

### Database Setup (PostgreSQL)
See ```backend/DATABASE_SETUP.md``` for detailed instructions.

Quick start:
```bash
# Install PostgreSQL, then:
cd backend
python setup_database.py
```


### Backend Setup

1. Navigate to backend directory:
```bash
cd backend

Activate virtual environment:

bashsource ../.venv/bin/activate  # On Windows: ..\.venv\Scripts\activate

Install dependencies:

bashpip install -r requirements.txt

Start the FastAPI server:

bashuvicorn src.main:app --reload
Backend runs on http://127.0.0.1:8000
Frontend Setup

Navigate to frontend directory:

bashcd frontend

Install dependencies:

bashnpm install

Start the development server:

bashnpm run dev
Frontend runs on http://localhost:5173
Development Workflow
Running Both Servers
Open two terminal windows:
Terminal 1 (Backend):
bashcd kimmetrics.com/backend
source ../.venv/bin/activate
uvicorn src.main:app --reload
Terminal 2 (Frontend):
bashcd kimmetrics.com/frontend
npm run dev
Making Changes
Adding a New Sport

Create new directory in backend/src/sports/[sport]/
Create routes.py, services.py, and models.py
Register routes in backend/src/main.py
Create frontend types in frontend/src/types/[sport].ts
Create components in frontend/src/components/sports/[sport]/
Create hooks in frontend/src/hooks/sports/[sport]/

Adding a New Common Component

Create component in frontend/src/components/common/[ComponentName]/
Define types in frontend/src/types/common.ts if needed
Export from index.ts for easy imports
Component should be generic and reusable across sports

Architecture Decisions
Why FastAPI?

The nhl-api-py library is Python-only
FastAPI provides automatic API documentation
Easy to add caching and custom analytics
Fast performance with async/await support

Why Vite?

Faster than Create React App
Better TypeScript support
Modern build tooling
Excellent developer experience

Component Structure

Common components are sport-agnostic and highly reusable
Sport components use common components and add sport-specific logic
Pages compose components and manage state
Hooks handle data fetching and state management

Type System

Use import type { } for TypeScript types/interfaces
Use regular import { } for values/functions/constants
Keep types separate from implementation
Common types go in types/common.ts
Sport-specific types go in types/[sport].ts

Troubleshooting
Backend Issues
Module not found errors:
bashpip install -r requirements.txt
Port already in use:
bash# Kill process on port 8000
# Windows: netstat -ano | findstr :8000
# Linux/Mac: lsof -ti:8000 | xargs kill
Frontend Issues
Type import errors:
Make sure you're using import type { } for TypeScript types:
typescriptimport type { TableColumn } from '../types/common';
Tailwind classes not working:
Make sure index.css has the Tailwind directives:
css@tailwind base;
@tailwind components;
@tailwind utilities;
API connection refused:
Custom date range queries can take 30-60 seconds due to NHL API rate limits
Consider using season filters for faster results

Ensure backend is running on port 8000
Check CORS settings in backend/src/main.py
Verify API URL in frontend/src/utils/api.ts