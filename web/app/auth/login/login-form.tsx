"use client";

import { useActionState } from "react";
import { login } from "./actions";

export function LoginForm() {
  const [error, action, pending] = useActionState(login, null);

  return (
    <>
      <h1 className="border-b border-ink pb-3 font-serif text-3xl">Tutor login</h1>
      <form action={action} className="mt-8 flex flex-col gap-6">
        <label className="grid gap-1 text-sm font-medium">
          Email
          <input id="email" name="email" type="email" required autoComplete="username" className="field font-normal" />
        </label>
        <label className="grid gap-1 text-sm font-medium">
          Password
          <input id="password" name="password" type="password" required autoComplete="current-password"
            className="field font-normal" />
        </label>
        {error && <p role="alert" className="ink-note text-sm">{error}</p>}
        <button type="submit" className="btn-ink mt-2 w-full" disabled={pending} aria-busy={pending}>
          {pending ? "Logging in…" : "Log in"}
        </button>
      </form>
    </>
  );
}
