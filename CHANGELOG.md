# Changelog

Newest first. Built from the git history.

## 2026-11-22
- Marked tasks T1 to T10 as done in the plan.

## 2026-11-21
- Fixed: only the Tutor can now read or change Bookings, Weekly Hours, Exceptions and Settings (before, any logged-in user could).
- The local demo password is now read from your own settings, not written in the project.
- Kept the agent dashboard, generated images and recordings out of git.
- Added a paper-style "page not found" screen, a more compact Open time screen, and one time zone line on the Tutor screens.
- One clear time zone label can now cover a whole group of times.
- Booking page now shows one week at a time, with time buttons and an intro card.

## 2026-11-20
- Gave the pages depth: a raised paper sheet on a warm desk, with quieter time zone labels.
- Reviewed and polished all six screens; added week labels to the booking page.
- Restyled all six screens to the design brief.
- Wrote the design brief: warm paper look, colours, fonts, laptop layout.
- Added local demo data and the local login steps to the setup guide.
- Kept the private design mood board out of git.
- Tidied up: removed unused code, and made the Open time warning use the same open-time rule as the booking page.
- Added the Open time screen (Weekly Hours, Exceptions, Minimum Notice, Booking Horizon, and the warning).
- Added the Bookings screen, where the Tutor sees and cancels Bookings.
- Added the Tutor login guard and a 15-minute lockout after 5 wrong passwords; turned off sign-ups.
- Fixed the browser tab title.
- Added the booking page, booking form and confirmation.
- Added a privacy check so visitors can never read Bookings or other private data.
- Added the booking step: rejects blank names, refuses times outside the bookable window, and never lets two Students take one Slot.
- Added a helper that shows every time with its time zone.
- Worked out free Slots from open time, skipping any Slot that overlaps an active Booking and handling the spring clock change.
- Added Tutor-only login and fixed the setup guide's local address.
- Created the data tables and their privacy rules.
- Added the local Supabase setup.
- Set up the task tracker (Beads).
- Started the project: spec, plan and starter app.
