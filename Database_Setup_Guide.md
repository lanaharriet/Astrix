# ASTRIX Database Setup Guide

This guide details how to configure your Supabase PostgreSQL database instance.

---

## 1. Execute SQL Migrations

1. Log in to your [Supabase Dashboard](https://supabase.com).
2. Create a new project or select an existing one.
3. Open the **SQL Editor** tab from the left sidebar navigation.
4. Click **New Query**.
5. Copy the entire content of [`schema.sql`](file:///L:/Astrix_2.0/schema.sql) in the project root.
6. Paste the SQL code into the Supabase editor window.
7. Click the **Run** button (top right).

This script initializes:
- 43 relational tables with appropriate constraints.
- Triggers to auto-update modified timestamps.
- Permissive Row-Level Security (RLS) policies.

---

## 2. Connect Your App

Update your `.env.local` file with the connection keys from the **Project Settings -> API** page:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-public-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
```

Once saved, the ASTRIX backend will automatically transition from the local JSON database file to Supabase.

---

## 3. Seed Database Records

1. Start your local server (`npm run dev`).
2. Log in as an **Admin** (use the Quick-Login Admin bypass on the `/auth/login` page).
3. Go to the default **Analytics & Settings** tab.
4. Click the red **Run Database Reset** button.

This triggers the `/api/admin/seed` backend endpoint, which performs a structured relational insert of all default profiles, subjects, courses, and settings directly into your Supabase database.
