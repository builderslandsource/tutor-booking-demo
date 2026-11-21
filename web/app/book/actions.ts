"use server";

import { createClient } from "@/lib/supabase/server";

export type BookState = {
  status?: "booked" | "taken" | "not_free" | "invalid";
  slot?: string;
  name?: string;
  email?: string;
  slots: string[];
};

export async function getFreeSlots(): Promise<string[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("free_slots");
  if (error) throw new Error("Could not load free times");
  return (data as string[]).map((s) => new Date(s).toISOString());
}

export async function book(_prev: BookState, form: FormData): Promise<BookState> {
  const slot = String(form.get("slot") ?? "");
  const name = String(form.get("name") ?? "");
  const email = String(form.get("email") ?? "");
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("book_slot", {
    p_slot_start: slot,
    p_name: name,
    p_email: email,
    p_website: String(form.get("website") ?? ""),
  });
  if (error) throw new Error("Could not make the Booking");
  return { status: data, slot, name, email, slots: await getFreeSlots() };
}
