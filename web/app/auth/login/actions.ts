"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function login(_prev: string | null, formData: FormData) {
  const supabase = await createClient();

  // Counted before the password check, so the lockout fails closed and holds under parallel tries.
  const { data: allowed, error: attemptError } = await supabase.rpc("begin_login_attempt");
  if (attemptError || allowed !== true) return "Too many wrong tries. Try again in 15 minutes.";

  const { error } = await supabase.auth.signInWithPassword({
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
  });
  if (error) return "Wrong email or password";

  const { error: resetError } = await supabase.rpc("record_login_success");
  if (resetError) console.error("record_login_success failed", resetError);
  redirect("/tutor/bookings");
}
