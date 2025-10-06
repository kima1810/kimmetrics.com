# Database Setup Guide

## Local Development (PostgreSQL)

### Install PostgreSQL

**macOS:**
```bash
brew install postgresql@14
brew services start postgresql@14

**Windows:**
Download and install from: https://www.postgresql.org/download/windows/

**Linux (Ubuntu/Debian):**
'''bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql