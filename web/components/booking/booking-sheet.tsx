"use client";

import { useActionState, useEffect, useRef, useState, type ReactNode } from "react";
import { book, type BookState } from "@/app/book/actions";
import { ZonedTime } from "@/components/zoned-time";
import { lessonCalendarFile } from "@/lib/calendar";
import { formatSlot, zoneCity } from "@/lib/time";

type Props = { slots: string[]; tutor: string; timeZone: string; intro: string };
type Chip = { iso: string; clock: string };

// A Slot's calendar date in the Tutor's time zone, as "YYYY-MM-DD".
function dateOf(iso: string, timeZone: string) {
  return new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" })
    .format(new Date(iso));
}

// Plain calendar-date arithmetic on "YYYY-MM-DD" (no time zone applies to a date on its own).
function addDays(ymd: string, n: number) {
  const d = new Date(`${ymd}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}
function mondayOf(ymd: string) {
  return addDays(ymd, -((new Date(`${ymd}T12:00:00Z`).getUTCDay() + 6) % 7));
}
function dateText(ymd: string, opts: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat("en-GB", { timeZone: "UTC", ...opts }).format(new Date(`${ymd}T12:00:00Z`)).replace(",", "");
}

// Chevron for the week buttons, drawn in ink at the text's weight.
function Chevron({ back }: { back?: boolean }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d={back ? "M10 3.5 5.5 8l4.5 4.5" : "M6 3.5 10.5 8 6 12.5"} />
    </svg>
  );
}

// The introduction card on the desk, then the one raised sheet. Phone: stacked. Laptop: the card is one wide row above the sheet.
function Page({ tutor, intro, children }: { tutor: string; intro?: string; children: ReactNode }) {
  return (
    <>
      <header className="mx-6 mb-6 rounded-2xl border border-rule bg-paper/70 px-6 py-5 sm:mx-0 lg:mb-8 lg:flex lg:items-baseline lg:gap-10 lg:px-10 lg:py-7">
        <h1 className="shrink-0 text-balance font-serif text-3xl leading-tight tracking-[-0.01em] lg:text-5xl">{tutor}</h1>
        {intro && <p className="mt-2 max-w-[44ch] leading-relaxed lg:mt-0 lg:text-lg">{intro}</p>}
      </header>
      <div className="sheet min-h-[70svh] px-6 pb-16 pt-6 sm:min-h-0 sm:px-10 sm:pb-12 sm:pt-8 xl:px-12">{children}</div>
    </>
  );
}

export function BookingSheet({ slots, tutor, timeZone, intro }: Props) {
  const [state, action, pending] = useActionState<BookState, FormData>(book, { slots });
  const [selected, setSelected] = useState<string | null>(null);
  const [weekPick, setWeekPick] = useState<string | null>(null);
  const [dayPick, setDayPick] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  // Bring Name, Email and Book into view once a time is picked: now if the form is already open (or motion is
  // reduced), otherwise when its opening animation ends, since a still-collapsed form counts as "in view".
  const showForm = () => {
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    formRef.current?.scrollIntoView({ block: "nearest", behavior: still ? "auto" : "smooth" });
  };
  useEffect(() => {
    if (selected) showForm();
  }, [selected]);

  if (state.status === "booked" && state.slot) {
    return (
      <Page tutor={tutor}>
      <section className="mx-auto max-w-3xl py-8 sm:py-6 lg:py-12" aria-live="polite">
        <p className="text-lg text-ink-soft">You&apos;re booked for</p>
        <p className="mt-3 text-balance text-3xl font-semibold leading-tight tracking-[-0.02em] tabular-nums text-pen sm:text-4xl lg:text-5xl">
          <ZonedTime start={state.slot} timeZone={timeZone} />
        </p>
        <span aria-hidden="true" className="mt-5 block h-0.5 origin-left bg-pen motion-safe:animate-ink-in" />
        <dl className="mt-10 grid gap-x-10 sm:grid-cols-2">
          <div className="border-b border-rule py-4">
            <dt className="text-sm text-ink-soft">Lesson</dt>
            <dd className="mt-1 text-lg">60 minutes with {tutor}</dd>
          </div>
          {state.name && (
            <div className="border-b border-rule py-4">
              <dt className="text-sm text-ink-soft">Name</dt>
              <dd className="mt-1 break-words text-lg">{state.name}</dd>
            </div>
          )}
        </dl>
        <div className="mt-8 grid gap-x-10 gap-y-2 sm:grid-cols-2">
          <p className="font-medium">No email is sent, so take a screenshot of this to keep it.</p>
          {/* Built from the Slot and the Tutor only, never the Student's name or email. */}
          <a
            href={"data:text/calendar;charset=utf-8," + encodeURIComponent(lessonCalendarFile(state.slot, tutor))}
            download="lesson.ics"
            className="btn w-full justify-self-start sm:w-auto"
          >
            Add to calendar
          </a>
          <p className="text-ink-soft">To cancel, message {tutor}</p>
        </div>
      </section>
      </Page>
    );
  }

  const notice =
    state.status === "taken"
      ? "This time was just taken. Please pick another time."
      : state.status === "not_free"
        ? "That time is no longer free. Please pick another time."
        : null;

  if (state.slots.length === 0) {
    return (
      <Page tutor={tutor}>
        {notice && <p role="alert" className="ink-note my-4">{notice}</p>}
        <p className="max-w-[34ch] py-16 text-xl leading-relaxed lg:py-10">No open times right now, please message {tutor}</p>
      </Page>
    );
  }

  // Free Slots by date ("YYYY-MM-DD" in the Tutor's time zone), each as a "5:00pm" chip.
  const byDay = new Map<string, Chip[]>();
  for (const iso of state.slots) {
    const day = dateOf(iso, timeZone);
    const clock = formatSlot(iso, timeZone).split(", ")[1].split(" (")[0];
    byDay.set(day, [...(byDay.get(day) ?? []), { iso, clock }]);
  }

  // Weeks run from the first to the last week with a free Slot, so paging never passes the Booking Horizon.
  const dates = [...byDay.keys()];
  const weeks: string[] = [];
  for (let w = mondayOf(dates[0]); w <= mondayOf(dates[dates.length - 1]); w = addDays(w, 7)) weeks.push(w);
  const week = weekPick && weeks.includes(weekPick) ? weekPick : mondayOf(dates[0]);
  const at = weeks.indexOf(week);
  const days = Array.from({ length: 7 }, (_, i) => addDays(week, i));
  const openDays = days.filter((d) => byDay.has(d));
  const day = dayPick && byDay.has(dayPick) && days.includes(dayPick) ? dayPick : openDays[0];
  const chosen = selected && state.slots.includes(selected) ? selected : null;

  const goWeek = (i: number) => {
    setWeekPick(weeks[i]);
    setDayPick(null);
    setSelected(null);
  };
  const goDay = (d: string) => {
    setDayPick(d);
    setSelected(null);
  };

  return (
    <Page tutor={tutor} intro={intro}>
      {/* The time zone, said once for every time on this sheet. Each chip also carries it for screen readers. */}
      <p className="text-ink-soft">All times in {zoneCity(timeZone)} time</p>

      {notice && <p role="alert" className="ink-note my-4">{notice}</p>}

      <div className="mt-4 flex items-center justify-between gap-3 border-b border-ink pb-3">
        <button type="button" onClick={() => goWeek(at - 1)} disabled={at === 0} aria-label="Previous week" className="btn w-11 gap-2 px-0 disabled:border-rule disabled:text-ink-soft disabled:opacity-100 disabled:hover:bg-transparent sm:w-auto sm:px-5">
          <Chevron back />
          <span aria-hidden="true" className="hidden sm:inline">Previous week</span>
        </button>
        <h2 aria-live="polite" className="text-center text-lg font-semibold">Week of {dateText(week, { weekday: "short", day: "numeric", month: "short" })}</h2>
        <button type="button" onClick={() => goWeek(at + 1)} disabled={at === weeks.length - 1} aria-label="Next week" className="btn w-11 gap-2 px-0 disabled:border-rule disabled:text-ink-soft disabled:opacity-100 disabled:hover:bg-transparent sm:w-auto sm:px-5">
          <span aria-hidden="true" className="hidden sm:inline">Next week</span>
          <Chevron />
        </button>
      </div>

      {openDays.length === 0 ? (
        <p className="py-12 text-lg">No open times this week. Try the next week.</p>
      ) : (
        <>
          {/* Phone: one day at a time, picked from a row of days you can swipe sideways. */}
          <div role="group" aria-label="Days" className="-mx-6 flex snap-x gap-2 scroll-px-6 overflow-x-auto px-6 py-4 [scrollbar-width:none] sm:-mx-10 sm:scroll-px-10 sm:px-10 lg:hidden">
            {days.map((d) => {
              const count = byDay.get(d)?.length ?? 0;
              const on = d === day;
              return (
                <button
                  key={d}
                  type="button"
                  onClick={() => goDay(d)}
                  disabled={count === 0}
                  aria-pressed={on}
                  aria-label={`${dateText(d, { weekday: "long", day: "numeric", month: "long" })}, ${count === 0 ? "no free times" : `${count} free time${count === 1 ? "" : "s"}`}`}
                  className={`flex min-h-[4.75rem] min-w-[4.25rem] shrink-0 snap-start flex-col items-center justify-center rounded-xl border px-2 ${
                    on ? "border-pen bg-pen-tint text-pen" : count ? "border-transparent text-ink hover:bg-ink/5" : "border-transparent text-ink-soft"
                  }`}
                >
                  <span className={`text-xs font-medium uppercase tracking-[0.12em] ${count ? "" : "line-through decoration-ink"}`}>{dateText(d, { weekday: "short" })}</span>
                  <span className={`font-serif text-2xl leading-tight ${count ? "" : "line-through decoration-ink"}`}>{dateText(d, { day: "numeric" })}</span>
                  <span className="text-xs tabular-nums">{count} free</span>
                </button>
              );
            })}
          </div>

          {/* Phone shows the picked day; laptop shows the whole week, one column per day. */}
          <div className="grid lg:mt-2 lg:grid-cols-7 lg:gap-x-3">
            {days.map((d) => {
              const chips = byDay.get(d) ?? [];
              return (
                <div key={d} className={`min-w-0 ${d === day ? "" : "hidden lg:block"}`}>
                  {/* Phone: the day row already shows the day, so this heading is for screen readers only. */}
                  <h3 className="sr-only lg:not-sr-only lg:caps lg:block lg:border-b lg:border-rule lg:pb-2 lg:pt-4">
                    <span className="lg:hidden">{dateText(d, { weekday: "long", day: "numeric", month: "long" })}</span>
                    <span className={`hidden lg:inline ${chips.length ? "" : "text-ink-soft line-through decoration-ink"}`}>
                      {dateText(d, { weekday: "short", day: "numeric" })}
                    </span>
                    {chips.length === 0 && <span className="sr-only">, no free times</span>}
                  </h3>
                  {chips.length === 0 ? null : (
                    <ul className="grid grid-cols-3 gap-2 pt-1 sm:grid-cols-4 lg:grid-cols-1 lg:pt-3">
                      {chips.map(({ iso, clock }) => (
                        <li key={iso}>
                          <button
                            type="button"
                            onClick={() => setSelected(iso)}
                            aria-pressed={chosen === iso}
                            aria-label={formatSlot(iso, timeZone)}
                            className={`min-h-11 w-full rounded-lg border px-2 text-[17px] font-semibold tabular-nums lg:text-base ${
                              chosen === iso ? "border-pen bg-pen text-white" : "border-pen/30 text-pen hover:border-pen"
                            }`}
                          >
                            {clock}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>

          {chosen && (
            <form ref={formRef} action={action} onAnimationEnd={showForm} className="mt-6 scroll-mb-6 grid gap-4 overflow-hidden border-t border-ink pb-2 pt-5 motion-safe:animate-line-open lg:grid-cols-[1fr_1fr_auto] lg:items-end lg:gap-x-6">
              <p className="text-lg font-semibold tabular-nums lg:col-span-3">
                <ZonedTime start={chosen} timeZone={timeZone} />
              </p>
              <input type="hidden" name="slot" value={chosen} />
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
                <input name="email" type="email" required defaultValue={state.email} autoComplete="email" className="field w-full min-w-0 font-normal" />
              </label>
              <button type="submit" disabled={pending} aria-busy={pending} className="btn-book w-full lg:w-auto">
                {pending ? "Booking…" : "Book this time"}
              </button>
              {state.status === "invalid" && state.slot === chosen && (
                <p role="alert" className="ink-note text-sm lg:col-span-3">Please enter your name and a valid email.</p>
              )}
            </form>
          )}
        </>
      )}
    </Page>
  );
}
