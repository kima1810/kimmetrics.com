# Kimmetrics - Multi-Sport Analytics Platform

A website with custom NHL data, but with more sports planned in the future. For now, there is only a way to view the standings through custom date ranges, but much more content is coming soon!

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
├── backend/                           # Python FastAPI backend
│   ├── src/
│   │   ├── main.py                   # FastAPI app entry point
│   │   ├── core/                     # Core utilities (config, database)
│   │   ├── database/                 # PostgreSQL database layer
│   │   │   ├── config.py            # Database connection & session management
│   │   │   ├── init_db.py           # Database initialization script
│   │   │   ├── sync_service.py      # NHL API to database sync service
│   │   │   ├── models/              # SQLAlchemy models
│   │   │   │   ├── team.py          # Team model
│   │   │   │   └── game.py          # Game model with indexes
│   │   │   └── queries/             # SQL query modules (separated from logic)
│   │   │       ├── team_queries.py  # Team CRUD operations
│   │   │       └── game_queries.py  # Game queries & standings calculation
│   │   └── sports/                   # Sport-specific modules
│   │       └── nhl/                  # NHL API integration
│   │           ├── routes.py         # API endpoints with DB dependency injection
│   │           └── services.py       # Business logic (uses database queries)
│   ├── requirements.txt              # Python dependencies
│   ├── .env                          # Environment variables (DATABASE_URL, etc.)
│   ├── setup_database.py             # One-time database setup script
│   ├── daily_sync.py                 # Daily sync script (run daily)
│   ├── sync_season.py                # Historical season sync utility
│   └── DATABASE_SETUP.md             # Database setup guide
│
├── frontend/                          # React TypeScript frontend
│   ├── public/
│   │   └── assets/                   # Static assets (future CSS templates)
│   ├── src/
│   │   ├── types/                    # TypeScript type definitions
│   │   │   ├── common.ts             # Reusable types (Table, Filter, etc.)
│   │   │   └── nhl.ts                # NHL-specific types
│   │   │
│   │   ├── utils/                    # Utility functions
│   │   │   └── api.ts                # Axios instance (120s timeout)
│   │   │
│   │   ├── hooks/                    # Custom React hooks
│   │   │   ├── common/               # Reusable hooks
│   │   │   │   ├── useAPI.ts         # Generic API fetching with timeout fallback
│   │   │   │   ├── useSorting.ts     # Generic table sorting
│   │   │   │   └── useFilters.ts     # Generic filter state
│   │   │   └── sports/nhl/
│   │   │       └── useNHLData.ts     # NHL-specific data fetching with fallback
│   │   │
│   │   ├── components/
│   │   │   ├── common/               # Reusable UI components
│   │   │   │   ├── Table/
│   │   │   │   │   ├── Table.tsx            # Generic sortable table
│   │   │   │   │   ├── TableHeader.tsx      # Table header with sort icons
│   │   │   │   │   └── index.ts
│   │   │   │   ├── Filters/
│   │   │   │   │   ├── DateRangeFilter.tsx  # Date range picker
│   │   │   │   │   ├── DropdownFilter.tsx   # Dropdown selector
│   │   │   │   │   ├── FilterContainer.tsx  # Collapsible filter panel
│   │   │   │   │   └── index.ts
│   │   │   │   ├── Loading/
│   │   │   │   │   ├── LoadingSpinner.tsx   # Loading indicator
│   │   │   │   │   └── index.ts
│   │   │   │   └── Toast/
│   │   │   │       ├── Toast.tsx            # Toast notification (errors, success)
│   │   │   │       └── index.ts
│   │   │   │
│   │   │   └── sports/               # Sport-specific components
│   │   │       └── nhl/
│   │   │           ├── NHLStandingsTable.tsx  # NHL standings display
│   │   │           ├── NHLFilters.tsx         # NHL filter controls with Apply button
│   │   │           └── index.ts
│   │   │
│   │   ├── pages/                    # Page-level components
│   │   │   └── NHL/
│   │   │       └── StandingsPage.tsx  # Main NHL standings page
│   │   │
│   │   ├── App.tsx                   # Main app with routing & React Query
│   │   ├── main.tsx                  # Vite entry point
│   │   └── index.css                 # Global styles (Tailwind directives)
│   │
│   ├── index.html                    # HTML entry (title: "Kimmetrics - Sports Analytics")
│   ├── package.json                  # Node dependencies
│   ├── tailwind.config.js            # Tailwind configuration
│   ├── postcss.config.js             # PostCSS configuration
│   └── vite.config.ts                # Vite configuration
│
├── shared/                            # Shared types (future use)
│   └── types/
├── .venv/                             # Python virtual environment
├── .gitignore                         # Git ignore patterns
├── docker-compose.yml                 # Docker setup (optional)
├── README.md                          # This file
```
### Key Architectural Features

**Backend:**
- **Modular Database Layer**: All SQL queries separated into `queries/` modules
- **Fast Custom Date Ranges**: PostgreSQL caching makes 85-day queries < 100ms
- **Sync Utilities**: Daily sync script and historical season sync tools
- **DB Dependency Injection**: Routes use FastAPI's `Depends(get_db)` pattern

**Frontend:**
- **Reusable Components**: All common components work across sports
- **Toast Notifications**: Non-intrusive error/success messages
- **Timeout Fallback**: Auto-falls back to full season on custom range timeout
- **Optimized Rendering**: React.memo prevents unnecessary re-renders
- **Type Safety**: Full TypeScript with separated type definitions

**Database (PostgreSQL):**
- **Indexed Tables**: Fast queries with composite indexes on date/season/teams
- **Foreign Key Constraints**: Data integrity with team references
- **Incremental Sync**: Only fetches new games since last sync

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
- S^2 -- Football statistics and Fantasy Football tools
- More sports and leagues (basketball, soccer)
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

## AWS Deployment Guide

This section covers deploying Kimmetrics to AWS using EC2, RDS, and S3/CloudFront.

### Architecture Overview

- **Frontend**: React app built and deployed to S3 + CloudFront
- **Backend**: FastAPI app running on EC2 (or ECS/Lambda for advanced setups)
- **Database**: PostgreSQL on RDS
- **Daily Sync**: Cron job or EventBridge scheduled task running `daily_sync.py`

### 1. Database Setup (RDS PostgreSQL)

**Create RDS Instance:**
1. Go to AWS RDS Console
2. Create PostgreSQL database (version 14+ recommended)
3. Choose instance type (t3.micro for development, t3.medium+ for production)
4. Configure:
   - Database name: `kimmetrics`
   - Master username: `kimmetrics_admin` (or your choice)
   - Master password: (save securely)
   - VPC: Default or custom
   - Public accessibility: Yes (if accessing from local) or No (if EC2-only)
   - Security group: Allow inbound on port 5432 from your EC2 security group

**Connection String:**
```
postgresql://username:password@your-rds-endpoint.region.rds.amazonaws.com:5432/kimmetrics
```

### 2. Backend Deployment (EC2)

**Launch EC2 Instance:**
1. AMI: Amazon Linux 2023 or Ubuntu 22.04
2. Instance type: t3.small minimum (t3.medium recommended for production)
3. Security group:
   - Inbound: Port 8000 (API), Port 22 (SSH)
   - Outbound: All traffic
4. Key pair: Create or use existing for SSH access

**SSH and Setup:**
```bash
# SSH into your instance
ssh -i your-key.pem ec2-user@your-ec2-public-ip

