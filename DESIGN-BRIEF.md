# Design Brief: Booking Page and Tutor Screens

Agreed 2026-11-20 (Impeccable `shape`). Updated 2026-11-20: a raised sheet on a tinted desk, quieter zone labels, solid Log in. Product facts: PRODUCT.md. Rules: SPEC.md. Words: GLOSSARY.md.

## 1. Who it's for
- **Students**: 15 to 25, booking for themselves, almost always on a phone, from a link the Tutor sends. One short visit, no login, no idea how the system works.
- **Tutor**: works on a phone between Lessons, sometimes on a laptop. Checks Bookings often, changes Open time rarely.
- Both are task screens: the visitor came to get a job done, and the look never gets in the way.

## 2. What success looks like
- **Student**: find a free time, tap it, enter name and email, and see the confirmation, all on one sheet in under a minute. The confirmation is the Student's only record (no emails).
- **Tutor**: see at a glance who is coming in the next two weeks, cancel a Booking in two taps, and change open time knowing exactly which Bookings it affects.

## 3. The look: "The Door Sheet", a paper sheet on a warm desk
- **Idea**: an office-hours sign-up sheet. Each free Slot is a ruled line, and booking means writing yourself onto it. Calm, roomy and quietly warm: a good paper notebook, not a booking app.
- **Style**: calm minimal with quiet depth. The page background is a tinted desk; the working content sits on **one soft raised paper sheet** per screen (one gentle warm shadow, rounded 16px corners, no border). On a phone the sheet runs full width and rises from below the Tutor's name with rounded top corners; wider screens show a floating sheet. Inside the sheet: lots of space and thin ruled lines. Still no cards inside the sheet, no nested sheets, tape, photos, illustrations or decoration.
- **Colour**: warm desk `#EDE6DA` (page background only), warm off-white paper `#FAF7F2` (the sheet), dark ink `#1F2430`, soft ink `#5B6170` for small notes, and **one accent, ballpoint blue `#1D4ED8`**. Blue is used only for Slot times you can tap, the selected line (tinted `#EEF2FD`), the Book button, and your inked-in line on the confirmation. Ruled lines are `#D9D2C5`; field borders are `#8A8478`. Nothing else has colour. Errors are in dark ink with a clear label, not red.
- **Type**: two fonts. **Newsreader** (serif) only for the Tutor's name, day headings and page titles. **Public Sans** for everything else. No handwriting fonts; the "ballpoint" comes from the colour only.
- **Times are the biggest text on the page**: Public Sans semibold, about 22px on phone, all digits the same width. Every Slot row is the same height. The time leads each row; the day sits above in a small, spaced-out capital-letter heading.
- **Time zone labels are always there, but quiet**: where the zone is repeated next to a time (Slot rows, Bookings rows, the confirmation, section titles) it is set smaller (about half the time's size, never under 12px), regular weight, soft ink. It is never removed or hidden. The single "All times in [zone] time" line under the Tutor's name stays at normal size.
- **Spacing**: generous. Slot rows at least 56px tall, 24px side margins on phone, clear space between weeks.
- **Past and cancelled items are crossed out in dark ink**, never greyed out and never red.
- **Buttons**: the Book button is solid blue with white text and fully rounded ends. Log in, the only action on its screen, is solid dark ink with paper-coloured text. Other buttons are plain ink outlines. Cancel is plain ink text.

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
- **Phone first**: one column, 24px side margins. The Tutor's display name and "All times in [zone] time" sit on the desk at the top; the sheet with the free Slots starts right below.
- **Booking a Slot**: tapping a line opens Name, Email and Book right under it on the sheet, and on success that line becomes the blue confirmation. The only motion is the line opening and the ink filling in. With reduced motion on, both are instant.
- **Laptop: full and designed, not a thin strip.** The page uses the width with the same paper, ink and lines, no new content. Booking page: two columns. Left, on the desk: the Tutor's name in large Newsreader, and "All times in [zone] time", staying in view while you scroll. Right: the raised sheet holding the Slot list, with each week's days side by side where they fit. The confirmation fills that same sheet: the time large in blue with the ink line, then Lesson and Name side by side, then the screenshot and cancel notes. Tutor screens: Bookings rows spread into one line each (date and time, name, email, Cancel in aligned columns); Open time shows Weekly Hours and Exceptions side by side. Text lines stay a comfortable reading width; the layout fills the screen, the sentences don't. The Tutor screens switch between Bookings and Open time with two plain tabs on the desk above the sheet. Login: the Tutor's name on the desk, centred above a narrow raised sheet holding the form.
- **Controls**: standard buttons, inputs, tabs and time pickers. Tap targets at least 44px. Every text colour meets WCAG AA contrast on the paper (blue 6.3:1, white on blue 6.7:1).

## 7. Constraints and open decisions
- **Fixed**: Next.js with the starter app's Tailwind setup, GLOSSARY.md words, every time shown as date + time + zone (e.g. "Tue 24 Nov, 5:00pm (London time)").
- **Settled: Bookings beyond two weeks.** The list shows the next two weeks; a "Later" link shows the rest (Booking Horizon is 4 weeks). All upcoming active Bookings stay reachable, so SPEC.md and PLAN.md T9 need no change.
- **Open, settled with the Tutor during the build**: empty-state and warning wording beyond what SPEC.md fixes, and whether the form and confirmation keep their own web addresses under `web/app/book/` (PLAN.md T8 owns that folder).
