# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Students**: teens and university students, roughly 15 to 25, booking Lessons for themselves, almost always on a phone. They have no account and arrive with one job: find a free time and take it.
- **Tutor**: one person working alone, the only one who logs in. Uses the Tutor screens mostly on a phone between Lessons, and sometimes edits open time on a laptop. Both Tutor screens must work fully on a phone.

## Product Purpose

A personal booking page for a solo Tutor. Students pick a free 60-minute Slot and confirm with name and email; the Tutor sees and cancels Bookings and sets open time (Weekly Hours plus Exceptions, Minimum Notice, Booking Horizon). It replaces a paid booking tool. Success is all six break tests passing so Students can be moved over from the free backup page.

## Positioning

One Tutor's own page, not a marketplace or a scheduling product. It carries the Tutor's name and nothing else to sell. Every time is in the Tutor's time zone with the label on it, because all Students are local.

## Operating Context

- Students get the link directly from the Tutor (by message) and book in one short visit. Cancelling is done by messaging the Tutor, not on the page.
- No emails are sent; the confirmation screen is the Student's only record of the Booking.
- The Tutor checks upcoming Bookings often and changes open time rarely.

## Capabilities and Constraints

- Screens and rules: SPEC.md. Words: GLOSSARY.md (use Tutor, Student, Lesson, Slot, Booking, Weekly Hours, Exception, Minimum Notice, Booking Horizon; avoid the listed synonyms in UI copy).
- Stack: Next.js + Supabase on Vercel, starter app in `web/` (Tailwind and shadcn-style components already present).
- Every time shown carries its time zone label. Students never see another Student's data.
- Out of scope for v1: emails, payments, calendar sync, Student self-cancel, add-to-calendar, Students' own time zones.

## Brand Commitments

- The page is titled with the Tutor's display name only (from Settings). No subject line, logo, or brand colours exist.

## Evidence on Hand

- None: no photos, testimonials, reviews, or subject description. Do not invent any.

## Product Principles

1. Booking takes one short visit on a phone: see times, pick one, give name and email, done.
2. Time is never ambiguous: date, time, and time zone label together, every time.
3. Nothing a Student sees could reveal another Student.
4. The Tutor is warned, never overruled: open-time changes flag affected Bookings and cancel nothing.
5. Do the smallest thing that does the job; no features beyond SPEC.md.
