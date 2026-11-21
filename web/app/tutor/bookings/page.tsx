import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { formatSlot } from "@/lib/time";
import { cancelBooking } from "./actions";

type Booking = { id: number; slot_start: string; student_name: string; student_email: string; status: string };

function Row({ b, timeZone, done }: { b: Booking; timeZone: string; done?: boolean }) {
  return (
    <li className="border-b border-neutral-300 py-3">
      <div className={done ? "line-through decoration-neutral-950" : ""}>
        <p className="text-xl font-semibold tabular-nums">{formatSlot(b.slot_start, timeZone)}</p>
        <p>{b.student_name} · {b.student_email}{done && b.status === "cancelled" ? " · cancelled" : ""}</p>
      </div>
      {!done && (
        <details className="mt-1">
          <summary className="inline-flex min-h-11 items-center cursor-pointer underline">Cancel</summary>
          <form action={cancelBooking} className="inline">
            <input type="hidden" name="id" value={b.id} />
            <button className="min-h-11 px-3 border border-neutral-900">Yes, cancel this Booking</button>
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
        <p className="py-6">No Bookings in the next two weeks.</p>
      ) : (
        <ul>{soon.map((b) => <Row key={b.id} b={b} timeZone={tz} />)}</ul>
      )}
      {later.length > 0 && (
        <details className="py-3">
          <summary className="min-h-11 cursor-pointer underline">Later ({later.length})</summary>
          <ul>{later.map((b) => <Row key={b.id} b={b} timeZone={tz} />)}</ul>
        </details>
      )}
      <h2 className="pt-8 pb-1 text-sm font-medium border-b border-neutral-900">Cancelled and past</h2>
      {done.length === 0 ? (
        <p className="py-3">None yet.</p>
      ) : (
        <ul>{done.map((b) => <Row key={b.id} b={b} timeZone={tz} done />)}</ul>
      )}
    </>
  );
}

export default function BookingsPage() {
  return (
    <main className="min-h-screen bg-white text-neutral-950">
      <div className="mx-auto max-w-md px-4 py-8">
        <h1 className="text-2xl font-semibold border-b border-neutral-900 pb-3">Bookings</h1>
        <Suspense>
          <Bookings />
        </Suspense>
      </div>
    </main>
  );
}
