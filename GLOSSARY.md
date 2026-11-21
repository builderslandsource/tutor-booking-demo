# Booking Page

A tutor working alone publishes when they can teach, and students reserve time with them.

## Language

### People

**Tutor**:
The single person who teaches the Lessons, sets the open time, and is the only one who can cancel a Booking.
_Avoid_: Admin, owner, teacher, host

**Student**:
A person who makes a Booking. A Student has no account and is known only by the name and email given in their Bookings.
_Avoid_: Client, customer, user, guest

### Lessons

**Lesson**:
A single 60-minute tutoring session between the tutor and one student. Every Lesson has the same length.
_Avoid_: Appointment, session, meeting, class

### Availability

**Weekly Hours**:
The tutor's recurring pattern of open time, set per day of the week (for example, Monday 4pm to 8pm).
_Avoid_: Schedule, availability, working hours, open hours

**Exception**:
A one-off change to a specific date that either closes time the Weekly Hours would open, or opens time they would not.
_Avoid_: Override, block, holiday, time off

**Slot**:
A 60-minute window, inside the tutor's open time, that a Lesson can start in. Slots run back to back from the start of each block of open time.
_Avoid_: Time slot, opening, availability, period

**Minimum Notice**:
The shortest time ahead of a Slot's start that a Student can still book it (currently 12 hours).
_Avoid_: Lead time, cutoff, buffer

**Booking Horizon**:
The furthest ahead a Student can book a Slot (currently 4 weeks).
_Avoid_: Booking window, lookahead, range

### Bookings

**Booking**:
A student's reservation of one Slot, holding the student's name and email. A Booking is either active or cancelled, and a cancelled Booking stays on record. Only the Tutor cancelling it ends a Booking; changes to Weekly Hours or Exceptions never do.
_Avoid_: Reservation, appointment, lesson (a Lesson is the teaching, not the reservation)
