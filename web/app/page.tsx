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
    <div className="lg:grid lg:grid-cols-[minmax(16rem,20rem)_1fr] lg:gap-12 xl:gap-16">
      {/* The name sits on the desk; the Slots are the sheet beside (or below) it. */}
      <header className="px-6 pb-8 sm:px-0 lg:sticky lg:top-16 lg:self-start lg:pt-8">
        <h1 className="text-balance font-serif text-4xl leading-tight tracking-[-0.01em] lg:text-5xl xl:text-6xl">
          {data.display_name}
        </h1>
        <p className="mt-3 text-ink-soft lg:mt-4">All times in {zoneCity(data.time_zone)} time</p>
      </header>
      <div className="sheet min-h-[70svh] px-6 pb-16 pt-4 sm:min-h-0 sm:px-10 sm:pb-12 sm:pt-6 xl:px-12">
        <BookingSheet slots={slots} tutor={data.display_name} timeZone={data.time_zone} />
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <main className="mx-auto min-h-screen max-w-[90rem] pt-10 sm:px-6 sm:pb-10 lg:px-12 lg:py-16">
      <Suspense fallback={<p className="px-6 text-ink-soft sm:px-0">Loading open times…</p>}>
        <Sheet />
      </Suspense>
    </main>
  );
}
