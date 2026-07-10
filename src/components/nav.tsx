"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

function Icon({ name, className }: { name: "dashboard" | "stock" | "vehicles" | "trips"; className?: string }) {
  const common = {
    className,
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    viewBox: "0 0 24 24",
  };
  if (name === "dashboard") {
    return (
      <svg {...common}>
        <rect x="3" y="3" width="7" height="9" rx="1" />
        <rect x="14" y="3" width="7" height="5" rx="1" />
        <rect x="14" y="12" width="7" height="9" rx="1" />
        <rect x="3" y="16" width="7" height="5" rx="1" />
      </svg>
    );
  }
  if (name === "stock") {
    return (
      <svg {...common}>
        <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
        <path d="m3.3 7 8.7 5 8.7-5" />
        <path d="M12 22V12" />
      </svg>
    );
  }
  if (name === "vehicles") {
    return (
      <svg {...common}>
        <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" />
        <path d="M15 18H9" />
        <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.62l-3.48-4.35A1 1 0 0 0 17.52 8H14" />
        <circle cx="17" cy="18" r="2" />
        <circle cx="7" cy="18" r="2" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
      <path d="M12 7v5l4 2" />
    </svg>
  );
}

const LINKS = [
  { href: "/dashboard", label: "Dashboard", icon: "dashboard" as const },
  { href: "/", label: "Stock", icon: "stock" as const },
  { href: "/vehicles", label: "Vehicles", icon: "vehicles" as const },
  { href: "/trips", label: "Trips", icon: "trips" as const },
];

export default function NavLinks({ orientation }: { orientation: "side" | "top" }) {
  const pathname = usePathname();

  return (
    <nav className={orientation === "side" ? "flex flex-col gap-0.5" : "flex gap-1"}>
      {LINKS.map((link) => {
        const active =
          link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);

        if (orientation === "side") {
          return (
            <Link
              key={link.href}
              href={link.href}
              aria-current={active ? "page" : undefined}
              className={
                "group relative flex items-center gap-3 rounded-lg py-2.5 pl-4 pr-3 text-sm transition-all " +
                (active
                  ? "bg-emerald-400/20 font-semibold text-white"
                  : "font-medium text-emerald-50/80 hover:bg-white/10 hover:text-white")
              }
            >
              {/* left accent bar for the active item (best-practice indicator) */}
              <span
                className={
                  "absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-emerald-300 transition-opacity " +
                  (active ? "opacity-100" : "opacity-0")
                }
              />
              <Icon
                name={link.icon}
                className={
                  "h-[18px] w-[18px] shrink-0 transition-colors " +
                  (active ? "text-emerald-200" : "text-emerald-100/60 group-hover:text-white")
                }
              />
              {link.label}
            </Link>
          );
        }

        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className={
              "flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors " +
              (active
                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800")
            }
          >
            <Icon name={link.icon} className="h-[18px] w-[18px] shrink-0" />
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
