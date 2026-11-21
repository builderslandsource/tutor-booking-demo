import { redirect } from "next/navigation";
import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";

// Checked here too, so the Tutor pages don't rely only on the proxy.
async function TutorOnly({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims) redirect("/auth/login");
  return children;
}

export default function TutorLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense>
      <TutorOnly>{children}</TutorOnly>
    </Suspense>
  );
}
