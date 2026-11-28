import assert from "node:assert/strict";
import { lessonCalendarFile } from "../lib/calendar";

// A booking-like object carrying a Student's private details; only start and tutor go to the builder.
const booking = { slot: "2027-01-04T09:00:00Z", name: "Ada Student", email: "ada@example.com" };

const cases: [string, () => void][] = [
  ["ordinary date: starts at the Slot, ends 60 minutes later", () => {
    const f = lessonCalendarFile("2027-01-04T09:00:00Z", "Sam Tutor");
    assert.match(f, /\r\nDTSTART:20270104T090000Z\r\n/);
    assert.match(f, /\r\nDTEND:20270104T100000Z\r\n/);
  }],
  ["Postgres timestamptz string", () => {
    const f = lessonCalendarFile("2027-01-04 09:00:00+00", "Sam Tutor");
    assert.match(f, /\r\nDTSTART:20270104T090000Z\r\n/);
    assert.match(f, /\r\nDTEND:20270104T100000Z\r\n/);
  }],
  ["spring clock change night (London, 01:00 UTC)", () => {
    const f = lessonCalendarFile("2027-03-28T00:30:00Z", "Sam Tutor");
    assert.match(f, /\r\nDTSTART:20270328T003000Z\r\n/);
    assert.match(f, /\r\nDTEND:20270328T013000Z\r\n/);
  }],
  ["no Student name or email in the file", () => {
    const f = lessonCalendarFile(booking.slot, "Sam Tutor");
    assert.ok(!f.includes(booking.name), "name found");
    assert.ok(!f.includes(booking.email), "email found");
    assert.ok(!f.includes("@example"), "email domain found");
    assert.ok(!f.replace(/\r\nUID:[^\r]*/, "").includes("@"), "@ found outside UID");
  }],
  ["summary and description name the Tutor, text escaped", () => {
    const f = lessonCalendarFile(booking.slot, "Lee; Tutor, Jr\\");
    assert.match(f, /\r\nSUMMARY:Lesson with Lee\\; Tutor\\, Jr\\\\\r\n/);
    assert.match(f, /\r\nDESCRIPTION:To cancel or check\\, message Lee\\; Tutor\\, Jr\\\\\r\n/);
  }],
  ["VCALENDAR/VEVENT with CRLF line endings", () => {
    const f = lessonCalendarFile(booking.slot, "Sam Tutor");
    assert.ok(f.startsWith("BEGIN:VCALENDAR\r\nVERSION:2.0\r\n"));
    assert.ok(f.endsWith("END:VEVENT\r\nEND:VCALENDAR\r\n"));
    assert.ok(!/[^\r]\n/.test(f), "bare LF found");
    assert.match(f, /\r\nUID:20270104T090000Z@booking\r\n/);
    assert.match(f, /\r\nDTSTAMP:\d{8}T\d{6}Z\r\n/);
  }],
];

let failed = 0;
for (const [name, run] of cases) {
  try {
    run();
    console.log(`PASS: ${name}`);
  } catch (e) {
    failed++;
    console.log(`FAIL: ${name}: ${(e as Error).message}`);
  }
}
if (failed) process.exit(1);
