# ◈ DAYFLOW: Spatial Human Operations Command System

Dayflow is a modern, responsive, and robust Human Resources Management System designed not as a typical administrative dashboard, but as a high-performance **Human Operations Command System**. It transitions away from generic SaaS interfaces to a "Spatial UI" driven by dark graphite aesthetics, sparse neon cues, and real-time operational signals.

## Core Features

- **Intelligence Center**: Organization Pulse, Attention Stream, and AI-driven Dayflow Analysis to highlight operational anomalies.
- **People Directory & Identity Dossier**: Spatial bento-grid directory with "Flow Signals" indicating active status. In-depth employee profiles feature horizontal activity timelines spanning join dates, attendance, leave, and payroll events.
- **Attendance Workflows**: Granular views including Daily metrics and a spatial 14-day Heatmap showing operational consistency.
- **Leave Pipeline**: Interactive Kanban-style workflow (Requested → Approved/Rejected → Resolved) built with Next.js Server Actions.
- **Precision Payroll**: High-contrast, easy-to-read grids tracking gross salaries, deductions, and net pay. Dedicated spatial payslips designed for print logic.
- **Progressive Settings**: A modernized configuration panel leveraging progressive disclosure via URL parameters for a clean, non-scrolling experience.
- **Global Command Palette**: Instant access to any organizational domain via `CMD+K`.

## Tech Stack

- **Framework**: Next.js 15 (App Router, Server Components, Server Actions)
- **Styling**: Vanilla CSS (CSS Modules) utilizing Spatial Design Tokens
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Typography**: Space Grotesk (Headers), Inter (Body), IBM Plex Mono (Data/Monospaced elements)

## Architecture

Dayflow utilizes a deeply integrated database-first approach. All components read dynamically from the Prisma PostgreSQL database ensuring high integrity and deterministic data flow instead of mock API stubs.

## Setup Instructions

1. Install dependencies across the monorepo (if applicable) or root:
   ```bash
   cd frontend
   npm install
   ```

2. Configure environment variables in `frontend/.env` pointing to your database instance:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/dayflow?schema=public"
   ```

3. Synchronize database schema and seed data (ensure you are running a PostgreSQL instance):
   ```bash
   cd database
   npx prisma db push
   node seed.js
   ```

4. Run the development server:
   ```bash
   cd frontend
   npm run dev
   ```
   Navigate to `http://localhost:3000`

## Design Language

Dayflow embraces **Spatial Operations**:
- **Background**: Deep Graphite (`var(--bg-color)`).
- **Surface Panels**: Slightly raised, border-driven panels (`spatial-panel`, `spatial-panel-raised`).
- **Accents**: Electric Cyan (`var(--accent-primary)`) and Hyper Red (`var(--status-critical)`).
- **Flow Signals**: Colored dots indicating state context, minimizing text-heavy table reads.
