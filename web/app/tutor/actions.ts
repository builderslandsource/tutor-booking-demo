"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// scope "local" drops this browser's session cookies before any server call, so a Supabase outage cannot leave the Tutor logged in.
export async function logout() {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut({ scope: "local" });
  if (error) return "Could not log out. Try again.";
  redirect("/auth/login");
}
