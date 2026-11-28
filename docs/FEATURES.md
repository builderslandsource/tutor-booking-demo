# Features

What the Booking Page does, and why each part is there. Students book 60-minute Lessons with one Tutor who works alone.

## Booking page
Shows the Tutor's free Slots for the next 4 weeks, one week at a time, under one line naming the Tutor's time zone (for example "All times in London time").
**Why:** Students can see at a glance when they can book, without messages back and forth, and nobody gets confused about which time zone is meant.

## Booking form
The Student picks a Slot and gives a name and email. Both are required. Students do not need an account.
**Why:** Booking stays quick, and the Tutor still knows who is coming and how to reach them.

## No double bookings
If two Students try for the same Slot, only the first one gets it. The other sees "This time was just taken" and the updated list of free times. The database itself enforces this, not just the page.
**Why:** A Tutor can only teach one Student at a time.

## Confirmation
After booking, the Student sees the date and time of the Lesson with its time zone, and "To cancel, message [Tutor]".
**Why:** The Student has a clear record, and knows how to cancel, since Students cannot cancel in the app.

## Tutor login with lockout
Only the Tutor can log in, with one password. There is no sign-up. After 5 wrong passwords in a row, login is locked for 15 minutes.
**Why:** Student names and emails are private. The lockout stops someone guessing the password.

## Bookings screen
The Tutor sees upcoming Bookings by date (the next two weeks first, later ones folded under "Later"), and can cancel any of them. Cancelled and past Bookings sit in a separate list. Every time is labeled with its time zone.
**Why:** The Tutor needs one place to see who is coming and to cancel when plans change. Cancelled Bookings stay on record.

## Open time screen
The Tutor sets Weekly Hours (for example Monday 4pm to 8pm), adds Exceptions for single dates (closing or opening time), and changes the Minimum Notice (how close to the start a Slot can still be booked, now 12 hours) and the Booking Horizon (how far ahead, now 4 weeks).
**Why:** The Tutor decides when they teach, and can handle holidays and one-off changes.

## Warning instead of automatic cancelling
If a change to open time leaves some Bookings outside it, the screen lists them and says nothing has been cancelled. They stay booked until the Tutor cancels them.
**Why:** A Booking is a promise to a Student. Only the Tutor should end it, on purpose.

## Privacy
Visitors only ever see free Slot times and the Tutor's name and time zone. They never see other Students, Bookings, Weekly Hours or Exceptions. Only the Tutor can read or change those.
**Why:** No Student should ever see another Student's name, email or Booking.

## Not in this version
No emails, payments, calendar sync, Student cancelling, other Lesson lengths, or times shown in the Student's own time zone.
