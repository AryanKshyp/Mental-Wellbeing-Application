"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/talkspace", label: "TalkSpace" },
  { href: "/dashboard/buddy", label: "AI Buddy" },
  { href: "/dashboard/journal", label: "Journal" },
];

export function MainNav() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-2 rounded-full bg-white/70 p-1 text-sm shadow-sm backdrop-blur">
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "rounded-full px-4 py-2 font-medium text-muted-foreground transition",
            pathname === item.href && "bg-primary text-primary-foreground",
          )}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}

