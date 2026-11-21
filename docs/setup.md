# Setup

Only the Tutor can log in. There is no sign-up page, so the Tutor user is created by hand and sign-ups are turned off in Supabase.

## Hosted Supabase (Dashboard)

1. Turn off sign-ups: Authentication → Sign In / Providers → turn off "Allow new users to sign up" → Save.
2. Create the Tutor user: Authentication → Users → Add user → Create new user. Enter the Tutor's email and a strong password, tick "Auto Confirm User", then Create user.
3. Check: Authentication → Users lists exactly one user, the Tutor.

## Local Supabase

1. In `supabase/config.toml`, under `[auth]`, set `enable_signup = false`, then restart (`supabase stop && supabase start`).
2. Create the Tutor user in the local Studio (http://localhost:54323): Authentication → Users → Add user, with "Auto Confirm User" ticked.
