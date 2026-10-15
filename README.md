# Daily Routine Tracker

A modern daily routine, habit tracker, and consistency analytics dashboard built with Next.js (App Router), React, Tailwind CSS, and PostgreSQL (Drizzle ORM).

## Features

- **Custom Tracker Generation**: Create routines with custom days, tasks, colors, and icons.
- **Interactive Daily Grid**: Mark tasks completed across days with real-time progress calculations.
- **Consistency Analytics**: Completion metrics, active streaks, and performance overview.
- **PDF Export**: Export routine sheets and progress reports using jsPDF.
- **Automatic Schema Migration**: Tables are automatically verified and created idempotently on first run.
- **Vercel Ready**: Optimized for serverless deployment on Vercel with automatic pooling, SSL, and zero build-time database dependency.

---

## Deploy to Vercel

### 1. Push to GitHub / GitLab / Bitbucket
Push your repository to your Git provider.

### 2. Import into Vercel
1. Go to [Vercel](https://vercel.com/) and click **Add New Project**.
2. Select your repository and keep the default Next.js framework preset.

### 3. Attach a Database
Choose either of the following:

#### Option A: Vercel Postgres / Neon (Recommended)
1. In your Vercel project dashboard, navigate to the **Storage** tab.
2. Click **Create Database** -> select **Postgres** (powered by Neon).
3. Connect it to your project. Vercel automatically populates `POSTGRES_URL` and `DATABASE_URL`.
4. The application automatically initializes all required tables (`trackers`, `tracker_tasks`, `tracker_completions`, `reminder_settings`) on first access!

#### Option B: External PostgreSQL (Neon, Supabase, AWS RDS, Railway, etc.)
In your Vercel project **Settings** > **Environment Variables**, add:
- `DATABASE_URL`: Your full PostgreSQL connection string (e.g. `postgresql://user:password@ep-xyz.us-east-2.aws.neon.tech/neondb?sslmode=require`).

---

## Local Development

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Ensure `DATABASE_URL` points to your PostgreSQL instance.

### 3. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Available Scripts

- `npm run dev` - Start Next.js development server
- `npm run build` - Create optimized production build
- `npm run start` - Start production server
- `npm run typecheck` - Run TypeScript compiler check
- `npm run lint` - Run ESLint checks
- `npm run db:push` - Push Drizzle schema changes directly to PostgreSQL
- `npm run db:studio` - Open Drizzle Studio web GUI for inspecting database rows