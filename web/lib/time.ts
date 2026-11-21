// Formats a Slot start as e.g. "Mon 30 Mar, 5:00pm (London time)" in the given IANA time zone.
export function formatSlot(start: Date | string, timeZone: string): string {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-GB", {
      timeZone,
      weekday: "short",
      day: "numeric",
      month: "short",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
      .formatToParts(new Date(start))
      .map((p) => [p.type, p.value]),
  );
  const city = timeZone.split("/").pop()!.replace(/_/g, " ");
  const hour = parts.hour === "0" ? "12" : parts.hour;
  return `${parts.weekday} ${parts.day} ${parts.month}, ${hour}:${parts.minute}${parts.dayPeriod.toLowerCase()} (${city} time)`;
}
