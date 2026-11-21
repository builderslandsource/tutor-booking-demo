import type { Metadata } from "next";
import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { ZonedTime } from "@/components/zoned-time";
import { zoneCity } from "@/lib/time";
import {
  addException,
  addWeekly,
  removeException,
  removeWeekly,
  saveException,
  saveSettings,
  saveWeekly,
} from "./actions";

type Weekly = { id: number; day_of_week: number; start_time: string; end_time: string };
type Exception = { id: number; date: string; start_time: string; end_time: string; opens: boolean };
type Booking = { id: number; slot_start: string; student_name: string };

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0];

const hhmm = (t: string) => t.slice(0, 5);

// Postgres interval text, e.g. "28 days", "12:00:00", "1 day 02:00:00", as whole hours.
function intervalHours(v: string) {
  const days = Number(v.match(/(\d+) days?/)?.[1] ?? 0);
  const hours = Number(v.match(/(\d+):\d\d:\d\d/)?.[1] ?? 0);
  return days * 24 + hours;
}

const input = "field min-h-11 px-2 tabular-nums";
const button = "btn px-4";
const remove = "text-action px-2";
// One set of hours (or one Exception) per line; wraps only when the screen is too narrow.
const line = "flex flex-wrap items-center gap-x-2 gap-y-1 py-1";
const sectionTitle = "section-title";

// "2026-11-27" -> "Fri 27 Nov", so a saved Exception reads like the rest of the app.
const dayLabel = (date: string) =>
  new Intl.DateTimeFormat("en-GB", { timeZone: "UTC", weekday: "short", day: "numeric", month: "short" })
    .format(new Date(`${date}T12:00:00Z`))
    .replace(",", "");

function Times({ start = "", end = "" }: { start?: string; end?: string }) {
  return (
    <span className="inline-flex items-center gap-2">
      <input type="time" name="start" defaultValue={start} required aria-label="Start time" className={input} />
      <span className="text-ink-soft">to</span>
      <input type="time" name="end" defaultValue={end} required aria-label="End time" className={input} />
    </span>
  );
}

function Kind({ opens }: { opens?: boolean }) {
  return (
    <select name="kind" defaultValue={opens ? "opens" : "closes"} aria-label="Opens or closes" className={input}>
      <option value="closes">closes</option>
      <option value="opens">opens</option>
    </select>
  );
}

