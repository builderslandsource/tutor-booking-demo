# Break tests

Run every test on the live Vercel address, not on localhost. Write what happened on each Result line: pass or fail, and anything odd you saw.

Live address:
Date run: 2026-11-23

## Core job: book, see, cancel, reopen

1. Open the live address in a private window.
2. Note the Time zone label above the Slots and pick a free Slot. Write down its date and time.
3. Enter a test name and email and confirm.
4. Check the confirmation shows the date, the time with its time zone, and "To cancel, message" the Tutor.
5. In another window, log in as the Tutor and open **Bookings**.
6. Check the Booking is in the upcoming list with the same date and time.
7. Click **Cancel**, then **Yes, cancel this Booking**.
8. Check the Booking moves to **Cancelled and past**.
9. Reload the booking page in the private window and check the Slot shows again.

Result: Pass (2026-11-23)

## 1. Two browsers booking the same Slot at once leave exactly one Booking

1. Open the live address in two different browsers (or one normal and one private window).
2. In both, pick the same free Slot and fill in the form with different test names.
3. Click confirm in both as close together as you can.
4. Check one gets the confirmation and the other gets a clear "this Slot is taken" style message, not a crash.
5. Log in as the Tutor, open **Bookings**, and check there is exactly one active Booking for that Slot.
6. Cancel the test Booking.

Result: Pass (2026-11-23)

## 2. Weekly Hours across a clock change give Slots at the correct local times

1. Log in as the Tutor and open **Open time**. Note the Tutor's time zone and the current Booking Horizon.
2. Find the next date the clocks change in that time zone.
3. If that date is beyond the Booking Horizon, raise the Booking Horizon so it reaches a week past that date.
4. Make sure Weekly Hours include the weekday just before and just after the change (for example 09:00 to 12:00).
5. Open the booking page and go to the week before the change and the week after.
6. Check the Slots start at the same local clock times on both sides (09:00, 10:00, 11:00), not an hour off.
7. Put the Booking Horizon and Weekly Hours back the way they were.

Result: Pass (2026-11-23)

## 3. Every time on every screen carries its time zone label

1. On the booking page, check there is one clear time zone label above the Slots.
2. Pick a Slot and check the booking form shows the time zone with the chosen time.
3. Book it and check the confirmation shows the time zone with the time.
4. Log in as the Tutor. On **Bookings**, check every time in the upcoming list and in **Cancelled and past** carries its time zone.
5. On **Open time**, check Weekly Hours, Exceptions, and any warning listing affected Bookings show the time zone.
6. Cancel the test Booking.

Result: Pass (2026-11-23)

## 4. The Tutor screens cannot be reached without logging in

1. Open a new private window that has never logged in to the app (the app has no log out button to use for this).
2. Type the live address followed by `/tutor/bookings` and press Enter.
3. Check you are sent to the login page and see no Bookings, names or emails.
4. Do the same with `/tutor/open-time`.
5. Check you are sent to the login page and see no Weekly Hours or settings.
6. On the login page, check there is no way to sign up or create an account.

Result: Pass (2026-11-23)

## 5. Junk and empty form input is rejected cleanly

1. On the booking page, pick a Slot and click confirm with name and email empty. Check a clear message shows and no Booking is made.
2. Enter a name but the email `not-an-email`. Check it is rejected with a clear message.
3. Enter only spaces in the name. Check it is rejected.
4. Enter a very long name (paste a few hundred characters). Check the page does not crash.
5. On the login page, submit empty fields, then a wrong password. Check each shows a clear message and does not log in.
6. As the Tutor on **Open time**, try an end time before the start time and an empty or negative Minimum Notice. Check each is rejected with a clear message and nothing is saved.
7. Log in as the Tutor, open **Bookings**, and check no junk Booking was created.

Result: Pass (2026-11-23)

## 6. A cancelled Booking's Slot shows again on the booking page

1. Book a free Slot on the booking page. Write down its date and time.
2. Reload the booking page and check that Slot is gone.
3. Log in as the Tutor, open **Bookings**, and cancel that Booking.
4. Reload the booking page and check the Slot shows again at the same date and time.

Result: Pass (2026-11-23)
