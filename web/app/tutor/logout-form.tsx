"use client";

import { useActionState } from "react";
import { logout } from "./actions";

export function LogoutForm() {
  const [error, action] = useActionState(logout, null);
  return (
    <form action={action} className="flex flex-col items-end">
      <button className="text-action whitespace-nowrap">Log out</button>
      {error && <p role="alert" className="ink-note text-sm">{error}</p>}
    </form>
  );
}
