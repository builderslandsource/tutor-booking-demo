# Setup

Only the Tutor can log in. There is no sign-up page, so the Tutor user is created by hand and sign-ups are turned off in Supabase.

## Hosted Supabase (Dashboard)

1. Turn off sign-ups: Authentication → Sign In / Providers → turn off "Allow new users to sign up" → Save.
2. Create the Tutor user: Authentication → Users → Add user → Create new user. Enter the Tutor's email and a strong password, tick "Auto Confirm User", then Create user.
3. Check: Authentication → Users lists exactly one user, the Tutor.
4. Make that user the Tutor, or nobody can see the Bookings: SQL Editor → run `update settings set tutor_id = (select id from auth.users where email = 'TUTOR_EMAIL');` with the Tutor's email. Pushing the migrations after the user exists does this for you. Do it again if you ever delete and recreate the Tutor user.
5. Password resets are done here, not in the app: Authentication → Users → pick the Tutor → set a new password.

## Local Supabase

1. In `supabase/config.toml`, under `[auth]`, set `enable_signup = false`, then restart (`supabase stop && supabase start`).
2. Create the Tutor user in the local Studio (http://localhost:54723): Authentication → Users → Add user, with "Auto Confirm User" ticked.
   Then make it the Tutor with the SQL from step 4 above (Studio → SQL Editor).
   Or load the demo data below, which creates the Tutor user and makes it the Tutor for you.

## Local demo data

`supabase/seed.sql` fills the local database with a Tutor login, Weekly Hours, two Exceptions and nine Bookings (six upcoming, one cancelled, two past). Booking dates are worked out from the moment you load it.

- Choose a local-only Tutor password and set it before loading: copy `.env.example` to `.env`, fill in `SEED_TUTOR_PASSWORD` (letters and digits, no spaces), then run `set -a; . ./.env; set +a` in your terminal. `.env` is git-ignored.
- Load it: `PGOPTIONS="-c seed.tutor_password=$SEED_TUTOR_PASSWORD" supabase db reset` (rebuilds the local database and runs the seed), or, to keep everything else, `PGOPTIONS="-c seed.tutor_password=$SEED_TUTOR_PASSWORD" PGPASSWORD=postgres psql -h 127.0.0.1 -p 54722 -U postgres -d postgres -1 -f supabase/seed.sql`. Without the password the seed stops with an error.
- Reloading wipes local Bookings, Weekly Hours and Exceptions and puts the demo ones back.
- Local demo login, **local only, never use on the hosted site**:
  - Email: `tutor@example.test`
  - Password: the `SEED_TUTOR_PASSWORD` you chose.
