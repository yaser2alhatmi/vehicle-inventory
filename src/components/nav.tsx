"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "Stock" },
  { href: "/vehicles", label: "Vehicles" },
  { href: "/trips", label: "Trips" },
];

export default function NavLinks() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-1">
      {LINKS.map((link) => {
        const active =
          link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={
              "rounded-lg px-3.5 py-1.5 text-sm font-medium transition-colors " +
              (active
                ? "bg-blue-50 text-blue-700"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900")
            }
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
