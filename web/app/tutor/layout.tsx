import { redirect } from "next/navigation";
import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { LogoutForm } from "./logout-form";
import { Tabs } from "./tabs";

// Checked here too, so the Tutor pages don't rely only on the proxy.
async function TutorOnly({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims) redirect("/auth/login");
  return (
    <div className="mx-auto min-h-screen max-w-6xl pt-4 sm:px-6 sm:pb-10 lg:px-12 lg:pt-8">
      <div className="flex items-center justify-between gap-4 px-6 sm:px-0">
        <Tabs />
        <LogoutForm />
      </div>
      <div className="sheet mt-3 min-h-[80svh] px-6 pb-12 pt-8 sm:min-h-0 sm:p-10 lg:p-12">{children}</div>
    </div>
  );
}

export default function TutorLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense>
      <TutorOnly>{children}</TutorOnly>
    </Suspense>
  );
}
