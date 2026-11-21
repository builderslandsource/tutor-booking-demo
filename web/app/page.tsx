import type { Metadata } from "next";
import { Suspense } from "react";
import { getFreeSlots } from "@/app/book/actions";
import { BookingSheet } from "@/components/booking/booking-sheet";
import { createClient } from "@/lib/supabase/server";

async function settings() {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("public_settings").single<{
    display_name: string;
    time_zone: string;
  }>();
  if (error) throw new Error("Could not load the booking page");
  return data;
}

// The Tutor's one-sentence introduction, set in the page text (changed on request, not in Settings).
const INTRO = "Friendly one-to-one lessons, 60 minutes each: pick a free time below and I\u2019ll see you then.";

// The page is titled with the Tutor's display name only (PRODUCT.md).
export async function generateMetadata(): Promise<Metadata> {
  return { title: (await settings()).display_name };
}

async function Sheet() {
  const data = await settings();
  const slots = await getFreeSlots();

  // The sheet owns the intro card too, so the card can drop its "pick a time" line once booked.
  return <BookingSheet slots={slots} tutor={data.display_name} timeZone={data.time_zone} intro={INTRO} />;
}

export default function Home() {
  return (
    <main className="mx-auto min-h-screen max-w-[80rem] pt-10 sm:px-6 sm:pb-10 lg:px-12 lg:py-14">
      <Suspense fallback={<p className="px-6 text-ink-soft sm:px-0">Loading open times…</p>}>
        <Sheet />
      </Suspense>
    </main>
  );
}
