# Chad Tutor

Chad Tutor is a full-stack learning platform with a React + Vite frontend and an Express + Prisma backend.

## Stack

- Frontend: React, TypeScript, Vite, Clerk (browser auth)
- Backend: Express, TypeScript, Prisma, Clerk (server auth)
- Database: PostgreSQL

## Environment Setup

### 1) Frontend env

Create a frontend env file from [.env.example](.env.example):

```bash
cp .env.example .env
```

Required key:

- `VITE_CLERK_PUBLISHABLE_KEY=pk_...`

### 2) Backend env

Create a backend env file from [Backend/.env.example](Backend/.env.example):

```bash
cp Backend/.env.example Backend/.env
```

Required keys for production:

- `CLERK_SECRET_KEY=sk_...`
- `DATABASE_URL=postgresql://...`

## Local Development

1. Install dependencies:

```bash
npm install
cd Backend && npm install
```

2. Start backend:

```bash
cd Backend
npm run dev
```

3. Start frontend:

```bash
npm run dev
```

## Production Build

Frontend:

```bash
npm run build
```

Backend:

```bash
cd Backend
npm run build
npm start
```

## Clerk Key Split (Important)

- Frontend only: publishable key (`VITE_CLERK_PUBLISHABLE_KEY`)
- Backend only: secret key (`CLERK_SECRET_KEY`)

Do not put Clerk secret keys in frontend environment files.
