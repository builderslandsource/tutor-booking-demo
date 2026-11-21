# Booking Page

A booking page for a Tutor working alone. Students pick a free Slot and confirm with their name and email. The Tutor logs in to see and cancel Bookings and to set their open time.

## Why
- Stop paying a $15 to $40/month booking tool, and learn to build small tools with AI.
- A free booking page stays live as a backup. Students move to this page only after all six break tests pass.

## Settled decisions
- Users: the Tutor (the only person who logs in) and Students (no accounts, known only by name and email).
- Each Booking is one 60-minute Lesson.
- Open time = Weekly Hours plus Exceptions that close or open time on specific dates.
- Slots run back to back, 60 minutes each, from the start of each block of open time.
- A Booking is either active or cancelled; cancelled Bookings stay on record.
- Only the Tutor cancels a Booking. Students message the Tutor directly.
- All times are shown in the Tutor's time zone, labeled on every time. All students are local.
- Minimum Notice is 12 hours. Booking Horizon is 4 weeks. Both are settings.
- Changing Weekly Hours or adding an Exception never cancels a Booking. The Tutor is warned about the active Bookings it affects and decides what to do.
- No limit on how many Bookings one Student can make.
- After booking, the Student sees a confirmation screen with the date, the time (with time zone), and how to cancel (message the Tutor).
- Tutor login: one strong password, with a lockout after repeated wrong tries.
- Student names and emails are kept indefinitely in version 1.
- If two Students book the same Slot at once, the first one gets it. The second sees "This time was just taken" and the updated Slots.
- Booking form: name and email both required, with an email format check. No notes field.
- Spam protection: a hidden field that bots fill in; any submission that fills it is rejected.
- Students see only future free Slots within the Booking Horizon. If there are none: "No open times right now, please message [Tutor]".
- Tutor's Bookings screen: upcoming active Bookings by date, with cancelled and past Bookings in a separate list.
- The Tutor cannot add Bookings by hand in version 1.
- Six break tests must pass before switching: double-booking the same Slot, a daylight saving change date, time zone labels, the admin screens blocked without login, junk form input, and a cancelled Slot reopening.

## Out of scope (version 1)
- Emails of any kind (confirmations, reminders), payments, calendar sync.
- Students cancelling Bookings themselves.
- Lesson lengths other than 60 minutes, and repeating Bookings.
- Breaks between Lessons (the Tutor leaves gaps in Weekly Hours instead).
- An "Add to calendar" button.
- Automatic clearing of Student data (planned for version 2).
- Limits per Student.

## Stack
- Next.js + Supabase, hosted on Vercel.

## Still open
- Nothing.
