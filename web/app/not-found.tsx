import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Page not found" };

// Same desk and raised paper sheet as the login screen, with one way back.
export default function NotFound() {
  return (
    <main className="flex min-h-svh w-full flex-col pt-12 sm:items-center sm:justify-center sm:px-6 sm:py-12">
      <div className="flex w-full flex-1 flex-col sm:max-w-md sm:flex-none">
        <div className="sheet flex-1 px-6 pb-12 pt-8 sm:flex-none sm:px-12 sm:pb-12 sm:pt-10">
          <h1 className="border-b border-ink pb-3 font-serif text-3xl leading-tight">Page not found</h1>
          <p className="mt-4 text-pretty">This page doesn&rsquo;t exist. The link may be mistyped or out of date.</p>
          <Link href="/" className="btn-ink mt-8 w-full sm:w-auto">
            Go to the booking page
          </Link>
        </div>
      </div>
    </main>
  );
}
