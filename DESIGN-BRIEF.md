# Design Brief: Booking Page and Tutor Screens

Agreed 2026-11-20 (Impeccable `shape`). Product facts: PRODUCT.md. Rules: SPEC.md. Words: GLOSSARY.md.

## 1. Who it's for
- **Students**: 15 to 25, booking for themselves, almost always on a phone, from a link the Tutor sends. One short visit, no login, no idea how the system works.
- **Tutor**: works on a phone between Lessons, sometimes on a laptop. Checks Bookings often, changes Open time rarely.
- Both are task screens: the visitor came to get a job done, and the look never gets in the way.

## 2. What success looks like
- **Student**: find a free time, tap it, enter name and email, and see the confirmation, all on one sheet in under a minute. The confirmation is the Student's only record (no emails).
- **Tutor**: see at a glance who is coming in the next two weeks, cancel a Booking in two taps, and change open time knowing exactly which Bookings it affects.

## 3. The look: "The Door Sheet", calmer
- **Idea**: an office-hours sign-up sheet. Each free Slot is a ruled line, and booking means writing yourself onto it.
- **Colour**: white paper and dark ink, plus **one accent, ballpoint blue**. Blue is used only for Slot times you can tap, the selected line, the Book button, and your inked-in line on the confirmation. Nothing else has colour.
- **Structure**: thin ruled lines do all the separating. No cards, shadows, tape, photos or decoration.
- **Times are the biggest text on the page**, in large, easy-to-read type with even-width figures. Every Slot row is the same large size. The time leads each row; the day sits in a small heading tab above.
- **Past and cancelled items are crossed out in dark ink**, never greyed out and never red.
- **Type**: one plain, very readable font throughout. No handwriting fonts; the "ballpoint" comes from the colour only.

## 4. Scope and limits
- **In scope**: the six screens in SPEC.md: Booking page, Booking form, Confirmation, Login, Bookings, Open time. On the Student side, the form and confirmation happen on the booking page sheet.
- **Not included**: extra screens or features, Add to calendar, Student time zones, illustrations, new libraries beyond the starter app.
- **Would feel wrong**: a booking-tool look with a month calendar, pop-up windows, playful colours, a time without its zone label, any hint of other Students.

## 5. Screens and states
- **Slot volume**: usually 5 to 20 a week (20 to 80 across the 4-week Booking Horizon), shown as a day-by-day list grouped by week. Days with no free Slots don't appear.
- **No times**: a calm, full-sheet message: "No open times right now, please message [Tutor]".
- **Just taken**: the tapped line shows "This time was just taken" and the list refreshes. The name and email already entered are kept so the Student can tap another time.
- **Form**: name and email required. Errors appear on the line under the field. The Book button shows it is saving. Hidden bot field.
- **Bookings (Tutor)**: a **simple list of the next two weeks only**. One row per active Booking, earliest first, each showing the labelled date and time, name, email and Cancel. No day grouping or calendar. Cancel asks for a quick confirm on the same line. Empty: "No Bookings in the next two weeks." Under the list, one plain "Later" link shows the active Bookings beyond two weeks in the same row format, so every upcoming Booking can still be seen and cancelled. Cancelled and past Bookings stay in a separate list below (SPEC.md requires it), each crossed out.
- **Open time (Tutor)**: Weekly Hours as seven ruled day lines with start and end times. Exceptions as a dated list, each marked "closes" or "opens". Minimum Notice and Booking Horizon as two plain settings. When a change affects Bookings, a warning lists each affected Booking by date, time and name, and says nothing will be cancelled.
- **Login**: one password field. After 5 wrong tries, a plain lockout message saying when to try again.

## 6. Layout and interaction
- **Phone first**: one column. The top of the sheet shows the Tutor's display name and "All times in [zone] time". Free Slots start right below.
- **Booking a Slot**: tapping a line opens Name, Email and Book right under it on the sheet, and on success that line becomes the blue confirmation. The only motion is the line opening and the ink filling in. With reduced motion on, both are instant.
- **Laptop**: the same narrow sheet, centred. The Tutor screens switch between Bookings and Open time with two plain tabs at the top.
- **Controls**: standard buttons, inputs, tabs and time pickers. Tap targets at least 44px. Blue on white meets WCAG AA contrast.

## 7. Constraints and open decisions
- **Fixed**: Next.js with the starter app's Tailwind setup, GLOSSARY.md words, every time shown as date + time + zone (e.g. "Tue 24 Nov, 5:00pm (London time)").
- **Settled: Bookings beyond two weeks.** The list shows the next two weeks; a "Later" link shows the rest (Booking Horizon is 4 weeks). All upcoming active Bookings stay reachable, so SPEC.md and PLAN.md T9 need no change.
- **Open, settled with the Tutor during the build**: the exact blue and font, empty-state and warning wording beyond what SPEC.md fixes, and whether the form and confirmation keep their own web addresses under `web/app/book/` (PLAN.md T8 owns that folder).
