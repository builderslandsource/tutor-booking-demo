# Deploy again on Vercel

Never write a key, a password or an email in this file, in the code, or in git. The values live only in Vercel's project settings and in `web/.env.local`.

## Database

1. Follow the "Hosted Supabase (Dashboard)" steps in `docs/setup.md`.

## App

1. In Vercel, add a new project and import this GitHub repository.
2. Set **Root Directory** to `web`.
3. Add the two environment variables named in `web/.env.example`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

   Copy each value from the Supabase dashboard. Paste it only into Vercel.
4. Click **Deploy**.
5. Whenever you change any of these variables later, redeploy. The app only picks up the new value on a new deploy.
