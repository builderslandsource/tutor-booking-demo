"use client";

import { useActionState, useState } from "react";
import { book, type BookState } from "@/app/book/actions";
import { formatSlot } from "@/lib/time";

type Props = { slots: string[]; tutor: string; timeZone: string };

export function BookingSheet({ slots, tutor, timeZone }: Props) {
  const [state, action, pending] = useActionState<BookState, FormData>(book, { slots });
  const [selected, setSelected] = useState<string | null>(null);

  if (state.status === "booked" && state.slot) {
    return (
      <section className="py-6" aria-live="polite">
        <p className="text-lg">You&apos;re booked for</p>
        <p className="text-3xl font-semibold tabular-nums text-blue-700 border-b-2 border-blue-700 py-2">
          {formatSlot(state.slot, timeZone)}
        </p>
        <p className="mt-4">To cancel, message {tutor}</p>
      </section>
    );
  }

  const notice =
    state.status === "taken"
      ? "This time was just taken. Please pick another time."
      : state.status === "not_free"
        ? "That time is no longer free. Please pick another time."
        : null;

  // Group rows by day: "Mon 30 Mar" heading, "5:00pm (London time)" row.
  const days = new Map<string, { iso: string; time: string }[]>();
  for (const iso of state.slots) {
    const [day, time] = formatSlot(iso, timeZone).split(", ");
    days.set(day, [...(days.get(day) ?? []), { iso, time }]);
  }

  return (
    <section>
      {notice && (
        <p role="alert" className="py-3 border-b border-neutral-300 font-medium">
          {notice}
        </p>
      )}
      {state.slots.length === 0 ? (
        <p className="py-12 text-lg">No open times right now, please message {tutor}</p>
      ) : (
        [...days].map(([day, rows]) => (
          <div key={day}>
            <h2 className="pt-6 pb-1 text-sm font-medium border-b border-neutral-900">{day}</h2>
            <ul>
              {rows.map(({ iso, time }) => (
                <li key={iso} className="border-b border-neutral-300">
                  <button
                    type="button"
                    onClick={() => setSelected(iso)}
                    aria-expanded={selected === iso}
                    className="w-full min-h-11 py-3 text-left text-2xl font-semibold tabular-nums text-blue-700"
                  >
                    {time}
                  </button>
                  {selected === iso && (
                    <form action={action} className="pb-4 flex flex-col gap-3">
                      <input type="hidden" name="slot" value={iso} />
                      {/* Bot trap: hidden from people, bots fill it in and the Booking is refused. */}
                      <div className="sr-only" aria-hidden="true">
                        <label>
                          Website
                          <input type="text" name="website" tabIndex={-1} autoComplete="off" />
                        </label>
                      </div>
                      <label className="flex flex-col gap-1">
                        Name
                        <input name="name" required defaultValue={state.name} autoComplete="name"
                          className="min-h-11 border border-neutral-900 px-2" />
                      </label>
                      <label className="flex flex-col gap-1">
                        Email
                        <input name="email" type="email" required defaultValue={state.email} autoComplete="email"
                          className="min-h-11 border border-neutral-900 px-2" />
                      </label>
                      {state.status === "invalid" && state.slot === iso && (
                        <p role="alert">Please enter your name and a valid email.</p>
                      )}
                      <button type="submit" disabled={pending}
                        className="min-h-11 bg-blue-700 text-white font-semibold disabled:opacity-70">
                        {pending ? "Booking…" : `Book ${formatSlot(iso, timeZone)}`}
                      </button>
                    </form>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))
      )}
    </section>
  );
}
