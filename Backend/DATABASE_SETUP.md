# Database Setup Options for Chad-Tutor

## Option 1: Install PostgreSQL Locally (Recommended for Development)

### Download and Install:
1. Go to https://www.postgresql.org/download/windows/
2. Download PostgreSQL installer for Windows
3. Run installer with these settings:
   - Username: postgres
   - Password: postgres
   - Port: 5432
   - Database: Create "chad_tutor" database

### After Installation:
```bash
# Connect to PostgreSQL
psql -U postgres -h localhost

# Create database (if not created during install)
CREATE DATABASE chad_tutor;
```

## Option 2: Use Docker Desktop

### Install Docker Desktop:
1. Download from https://www.docker.com/products/docker-desktop/
2. Install and restart your computer
3. Run the docker-compose.yml file we created:
```bash
docker-compose up -d
```

## Option 3: Cloud PostgreSQL (Easiest)

### Use Supabase (Free tier):
1. Go to https://supabase.com
2. Create account and new project
3. Copy the database URL from Settings > Database
4. Update your .env file with the connection string

### Use Railway (Free tier):
1. Go to https://railway.app
2. Create account and deploy PostgreSQL
3. Copy connection string to .env

### Use Neon (Free tier):
1. Go to https://neon.tech
2. Create account and database
3. Copy connection string to .env

## Current Environment Setup

Your current .env expects:
- Host: localhost
- Port: 5432  
- Username: postgres
- Password: postgres
- Database: chad_tutor

Choose any option above and ensure your PostgreSQL matches these credentials, or update the .env file with your actual database connection details.

## Test Connection

After setting up PostgreSQL, test the connection:
```bash
# Generate migration (this will create tables)
npx prisma migrate dev --name init

# Generate Prisma client
npx prisma generate

# Start your backend
npm run dev
```