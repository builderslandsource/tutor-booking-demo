# Booking Page: Plan

## Stack
Next.js + Supabase, hosted on Vercel (widely used and documented, free to start, with login and row-level privacy rules built in). App code lives in `web/`. Database changes live in `supabase/`.

Approach: Slot rules (open time, Minimum Notice, Booking Horizon, no double booking) are enforced in the database, so the public pages can never get around them. Visitors call two database functions, one to list free Slots and one to make a Booking. They never read the tables.

## Tasks
Run tasks in order unless marked parallel. A task starts only when everything in "Needs" is done.

### [done] T1: Check the starter app and make login Tutor-only
- Owns: `web/app/auth/` (except `web/app/auth/login/`), `web/components/` (sign-up and auth links only), `docs/setup.md`
- Needs: none
- Parallel: yes, with T2
- Done when: `cd web && npm run lint && npm run build` exits with no errors; `/auth/sign-up` returns a 404 page; no page links to sign-up; `docs/setup.md` lists the steps to create the one Tutor user and turn off sign-ups in the Supabase dashboard.

### [done] T2: Tables and privacy rules
- Owns: `supabase/migrations/0001_tables.sql`
- Needs: none
- Parallel: yes, with T1
- Done when: the migration applies cleanly to a fresh Supabase project and creates Booking, Weekly Hours, Exception and Settings tables with row level security on. Settings holds exactly one row with Minimum Notice 12 hours and Booking Horizon 4 weeks. A database rule rejects a second active Booking with the same Slot start, while a cancelled Booking does not block a new one.

### [done] T3: Free Slot calculation
- Owns: `supabase/migrations/0002_free_slots.sql`, `supabase/tests/free_slots.sql`
- Needs: T2
- Parallel: yes, with T5 and T6
- Done when: `supabase/tests/free_slots.sql` runs and every case passes: Weekly Hours of Monday 4pm to 8pm give exactly 4 Slots (4, 5, 6 and 7pm); a closing Exception removes the Slots it covers; an opening Exception adds Slots; Slots inside the Minimum Notice or beyond the Booking Horizon are left out; a Slot with an active Booking is left out, and it comes back once that Booking is cancelled; on the dates the clocks change, Slots keep the correct local times in the Tutor's time zone. The function returns Slot start times only.

### [done] T4: Booking function
- Owns: `supabase/migrations/0003_book_slot.sql`, `supabase/tests/book_slot.sql`
- Needs: T3
- Parallel: yes, with T5 and T6
- Done when: `supabase/tests/book_slot.sql` runs and every case passes: booking a free Slot creates an active Booking; booking the same Slot a second time (including two attempts at the same moment) returns "taken" and leaves one Booking; a Slot that is not currently free is rejected; an empty name, an empty email or a badly formed email is rejected; a filled-in hidden bot field is rejected. The function never returns a Student's name or email.

### [done] T5: Time display helper
- Owns: `web/lib/time.ts`, `web/scripts/check-time.ts`
- Needs: T1
- Parallel: yes, with T3, T4 and T6
- Done when: `cd web && npx tsx scripts/check-time.ts` prints passing results showing that a Slot is displayed with its date, time and time zone label (for example "Mon 30 Mar, 5:00pm (London time)") in the Tutor's time zone, including on the dates the clocks change; `npm run lint && npm run build` still pass.

### [done] T6: Tutor login guard and lockout
- Owns: `web/app/auth/login/`, `web/app/tutor/layout.tsx`, `web/lib/supabase/`, `web/proxy.ts`
- Needs: T1
- Parallel: yes, with T3, T4 and T5
- Done when: while logged out, opening `/tutor/bookings` or `/tutor/open-time` sends you to the login page; the Tutor can log in and reach both; after 5 wrong passwords in a row, the next login attempt is refused for at least 15 minutes, even with the right password.

### [done] T7: Privacy check
- Owns: `supabase/tests/privacy.sql`
- Needs: T4
- Parallel: yes, with T8, T9 and T10
- Done when: `supabase/tests/privacy.sql` runs and every case passes. As an anonymous visitor: reading the Booking, Weekly Hours or Exception tables returns no rows or an error; changing any table fails; the free Slot function returns only start times; making a Booking returns no name or email. As the Tutor: all tables can be read and changed.

