"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function login(_prev: string | null, formData: FormData) {
  const supabase = await createClient();

  const { data: allowed, error: checkError } = await supabase.rpc("login_allowed");
  if (checkError || !allowed) return "Too many wrong tries. Try again in 15 minutes.";

  const { error } = await supabase.auth.signInWithPassword({
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
  });
  if (error) {
    await supabase.rpc("record_login_failure");
    return "Wrong email or password";
  }

  await supabase.rpc("record_login_success");
  redirect("/tutor/bookings");
}
