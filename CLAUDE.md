# Booking Page

A booking page where Students book 60-minute Lessons with a Tutor who works alone, and the Tutor manages Bookings and open time.

- Spec: SPEC.md. Plan: PLAN.md. Words we use: GLOSSARY.md. Original decisions: IDEA.md.
- Task tracker: Beads (`bd ready` shows what can start). If Beads is not set up, PLAN.md is the task list.
- Stack: Next.js + Supabase, hosted on Vercel. App code is in `web/`. Database changes are in `supabase/`.
- Run: `cd web && npm run dev`, then open http://localhost:3000.
- Check: `cd web && npm run lint && npm run build`.
- Secrets go in `web/.env.local`, which the owner fills in. Never read, print, or commit any `.env` file.

## Must never happen
- A Student or visitor sees another Student's name, email or Booking.
- A secret (password, API key) appears in the app's code, the browser, or git.
- Two active Bookings hold the same Slot.
- A Slot is offered or booked outside open time, inside the Minimum Notice, or beyond the Booking Horizon.
- A change to Weekly Hours or Exceptions cancels a Booking. Only the Tutor cancelling ends a Booking.
- A time is shown without its time zone label. A time counts as labeled when it carries its own label, or when it sits in a group of times under one clear label for the whole group (such as "All times in London time" above the Slot chips). The confirmation and the Tutor's lists label every time.
- Anyone except the Tutor can log in, or create an account.

## How to build
- Do the smallest thing that meets the task's "Done when" check. No extra features, screens, or libraries.
- Only change the files the task owns. Anything not in SPEC.md is out of scope: ask first.
- Every table that holds private data has row level security on (a database rule that limits each row to the people allowed to see it).
- Slot rules are enforced in the database, not only in the pages.
- Every task updates `docs/FEATURES.md`, `docs/USER-GUIDE.md` and `CHANGELOG.md` (a dated line for the task), and lists those three files in its Owns line.
