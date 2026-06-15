# ASTRIX Deployment Guide

This guide details how to deploy the ASTRIX Enterprise Smart Campus Ecosystem to Vercel for production.

---

## 1. Prepare for Deployment

Ensure your local codebase build completes successfully without errors before pushing to production:
```bash
npm run build
```

This builds the production Next.js bundle and confirms TypeScript type-safety.

## 2. Deploy to Vercel

### Option A: Vercel Git Integration (Recommended)
1. Push your ASTRIX project code to a private GitHub repository.
2. Go to the [Vercel Dashboard](https://vercel.com) and click **Add New -> Project**.
3. Import your GitHub repository.
4. Expand the **Environment Variables** section and configure the credentials:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `GROQ_API_KEY`
5. Click **Deploy**. Vercel will automatically build and serve the App Router application.

### Option B: Vercel CLI
If you prefer terminal deployments, install the Vercel CLI:
```bash
npm install -g vercel
vercel login
vercel
```
Follow the interactive prompts to bind environment variables and deploy.

---

## 3. Post-Deployment Verification

1. Access your deployed Vercel domain.
2. Navigate to `/auth/login` and verify that the logins route correctly.
3. Test the **Campus Copilot** chat drawer to verify that the Groq API key is successfully integrated.
4. Submit a leave request and check your Supabase dashboard to verify that records are persisting to production PostgreSQL.
