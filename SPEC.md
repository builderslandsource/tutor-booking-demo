# Booking Page: Spec

A booking page where Students book 60-minute Lessons with a Tutor who works alone, and the Tutor manages Bookings and open time.

## User
- **Tutor**: the only person who logs in (one password, with a lockout after repeated wrong tries). There is no sign-up.
- **Student**: has no account. Books a Slot by giving a name and email.

## Core job
A Student books a free 60-minute Slot with their name and email. Two Students can never hold the same Slot.

## Screens
| Screen | Who sees it | What they do there |
|---|---|---|
| Booking page | anyone | See the free Slots for the next 4 weeks, each time labeled with the Tutor's time zone, and pick one |
| Booking form | anyone | Enter name and email (both required) for the chosen Slot and confirm |
| Confirmation | anyone | See the booked date and time (with time zone) and "To cancel, message [Tutor]" |
| Login | Tutor | Log in with the password |
| Bookings | Tutor | See upcoming active Bookings by date and cancel any of them; see cancelled and past Bookings in a separate list |
| Open time | Tutor | Set Weekly Hours, add or remove Exceptions, change Minimum Notice and Booking Horizon; see a warning listing any active Bookings a change affects |

Booking page details:
- Only future free Slots that start after the Minimum Notice and within the Booking Horizon are shown.
- When no Slot is free, the page says "No open times right now, please message [Tutor]".
- When a chosen Slot is taken first by someone else, the Student sees "This time was just taken" and the updated Slots.

## Data
| Thing stored | Fields (plain words) | Private? Who can see and change it |
|---|---|---|
| Booking | Slot start time, Student name, Student email, active or cancelled, when it was made, when it was cancelled | Only the Tutor can see and cancel them. Anyone can create one through the booking form, but never read one back |
| Weekly Hours | day of the week, start time, end time | Only the Tutor can see and change them |
| Exception | date, start time, end time, closes or opens time | Only the Tutor can see and change them |
| Settings | Tutor's display name, time zone, Minimum Notice (12 hours), Booking Horizon (4 weeks) | Only the Tutor can change them. The public sees only the display name and time zone |

Visitors see only free Slot start times, worked out from the data above. They never see Weekly Hours, Exceptions or Bookings directly.

Student names and emails are kept indefinitely in this version.

## Must never happen
- A Student or visitor sees another Student's name, email or Booking.
- A secret (password, API key) appears in the app's code, the browser, or git.
- Two active Bookings hold the same Slot.
- A Slot is offered or booked outside open time, inside the Minimum Notice, or beyond the Booking Horizon.
- A change to Weekly Hours or Exceptions cancels a Booking. Only the Tutor cancelling ends a Booking.
- A time is shown without its time zone label.
- Anyone except the Tutor can log in, or create an account.

## Out of scope (not in this version)
- Emails of any kind (confirmations, reminders).
- Payments and calendar sync.
- Students cancelling their own Bookings.
- Lesson lengths other than 60 minutes, repeating Bookings, and breaks between Lessons.
- An "Add to calendar" button.
- The Tutor adding Bookings by hand.
- Limits on Bookings per Student.
- Automatic clearing of Student data (planned for version 2).
- Showing times in a Student's own time zone.
