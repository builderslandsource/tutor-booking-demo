import type { Metadata } from "next";
import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { formatSlot } from "@/lib/time";
import { cancelBooking } from "./actions";

type Booking = { id: number; slot_start: string; student_name: string; student_email: string; status: string };

function Row({ b, timeZone, done }: { b: Booking; timeZone: string; done?: boolean }) {
  return (
    <li className="grid gap-x-8 border-b border-rule py-3 lg:grid-cols-[21rem_minmax(0,1fr)_minmax(0,1.3fr)_13rem] lg:items-center">
      <div className={`contents ${done ? "[&>*]:line-through [&>*]:decoration-ink" : ""}`}>
        <p className="text-lg font-semibold tabular-nums lg:whitespace-nowrap">{formatSlot(b.slot_start, timeZone)}</p>
        <p className="break-words">{b.student_name}</p>
        <p className="break-words text-ink-soft">{b.student_email}</p>
      </div>
      {done && b.status === "cancelled" && <p className="text-sm font-medium lg:justify-self-end">Cancelled</p>}
      {!done && (
        <details className="group lg:justify-self-end">
          <summary className="text-action list-none [&::-webkit-details-marker]:hidden">
            <span className="group-open:hidden">Cancel</span>
            <span className="hidden group-open:inline">Keep it</span>
          </summary>
          <form action={cancelBooking} className="pb-1 pt-1">
            <input type="hidden" name="id" value={b.id} />
            <button className="btn whitespace-nowrap">Yes, cancel this Booking</button>
          </form>
        </details>
      )}
    </li>
  );
}

async function Bookings() {
  const supabase = await createClient();
  const [{ data: settings, error: e1 }, { data, error: e2 }] = await Promise.all([
    supabase.rpc("public_settings").single<{ time_zone: string }>(),
    supabase
      .from("bookings")
      .select("id, slot_start, student_name, student_email, status")
      .order("slot_start")
      .returns<Booking[]>(),
  ]);
  if (e1 || e2) throw new Error("Could not load Bookings");
  const tz = settings.time_zone;
  const now = Date.now();
  const twoWeeks = now + 14 * 24 * 3600 * 1000;
  const upcoming = data.filter((b) => b.status === "active" && new Date(b.slot_start).getTime() >= now);
  const soon = upcoming.filter((b) => new Date(b.slot_start).getTime() < twoWeeks);
  const later = upcoming.filter((b) => new Date(b.slot_start).getTime() >= twoWeeks);
  const done = data.filter((b) => !upcoming.includes(b)).reverse();

  return (
    <>
      {soon.length === 0 ? (
        <p className="py-8 text-lg">No Bookings in the next two weeks.</p>
      ) : (
        <ul>{soon.map((b) => <Row key={b.id} b={b} timeZone={tz} />)}</ul>
      )}
      {later.length > 0 && (
        <details className="pt-4">
          <summary className="text-action">Later ({later.length})</summary>
          <ul>{later.map((b) => <Row key={b.id} b={b} timeZone={tz} />)}</ul>
        </details>
      )}
      <h2 className="section-title mt-14">Cancelled and past</h2>
      {done.length === 0 ? (
        <p className="py-4 text-ink-soft">None yet.</p>
      ) : (
        <ul>{done.map((b) => <Row key={b.id} b={b} timeZone={tz} done />)}</ul>
      )}
    </>
  );
}

export const metadata: Metadata = { title: "Bookings" };

export default function BookingsPage() {
  return (
    <main className="pt-8">
      <h1 className="border-b border-ink pb-3 font-serif text-3xl lg:text-4xl">Bookings</h1>
      <Suspense fallback={<p className="py-8 text-ink-soft">Loading Bookings…</p>}>
        <Bookings />
      </Suspense>
    </main>
  );
}
