import { formatSlot } from "@/lib/time";

// "Mon 30 Mar, 5:00pm" at full strength, then "(London time)" quieter. The label is never dropped.
export function ZonedTime({ start, timeZone }: { start: Date | string; timeZone: string }) {
  const full = formatSlot(start, timeZone);
  const cut = full.lastIndexOf(" (");
  return (
    <>
      {full.slice(0, cut)} <span className="zone">{full.slice(cut + 1)}</span>
    </>
  );
}