# Update system
sudo yum update -y  # Amazon Linux
# or
sudo apt update && sudo apt upgrade -y  # Ubuntu

# Install Python 3.13 (or use pyenv)
sudo yum install python3.13 -y

# Install PostgreSQL client
sudo yum install postgresql15 -y

# Install git
sudo yum install git -y

# Clone your repository
git clone https://github.com/your-username/kimmetrics.com.git
cd kimmetrics.com/backend

# Create virtual environment
python3.13 -m venv .venv
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env
nano .env
```

**Configure `.env` for Production:**
```bash
DATABASE_URL=postgresql://username:password@your-rds-endpoint.region.rds.amazonaws.com:5432/kimmetrics
ALLOWED_ORIGINS=https://your-domain.com,https://www.your-domain.com
```

**Initialize Database:**
```bash
python setup_database.py
```

**Run API with Gunicorn (production server):**
```bash
# Install gunicorn
pip install gunicorn

# Run (for testing)
gunicorn src.main:app -w 4 -k uvicorn.workers.UvicornWorker -b 0.0.0.0:8000

# Create systemd service for auto-start
sudo nano /etc/systemd/system/kimmetrics.service
```

**Systemd Service File (`/etc/systemd/system/kimmetrics.service`):**
```ini
[Unit]
Description=Kimmetrics FastAPI Application
After=network.target

[Service]
User=ec2-user
WorkingDirectory=/home/ec2-user/kimmetrics.com/backend
Environment="PATH=/home/ec2-user/kimmetrics.com/.venv/bin"
ExecStart=/home/ec2-user/kimmetrics.com/.venv/bin/gunicorn src.main:app -w 4 -k uvicorn.workers.UvicornWorker -b 0.0.0.0:8000
Restart=always

[Install]
WantedBy=multi-user.target
```

**Enable and Start Service:**
```bash
sudo systemctl daemon-reload
sudo systemctl enable kimmetrics
sudo systemctl start kimmetrics
sudo systemctl status kimmetrics
```

### 3. Daily Sync Automation

**Setup Cron Job:**
```bash
# Edit crontab
crontab -e

