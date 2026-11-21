"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/tutor/bookings", label: "Bookings" },
  { href: "/tutor/open-time", label: "Open time" },
];

export function Tabs() {
  const path = usePathname();
  return (
    <nav aria-label="Tutor screens" className="flex gap-8 border-b border-rule">
      {TABS.map(({ href, label }) => {
        const current = path.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={current ? "page" : undefined}
            className={`-mb-px inline-flex min-h-11 items-center border-b-2 font-medium ${
              current ? "border-ink text-ink" : "border-transparent text-ink-soft hover:text-ink"
            }`}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
