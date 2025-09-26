# Kimmetrics.com - NHL Statistics Dashboard

A web application that provides NHL statistics and analytics using the [NHL API Python wrapper](https://github.com/coreyjs/nhl-api-py).

## Features

- Interactive table displaying NHL team statistics:
  - Games played
  - Wins
  - Losses
  - OT losses
  - Points
  - Goals for
  - Goals against
  - Goal differential
- Filterable data by:
  - Season selection
  - Custom date range
  - Division/Conference
- Sortable columns for easy data comparison

## Tech Stack

### Frontend
- React.js
- TypeScript
- Tailwind CSS
- Vite

### Backend
- Python
- FastAPI
- NHL API Python wrapper

### Infrastructure
- AWS hosting

## Project Structure

```
├── backend/
│   ├── requirements.txt
│   └── src/
│       ├── main.py
│       ├── core/
│       │   ├── config.py
│       │   └── database.py
│       └── sports/
│           └── nhl/
│               ├── models.py
│               ├── routes.py
│               └── services.py
├── frontend/
│   ├── src/
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   └── vite.config.ts
└── shared/
    └── types/
```

## Getting Started

### Prerequisites
- Python 3.x
- Node.js
- npm or yarn
- Docker (optional)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/kima1810/kimmetrics.com.git
cd kimmetrics.com
```

2. Set up the backend:
```bash
cd backend
pip install -r requirements.txt
```

3. Set up the frontend:
```bash
cd frontend
npm install
```

### Running the Application

1. Start the backend server:
```bash
cd backend
python src/main.py
```

2. Start the frontend development server:
```bash
cd frontend
npm run dev
```

## Docker Support

The application can be run using Docker Compose:

```bash
docker-compose up
```

## License

[MIT License](LICENSE)
