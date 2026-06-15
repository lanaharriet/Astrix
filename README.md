# ASTRIX — Enterprise AI-Powered Smart Campus Ecosystem

> One Campus. Infinite Possibilities.

ASTRIX is a premium, enterprise-grade university management system (ERP) built using Next.js 15+ App Router, React 19, Tailwind CSS v4, and Supabase. The platform provides four uniquely designed dashboards tailored for students, faculty, parents, and administrators, with integrated real-time AI assistance powered by Groq (Llama 3.1 8B).

---

## Key Features

- **Dynamic Theme Engine**: Premium class-based Light and Dark theme switching with zero color flash (color interpolation, local storage persistence).
- **Interactive 3D ID Cards**: Interactive student, faculty, parent, and admin ID cards rendering glassmorphic styles and 3D rotates to reveal verified security QR codes.
- **SVG Campus Navigator**: Lightweight vector-based campus map with pan, zoom, classroom search, and a pathfinding router that draws route highlights.
- **QR Attendance & Predictor**: Dynamic QR attendance generators for faculty and statistical attendance predictors for students.
- **AI Career Hub**: Resume Analyzer scoring resumes out of 100, mapping technical skill gaps, and recommending placement drives.
- **Campus Copilot**: Llama 3.1 8B chatbot answering queries about timetables, results, leaves, and fee billing.
- **Unified DB Router**: Automatic connection resolver switching to local file-persistence (`local-db.json`) if Supabase env credentials are not set.

---

## Tech Stack

- **Frontend**: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, Zustand, Lucide React.
- **Backend/AI**: Supabase (PostgreSQL, Auth, RLS), Groq Cloud API (Llama 3.1 8B).

---

## Setup & Running

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Configure Environment Keys**:
   Copy `.env.example` to `.env.local` and add your keys:
   ```bash
   cp .env.example .env.local
   ```
   *Note: ASTRIX runs in local database fallback mode automatically if no keys are entered!*

3. **Database Initialization**:
   - Copy the SQL code inside [`schema.sql`](file:///L:/Astrix_2.0/schema.sql).
   - Paste it into your Supabase project SQL Editor and click **Run**.
   - Go to the **Admin Dashboard** inside the running app and click **Reset & Reseed Database** to populate initial student/faculty profiles.

4. **Run Development Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) to view the platform.

---

## Document Guides
- [Setup Guide](file:///L:/Astrix_2.0/Setup_Guide.md)
- [Database Setup Guide](file:///L:/Astrix_2.0/Database_Setup_Guide.md)
- [Deployment Guide](file:///L:/Astrix_2.0/Deployment_Guide.md)
