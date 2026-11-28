// A Lesson as an iCalendar (.ics) file: 60 minutes from the Slot start, in UTC.
// Takes only the start and the Tutor's name, so no Student name or email can reach the file.
export function lessonCalendarFile(start: string, tutor: string): string {
  const begin = new Date(start);
  const end = new Date(begin.getTime() + 60 * 60 * 1000);
  const utc = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  // RFC 5545 text escaping: backslash, semicolon, comma and newlines.
  const text = (s: string) => s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Booking Page//Lesson//EN",
    "BEGIN:VEVENT",
    `UID:${utc(begin)}@booking`,
    `DTSTAMP:${utc(new Date())}`,
    `DTSTART:${utc(begin)}`,
    `DTEND:${utc(end)}`,
    `SUMMARY:${text(`Lesson with ${tutor}`)}`,
    `DESCRIPTION:${text(`To cancel or check, message ${tutor}`)}`,
    "END:VEVENT",
    "END:VCALENDAR",
    "",
  ].join("\r\n");
}
