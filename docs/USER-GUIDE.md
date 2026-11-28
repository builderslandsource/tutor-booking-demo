# User Guide

## For Students

1. **Booking page.** Open the site's home page. You see free times for one week, under a line saying which time zone they are in. Use **Previous week** and **Next week** to look up to 4 weeks ahead. Click a time to choose it. If nothing is free, the page asks you to message the Tutor.
2. **Booking form.** Enter your name and email, then confirm. If someone else took that time a moment before you, you see "This time was just taken" and the updated times. Pick another.
3. **Confirmation.** You see the date and time of your Lesson with its time zone. Note it down: no email is sent. To cancel, message the Tutor.

## For the Tutor

1. **Login.** Go to `/auth/login` and log in with your email and password. After 5 wrong tries, wait 15 minutes. Forgot your password? See step 5 of the setup below.
2. **Bookings.** Shows active Bookings for the next two weeks, by date. Open "Later" for ones further ahead. To cancel, click **Cancel**, then **Yes, cancel this Booking** (or **Keep it** to back out). Tell the Student yourself; the app sends no emails. Cancelled and past Bookings are listed under "Cancelled and past".
3. **Open time.**
   - **Weekly Hours:** for each day, use **Add hours** to add a start and end time, or change times and click **Save**. A day with no hours shows "Closed".
   - **Exceptions:** pick a date, a start and end time, and whether it **closes** or **opens** time, then **Add Exception**. Change or remove existing ones in the list.
   - **Settings:** set Minimum Notice (in hours) and Booking Horizon (in weeks), then **Save settings**.
   - If a change leaves Bookings outside your open time, a warning lists them. Nothing is cancelled. Cancel them on the Bookings screen if you need to.

## Setting the app up (Hosted Supabase)

Supabase is the service that stores the app's data and handles the Tutor's login. Do these steps in the Supabase Dashboard for your project. The full version is in `docs/setup.md`.

1. **Turn off sign-ups.** Authentication → Sign In / Providers → turn off "Allow new users to sign up" → Save. This makes sure nobody else can create an account.
2. **Create your Tutor login.** Authentication → Users → Add user → Create new user. Enter your email and a strong password of your own, tick "Auto Confirm User", then Create user.
3. **Check.** Authentication → Users should list exactly one user: you.
4. **Make that user the Tutor.** Without this, nobody can see the Bookings. In the SQL Editor, run the one-line command from step 4 of `docs/setup.md`, with your email in place of `TUTOR_EMAIL`. (If the database setup is pushed after your user exists, this is done for you.) Repeat it if you ever delete and recreate your user.
5. **Password resets** are done in Supabase, not in the app: Authentication → Users → pick your user → set a new password.

The app's connection details for Supabase go in a private settings file (`web/.env.local`), which the owner fills in. Never paste a key or password into a document, chat or email.