# Add daily sync at 6 AM EST (adjust for your timezone)
0 6 * * * /home/ec2-user/kimmetrics.com/.venv/bin/python /home/ec2-user/kimmetrics.com/backend/daily_sync.py >> /home/ec2-user/kimmetrics.com/logs/sync.log 2>&1
```

**Create logs directory:**
```bash
mkdir -p ~/kimmetrics.com/logs
```

### 4. Frontend Deployment (S3 + CloudFront)

**Build Frontend:**
```bash
# On your local machine or EC2
cd frontend

# Install dependencies
npm install

# Update API URL in src/utils/api.ts
# Change baseURL to your EC2 public IP or domain:
# baseURL: 'http://your-ec2-ip:8000/api'
# or
# baseURL: 'https://api.your-domain.com/api'

# Build for production
npm run build
```

**Create S3 Bucket:**
1. Go to S3 Console
2. Create bucket (e.g., `kimmetrics-frontend`)
3. Disable "Block all public access"
4. Enable static website hosting
   - Index document: `index.html`
   - Error document: `index.html` (for React Router)

**Upload Build:**
```bash
# Install AWS CLI if not installed
# Upload dist folder to S3
aws s3 sync dist/ s3://kimmetrics-frontend/ --delete
```

**Bucket Policy (make public):**
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::kimmetrics-frontend/*"
    }
  ]
}
```

**Setup CloudFront (CDN):**
1. Go to CloudFront Console
2. Create distribution
3. Origin domain: Your S3 bucket static website endpoint
4. Viewer protocol policy: Redirect HTTP to HTTPS
5. Default root object: `index.html`
6. Error pages: Add custom error response
   - HTTP error code: 403, 404
   - Response page path: `/index.html`
   - HTTP response code: 200

**Custom Domain (Optional):**
1. Get CloudFront distribution domain (e.g., `d123abc.cloudfront.net`)
2. In Route 53 or your DNS provider:
   - Create CNAME record: `www.your-domain.com` → CloudFront domain
   - Or use A record with alias to CloudFront

### 5. Security Hardening

**Backend:**
- Use AWS Secrets Manager for `DATABASE_URL` instead of `.env` file
- Setup HTTPS with Let's Encrypt or AWS Certificate Manager + Application Load Balancer
- Restrict RDS security group to only EC2 security group
- Enable RDS automated backups (7-30 day retention)
- Use IAM roles for EC2 instead of storing AWS credentials

**Frontend:**
- Enable CloudFront Origin Access Identity (OAI) to restrict direct S3 access
- Setup WAF (Web Application Firewall) rules on CloudFront
- Enable CloudFront access logging

### 6. Monitoring & Maintenance

**CloudWatch Monitoring:**
```bash
# Install CloudWatch agent on EC2
sudo yum install amazon-cloudwatch-agent -y

# Configure to monitor:
# - CPU usage
# - Memory usage
# - Disk usage
# - Application logs
```

**Log Management:**
- API logs: `/var/log/kimmetrics/api.log`
- Sync logs: `~/kimmetrics.com/logs/sync.log`
- Setup log rotation:
```bash
sudo nano /etc/logrotate.d/kimmetrics
```

**Database Backups:**
- RDS automated backups (enabled by default)
- Optional: Create manual snapshot before major updates

**Cost Optimization:**
- Use RDS reserved instances for 1-3 year commitment (saves 30-60%)
- Use EC2 reserved instances or Savings Plans
- Enable S3 lifecycle policies to move old logs to Glacier
- Setup AWS Budgets alerts

### 7. Environment Variables Summary

**Backend `.env`:**
```bash
DATABASE_URL=postgresql://username:password@rds-endpoint:5432/kimmetrics
ALLOWED_ORIGINS=https://your-domain.com
```

**Frontend `src/utils/api.ts`:**
```typescript
const api = axios.create({
  baseURL: 'https://api.your-domain.com/api',  // Or http://ec2-ip:8000/api
  timeout: 120000
});
```

### 8. Deployment Checklist

- [ ] RDS PostgreSQL database created and accessible
- [ ] EC2 instance launched with security groups configured
- [ ] Backend code deployed and running as systemd service
- [ ] Database initialized with `setup_database.py`
- [ ] Daily sync cron job configured
- [ ] Frontend built with correct API URL
- [ ] S3 bucket created and frontend uploaded
- [ ] CloudFront distribution created and working
- [ ] Custom domain configured (if applicable)
- [ ] HTTPS setup (Let's Encrypt or ACM)
- [ ] Backups configured for RDS
- [ ] CloudWatch monitoring enabled
- [ ] Cost alerts setup in AWS Budgets

## Local Development Setup

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
