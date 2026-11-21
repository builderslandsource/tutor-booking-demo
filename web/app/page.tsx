import type { Metadata } from "next";
import { Suspense } from "react";
import { getFreeSlots } from "@/app/book/actions";
import { BookingSheet } from "@/components/booking/booking-sheet";
import { createClient } from "@/lib/supabase/server";
import { zoneCity } from "@/lib/time";

async function settings() {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("public_settings").single<{
    display_name: string;
    time_zone: string;
  }>();
  if (error) throw new Error("Could not load the booking page");
  return data;
}

// The page is titled with the Tutor's display name only (PRODUCT.md).
export async function generateMetadata(): Promise<Metadata> {
  return { title: (await settings()).display_name };
}

async function Sheet() {
  const data = await settings();
  const slots = await getFreeSlots();

  return (
    <div className="lg:grid lg:grid-cols-[minmax(16rem,20rem)_1fr] lg:gap-16">
      <header className="-mx-3 border-b border-rule px-3 pb-6 lg:sticky lg:mx-0 lg:px-0 lg:top-16 lg:self-start lg:border-0">
        <h1 className="font-serif text-4xl leading-tight lg:text-5xl xl:text-6xl">{data.display_name}</h1>
        <p className="mt-2 text-ink-soft">All times in {zoneCity(data.time_zone)} time</p>
      </header>
      <BookingSheet slots={slots} tutor={data.display_name} timeZone={data.time_zone} />
    </div>
  );
}

export default function Home() {
  return (
    <main className="mx-auto min-h-screen max-w-[90rem] px-6 py-10 lg:px-12 lg:py-16">
      <Suspense fallback={<p className="text-ink-soft">Loading open times…</p>}>
        <Sheet />
      </Suspense>
    </main>
  );
}
