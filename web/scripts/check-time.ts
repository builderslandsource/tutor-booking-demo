import assert from "node:assert/strict";
import { formatSlot } from "../lib/time";

const L = "Europe/London";
const cases: [string, string, string, string][] = [
  ["normal date (BST)", "2026-03-30T16:00:00+00:00", L, "Mon 30 Mar, 5:00pm (London time)"],
  ["day before spring change (GMT)", "2027-03-26T17:00:00Z", L, "Fri 26 Mar, 5:00pm (London time)"],
  ["spring change day, 2am BST", "2027-03-28T01:00:00Z", L, "Sun 28 Mar, 2:00am (London time)"],
  ["day after spring change (BST)", "2027-03-29T16:00:00Z", L, "Mon 29 Mar, 5:00pm (London time)"],
  ["day before autumn change (BST)", "2027-10-30T16:00:00Z", L, "Sat 30 Oct, 5:00pm (London time)"],
  ["autumn change day, first 1:30am (BST)", "2027-10-31T00:30:00Z", L, "Sun 31 Oct, 1:30am (London time)"],
  ["autumn change day, second 1:30am (GMT)", "2027-10-31T01:30:00Z", L, "Sun 31 Oct, 1:30am (London time)"],
  ["day after autumn change (GMT)", "2027-11-01T17:00:00Z", L, "Mon 1 Nov, 5:00pm (London time)"],
  ["midday", "2027-01-04T12:00:00Z", L, "Mon 4 Jan, 12:00pm (London time)"],
  ["midnight", "2027-01-04T00:00:00Z", L, "Mon 4 Jan, 12:00am (London time)"],
  ["Postgres timestamptz string", "2027-01-04 09:00:00+00", L, "Mon 4 Jan, 9:00am (London time)"],
  ["other zone label", "2027-01-04T22:00:00Z", "America/New_York", "Mon 4 Jan, 5:00pm (New York time)"],
  ["morning in New York", "2027-01-04T14:00:00Z", "America/New_York", "Mon 4 Jan, 9:00am (New York time)"],
];

let failed = 0;
for (const [name, start, zone, want] of cases) {
  try {
    assert.equal(formatSlot(start, zone), want);
    console.log(`PASS: ${name}: ${want}`);
  } catch (e) {
    failed++;
    console.log(`FAIL: ${name}: ${(e as Error).message}`);
  }
}
if (failed) process.exit(1);
