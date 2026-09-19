"use client";

import Link from "next/link";

export default function Tile({ href, icon, label }: { href: string; icon: string; label: string }) {
  return (
    <Link
      href={href}
      className="flex h-24 flex-col items-center justify-center gap-1 rounded-card bg-card text-center shadow-sm ring-1 ring-primary-700/10 active:scale-[0.98]"
    >
      <span className="text-3xl" aria-hidden>
        {icon}
      </span>
      <span className="px-2 text-sm font-semibold leading-tight text-primary-700">{label}</span>
    </Link>
  );
}
