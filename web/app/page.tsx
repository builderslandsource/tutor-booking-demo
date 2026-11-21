import { Suspense } from "react";
import { getFreeSlots } from "@/app/book/actions";
import { BookingSheet } from "@/components/booking/booking-sheet";
import { createClient } from "@/lib/supabase/server";

async function Sheet() {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("public_settings").single<{
    display_name: string;
    time_zone: string;
  }>();
  if (error) throw new Error("Could not load the booking page");
  const slots = await getFreeSlots();

  return (
    <>
      <h1 className="text-2xl font-semibold border-b border-neutral-900 pb-3">
        {data.display_name}
      </h1>
      <BookingSheet slots={slots} tutor={data.display_name} timeZone={data.time_zone} />
    </>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-neutral-950">
      <div className="mx-auto max-w-md px-4 py-8">
        <Suspense>
          <Sheet />
        </Suspense>
      </div>
    </main>
  );
}
