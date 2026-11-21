import type { Metadata } from "next";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Tutor login" };

export default function Page() {
  return (
    <main className="flex min-h-svh w-full justify-center px-6 py-16 sm:items-center sm:py-10">
      <div className="w-full max-w-sm">
        <LoginForm />
      </div>
    </main>
  );
}
