"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const PAGE = "/tutor/open-time";

function fail(message: string): never {
  redirect(`${PAGE}?error=${encodeURIComponent(message)}`);
}

function time(form: FormData, name: string) {
  const v = String(form.get(name) ?? "");
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(v)) fail("Enter start and end times.");
  return v;
}

function span(form: FormData) {
  const start_time = time(form, "start");
  const end_time = time(form, "end");
  if (start_time >= end_time) fail("The start time must be before the end time.");
  return { start_time, end_time };
}

function id(form: FormData) {
  const v = Number(form.get("id"));
  if (!Number.isInteger(v) || v < 1) fail("Something went wrong. Reload the page and try again.");
  return v;
}

function wholeNumber(form: FormData, name: string, max: number, label: string) {
  const v = Number(form.get(name));
  if (!Number.isInteger(v) || v < 1 || v > max) fail(`${label} must be a whole number from 1 to ${max}.`);
  return v;
}

async function run(query: PromiseLike<{ error: unknown }>) {
  const { error } = await query;
  if (error) fail("That change could not be saved. Check the times and try again.");
  redirect(PAGE);
}

function weeklyFields(form: FormData) {
  const day_of_week = Number(form.get("day"));
  if (!Number.isInteger(day_of_week) || day_of_week < 0 || day_of_week > 6) fail("Pick a day.");
  return { day_of_week, ...span(form) };
}

function exceptionFields(form: FormData) {
  const date = String(form.get("date") ?? "");
  const parsed = new Date(date + "T00:00:00Z");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== date)
    fail("Enter a valid date.");
  const kind = form.get("kind");
  if (kind !== "opens" && kind !== "closes") fail("Choose whether the Exception opens or closes time.");
  return { date, opens: kind === "opens", ...span(form) };
}

export async function addWeekly(form: FormData) {
  const supabase = await createClient();
  await run(supabase.from("weekly_hours").insert(weeklyFields(form)));
}

export async function saveWeekly(form: FormData) {
  const supabase = await createClient();
  await run(supabase.from("weekly_hours").update(span(form)).eq("id", id(form)));
}

export async function removeWeekly(form: FormData) {
  const supabase = await createClient();
  await run(supabase.from("weekly_hours").delete().eq("id", id(form)));
}

export async function addException(form: FormData) {
  const supabase = await createClient();
  await run(supabase.from("exceptions").insert(exceptionFields(form)));
}

export async function saveException(form: FormData) {
  const supabase = await createClient();
  await run(supabase.from("exceptions").update(exceptionFields(form)).eq("id", id(form)));
}

export async function removeException(form: FormData) {
  const supabase = await createClient();
  await run(supabase.from("exceptions").delete().eq("id", id(form)));
}

export async function saveSettings(form: FormData) {
  const hours = wholeNumber(form, "notice", 336, "Minimum Notice");
  const weeks = wholeNumber(form, "horizon", 52, "Booking Horizon");
  const supabase = await createClient();
  await run(
    supabase
      .from("settings")
      .update({ minimum_notice: `${hours} hours`, booking_horizon: `${weeks * 7} days` })
      .eq("id", true),
  );
}
