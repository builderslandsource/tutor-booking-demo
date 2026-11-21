"use client";

import { useActionState, useState, type CSSProperties } from "react";
import { book, type BookState } from "@/app/book/actions";
import { formatSlot } from "@/lib/time";

type Props = { slots: string[]; tutor: string; timeZone: string };
type Row = { iso: string; clock: string; zone: string };

// Monday of the Slot's week, in the Tutor's time zone, as "YYYY-MM-DD".
function weekOf(iso: string, timeZone: string) {
  const ymd = new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" })
    .format(new Date(iso));
  const d = new Date(`${ymd}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() - ((d.getUTCDay() + 6) % 7));
  return d.toISOString().slice(0, 10);
}

// "2026-11-23" -> "Week of Mon 23 Nov" (a plain calendar date, so no time zone applies).
function weekLabel(week: string) {
  const date = new Intl.DateTimeFormat("en-GB", { timeZone: "UTC", weekday: "short", day: "numeric", month: "short" })
    .format(new Date(`${week}T12:00:00Z`))
    .replace(",", "");
  return `Week of ${date}`;
}

export function BookingSheet({ slots, tutor, timeZone }: Props) {
  const [state, action, pending] = useActionState<BookState, FormData>(book, { slots });
  const [selected, setSelected] = useState<string | null>(null);

  if (state.status === "booked" && state.slot) {
    return (
      <section className="max-w-2xl py-8 lg:py-2" aria-live="polite">
        <p className="text-lg">You&apos;re booked for</p>
        <p className="mt-3 text-3xl font-semibold tabular-nums text-pen lg:text-4xl">
          {formatSlot(state.slot, timeZone)}
        </p>
        <span aria-hidden="true" className="mt-3 block h-0.5 origin-left bg-pen motion-safe:animate-ink-in" />
        <dl className="mt-6 grid grid-cols-[auto_1fr] gap-x-6 text-lg">
          <dt className="border-b border-rule py-3 text-ink-soft">Lesson</dt>
          <dd className="border-b border-rule py-3">60 minutes with {tutor}</dd>
          {state.name && (
            <>
              <dt className="border-b border-rule py-3 text-ink-soft">Name</dt>
              <dd className="break-words border-b border-rule py-3">{state.name}</dd>
            </>
          )}
        </dl>
        <p className="mt-6">No email is sent, so take a screenshot of this to keep it.</p>
        <p className="mt-2 text-ink-soft">To cancel, message {tutor}</p>
      </section>
    );
  }

  const notice =
    state.status === "taken"
      ? "This time was just taken. Please pick another time."
      : state.status === "not_free"
        ? "That time is no longer free. Please pick another time."
        : null;

  // Group by week, then by day: "Mon 30 Mar" heading, "5:00pm (London time)" row.
  const weeks = new Map<string, Map<string, Row[]>>();
  for (const iso of state.slots) {
    const [day, time] = formatSlot(iso, timeZone).split(", ");
    const [clock, zone] = time.split(" (");
    const week = weekOf(iso, timeZone);
    const days = weeks.get(week) ?? new Map<string, Row[]>();
    days.set(day, [...(days.get(day) ?? []), { iso, clock, zone: `(${zone}` }]);
    weeks.set(week, days);
  }

  // Laptop: one column per weekday (Mon first), so the same day always sits in the same place.
  const weekday = (day: string) => ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].indexOf(day.slice(0, 3)) + 1;
  const hasSunday = [...weeks.values()].some((days) => [...days.keys()].some((d) => weekday(d) === 7));

  return (
    <section className="pt-2 lg:pt-0">
      {notice && (
        <p role="alert" className="ink-note my-4">
          {notice}
        </p>
      )}
      {state.slots.length === 0 ? (
        <p className="max-w-[34ch] py-16 text-xl leading-relaxed lg:py-4">
          No open times right now, please message {tutor}
        </p>
      ) : (
        <div className="space-y-20 lg:space-y-14">
          {[...weeks].map(([week, days]) => (
            <section key={week}>
              <h2 className="text-lg font-semibold">{weekLabel(week)}</h2>
              <div className={`mt-1 grid items-start gap-x-10 gap-y-8 sm:grid-cols-[repeat(auto-fill,minmax(16rem,1fr))] lg:gap-x-4 ${hasSunday ? "lg:grid-cols-7" : "lg:grid-cols-6"}`}>
                {[...days].map(([day, rows]) => (
                  <div key={day} className="min-w-0 lg:[grid-column-start:var(--col)]" style={{ "--col": weekday(day) } as CSSProperties}>
                    <h3 className="caps -mx-3 border-b border-ink px-3 pb-2 pt-4">{day}</h3>
                    <ul>
                      {rows.map(({ iso, clock, zone }) => (
                        <li key={iso} className={`-mx-3 border-b border-rule px-3 ${selected === iso ? "bg-pen-tint" : ""}`}>
                          <button
                            type="button"
                            onClick={() => setSelected(iso)}
                            aria-expanded={selected === iso}
                            className="group flex min-h-14 w-full items-baseline gap-2 py-3 text-left lg:flex-col lg:items-start lg:gap-0"
                          >
                            <span className="text-[22px] font-semibold tabular-nums text-pen decoration-2 underline-offset-4 group-hover:underline">
                              {clock}
                            </span>
                            <span className="text-sm text-ink-soft">{zone}</span>
                          </button>
                          {selected === iso && (
                            <form action={action} className="grid gap-4 overflow-hidden pb-5 pt-1 motion-safe:animate-line-open">
                              <input type="hidden" name="slot" value={iso} />
                              {/* Bot trap: hidden from people, bots fill it in and the Booking is refused. */}
                              <div className="sr-only" aria-hidden="true">
                                <label>
                                  Website
                                  <input type="text" name="website" tabIndex={-1} autoComplete="off" />
                                </label>
                              </div>
                              <label className="grid gap-1 text-sm font-medium">
                                Name
                                <input name="name" required defaultValue={state.name} autoComplete="name" className="field w-full min-w-0 font-normal" />
                              </label>
                              <label className="grid gap-1 text-sm font-medium">
                                Email
                                <input name="email" type="email" required defaultValue={state.email} autoComplete="email"
                                  className="field w-full min-w-0 font-normal" />
                              </label>
                              {state.status === "invalid" && state.slot === iso && (
                                <p role="alert" className="ink-note text-sm">Please enter your name and a valid email.</p>
                              )}
                              <button type="submit" disabled={pending} aria-busy={pending} className="btn-book w-full lg:px-3 lg:text-sm">
                                {pending ? (
                                  "Booking…"
                                ) : (
                                  <>
                                    {/* Laptop columns are narrow; the day heading sits right above. */}
                                    <span className="lg:hidden">Book {formatSlot(iso, timeZone)}</span>
                                    <span className="hidden lg:inline">Book {clock} {zone}</span>
                                  </>
                                )}
                              </button>
                            </form>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </section>
  );
}