async function OpenTime({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error: message } = await searchParams;
  const supabase = await createClient();
  const [settings, weekly, exceptions, outside] = await Promise.all([
    supabase.from("settings").select("time_zone, minimum_notice, booking_horizon").single(),
    supabase.from("weekly_hours").select("id, day_of_week, start_time, end_time").order("start_time"),
    supabase.from("exceptions").select("id, date, start_time, end_time, opens").order("date").order("start_time"),
    supabase.rpc("bookings_outside_open_time"),
  ]);
  if (settings.error || weekly.error || exceptions.error || outside.error)
    throw new Error("Could not load open time");

  const tz = settings.data.time_zone as string;
  const zone = zoneCity(tz);
  const hours = weekly.data as Weekly[];
  const exc = exceptions.data as Exception[];
  const affected = outside.data as Booking[];

  return (
    <div className="space-y-10">
      <header>
        <h1 className="border-b border-ink pb-3 font-serif text-3xl lg:text-4xl">Open time</h1>
        <p className="mt-3 text-ink-soft">All times in {zone} time</p>
      </header>

      {message && (
        <p role="alert" className="ink-note max-w-prose">
          {message}
        </p>
      )}

      {affected.length > 0 && (
        <section role="alert" className="max-w-prose space-y-2 border-y border-ink py-4">
          <h2 className="font-semibold">These Bookings are outside your open time:</h2>
          <ul className="tabular-nums">
            {affected.map((b) => (
              <li key={b.id}>
                <ZonedTime start={b.slot_start} timeZone={tz} />, {b.student_name}
              </li>
            ))}
          </ul>
          <p>Nothing has been cancelled. They stay booked until you cancel them on the Bookings screen.</p>
        </section>
      )}

      <section>
        <h2 className={sectionTitle}>Weekly Hours</h2>
        {/* Days side by side where they fit; each set of hours is one line. */}
        <div className="grid gap-x-10 md:grid-cols-[repeat(auto-fill,minmax(min(100%,23rem),1fr))]">
          {WEEK_ORDER.map((day) => {
            const sets = hours.filter((w) => w.day_of_week === day);
            return (
              <div key={day} className="border-b border-rule py-3">
                <h3 className="caps flex min-h-8 items-baseline justify-between gap-4">
                  {DAYS[day]}
                  {sets.length === 0 && <span className="font-sans text-sm normal-case tracking-normal text-ink-soft">Closed</span>}
                </h3>
                {sets.map((w) => (
                  <form key={w.id} action={saveWeekly} className={line}>
                    <input type="hidden" name="id" value={w.id} />
                    <Times start={hhmm(w.start_time)} end={hhmm(w.end_time)} />
                    <span className="flex items-center gap-1">
                      <button className={button}>Save</button>
                      <button formAction={removeWeekly} formNoValidate className={remove}>
                        Remove
                      </button>
                    </span>
                  </form>
                ))}
                <details className="group">
                  <summary className="text-action list-none [&::-webkit-details-marker]:hidden">
                    <span className="group-open:hidden">Add hours</span>
                    <span className="hidden group-open:inline">Close</span>
                  </summary>
                  <form action={addWeekly} className={`${line} pb-1`}>
                    <input type="hidden" name="day" value={day} />
                    <Times />
                    <button className={button}>Add</button>
                  </form>
                </details>
              </div>
            );
          })}
        </div>
      </section>

      <section>
        <h2 className={sectionTitle}>Exceptions</h2>
        {exc.map((e) => (
          <form key={e.id} action={saveException} className={`${line} border-b border-rule py-3`}>
            <h3 className="caps w-full lg:w-28 lg:shrink-0">{dayLabel(e.date)}</h3>
            <input type="hidden" name="id" value={e.id} />
            <input type="date" name="date" defaultValue={e.date} required aria-label="Date" className={input} />
            <Kind opens={e.opens} />
            <Times start={hhmm(e.start_time)} end={hhmm(e.end_time)} />
            <span className="flex items-center gap-1">
              <button className={button}>Save</button>
              <button formAction={removeException} formNoValidate className={remove}>
                Remove
              </button>
            </span>
          </form>
        ))}
        {exc.length === 0 && <p className="border-b border-rule py-3 text-ink-soft">No Exceptions.</p>}
        <form action={addException} className={`${line} py-3`}>
          <span className="caps w-full lg:w-28 lg:shrink-0">New</span>
          <input type="date" name="date" required aria-label="Date" className={input} />
          <Kind />
          <Times />
          <button className={button}>Add Exception</button>
        </form>
      </section>

      <section className="max-w-prose">
        <h2 className={sectionTitle}>Settings</h2>
        <form action={saveSettings} className="py-1">
          <label className="flex min-h-14 items-center gap-3 border-b border-rule">
            <span className="w-40">Minimum Notice</span>
            <input
              type="number"
              name="notice"
              min={1}
              max={336}
              step={1}
              required
              defaultValue={intervalHours(settings.data.minimum_notice)}
              className={`${input} w-24 tabular-nums`}
            />
            hours
          </label>
          <label className="flex min-h-14 items-center gap-3 border-b border-rule">
            <span className="w-40">Booking Horizon</span>
            <input
              type="number"
              name="horizon"
              min={1}
              max={52}
              step={1}
              required
              defaultValue={Math.round(intervalHours(settings.data.booking_horizon) / 168)}
              className={`${input} w-24 tabular-nums`}
            />
            weeks
          </label>
          <div className="pt-4">
            <button className={button}>Save settings</button>
          </div>
        </form>
      </section>
    </div>
  );
}

export const metadata: Metadata = { title: "Open time" };

export default function OpenTimePage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  return (
    <main>
      <Suspense fallback={<p className="text-ink-soft">Loading open time…</p>}>
        <OpenTime searchParams={searchParams} />
      </Suspense>
    </main>
  );
}