### [done] T8: Booking page, booking form and confirmation
- Owns: `web/app/page.tsx`, `web/app/book/`, `web/components/booking/`
- Needs: T4, T5
- Parallel: yes, with T7, T9 and T10
- Done when: with Weekly Hours added directly in Supabase, the home page lists the free Slots for the next 4 weeks, each labeled with the time zone; choosing one, filling in name and email, and confirming shows the confirmation screen with the date, the time, the time zone and "To cancel, message [Tutor]"; after a refresh that Slot is gone; booking a Slot that was just taken shows "This time was just taken" and the updated Slots; with no open time the page says "No open times right now, please message [Tutor]"; the form contains a hidden bot field.

### [done] T9: Bookings screen
- Owns: `web/app/tutor/bookings/`
- Needs: T2, T5, T6
- Parallel: yes, with T7, T8 and T10
- Done when: logged in as the Tutor with 3 test Bookings (2 upcoming, 1 cancelled), `/tutor/bookings` lists the 2 upcoming active Bookings by date with name, email and labeled time, and the cancelled one in the separate list; cancelling an upcoming Booking moves it to the separate list, and its Slot shows again on the booking page.

### [done] T10: Open time screen
- Owns: `web/app/tutor/open-time/`
- Needs: T3, T5, T6
- Parallel: yes, with T7, T8 and T9
- Done when: logged in as the Tutor, you can add, change and remove Weekly Hours and Exceptions, and change Minimum Notice and Booking Horizon, and the booking page reflects each change; adding an Exception that closes a day with an active Booking shows a warning naming that Booking, and the Booking stays active; changing Weekly Hours so an active Booking falls outside them shows the same warning and the Booking stays active.

### T11: Deploy to Vercel
- Owns: `docs/deploy.md`, `docs/FEATURES.md`, `docs/USER-GUIDE.md`, `CHANGELOG.md`
- Needs: T7, T8, T9, T10
- Parallel: no
- Done when: the public Vercel URL shows the booking page and the Tutor can log in there; the database keys are set only in Vercel's project settings and `web/.env.local`; `git grep` for the Supabase keys finds nothing; `docs/deploy.md` lists the steps to deploy again; docs updated: the matching sections of `docs/FEATURES.md` and `docs/USER-GUIDE.md` are current and `CHANGELOG.md` has a dated line for T11.

### T12: End-to-end break tests
- Owns: `docs/break-tests.md`, `docs/FEATURES.md`, `docs/USER-GUIDE.md`, `CHANGELOG.md`
- Needs: T11
- Parallel: no
- Done when: `docs/break-tests.md` records the steps and a pass result for each of the six break tests, run against the deployed URL: (1) two browsers booking the same Slot at once leave exactly one Booking; (2) Weekly Hours across a date when the clocks change give Slots at the correct local times; (3) every time on every screen carries its time zone label; (4) the Tutor screens cannot be reached without logging in; (5) junk and empty form input is rejected cleanly; (6) a cancelled Booking's Slot shows again on the booking page. It also records the core job working end to end: a Student books a Slot, the Tutor sees it, cancels it, and the Slot reopens; docs updated: the matching sections of `docs/FEATURES.md` and `docs/USER-GUIDE.md` are current and `CHANGELOG.md` has a dated line for T12.

### T14: Add to calendar on the confirmation
- Owns: `web/lib/calendar.ts`, `web/scripts/check-calendar.ts`, `web/components/booking/`, `docs/FEATURES.md`, `docs/USER-GUIDE.md`, `CHANGELOG.md`
- Needs: none
- Parallel: no (shares the docs files with T11 and T12)
- Done when: `cd web && npx tsx scripts/check-calendar.ts` prints PASS for every case: a Lesson's file starts at the Slot time and ends exactly 60 minutes later, including a Lesson that starts at 00:30 UTC on 2027-03-28 when the clocks change in London; the file contains no Student name or email; `npm run lint` and `npm run build` pass; the confirmation shows an "Add to calendar" link that downloads the file; docs updated: the matching sections of `docs/FEATURES.md` and `docs/USER-GUIDE.md` are current and `CHANGELOG.md` has a dated line for T14.
