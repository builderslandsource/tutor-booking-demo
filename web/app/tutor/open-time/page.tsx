import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { formatSlot, zoneCity } from "@/lib/time";
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

const input = "field min-h-11";
const button = "btn";
const remove = "text-action px-2";
const sectionTitle = "border-b border-ink pb-2 font-serif text-2xl";

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
    <div className="space-y-12 pt-8">
      <header>
        <h1 className="border-b border-ink pb-3 font-serif text-3xl lg:text-4xl">Open time</h1>
        <p className="mt-3 text-ink-soft">All times in {zone} time.</p>
      </header>

      {message && (
        <p role="alert" className="ink-note max-w-prose">
          {message}
        </p>
      )}

      {affected.length > 0 && (
        <section role="alert" className="max-w-prose space-y-2 border-l-4 border-ink py-1 pl-4">
          <h2 className="font-semibold">These Bookings are outside your open time:</h2>
          <ul className="tabular-nums">
            {affected.map((b) => (
              <li key={b.id}>
                {formatSlot(b.slot_start, tz)}, {b.student_name}
              </li>
            ))}
          </ul>
          <p>Nothing has been cancelled. They stay booked until you cancel them on the Bookings screen.</p>
        </section>
      )}

      <div className="grid items-start gap-12 lg:grid-cols-2 lg:gap-16">
        <section>
          <h2 className={sectionTitle}>Weekly Hours ({zone} time)</h2>
          {WEEK_ORDER.map((day) => (
            <div key={day} className="space-y-2 border-b border-rule py-4">
              <h3 className="caps">{DAYS[day]}</h3>
              {hours
                .filter((w) => w.day_of_week === day)
                .map((w) => (
                  <form key={w.id} action={saveWeekly} className="flex flex-wrap items-center gap-2">
                    <input type="hidden" name="id" value={w.id} />
                    <Times start={hhmm(w.start_time)} end={hhmm(w.end_time)} />
                    <button className={button}>Save</button>
                    <button formAction={removeWeekly} formNoValidate className={remove}>
                      Remove
                    </button>
                  </form>
                ))}
              <form action={addWeekly} className="flex flex-wrap items-center gap-2">
                <input type="hidden" name="day" value={day} />
                <Times />
                <button className={button}>Add</button>
              </form>
            </div>
          ))}
        </section>

        <section>
          <h2 className={sectionTitle}>Exceptions ({zone} time)</h2>
          {exc.map((e) => (
            <form key={e.id} action={saveException} className="flex flex-wrap items-center gap-2 border-b border-rule py-4">
              <input type="hidden" name="id" value={e.id} />
              <input type="date" name="date" defaultValue={e.date} required aria-label="Date" className={input} />
              <Kind opens={e.opens} />
              <Times start={hhmm(e.start_time)} end={hhmm(e.end_time)} />
              <button className={button}>Save</button>
              <button formAction={removeException} formNoValidate className={remove}>
                Remove
              </button>
            </form>
          ))}
          <form action={addException} className="flex flex-wrap items-center gap-2 py-4">
            <input type="date" name="date" required aria-label="Date" className={input} />
            <Kind />
            <Times />
            <button className={button}>Add Exception</button>
          </form>
        </section>
      </div>

      <section className="max-w-prose">
        <h2 className={sectionTitle}>Settings</h2>
        <form action={saveSettings} className="space-y-1 py-2">
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

export default function OpenTimePage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  return (
    <main>
      <Suspense>
        <OpenTime searchParams={searchParams} />
      </Suspense>
    </main>
  );
}
