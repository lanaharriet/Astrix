# ASTRIX Setup & Configuration Guide

Follow these steps to run ASTRIX locally for development and testing.

---

## 1. Prerequisites

Ensure you have Node.js 18.x or later installed on your system.

## 2. Dependencies Setup

Run the following command to download NPM packages:
```bash
npm install
```

This installs core frontend modules (Next.js 16, React 19, Tailwind CSS v4, Zustand, Lucide) and database connectors.

## 3. Configure Environment Variables

Create a file named `.env.local` in the project root:
```bash
cp .env.example .env.local
```

Open `.env.local` and configure your credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-public-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
GROQ_API_KEY=gsk_your_groq_api_token
```

### Local Fallback Database Mode
If you do not specify Supabase keys, **ASTRIX will run in local mode**, persisting your data locally in [`src/lib/local-db.json`](file:///L:/Astrix_2.0/src/lib/local-db.json). This allows reviewing the complete app experience instantly.

## 4. Run Locally

Start the Next.js development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) on your browser.

## 5. Developer Quick-Login Portals

When logging in at `/auth/login`, you can bypass registration by clicking the **Developer Quick-Login Portals** buttons:
- **Student**: John Doe (`john.doe@astrix.edu`)
- **Faculty**: Dr. Alan Turing (`turing@astrix.edu`)
- **Parent**: Richard Doe (`richard.doe@gmail.com`)
- **Admin**: Dr. Sarah Jenkins (`admin@astrix.edu`)
