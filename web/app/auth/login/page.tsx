import type { Metadata } from "next";
import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Tutor login" };

// The Tutor's display name (already public on the booking page), so the login sheet has an owner.
async function TutorName() {
  const supabase = await createClient();
  const { data } = await supabase.rpc("public_settings").single<{ display_name: string }>();
  if (!data) return null;
  return <p className="font-serif text-2xl leading-tight sm:text-center sm:text-3xl">{data.display_name}</p>;
}

export default function Page() {
  return (
    <main className="flex min-h-svh w-full flex-col pt-12 sm:items-center sm:justify-center sm:px-6 sm:py-12">
      <div className="flex w-full flex-1 flex-col sm:max-w-md sm:flex-none">
        <div className="min-h-8 px-6 pb-8 sm:px-0">
          <Suspense>
            <TutorName />
          </Suspense>
        </div>
        <div className="sheet flex-1 px-6 pb-12 pt-8 sm:flex-none sm:px-12 sm:pb-12 sm:pt-10">
          <LoginForm />
        </div>
      </div>
    </main>
  );
}
